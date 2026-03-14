import { Check, Clock, CheckCircle2, Pill } from "lucide-react";

type Medication = {
  id: number;
  name: string;
  dose: string;
  time: string;
  timeColor: string;
  iconBg: string;
  iconColor: string;
  done: boolean;
};

type MedicationCardProps = {
  med: Medication;
  onTaken: (id: number) => void;
  onSkip: (id: number) => void;
};

export default function MedicationCard({
  med,
  onTaken,
  onSkip,
}: MedicationCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl p-4 transition-all ${
        med.done ? "opacity-60" : ""
      }`}
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,.03)" }}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl ${med.iconBg} flex items-center justify-center flex-shrink-0`}
        >
          <Pill className={`w-6 h-6 ${med.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-bold text-gray-800">{med.name}</h4>
              <p className="text-sm text-gray-600">{med.dose}</p>
            </div>

            <span
              className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 flex-shrink-0 ml-2 ${med.timeColor}`}
            >
              <Clock className="w-3 h-3" /> {med.time}
            </span>
          </div>

          {med.done ? (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Completed today</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onTaken(med.id)}
                className="flex-1 text-white text-sm font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-1"
                style={{ background: "var(--color-juno-green)" }}
              >
                <Check className="w-3.5 h-3.5" /> Mark as Taken
              </button>

              <button
                type="button"
                onClick={() => onSkip(med.id)}
                className="px-4 bg-gray-100 text-gray-700 text-sm font-semibold py-2 rounded-lg hover:bg-gray-200 transition-all"
              >
                Skip
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
