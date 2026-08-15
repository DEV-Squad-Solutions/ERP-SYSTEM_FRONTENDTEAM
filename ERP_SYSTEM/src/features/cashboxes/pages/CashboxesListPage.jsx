import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ArrowLeftRight,
  Search,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import {
  useGetCashboxesQuery,
  useDeleteCashboxMutation,
} from "../cashboxesApi";

import CashboxCard from "../components/CashboxCard";
import CashboxFormModal from "../components/CashboxFormModal";
import CashboxTransferModal from "../components/CashboxTransferFormModal";

import Pagination from "../../../shared/components/ui/Pagination";
import Button from "../../../shared/components/ui/Button";

export default function CashboxesListPage() {
  const navigate = useNavigate();

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Search debounce
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("");
  const [isActive, setIsActive] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingCashbox, setEditingCashbox] = useState(null);

  // Search debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPageNumber(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const {
    data: cashboxes,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetCashboxesQuery({
    pageNumber,
    pageSize,
    search: search || undefined,
    code: code || undefined,
    name: name || undefined,
    currency: currency || undefined,
    isActive: isActive === "" ? undefined : isActive === "true",
  });

  const [deleteCashbox, { isLoading: isDeleting }] = useDeleteCashboxMutation();

  const items = cashboxes?.items ?? [];

  const openCreate = () => {
    setEditingCashbox(null);
    setShowFormModal(true);
  };

  const openEdit = (cashbox) => {
    setEditingCashbox(cashbox);
    setShowFormModal(true);
  };

  const handleDelete = (cashbox) => {
    toast(`حذف "${cashbox.name}"؟`, {
      description: "الإجراء ده لا يمكن التراجع عنه",

      action: {
        label: "تأكيد الحذف",
        onClick: async () => {
          try {
            await deleteCashbox(cashbox.id).unwrap();

            toast.success("تم حذف الخزنة بنجاح");
          } catch {
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

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setCode("");
    setName("");
    setCurrency("");
    setIsActive("");
    setPageNumber(1);
  };

  const hasActiveFilters = search || code || name || currency || isActive;

  return (
    <div dir="rtl" className="animate-fadeUp space-y-4 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/20 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-ink">الخزائن</h1>

          <p className="mt-1 text-sm text-ink/60">
            إدارة الخزائن النقدية والحسابات البنكية
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters */}
          <div className="relative">
            <button
              type="button"
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
              <>
                {/* Overlay */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFilters(false)}
                />

                {/* Dropdown */}
                <div className="absolute left-0 z-20 mt-2 w-80 animate-fadeUp space-y-3 rounded-2xl border border-gold/20 bg-white p-4 shadow-lg">
                  {/* Search */}
                  <div>
                    <label className="mb-1.5 block text-xs text-ink/50">
                      بحث
                    </label>

                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />

                      <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="ابحث بالكود أو الاسم..."
                        className="w-full rounded-xl border border-gold/30 bg-white py-2 pe-9 ps-3 text-sm outline-none transition-colors focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Code */}
                  <div>
                    <label className="mb-1.5 block text-xs text-ink/50">
                      الكود
                    </label>

                    <input
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value);
                        setPageNumber(1);
                      }}
                      placeholder="كود الخزنة..."
                      className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-emerald-600"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="mb-1.5 block text-xs text-ink/50">
                      اسم الخزنة
                    </label>

                    <input
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setPageNumber(1);
                      }}
                      placeholder="اسم الخزنة..."
                      className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-emerald-600"
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="mb-1.5 block text-xs text-ink/50">
                      العملة
                    </label>

                    <select
                      value={currency}
                      onChange={(e) => {
                        setCurrency(e.target.value);
                        setPageNumber(1);
                      }}
                      className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-emerald-600"
                    >
                      <option value="">كل العملات</option>

                      <option value="EGP">EGP</option>

                      <option value="USD">USD</option>

                      <option value="EUR">EUR</option>

                      <option value="GBP">GBP</option>

                      <option value="SAR">SAR</option>

                      <option value="AED">AED</option>

                      <option value="KWD">KWD</option>
                    </select>
                  </div>

                  {/* Status */}
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

                      <option value="true">نشطة فقط</option>

                      <option value="false">غير نشطة فقط</option>
                    </select>
                  </div>

                  {/* Reset */}
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="flex items-center gap-1.5 pt-1 text-xs text-ink/50 transition-colors hover:text-emerald-700"
                    >
                      <RotateCcw className="h-3 w-3" />
                      إعادة تعيين الفلاتر
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Transfer */}
          <Button variant="outline" onClick={() => setShowTransferModal(true)}>
            <ArrowLeftRight size={16} />
            تحويل بين الخزائن
          </Button>

          {/* Create */}
          <Button onClick={openCreate}>
            <Plus size={16} />
            خزنة جديدة
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-ink/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="text-center py-20 border border-dashed border-red-200 rounded-2xl bg-white">
          <p className="text-red-500 mb-3">حدث خطأ أثناء تحميل الخزائن</p>

          <Button variant="outline" onClick={refetch}>
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="text-center py-20 border border-dashed border-ink-400/20 rounded-2xl bg-white">
          <p className="text-ink-400 mb-3">
            {hasActiveFilters ? "مفيش خزائن مطابقة للفلاتر" : "مفيش خزائن لسه"}
          </p>

          {hasActiveFilters ? (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gold/30 px-4 py-2 text-sm text-ink transition-colors hover:bg-ink/5"
            >
              <RotateCcw className="h-4 w-4" />
              إعادة تعيين الفلاتر
            </button>
          ) : (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              إضافة خزنة جديدة
            </button>
          )}
        </div>
      )}

      {/* Cards */}
      {!isLoading && !isError && items.length > 0 && (
        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200 ${
            isFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          {items.map((cashbox) => (
            <CashboxCard
              key={cashbox.id}
              cashbox={cashbox}
              onClick={() => navigate(`/dashboard/treasury/${cashbox.id}`)}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {cashboxes?.totalCount > 0 && (
        <Pagination
          page={pageNumber}
          pageSize={pageSize}
          totalCount={cashboxes.totalCount}
          totalPages={cashboxes.totalPages ?? 1}
          isFetching={isFetching}
          onPageChange={setPageNumber}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageNumber(1);
          }}
          label="خزنة"
        />
      )}

      {/* Create / Edit */}
      <CashboxFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        cashbox={editingCashbox}
        onSaved={(saved) => {
          if (!editingCashbox) {
            navigate(`/dashboard/treasury/${saved.id}`);
          }
        }}
      />

      {/* Transfer */}
      <CashboxTransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        cashboxes={items}
        onDone={refetch}
      />
    </div>
  );
}
