import { Building2, Clock,
  Info,
  Stethoscope, Bed, PersonStanding,Hospital,
} from "lucide-react";
import type { QueueStatus } from "../schemas/queue.schema";

const DEPT_STATS = [
  { label: "Physicians", value: "4",  Icon: Stethoscope,    bg: "bg-green-50",  border: "border-green-200",  val: "text-green-700"  },
  { label: "Nurses",     value: "12", Icon: PersonStanding, bg: "bg-purple-50", border: "border-purple-200", val: "text-purple-700" },
  { label: "Rooms",      value: "3",  Icon: Bed,            bg: "bg-orange-50", border: "border-orange-200", val: "text-orange-700" },
  { label: "Avg Wait",   value: "52", Icon: Clock,          bg: "bg-red-50",    border: "border-red-200",    val: "text-red-700"    },
];

export default function DepartmentCard({ data }: { data: QueueStatus }) {
  const stats = [
    ...DEPT_STATS.slice(0, 3),
    { ...DEPT_STATS[3], value: String(data.estimatedWaitMinutes) },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Department Information</h3>
          <p className="text-sm text-gray-500">Emergency Room details</p>
        </div>
      </div>

      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Hospital className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <div className="font-semibold text-gray-800 mb-0.5">{data.facilityName}</div>
          <div className="text-sm text-gray-600 mb-0.5">{data.departmentName}</div>
          <div className="text-xs text-gray-500">North Street, Kingston, Jamaica</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {stats.map(({ label, value, bg, border, val, Icon }) => (
          <div key={label} className={`p-3 ${bg} rounded-xl border ${border}`}>
            <Icon className={`w-4 h-4 ${val} mb-1.5`} />
            <div className={`text-2xl font-bold ${val}`}>{value}</div>
            <div className="text-xs text-gray-600 leading-tight">{label}</div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-2 mb-1">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-gray-800 text-sm">Department Status</span>
        </div>
        <p className="text-sm text-gray-700">
          Currently experiencing <span className="font-semibold text-blue-700">moderate volume</span>. All treatment areas are operational.
        </p>
      </div>
    </div>
  );
}
