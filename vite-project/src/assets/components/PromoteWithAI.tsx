import {
  Sparkles,
  Mail,
  Share2,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type PromoOption = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

const options: PromoOption[] = [
  {
    id: "email",
    icon: Mail,
    title: "Email Campaign",
    description: "Subject and email copy",
  },
  {
    id: "social",
    icon: Share2,
    title: "Social Media Caption",
    description: "Short, engaging post",
  },
  {
    id: "settings",
    icon: SlidersHorizontal,
    title: "Customize Settings",
    description: "Audience, purpose, tone, and call to action",
  },
];

function PromoOptionButton({
  option,
  onClick,
}: {
  option: PromoOption;
  onClick?: (id: string) => void;
}) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={() => onClick?.(option.id)}
      className="flex w-full items-center gap-3 rounded-lg border border-violet-100 bg-white px-4 py-3 text-left transition hover:border-violet-300 hover:shadow-sm"
    >
      <Icon className="w-5 h-5 shrink-0 text-violet-700" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{option.title}</p>
        <p className="text-xs text-gray-500 truncate">{option.description}</p>
      </div>
      <ChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
    </button>
  );
}

function PromoteWithAI({ onSelect }: { onSelect?: (id: string) => void }) {
  return (
    <section className="h-full rounded-xl border border-violet-100 bg-violet-50 p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <Sparkles className="w-6 h-6 shrink-0 text-violet-700" />
        <div>
          <h2 className="text-lg font-bold text-gray-900">Promote with AI</h2>
          <p className="text-sm text-gray-600">
            Generate promotional content tailored for your concert.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <PromoOptionButton key={option.id} option={option} onClick={onSelect} />
        ))}
      </div>
    </section>
  );
}

export default PromoteWithAI;