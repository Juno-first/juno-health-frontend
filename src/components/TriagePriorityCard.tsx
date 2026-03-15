import { ClipboardList, TriangleAlert, Info} from "lucide-react";
import type { QueueStatus,PriorityTier } from "../schemas/queue.schema";

// ── Triage config ──────────────────────────────────────────────────────────────

const TRIAGE_CONFIG: Record<PriorityTier, { level: number; label: string; sub: string; bg: string; text: string }> = {
  CRITICAL:    { level: 1, label: "Critical",    sub: "Immediate attention required", bg: "bg-red-100",    text: "text-red-600" },
  URGENT:      { level: 2, label: "Urgent",      sub: "Requires timely attention",    bg: "bg-orange-100", text: "text-orange-600" },
  SEMI_URGENT: { level: 3, label: "Semi-urgent", sub: "Can wait a short while",       bg: "bg-yellow-100", text: "text-yellow-700" },
  NON_URGENT:  { level: 4, label: "Non-urgent",  sub: "Can safely wait longer",       bg: "bg-green-100",  text: "text-green-600" },
};

const TRIAGE_ORDER: PriorityTier[] = [
  "CRITICAL",
  "URGENT",
  "SEMI_URGENT",
  "NON_URGENT",
];


export default function TriagePriorityCard({ data, compact = false }: { data: QueueStatus; compact?: boolean }) {
  const active = TRIAGE_CONFIG[data.priorityTier];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h3 className={`${compact ? "text-lg" : "text-xl"} font-bold text-gray-900`}>Triage Priority</h3>
          <p className="text-sm text-gray-500">Your urgency level</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 border-2 border-yellow-200 mb-4">
        <div className="inline-flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-xl font-bold mb-2">
          <TriangleAlert className="w-4 h-4" />
          Level {active.level} — {active.label}
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mb-2">
          {active.sub}. You will be seen in order of clinical priority.
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Info className="w-3.5 h-3.5 text-yellow-600" />
          AI priority score: {data.aiPriorityScore.toFixed(1)}
        </div>
      </div>

      <div className="space-y-2">
        {TRIAGE_ORDER.map((tier) => {
          const cfg = TRIAGE_CONFIG[tier];
          const isActive = tier === data.priorityTier;
          return (
            <div key={tier}
              className={`flex items-center gap-3 text-sm rounded-xl px-3 py-2 ${isActive ? "bg-yellow-50 border-2 border-yellow-300" : ""}`}>
              <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                <span className={`font-bold text-xs ${cfg.text}`}>{cfg.level}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-xs truncate">
                  {cfg.label}{isActive ? " (You)" : ""}
                </div>
                {!compact && <div className="text-xs text-gray-500 truncate">{cfg.sub}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}