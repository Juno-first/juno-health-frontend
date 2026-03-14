type DoctorSummaryTag = {
  label: string;
  color: string;
};

type DoctorSummary = {
  id: number;
  name: string;
  role: string;
  initials: string;
  avatarBg: string;
  when: string;
  note: string;
  tags: DoctorSummaryTag[];
};

type DoctorSummaryCardProps = {
  doc: DoctorSummary;
};

export default function DoctorSummaryCard({
  doc,
}: DoctorSummaryCardProps) {
  return (
    <div
      className="bg-white rounded-2xl p-4 transition-all hover:shadow-md"
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,.03)" }}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${doc.avatarBg}`}
        >
          {doc.initials}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-bold text-gray-800 text-sm">{doc.name}</h4>
              <p className="text-sm text-gray-600">{doc.role}</p>
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {doc.when}
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 mb-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              {doc.note}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {doc.tags.map((t: DoctorSummaryTag) => (
              <span
                key={t.label}
                className={`px-2 py-1 text-xs font-semibold rounded ${t.color}`}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
