
import { type LoginFormData } from "../schemas/auth.schema";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
    ArrowRight, Phone, Mail, Lock, UserPlus
} from "lucide-react";
import PasswordInput from "./PasswordInput";
import RememberRow from "./RememberRow";

export default function LoginFormCard({
  form, onChange, onSubmit, loading, error, fieldErrors,
}: {
  form: LoginFormData;
  onChange: (key: keyof LoginFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  fieldErrors: Partial<Record<keyof LoginFormData, string>>;
}) {
  const [tab, setTab] = useState<"phone" | "email">("phone");
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 mb-5"
         style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,.07)" }}>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        {(["phone", "email"] as const).map(t => (
          <button key={t}
            className={`tab-btn flex items-center justify-center gap-2 ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)} type="button">
            {t === "phone" ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            {t === "phone" ? "Phone" : "Email"}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        {tab === "phone" ? (
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
              <Phone className="w-3.5 h-3.5" style={{ color: "var(--color-juno-green)" }} />
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-medium text-sm pointer-events-none">
                +1
              </span>
              {/* For phone tab we still use email field under the hood — 
                  backend accepts email only. Update if your API supports phone. */}
              <input type="tel" placeholder="876-555-0123" maxLength={12}
                value={form.email} onChange={e => onChange("email", e.target.value)}
                className="input-field pl-12" />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">Enter your registered Jamaican mobile number</p>
          </div>
        ) : (
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-3.5 h-3.5" style={{ color: "var(--color-juno-green)" }} />
              Email Address
            </label>
            <input type="email" placeholder="your.email@example.com"
              value={form.email} onChange={e => onChange("email", e.target.value)}
              className={`input-field ${fieldErrors.email ? "border-red-400 focus:ring-red-300" : ""}`}
              required />
            {fieldErrors.email && (
              <p className="mt-1.5 text-xs text-red-600">{fieldErrors.email}</p>
            )}
            <p className="mt-1.5 text-xs text-gray-400">Enter your registered email address</p>
          </div>
        )}

        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
            <Lock className="w-3.5 h-3.5" style={{ color: "var(--color-juno-green)" }} />
            Password
          </label>
          <PasswordInput id="password" value={form.password}
            onChange={v => onChange("password", v)} />
          {fieldErrors.password && (
            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        <RememberRow />

        <button type="submit" disabled={loading}
          className="btn-primary w-full text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-sm disabled:opacity-60">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Signing in…
            </>
          ) : (
            <><span>Continue</span><ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      {/* Divider + create account */}
      <div className="relative flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Don't have an account?</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <button onClick={() => navigate("/register")}
        className="btn-outline w-full text-gray-700 font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-sm">
        <UserPlus className="w-4 h-4" /> Create Account
      </button>
    </div>
  );
}