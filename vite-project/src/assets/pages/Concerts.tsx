import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Heart,
  MapPin,
  Pencil,
  Plus,
  Search,
  Star,
  Ticket,
} from "lucide-react";

import ConcertImage from "../components/ConcertImage";
import type { Concert } from "../../types/concert";
import {
  formatDate,
  formatPrice,
  formatTime,
  isEditable,
  sortUpcoming,
  todayISO,
} from "../../types/concert";
import type { LiveApiStatus } from "../../hooks/useLiveConcerts";

type ConcertsProps = {
  concerts: Concert[];
  onCreate: () => void;
  onEdit: (concert: Concert) => void;
  apiStatus: LiveApiStatus;
  apiError: string;
};

type TimeFilter = "upcoming" | "past" | "all";

// "Get Tickets" goes to SeatGeek for real events; it's decorative for the rest
function TicketsLink({
  concert,
  className,
  children,
}: {
  concert: Concert;
  className: string;
  children: React.ReactNode;
}) {
  return concert.url ? (
    <a href={concert.url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <button type="button" className={className}>
      {children}
    </button>
  );
}

function YourEventBadge() {
  return (
    <span className="shrink-0 rounded-full bg-[#7900F9] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
      Your event
    </span>
  );
}

// City is the part after the first comma: "Madison Square Garden, NYC" -> "NYC"
const cityOf = (location: string) =>
  location.split(",").slice(1).join(",").trim() || location;

const selectClass =
  "rounded-xl border border-[#CEC4DD] bg-white px-4 py-3 text-sm text-[#35254E] outline-none focus:border-[#7900F9]";

function DateLine({ concert, small }: { concert: Concert; small?: boolean }) {
  const iconSize = small ? 14 : 18;
  return (
    <>
      <p className={`flex items-center gap-2 text-[#81768F] ${small ? "text-xs" : "text-sm"}`}>
        <CalendarDays size={iconSize} className="shrink-0 text-[#7900F9]" />
        {formatDate(concert.date)} • {formatTime(concert.time)}
      </p>
      <p className={`mt-1 flex items-center gap-2 text-[#81768F] ${small ? "text-xs" : "text-sm"}`}>
        <MapPin size={iconSize} className="shrink-0 text-[#7900F9]" />
        <span className="truncate">{concert.location}</span>
      </p>
    </>
  );
}

function FavoriteButton({
  active,
  onToggle,
  name,
  className = "",
}: {
  active: boolean;
  onToggle: () => void;
  name: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={`${active ? "Remove" : "Add"} ${name} ${active ? "from" : "to"} favorites`}
      className={`rounded-full p-1.5 transition-colors ${className}`}
    >
      <Heart size={20} className={active ? "fill-current" : ""} />
    </button>
  );
}

function Concerts({ concerts, onCreate, onEdit, apiStatus, apiError }: ConcertsProps) {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("upcoming");
  const [locationFilter, setLocationFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [favorites, setFavorites] = useState<Set<Concert["id"]>>(new Set());

  const toggleFavorite = (id: Concert["id"]) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const locations = useMemo(
    () => [...new Set(concerts.map((c) => cityOf(c.location)))].sort(),
    [concerts],
  );

  const genres = useMemo(
    () =>
      [...new Set(concerts.map((c) => c.genre).filter((g): g is string => !!g))].sort(),
    [concerts],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const today = todayISO();

    const matches = concerts.filter((c) => {
      const matchesSearch =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.location.toLowerCase().includes(query) ||
        (c.genre ?? "").toLowerCase().includes(query);

      const matchesTime =
        timeFilter === "all" ||
        (timeFilter === "upcoming" && c.date >= today) ||
        (timeFilter === "past" && c.date < today);

      const matchesLocation =
        locationFilter === "all" || cityOf(c.location) === locationFilter;

      const matchesGenre = genreFilter === "all" || c.genre === genreFilter;

      return matchesSearch && matchesTime && matchesLocation && matchesGenre;
    });

    // Past: most recent first. Otherwise: your events on top, then by date.
    return timeFilter === "past"
      ? matches.sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
      : sortUpcoming(matches);
  }, [concerts, search, timeFilter, locationFilter, genreFilter]);

  const [featured, ...rest] = filtered;
  const listTitle =
    timeFilter === "past" ? "Past Concerts" : timeFilter === "all" ? "All Concerts" : "Upcoming Concerts";

  return (
    <div className="min-h-full bg-[#FAF8FF] px-4 py-7 md:px-7">
      <div className="mx-auto max-w-[1450px]">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#26153B]">Concerts</h1>
          <p className="mt-1 text-sm text-[#81768F]">
            Live events from SeatGeek, plus the concerts you create.
          </p>
        </div>

        {/* Live API status */}
        {apiStatus === "loading" && (
          <p className="mb-6 rounded-lg bg-purple-100 p-3 text-sm text-purple-800">
            Loading live concerts from SeatGeek…
          </p>
        )}
        {apiStatus === "no-key" && (
          <p className="mb-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Showing sample concerts. Add <code>VITE_SEATGEEK_CLIENT_ID</code> to{" "}
            <code>.env.local</code> to load real events.
          </p>
        )}
        {apiStatus === "error" && (
          <p role="alert" className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            Couldn't load live concerts ({apiError}). Showing sample concerts instead.
          </p>
        )}

        {/* Search + filters */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7900F9]"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, venue, or genre..."
              aria-label="Search concerts"
              className="w-full rounded-full border border-[#E5DDF2] bg-white py-3 pl-12 pr-4 text-sm text-[#35254E] outline-none focus:border-[#7900F9]"
            />
          </div>

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            aria-label="Filter by date"
            className={selectClass}
          >
            <option value="upcoming">Upcoming Events</option>
            <option value="past">Past Events</option>
            <option value="all">All Events</option>
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            aria-label="Filter by location"
            className={selectClass}
          >
            <option value="all">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            aria-label="Filter by genre"
            className={selectClass}
          >
            <option value="all">All Genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onCreate}
            className="flex items-center gap-2 rounded-xl bg-[#7900F9] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#6500D1]"
          >
            <Plus size={18} />
            Create Event
          </button>
        </div>

        {!featured ? (
          <div className="rounded-xl border border-[#EEE5FA] bg-white px-6 py-14 text-center">
            <CalendarDays size={35} className="mx-auto mb-3 text-[#A777E8]" />
            <h3 className="font-semibold text-[#35254E]">No concerts found</h3>
            <p className="mt-2 text-sm text-[#92869F]">
              {concerts.length === 0
                ? "Create your first event to get started."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Left column: featured + my tickets */}
            <div className="flex flex-col gap-6">
              {/* Featured concert */}
              <article className="overflow-hidden rounded-2xl border border-[#EEE5FA] bg-white p-2 shadow-sm">
                <div className="relative">
                  <ConcertImage concert={featured} className="h-56 w-full rounded-xl" />
                  <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-[#7900F9]">
                    <Star size={14} />
                    {featured.source === "user" ? "Your event" : "Featured"}
                  </span>
                  <FavoriteButton
                    active={favorites.has(featured.id)}
                    onToggle={() => toggleFavorite(featured.id)}
                    name={featured.name}
                    className="absolute right-3 top-3 text-white hover:bg-white/20"
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-bold text-[#392A55]">{featured.name}</h2>
                    {isEditable(featured) && (
                      <button
                        type="button"
                        onClick={() => onEdit(featured)}
                        aria-label={`Edit ${featured.name}`}
                        className="shrink-0 rounded-lg p-2 text-[#7900F9] hover:bg-[#EEE2FF]"
                      >
                        <Pencil size={17} />
                      </button>
                    )}
                  </div>

                  <div className="mt-2">
                    <DateLine concert={featured} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {[featured.genre, "Live Music", cityOf(featured.location)]
                      .filter(Boolean)
                      .map((tag, i) => (
                        <span
                          key={tag}
                          className={`rounded-full bg-[#EEDCFF] px-3 py-1 text-xs text-[#7020DA] ${
                            i === 0 ? "font-semibold" : ""
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                  </div>

                  {featured.description && (
                    <p className="mt-3 text-sm leading-6 text-[#81768F]">{featured.description}</p>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-[#81768F]">
                      {(featured.ticketPrice ?? 0) > 0 && "From "}
                      <span className="text-lg font-bold text-[#392A55]">
                        {formatPrice(featured.ticketPrice)}
                      </span>
                    </p>
                    <TicketsLink
                      concert={featured}
                      className="flex items-center gap-2 rounded-xl bg-[#7900F9] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#6500D1]"
                    >
                      <Ticket size={18} />
                      Get Tickets
                      <ArrowRight size={16} />
                    </TicketsLink>
                  </div>
                </div>
              </article>

              {/* My tickets */}
              <section className="rounded-2xl border border-[#EEE5FA] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-[#392A55]">
                    <Ticket size={22} className="text-[#7900F9]" />
                    My Tickets
                  </h2>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm text-[#7900F9] hover:underline"
                  >
                    View All
                    <ArrowRight size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <ConcertImage concert={featured} alt="" className="h-20 w-20 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[#392A55]">{featured.name}</h3>
                    <div className="mt-1">
                      <DateLine concert={featured} small />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="flex shrink-0 items-center gap-2 rounded-full bg-[#7900F9] px-5 py-2.5 text-sm text-white hover:bg-[#6500D1]"
                  >
                    View Ticket
                    <ArrowRight size={16} />
                  </button>
                </div>
              </section>
            </div>

            {/* Right column: concert list */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-[#392A55]">
                  <ChartNoAxesColumnIncreasing size={24} className="text-[#7900F9]" />
                  {listTitle}
                </h2>
                <span className="text-sm text-[#9A90A9]">
                  {filtered.length} {filtered.length === 1 ? "event" : "events"}
                </span>
              </div>

              {rest.length === 0 ? (
                <p className="rounded-xl border border-[#EEE5FA] bg-white px-6 py-10 text-center text-sm text-[#92869F]">
                  No other concerts match your filters.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {rest.map((concert) => (
                    <li
                      key={concert.id}
                      className="flex flex-wrap items-center gap-4 rounded-xl border border-[#EEE5FA] bg-white p-3 shadow-sm sm:flex-nowrap"
                    >
                      <ConcertImage concert={concert} className="h-20 w-32 shrink-0 rounded-lg" />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-semibold text-[#392A55]">{concert.name}</h3>
                          {concert.source === "user" && <YourEventBadge />}
                        </div>
                        <div className="mt-1">
                          <DateLine concert={concert} small />
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          {concert.genre && (
                            <span className="rounded-full bg-[#EEDCFF] px-3 py-1 text-xs text-[#7020DA]">
                              {concert.genre}
                            </span>
                          )}
                          {isEditable(concert) && (
                            <button
                              type="button"
                              onClick={() => onEdit(concert)}
                              aria-label={`Edit ${concert.name}`}
                              className="rounded-lg p-1.5 text-[#7900F9] hover:bg-[#EEE2FF]"
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                          <FavoriteButton
                            active={favorites.has(concert.id)}
                            onToggle={() => toggleFavorite(concert.id)}
                            name={concert.name}
                            className="text-[#7900F9] hover:bg-[#EEE2FF]"
                          />
                        </div>
                        <TicketsLink
                          concert={concert}
                          className="flex items-center gap-1 rounded-full border border-[#D9C2FF] px-4 py-1.5 text-xs text-[#7900F9] hover:bg-[#F5EDFF]"
                        >
                          Get Tickets · {formatPrice(concert.ticketPrice)}
                          <ArrowRight size={14} />
                        </TicketsLink>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default Concerts;
