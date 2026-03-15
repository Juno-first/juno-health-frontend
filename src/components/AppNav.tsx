import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { RootState } from "../store";
import {
  Activity, House, FolderOpen, ShieldAlert,
  Hospital, User, Pill, FlaskConical, Bot,
  Settings, CircleHelp, Phone, LogOut, BarChart2, TriangleAlert,
} from "lucide-react";
import PWAInstallBanner from "./PWAInstallBanner";
import { useAppSelector } from "../store/hooks/hooks";
import { useLogout } from "../store/hooks/useLogout";

// ── Nav definition ────────────────────────────────────────────────────────────
export const BOTTOM_NAV_ITEMS = [
  { id: "home",            label: "Home",      Icon: House,       path: "/dashboard"       },
  { id: "emergency-watch", label: "Emergency", Icon: ShieldAlert, path: "/emergency-watch" },
  { id: "er-queue",        label: "ER Queue",  Icon: Hospital,    path: "/er-queue"        },
  { id: "profile",         label: "Profile",   Icon: User,        path: "/profile"         },
];

export const SIDEBAR_NAV_ITEMS = [
  { id: "home",             label: "Home",             Icon: House,       path: "/dashboard"        },
  { id: "records",          label: "Medical Records",  Icon: FolderOpen,  path: "/records"          },
  { id: "emergency-watch",  label: "Emergency Watch",  Icon: ShieldAlert, path: "/emergency-watch"  },
  { id: "meds",             label: "Medications",      Icon: Pill,        path: "/medications"      },
  { id: "labs",             label: "Lab Results",      Icon: FlaskConical,path: "/labs"             },
  { id: "er-queue",         label: "ER Queue",         Icon: Hospital,    path: "/er-queue"         },
  { id: "medbot",           label: "Ask MedBot",       Icon: Bot,         path: "/medbot"           },
  { id: "queue-analytics",  label: "Queue Analytics",  Icon: BarChart2,   path: "/admin/analytics"  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(firstName?: string, lastName?: string, fallback = "?"): string {
  const first = firstName?.trim()[0] ?? "";
  const last  = lastName?.trim()[0]  ?? "";
  return (first + last).toUpperCase() || fallback.toUpperCase();
}

function getDisplayId(user: NonNullable<RootState["user"]["user"]>): string {
  if (user.accountType === "PATIENT") return `Patient ID: ${user.patientId}`;
  return `${user.staffRole} · ${user.staffId}`;
}

function MobileLogoutConfirm({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="lg:hidden fixed inset-0 z-[60] flex items-end"
      style={{ background: "rgba(15, 23, 42, 0.36)" }}
      onClick={onCancel}
    >
      <div
        className="w-full rounded-t-[2rem] bg-white px-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] pt-4 shadow-[0_-18px_48px_-20px_rgba(15,23,42,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200" />
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <TriangleAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Log out of JUNO?</h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              You will need to sign in again to access your records and queue updates.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95"
            style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Shared Bottom Nav (mobile) ────────────────────────────────────────────────
export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const handleLogout = useLogout();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
      <PWAInstallBanner />
      <MobileLogoutConfirm
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          handleLogout();
        }}
      />
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
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="nav-tab text-red-500 hover:text-red-600"
          >
            <div className="nav-tab-icon">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Log Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}

// ── Shared Sidebar (desktop) ──────────────────────────────────────────────────
export function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const handleLogout = useLogout();

  const user = useAppSelector((state: RootState) => state.user.user);

  const initials  = user ? getInitials(user.firstName, user.lastName, user.fullName) : "?";
  const fullName  = user?.fullName  ?? "Guest";
  const displayId = user ? getDisplayId(user) : "";

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
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{fullName}</p>
            <p className="text-xs text-gray-500 truncate">{displayId}</p>
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

        {/* Settings / Help / Logout */}
        <div className="pt-5 border-t border-gray-100 space-y-1">
          <button className="dash-nav-item">
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">Settings</span>
          </button>
          <button className="dash-nav-item">
            <CircleHelp className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">Help &amp; Support</span>
          </button>
          <button
            onClick={handleLogout}
            className="dash-nav-item text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-semibold">Log Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
