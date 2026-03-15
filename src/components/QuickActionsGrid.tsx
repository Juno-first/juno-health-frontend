import { MapPin, Phone, X, FileText, ArrowRight,Loader2} from "lucide-react";

export default function QuickActionsGrid({ onLeave, leaving }: { onLeave: () => void; leaving: boolean }) {
  const actions = [
    {
      Icon: Phone, title: "Contact ER", sub: "Call emergency department",
      bg: "bg-white", border: "border-2", iconBg: "bg-white/80", iconColor: "var(--color-juno-green)",
      style: { borderColor: "var(--color-juno-green)", color: "var(--color-juno-green)" },
    },
    {
      Icon: MapPin, title: "Get Directions", sub: "Navigate to hospital",
      bg: "bg-white", border: "border-2 border-blue-500", iconBg: "bg-blue-100", iconColor: "#2563EB",
    },
    {
      Icon: FileText, title: "View Records", sub: "Access medical history",
      bg: "bg-white", border: "border-2 border-purple-500", iconBg: "bg-purple-100", iconColor: "#9333EA",
    },
    {
      Icon: leaving ? Loader2 : X,
      title: leaving ? "Leaving…" : "Leave Queue",
      sub: "Cancel check-in",
      bg: "bg-gradient-to-br from-red-500 to-red-600", border: "",
      iconBg: "bg-white/20", iconColor: "#fff",
      shadow: "0 10px 30px -5px rgba(239,68,68,.35)", textWhite: true,
      onClick: onLeave,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {actions.map(({ border, iconBg, Icon, title, sub, bg, style, shadow, textWhite, iconColor, onClick }) => (
        <button key={title} onClick={onClick}
          disabled={leaving && title.startsWith("Leav")}
          className={`${bg} ${border} rounded-2xl p-5 text-left transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed`}
          style={{ ...(style || {}), ...(shadow ? { boxShadow: shadow } : {}) }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
              <Icon
                className={`w-6 h-6 ${leaving && title.startsWith("Leav") ? "animate-spin" : ""}`}
                style={{ color: iconColor }}
              />
            </div>
            <ArrowRight className="w-5 h-5 opacity-70" style={{ color: textWhite ? "#fff" : undefined }} />
          </div>
          <h3 className={`text-base font-bold mb-0.5 ${textWhite ? "text-white" : "text-gray-900"}`}>{title}</h3>
          <p className={`text-sm ${textWhite ? "text-white/80" : "text-gray-600"}`}>{sub}</p>
        </button>
      ))}
    </div>
  );
}