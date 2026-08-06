import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, SlidersHorizontal, RotateCcw, Printer } from "lucide-react";
import { useGetPartiesQuery, useDeletePartyMutation } from "../partiesApi";
import QuickAddPartyModal from "../components/QuickAddPartyModal";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";
import { useInvoiceListPrint } from "../../../shared/hooks/useInvoiceListPrint";
import PartyListPrintTemplate from "../../../shared/components/print/PartyListPrintTemplate";

const CURRENCIES = ["EGP", "USD", "EUR", "GBP", "SAR", "AED", "KWD"];

export default function PartnersListPage() {
  const navigate = useNavigate();
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [filters, setFilters] = useState({
    search: "",
    code: "",
    taxNumber: "",
    currency: "",
    isActive: "",
  });

  const { data, isLoading, isFetching, isError, refetch } = useGetPartiesQuery({
    PageNumber: page,
    PageSize: pageSize,
    Search: filters.search || undefined,
    Code: filters.code || undefined,
    TaxNumber: filters.taxNumber || undefined,
    Currency: filters.currency || undefined,
    IsActive: filters.isActive === "" ? undefined : filters.isActive === "true",
  });

  const parties = data?.items ?? [];
  const [deleteParty] = useDeletePartyMutation();

  const handleChange = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      code: "",
      taxNumber: "",
      currency: "",
      isActive: "",
    });
    setPage(1);
  };

  const hasActiveFilters =
    filters.search ||
    filters.code ||
    filters.taxNumber ||
    filters.currency ||
    filters.isActive;

  const openCreate = () => {
    setEditingParty(null);
    setShowFormModal(true);
  };

  const handleDelete = (party) => {
    toast(`حذف "${party.name}"؟`, {
      description: "الإجراء ده لا يمكن التراجع عنه",
      action: {
        label: "تأكيد الحذف",
        onClick: async () => {
          try {
            await deleteParty(party.id).unwrap();
            toast.success("تم الحذف بنجاح");
          } catch (err) {
            toast.error("حصل خطأ أثناء الحذف، حاول تاني");
          }
        },
      },
      cancel: { label: "إلغاء" },
      duration: 6000,
    });
  };

  const { printList, printRef } = useInvoiceListPrint({
    title: "تقرير العملاء والموردين",
  });

  return (
    <div className="animate-fadeUp space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            العملاء / الموردين
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            إجمالي السجلات: {data?.totalCount ?? 0}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
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
                    className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink-400 mb-1.5">
                    الرقم الضريبي
                  </label>
                  <input
                    type="text"
                    value={filters.taxNumber}
                    onChange={handleChange("taxNumber")}
                    className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink-400 mb-1.5">
                    العملة
                  </label>
                  <select
                    value={filters.currency}
                    onChange={handleChange("currency")}
                    className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
                  >
                    <option value="">الكل</option>
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
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

          <Button variant="outline" onClick={printList}>
            <Printer size={16} />
            طباعة القائمة
          </Button>

          <Button onClick={openCreate}>
            <Plus size={16} />
            عميل / مورد جديد
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading && (
          <div className="p-4 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-10 rounded-lg bg-ink-400/5 animate-pulse"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-16">
            <p className="text-red-500 mb-3">حدث خطأ أثناء تحميل البيانات</p>
            <Button variant="outline" onClick={refetch}>
              إعادة المحاولة
            </Button>
          </div>
        )}

        {!isLoading && !isError && parties.length === 0 && (
          <div className="text-center py-16">
            <p className="text-ink-400 mb-3">لا يوجد عملاء أو موردين</p>
            <Button onClick={openCreate}>
              <Plus size={16} />
              إضافة أول عميل / مورد
            </Button>
          </div>
        )}

        {!isLoading && !isError && parties.length > 0 && (
          <>
            <table className="w-full text-right">
              <thead>
                <tr className="bg-ink-400/5 text-xs text-ink-400">
                  <th className="py-3 px-4 font-medium">الكود</th>
                  <th className="py-3 px-4 font-medium">الاسم</th>
                  <th className="py-3 px-4 font-medium">التليفون</th>
                  <th className="py-3 px-4 font-medium">العملة</th>
                  <th className="py-3 px-4 font-medium">حد الائتمان</th>
                  <th className="py-3 px-4 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {parties.map((party) => (
                  <tr
                    key={party.id}
                    onClick={() => navigate(`/dashboard/partners/${party.id}`)}
                    className="border-t border-ink-400/10 hover:bg-ink-400/5 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-xs text-ink-400 whitespace-nowrap">
                      {party.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-ink-900 max-w-[220px] truncate">
                      {party.name}
                    </td>
                    <td className="py-3 px-4 text-ink-700 whitespace-nowrap">
                      {party.phoneNumber || "—"}
                    </td>
                    <td className="py-3 px-4 text-ink-700 font-mono text-xs whitespace-nowrap">
                      {party.currency}
                    </td>
                    <td className="py-3 px-4 text-ink-900 font-semibold whitespace-nowrap">
                      {party.creditLimit != null
                        ? party.creditLimit.toLocaleString("ar-EG")
                        : "—"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={
                          party.isActive
                            ? "text-emerald-700 text-xs font-semibold bg-emerald-700/10 px-2 py-0.5 rounded-full"
                            : "text-red-500 text-xs font-semibold bg-red-500/10 px-2 py-0.5 rounded-full"
                        }
                      >
                        {party.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination
              page={page}
              pageSize={pageSize}
              totalCount={data?.totalCount ?? 0}
              totalPages={data?.totalPages ?? 1}
              isFetching={isFetching}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </>
        )}
      </div>

      <div className="hidden">
        <div ref={printRef}>
          <PartyListPrintTemplate parties={parties} filters={filters} />
        </div>
      </div>

      <QuickAddPartyModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        party={editingParty}
      />
    </div>
  );
}
