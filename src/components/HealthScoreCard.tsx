import {
  CalendarDays, Check, Clock,
  HeartPulse
} from "lucide-react";

export default function HealthScoreCard({ size = "md" }) {
  const r     = size === "lg" ? 50  : 40;
  const cx    = size === "lg" ? 80  : 64;
  const svgSz = size === "lg" ? 160 : 128;
  const sw    = size === "lg" ? 10  : 8;
  const circ  = 2 * Math.PI * r;
  // 75% filled → offset = circ * 0.25
  const offset = circ * 0.25;

  return (
    <div className={`bg-white rounded-3xl p-6 gradient-border slide-up ${size === "lg" ? "" : ""}`}
         style={{ boxShadow: "0 4px 20px -2px rgba(0,0,0,.05)" }}>
      <div className={`flex flex-col ${size === "lg" ? "md:flex-row" : "sm:flex-row"} items-start ${size === "lg" ? "md:items-center" : "sm:items-center"} gap-6`}>

        {/* Ring */}
        <div className="relative flex-shrink-0">
          <svg width={svgSz} height={svgSz} className="-rotate-90">
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="var(--color-juno-green)" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            <circle cx={cx} cy={cx} r={r} stroke="#e5e7eb" strokeWidth={sw} fill="none" />
            <circle cx={cx} cy={cx} r={r}
              stroke="url(#scoreGrad)" strokeWidth={sw} fill="none"
              strokeLinecap="round"
              className="health-score-ring"
              style={{ strokeDasharray: circ, strokeDashoffset: circ }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-bold ${size === "lg" ? "text-4xl" : "text-3xl"}`} style={{ color: "var(--color-juno-green)" }}>75</span>
            <span className="text-xs text-gray-500">Health Score</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <HeartPulse className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <h3 className={`font-bold text-gray-900 ${size === "lg" ? "text-2xl" : "text-xl"}`}>Your Health Status</h3>
          </div>
          <p className={`text-gray-600 leading-relaxed mb-4 ${size === "lg" ? "text-base" : "text-sm"}`}>
            Your overall health is <span className="font-semibold text-green-600">Good</span>. You're maintaining healthy habits, but there are some areas that need attention. Continue taking your medications as prescribed and stay active.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1.5 bg-green-100 text-green-700 font-semibold rounded-lg flex items-center gap-1 ${size === "lg" ? "text-sm px-4 py-2" : "text-xs"}`}>
              <Check className="w-3 h-3" /> Medications on track
            </span>
            <span className={`px-3 py-1.5 bg-yellow-100 text-yellow-700 font-semibold rounded-lg flex items-center gap-1 ${size === "lg" ? "text-sm px-4 py-2" : "text-xs"}`}>
              <Clock className="w-3 h-3" /> Blood pressure check due
            </span>
            <span className={`px-3 py-1.5 bg-blue-100 text-blue-700 font-semibold rounded-lg flex items-center gap-1 ${size === "lg" ? "text-sm px-4 py-2" : "text-xs"}`}>
              <CalendarDays className="w-3 h-3" /> Appointment upcoming
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
