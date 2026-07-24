import Input from "../../../shared/components/ui/Input";

export default function TreasuryFilters({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          type="date"
          label="التاريخ"
          value={filters?.date || ""}
          onChange={(e) => set("date", e.target.value)}
        />
        <Input
          label="بحث (الجهة / البيان / رقم المرجع)"
          value={filters?.search || ""}
          onChange={(e) => set("search", e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ink-600">نوع الحركة</label>
          <select
            value={filters?.type || "all"}
            onChange={(e) => set("type", e.target.value)}
            className="w-full rounded-lg border border-ink-400/15 px-3 py-2 text-sm focus:outline-none focus:border-primary-500 bg-white"
          >
            <option value="all">الكل</option>
            <option value="in">إيداع / تحصيل (وارد)</option>
            <option value="out">صرف / مصروفات (صادر)</option>
          </select>
        </div>
      </div>
    </div>
  );
}