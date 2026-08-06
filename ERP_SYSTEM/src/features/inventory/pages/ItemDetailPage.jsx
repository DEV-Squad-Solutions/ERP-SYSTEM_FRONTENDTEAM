import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  ArrowRight,
  Package,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { useGetItemByIdQuery, useDeleteItemMutation } from "../inventoryApi";
import QuickAddItemModal from "../components/QuickAddItemModal"; // عدّل المسار حسب مكانه عندك

export default function ItemDetailPage() {
  const { id } = useParams();
  const itemId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const fromStoreId = location.state?.fromStoreId;

  const [isEditOpen, setIsEditOpen] = useState(false);

  const {
    data: item,
    isLoading,
    isError,
    refetch,
  } = useGetItemByIdQuery(itemId, { skip: !itemId });

  const [deleteItem, { isLoading: isDeleting }] = useDeleteItemMutation();

  const handleDelete = async () => {
    if (!window.confirm(`هل أنت متأكد من حذف الصنف "${item?.name}"؟`)) return;
    try {
      await deleteItem(itemId).unwrap();
      toast.success("تم حذف الصنف بنجاح");
      // الـ cache tag الخاص بتقرير أرصدة المخزن بيتعمله invalidate تلقائيًا
      // (شوف inventoryApi.js) فلما نرجع لصفحة المخزن هيجيب بيانات محدّثة لوحده.
      if (fromStoreId) {
        navigate(`/dashboard/stores/${fromStoreId}`);
      } else {
        navigate("/dashboard/items");
      }
    } catch (err) {
      toast.error(err?.data?.title || "فشل حذف الصنف");
    }
  };

  const handleBack = () => {
    if (fromStoreId) {
      navigate(`/dashboard/stores/${fromStoreId}`);
    } else {
      navigate(-1);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto" dir="rtl">
        <ItemDetailSkeleton />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center" dir="rtl">
        <AlertCircle
          size={32}
          className="mx-auto text-negative/70 mb-3"
          strokeWidth={1.6}
        />
        <p className="text-ink-900 font-medium text-sm mb-3">
          تعذر تحميل بيانات الصنف
        </p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 text-xs font-medium text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw size={13} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-ink-50 flex items-center justify-center shrink-0">
              <Package className="w-7 h-7 text-ink-600" />
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-xl font-bold text-ink-900">
                  {item.name}
                </h1>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    item.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {item.isActive ? "نشط" : "غير نشط"}
                </span>
              </div>
              <p className="text-sm text-ink-500 font-mono mt-1.5">
                {item.code}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-50 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              رجوع
            </button>
            <button
              onClick={() => setIsEditOpen(true)}
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
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="كود الصنف" value={item.code} />
          <Field label="اسم الصنف" value={item.name} />
          <Field label="الوحدة" value={item.itemUnitName} />
          <Field label="الحالة" value={item.isActive ? "نشط" : "غير نشط"} />
          <div className="sm:col-span-2">
            <Field label="الوصف" value={item.description} />
          </div>
        </div>
      </div>

      <QuickAddItemModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        item={item}
        onUpdated={() => refetch()}
      />
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-ink-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-ink-900">{value || "—"}</p>
    </div>
  );
}

function ItemDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-ink-100 rounded-2xl h-24 mb-6" />
      <div className="bg-ink-100 rounded-2xl h-48" />
    </div>
  );
}
