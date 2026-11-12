
import { Plus, CalendarDays } from "lucide-react";
import concertBanner from "../images/concert-banner.png";

function HeroCard() {
  return (
    <section
      className="relative flex min-h-[180px] items-center overflow-hidden rounded-2xl bg-cover bg-center px-8 py-5 text-white"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(20, 10, 45, 0.95) 0%, rgba(20, 10, 45, 0.6) 40%, rgba(20, 10, 45, 0.1) 100%), url(${concertBanner})`,
      }}
    >
      <div className="relative z-10 max-w-[460px]">

        {/* Title */}
        <h2 className="text-2xl font-bold leading-tight md:text-[30px]">
          Manage your concerts
        </h2>

        {/* Description */}
        <p className="mt-1 text-sm leading-5 tracking-wide text-purple-100 md:text-base">
          Create events, promote, track attendance,
          and analyze performance.
        </p>

        {/* Buttons */}
        <div className="mt-4 flex flex-wrap gap-4">

          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold transition hover:bg-purple-600"
          >
            <Plus size={19} />
            Create Concert
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-white bg-black/20 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
          >
            <CalendarDays size={19} />
            View Calendar
          </button>

        </div>
      </div>
    </section>
  );
}

export default HeroCard;
