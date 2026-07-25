import CompactSelect from "../../../shared/components/ui/CompactSelect";
import { useGetPartiesSelectQuery } from "../../partners/partiesApi";

export default function TreasuryFilters({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  // جلب العملاء والموردين من الـ API
  const { data: partiesData = [], isLoading: isPartiesLoading } = useGetPartiesSelectQuery();

  // تحضير خيارات اسم الحساب (عميل/مورد)
  const partnerOptions = [
    { value: "", label: "جميع الحسابات" },
    ...(partiesData?.map((p) => ({
      value: String(p.id || p.value),
      label: p.name || p.label || p.text,
    })) || []),
  ];

  const typeOptions = [
    { value: "all", label: "الكل" },
    { value: "in", label: "مدين (إيداع)" },
    { value: "out", label: "دائن (صرف)" },
  ];

  const fieldLabelCls = "text-xs font-semibold text-slate-700 mb-1 block";

  return (
    <div className="bg-slate-200/50 backdrop-blur-sm rounded-xl border border-slate-300/40 p-3 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        {/* نوع الحركة */}
        <div className="relative z-30">
          <label className={fieldLabelCls}>نوع الحركة</label>
          <CompactSelect
            options={typeOptions}
            value={filters?.type || "all"}
            onChange={(val) => set("type", val || "all")}
            placeholder="الكل"
          />
        </div>

        {/* اسم الحساب (عميل / مورد) */}
        <div className="relative z-20">
          <label className={fieldLabelCls}>اسم الحساب (العميل / المورد)</label>
          <CompactSelect
            options={partnerOptions}
            value={filters?.partnerId || ""}
            onChange={(val) => set("partnerId", val || "")}
            placeholder={isPartiesLoading ? "جاري التحميل..." : "اختر اسم الحساب"}
          />
        </div>
      </div>
    </div>
  );
}