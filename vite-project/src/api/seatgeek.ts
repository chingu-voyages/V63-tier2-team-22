// SeatGeek Platform API client
// Docs: https://platform.seatgeek.com
//
// Needs VITE_SEATGEEK_CLIENT_ID in vite-project/.env.local (gitignored).
// Optional: VITE_SEATGEEK_CITY to limit results to one city (e.g. "New York").
// Only the client_id is used. Never put the client secret in frontend code.

import type { Concert } from "../types/concert";

const BASE_URL = "https://api.seatgeek.com/2/events";

export const LIVE_API_KEY: string | undefined =
  import.meta.env.VITE_SEATGEEK_CLIENT_ID || undefined;

const DEFAULT_CITY: string | undefined =
  import.meta.env.VITE_SEATGEEK_CITY || undefined;

// --- Response shapes (only the fields we use) ---

type SGGenre = { name: string; primary?: boolean };

type SGPerformer = {
  name: string;
  image?: string | null;
  images?: Record<string, string> | null;
  genres?: SGGenre[];
};

type SGEvent = {
  id: number;
  title: string;
  url?: string;
  description?: string;
  datetime_local: string; // "2026-11-21T20:30:00"
  date_tbd?: boolean;
  time_tbd?: boolean;
  stats?: { lowest_price?: number | null };
  venue?: { name?: string; display_location?: string };
  performers?: SGPerformer[];
};

type SGResponse = { events?: SGEvent[] };

// --- Mapping to our Concert type ---

function toConcert(e: SGEvent): Concert | null {
  if (e.date_tbd || !e.datetime_local) return null;

  const performer = e.performers?.[0];
  const genres = performer?.genres ?? [];
  const genre = (genres.find((g) => g.primary) ?? genres[0])?.name;
  const image =
    performer?.image ?? performer?.images?.huge ?? performer?.images?.large ?? undefined;
  const place = [e.venue?.name, e.venue?.display_location].filter(Boolean).join(", ");
  const price = e.stats?.lowest_price;

  return {
    id: `sg-${e.id}`,
    source: "live",
    name: e.title,
    date: e.datetime_local.slice(0, 10),
    time: e.time_tbd ? "" : e.datetime_local.slice(11, 16),
    location: place || "Venue TBA",
    description: e.description ?? "",
    expectedAttendance: 0,
    ticketPrice: price ?? undefined,
    image,
    artist: performer?.name,
    genre,
    url: e.url,
  };
}

// Skip non-concert listings that sometimes show up as events
const JUNK = /\b(parking|shuttle|locker|upgrade)\b/i;

// --- Public API ---

export type FetchConcertsOptions = {
  city?: string;
  keyword?: string;
  size?: number; // per_page
  signal?: AbortSignal;
};

export async function fetchUpcomingConcerts({
  city = DEFAULT_CITY,
  keyword,
  size = 60,
  signal,
}: FetchConcertsOptions = {}): Promise<Concert[]> {
  if (!LIVE_API_KEY) throw new Error("Missing VITE_SEATGEEK_CLIENT_ID");

  // Only future events; SeatGeek wants UTC without milliseconds or "Z"
  const now = new Date().toISOString().slice(0, 19);

  const params = new URLSearchParams({
    client_id: LIVE_API_KEY,
    "taxonomies.name": "concert",
    "datetime_utc.gte": now,
    sort: "score.desc", // most popular first; pages re-sort by date
    per_page: String(size),
  });
  if (city) params.set("venue.city", city);
  if (keyword) params.set("q", keyword);

  const res = await fetch(`${BASE_URL}?${params}`, { signal });

  if (res.status === 401 || res.status === 403)
    throw new Error("SeatGeek rejected the client ID.");
  if (res.status === 429) throw new Error("SeatGeek rate limit reached. Try again later.");
  if (!res.ok) throw new Error(`SeatGeek request failed (${res.status}).`);

  const data: SGResponse = await res.json();

  return (data.events ?? [])
    .filter((e) => !JUNK.test(e.title))
    .map(toConcert)
    .filter((c): c is Concert => c !== null);
}
