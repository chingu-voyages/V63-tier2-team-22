
import { useState } from "react";

import Header from "./assets/components/Header";
import Footer from "./assets/components/Footer";
import Sidebar from "./assets/components/SideBar";
import Home from "./assets/pages/Home";
import GuestDashboard from "./assets/pages/GuestDashboard";

function App() {
  const [isGuest, setIsGuest] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleGuestLogin = () => {
    setIsGuest(true);
    setCurrentPage("dashboard");
  };

const handleBackHome = () => {
  setIsGuest(false);
  setCurrentPage("dashboard");
};

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar
        onGuestLogin={handleGuestLogin}
        isGuest={isGuest}
      />

      {/* Main Layout */}
      <div className="flex min-w-0 flex-1 flex-col">

        <Header />

        <main className="w-full flex-1 px-5 pt-4 pb-6">

          {!isGuest ? (
            <Home onGuestLogin={handleGuestLogin} />
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
                    (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1)
                  )
                  .join(" ")}
              </h1>

              <p className="mt-2 text-gray-600">
                This page hasn't been implemented yet.
              </p>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="mt-auto flex w-full items-center justify-center py-6 text-center">
          <Footer />
        </footer>

      </div>
    </div>
  );
}

export default App;
