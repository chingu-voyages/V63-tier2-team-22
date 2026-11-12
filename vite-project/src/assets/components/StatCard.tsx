import type { LucideIcon } from "lucide-react";
import { ArrowUp } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  change: string;
};

function StatCard({ icon: Icon, label, value, change }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
      <div className="w-12 h-12 shrink-0 rounded-full bg-violet-100 flex items-center justify-center">
        <Icon className="w-6 h-6 text-violet-700" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-xl font-bold">{value}</p>
          <span className="flex items-center text-xs font-medium text-green-600">
            <ArrowUp className="w-3 h-3" />
            {change}
          </span>
        </div>
      </div>
    </div>
  );
}

export default StatCard;