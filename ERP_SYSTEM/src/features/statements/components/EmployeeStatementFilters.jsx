// features/statements/components/EmployeeStatementFilters.jsx
import { Search, RotateCcw } from "lucide-react";

const SOURCE_TYPES = [
  { value: "", label: "الكل" },
  { value: "OpeningBalance", label: "رصيد افتتاحي" },
  { value: "SalaryTransfer", label: "تحويل راتب" },
  { value: "Movement", label: "حركة" },
  { value: "CashVoucher", label: "سند نقدي" },
];

const MOVEMENT_TYPES = [
  { value: "", label: "الكل" },
  { value: "Debit", label: "مدين" },
  { value: "Credit", label: "دائن" },
  { value: "Advance", label: "سلفة" },
  { value: "Deduction", label: "خصم" },
  { value: "Bonus", label: "مكافأة" },
  { value: "Withdrawal", label: "سحب" },
];

export default function EmployeeStatementFilters({
  draft,
  onChange,
  onSearch,
  onReset,
}) {
  const set = (key, value) => onChange({ ...draft, [key]: value });

  return (
    <div className="rounded-2xl border border-ink-400/10 bg-white/60 p-3 sm:p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label className="mb-1 block text-xs text-ink-400">بحث</label>
          <input
            type="text"
            value={draft.Search}
            onChange={(e) => set("Search", e.target.value)}
            placeholder="بحث برقم المستند أو الوصف..."
            className="h-9 w-full rounded-lg border border-ink-400/15 bg-white px-3 text-sm outline-none focus:border-primary-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-400">من تاريخ</label>
          <input
            type="date"
            value={draft.FromDate}
            onChange={(e) => set("FromDate", e.target.value)}
            className="h-9 w-full rounded-lg border border-ink-400/15 bg-white px-3 text-sm outline-none focus:border-primary-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-400">إلى تاريخ</label>
          <input
            type="date"
            value={draft.ToDate}
            onChange={(e) => set("ToDate", e.target.value)}
            className="h-9 w-full rounded-lg border border-ink-400/15 bg-white px-3 text-sm outline-none focus:border-primary-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-400">نوع المصدر</label>
          <select
            value={draft.SourceType}
            onChange={(e) => set("SourceType", e.target.value)}
            className="h-9 w-full rounded-lg border border-ink-400/15 bg-white px-3 text-sm outline-none focus:border-primary-500"
          >
            {SOURCE_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-400">نوع الحركة</label>
          <select
            value={draft.MovementType}
            onChange={(e) => set("MovementType", e.target.value)}
            className="h-9 w-full rounded-lg border border-ink-400/15 bg-white px-3 text-sm outline-none focus:border-primary-500"
          >
            {MOVEMENT_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs text-ink-400 hover:bg-ink-400/5 sm:text-sm"
        >
          <RotateCcw size={14} />
          إعادة تعيين
        </button>
        <button
          type="button"
          onClick={onSearch}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary-500 px-4 text-xs font-medium text-white hover:bg-primary-600 sm:text-sm"
        >
          <Search size={14} />
          بحث
        </button>
      </div>
    </div>
  );
}
