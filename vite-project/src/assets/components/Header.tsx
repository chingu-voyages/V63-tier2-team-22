
import logo from "../images/vibetrack-logo.png";
import { LogIn } from "lucide-react";

function Header() {
  return (
    <header className="w-full border-b border-purple-100 bg-[#FAF8FF] shadow-sm">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-3 md:px-8">

        {/* Left side */}
        <div className="flex min-w-0 items-center gap-4 md:gap-6">

          {/* Logo */}
          <div className="flex shrink-0 items-center">
            <img
              src={logo}
              alt="VibeTrack"
              className="w-36 object-contain md:w-44"
            />
          </div>

          {/* Divider */}
          <div className="hidden h-11 w-px bg-purple-200 sm:block" />

          {/* Page Title */}
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold leading-tight text-[#1B1035] md:text-2xl">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your concerts
            </p>
          </div>
        </div>

        {/* Login */}
        <button
          type="button"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-purple-800 md:px-6"
        >
          <LogIn size={19} />
          <span>Log In</span>
        </button>

      </div>
    </header>
  );
}

export default Header;
