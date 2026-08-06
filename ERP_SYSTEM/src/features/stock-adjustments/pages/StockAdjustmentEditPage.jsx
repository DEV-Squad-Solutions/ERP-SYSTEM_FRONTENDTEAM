import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, RefreshCw } from "lucide-react";

import { useGetStockAdjustmentByIdQuery } from "../stockAdjustmentsApi";
import StockAdjustmentForm from "../components/StockAdjustmentForm";

export default function StockAdjustmentEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const adjustmentId = Number(id);

  const {
    data: adjustment,
    isLoading,
    isError,
    refetch,
  } = useGetStockAdjustmentByIdQuery(adjustmentId, { skip: !adjustmentId });

  // التسويات الناتجة عن جرد غير قابلة للتعديل حسب توصيف الـ API
  if (adjustment?.sourceInventoryCountId) {
    toast.error("التسوية دي ناتجة عن جرد ومش قابلة للتعديل");
    navigate(`/dashboard/inventory/adjustments/${adjustmentId}`);
    return null;
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto animate-pulse" dir="rtl">
        <div className="h-7 w-56 bg-ink-100 rounded mb-6" />
        <div className="bg-ink-100 rounded-2xl h-40 mb-4" />
        <div className="bg-ink-100 rounded-2xl h-60" />
      </div>
    );
  }

  if (isError || !adjustment) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center" dir="rtl">
        <AlertCircle size={28} className="mx-auto text-rose-400 mb-3" />
        <p className="text-ink-900 font-medium text-sm mb-3">
          تعذر تحميل بيانات التسوية
        </p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 text-xs font-medium text-ink-600 hover:text-ink-900 bg-ink-50 hover:bg-ink-100 px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw size={13} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto" dir="rtl">
      <h1 className="font-display text-xl font-bold text-ink-900 mb-6">
        تعديل التسوية {adjustment.documentNumber}
      </h1>
      <StockAdjustmentForm adjustment={adjustment} isEditMode />
    </div>
  );
}
