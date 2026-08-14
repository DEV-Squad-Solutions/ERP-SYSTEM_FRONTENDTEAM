import { RotateCcw, Search } from "lucide-react";

const fieldCls =
  "w-full rounded-lg border border-ink-400/20 bg-white px-3 py-1.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

export default function ContainerStoreFilters({
  draft,
  containers = [],
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
            placeholder="فاتورة / عبوة / وصف"
            value={draft.Search}
            onChange={set("Search")}
          />
        </label>

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

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">رقم الفاتورة</span>
          <input
            className={fieldCls}
            value={draft.InvoiceNumber}
            onChange={set("InvoiceNumber")}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">نوع الفاتورة</span>
          <select
            className={fieldCls}
            value={draft.InvoiceType}
            onChange={set("InvoiceType")}
          >
            <option value="">الكل</option>
            <option value="Sales">بيع</option>
            <option value="Purchase">شراء</option>
            <option value="SalesReturn">مرتجع بيع</option>
            <option value="PurchaseReturn">مرتجع شراء</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">الاتجاه</span>
          <select
            className={fieldCls}
            value={draft.Direction}
            onChange={set("Direction")}
          >
            <option value="">الكل</option>
            <option value="Outgoing">صادر</option>
            <option value="Incoming">وارد</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">العبوة</span>
          <select
            className={fieldCls}
            value={draft.ContainerId}
            onChange={set("ContainerId")}
          >
            <option value="">كل العبوات</option>
            {containers.map((c) => (
              <option key={c.containerId} value={c.containerId}>
                {c.containerCode} - {c.containerName}
              </option>
            ))}
          </select>
        </label>
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
