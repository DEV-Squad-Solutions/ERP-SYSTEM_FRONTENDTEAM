import { useState } from "react";
import { Link } from "react-router-dom";
import StockLedgerFilters from "../components/StockLedgerFilters";
import StockLedgerTable from "../components/StockLedgerTable";
import { useGetStoresQuery } from "../../stores/storesApi";

export default function InventoryPage() {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    itemId: "",
    movementType: "all",
    storeId: "",
  });

  const { data: storesData } = useGetStoresQuery({
    pageNumber: 1,
    pageSize: 20,
  });
  const stores = storesData?.items ?? [];

  return (
    <div className="animate-fadeUp">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            المخزن
          </h2>
          <p className="text-sm text-ink-400 mt-1">
            سجل حركة الأصناف (وارد/صادر) بالكمية والوزن
          </p>
        </div>
        <Link
          to="/dashboard/inventory/stores"
          className="text-sm text-emerald-700 hover:underline whitespace-nowrap mt-1"
        >
          عرض كل المخازن ←
        </Link>
      </div>

      <div className="mb-4 max-w-xs">
        <label className="block text-sm text-ink-500 mb-1">المخزن</label>
        <select
          value={filters.storeId}
          onChange={(e) =>
            setFilters((f) => ({ ...f, storeId: e.target.value }))
          }
          className="w-full border border-gold-200 rounded-md px-3 py-2 bg-cream-50 text-ink-900 focus:outline-none focus:border-emerald-700"
        >
          <option value="">كل المخازن</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name} ({store.code})
            </option>
          ))}
        </select>
      </div>

      <StockLedgerFilters filters={filters} onChange={setFilters} />
      <StockLedgerTable filters={filters} />
    </div>
  );
}
