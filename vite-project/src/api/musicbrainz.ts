// Recent real-world concerts from MusicBrainz (https://musicbrainz.org/doc/MusicBrainz_API)
//
// Free, no key, and allows browser requests. It's community-maintained, so
// coverage is uneven (lots of European club shows, some big US tours).
// Rate limit: about 1 request per second, so all calls go through one queue.

import type { Concert } from "../types/concert";

const BASE = "https://musicbrainz.org/ws/2";
const GAP_MS = 1100;
const CITY_CACHE_KEY = "vibetrack:place-cities:v1";

// --- Request queue (1 req/sec) with one retry on 503 "slow down" ---

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task);
  queue = run
    .catch(() => undefined)
    .then(() => new Promise((r) => setTimeout(r, GAP_MS)));
  return run;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 503 = "slow down" — back off (2s, 4s, 8s) and try again
async function getJson<T>(path: string, signal?: AbortSignal, attempt = 0): Promise<T> {
  const res = await enqueue(() => fetch(`${BASE}${path}`, { signal }));
  if (res.status === 503 && attempt < 3) {
    await wait(2000 * 2 ** attempt);
    return getJson<T>(path, signal, attempt + 1);
  }
  if (!res.ok) throw new Error(`MusicBrainz request failed (${res.status}).`);
  return res.json() as Promise<T>;
}

// --- Response shapes (only what we use) ---

type MBRelation = {
  type: string; // "main performer", "support act", "held at", "held in", ...
  artist?: { name: string };
  place?: { id: string; name: string };
  area?: { name: string };
};

type MBEvent = {
  id: string;
  name: string;
  type?: string;
  time?: string; // "20:00:00"
  cancelled?: boolean;
  "life-span"?: { begin?: string };
  relations?: MBRelation[];
};

type MBSearch = { events?: MBEvent[] };

/** A recent concert, plus the venue id so its city can be filled in later. */
export type RecentConcert = Concert & { placeId?: string; needsCity: boolean };

// --- Mapping ---

function toConcert(e: MBEvent): RecentConcert | null {
  const date = e["life-span"]?.begin;
  if (!date || date.length !== 10 || e.cancelled) return null;

  const rels = e.relations ?? [];
  const performers = rels.filter((r) => r.artist);
  const main =
    performers.find((r) => r.type === "main performer" || r.type === "headliner") ??
    performers.find((r) => r.type !== "support act");
  const artist = main?.artist?.name;
  const support = performers
    .filter((r) => r !== main && r.type === "support act")
    .map((r) => r.artist!.name);

  const place = rels.find((r) => r.place)?.place;
  // City: from a "held in" area, or from tour names like "The Unraveled Tour: Toronto"
  const tourCity = e.name.includes(": ") ? e.name.split(": ").pop() : undefined;
  const city = rels.find((r) => r.area)?.area?.name ?? tourCity;

  // Title: "Barry Manilow at Westgate" -> "Barry Manilow";
  //        "The Unraveled Tour: Toronto" -> "Olivia Rodrigo: The Unraveled Tour"
  let title = e.name;
  if (/ at /i.test(title)) title = artist ?? title.split(/ at /i)[0];
  else {
    const tour = title.split(": ")[0];
    title =
      artist && !tour.toLowerCase().includes(artist.toLowerCase())
        ? `${artist}: ${tour}`
        : tour;
  }

  return {
    id: `mb-${e.id}`,
    source: "live",
    name: title,
    date,
    time: e.time?.slice(0, 5) ?? "",
    location: [place?.name, city].filter(Boolean).join(", ") || "Venue unknown",
    description: support.length ? `with ${support.join(", ")}` : "",
    expectedAttendance: 0,
    artist,
    url: `https://musicbrainz.org/event/${e.id}`,
    placeId: place?.id,
    needsCity: !city && !!place?.id,
  };
}

// --- Public API ---

const pad = (n: number) => String(n).padStart(2, "0");
const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Lucene needs quotes/backslashes escaped inside "..."
const quote = (s: string) => `"${s.replace(/["\\]/g, "\\$&")}"`;

export async function fetchRecentConcerts({
  days = 30,
  artists = [],
  signal,
}: {
  days?: number;
  artists?: string[];
  signal?: AbortSignal;
} = {}): Promise<RecentConcert[]> {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - days);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const base = `type:Concert AND begin:[${isoDate(from)} TO ${isoDate(yesterday)}]`;
  const search = (query: string) =>
    getJson<MBSearch>(
      `/event?fmt=json&limit=100&query=${encodeURIComponent(query)}`,
      signal,
    ).then((r) => r.events ?? []);

  // 1) Recent shows by artists the user already sees on the Upcoming list
  const known = artists.slice(0, 25);
  // (optional extra — if it fails, still show the general list)
  const byArtist = known.length
    ? await search(
        `${base} AND (${known.map((a) => `artist:${quote(a)}`).join(" OR ")})`,
      ).catch((err: unknown) => {
        if (signal?.aborted) throw err;
        console.warn("Artist history search failed:", err);
        return [];
      })
    : [];
  // 2) Recent concerts in general
  const general = await search(base);

  // Same artist at the same venue (multi-night runs/residencies) -> keep the latest night
  const seen = new Map<string, RecentConcert>();
  for (const e of [...byArtist, ...general]) {
    const c = toConcert(e);
    if (!c) continue;
    const key = `${c.artist ?? c.name}|${c.placeId ?? c.location}`.toLowerCase();
    const prev = seen.get(key);
    if (!prev || c.date > prev.date) seen.set(key, c);
  }

  return [...seen.values()].sort((a, b) =>
    `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`),
  );
}

// --- Venue -> city lookups (cached in localStorage) ---

type CityCache = Record<string, string | null>;

function loadCities(): CityCache {
  try {
    return JSON.parse(localStorage.getItem(CITY_CACHE_KEY) ?? "{}") as CityCache;
  } catch {
    return {};
  }
}

const cities: CityCache = loadCities();

export function getCachedCity(placeId: string): string | null | undefined {
  return cities[placeId];
}

export async function fetchPlaceCity(placeId: string, signal?: AbortSignal) {
  if (placeId in cities) return cities[placeId] ?? undefined;
  const place = await getJson<{ area?: { name?: string } }>(
    `/place/${placeId}?fmt=json`,
    signal,
  );
  cities[placeId] = place.area?.name ?? null;
  try {
    localStorage.setItem(CITY_CACHE_KEY, JSON.stringify(cities));
  } catch {
    // storage blocked — the in-memory cache still works
  }
  return cities[placeId] ?? undefined;
}
