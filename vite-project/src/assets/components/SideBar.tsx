
import {
  House,
  CalendarDays,
  UsersRound,
  QrCode,
  Megaphone,
  ChartNoAxesColumnIncreasing,
  Clock3,
  Layers3,
  Settings,
  ArrowRight,
} from "lucide-react";

type SidebarProps = {
  onGuestLogin: () => void;
  isGuest: boolean;
};

// Main navigation
const mainMenu = [
  { label: "Dashboard", icon: House },
  { label: "Concerts", icon: CalendarDays },
  { label: "Attendees", icon: UsersRound },
  { label: "Check-In", icon: QrCode },
  { label: "Promotions", icon: Megaphone },
  { label: "Analytics", icon: ChartNoAxesColumnIncreasing },
  { label: "Event History", icon: Clock3 },
  { label: "Comparisons", icon: Layers3 },
];

// Secondary navigation
const secondaryMenu = [
  { label: "Team", icon: UsersRound },
  { label: "Settings", icon: Settings },
];

function Sidebar({ onGuestLogin, isGuest }: SidebarProps) {
  return (
    <aside
      aria-label="Sidebar"
      className="hidden min-h-screen w-[267px] shrink-0 flex-col bg-gradient-to-b from-[#120B1C] via-[#161021] to-[#1C142A] text-white md:flex"
    >
      {/* Main Navigation */}
      <nav
        aria-label="Main navigation"
        className="px-[17px] pt-[20px]"
      >
        <div className="flex flex-col gap-[1px]">
          {mainMenu.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === "Dashboard";

            return (
              <button
                key={item.label}
                type="button"
                aria-current={isActive ? "page" : undefined}
                className={`flex h-12 w-full items-center gap-5 rounded-lg px-4 text-left transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-purple-800 to-purple-600"
                    : "hover:bg-white/10"
                }`}
              >
                <Icon
                  size={25}
                  strokeWidth={1.65}
                  className="shrink-0 text-white"
                />

                <span className="text-[16px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Divider */}
      <div className="mx-[28px] mt-[18px] border-t border-white/65" />

      {/* Secondary Navigation */}
      <nav
        aria-label="Account navigation"
        className="px-[17px] pt-[15px]"
      >
        <div className="flex flex-col gap-[1px]">
          {secondaryMenu.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                className="flex h-12 w-full items-center gap-5 rounded-lg px-4 text-left transition-colors hover:bg-white/10"
              >
                <Icon
                  size={25}
                  strokeWidth={1.65}
                  className="shrink-0 text-white"
                />

                <span className="text-[16px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

 
      {/* Guest Account Section */}
      {!isGuest && (
        <div className="mt-auto px-[14px] pb-[16px] pt-8">
          <div className="rounded-[15px] border border-[#9960D7] bg-gradient-to-br from-[#29183E] to-[#3A2458] px-[22px] py-[20px]">
            <h2 className="mb-[7px] text-[21px] font-bold">
              Try VibeTrack
            </h2>

            <p className="text-[15px] leading-[21px] text-[#F0EAF6]">
              Explore the platform with a guest account and
              manage a sample concert.
            </p>

            <button
              type="button"
              onClick={onGuestLogin}
              className="mt-[20px] flex h-[44px] w-full items-center justify-between rounded-[10px] border-[1.5px] border-white px-[16px] text-[15px] font-semibold transition-colors hover:bg-white/10"
            >
              <span>Continue as Guest</span>
              <ArrowRight size={20} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;

