import Input from "../../../shared/components/ui/Input";

const movementTabs = [
  { value: "all", label: "الكل" },
  { value: "purchase", label: "مشتريات" },
  { value: "sale", label: "مبيعات" },
];

export default function SalesFilters({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 mb-4">
      <div className="flex flex-col lg:flex-row lg:items-end gap-3">
        <div className="inline-flex bg-ink-400/5 rounded-xl p-1 shrink-0">
          {movementTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => set("movementType", tab.value)}
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

        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Input
            type="date"
            label="التاريخ"
            value={filters.date}
            onChange={(e) => set("date", e.target.value)}
          />
          <Input
            label="رقم الفاتورة"
            value={filters.invoiceNumber}
            onChange={(e) => set("invoiceNumber", e.target.value)}
          />
          <Input
            label="عميل / مورد"
            value={filters.partyName}
            onChange={(e) => set("partyName", e.target.value)}
          />
          <Input
            label="البلد"
            value={filters.country}
            onChange={(e) => set("country", e.target.value)}
          />
          <Input
            label="اسم السائق"
            value={filters.driverName}
            onChange={(e) => set("driverName", e.target.value)}
          />
          <Input
            label="رقم السيارة"
            value={filters.carNumber}
            onChange={(e) => set("carNumber", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
