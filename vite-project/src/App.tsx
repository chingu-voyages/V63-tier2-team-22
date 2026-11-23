import { useState } from "react";

import Header from "./assets/components/Header";
import Footer from "./assets/components/Footer";
import Sidebar from "./assets/components/SideBar";
import Home from "./assets/pages/Home";
import GuestDashboard from "./assets/pages/GuestDashboard";
import Statbar from "./assets/components/Statbar";
import UpcomingConcerts from "./assets/components/UpcomingConcerts";
import PromoteWithAI from "./assets/components/PromoteWithAI";
import AttendanceChart from "./assets/components/AttendanceChart";
import TurnoutBySource from "./assets/components/TurnoutBySource";
import RecentActivity from "./assets/components/RecentActivity";
import ConcertFormModal from "./assets/components/ConcertFormModal";
import type { Concert, ConcertFormValues } from "./types/concert";
import { sortUpcoming, todayISO } from "./types/concert";
import { useLiveConcerts } from "./hooks/useLiveConcerts";
import { useRecentConcerts } from "./hooks/useRecentConcerts";
import Attendees from "./assets/components/Attendees";
import Concerts from "./assets/pages/Concerts";
import EventHistory from "./assets/pages/EventHistory";
import Calendar from "./assets/pages/Calendar";
import CheckIn from "./assets/pages/CheckIn";

// Sample upcoming concerts — only shown when the live API (SeatGeek) isn't available
// (no API key, or the request failed), so the page never looks empty.
const sampleUpcoming: Concert[] = [
  {
    id: "sample-1",
    source: "sample",
    name: "The Brighteners Live Tour",
    date: "2026-12-20",
    time: "20:00",
    location: "Madison Square Garden, NYC",
    description:
      "Experience The Brighteners like never before in their highly anticipated tour.",
    expectedAttendance: 18000,
    genre: "Pop",
    ticketPrice: 129,
  },
  {
    id: "sample-2",
    source: "sample",
    name: "Dreamscape Tour",
    date: "2026-11-28",
    time: "19:30",
    location: "Brooklyn Paramount, Brooklyn, NY",
    description: "",
    expectedAttendance: 2700,
    genre: "Rock",
    ticketPrice: 65,
  },
  {
    id: "sample-3",
    source: "sample",
    name: "Moonlight Melodies",
    date: "2026-12-05",
    time: "19:00",
    location: "Radio City Music Hall, NYC",
    description: "",
    expectedAttendance: 6000,
    genre: "Indie",
    ticketPrice: 85,
  },
  {
    id: "sample-4",
    source: "sample",
    name: "Future Beats Festival",
    date: "2026-12-12",
    time: "18:00",
    location: "Barclays Center, Brooklyn, NY",
    description: "",
    expectedAttendance: 17000,
    genre: "EDM",
    ticketPrice: 95,
  },
];

function App() {
  const [isGuest, setIsGuest] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Concerts the app owns: user-created (plus edited copies of samples)
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConcert, setEditingConcert] = useState<Concert | null>(null);

  // Real events from SeatGeek; fall back to samples if unavailable
  const live = useLiveConcerts();
  const external =
    live.status === "ready"
      ? live.concerts
      : live.status === "loading"
        ? []
        : sampleUpcoming;

  // Everything, with owned copies winning over external ones with the same id
  const ownedIds = new Set(concerts.map((c) => c.id));
  const allConcerts = [
    ...concerts,
    ...external.filter((c) => !ownedIds.has(c.id)),
  ];

  // User-created first (newest on top), then real events by date
  const today = todayISO();
  const upcomingConcerts = sortUpcoming(
    allConcerts.filter((c) => c.date >= today),
  );

  // Event History: real recent concerts, including recent shows by the
  // artists on the Upcoming list (waits for that list to load first)
  const upcomingArtists = [
    ...new Set(
      (live.status === "ready" ? live.concerts : [])
        .map((c) => c.artist)
        .filter((a): a is string => !!a),
    ),
  ];
  const recent = useRecentConcerts(
    live.status === "loading" ? null : upcomingArtists,
  );

  const handleGuestLogin = () => {
    setIsGuest(true);
    setCurrentPage("dashboard");
  };

  const handleBackHome = () => {
    setIsGuest(false);
    setCurrentPage("dashboard");
  };

  const openCreateConcert = () => {
    setEditingConcert(null);
    setIsFormOpen(true);
  };

  const openEditConcert = (concert: Concert) => {
    setEditingConcert(concert);
    setIsFormOpen(true);
  };

  const handleSaveConcert = (values: ConcertFormValues) => {
    if (editingConcert) {
      const edited = { ...editingConcert, ...values };
      setConcerts(
        (prev) =>
          prev.some((c) => c.id === edited.id)
            ? prev.map((c) => (c.id === edited.id ? edited : c))
            : [...prev, edited], // editing a fallback sample: keep our copy
      );
    } else {
      const now = Date.now();
      setConcerts((prev) => [
        ...prev,
        { id: now, source: "user", createdAt: now, ...values },
      ]);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        onGuestLogin={handleGuestLogin}
        isGuest={isGuest}
        onNavigate={setCurrentPage}
        currentPage={currentPage}
      />

      {/* Main Layout */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex w-full flex-1 flex-col gap-4 px-5 pt-4 pb-6">
          {/* ATTENDEES PAGE */}
          {currentPage === "attendees" ? (
            <Attendees />
          ) : currentPage === "concerts" ? (
            <Concerts
              concerts={allConcerts}
              onCreate={openCreateConcert}
              onEdit={openEditConcert}
              apiStatus={live.status}
              apiError={live.error}
            />
          ) : currentPage === "event-history" ? (
            <EventHistory
              recent={recent.concerts}
              owned={concerts.filter((c) => c.source === "user")}
              upcomingArtists={upcomingArtists}
              status={recent.status}
              error={recent.error}
              onEdit={openEditConcert}
            />
          ) : currentPage === "calendar" ? (
            <Calendar concerts={concerts} />
          ) : currentPage === "check-in" ? (
            <CheckIn />
          ) : (
            <>
              {/* ORIGINAL HOME / DASHBOARD */}
              {!isGuest ? (
                <Home
                  onGuestLogin={handleGuestLogin}
                  onCreateConcert={openCreateConcert}
                  onViewCalendar={() => setCurrentPage("calendar")}
                />
              ) : currentPage === "dashboard" ? (
                <GuestDashboard
                  onNavigate={setCurrentPage}
                  onBackHome={handleBackHome}
                />
              ) : (
                <div className="py-10">
                  <button
                    type="button"
                    onClick={() => setCurrentPage("dashboard")}
                    className="mb-4 text-purple-700 hover:underline"
                  >
                    ← Back to Guest Dashboard
                  </button>

                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentPage
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}
                  </h1>

                  <p className="mt-2 text-gray-600">
                    This page hasn't been implemented yet.
                  </p>
                </div>
              )}

              {/* DASHBOARD SECTIONS — PRESERVED */}
              <Statbar />

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <UpcomingConcerts
                    concerts={upcomingConcerts.slice(0, 5)}
                    onEdit={openEditConcert}
                    onViewAll={() => setCurrentPage("concerts")}
                    apiStatus={live.status}
                  />
                </div>
                <PromoteWithAI />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <AttendanceChart />
                <TurnoutBySource />
                <RecentActivity />
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-auto flex w-full items-center justify-center py-6 text-center">
          <Footer />
        </footer>
      </div>

      {/* Create / Edit concert popup */}
      <ConcertFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveConcert}
        concert={editingConcert}
      />
    </div>
  );
}

export default App;
