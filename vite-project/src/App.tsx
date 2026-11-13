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

// Placeholder data — replace with real data / API later
const initialConcerts: Concert[] = [
  {
    id: 1,
    name: "The Brighters – Live in Concert",
    date: "2025-12-15",
    time: "21:00",
    location: "Riverside Arena",
    description: "",
    expectedAttendance: 2500,
  },
  {
    id: 2,
    name: "Nordic Sound Tour",
    date: "2026-01-10",
    time: "20:30",
    location: "City Music Hall",
    description: "",
    expectedAttendance: 3200,
  },
  {
    id: 3,
    name: "Velvet Echoes",
    date: "2026-01-24",
    time: "21:00",
    location: "Harbor Stadium",
    description: "",
    expectedAttendance: 5000,
  },
];

function App() {
  const [isGuest, setIsGuest] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Concerts + create/edit form state
  const [concerts, setConcerts] = useState<Concert[]>(initialConcerts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConcert, setEditingConcert] = useState<Concert | null>(null);

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
      setConcerts((prev) =>
        prev.map((c) => (c.id === editingConcert.id ? { ...c, ...values } : c))
      );
    } else {
      setConcerts((prev) => [...prev, { id: Date.now(), ...values }]);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar onGuestLogin={handleGuestLogin} isGuest={isGuest} />

      {/* Main Layout */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex w-full flex-1 flex-col gap-4 px-5 pt-4 pb-6">
          {!isGuest ? (
            <Home
              onGuestLogin={handleGuestLogin}
              onCreateConcert={openCreateConcert}
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
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </h1>

              <p className="mt-2 text-gray-600">
                This page hasn't been implemented yet.
              </p>
            </div>
          )}

          {/* Dashboard sections — inside <main> so there's no big gap */}
          <Statbar />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <UpcomingConcerts concerts={concerts} onEdit={openEditConcert} />
            </div>
            <PromoteWithAI />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AttendanceChart />
            <TurnoutBySource />
            <RecentActivity />
          </div>
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