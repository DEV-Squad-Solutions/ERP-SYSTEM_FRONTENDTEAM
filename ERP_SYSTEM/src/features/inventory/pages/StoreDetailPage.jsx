import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetStoresQuery } from "../../stores/storesApi";
import StockLedgerFilters from "../components/StockLedgerFilters";
import StockLedgerTable from "../components/StockLedgerTable";

export default function StoreDetailPage() {
  const { storeId } = useParams();
  const navigate = useNavigate();

  const { data } = useGetStoresQuery({ pageNumber: 1, pageSize: 20 });
  const store = data?.items?.find((s) => String(s.id) === storeId);

  const [filters, setFilters] = useState({
    from: "",
    to: "",
    itemId: "",
    movementType: "all",
  });

  return (
    <div className="animate-fadeUp">
      <button
        onClick={() => navigate("/dashboard/inventory/stores")}
        className="text-sm text-emerald-700 hover:underline mb-4"
      >
        ← رجوع لكل المخازن
      </button>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            {store?.name ?? "..."}
          </h2>
          <p className="text-sm text-ink-400 mt-1">
            سجل حركة الأصناف (وارد/صادر) بالكمية والوزن — {store?.address}
          </p>
        </div>
        {store && (
          <div className="text-left">
            <span className="font-mono text-xs text-ink-400 block">
              {store.code}
            </span>
            <span
              className={
                store.isActive
                  ? "text-emerald-700 text-xs font-semibold"
                  : "text-red-600 text-xs font-semibold"
              }
            >
              {store.isActive ? "نشط" : "غير نشط"}
            </span>
          </div>
        )}
      </div>

      <StockLedgerFilters filters={filters} onChange={setFilters} />
      <StockLedgerTable filters={{ ...filters, storeId }} />
    </div>
  );
}
