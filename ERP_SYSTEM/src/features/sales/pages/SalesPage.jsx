import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import SalesFilters from "../components/SalesFilters";
import InvoicesListTable from "../components/InvoicesListTable";
import SalesTotals from "../components/SalesTotals";
import Button from "../../../shared/components/ui/Button";

export default function SalesPage() {
  const navigate = useNavigate();
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            المبيعات
          </h2>
          <p className="text-sm text-ink-400 mt-1">فلترة وعرض حركة الفواتير</p>
        </div>
        <Button onClick={() => navigate("/dashboard/sales/new")}>
          <Plus size={18} />
          فاتورة جديدة
        </Button>
      </div>

      <SalesFilters filters={filters} onChange={setFilters} />
      <InvoicesListTable
        filters={filters}
        onView={(id) => navigate(`/dashboard/sales/${id}`)}
        onEdit={(id) => navigate(`/dashboard/sales/${id}/edit`)}
      />
      <SalesTotals filters={filters} />
    </div>
  );
}
