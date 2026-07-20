import { useState } from "react";
import { Plus } from "lucide-react";
import SalesFilters from "../components/SalesFilters";
import SalesTable from "../components/SalesTable";
import SalesTotals from "../components/SalesTotals";
import NewInvoiceModal from "../components/NewInvoiceModal";
import InvoiceDetailsModal from "../components/InvoiceDetailsModal";
import Button from "../../../shared/components/ui/Button";

export default function SalesPage() {
  const [showNewInvoice, setShowNewInvoice] = useState(false);
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
          <p className="text-sm text-ink-400 mt-1">
            فلترة وعرض وتعديل حركة المبيعات
          </p>
        </div>
        <Button onClick={() => setShowNewInvoice(true)}>
          <Plus size={18} />
          فاتورة جديدة
        </Button>
      </div>

      <SalesFilters filters={filters} onChange={setFilters} />
      <SalesTable filters={filters} />
      <SalesTotals filters={filters} />
      <NewInvoiceModal
        invoiceId={null}
        isOpen={showNewInvoice}
        onClose={() => setShowNewInvoice(false)}
      />
    </div>
  );
}
