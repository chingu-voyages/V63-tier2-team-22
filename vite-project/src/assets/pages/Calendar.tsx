import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import listPlugin from "@fullcalendar/react/list";
import classicThemePlugin from "@fullcalendar/react/themes/classic";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import type { Concert } from "../../types/concert";
import ConcertImage from "../components/ConcertImage";
import { useState } from "react";

type CalendarProps = {
  concerts: Concert[];
};

// Date formatter for upcoming concerts
const eventDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function Calendar({ concerts }: CalendarProps) {
  // Filter upcoming concerts based on the current calendar date
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  const nextMonth = new Date(
    calendarDate.getFullYear(),
    calendarDate.getMonth() + 1,
    1,
  );

  const year = nextMonth.getFullYear();
  const month = String(nextMonth.getMonth() + 1).padStart(2, "0");
  const nextMonthStart = `${year}-${month}-01`;

  const upcoming = concerts
    .filter(
      (concert) => concert.source === "user" && concert.date >= nextMonthStart,
    )
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
    );

  // Display concerts on calendar
  const calendarEvents = concerts.map((concert) => ({
    id: String(concert.id),
    title: concert.name,
    start: concert.date,
    allDay: true,
  }));

  return (
    <div
      className="
      grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]
    [--fc-classic-button:#f0e7ff]
    [--fc-classic-button-border:#f0e7ff]
    [--fc-classic-button-foreground:#6d28d9]
    [--fc-classic-button-strong:#e5d5ff]
    [--fc-classic-button-strong-border:#e5d5ff]"
    >
      {/* Main calendar */}
      <div className="@container min-w-0 h-[480px] md:h-[620px] lg:h-[800px]">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            classicThemePlugin,
          ]}
          initialView="dayGridMonth"
          headerToolbar={{
            start: "",
            center: "prev calendarIcon title next",
            end: "dayGridMonth,timeGridWeek,listWeek",
          }}
          toolbarTitleClass="font-semibold text-violet-700"
          toolbarClass="
          grid! grid-cols-1 items-center gap-2
          [&>*]:justify-self-center!
          @min-[760px]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
          @min-[760px]:[&>*:last-child]:justify-self-end!"
          toolbarElements={{
            calendarIcon: () => (
              <CalendarDays
                className="size-6 text-violet-700 translate-y-px"
                aria-hidden="true"
              />
            ),
          }}
          buttons={{
            listWeek: {
              text: "Agenda",
            },
            prev: {
              iconContent: (
                <ChevronLeft className="size-3.5" aria-hidden="true" />
              ),
            },
            next: {
              iconContent: (
                <ChevronRight className="size-3.5" aria-hidden="true" />
              ),
            },
          }}
          fixedWeekCount={false}
          events={calendarEvents}
          eventColor="#7008e7"
          eventContrastColor="#ffffff"
          height="100%"
          buttonClass={({ isSelected }) =>
            isSelected ? "bg-violet-700! text-white!" : ""
          }
          datesSet={({ view }) => setCalendarDate(view.calendar.getDate())}
        />
      </div>

      <aside className="flex flex-col gap-10">
        <div>
          <h1 className="font-semibold">Upcoming Events</h1>
          {upcoming.length === 0 ? (
            <p>No upcoming events</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((concert) => (
                <li key={concert.id} className="flex gap-2 items-center">
                  <ConcertImage
                    concert={concert}
                    className="size-10 shrink-0 rounded-md"
                    alt=""
                  />
                  <div>
                    <h2>{concert.name}</h2>
                    <time
                      dateTime={`${concert.date}T${concert.time}`}
                      className="block"
                    >
                      {`${eventDateFormatter.format(new Date(concert.date))} • ${concert.time}`}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

export default Calendar;
