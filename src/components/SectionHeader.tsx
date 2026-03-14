type SectionHeaderProps = {
  title: string;
  onViewAll?: () => void;
};

export default function SectionHeader({
  title,
  onViewAll,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <button
        type="button"
        onClick={onViewAll}
        className="text-sm font-semibold hover:underline"
        style={{ color: "var(--color-juno-green)" }}
      >
        View All
      </button>
    </div>
  );
}
