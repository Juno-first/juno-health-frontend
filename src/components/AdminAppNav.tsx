import { useNavigate, useLocation } from "react-router-dom";
import {
  Activity, LayoutDashboard, ListOrdered, Building2,
  Users, BarChart3, Settings, LogOut, Bell, ShieldAlert,
} from "lucide-react";

// ── Nav definition ────────────────────────────────────────────────────────────

export const ADMIN_BOTTOM_NAV_ITEMS = [
  { id: "overview",  label: "Overview",  Icon: LayoutDashboard, path: "/admin/dashboard" },
  { id: "queue",     label: "Queue",     Icon: ListOrdered,     path: "/admin/queue"     },
  { id: "depts",     label: "Depts",     Icon: Building2,       path: "/admin/departments"},
  { id: "staff",     label: "Staff",     Icon: Users,           path: "/admin/staff"     },
  { id: "reports",   label: "Reports",   Icon: BarChart3,       path: "/admin/reports"   },
];

export const ADMIN_SIDEBAR_NAV_ITEMS = [
  { id: "overview",    label: "Overview",       Icon: LayoutDashboard, path: "/admin/dashboard"    },
  { id: "queue",       label: "Queue Monitor",  Icon: ListOrdered,     path: "/admin/queue"        },
  { id: "depts",       label: "Departments",    Icon: Building2,       path: "/admin/departments"  },
  { id: "staff",       label: "Staff",          Icon: Users,           path: "/admin/staff"        },
  { id: "reports",     label: "Analytics",      Icon: BarChart3,       path: "/admin/reports"      },
];

// ── Admin Bottom Nav ──────────────────────────────────────────────────────────

export function AdminBottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{ background: "#1A1F2E", borderColor: "#2A3142", boxShadow: "0 -4px 20px rgba(0,0,0,.4)" }}
    >
      <div className="flex items-center justify-around px-2 py-3">
        {ADMIN_BOTTOM_NAV_ITEMS.map(({ id, label, Icon, path }) => {
          const active = pathname === path || pathname.startsWith(path);
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all"
              style={{ color: active ? "var(--color-juno-green)" : "#9CA3AF" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                style={{ background: active ? "rgba(0,112,60,0.1)" : "transparent" }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ── Admin Sidebar ─────────────────────────────────────────────────────────────

interface AdminSidebarProps {
  user?: { name: string; role: string; initials: string };
  alertCount?: number;
}

export function AdminSidebar({
  user = { name: "Dr. Sarah Mitchell", role: "Department Head", initials: "SM" },
  alertCount = 0,
}: AdminSidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside
      className="hidden lg:flex flex-col w-72 flex-shrink-0"
      style={{
        background: "linear-gradient(180deg, #0A1628 0%, #0F2040 100%)",
        boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
      }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--color-juno-green) 0%, #059669 100%)",
              boxShadow: "0 10px 30px -5px rgba(0,112,60,.4)",
            }}
          >
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1
              className="text-2xl font-black text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              JUNO
            </h1>
            <div className="flex items-center gap-1.5">
              <ShieldAlert size={11} className="text-amber-400" />
              <p className="text-xs text-amber-400 font-semibold">Staff Portal</p>
            </div>
          </div>
        </div>

        {/* Staff card */}
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
               style={{ background: "linear-gradient(135deg,#00703C,#059669)", color: "white" }}>
            {user.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white truncate">{user.name}</p>
            <p className="text-xs text-white/50">{user.role}</p>
          </div>
          {alertCount > 0 && (
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{alertCount > 9 ? "9+" : alertCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 overflow-y-auto space-y-1">
        {ADMIN_SIDEBAR_NAV_ITEMS.map(({ id, label, Icon, path }) => {
          const active = pathname === path || pathname.startsWith(path);
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left"
              style={{
                background: active ? "rgba(0,112,60,0.25)" : "transparent",
                color:      active ? "#4ADE80" : "rgba(255,255,255,0.6)",
                borderLeft: active ? "3px solid #00703C" : "3px solid transparent",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{label}</span>
              {id === "queue" && alertCount > 0 && (
                <span className="ml-auto text-xs font-bold bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-1">
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
          style={{ color: "rgba(255,255,255,0.5)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          <Bell className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Notifications</span>
        </button>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
          style={{ color: "rgba(255,255,255,0.5)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
          style={{ color: "rgba(239,68,68,0.7)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}