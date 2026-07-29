import CompactSelect from "../../../shared/components/ui/CompactSelect";

export default function PayrollFilters({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  const fieldInputCls =
    "w-full h-[38px] rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-shadow";
  const fieldLabelCls = "text-xs font-semibold text-slate-700 mb-1 block";

  return (
    <div className="bg-slate-200/50 backdrop-blur-sm rounded-xl border border-slate-300/40 p-3 mb-4 print:hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
        <div>
          <label className={fieldLabelCls}>بحث باسم الموظف / الكود</label>
          <input
            type="text"
            placeholder="اكتب اسم الموظف..."
            value={filters?.search || ""}
            onChange={(e) => set("search", e.target.value)}
            className={fieldInputCls}
          />
        </div>

        <div>
          <label className={fieldLabelCls}>تاريخ بداية الفترة (من)</label>
          <input
            type="date"
            value={filters?.fromDate || ""}
            onChange={(e) => set("fromDate", e.target.value)}
            className={fieldInputCls}
          />
        </div>

        <div>
          <label className={fieldLabelCls}>تاريخ نهاية الفترة (إلى)</label>
          <input
            type="date"
            value={filters?.toDate || ""}
            onChange={(e) => set("toDate", e.target.value)}
            className={fieldInputCls}
          />
        </div>
      </div>
    </div>
  );
}