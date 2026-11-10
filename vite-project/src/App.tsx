
import Header from "./assets/components/Header";
import Footer from "./assets/components/Footer";
import HeroCard from "./assets/components/HeroCard";
import Sidebar from "./assets/components/Sidebar";

function App() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Left Sidebar */}
      <Sidebar />

      {/* Right Content */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="w-full flex-1 px-5 pt-4 pb-6 md:px-5">

          {/* Hero Card */}
          <HeroCard />

          {/* Guest and Login Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button className="rounded bg-blue-500 px-4 py-2 text-white">
              Guest
            </button>

            <button className="rounded bg-green-500 px-4 py-2 text-white">
              Auth Login
            </button>
          </div>

          {/* AI Chat */}
          <div className="mt-12 flex items-center justify-center">
            <h3>AI Chat Icon</h3>
          </div>

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
