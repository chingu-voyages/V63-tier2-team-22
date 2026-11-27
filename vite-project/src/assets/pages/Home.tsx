import { LogIn } from "lucide-react";

type HomeProps = {
  onGuestLogin: () => void;
  onLogin: () => void;
};

function Home({ onGuestLogin, onLogin }: HomeProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 text-center">
      <h1 className="text-5xl font-bold">Welcome to VibeTrack</h1>
      <div className="flex gap-3">
        {/* Login */}
        <button
          type="button"
          onClick={onLogin}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-purple-800 md:px-6 cursor-pointer"
        >
          <LogIn size={19} />
          <span>Log In</span>
        </button>
        {/* Continue as guest */}
        <button
          type="button"
          onClick={onGuestLogin}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-purple-700 px-4 py-2.5 font-semibold text-violet-700 transition-colors hover:bg-purple-800 hover:text-white md:px-6 cursor-pointer"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}

export default Home;
