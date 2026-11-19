import { ArrowRight, CalendarDays, Clock3, ExternalLink, MapPin, Pencil } from "lucide-react";
import ConcertImage from "./ConcertImage";
import type { Concert } from "../../types/concert";
import { formatDate, formatTime, isEditable } from "../../types/concert";
import type { LiveApiStatus } from "../../hooks/useLiveConcerts";

type UpcomingConcertsProps = {
  concerts: Concert[];
  onEdit: (concert: Concert) => void;
  onViewAll?: () => void;
  apiStatus?: LiveApiStatus;
};

function ConcertRow({ concert, onEdit }: { concert: Concert; onEdit: (c: Concert) => void }) {
  return (
    <li className="flex items-center gap-4 py-3">
      <ConcertImage concert={concert} className="w-24 h-14 shrink-0 rounded-lg" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900 truncate">{concert.name}</h3>
          {concert.source === "user" && (
            <span className="shrink-0 rounded-full bg-violet-700 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
              Your event
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5" />
            {formatDate(concert.date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock3 className="w-3.5 h-3.5" />
            {formatTime(concert.time)}
          </span>
          <span className="flex items-center gap-1 min-w-0">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{concert.location}</span>
          </span>
        </div>
      </div>

      {concert.expectedAttendance > 0 && (
        <span className="hidden sm:inline-block shrink-0 rounded-md bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
          {concert.expectedAttendance.toLocaleString()} Expected
        </span>
      )}

      {isEditable(concert) ? (
        <button
          type="button"
          onClick={() => onEdit(concert)}
          aria-label={`Edit ${concert.name}`}
          className="shrink-0 rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-violet-700"
        >
          <Pencil className="w-4 h-4" />
        </button>
      ) : concert.url ? (
        <a
          href={concert.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Tickets for ${concert.name} on SeatGeek`}
          className="shrink-0 rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-violet-700"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      ) : null}
    </li>
  );
}

function UpcomingConcerts({ concerts, onEdit, onViewAll, apiStatus }: UpcomingConcertsProps) {
  return (
    <section className="h-full rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Upcoming Concerts</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1 text-sm font-semibold text-violet-700 hover:underline"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {apiStatus === "loading" && (
        <p className="py-2 text-xs text-gray-500">Loading live concerts from SeatGeek…</p>
      )}

      {concerts.length === 0 ? (
        apiStatus !== "loading" && (
          <p className="py-6 text-center text-sm text-gray-500">
            No upcoming concerts yet. Create one to get started.
          </p>
        )
      ) : (
        <ul className="divide-y divide-gray-100">
          {concerts.map((concert) => (
            <ConcertRow key={concert.id} concert={concert} onEdit={onEdit} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default UpcomingConcerts;
