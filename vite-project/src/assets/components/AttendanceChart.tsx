import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";

type MonthData = {
  month: string;
  registrations: number;
  checkIns: number;
  target: number;
};

// Placeholder data — swap for real data later
const data: MonthData[] = [
  { month: "Sep 2025", registrations: 3600, checkIns: 3050, target: 3900 },
  { month: "Oct 2025", registrations: 4200, checkIns: 3600, target: 4250 },
  { month: "Nov 2025", registrations: 4650, checkIns: 4250, target: 5100 },
];

const DARK = "#5b21b6"; // violet-800
const LIGHT = "#a78bfa"; // violet-400

const withRate = data.map((d) => ({
  ...d,
  rate: `${Math.round((d.checkIns / d.registrations) * 100)}%`,
}));

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      {dashed ? (
        <span className="w-4 border-t-2 border-dashed" style={{ borderColor: color }} />
      ) : (
        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
      )}
      {label}
    </span>
  );
}

function AttendanceChart() {
  return (
    <section className="h-full rounded-xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Attendance vs. Target</h2>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        <LegendItem color={DARK} label="Registrations" />
        <LegendItem color={LIGHT} label="Check-Ins" />
        <LegendItem color="#6b7280" label="Expected Attendance" dashed />
      </div>

      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={withRate} barGap={2} margin={{ top: 20, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} tickFormatter={(v) => v.toLocaleString()} />
            <Tooltip
              cursor={{ fill: "#f5f3ff" }}
              formatter={(value, name) => [Number(value).toLocaleString(), name]}
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="registrations" name="Registrations" fill={DARK} radius={[4, 4, 0, 0]} maxBarSize={36} />
            <Bar dataKey="checkIns" name="Check-Ins" fill={LIGHT} radius={[4, 4, 0, 0]} maxBarSize={36} />
            <Line
              dataKey="target"
              name="Expected Attendance"
              stroke="#6b7280"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={false}
            >
              <LabelList dataKey="rate" position="top" style={{ fontSize: 11, fontWeight: 600, fill: "#374151" }} />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default AttendanceChart;