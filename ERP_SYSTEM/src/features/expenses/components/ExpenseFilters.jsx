import { RotateCcw, Search } from "lucide-react";

const fieldCls =
  "w-full rounded-lg border border-ink-400/20 bg-white px-3 py-1.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

export default function ExpenseFilters({
  draft,
  cashboxes = [],
  cashMovementTypes = [],
  expenseAccounts = [],
  onChange,
  onSearch,
  onReset,
}) {
  const set = (key) => (e) =>
    onChange({
      ...draft,
      [key]: e.target.value,
    });

  const setBoolean = (key) => (e) =>
    onChange({
      ...draft,
      [key]: e.target.checked,
    });

  return (
    <div className="mb-4 rounded-2xl border border-ink-400/10 bg-white p-4 shadow-card">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">بحث</span>
          <input
            className={fieldCls}
            placeholder="رقم السند / وصف / مرجع"
            value={draft.search}
            onChange={set("search")}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">رقم السند</span>
          <input
            className={fieldCls}
            placeholder="رقم السند"
            value={draft.voucherNumber}
            onChange={set("voucherNumber")}
          />
        </label>

        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">الخزينة</span>
          <select
            className={fieldCls}
            value={draft.cashboxId}
            onChange={set("cashboxId")}
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
            value={draft.cashMovementTypeId}
            onChange={set("cashMovementTypeId")}
          >
            <option value="">الكل</option>
            {cashMovementTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">حساب المصروف</span>
          <select
            className={fieldCls}
            value={draft.accountId}
            onChange={set("accountId")}
          >
            <option value="">كل الحسابات</option>
            {expenseAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.code} - {account.name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex cursor-pointer items-end gap-2 pb-1 text-sm">
          <input
            type="checkbox"
            checked={draft.includeSubAccounts}
            onChange={setBoolean("includeSubAccounts")}
            className="h-4 w-4 rounded border-ink-400/30 text-primary-500 focus:ring-primary-500"
          />
          <span className="font-medium text-ink-500">
            تضمين الحسابات الفرعية
          </span>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">من تاريخ</span>
          <input
            type="date"
            className={fieldCls}
            value={draft.fromDate}
            onChange={set("fromDate")}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">إلى تاريخ</span>
          <input
            type="date"
            className={fieldCls}
            value={draft.toDate}
            onChange={set("toDate")}
          />
        </label>

        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">الحالة</span>
          <select
            className={fieldCls}
            value={draft.isDraft}
            onChange={set("isDraft")}
          >
            <option value="">الكل</option>
            <option value="false">معتمد</option>
            <option value="true">مسودة</option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-400/20 px-3 py-1.5 text-sm text-ink-400 transition hover:bg-ink-400/5 hover:text-ink-900"
        >
          <RotateCcw size={14} />
          إعادة تعيين
        </button>

        <button
          type="button"
          onClick={onSearch}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          <Search size={14} />
          بحث
        </button>
      </div>
    </div>
  );
}
