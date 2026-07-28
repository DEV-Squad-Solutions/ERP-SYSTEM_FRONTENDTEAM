import { Search, RotateCcw } from "lucide-react";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

const sourceTypeOptions = [
  { value: "OpeningBalance", label: "رصيد افتتاحي" },
  { value: "Invoice", label: "فاتورة" },
  { value: "CashVoucher", label: "سند نقدي" },
];

const movementTypeOptions = [
  { value: "Sales", label: "بيع" },
  { value: "SalesReturn", label: "مرتجع بيع" },
  { value: "Purchase", label: "شراء" },
  { value: "PurchaseReturn", label: "مرتجع شراء" },
  { value: "CashReceipt", label: "سند قبض" },
  { value: "CashPayment", label: "سند صرف" },
];

/**
 * @param {{ draft: Object, onChange: (draft: Object) => void, onSearch: () => void, onReset: () => void }} props
 */
export default function StatementFilters({
  draft,
  onChange,
  onSearch,
  onReset,
}) {
  const set = (key, value) => onChange({ ...draft, [key]: value });

  return (
    <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 mb-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Input
          label="بحث"
          value={draft.Search}
          onChange={(e) => set("Search", e.target.value)}
        />
        <Input
          type="date"
          label="من تاريخ"
          value={draft.FromDate}
          onChange={(e) => set("FromDate", e.target.value)}
        />
        <Input
          type="date"
          label="إلى تاريخ"
          value={draft.ToDate}
          onChange={(e) => set("ToDate", e.target.value)}
        />
        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            مصدر الحركة
          </label>
          <CompactSelect
            options={sourceTypeOptions}
            value={draft.SourceType}
            onChange={(v) => set("SourceType", v)}
            placeholder="الكل"
          />
        </div>
        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            نوع الحركة
          </label>
          <CompactSelect
            options={movementTypeOptions}
            value={draft.MovementType}
            onChange={(v) => set("MovementType", v)}
            placeholder="الكل"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-ink-400/10">
        <Button variant="outline" onClick={onReset}>
          <RotateCcw size={15} />
          إعادة تعيين
        </Button>
        <Button onClick={onSearch}>
          <Search size={15} />
          بحث
        </Button>
      </div>
    </div>
  );
}
