import { ArrowRight, CalendarDays, Check, UserPlus, Megaphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Activity = {
  id: number;
  icon: LucideIcon;
  text: string;
  time: string;
};

// Placeholder data — swap for real data later
const activities: Activity[] = [
  { id: 1, icon: CalendarDays, text: 'Concert "The Brighters" updated', time: "12 min ago" },
  { id: 2, icon: Check, text: "48 attendees checked in", time: "25 min ago" },
  { id: 3, icon: UserPlus, text: "New registration: REG-98241", time: "30 min ago" },
  { id: 4, icon: Megaphone, text: "Promotional copy generated", time: "1 hr ago" },
];

function RecentActivity() {
  return (
    <section className="h-full rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
        <a href="#" className="flex items-center gap-1 text-sm font-semibold text-violet-700 hover:underline">
          View All
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      <ul className="space-y-4">
        {activities.map(({ id, icon: Icon, text, time }) => (
          <li key={id} className="flex items-start gap-3">
            <div className="w-9 h-9 shrink-0 rounded-full bg-violet-100 flex items-center justify-center">
              <Icon className="w-4 h-4 text-violet-700" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">{text}</p>
              <p className="text-xs text-gray-500">{time}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RecentActivity;