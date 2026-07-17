import { useState } from "react";
import StockLedgerFilters from "../components/StockLedgerFilters";
import StockLedgerTable from "../components/StockLedgerTable";

export default function InventoryPage() {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    itemId: "",
    movementType: "all",
  });

  return (
    <div className="animate-fadeUp">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-900">المخزن</h2>
        <p className="text-sm text-ink-400 mt-1">
          سجل حركة الأصناف (وارد/صادر) بالكمية والوزن
        </p>
      </div>

      <StockLedgerFilters filters={filters} onChange={setFilters} />
      <StockLedgerTable filters={filters} />
    </div>
  );
}
