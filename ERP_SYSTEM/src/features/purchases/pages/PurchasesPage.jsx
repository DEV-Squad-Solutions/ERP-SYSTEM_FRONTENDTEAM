import { useState } from "react";
import { Plus } from "lucide-react";
import PurchasesFilters from "../components/PurchasesFilters";
import NewInvoiceModal from "../components/NewInvoiceModal";
import InvoiceDetailsModal from "../components/InvoiceDetailsModal";
import Button from "../../../shared/components/ui/Button";
import PurchasesTotals from "../components/PurchasesTotals";
import PurchasesTable from "../components/PurchasesTable";

export default function SalesPage() {
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [filters, setFilters] = useState({
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
            المشتريات
          </h2>
          <p className="text-sm text-ink-400 mt-1">
            فلترة وعرض وتعديل حركة المشتريات
          </p>
        </div>
        <Button onClick={() => setShowNewInvoice(true)}>
          <Plus size={18} />
          فاتورة جديدة
        </Button>
      </div>

      <PurchasesFilters filters={filters} onChange={setFilters} />
      <PurchasesTable filters={filters} />
      <PurchasesTotals filters={filters} />
      <NewInvoiceModal
        invoiceId={null}
        isOpen={showNewInvoice}
        onClose={() => setShowNewInvoice(false)}
      />
    </div>
  );
}
