import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  ArrowRight,
  Pencil,
  Trash2,
  Lock,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import {
  useGetStockAdjustmentByIdQuery,
  useDeleteStockAdjustmentMutation,
} from "../stockAdjustmentsApi";

const fmt = (v) => Number(v || 0).toLocaleString("ar-EG");

const COST_STATUS_LABELS = {
  Final: "نهائية",
  PartiallyCosted: "مكلفة جزئيًا",
  Pending: "معلقة",
  Revalued: "معاد تقييمها",
};

export default function StockAdjustmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const adjustmentId = Number(id);
  const isAdmin = useSelector((state) => state.auth.roles?.includes("Admin"));

  const {
    data: adjustment,
    isLoading,
    isError,
    refetch,
  } = useGetStockAdjustmentByIdQuery(adjustmentId, { skip: !adjustmentId });

  const [deleteStockAdjustment, { isLoading: isDeleting }] =
    useDeleteStockAdjustmentMutation();

  const isLocked = Boolean(adjustment?.sourceInventoryCountId);
  const isIncrease = adjustment?.direction === "Increase";

  const handleDelete = async () => {
    if (isLocked) {
      toast.error("التسوية دي ناتجة عن جرد ومش قابلة للحذف يدويًا");
      return;
    }
    if (
      !window.confirm(
        `هل أنت متأكد من حذف التسوية "${adjustment.documentNumber}"؟ هيتم عكس تأثيرها على رصيد المخزن.`,
      )
    )
      return;

    try {
      await deleteStockAdjustment(adjustmentId).unwrap();
      toast.success("تم حذف التسوية بنجاح");
      navigate("/dashboard/stock-adjustments");
    } catch (err) {
      toast.error(err?.data?.title || "فشل حذف التسوية");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto animate-pulse" dir="rtl">
        <div className="bg-ink-100 rounded-2xl h-24 mb-6" />
        <div className="bg-ink-100 rounded-2xl h-64" />
      </div>
    );
  }

  if (isError || !adjustment) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center" dir="rtl">
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
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-xl font-bold text-ink-900">
                {adjustment.documentNumber}
              </h1>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                  isIncrease
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {isIncrease ? (
                  <ArrowUpCircle size={12} />
                ) : (
                  <ArrowDownCircle size={12} />
                )}
                {isIncrease ? "زيادة" : "نقص"}
              </span>
              {isLocked && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-ink-100 text-ink-500">
                  <Lock size={11} />
                  ناتجة عن جرد
                </span>
              )}
            </div>
            <p className="text-sm text-ink-500 mt-1.5">
              {adjustment.storeName} •{" "}
              {new Date(adjustment.documentDate).toLocaleDateString("ar-EG")}
            </p>
            {adjustment.reason && (
              <p className="text-sm text-ink-600 mt-2">{adjustment.reason}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/dashboard/stock-adjustments")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-50 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              رجوع
            </button>
            {isAdmin && !isLocked && (
              <>
                <button
                  onClick={() =>
                    navigate(
                      `/dashboard/stock-adjustments/${adjustmentId}/edit`,
                    )
                  }
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-ink-700 bg-ink-50 hover:bg-ink-100 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  تعديل
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors disabled:opacity-60"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? "جاري الحذف..." : "حذف"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lines */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-display text-sm font-semibold text-ink-900 mb-4">
          الأصناف ({adjustment.lines?.length ?? 0})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-ink-500 text-xs border-b border-ink-100">
                <th className="py-2.5 px-3 text-right font-medium">الصنف</th>
                <th className="py-2.5 px-3 text-right font-medium">الكمية</th>
                <th className="py-2.5 px-3 text-right font-medium">
                  تكلفة الوحدة
                </th>
                <th className="py-2.5 px-3 text-right font-medium">
                  إجمالي التكلفة
                </th>
                <th className="py-2.5 px-3 text-right font-medium">
                  الرصيد بعدها
                </th>
                <th className="py-2.5 px-3 text-right font-medium">
                  متوسط التكلفة بعدها
                </th>
                <th className="py-2.5 px-3 text-right font-medium">
                  حالة التكلفة
                </th>
              </tr>
            </thead>
            <tbody>
              {adjustment.lines?.map((line) => (
                <tr
                  key={line.id}
                  className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40 transition-colors"
                >
                  <td className="py-2.5 px-3">
                    <p className="font-medium text-ink-900">{line.itemName}</p>
                    <p className="text-xs text-ink-400 font-mono">
                      {line.itemCode} • {line.itemUnitName}
                    </p>
                  </td>
                  <td className="py-2.5 px-3 text-ink-900 font-medium">
                    {fmt(line.quantity)}
                  </td>
                  <td className="py-2.5 px-3 text-ink-700">
                    {isIncrease ? fmt(line.unitCost) : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-ink-900 font-medium">
                    {fmt(line.inventoryTotalCost)}
                  </td>
                  <td className="py-2.5 px-3 text-ink-700">
                    {fmt(line.quantityAfter)}
                  </td>
                  <td className="py-2.5 px-3 text-ink-700">
                    {fmt(line.averageCostAfter)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-ink-50 text-ink-600">
                      {COST_STATUS_LABELS[line.costStatus] ?? line.costStatus}
                    </span>
                    {line.costStatus === "PartiallyCosted" &&
                      line.pendingCostQuantity > 0 && (
                        <span className="block text-[11px] text-amber-600 mt-0.5">
                          معلق: {fmt(line.pendingCostQuantity)}
                        </span>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
