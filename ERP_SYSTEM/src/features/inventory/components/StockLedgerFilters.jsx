import { useGetItemsQuery } from "../inventoryApi";
import Input from "../../../shared/components/ui/Input";

const movementTabs = [
  { value: "all", label: "الكل" },
  { value: "purchase", label: "شراء" },
  { value: "sale", label: "بيع" },
];

/**
 * @param {{ filters: Object, onChange: (filters: Object) => void }} props
 */
export default function StockLedgerFilters({ filters, onChange }) {
  const { data: items } = useGetItemsQuery();

  return (
    <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 mb-4">
      <div className="flex flex-col lg:flex-row lg:items-end gap-3">
        {/* تبويب شراء/بيع/الكل */}
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

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              الصنف
            </label>
            <select
              value={filters.itemId}
              onChange={(e) => onChange({ ...filters, itemId: e.target.value })}
              className="w-full rounded-xl border border-ink-400/15 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
            >
              <option value="">كل الأصناف</option>
              {items?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
