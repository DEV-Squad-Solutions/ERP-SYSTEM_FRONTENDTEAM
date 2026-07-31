// features/itemsCategories/pages/ItemsCategoriesPage.jsx
import { useState } from "react";
import { toast } from "sonner";
import {
  Tag,
  Plus,
  Check,
  X,
  Loader2,
  Search,
  RotateCcw,
  AlertCircle,
  RefreshCw,
  FileSearch,
} from "lucide-react";
import {
  useGetItemsCategoriesQuery,
  useCreateItemCategoryMutation,
} from "../itemsCategoriesApi";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";

const emptyFilters = { search: "", isActive: "" };

const statusOptions = [
  { value: "", label: "الكل" },
  { value: "true", label: "مفعّل" },
  { value: "false", label: "معطّل" },
];

function emptyDraft() {
  return { name: "", isActive: true, notes: "" };
}

export default function ItemsCategoriesPage() {
  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState(emptyDraft());

  const { data, isLoading, isFetching, isError, refetch } =
    useGetItemsCategoriesQuery({
      page,
      pageSize,
      search: applied.search || undefined,
      isActive:
        applied.isActive === "" ? undefined : applied.isActive === "true",
    });

  const [createCategory, { isLoading: isSaving }] =
    useCreateItemCategoryMutation();

  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const handleSearch = () => {
    setApplied(draft);
    setPage(1);
  };

  const handleReset = () => {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setPage(1);
  };

  const openAddRow = () => {
    setNewCategory(emptyDraft());
    setIsAdding(true);
  };

  const closeAddRow = () => {
    setIsAdding(false);
    setNewCategory(emptyDraft());
  };

  const handleSave = async () => {
    if (!newCategory.name.trim()) {
      toast.error("اسم التصنيف مطلوب");
      return;
    }

    try {
      await createCategory({
        name: newCategory.name.trim(),
        isActive: newCategory.isActive,
        notes: newCategory.notes || undefined,
      }).unwrap();

      toast.success("تم إضافة التصنيف بنجاح");
      closeAddRow();
    } catch (err) {
      if (err?.status === 409) {
        toast.error("فيه تصنيف مفعّل بنفس الاسم موجود بالفعل");
      } else {
        toast.error("تعذر إضافة التصنيف");
      }
    }
  };

  const rows = data?.items || [];

  return (
    <div className="animate-fadeUp space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            تصنيفات الأصناف
          </h2>
          <p className="text-sm text-ink-400 mt-1">
            التصنيفات المستخدمة في رأس الفاتورة
          </p>
        </div>
        <Button onClick={openAddRow} disabled={isAdding}>
          <Plus size={16} />
          تصنيف جديد
        </Button>
      </div>

      {/* الفلاتر */}
      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <Input
            label="بحث"
            value={draft.search}
            onChange={(e) => setField("search", e.target.value)}
            placeholder="ابحث بالاسم..."
          />
          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              الحالة
            </label>
            <select
              value={draft.isActive}
              onChange={(e) => setField("isActive", e.target.value)}
              className="w-full rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm outline-none focus:border-primary-500 bg-white"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="h-9 flex-1">
              <Search size={14} />
              بحث
            </Button>
            <Button variant="outline" onClick={handleReset} className="h-9">
              <RotateCcw size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* الجدول */}
      {isLoading ? (
        <div className="space-y-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 rounded-lg bg-ink-400/5 animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-14 border border-dashed border-negative/25 bg-negative/[0.02] rounded-2xl">
          <AlertCircle
            size={32}
            className="mx-auto text-negative/70 mb-3"
            strokeWidth={1.6}
          />
          <p className="text-ink-900 font-medium text-sm mb-1">
            تعذر تحميل التصنيفات
          </p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 text-xs font-medium text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors mt-2"
          >
            <RefreshCw size={13} />
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <>
          <div
            className={`overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${isFetching ? "opacity-60" : ""}`}
          >
            <table className="w-full text-right border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الاسم
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    ملاحظات
                  </th>
                  <th className="p-2.5 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && !isAdding && (
                  <tr>
                    <td colSpan={3} className="py-14">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-ink-400/5 flex items-center justify-center mx-auto mb-3">
                          <FileSearch
                            size={22}
                            className="text-ink-400/50"
                            strokeWidth={1.6}
                          />
                        </div>
                        <p className="text-ink-900 font-medium text-sm mb-1">
                          لا توجد تصنيفات
                        </p>
                        <p className="text-xs text-ink-400">
                          دوس "تصنيف جديد" للبدء
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {rows.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-ink-400/5 last:border-0 hover:bg-ink-900/[0.01] transition-colors"
                  >
                    <td className="p-2.5 text-sm font-medium text-ink-900 border-l border-ink-400/5">
                      <span className="inline-flex items-center gap-1.5">
                        <Tag size={13} className="text-ink-400" />
                        {cat.name}
                      </span>
                    </td>
                    <td
                      className="p-2.5 text-sm text-ink-600 border-l border-ink-400/5 max-w-[300px] truncate"
                      title={cat.notes}
                    >
                      {cat.notes || "—"}
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          cat.isActive
                            ? "text-positive bg-positive/10"
                            : "text-ink-400 bg-ink-400/10"
                        }`}
                      >
                        {cat.isActive ? "مفعّل" : "معطّل"}
                      </span>
                    </td>
                  </tr>
                ))}

                {isAdding && (
                  <tr className="bg-primary-50/30">
                    <td className="p-1.5 border-l border-ink-400/5">
                      <input
                        autoFocus
                        type="text"
                        placeholder="اسم التصنيف"
                        value={newCategory.name}
                        onChange={(e) =>
                          setNewCategory((n) => ({
                            ...n,
                            name: e.target.value,
                          }))
                        }
                        className="w-full text-sm bg-white border border-ink-400/15 rounded-lg px-2.5 py-1.5"
                      />
                    </td>
                    <td className="p-1.5 border-l border-ink-400/5">
                      <input
                        type="text"
                        placeholder="ملاحظات (اختياري)"
                        value={newCategory.notes}
                        onChange={(e) =>
                          setNewCategory((n) => ({
                            ...n,
                            notes: e.target.value,
                          }))
                        }
                        className="w-full text-sm bg-white border border-ink-400/15 rounded-lg px-2.5 py-1.5"
                      />
                    </td>
                    <td className="p-1.5">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs text-ink-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={newCategory.isActive}
                            onChange={(e) =>
                              setNewCategory((n) => ({
                                ...n,
                                isActive: e.target.checked,
                              }))
                            }
                            className="accent-primary-500"
                          />
                          مفعّل
                        </label>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-positive/15 text-positive hover:bg-positive/25 transition-colors disabled:opacity-50"
                          title="حفظ"
                        >
                          {isSaving ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                        </button>
                        <button
                          onClick={closeAddRow}
                          disabled={isSaving}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-ink-900/[0.05] text-ink-400 hover:bg-ink-900/10 transition-colors disabled:opacity-50"
                          title="إلغاء"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data?.totalCount > 0 && (
            <Pagination
              page={page}
              pageSize={pageSize}
              totalCount={data.totalCount}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
