import { useNavigate, useLocation } from "react-router-dom";
import {
  Activity, House, FolderOpen, CalendarDays,
  Hospital, User, Pill, FlaskConical, Bot,
  Settings, CircleHelp, Phone,
} from "lucide-react";
import PWAInstallBanner from "./PWAInstallBanner";

// ── Nav definition ────────────────────────────────────────────────────────────
export const BOTTOM_NAV_ITEMS = [
  { id: "home",     label: "Home",     Icon: House,        path: "/dashboard" },
  { id: "records",  label: "Records",  Icon: FolderOpen,   path: "/records"   },
  { id: "schedule", label: "Schedule", Icon: CalendarDays, path: "/schedule"  },
  { id: "er-queue", label: "ER Queue", Icon: Hospital,     path: "/er-queue"  },
  { id: "profile",  label: "Profile",  Icon: User,         path: "/profile"   },
];

export const SIDEBAR_NAV_ITEMS = [
  { id: "home",      label: "Home",                 Icon: House,        path: "/dashboard" },
  { id: "records",   label: "Medical Records",       Icon: FolderOpen,   path: "/records"   },
  { id: "schedule",  label: "Appointments",          Icon: CalendarDays, path: "/schedule"  },
  { id: "meds",      label: "Medications",           Icon: Pill,         path: "/medications"},
  { id: "labs",      label: "Lab Results",           Icon: FlaskConical, path: "/labs"      },
  { id: "er-queue",  label: "ER Queue",              Icon: Hospital,     path: "/er-queue"  },
  { id: "medbot",    label: "Ask MedBot",            Icon: Bot,          path: "/medbot"    },
];

// ── Shared Bottom Nav (mobile) ────────────────────────────────────────────────
export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <>
      <PWAInstallBanner />
      <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50"
      style={{ boxShadow: "0 -4px 12px rgba(0,0,0,.06)" }}
    >
      <div className="flex items-center justify-around px-4 py-3">
        {BOTTOM_NAV_ITEMS.map(({ id, label, Icon, path }) => {
          const active = pathname === path || (path !== "/dashboard" && pathname.startsWith(path));
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`nav-tab ${active ? "active" : ""}`}
            >
              <div className="nav-tab-icon">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
    </>
  );
}

// ── Shared Sidebar (desktop) ──────────────────────────────────────────────────
export function Sidebar({ user = { name: "Michael Johnson", id: "JM-8472", initials: "MJ" } }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside
      className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 flex-shrink-0"
      style={{ boxShadow: "0 4px 20px -2px rgba(0,0,0,.05)" }}
    >
      {/* Logo + user card */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--color-juno-green) 0%, #059669 100%)",
              boxShadow: "0 10px 30px -5px rgba(0,112,60,.15)",
            }}
          >
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1
              className="text-2xl font-black text-gray-900"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              JUNO
            </h1>
            <p className="text-xs text-gray-500">Healthcare Intelligence</p>
          </div>
        </div>
        {/* User card */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-blue-200 flex items-center justify-center flex-shrink-0 font-bold text-blue-800 text-sm">
            {user.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500">Patient ID: {user.id}</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 overflow-y-auto space-y-1">
        {SIDEBAR_NAV_ITEMS.map(({ id, label, Icon, path }) => {
          const active = pathname === path || (path !== "/dashboard" && pathname.startsWith(path));
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`dash-nav-item ${active ? "active" : ""}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{label}</span>
            </button>
          );
        })}

        {/* Emergency SOS */}
        <div className="pt-5 mt-1 border-t border-gray-100">
          <button className="dash-nav-item relative overflow-hidden bg-red-50 text-red-600 hover:bg-red-100 font-semibold">
            <div className="pulse-ring absolute inset-0 rounded-xl bg-red-200" />
            <Phone className="w-5 h-5 relative z-10 flex-shrink-0" />
            <span className="text-sm relative z-10">Emergency SOS</span>
          </button>
        </div>

        {/* Settings / Help */}
        <div className="pt-5 border-t border-gray-100 space-y-1">
          <button className="dash-nav-item">
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">Settings</span>
          </button>
          <button className="dash-nav-item">
            <CircleHelp className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">Help &amp; Support</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}