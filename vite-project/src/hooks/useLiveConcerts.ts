import { useEffect, useState } from "react";

// To switch providers, point these imports at another file in src/api/
// that exports the same LIVE_API_KEY + fetchUpcomingConcerts.
import { LIVE_API_KEY, fetchUpcomingConcerts } from "../api/seatgeek";
import type { Concert } from "../types/concert";

export type LiveApiStatus = "no-key" | "loading" | "ready" | "error";

type State = {
  concerts: Concert[];
  status: LiveApiStatus;
  error: string;
};

// Cache for the browser session so switching pages doesn't refetch
let cache: Concert[] | null = null;

const initialState = (): State =>
  !LIVE_API_KEY
    ? { concerts: [], status: "no-key", error: "" }
    : cache
      ? { concerts: cache, status: "ready", error: "" }
      : { concerts: [], status: "loading", error: "" };

export function useLiveConcerts(): State {
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    if (!LIVE_API_KEY || cache) return;

    const controller = new AbortController();

    fetchUpcomingConcerts({ signal: controller.signal })
      .then((concerts) => {
        cache = concerts;
        setState({ concerts, status: "ready", error: "" });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Live concerts error:", err);
        setState({
          concerts: [],
          status: "error",
          error: err instanceof Error ? err.message : "Couldn't load concerts.",
        });
      });

    return () => controller.abort();
  }, []);

  return state;
}
