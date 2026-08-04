import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, SlidersHorizontal, RotateCcw } from "lucide-react";
import {
  useDeleteStoreMutation,
  useGetStoresQuery,
} from "../../stores/storesApi";
import StoreCard from "../../stores/components/StoreCard";
import StoreFormModal from "../../stores/components/StoreFormModal";
import Button from "../../../shared/components/ui/Button";
import { toast } from "sonner";

export default function StoresListPage() {
  const navigate = useNavigate();
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const filtersRef = useRef(null);

  const [filters, setFilters] = useState({
    search: "",
    code: "",
    isActive: "",
  });

  const { data, isLoading, isError, refetch } = useGetStoresQuery({
    pageNumber: 1,
    pageSize: 20,
    isContainerStore: false,
    search: filters.search || undefined,
    code: filters.code || undefined,
    isActive: filters.isActive === "" ? undefined : filters.isActive === "true",
  });

  const stores = data?.items ?? [];
  const [deleteStore] = useDeleteStoreMutation();

  const handleChange = (key) => (e) =>
    setFilters((f) => ({ ...f, [key]: e.target.value }));

  const resetFilters = () => setFilters({ search: "", code: "", isActive: "" });
  const hasActiveFilters = filters.search || filters.code || filters.isActive;

  const openCreate = () => {
    setEditingStore(null);
    setShowFormModal(true);
  };

  const openEdit = (store) => {
    setEditingStore(store);
    setShowFormModal(true);
  };
  const handleDelete = (store) => {
    toast(`حذف "${store.name}"؟`, {
      description: "الإجراء ده لا يمكن التراجع عنه",
      position: "center",

      action: {
        label: "تأكيد الحذف",
        onClick: async () => {
          try {
            await deleteStore(store.id).unwrap();
            toast.success("تم حذف المخزن بنجاح");
          } catch (err) {
            toast.error("حصل خطأ أثناء الحذف، حاول تاني");
          }
        },
      },
      cancel: {
        label: "إلغاء",
      },
      duration: 6000,
    });
  };
  return (
    <div className="animate-fadeUp">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            المخازن
          </h2>
          <p className="text-sm text-ink-400 mt-1">
            اختر مخزن للدخول على بياناته وسجل حركته
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={filtersRef}>
            <Button variant="outline" onClick={() => setShowFilters((s) => !s)}>
              <SlidersHorizontal size={16} />
              فلاتر
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mr-1" />
              )}
            </Button>

            {showFilters && (
              <div className="absolute left-0 mt-2 w-80 bg-white border border-ink-400/10 rounded-2xl shadow-lg p-4 z-20 space-y-3">
                <div>
                  <label className="block text-xs text-ink-400 mb-1.5">
                    بحث
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={handleChange("search")}
                    placeholder="ابحث بالاسم..."
                    className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
                  />
                </div>

                <div>
                  <label className="block text-xs text-ink-400 mb-1.5">
                    الكود
                  </label>
                  <input
                    type="text"
                    value={filters.code}
                    onChange={handleChange("code")}
                    placeholder="مثال: MAIN"
                    className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
                  />
                </div>

                <div>
                  <label className="block text-xs text-ink-400 mb-1.5">
                    الحالة
                  </label>
                  <select
                    value={filters.isActive}
                    onChange={handleChange("isActive")}
                    className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
                  >
                    <option value="">الكل</option>
                    <option value="true">نشط</option>
                    <option value="false">غير نشط</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-emerald-700 pt-1"
                  >
                    <RotateCcw size={12} />
                    إعادة تعيين الفلاتر
                  </button>
                )}
              </div>
            )}
          </div>

          <Button onClick={openCreate}>
            <Plus size={16} />
            مخزن جديد
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-ink-400/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-20 border border-dashed border-red-200 rounded-2xl">
          <p className="text-red-500 mb-3">حدث خطأ أثناء تحميل المخازن</p>
          <Button variant="outline" onClick={refetch}>
            إعادة المحاولة
          </Button>
        </div>
      )}

      {!isLoading && !isError && stores.length === 0 && (
        <div className="text-center py-20 border border-dashed border-ink-400/20 rounded-2xl">
          <p className="text-ink-400 mb-3">لا توجد مخازن مطابقة</p>
          <Button onClick={openCreate}>
            <Plus size={16} />
            إضافة أول مخزن
          </Button>
        </div>
      )}

      {!isLoading && !isError && stores.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onClick={() =>
                navigate(`/dashboard/inventory/stores/${store.id}`)
              }
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <StoreFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        store={editingStore}
      />
    </div>
  );
}
