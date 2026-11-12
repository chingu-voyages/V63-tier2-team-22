import { ArrowLeft } from "lucide-react";

import {
  CalendarDays,
  Users,
  CheckCircle,
  BarChart3,
  Plus,
  Music2,
  QrCode,
  Sparkles,
  Info,
} from "lucide-react";


type GuestDashboardProps = {
  onNavigate: (page: string) => void;
  onBackHome: () => void;
};

const stats = [
  { label: "Total Concerts", icon: CalendarDays },
  { label: "Registrations", icon: Users },
  { label: "Checked In", icon: CheckCircle },
  { label: "Attendance Rate", icon: BarChart3 },
];

const quickActions = [
  { label: "Manage Attendees", icon: Users, page: "attendees" },
  { label: "Event Check-In", icon: QrCode, page: "check-in" },
  { label: "AI Promotions", icon: Sparkles, page: "promotions" },
  { label: "AI Analytics", icon: BarChart3, page: "analytics" },
];

function GuestDashboard({
  onNavigate,
  onBackHome,
}: GuestDashboardProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* Back to Home Button */}
      <button
        type="button"
        onClick={onBackHome}
        className="flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900"
      >
        <ArrowLeft size={20} />
        Back to Home
      </button>

      {/* Welcome Section */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Guest Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Your concert management workspace.
          </p>
        </div>
      </div>
      <section className="rounded-xl bg-gradient-to-r from-[#291544] to-[#54278A] p-6 text-white">
        <p className="text-sm text-purple-200">
          WELCOME TO VIBETRACK
        </p>

        <h2 className="mt-3 text-2xl font-bold">
          Let's create something unforgettable.
        </h2>

        <p className="mt-2 text-purple-100">
          Start organizing your first concert and explore
          EventFlow's management tools.
        </p>

        <button
          type="button"
          onClick={() => onNavigate("create-concert")}
          className="mt-5 flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 hover:bg-purple-700"
        >
          <Plus size={20} />
          Create Concert
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-xl border border-purple-100 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {stat.label}
                </p>
                <Icon size={22} className="text-purple-700" />
              </div>

              <p className="mt-4 text-2xl font-bold text-gray-400">
                —
              </p>
            </div>
          );
        })}
      </section>

      <section className="rounded-xl border border-purple-100 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Your Concerts
          </h2>

          <button
            type="button"
            onClick={() => onNavigate("concerts")}
            className="text-sm text-purple-700 hover:underline"
          >
            View All
          </button>
        </div>

        <div className="flex flex-col items-center rounded-lg border-2 border-dashed border-purple-200 px-6 py-12 text-center">
          <Music2 size={36} className="mb-4 text-purple-700" />

          <h3 className="text-lg font-semibold">
            No concerts yet
          </h3>

          <p className="mt-2 max-w-md text-sm text-gray-600">
            Create your first concert to start managing attendees,
            check-ins, and event performance.
          </p>

          <button
            type="button"
            onClick={() => onNavigate("create-concert")}
            className="mt-5 flex items-center gap-2 rounded-lg bg-purple-700 px-5 py-3 text-white hover:bg-purple-800"
          >
            <Plus size={18} />
            Create Concert
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">
          Explore EventFlow
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.label}
                type="button"
                onClick={() => onNavigate(action.page)}
                className="flex items-center gap-3 rounded-xl border border-purple-100 bg-white p-5 text-left hover:bg-purple-50"
              >
                <Icon size={24} className="text-purple-700" />
                <span className="font-medium">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-xl bg-purple-50 p-5">
        <Info size={22} className="shrink-0 text-purple-700" />

        <div>
          <h3 className="font-semibold">
            You're using Guest Mode
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            Explore EventFlow without creating an account.
            Concerts and analytics will appear here once
            data is available.
          </p>
        </div>
      </div>
    </div>
  );
}

export default GuestDashboard;
