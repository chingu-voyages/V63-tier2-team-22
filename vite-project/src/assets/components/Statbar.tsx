import { CalendarDays, UsersRound, QrCode, Megaphone, ChartNoAxesColumnIncreasing } from "lucide-react";
import StatCard from "./StatCard";

function Statbar() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 px-5 pb-4">
      <StatCard icon={CalendarDays} label="Total Concerts" value="12" change="22%" />
      <StatCard icon={UsersRound} label="Attendees" value="6,980" change="22%" />
      <StatCard icon={QrCode} label="Check-Ins" value="4,210" change="8%" />
      <StatCard icon={Megaphone} label="Promotions" value="5" change="3%" />
      <StatCard icon={ChartNoAxesColumnIncreasing} label="Revenue" value="$24k" change="15%" />
    </div>
  );
}

export default Statbar;