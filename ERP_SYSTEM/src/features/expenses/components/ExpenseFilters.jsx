import { RotateCcw, Search } from "lucide-react";

const fieldCls =
  "w-full rounded-lg border border-ink-400/20 bg-white px-3 py-1.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

/**
 * @param {{
 *   draft: object,
 *   cashboxes: Array,
 *   cashMovementTypes: Array,
 *   onChange: (value: object) => void,
 *   onSearch: () => void,
 *   onReset: () => void
 * }} props
 */
export default function ExpenseFilters({
  draft,
  cashboxes = [],
  cashMovementTypes = [],
  onChange,
  onSearch,
  onReset,
}) {
  const set = (key) => (e) => onChange({ ...draft, [key]: e.target.value });

  return (
    <div className="mb-4 rounded-2xl border border-ink-400/10 bg-white p-4 shadow-card">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">بحث</span>
          <input
            className={fieldCls}
            placeholder="رقم السند / وصف / مرجع"
            value={draft.Search}
            onChange={set("Search")}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">رقم السند</span>
          <input
            className={fieldCls}
            value={draft.VoucherNumber}
            onChange={set("VoucherNumber")}
          />
        </label>

        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">الخزينة</span>
          <select
            className={fieldCls}
            value={draft.CashboxId}
            onChange={set("CashboxId")}
          >
            <option value="">الكل</option>
            {cashboxes.map((cb) => (
              <option key={cb.id} value={cb.id}>
                {cb.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">نوع الحركة</span>
          <select
            className={fieldCls}
            value={draft.CashMovementTypeId}
            onChange={set("CashMovementTypeId")}
          >
            <option value="">الكل</option>
            {cashMovementTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">من تاريخ</span>
          <input
            type="date"
            className={fieldCls}
            value={draft.FromDate}
            onChange={set("FromDate")}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">إلى تاريخ</span>
          <input
            type="date"
            className={fieldCls}
            value={draft.ToDate}
            onChange={set("ToDate")}
          />
        </label>

        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">الحالة</span>
          <select
            className={fieldCls}
            value={draft.IsDraft}
            onChange={set("IsDraft")}
          >
            <option value="">الكل</option>
            <option value="false">معتمد</option>
            <option value="true">مسودة</option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-400/20 px-3 py-1.5 text-sm text-ink-400 hover:text-ink-900"
        >
          <RotateCcw size={14} />
          إعادة تعيين
        </button>
        <button
          onClick={onSearch}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          <Search size={14} />
          بحث
        </button>
      </div>
    </div>
  );
}
