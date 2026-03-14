import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks/hooks";
import { register, clearError } from "../store/slices/userSlice";
import type { RegisterRequest } from "../schemas/auth.schema";
import {
  ArrowLeft,
  ArrowRight,
  User,
  UserPlus,
  Calendar,
  Users,
  MapPin,
  Phone,
  Mail,
  Languages,
  IdCard,
  BookUser,
  FileText,
  ShieldCheck,
  Headphones,
  Info,
  Network,
  Clock,
  Lock,
} from "lucide-react";
import logo from "../assets/logo.png";
import FieldLabel from "../components/FieldLabel";
import PhoneInput from "../components/PhoneInput";
import PasswordInput from "../components/PasswordInput";
import Hint from "../components/Hint";
import SectionDivider from "../components/SectionDivider";

const PARISHES = [
  "Kingston",
  "St. Andrew",
  "St. Catherine",
  "Clarendon",
  "Manchester",
  "St. Elizabeth",
  "Westmoreland",
  "Hanover",
  "St. James",
  "Trelawny",
  "St. Ann",
  "St. Mary",
  "Portland",
  "St. Thomas",
];

const LEFT_FEATURES = [
  {
    icon: <ShieldCheck className="w-5 h-5 text-white" />,
    title: "Secure & Private",
    desc: "Your health data is protected with 256-bit encryption and HIPAA compliance",
  },
  {
    icon: <Network className="w-5 h-5 text-white" />,
    title: "Unified Network",
    desc: "Connect with hospitals, clinics, and providers across Jamaica",
  },
  {
    icon: <Clock className="w-5 h-5 text-white" />,
    title: "24/7 Access",
    desc: "Access your medical records and health information anytime, anywhere",
  },
];

type FormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  sex: string;
  parish: string;
  phone: string;
  email: string;
  language: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  agreeNotifications: boolean;
};

function normalizeGender(sex: string): string {
  switch (sex) {
    case "male":
      return "Male";
    case "female":
      return "Female";
    case "other":
      return "Other";
    case "prefer-not-to-say":
      return "Prefer not to say";
    default:
      return "";
  }
}

function normalizeLanguage(language: string): string {
  switch (language) {
    case "patois":
      return "Patois";
    case "english":
    default:
      return "English";
  }
}

export default function CreateAccountPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.user);

  const [form, setForm] = useState<FormState>({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    sex: "",
    parish: "",
    phone: "",
    email: "",
    language: "english",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    agreeNotifications: false,
  });

  const set =
    (key: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (error) {
        dispatch(clearError());
      }

      setForm((f) => ({
        ...f,
        [key]:
          e.target instanceof HTMLInputElement && e.target.type === "checkbox"
            ? e.target.checked
            : e.target.value,
      }));
    };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const payload: RegisterRequest = {
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim() || undefined,
      lastName: form.lastName.trim(),
      dateOfBirth: form.dob,
      gender: normalizeGender(form.sex),
      parishOfResidence: form.parish,
      languagePreference: normalizeLanguage(form.language),
      email: form.email.trim(),
      phone: form.phone.replace(/\D/g, ""),
      password: form.password,
    };

    const result = await dispatch(register(payload));

    if (register.fulfilled.match(result)) {
      navigate("/health-setup");
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div
        className="hidden lg:flex lg:w-2/5 xl:w-1/3 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--color-juno-green) 0%, #065f46 100%)",
        }}
      >
        <div className="blob-tr" />
        <div className="blob-bl" />

        <div className="relative z-10">
          <div className="mb-10">
            <img
              src={logo}
              alt="JUNO"
              className="h-12 w-auto object-contain brightness-0 invert mb-4"
            />
            <p className="text-emerald-100 text-sm leading-relaxed">
              Jamaican Unified Network for Organizing Healthcare Intelligence
            </p>
          </div>

          <div className="space-y-6">
            {LEFT_FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  {icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-0.5 text-sm">
                    {title}
                  </h3>
                  <p className="text-emerald-100 text-xs leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="relative z-10 rounded-2xl p-5 border border-white/20"
          style={{
            background: "rgba(255,255,255,0.10)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                Dr. Kimberly Thompson
              </p>
              <p className="text-emerald-100 text-xs">
                Kingston Public Hospital
              </p>
            </div>
          </div>
          <p className="text-white text-xs leading-relaxed">
            "JUNO has transformed how we coordinate patient care across Jamaica.
            Essential for modern healthcare."
          </p>
        </div>
      </div>

      <div className="flex-1 juno-bg overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto px-5 py-8 lg:px-12 lg:py-12 fade-up">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-7 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </button>

          <div className="text-center mb-6">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-juno-green) 0%, #059669 100%)",
                boxShadow: "0 8px 24px -4px rgba(0,112,60,0.35)",
              }}
            >
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <h1
              className="text-3xl lg:text-4xl font-black text-gray-900 mb-1"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Create Account
            </h1>
            <p className="text-sm text-gray-500">
              Join JUNO to access healthcare services
            </p>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 my-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-900 mb-0.5">
                  Important Information
                </h3>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Please provide accurate information. This will be used to
                  create your medical profile and health records across the JUNO
                  network.
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-3xl p-6 lg:p-10 mb-6"
            style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,.07)" }}
          >
            <form onSubmit={handleSubmit}>
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <IdCard
                  className="w-5 h-5"
                  style={{ color: "var(--color-juno-green)" }}
                />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <FieldLabel icon={<User className="w-3.5 h-3.5" />}>
                    First Name
                  </FieldLabel>
                  <input
                    type="text"
                    placeholder="Enter your first name"
                    value={form.firstName}
                    onChange={set("firstName")}
                    className="input-field"
                    required
                  />
                  <Hint>As it appears on your identification</Hint>
                </div>

                <div>
                  <FieldLabel icon={<User className="w-3.5 h-3.5" />}>
                    Middle Name
                  </FieldLabel>
                  <input
                    type="text"
                    placeholder="Enter your middle name"
                    value={form.middleName}
                    onChange={set("middleName")}
                    className="input-field"
                  />
                  <Hint>Optional</Hint>
                </div>

                <div>
                  <FieldLabel icon={<User className="w-3.5 h-3.5" />}>
                    Last Name
                  </FieldLabel>
                  <input
                    type="text"
                    placeholder="Enter your last name"
                    value={form.lastName}
                    onChange={set("lastName")}
                    className="input-field"
                    required
                  />
                  <Hint>As it appears on your identification</Hint>
                </div>

                <div>
                  <FieldLabel icon={<Calendar className="w-3.5 h-3.5" />}>
                    Date of Birth
                  </FieldLabel>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={set("dob")}
                    className="input-field"
                    required
                  />
                  <Hint>Required for age-appropriate care</Hint>
                </div>

                <div>
                  <FieldLabel icon={<Users className="w-3.5 h-3.5" />}>
                    Sex
                  </FieldLabel>
                  <select
                    value={form.sex}
                    onChange={set("sex")}
                    className="input-field"
                    required
                  >
                    <option value="">Select your biological sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                  <Hint>Used for medical assessments and care</Hint>
                </div>

                <div>
                  <FieldLabel icon={<MapPin className="w-3.5 h-3.5" />}>
                    Parish
                  </FieldLabel>
                  <select
                    value={form.parish}
                    onChange={set("parish")}
                    className="input-field"
                    required
                  >
                    <option value="">Select your parish</option>
                    {PARISHES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <Hint>
                    Helps connect you to local healthcare facilities
                  </Hint>
                </div>
              </div>

              <SectionDivider
                icon={<BookUser className="w-5 h-5" />}
                title="Contact Information"
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <FieldLabel icon={<Phone className="w-3.5 h-3.5" />}>
                    Phone Number
                  </FieldLabel>
                  <PhoneInput
                    value={form.phone}
                    onChange={(v: string) => {
                      if (error) dispatch(clearError());
                      setForm((f) => ({ ...f, phone: v }));
                    }}
                  />
                  <Hint>Used for appointment reminders and notifications</Hint>
                </div>

                <div>
                  <FieldLabel icon={<Mail className="w-3.5 h-3.5" />}>
                    Email Address
                  </FieldLabel>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={form.email}
                    onChange={set("email")}
                    className="input-field"
                    required
                  />
                  <Hint>For account recovery and secure communications</Hint>
                </div>

                <div>
                  <FieldLabel icon={<Languages className="w-3.5 h-3.5" />}>
                    Language Preference
                  </FieldLabel>
                  <select
                    value={form.language}
                    onChange={set("language")}
                    className="input-field"
                  >
                    <option value="english">English</option>
                    <option value="patois">Jamaican Patois</option>
                  </select>
                  <Hint>Choose your preferred language for the app</Hint>
                </div>
              </div>

              <SectionDivider
                icon={<Lock className="w-5 h-5" />}
                title="Account Security"
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <FieldLabel icon={<Lock className="w-3.5 h-3.5" />}>
                    Password
                  </FieldLabel>
                  <PasswordInput
                    id="password"
                    value={form.password}
                    onChange={(v: string) => {
                      if (error) dispatch(clearError());
                      setForm((f) => ({ ...f, password: v }));
                    }}
                    placeholder="Create a secure password"
                  />
                  <Hint>
                    Use at least 8 characters with a mix of letters, numbers,
                    and symbols
                  </Hint>
                </div>

                <div>
                  <FieldLabel icon={<Lock className="w-3.5 h-3.5" />}>
                    Confirm Password
                  </FieldLabel>
                  <PasswordInput
                    id="confirmPassword"
                    value={form.confirmPassword}
                    onChange={(v: string) => {
                      if (error) dispatch(clearError());
                      setForm((f) => ({ ...f, confirmPassword: v }));
                    }}
                    placeholder="Re-enter your password"
                  />
                  <Hint>Re-enter your password to confirm it</Hint>
                </div>
              </div>

              <SectionDivider
                icon={<FileText className="w-5 h-5" />}
                title="Terms & Consent"
              />

              <div className="space-y-3 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.agreeTerms}
                      onChange={set("agreeTerms")}
                      className="w-4 h-4 mt-0.5 rounded border-2 border-gray-300 accent-[var(--color-juno-green)] flex-shrink-0"
                      required
                    />
                    <span className="text-xs text-gray-700 leading-relaxed">
                      I agree to the{" "}
                      <a
                        href="#"
                        className="font-semibold hover:underline"
                        style={{ color: "var(--color-juno-green)" }}
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="font-semibold hover:underline"
                        style={{ color: "var(--color-juno-green)" }}
                      >
                        Privacy Policy
                      </a>
                      . I understand my health data will be securely stored and
                      managed according to HIPAA and Jamaica Data Protection Act
                      standards.
                    </span>
                  </label>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.agreeNotifications}
                      onChange={set("agreeNotifications")}
                      className="w-4 h-4 mt-0.5 rounded border-2 border-gray-300 accent-[var(--color-juno-green)] flex-shrink-0"
                    />
                    <span className="text-xs text-gray-700 leading-relaxed">
                      I consent to receive appointment reminders, health
                      notifications, and important updates via SMS and email.
                    </span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-primary w-full text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>
                  {status === "loading"
                    ? "Creating Account..."
                    : "Continue to Health Setup"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="glass rounded-2xl p-5 border-2 border-blue-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-900 mb-1">
                    Your Data is Protected
                  </h3>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    All information is encrypted with 256-bit security and only
                    shared with authorized providers with your consent.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border-2 border-emerald-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-900 mb-1">
                    Need Help?
                  </h3>
                  <p className="text-xs text-emerald-700 leading-relaxed mb-2">
                    Our support team is available 24/7 to assist with
                    registration or any questions.
                  </p>
                  <a
                    href="#"
                    className="text-xs font-semibold flex items-center gap-1 hover:underline"
                    style={{ color: "var(--color-juno-green)" }}
                  >
                    Contact Support <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-gray-400 mb-4">
            {["Help Center", "Contact Support", "FAQ", "Privacy Policy"].map(
              (link, i) => (
                <span key={link} className="flex items-center gap-4">
                  {i > 0 && <span className="hidden sm:inline">·</span>}
                  <a
                    href="#"
                    className="hover:text-green-600 transition-colors font-medium"
                  >
                    {link}
                  </a>
                </span>
              )
            )}
          </div>

          <p className="text-center text-[10px] text-gray-300 uppercase tracking-wider pb-8 font-medium">
            Secure Healthcare Portal · Ministry of Health, Jamaica
          </p>
        </div>
      </div>
    </div>
  );
}
