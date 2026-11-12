import { ArrowRight, CalendarDays, Clock3, MapPin, Pencil } from "lucide-react";
import concertBanner from "../images/concert-banner.png";
import type { Concert } from "../../types/concert";
import { formatDate, formatTime } from "../../types/concert";

type UpcomingConcertsProps = {
  concerts: Concert[];
  onEdit: (concert: Concert) => void;
};

function ConcertRow({ concert, onEdit }: { concert: Concert; onEdit: (c: Concert) => void }) {
  return (
    <li className="flex items-center gap-4 py-3">
      <img
        src={concert.image ?? concertBanner}
        alt={concert.name}
        className="w-24 h-14 shrink-0 rounded-lg object-cover"
      />

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 truncate">{concert.name}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5" />
            {formatDate(concert.date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock3 className="w-3.5 h-3.5" />
            {formatTime(concert.time)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {concert.location}
          </span>
        </div>
      </div>

      <span className="hidden sm:inline-block shrink-0 rounded-md bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
        {concert.expectedAttendance.toLocaleString()} Expected
      </span>

      <button
        type="button"
        onClick={() => onEdit(concert)}
        aria-label={`Edit ${concert.name}`}
        className="shrink-0 rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-violet-700"
      >
        <Pencil className="w-4 h-4" />
      </button>
    </li>
  );
}

function UpcomingConcerts({ concerts, onEdit }: UpcomingConcertsProps) {
  return (
    <section className="h-full rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Upcoming Concerts</h2>
        <a
          href="#"
          className="flex items-center gap-1 text-sm font-semibold text-violet-700 hover:underline"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {concerts.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">
          No upcoming concerts yet. Create one to get started.
        </p>
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