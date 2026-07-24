import CompactSelect from "../../../shared/components/ui/CompactSelect";

export default function TreasuryFilters({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  const typeOptions = [
    { value: "all", label: "الكل" },
    { value: "in", label: "إيداع / تحصيل (وارد)" },
    { value: "out", label: "صرف / مصروفات (صادر)" },
  ];

  const fieldInputCls =
    "w-full h-[38px] rounded-lg border border-ink-400/15 px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-shadow placeholder:text-ink-400/50";

  const fieldLabelCls = "text-xs font-medium text-ink-600 mb-1.5 block";

  return (
    <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
        <div className="w-full">
          <label className={fieldLabelCls}>التاريخ</label>
          <input
            type="date"
            value={filters?.date || ""}
            onChange={(e) => set("date", e.target.value)}
            className={fieldInputCls}
          />
        </div>

        <div className="w-full">
          <label className={fieldLabelCls}>بحث (الجهة / البيان / رقم المرجع)</label>
          <input
            type="text"
            placeholder="ابحث هنا..."
            value={filters?.search || ""}
            onChange={(e) => set("search", e.target.value)}
            className={fieldInputCls}
          />
        </div>

        <div className="w-full">
          <label className={fieldLabelCls}>نوع الحركة</label>
          <CompactSelect
            options={typeOptions}
            value={filters?.type || "all"}
            onChange={(val) => set("type", val || "all")}
            placeholder="اختر النوع"
          />
        </div>
      </div>
    </div>
  );
}