import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";

export default function TreasuryFilters({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  const typeOptions = [
    { value: "in", label: "إيداع / تحصيل (وارد)" },
    { value: "out", label: "صرف / مصروفات (صادر)" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div className="w-full">
          <Input
            type="date"
            label="التاريخ"
            value={filters?.date || ""}
            onChange={(e) => set("date", e.target.value)}
          />
        </div>

        <div className="w-full">
          <Input
            label="بحث (الجهة / البيان / رقم المرجع)"
            value={filters?.search || ""}
            onChange={(e) => set("search", e.target.value)}
          />
        </div>

        <div className="w-full flex flex-col justify-end">
          <label className="text-xs font-medium text-ink-600 mb-1.5 block">
            نوع الحركة
          </label>
          <CompactSelect
            options={typeOptions}
            value={filters?.type === "all" ? "" : filters?.type}
            onChange={(val) => set("type", val || "all")}
            placeholder="الكل"
          />
        </div>
      </div>
    </div>
  );
}