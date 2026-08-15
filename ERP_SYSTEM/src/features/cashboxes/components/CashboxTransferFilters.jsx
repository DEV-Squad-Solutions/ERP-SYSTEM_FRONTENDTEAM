import { RotateCcw, Search } from "lucide-react";
import CompactSelect from "../../../shared/components/ui/CompactSelect"; // عدّل المسار حسب مكانه عندك
import { useGetCashboxOptionsQuery } from "../cashboxesApi"; // عدّل المسار/اسم الهوك حسب اللي عندك

const fieldCls =
  "w-full rounded-lg border border-ink-400/20 bg-white px-3 py-1.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

export default function CashboxTransferFilters({
  draft,
  onChange,
  onSearch,
  onReset,
}) {
  const { data: cashboxes = [] } = useGetCashboxOptionsQuery();

  const set = (key) => (e) => onChange({ ...draft, [key]: e.target.value });
  const setSelect = (key) => (value) => onChange({ ...draft, [key]: value });

  return (
    <div className="mb-4 rounded-2xl border border-ink-400/10 bg-white p-4 shadow-card">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">بحث</span>
          <input
            className={fieldCls}
            placeholder="رقم التحويل"
            value={draft.Search}
            onChange={set("Search")}
          />
        </label>

        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">من خزينة</span>
          <CompactSelect
            options={cashboxes.map((c) => ({
              value: String(c.id),
              label: c.name,
            }))}
            value={draft.SourceCashboxId}
            onChange={setSelect("SourceCashboxId")}
            placeholder="الكل"
          />
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink-400">إلى خزينة</span>
          <CompactSelect
            options={cashboxes.map((c) => ({
              value: String(c.id),
              label: c.name,
            }))}
            value={draft.DestinationCashboxId}
            onChange={setSelect("DestinationCashboxId")}
            placeholder="الكل"
          />
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
