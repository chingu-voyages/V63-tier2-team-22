import { useEffect, useState } from "react";

import {
  fetchPlaceCity,
  fetchRecentConcerts,
  getCachedCity,
  type RecentConcert,
} from "../api/musicbrainz";
import type { Concert } from "../types/concert";

export type RecentStatus = "waiting" | "loading" | "ready" | "error";

type Result = { key: string; concerts: RecentConcert[]; error: string; loaded: boolean };

// Cache per artist list, so revisiting the page doesn't refetch
const cache = new Map<string, RecentConcert[]>();

const withCity = (c: RecentConcert, city: string): RecentConcert => ({
  ...c,
  location: `${c.location}, ${city}`,
  needsCity: false,
});

// Apply any venue cities we already know
const applyCachedCities = (list: RecentConcert[]) =>
  list.map((c) => {
    const city = c.needsCity && c.placeId ? getCachedCity(c.placeId) : undefined;
    return city ? withCity(c, city) : c;
  });

/**
 * Real concerts from the last 30 days.
 * Pass `artists` (from the Upcoming list) to include their recent shows,
 * or `null` to wait until that list is ready.
 */
export function useRecentConcerts(artists: string[] | null): {
  concerts: Concert[];
  status: RecentStatus;
  error: string;
} {
  const key = artists ? artists.join("|") : "";
  const [result, setResult] = useState<Result>(() => ({
    key,
    concerts: cache.get(key) ?? [],
    error: "",
    loaded: cache.has(key),
  }));

  useEffect(() => {
    if (artists === null) return;
    const controller = new AbortController();
    const { signal } = controller;

    const cached = cache.get(key);
    const load = cached
      ? Promise.resolve(cached)
      : fetchRecentConcerts({ artists, signal }).then((list) => {
          const filled = applyCachedCities(list);
          cache.set(key, filled);
          return filled;
        });

    load
      .then(async (list) => {
        if (signal.aborted) return;
        setResult({ key, concerts: list, error: "", loaded: true });

        // Fill in missing cities one venue at a time (MusicBrainz: 1 req/sec)
        const placeIds = [
          ...new Set(list.filter((c) => c.needsCity && c.placeId).map((c) => c.placeId!)),
        ];
        for (const placeId of placeIds) {
          if (signal.aborted) return;
          const city = await fetchPlaceCity(placeId, signal).catch(() => undefined);
          if (!city || signal.aborted) continue;
          const update = (prev: RecentConcert[]) =>
            prev.map((c) => (c.placeId === placeId && c.needsCity ? withCity(c, city) : c));
          cache.set(key, update(cache.get(key) ?? []));
          setResult((prev) => (prev.key === key ? { ...prev, concerts: update(prev.concerts) } : prev));
        }
      })
      .catch((err: unknown) => {
        if (signal.aborted) return;
        console.error("Recent concerts error:", err);
        setResult({
          key,
          concerts: [],
          error: err instanceof Error ? err.message : "Couldn't load recent concerts.",
          loaded: true,
        });
      });

    return () => controller.abort();
    // `key` captures the artist list's contents
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, artists === null]);

  if (artists === null) return { concerts: [], status: "waiting", error: "" };
  if (result.key !== key || !result.loaded) {
    const cached = cache.get(key);
    return cached
      ? { concerts: cached, status: "ready", error: "" }
      : { concerts: [], status: "loading", error: "" };
  }
  if (result.error) return { concerts: [], status: "error", error: result.error };
  return { concerts: result.concerts, status: "ready", error: "" };
}
