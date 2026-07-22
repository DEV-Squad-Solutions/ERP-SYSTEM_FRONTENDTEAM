import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import EditInvoiceForm from "../components/editComponents/EditInvoiceForm";

export default function InvoiceEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="animate-fadeUp ">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-900 transition-colors mb-4"
      >
        <ArrowRight size={16} />
        رجوع
      </button>

      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-900">
          تعديل الفاتورة
        </h2>
        <p className="text-sm text-ink-400 mt-1">
          عدّل بيانات الفاتورة وأصنافها
        </p>
      </div>

      <EditInvoiceForm
        invoiceId={id}
        onSuccess={() => navigate("/dashboard/sales")}
      />
    </div>
  );
}
