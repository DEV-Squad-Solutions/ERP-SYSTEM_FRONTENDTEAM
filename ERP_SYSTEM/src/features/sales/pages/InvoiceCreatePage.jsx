import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CreateInvoiceForm from "../components/createComponents/CreateInvoiceForm";

export default function InvoiceCreatePage() {
  const navigate = useNavigate();

  return (
    <div className=" animate-fadeUp ">
      <div className="flex justify-between items-center ">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-ink-900">
            فاتورة جديدة
          </h2>
          <p className="text-sm text-ink-400 mt-1">
            أدخل بيانات الفاتورة والأصناف
          </p>
        </div>{" "}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-bold border    p-3 rounded-lg text-ink-400 hover:text-ink-900 bg-white"
        >
          <ArrowRight size={16} />
          رجوع
        </button>
      </div>

      <CreateInvoiceForm onSuccess={() => navigate("/dashboard/sales")} />
    </div>
  );
}
