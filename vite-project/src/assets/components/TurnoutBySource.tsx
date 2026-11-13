import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

type Source = {
  name: string;
  value: number; // percent
  color: string;
};

// Placeholder data — swap for real data later
const sources: Source[] = [
  { name: "Social Media", value: 34, color: "#4c1d95" }, // violet-900
  { name: "Email", value: 26, color: "#6d28d9" }, // violet-700
  { name: "Referral", value: 15, color: "#8b5cf6" }, // violet-500
  { name: "Website", value: 12, color: "#a78bfa" }, // violet-400
  { name: "Other", value: 8, color: "#c4b5fd" }, // violet-300
  { name: "Unknown", value: 5, color: "#d1d5db" }, // gray-300
];

const TOTAL_CHECK_INS = 6980;

function TurnoutBySource() {
  return (
    <section className="h-full rounded-xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Turnout by Source</h2>

      <div className="mt-3 flex flex-col sm:flex-row items-center gap-4">
        {/* Donut */}
        <div className="relative w-40 h-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sources}
                dataKey="value"
                nameKey="name"
                innerRadius="62%"
                outerRadius="100%"
                paddingAngle={1}
                stroke="#ffffff"
                strokeWidth={2}
                startAngle={90}
                endAngle={-270}
              >
                {sources.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value}%`, name]}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-gray-900">{TOTAL_CHECK_INS.toLocaleString()}</span>
            <span className="text-xs text-gray-500">Check-Ins</span>
          </div>
        </div>

        {/* Legend */}
        <ul className="flex-1 w-full space-y-1.5 text-sm">
          {sources.map((s) => (
            <li key={s.name} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 shrink-0 rounded-sm" style={{ backgroundColor: s.color }} />
              <span className="flex-1 text-gray-700">{s.name}</span>
              <span className="font-medium text-gray-900">{s.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default TurnoutBySource;