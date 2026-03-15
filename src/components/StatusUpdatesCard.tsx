import {Bell,ArrowUp, Clock, ClipboardCheck, Check} from "lucide-react";

type StatusUpdateType = "position" | "wait_time" | "called" | "status" | "info";

interface StatusUpdate {
  id:    string;
  type:  StatusUpdateType;
  title: string;
  body:  string;
  time:  number;
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)   return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min${Math.floor(s / 60) !== 1 ? "s" : ""} ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

const UPDATE_STYLE: Record<StatusUpdateType, {
  Icon: React.ElementType; iconBg: string; iconColor: string;
  accent: string; cardBg: string;
}> = {
  position:  { Icon: ArrowUp,        iconBg: "bg-green-100",  iconColor: "text-green-600",  accent: "border-green-500",  cardBg: "bg-green-50"  },
  wait_time: { Icon: Clock,          iconBg: "bg-blue-100",   iconColor: "text-blue-600",   accent: "border-blue-500",   cardBg: "bg-blue-50"   },
  called:    { Icon: ClipboardCheck, iconBg: "bg-purple-100", iconColor: "text-purple-600", accent: "border-purple-500", cardBg: "bg-purple-50" },
  status:    { Icon: ClipboardCheck, iconBg: "bg-purple-100", iconColor: "text-purple-600", accent: "border-purple-500", cardBg: "bg-purple-50" },
  info:      { Icon: Check,          iconBg: "bg-gray-200",   iconColor: "text-gray-600",   accent: "border-gray-300",   cardBg: "bg-gray-50"   },
};

export default function StatusUpdatesCard({ updates }: { updates: StatusUpdate[] }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
          <Bell className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Status Updates</h3>
          <p className="text-sm text-gray-500">Recent notifications</p>
        </div>
      </div>

      {updates.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No updates yet — you'll see live changes here.</p>
      ) : (
        <div className="space-y-3">
          {updates.map((u) => {
            const s = UPDATE_STYLE[u.type];
            return (
              <div key={u.id} className={`flex items-start gap-3 p-4 ${s.cardBg} rounded-xl border-l-4 ${s.accent}`}>
                <div className={`w-9 h-9 rounded-lg ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <s.Icon className={`w-4 h-4 ${s.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="font-semibold text-gray-800 text-sm">{u.title}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">{timeAgo(u.time)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{u.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}