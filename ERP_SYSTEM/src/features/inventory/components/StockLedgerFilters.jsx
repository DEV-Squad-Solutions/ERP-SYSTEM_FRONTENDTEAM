import { useGetItemsSelectQuery } from "../inventoryApi";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
const movementTabs = [
  { value: "all", label: "الكل" },
  { value: "purchase", label: "شراء" },
  { value: "sale", label: "بيع" },
];

/**
 * @param {{ filters: Object, onChange: (filters: Object) => void }} props
 */
export default function StockLedgerFilters({ filters, onChange }) {
  const { data: items, isLoading } = useGetItemsSelectQuery();

  return (
    <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 mb-4">
      <div className="flex flex-col justify-center items-center lg:flex-row lg:items-end gap-3">
        <div className="inline-flex bg-ink-400/5 rounded-xl p-1 shrink-0">
          {movementTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onChange({ ...filters, movementType: tab.value })}
              className={`px-4 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap ${
                filters.movementType === tab.value
                  ? "bg-white text-primary-500 font-medium shadow-sm"
                  : "text-ink-400 hover:text-ink-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-1 justify-center sm:grid-cols-3 gap-3">
          <Input
            label="التاريخ من"
            type="date"
            value={filters.from}
            onChange={(e) => onChange({ ...filters, from: e.target.value })}
          />
          <Input
            label="تاريخ إلى"
            type="date"
            value={filters.to}
            onChange={(e) => onChange({ ...filters, to: e.target.value })}
          />
          <div className="p-2">
            الصنف
            <CompactSelect
              label="الصنف"
              options={
                items?.map((item) => ({
                  value: item.id,
                  label: item.name,
                })) || []
              }
              value={filters.itemId}
              onChange={(value) =>
                onChange({
                  ...filters,
                  itemId: value,
                })
              }
              isLoading={isLoading}
              placeholder="كل الأصناف"
              isClearable
            />
          </div>
        </div>
      </div>
    </div>
  );
}
