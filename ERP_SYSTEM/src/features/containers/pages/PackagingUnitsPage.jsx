import { useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import {
  useGetContainersQuery,
  useDeleteContainerMutation,
} from "../containersApi";
import ContainerFormModal from "../components/ContainerFormModal";
import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";

export default function PackagingUnitsPage() {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingContainer, setEditingContainer] = useState(null);
  const [deletingContainer, setDeletingContainer] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const filtersRef = useRef(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState({
    search: "",
    code: "",
    isActive: "",
  });

  const { data, isLoading, isError, refetch, isFetching } =
    useGetContainersQuery({
      pageNumber: page,
      pageSize,
      search: filters.search || undefined,
      code: filters.code || undefined,
      isActive:
        filters.isActive === "" ? undefined : filters.isActive === "true",
    });

  const containers = data?.items ?? [];
  const [deleteContainer, { isLoading: isDeleting }] =
    useDeleteContainerMutation();

  const handleChange = (key) => (e) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: e.target.value }));
  };

  const resetFilters = () => {
    setPage(1);
    setFilters({ search: "", code: "", isActive: "" });
  };
  const hasActiveFilters = filters.search || filters.code || filters.isActive;

  const openCreate = () => {
    setEditingContainer(null);
    setShowFormModal(true);
  };

  const openEdit = (container) => {
    setEditingContainer(container);
    setShowFormModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingContainer) return;
    try {
      await deleteContainer(deletingContainer.id).unwrap();
      toast.success("تم حذف العبوة بنجاح");
      setDeletingContainer(null);
    } catch (err) {
      toast.error("حصل خطأ أثناء الحذف، حاول تاني");
    }
  };

  return (
    <div className="animate-fadeUp">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            العبوات
          </h2>
          <p className="text-sm text-ink-400 mt-1">
            إدارة عبوات التعبئة (برميل، صندوق، كرتونة...)
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
                    placeholder="مثال: CTN-001"
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
                    <option value="true">نشطة</option>
                    <option value="false">غير نشطة</option>
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
            عبوة جديدة
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-2xl bg-ink-400/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-20 border border-dashed border-red-200 rounded-2xl">
          <p className="text-red-500 mb-3">حدث خطأ أثناء تحميل العبوات</p>
          <Button variant="outline" onClick={refetch}>
            إعادة المحاولة
          </Button>
        </div>
      )}

      {!isLoading && !isError && containers.length === 0 && (
        <div className="text-center py-20 border border-dashed border-ink-400/20 rounded-2xl">
          <p className="text-ink-400 mb-3">لا توجد عبوات مطابقة</p>
          <Button onClick={openCreate}>
            <Plus size={16} />
            إضافة أول عبوة
          </Button>
        </div>
      )}

      {!isLoading && !isError && containers.length > 0 && (
        <div
          className={`bg-white border border-ink-400/10 rounded-2xl overflow-hidden transition-opacity duration-200 ${
            isFetching ? "opacity-60" : ""
          }`}
        >
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-ink-400/10 text-xs text-ink-400 bg-ink-400/5">
                <th className="py-3 px-4 font-medium">اسم العبوة</th>
                <th className="py-3 px-4 font-medium">الكود</th>
                <th className="py-3 px-4 font-medium">الوصف</th>
                <th className="py-3 px-4 font-medium">الحالة</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {containers.map((container) => (
                <tr
                  key={container.id}
                  className="border-b border-ink-400/5 last:border-0"
                >
                  <td className="py-3 px-4 text-sm text-ink-900">
                    {container.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-ink-400">
                    {container.code}
                  </td>
                  <td className="py-3 px-4 text-sm text-ink-400">
                    {container.description || "-"}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        container.isActive
                          ? "bg-emerald-700/10 text-emerald-700"
                          : "bg-ink-400/10 text-ink-400"
                      }`}
                    >
                      {container.isActive ? "نشطة" : "غير نشطة"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(container)}
                        className="text-ink-400 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-ink-400/5 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeletingContainer(container)}
                        className="text-ink-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-ink-400/5 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.totalCount > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={data.totalCount}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          label="عبوة"
        />
      )}

      <ContainerFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        container={editingContainer}
      />

      <Modal
        isOpen={Boolean(deletingContainer)}
        onClose={() => setDeletingContainer(null)}
        title="تأكيد الحذف"
      >
        <div className="space-y-4">
          <p className="text-sm text-ink-900">
            هل أنت متأكد من حذف عبوة{" "}
            <span className="font-bold">"{deletingContainer?.name}"</span>؟
          </p>
          <p className="text-xs text-ink-400">الإجراء ده لا يمكن التراجع عنه</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingContainer(null)}
            >
              إلغاء
            </Button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              {isDeleting ? "جاري الحذف..." : "تأكيد الحذف"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
