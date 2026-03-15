import { useNavigate } from "react-router-dom";
import { ShieldCheck, Ambulance, Globe, Network, LogIn, UserPlus, Lock } from "lucide-react";
import logo from "../assets/logo.png";


// ── Feature pill data ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    label: "Secure Records",
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  {
    label: "Emergency Access",
    icon: <Ambulance className="w-3.5 h-3.5" />,
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  {
    label: "National Network",
    icon: <Globe className="w-3.5 h-3.5" />,
    bg: "bg-purple-50",
    text: "text-purple-700",
  },
];

export default function WelcomePage() {
    const navigate = useNavigate();
  return (
    <>
      <div className="juno-bg flex items-center justify-center p-5 py-10">
        <div className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row lg:items-center lg:gap-16">

          {/* ── LEFT COLUMN (desktop) ── */}
          <div className="hidden lg:flex flex-col items-start flex-1 fade-up">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-green-700 mb-2">Wait Watchers, Jamaica</p>
            <div className="mb-3">
              <img src={logo} alt="JUNO" className="w-40 h-auto object-contain" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-8 leading-relaxed">
              Jamaican Unified Network for<br />Organizing Healthcare Intelligence
            </p>

            {/* Decorative stat pills */}
            <div className="flex flex-col gap-3">
              {[
                { label: "Hospitals Connected", value: "40+",   color: "text-emerald-600" },
                { label: "Active Patients",     value: "120k",  color: "text-blue-600"    },
                { label: "Uptime",              value: "99.9%", color: "text-purple-600"  },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-3 glass rounded-2xl px-4 py-3">
                  <span className={`text-xl font-black ${color}`}>{value}</span>
                  <span className="text-sm text-gray-500 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN / MOBILE CARD ── */}
          <div className="flex-1 w-full max-w-md mx-auto lg:mx-0">

            {/* Mobile-only brand */}
            <div className="text-center mb-8 lg:hidden fade-up fade-up-1">
              <div>
                <img src={logo} alt="JUNO" className="w-48 h-auto object-contain mx-auto" />
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-[.18em] font-semibold leading-relaxed">
                Jamaican Unified Network for<br />Organizing Healthcare Intelligence
              </p>
            </div>

            {/* Info card */}
            <div className="glass rounded-3xl p-6 mb-4 fade-up fade-up-2"
                 style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,.06)" }}>
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Network className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800 mb-1">Connected Healthcare</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    JUNO connects patients, doctors, hospitals, and emergency responders into a unified healthcare network for Jamaica.
                  </p>
                </div>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2">
                {FEATURES.map(({ label, icon, bg, text }) => (
                  <span key={label} className={`flex items-center gap-1.5 px-3 py-1.5 ${bg} ${text} rounded-full text-xs font-semibold`}>
                    {icon} {label}
                  </span>
                ))}
              </div>
            </div>
            {/* CTA buttons */}
            <button
            onClick={() => navigate("/login")}
            className="btn-primary w-full text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 text-sm"
            >
            <LogIn className="w-4 h-4" />
            Log In
            </button>
            <button
            onClick={() => navigate("/register")}
            className="btn-outline w-full text-gray-700 font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 text-sm"
            >
            <UserPlus className="w-4 h-4" />
            Create Account
            </button>

            {/* Divider */}
            {/* <div className="relative flex items-center gap-3 mb-4 fade-up fade-up-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div> */}

            {/* Emergency QR */}
            {/* <div className="fade-up fade-up-4">
              <button className="btn-emergency w-full text-red-600 font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 text-sm">
                <QrCode className="w-5 h-5" />
                Scan Emergency QR
              </button>
            </div> */}

            {/* Security note */}
            <div className="glass rounded-2xl p-4 mt-5 fade-up fade-up-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                     style={{ background: "rgba(0,112,60,.08)" }}>
                  <Lock className="w-4 h-4" style={{ color: "var(--color-juno-green)" }} />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  <span className="font-semibold text-gray-700">Your health data is encrypted and protected.</span>{" "}
                  We follow international healthcare privacy standards.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-4 mt-5 text-[11px] text-gray-400 fade-up fade-up-5">
              {["Privacy Policy", "Terms of Service", "Help"].map((link, i) => (
                <span key={link} className="flex items-center gap-4">
                  {i > 0 && <span>·</span>}
                  <a href="#" className="hover:text-green-600 transition-colors font-medium">{link}</a>
                </span>
              ))}
            </div>
            <p className="text-center text-[10px] text-gray-300 uppercase tracking-wider mt-3 font-medium">
              Version 1.0.0 · Wait Watchers, Jamaica
            </p>
          </div>
        </div>
      </div>
   
    </>
  );
}
