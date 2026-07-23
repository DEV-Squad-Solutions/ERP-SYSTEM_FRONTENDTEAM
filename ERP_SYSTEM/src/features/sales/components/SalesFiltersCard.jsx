import { Search, RotateCcw } from "lucide-react";
import { useGetPartiesSelectQuery } from "../../partners/partnersApi";
import { useGetStoresSelectQuery } from "../../stores/storesApi";
import { useGetDriversSelectQuery } from "../../drivers/driversApi";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

const typeOptions = [
  { value: "sale", label: "بيع" },
  { value: "purchase", label: "شراء" },
  { value: "sale_return", label: "مرتجع بيع" },
  { value: "purchase_return", label: "مرتجع شراء" },
];

const paymentOptions = [
  { value: "cash", label: "نقدي" },
  { value: "bank", label: "بنك" },
  { value: "credit", label: "آجل" },
];

const statusOptions = [
  { value: "completed", label: "مكتملة" },
  { value: "pending", label: "قيد المراجعة" },
  { value: "cancelled", label: "ملغية" },
  { value: "returned", label: "مرتجعة" },
];

/**
 * @param {{ draft: Object, onChange: (draft: Object) => void, onSearch: () => void, onReset: () => void }} props
 */
export default function SalesFiltersCard({
  draft,
  onChange,
  onSearch,
  onReset,
}) {
  const { data: parties, isLoading: isLoadingParties } =
    useGetPartiesSelectQuery();
  const { data: stores, isLoading: isLoadingStores } =
    useGetStoresSelectQuery();
  const { data: drivers, isLoading: isLoadingDrivers } =
    useGetDriversSelectQuery();

  const set = (key, value) => onChange({ ...draft, [key]: value });

  return (
    <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 mb-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <Input
          label="رقم الفاتورة"
          value={draft.invoiceNumber}
          onChange={(e) => set("invoiceNumber", e.target.value)}
        />

        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            نوع الفاتورة
          </label>
          <CompactSelect
            options={typeOptions}
            value={draft.movementType}
            onChange={(v) => set("movementType", v)}
            placeholder="الكل"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            العميل / المورد
          </label>
          <CompactSelect
            options={
              parties?.map((p) => ({ value: p.id, label: p.name })) || []
            }
            value={draft.partyId}
            onChange={(v) => set("partyId", v)}
            isLoading={isLoadingParties}
            placeholder="الكل"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            المخزن
          </label>
          <CompactSelect
            options={stores?.map((s) => ({ value: s.id, label: s.name })) || []}
            value={draft.storeId}
            onChange={(v) => set("storeId", v)}
            isLoading={isLoadingStores}
            placeholder="الكل"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            السائق
          </label>
          <CompactSelect
            options={
              drivers?.map((d) => ({ value: d.id, label: d.name })) || []
            }
            value={draft.driverId}
            onChange={(v) => set("driverId", v)}
            isLoading={isLoadingDrivers}
            placeholder="الكل"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            طريقة الدفع
          </label>
          <CompactSelect
            options={paymentOptions}
            value={draft.paymentMethod}
            onChange={(v) => set("paymentMethod", v)}
            placeholder="الكل"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            الحالة
          </label>
          <CompactSelect
            options={statusOptions}
            value={draft.status}
            onChange={(v) => set("status", v)}
            placeholder="الكل"
          />
        </div>

        <Input
          type="date"
          label="من تاريخ"
          value={draft.fromDate}
          onChange={(e) => set("fromDate", e.target.value)}
        />
        <Input
          type="date"
          label="إلى تاريخ"
          value={draft.toDate}
          onChange={(e) => set("toDate", e.target.value)}
        />
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
