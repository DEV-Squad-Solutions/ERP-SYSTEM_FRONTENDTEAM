import CompactSelect from "../../../shared/components/ui/CompactSelect";
import { useGetPartiesSelectQuery } from "../../partners/partiesApi";

export default function BankFilters({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  const { data: partiesData = [], isLoading: isPartiesLoading } = useGetPartiesSelectQuery();

  const partnerOptions = [
    { value: "", label: "جميع الحسابات" },
    ...(partiesData?.map((p) => ({
      value: String(p.id || p.value),
      label: p.name || p.label || p.text,
    })) || []),
  ];

  const typeOptions = [
    { value: "all", label: "الكل" },
    { value: "in", label: "إيداع (مدين)" },
    { value: "out", label: "سحب / تحويل (دائن)" },
  ];

  const fieldInputCls =
    "w-full h-[38px] rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-shadow";
  const fieldLabelCls = "text-xs font-semibold text-slate-700 mb-1 block";

  return (
    <div className="bg-slate-200/50 backdrop-blur-sm rounded-xl border border-slate-300/40 p-3 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        {/* من تاريخ */}
        <div>
          <label className={fieldLabelCls}>من تاريخ</label>
          <input
            type="date"
            value={filters?.fromDate || ""}
            onChange={(e) => set("fromDate", e.target.value)}
            className={fieldInputCls}
          />
        </div>

        {/* إلى تاريخ */}
        <div>
          <label className={fieldLabelCls}>إلى تاريخ</label>
          <input
            type="date"
            value={filters?.toDate || ""}
            onChange={(e) => set("toDate", e.target.value)}
            className={fieldInputCls}
          />
        </div>

        {/* نوع الحركة */}
        <div className="relative z-30">
          <label className={fieldLabelCls}>نوع الحركة البنكية</label>
          <CompactSelect
            options={typeOptions}
            value={filters?.type || "all"}
            onChange={(val) => set("type", val || "all")}
            placeholder="الكل"
          />
        </div>

        {/* اسم الحساب */}
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