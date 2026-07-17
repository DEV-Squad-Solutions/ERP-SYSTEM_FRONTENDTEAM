import { useState } from "react";
import SalesFilters from "../components/SalesFilters";
import SalesTable from "../components/SalesTable";
import SalesTotals from "../components/SalesTotals";

export default function SalesPage() {
  const [filters, setFilters] = useState({
    movementType: "all",
    date: "",
    invoiceNumber: "",
    partyName: "",
    country: "",
    driverName: "",
    carNumber: "",
  });

  return (
    <div className="animate-fadeUp">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-900">
          المبيعات والمشتريات
        </h2>
        <p className="text-sm text-ink-400 mt-1">
          فلترة وعرض وتعديل حركة الأصناف
        </p>
      </div>

      <SalesFilters filters={filters} onChange={setFilters} />
      <SalesTable filters={filters} />
      <SalesTotals filters={filters} />
    </div>
  );
}
