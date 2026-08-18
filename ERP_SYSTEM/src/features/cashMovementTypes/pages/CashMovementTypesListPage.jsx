import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetCashMovementTypesQuery,
  useDeleteCashMovementTypeMutation,
} from "../../cashboxes/cashMovementTypesApi";
import CashMovementTypeFormModal from "../components/CashMovementTypeFormModal";
import Modal from "../../../shared/components/ui/Modal";
import Pagination from "../../../shared/components/ui/Pagination";

const CLASSIFICATION_LABELS = {
  PartnerSettlement: "تسوية عميل/مورد",
  Expense: "مصروفات",
  Revenue: "إيرادات",
  Other: "أخرى",
};

const CLASSIFICATION_TONES = {
  PartnerSettlement: "bg-primary-50 text-primary-700",
  Expense: "bg-red-50 text-red-700",
  Revenue: "bg-emerald-50 text-emerald-800",
  Other: "bg-ink/5 text-ink/60",
};

function accountingEffect(type) {
  if (!type.forPartner)
    return { text: "بدون أثر على العميل/المورد", tone: "neutral" };
  if (type.direction === "Receipt")
    return { text: "دائن للعميل/المورد", tone: "credit" };
  return { text: "مدين على العميل/المورد", tone: "debit" };
}

function ClassificationBadge({ classification }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2 py-1 text-xs font-medium ${
        CLASSIFICATION_TONES[classification] || "bg-ink/5 text-ink/60"
      }`}
    >
      {CLASSIFICATION_LABELS[classification] || classification || "—"}
    </span>
  );
}

function DefaultBadges({ type }) {
  const badges = [
    type.isDefaultForSales && "بيع",
    type.isDefaultForPurchase && "شراء",
    type.isDefaultForSalesReturn && "مرتجع بيع",
    type.isDefaultForPurchaseReturn && "مرتجع شراء",
  ].filter(Boolean);

  if (!badges.length) return <span className="text-xs text-ink/30">—</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((b) => (
        <span
          key={b}
          className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-medium text-gold-900"
        >
          {b}
        </span>
      ))}
    </div>
  );
}

export default function CashMovementTypesListPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [direction, setDirection] = useState("");
  const [classification, setClassification] = useState("");
  const [forPartner, setForPartner] = useState("");
  const [isActive, setIsActive] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPageNumber(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useGetCashMovementTypesQuery({
    pageNumber,
    pageSize,
    search: search || undefined,
    direction: direction || undefined,
    classification: classification || undefined,
    forPartner: forPartner === "" ? undefined : forPartner === "true",
    isActive: isActive === "" ? undefined : isActive === "true",
  });

  const [deleteType, { isLoading: isDeleting }] =
    useDeleteCashMovementTypeMutation();

  const openCreate = () => {
    setPendingDelete(null);
    setEditingType(null);
    setModalOpen(true);
  };

  const openEdit = (type) => {
    setPendingDelete(null);
    setEditingType(type);
    setModalOpen(true);
  };

  const openDeleteConfirm = (type) => {
    setModalOpen(false);
    setPendingDelete(type);
  };

  const confirmDelete = async () => {
    try {
      await deleteType(pendingDelete.id).unwrap();
      toast.success("تم حذف نوع الحركة");
      setPendingDelete(null);
    } catch (err) {
      if (err?.status === 409 || err?.status === 400) {
        toast.error("النوع ده مستخدم في حركات سابقة، مينفعش يتحذف");
      } else {
        toast.error("حصل خطأ أثناء الحذف");
      }
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setDirection("");
    setClassification("");
    setForPartner("");
    setIsActive("");
    setPageNumber(1);
  };

  const hasActiveFilters =
    search || direction || classification || forPartner || isActive;
  const items = data?.items ?? [];

  return (
    <div dir="rtl" className="animate-fadeUp space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/20 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-ink">أنواع حركات الخزنة</h1>
          <p className="mt-1 text-sm text-ink/60">
            تصنيفات سندات القبض والصرف (تسوية عميل/مورد، مصروفات، إيرادات)،
            وربطها كافتراضي لفواتير البيع والشراء
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                showFilters
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                  : "border-gold/30 bg-white text-ink/70 hover:bg-ink/5"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              فلاتر
              {hasActiveFilters && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              )}
            </button>

            {showFilters && (
              <div className="absolute left-0 z-20 mt-2 w-80 animate-fadeUp space-y-3 rounded-2xl border border-gold/20 bg-white p-4 shadow-lg">
                <div>
                  <label className="mb-1.5 block text-xs text-ink/50">
                    بحث
                  </label>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
                    <input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="ابحث بالاسم..."
                      className="w-full rounded-xl border border-gold/30 bg-white py-2 pe-9 ps-3 text-sm outline-none transition-colors focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs text-ink/50">
                    التصنيف
                  </label>
                  <select
                    value={classification}
                    onChange={(e) => {
                      setClassification(e.target.value);
                      setPageNumber(1);
                    }}
                    className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-emerald-600"
                  >
                    <option value="">كل التصنيفات</option>
                    <option value="PartnerSettlement">تسوية عميل/مورد</option>
                    <option value="Expense">مصروفات</option>
                    <option value="Revenue">إيرادات</option>
                    <option value="Other">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs text-ink/50">
                    الاتجاه
                  </label>
                  <select
                    value={direction}
                    onChange={(e) => {
                      setDirection(e.target.value);
                      setPageNumber(1);
                    }}
                    className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-emerald-600"
                  >
                    <option value="">كل الاتجاهات</option>
                    <option value="Receipt">قبض</option>
                    <option value="Payment">صرف</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs text-ink/50">
                    الربط بعميل/مورد
                  </label>
                  <select
                    value={forPartner}
                    onChange={(e) => {
                      setForPartner(e.target.value);
                      setPageNumber(1);
                    }}
                    className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-emerald-600"
                  >
                    <option value="">عميل/مورد + عام</option>
                    <option value="true">مرتبط بعميل/مورد فقط</option>
                    <option value="false">عام فقط (مصاريف، أجور...)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs text-ink/50">
                    الحالة
                  </label>
                  <select
                    value={isActive}
                    onChange={(e) => {
                      setIsActive(e.target.value);
                      setPageNumber(1);
                    }}
                    className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-emerald-600"
                  >
                    <option value="">كل الحالات</option>
                    <option value="true">نشط فقط</option>
                    <option value="false">غير نشط فقط</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 pt-1 text-xs text-ink/50 transition-colors hover:text-emerald-700"
                  >
                    <RotateCcw className="h-3 w-3" />
                    إعادة تعيين الفلاتر
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" />
            إضافة نوع جديد
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden rounded-2xl border border-gold/20 bg-white shadow-sm transition-opacity duration-200 ${
          isFetching ? "opacity-60" : "opacity-100"
        }`}
      >
        <table className="w-full text-sm">
          <thead className="bg-ink/[0.03] text-ink/60">
            <tr>
              <th className="px-4 py-3 text-start text-xs font-medium">
                الاسم
              </th>
              <th className="px-4 py-3 text-start text-xs font-medium">
                التصنيف
              </th>
              <th className="px-4 py-3 text-start text-xs font-medium">
                الاتجاه
              </th>
              <th className="px-4 py-3 text-start text-xs font-medium">
                الأثر المحاسبي
              </th>
              <th className="px-4 py-3 text-start text-xs font-medium">
                افتراضي لـ
              </th>
              <th className="px-4 py-3 text-start text-xs font-medium">
                الحالة
              </th>
              <th className="px-4 py-3 text-start text-xs font-medium">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/10">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-4 py-3">
                    <div className="h-8 animate-pulse rounded-lg bg-ink/5" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center">
                  <p className="mb-3 text-sm text-ink/50">
                    {hasActiveFilters
                      ? "مفيش أنواع حركات مطابقة، جرّب تغيّر الفلاتر"
                      : "مفيش أنواع حركات لسه، ابدأ بإضافة نوع جديد"}
                  </p>
                  <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة نوع جديد
                  </button>
                </td>
              </tr>
            ) : (
              items.map((type) => {
                const effect = accountingEffect(type);
                return (
                  <tr
                    key={type.id}
                    className="transition-colors hover:bg-ink/[0.02]"
                  >
                    <td className="px-4 py-3 font-medium text-ink">
                      {type.name}
                      {!type.forPartner && (
                        <span className="ms-2 rounded bg-ink/5 px-1.5 py-0.5 text-[10px] text-ink/50">
                          عام
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ClassificationBadge
                        classification={type.classification}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {type.direction === "Receipt" ? (
                        <span className="flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
                          <ArrowDownCircle className="h-3.5 w-3.5" />
                          قبض
                        </span>
                      ) : (
                        <span className="flex w-fit items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                          <ArrowUpCircle className="h-3.5 w-3.5" />
                          صرف
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink/60">
                      {effect.text}
                    </td>
                    <td className="px-4 py-3">
                      <DefaultBadges type={type} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          type.isActive
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-ink/5 text-ink/40"
                        }`}
                      >
                        {type.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(type)}
                          className="rounded-lg p-1.5 text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
                          title="تعديل"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(type)}
                          className="rounded-lg p-1.5 text-red-500/70 transition-colors hover:bg-red-50 hover:text-red-700"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {data?.totalCount > 0 && (
        <Pagination
          page={pageNumber}
          pageSize={pageSize}
          totalCount={data.totalCount}
          totalPages={data?.totalPages ?? 1}
          isFetching={isFetching}
          onPageChange={setPageNumber}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageNumber(1);
          }}
          label="نوع"
        />
      )}

      <CashMovementTypeFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingType={editingType}
      />

      <Modal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="حذف نوع الحركة؟"
      >
        <p className="text-sm text-ink/60">
          هيتم حذف "{pendingDelete?.name}" نهائيًا. لو النوع ده مستخدم في حركات
          سابقة، الحذف هيترفض.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setPendingDelete(null)}
            className="rounded-xl border border-gold/30 px-4 py-2 text-sm text-ink transition-colors hover:bg-ink/5"
          >
            إلغاء
          </button>
          <button
            onClick={confirmDelete}
            disabled={isDeleting}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "جاري الحذف..." : "حذف"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
