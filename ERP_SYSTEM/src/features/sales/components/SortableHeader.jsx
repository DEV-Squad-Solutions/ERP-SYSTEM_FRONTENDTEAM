import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

/**
 * @param {{ label: string, field: string, sortBy: string, sortDir: "asc"|"desc", onSort: (field: string) => void }} props
 */
export default function SortableHeader({
  label,
  field,
  sortBy,
  sortDir,
  onSort,
}) {
  const isActive = sortBy === field;
  return (
    <th
      onClick={() => onSort(field)}
      className="p-3 font-medium border-b border-ink-400/10 cursor-pointer select-none hover:bg-ink-900/[0.04] transition-colors"
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive ? (
          sortDir === "asc" ? (
            <ArrowUp size={12} className="text-primary-500" />
          ) : (
            <ArrowDown size={12} className="text-primary-500" />
          )
        ) : (
          <ArrowUpDown size={12} className="text-ink-400/40" />
        )}
      </div>
    </th>
  );
}
