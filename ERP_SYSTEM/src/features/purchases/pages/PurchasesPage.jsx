import { useState } from "react";
import { Plus, X } from "lucide-react";
import InvoiceForm from "../../invoices/components/InvoiceForm";
import InvoicesList from "../../invoices/components/InvoicesList";
import Button from "../../../shared/components/ui/Button";

export default function PurchasesPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="animate-fadeUp">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            المشتريات
          </h2>
          <p className="text-sm text-ink-400 mt-1">
            فواتير الشراء وربطها بالمخزون
          </p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "إلغاء" : "فاتورة شراء جديدة"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-6 mb-6 animate-fadeUp">
          <InvoiceForm type="purchase" onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <InvoicesList type="purchase" />
    </div>
  );
}
