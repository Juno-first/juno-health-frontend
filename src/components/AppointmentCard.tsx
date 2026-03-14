import { CalendarDays, Clock, type LucideIcon } from "lucide-react";

type AppointmentAction = {
  label: string;
  Icon: LucideIcon;
  color: string;
};

type Appointment = {
  id: number;
  name: string;
  sub: string;
  badge: string;
  badgeColor: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  Icon: LucideIcon;
  date: string;
  time: string;
  action: AppointmentAction;
  secondary: string;
};

type AppointmentCardProps = {
  apt: Appointment;
};

export default function AppointmentCard({ apt }: AppointmentCardProps) {
  const { Icon } = apt;

  return (
    <div
      className={`bg-white rounded-2xl p-4 border-l-4 ${apt.borderColor} transition-all hover:shadow-md`}
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,.03)" }}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl ${apt.iconBg} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`w-6 h-6 ${apt.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-bold text-gray-800 text-sm">{apt.name}</h4>
              <p className="text-sm text-gray-600">{apt.sub}</p>
            </div>

            <span
              className={`px-3 py-1 text-xs font-semibold rounded-lg flex-shrink-0 ml-2 ${apt.badgeColor}`}
            >
              {apt.badge}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center gap-1">
              <CalendarDays
                className="w-3.5 h-3.5"
                style={{ color: "var(--color-juno-green)" }}
              />
              {apt.date}
            </span>

            <span className="flex items-center gap-1">
              <Clock
                className="w-3.5 h-3.5"
                style={{ color: "var(--color-juno-green)" }}
              />
              {apt.time}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`flex-1 text-white text-sm font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${apt.action.color}`}
            >
              <apt.action.Icon className="w-3.5 h-3.5" />
              {apt.action.label}
            </button>

            <button
              type="button"
              className="px-4 bg-gray-100 text-gray-700 text-sm font-semibold py-2 rounded-lg hover:bg-gray-200 transition-all"
            >
              {apt.secondary}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
