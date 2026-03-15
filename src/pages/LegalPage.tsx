import { ArrowLeft, CalendarDays, FileText, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import logo from "../assets/logo.png";

type LegalSection = {
  title: string;
  body: string;
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  effectiveDate: string;
  sections: LegalSection[];
  emphasis: {
    icon: ReactNode;
    title: string;
    body: string;
  };
};

const TERMS_SECTIONS: LegalSection[] = [
  {
    title: "Use of the portal",
    body:
      "JUNO is a healthcare access platform for viewing records, coordinating care, and connecting with participating providers in Jamaica. This placeholder text is intended to support product flows until final legal language is approved.",
  },
  {
    title: "Account responsibilities",
    body:
      "Users are expected to keep login details private, provide accurate profile information, and use the portal only for lawful healthcare-related purposes for themselves or authorized dependants.",
  },
  {
    title: "Service availability",
    body:
      "We aim to keep the service available at all times, but emergency operations, maintenance windows, partner-system downtime, or connectivity issues may affect access to some records or features.",
  },
  {
    title: "Clinical information",
    body:
      "Information shown in the portal supports care coordination and patient awareness. It does not replace medical advice, diagnosis, or emergency intervention from qualified healthcare professionals.",
  },
  {
    title: "Policy updates",
    body:
      "These starter terms may be revised as the service matures and formal legal review is completed. Material updates should be reflected on this page with a revised effective date.",
  },
];

const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: "Information collected",
    body:
      "JUNO may collect identity details, contact information, account credentials, appointment activity, and healthcare record metadata needed to operate the patient experience across connected services.",
  },
  {
    title: "How information is used",
    body:
      "Data is used to authenticate users, surface relevant records, coordinate appointments and queues, support emergency workflows, and send essential service or care notifications.",
  },
  {
    title: "Sharing and disclosure",
    body:
      "Information should be shared only with authorized healthcare organizations, service providers supporting platform operations, and parties required by law, policy, or urgent patient-safety needs.",
  },
  {
    title: "Security controls",
    body:
      "The platform is designed around access controls, encryption, auditability, and operational safeguards aligned with healthcare privacy expectations, including HIPAA-aware handling and Jamaica Data Protection Act considerations.",
  },
  {
    title: "User choices",
    body:
      "Patients should be able to review profile details, manage communications preferences where available, and request support if they need help understanding how their information is handled.",
  },
];

function LegalPage({
  eyebrow,
  title,
  intro,
  effectiveDate,
  sections,
  emphasis,
}: LegalPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    typeof location.state === "object" &&
    location.state !== null &&
    "from" in location.state &&
    typeof (location.state as { from?: unknown }).from === "string"
      ? (location.state as { from: string }).from
      : "/";

  return (
    <div className="min-h-screen juno-bg px-4 py-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate(from)}
          className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-white hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="glass overflow-hidden rounded-[2rem] border border-white/80 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.28)]">
          <div
            className="relative overflow-hidden px-6 py-8 lg:px-10 lg:py-10"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,112,60,0.97) 0%, rgba(6,95,70,0.96) 58%, rgba(15,118,110,0.92) 100%)",
            }}
          >
            <div className="blob-tr" />
            <div className="blob-bl" />

            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-5 flex items-center gap-3">
                  <img
                    src={logo}
                    alt="JUNO"
                    className="h-10 w-auto object-contain brightness-0 invert"
                  />
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-50">
                    {eyebrow}
                  </span>
                </div>
                <h1
                  className="mb-3 text-3xl font-black leading-tight text-white lg:text-5xl"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {title}
                </h1>
                <p className="max-w-xl text-sm leading-relaxed text-emerald-50 lg:text-base">
                  {intro}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-100">
                    Effective date
                  </p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <CalendarDays className="h-4 w-4" />
                    {effectiveDate}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-100">
                    Status
                  </p>
                  <p className="text-sm font-semibold text-white">
                    Starter legal copy pending formal review
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)] lg:px-10 lg:py-8">
            <div className="space-y-4">
              {sections.map((section) => (
                <section
                  key={section.title}
                  className="rounded-3xl border border-emerald-100/80 bg-white/80 p-5 shadow-[0_18px_50px_-34px_rgba(0,112,60,0.35)] backdrop-blur-sm"
                >
                  <h2 className="mb-2 text-lg font-bold text-gray-900">
                    {section.title}
                  </h2>
                  <p className="text-sm leading-7 text-gray-600">{section.body}</p>
                </section>
              ))}
            </div>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/85 p-5 shadow-[0_18px_50px_-38px_rgba(0,112,60,0.45)]">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-juno-green) 0%, #059669 100%)",
                  }}
                >
                  {emphasis.icon}
                </div>
                <h2 className="mb-2 text-lg font-bold text-gray-900">
                  {emphasis.title}
                </h2>
                <p className="text-sm leading-7 text-gray-700">{emphasis.body}</p>
              </div>

              <div className="glass rounded-3xl p-5">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400">
                  Quick links
                </p>
                <div className="space-y-3">
                  <Link to="/login" className="inline-legal-link block text-sm">
                    Log in to JUNO
                  </Link>
                  <Link to="/register" className="inline-legal-link block text-sm">
                    Create a patient account
                  </Link>
                  <Link
                    to={title === "Terms of Service" ? "/privacy" : "/terms"}
                    className="inline-legal-link block text-sm"
                  >
                    {title === "Terms of Service" ? "View Privacy Policy" : "View Terms of Service"}
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-blue-100 bg-blue-50/85 p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-900">
                  <ShieldCheck className="h-4 w-4" />
                  Healthcare context
                </div>
                <p className="text-sm leading-7 text-blue-900/80">
                  JUNO is designed for sensitive patient journeys. Final production legal
                  content should be reviewed with healthcare, privacy, and local regulatory
                  stakeholders before release.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TermsOfServicePage() {
  return (
    <LegalPage
      eyebrow="Usage terms"
      title="Terms of Service"
      intro="These starter terms describe how patients and caregivers are expected to use the JUNO portal while the product moves toward formal legal review and production launch readiness."
      effectiveDate="March 15, 2026"
      sections={TERMS_SECTIONS}
      emphasis={{
        icon: <FileText className="h-5 w-5" />,
        title: "Use with care",
        body:
          "Portal access helps users manage records, queues, and appointments, but urgent medical needs still require direct contact with emergency services or the appropriate facility.",
      }}
    />
  );
}

export function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Privacy overview"
      title="Privacy Policy"
      intro="This placeholder policy explains the kinds of patient and account information JUNO may handle so the product has a credible, navigable legal destination until approved policy text is supplied."
      effectiveDate="March 15, 2026"
      sections={PRIVACY_SECTIONS}
      emphasis={{
        icon: <LockKeyhole className="h-5 w-5" />,
        title: "Privacy by design",
        body:
          "Health data deserves stricter handling than ordinary app data. The final policy should describe retention, access controls, patient rights, and incident-response commitments in production-ready detail.",
      }}
    />
  );
}
