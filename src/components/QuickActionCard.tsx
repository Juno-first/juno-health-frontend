import { ArrowRight, type LucideIcon } from "lucide-react";

type QuickActionCardProps = {
  gradient: string;
  Icon: LucideIcon;
  title: string;
  sub: string;
  pulse?: boolean;
};

export default function QuickActionCard({
  gradient,
  Icon,
  title,
  sub,
  pulse = false,
}: QuickActionCardProps) {
  return (
    <button
      type="button"
      className="w-full rounded-2xl p-5 text-white text-left relative overflow-hidden transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: gradient,
        boxShadow: "0 10px 30px -5px rgba(0,112,60,.15)",
      }}
    >
      {pulse && (
        <div
          className="pulse-ring absolute inset-0 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.15)" }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
          <ArrowRight className="w-5 h-5" />
        </div>

        <h3 className="text-lg font-bold mb-1">{title}</h3>
        <p className="text-sm text-white/80">{sub}</p>
      </div>
    </button>
  );
}
