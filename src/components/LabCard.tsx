import { CalendarDays, Check, FileText, Hourglass, type LucideIcon } from "lucide-react";

type LabResult = {
  id: number;
  name: string;
  lab: string;
  status: string;
  statusColor: string;
  iconBg: string;
  iconColor: string;
  Icon: LucideIcon;
  date: string;
  note: string | null;
  ready: boolean;
};

type LabCardProps = {
  lab: LabResult;
};

export default function LabCard({ lab }: LabCardProps) {
  const { Icon } = lab;

  return (
    <div
      className="bg-white rounded-2xl p-4 transition-all hover:shadow-md"
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,.03)" }}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl ${lab.iconBg} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`w-6 h-6 ${lab.iconColor}`} />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-bold text-gray-800 text-sm">{lab.name}</h4>
              <p className="text-sm text-gray-600">{lab.lab}</p>
            </div>

            <span
              className={`px-3 py-1 text-xs font-semibold rounded-lg flex-shrink-0 ml-2 flex items-center gap-1 ${lab.statusColor}`}
            >
              {lab.ready ? (
                <Check className="w-3 h-3" />
              ) : (
                <Hourglass className="w-3 h-3" />
              )}
              {lab.status}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <CalendarDays
              className="w-3.5 h-3.5"
              style={{ color: "var(--color-juno-green)" }}
            />
            {lab.date}
          </div>

          {lab.note && <p className="text-xs text-gray-500 mb-0">{lab.note}</p>}

          {lab.ready && (
            <button
              type="button"
              className="w-full text-white text-sm font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-1 mt-1"
              style={{ background: "var(--color-juno-green)" }}
            >
              <FileText className="w-3.5 h-3.5" /> View Results
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
