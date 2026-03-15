import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";
import { login, clearError } from "../store/slices/userSlice";
import { LoginFormSchema, type LoginFormData } from "../schemas/auth.schema";
import {
  ArrowLeft, ShieldCheck, FileText, ShieldHalf, Hospital,
  Clock, Users, HelpCircle, Headphones,
} from "lucide-react";
import logo from "../assets/logo.png";
import LoginFormCard from "../components/LoginFormCard";

// ── Desktop left panel ─────────────────────────────────────────────────────────
const FEATURES = [
  { icon: <ShieldHalf className="w-5 h-5 text-white" />, title: "Bank-Level Security",  desc: "256-bit encryption protects your health data" },
  { icon: <Hospital    className="w-5 h-5 text-white" />, title: "Nationwide Access",    desc: "Connected to all major healthcare facilities"  },
  { icon: <Clock       className="w-5 h-5 text-white" />, title: "24/7 Availability",    desc: "Access your records anytime, anywhere"         },
  { icon: <Users       className="w-5 h-5 text-white" />, title: "Family Sharing",       desc: "Manage health records for your loved ones"     },
];

// ── Main ───────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, user } = useAppSelector(s => s.user);
  const loading = status === "loading";

  const [form, setForm] = useState<LoginFormData>({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

  function set(key: keyof LoginFormData) {
    return (value: string) => {
      setForm(f => ({ ...f, [key]: value }));
      // Clear the field error as the user types
      setFieldErrors(e => ({ ...e, [key]: undefined }));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    dispatch(clearError());

    // Client-side Zod validation before hitting the network
    const result = LoginFormSchema.safeParse(form);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setFieldErrors({
        email:    flat.email?.[0],
        password: flat.password?.[0],
      });
      return;
    }

    await dispatch(login(result.data));
  }

  // Redirect after successful login
  useEffect(() => {
    if (!user) return;
    // All account types go to dashboard for now.
    // Extend here if you add provider/admin routes.
    navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── LEFT PANEL (desktop) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-12 relative overflow-hidden"
           style={{ background: "linear-gradient(135deg, var(--color-juno-green) 0%, #065f46 100%)" }}>
        <div className="blob-tr" /><div className="blob-bl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <img src={logo} alt="JUNO" className="h-12 w-auto object-contain brightness-0 invert" />
          </div>
          <button onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-5xl font-black text-white mb-4 leading-tight"
                style={{ fontFamily: "'Syne', sans-serif" }}>
              Welcome to Jamaica's Unified Healthcare Network
            </h1>
            <p className="text-lg text-emerald-100 leading-relaxed">
              Access your complete medical records, connect with healthcare providers, and manage your health journey — all in one secure platform.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-5 border border-white/20"
                   style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(8px)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                     style={{ background: "rgba(255,255,255,0.20)" }}>{icon}</div>
                <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
                <p className="text-emerald-100 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-6 text-emerald-100 text-sm mb-3">
            {[
              { icon: <HelpCircle className="w-4 h-4" />,  label: "Help Center"      },
              { icon: <Headphones className="w-4 h-4" />,  label: "Contact Support"  },
              { icon: <FileText   className="w-4 h-4" />,  label: "Privacy Policy"   },
            ].map(({ icon, label }) => (
              <a key={label} href="#" className="flex items-center gap-1.5 hover:text-white transition-colors">
                {icon} {label}
              </a>
            ))}
          </div>
          <p className="text-emerald-200 text-xs">Wait Watchers, Jamaica • Secure Healthcare Portal</p>
        </div>
      </div>

      {/* ── RIGHT PANEL / MOBILE ── */}
      <div className="flex-1 juno-bg flex items-start justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md fade-up">

          <button onClick={() => navigate("/")}
            className="lg:hidden flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="text-center mb-8">
            <div className="lg:hidden">
              <img src={logo} alt="JUNO" className="w-48 h-auto object-contain mx-auto" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-1"
                style={{ fontFamily: "'Syne', sans-serif" }}>Welcome Back</h1>
            <p className="text-sm text-gray-500">Sign in to access your health records</p>
          </div>

          <LoginFormCard
            form={form}
            onChange={(key, value) => set(key)(value)}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            fieldErrors={fieldErrors}
          />

          {/* Security notice */}
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-900 mb-0.5">Secure Login</h3>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Your login is protected with 256-bit encryption. We'll never share your credentials or personal health information.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy notice */}
          <div className="glass rounded-2xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                By logging in, you agree to our{" "}
                <a href="#" className="font-semibold hover:underline" style={{ color: "var(--color-juno-green)" }}>Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="font-semibold hover:underline" style={{ color: "var(--color-juno-green)" }}>Privacy Policy</a>.
                {" "}Your health data is managed according to HIPAA and Jamaica Data Protection Act standards.
              </p>
            </div>
          </div>

          <p className="text-center text-[10px] text-gray-300 uppercase tracking-wider font-medium">
            Secure Healthcare Portal • Wait Watchers, Jamaica
          </p>
        </div>
      </div>
    </div>
  );
}
