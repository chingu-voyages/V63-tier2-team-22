// Artist photos from Deezer's public API (no key needed).
//
// Deezer doesn't send CORS headers, so a normal fetch() from the browser is
// blocked. It does support JSONP (the response calls a global function we
// define), which works from any page. Results are cached in memory and in
// localStorage so each artist is only looked up once per browser.

const CACHE_KEY = "vibetrack:artist-images:v2"; // bump to discard old lookups
const TIMEOUT_MS = 8000;
const GAP_MS = 150; // Deezer allows ~50 requests / 5s; stay well under it

type Cache = Record<string, string | null>; // null = looked up, no photo

function loadCache(): Cache {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}") as Cache;
  } catch {
    return {};
  }
}

const cache: Cache = loadCache();
const pending = new Map<string, Promise<string | undefined>>();

function saveCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // storage full or blocked — the in-memory cache still works
  }
}

const keyOf = (artist: string) => artist.trim().toLowerCase();

/** Synchronous cache read: string = photo, null = none, undefined = unknown */
export function getCachedArtistImage(artist: string): string | null | undefined {
  return cache[keyOf(artist)];
}

// --- JSONP ---

type DeezerArtist = {
  name: string;
  nb_fan?: number;
  picture_xl?: string;
  picture_big?: string;
};
type DeezerSearch = { data?: DeezerArtist[] };

let callbackId = 0;

function jsonp<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const name = `__vibetrackJsonp${++callbackId}`;
    const script = document.createElement("script");
    const w = window as unknown as Record<string, unknown>;

    const cleanup = () => {
      clearTimeout(timer);
      delete w[name];
      script.remove();
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Deezer request timed out"));
    }, TIMEOUT_MS);

    w[name] = (data: T) => {
      cleanup();
      resolve(data);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("Deezer request failed"));
    };
    script.src = `${url}&output=jsonp&callback=${name}`;
    document.head.appendChild(script);
  });
}

// --- Simple queue so we don't fire 60 requests at once ---

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task);
  queue = run
    .catch(() => undefined)
    .then(() => new Promise((r) => setTimeout(r, GAP_MS)));
  return run;
}

// Deezer returns ".../images/artist//..." when an artist has no photo
const isRealPhoto = (url?: string) => !!url && !url.includes("/artist//");

// "Jhené Aiko" -> "jhene aiko", so accents/case don't block a match
const fold = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

// Only accept an exact name match (avoids "CMA Fest" -> some random artist).
// Several artists can share a name; the one with the most fans is the famous one.
function bestPhoto(name: string, results: DeezerArtist[] = []): string | undefined {
  const target = fold(name);
  const match = results
    .filter((a) => fold(a.name) === target && isRealPhoto(a.picture_xl ?? a.picture_big))
    .sort((a, b) => (b.nb_fan ?? 0) - (a.nb_fan ?? 0))[0];
  return match ? (match.picture_xl ?? match.picture_big) : undefined;
}

function searchDeezer(name: string): Promise<string | undefined> {
  return enqueue(() =>
    jsonp<DeezerSearch>(
      `https://api.deezer.com/search/artist?q=${encodeURIComponent(name)}&limit=10`,
    ),
  ).then((res) => bestPhoto(name, res.data));
}

// "USHER & Chris Brown", "Ty Myers with Brent Cobb" -> first billed artist
const firstBilled = (name: string) =>
  name.split(/\s+(?:&|and|with|x|feat\.?|featuring)\s+|,\s*/i)[0].trim();

/** Look up a photo for an artist. Resolves undefined if none is found. */
export function fetchArtistImage(artist: string): Promise<string | undefined> {
  const key = keyOf(artist);
  if (!key) return Promise.resolve(undefined);
  if (key in cache) return Promise.resolve(cache[key] ?? undefined);

  const existing = pending.get(key);
  if (existing) return existing;

  const headliner = firstBilled(artist);

  const request = searchDeezer(artist)
    .then((url) =>
      url || !headliner || fold(headliner) === fold(artist) ? url : searchDeezer(headliner),
    )
    .then((url) => {
      cache[key] = url ?? null;
      saveCache();
      return url;
    })
    .catch((err: unknown) => {
      console.warn(`No artist photo for "${artist}":`, err);
      return undefined; // don't cache failures; try again next visit
    })
    .finally(() => pending.delete(key));

  pending.set(key, request);
  return request;
}
