import { useMemo, useState } from "react";
import {
  Building2,
  ExternalLink,
  History,
  MapPin,
  Mic2,
  Music,
  Pencil,
  Search,
  Sparkles,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ConcertImage from "../components/ConcertImage";
import type { Concert } from "../../types/concert";
import { formatDate, formatPrice, formatTime, todayISO } from "../../types/concert";
import type { RecentStatus } from "../../hooks/useRecentConcerts";

type EventHistoryProps = {
  recent: Concert[]; // real concerts from MusicBrainz
  owned: Concert[]; // concerts the user created (any date)
  upcomingArtists: string[]; // artists on the Upcoming list
  status: RecentStatus;
  error: string;
  onEdit: (concert: Concert) => void;
};

type Window = 7 | 14 | 30;
type Show = "all" | "upcoming-artists" | "mine";

const PURPLE = "#7900F9";
const DAY_MS = 86_400_000;

const daysAgo = (date: string) =>
  Math.round(
    (new Date(`${todayISO()}T00:00`).getTime() - new Date(`${date}T00:00`).getTime()) / DAY_MS,
  );

const groupLabel = (days: number) =>
  days <= 7 ? "This past week" : days <= 14 ? "Last week" : "Earlier this month";

const cityOf = (location: string) => location.split(", ").slice(1).join(", ");

const turnoutOf = (c: Concert) =>
  c.actualAttendance == null || c.expectedAttendance <= 0
    ? null
    : Math.round((c.actualAttendance / c.expectedAttendance) * 100);

function EventHistory({ recent, owned, upcomingArtists, status, error, onEdit }: EventHistoryProps) {
  const [search, setSearch] = useState("");
  const [windowDays, setWindowDays] = useState<Window>(30);
  const [show, setShow] = useState<Show>("all");

  const upcomingSet = useMemo(
    () => new Set(upcomingArtists.map((a) => a.toLowerCase())),
    [upcomingArtists],
  );
  const isUpcomingArtist = (c: Concert) =>
    !!c.artist && upcomingSet.has(c.artist.toLowerCase());

  // The user's own past events + real recent concerts
  const all = useMemo(() => {
    const today = todayISO();
    const minePast = owned.filter((c) => c.date < today);
    return [...minePast, ...recent];
  }, [owned, recent]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return all
      .filter((c) => {
        if (daysAgo(c.date) > windowDays) return false;
        if (show === "mine" && c.source !== "user") return false;
        if (show === "upcoming-artists" && !isUpcomingArtist(c)) return false;
        if (!query) return true;
        return [c.name, c.artist, c.location, c.description]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(query));
      })
      .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
    // isUpcomingArtist only depends on upcomingSet
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, search, windowDays, show, upcomingSet]);

  // Stats for the current filters
  const artists = new Set(filtered.map((c) => c.artist ?? c.name));
  const venues = new Set(filtered.map((c) => c.location.split(", ")[0]));
  const cities = new Set(filtered.map((c) => cityOf(c.location)).filter(Boolean));

  const stats = [
    { label: "Concerts", value: filtered.length, icon: Music },
    { label: "Artists", value: artists.size, icon: Mic2 },
    { label: "Venues", value: venues.size, icon: Building2 },
    { label: "Cities", value: cities.size, icon: MapPin },
  ];

  // Chart: artists with the most shows in the window
  const topArtists = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of filtered) {
      if (c.artist) counts.set(c.artist, (counts.get(c.artist) ?? 0) + 1);
    }
    return [...counts]
      .map(([artist, shows]) => ({ artist, shows }))
      .filter((d) => d.shows > 1)
      .sort((a, b) => b.shows - a.shows)
      .slice(0, 6);
  }, [filtered]);

  const groups = useMemo(() => {
    const map = new Map<string, Concert[]>();
    for (const c of filtered) {
      const label = groupLabel(daysAgo(c.date));
      map.set(label, [...(map.get(label) ?? []), c]);
    }
    return [...map].map(([label, items]) => ({ label, items }));
  }, [filtered]);

  const selectClass =
    "rounded-xl border border-[#CEC4DD] bg-white px-4 py-3 text-sm text-[#35254E] outline-none focus:border-[#7900F9]";

  return (
    <div className="min-h-full bg-[#FAF8FF] px-4 py-7 md:px-7">
      <div className="mx-auto max-w-[1450px]">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#26153B]">Event History</h1>
          <p className="mt-1 text-sm text-[#81768F]">
            Real concerts from the last 30 days, plus your own past events.
          </p>
        </div>

        {(status === "loading" || status === "waiting") && (
          <p className="mb-6 rounded-lg bg-purple-100 p-3 text-sm text-purple-800">
            Loading recent concerts from MusicBrainz…
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            Couldn't load recent concerts ({error}).
          </p>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex min-h-[96px] items-center gap-3 rounded-xl border border-[#EDE5F8] bg-white px-4 py-5 shadow-sm"
            >
              <div className="rounded-full bg-[#F1E6FF] p-3 text-[#7900F9]">
                <Icon size={23} />
              </div>
              <div>
                <p className="text-xs text-[#9589A8]">{label}</p>
                <p className="mt-1 text-xl font-bold text-[#392A55]">{value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        {topArtists.length > 0 && (
          <section className="mb-8 rounded-xl border border-[#EDE5F8] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#392A55]">Busiest Artists</h2>
            <p className="text-xs text-[#81768F]">Shows played in the selected period</p>
            <div className="mt-4" style={{ height: 44 * topArtists.length + 20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topArtists}
                  layout="vertical"
                  margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} stroke="#F3EEFA" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#81768F" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="artist"
                    width={140}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#392A55" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#F5EDFF" }}
                    formatter={(value) => [value, "Shows"]}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="shows" fill={PURPLE} radius={[0, 4, 4, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Search + filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7900F9]"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by artist, venue, or city..."
              aria-label="Search past events"
              className="w-full rounded-full border border-[#E5DDF2] bg-white py-3 pl-12 pr-4 text-sm text-[#35254E] outline-none focus:border-[#7900F9]"
            />
          </div>
          <select
            value={windowDays}
            onChange={(e) => setWindowDays(Number(e.target.value) as Window)}
            aria-label="Time period"
            className={selectClass}
          >
            <option value={7}>Past 7 days</option>
            <option value={14}>Past 2 weeks</option>
            <option value={30}>Past 30 days</option>
          </select>
          <select
            value={show}
            onChange={(e) => setShow(e.target.value as Show)}
            aria-label="Which events"
            className={selectClass}
          >
            <option value="all">All concerts</option>
            <option value="upcoming-artists">Artists on your upcoming list</option>
            <option value="mine">Your events</option>
          </select>
        </div>

        {/* Timeline */}
        {filtered.length === 0 ? (
          status === "ready" || status === "error" ? (
            <div className="rounded-xl border border-[#EEE5FA] bg-white px-6 py-14 text-center">
              <History size={35} className="mx-auto mb-3 text-[#A777E8]" />
              <h3 className="font-semibold text-[#35254E]">No past events found</h3>
              <p className="mt-2 text-sm text-[#92869F]">Try adjusting your search or filters.</p>
            </div>
          ) : null
        ) : (
          <div className="flex flex-col gap-8">
            {groups.map((group) => (
              <section key={group.label}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#7650A9]">
                  {group.label}
                </h2>

                <ol className="relative flex flex-col gap-4 border-l-2 border-[#E5D6FA] pl-6">
                  {group.items.map((c) => {
                    const d = new Date(`${c.date}T00:00`);
                    const mine = c.source === "user";
                    const turnout = turnoutOf(c);
                    return (
                      <li key={c.id} className="relative">
                        <span
                          aria-hidden="true"
                          className="absolute -left-[31px] top-6 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#7900F9] shadow"
                        />

                        <article className="flex flex-col gap-4 rounded-xl border border-[#EEE5FA] bg-white p-4 shadow-sm md:flex-row md:items-center">
                          {/* Photo + date stamp */}
                          <div className="relative shrink-0">
                            <ConcertImage concert={c} className="h-24 w-full rounded-lg md:w-36" />
                            <div className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-1 text-center leading-none shadow-sm">
                              <p className="text-[10px] font-semibold uppercase text-[#7900F9]">
                                {d.toLocaleDateString("en-US", { month: "short" })}
                              </p>
                              <p className="text-base font-bold text-[#26153B]">{d.getDate()}</p>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-[#392A55]">{c.name}</h3>
                              {mine && (
                                <span className="rounded-full bg-[#7900F9] px-2.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                                  Your event
                                </span>
                              )}
                              {!mine && isUpcomingArtist(c) && (
                                <span className="flex items-center gap-1 rounded-full bg-[#EEDCFF] px-2.5 py-0.5 text-[11px] text-[#7020DA]">
                                  <Sparkles size={11} />
                                  Playing again soon
                                </span>
                              )}
                            </div>
                            {!mine && c.description && (
                              <p className="mt-0.5 text-xs text-[#9A90A9]">{c.description}</p>
                            )}
                            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-[#81768F]">
                              <MapPin size={13} className="shrink-0 text-[#7900F9]" />
                              <span>{c.location}</span>
                              <span className="text-[#C9BFD6]">•</span>
                              <span>
                                {formatDate(c.date)}
                                {c.time && ` • ${formatTime(c.time)}`}
                              </span>
                            </p>

                            {/* Attendance — only known for the user's own events */}
                            {mine && (
                              <div className="mt-3 max-w-md">
                                <div className="mb-1 flex justify-between text-xs text-[#81768F]">
                                  <span>
                                    {c.actualAttendance != null
                                      ? `${c.actualAttendance.toLocaleString()} / ${c.expectedAttendance.toLocaleString()} attended`
                                      : `${c.expectedAttendance.toLocaleString()} expected · attendance not recorded`}
                                  </span>
                                  {turnout != null && (
                                    <span className="font-semibold text-[#392A55]">{turnout}%</span>
                                  )}
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-[#F1E6FF]">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#9B4DFF] to-[#7900F9]"
                                    style={{ width: `${Math.min(turnout ?? 0, 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex shrink-0 items-center gap-3 md:flex-col md:items-end">
                            {mine ? (
                              <>
                                <span className="text-xs text-[#9A90A9]">
                                  {formatPrice(c.ticketPrice)}/ticket
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onEdit(c)}
                                  aria-label={`Edit ${c.name}`}
                                  className="rounded-lg p-2 text-[#7900F9] hover:bg-[#EEE2FF]"
                                >
                                  <Pencil size={16} />
                                </button>
                              </>
                            ) : (
                              c.url && (
                                <a
                                  href={c.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 rounded-full border border-[#D9C2FF] px-4 py-1.5 text-xs text-[#7900F9] hover:bg-[#F5EDFF]"
                                >
                                  Event details
                                  <ExternalLink size={13} />
                                </a>
                              )
                            )}
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-[#A89DB8]">
          Concert history from MusicBrainz, a community-maintained music database. Coverage
          varies by artist and region.
        </p>
      </div>
    </div>
  );
}

export default EventHistory;
