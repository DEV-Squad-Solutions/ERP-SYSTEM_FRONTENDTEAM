import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Plus,
  SlidersHorizontal,
  RotateCcw,
  Printer,
  Pencil,
} from "lucide-react";

import { useGetPartiesQuery, useDeletePartyMutation } from "../partiesApi";

import PartnerSetupWizard from "../components/PartnerSetupWizard";
import EditPartyModal from "../components/EditPartyModal";

import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";
import { useInvoiceListPrint } from "../../../shared/hooks/useInvoiceListPrint";
import PartyListPrintTemplate from "../../../shared/components/print/PartyListPrintTemplate";

const CURRENCIES = ["EGP", "USD", "EUR", "GBP", "SAR", "AED", "KWD"];

export default function PartnersListPage() {
  const navigate = useNavigate();

  const [showCreateModal, setShowCreateModal] = useState(false);
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
    setFilters((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));

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
    setShowCreateModal(true);
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
          } catch (error) {
            toast.error(
              error?.data?.message ||
                error?.data?.title ||
                "حصل خطأ أثناء الحذف",
            );
          }
        },
      },

      cancel: {
        label: "إلغاء",
      },

      duration: 6000,
    });
  };

  const { printList, printRef } = useInvoiceListPrint({
    title: "تقرير العملاء والموردين",
  });

  return (
    <div className="animate-fadeUp space-y-6">
      {/* Header */}
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
          {/* Filters */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <SlidersHorizontal size={16} />
              فلاتر
              {hasActiveFilters && (
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-700" />
              )}
            </Button>

            {showFilters && (
              <div className="absolute left-0 z-20 mt-2 w-80 space-y-3 rounded-2xl border border-ink-400/10 bg-white p-4 shadow-lg">
                <div>
                  <label className="mb-1.5 block text-xs text-ink-400">
                    بحث
                  </label>

                  <input
                    type="text"
                    value={filters.search}
                    onChange={handleChange("search")}
                    placeholder="ابحث بالاسم..."
                    className="w-full rounded-xl border border-ink-400/15 px-3 py-2 text-sm focus:border-emerald-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-700/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs text-ink-400">
                    الكود
                  </label>

                  <input
                    type="text"
                    value={filters.code}
                    onChange={handleChange("code")}
                    className="w-full rounded-xl border border-ink-400/15 px-3 py-2 text-sm focus:border-emerald-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-700/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs text-ink-400">
                    الرقم الضريبي
                  </label>

                  <input
                    type="text"
                    value={filters.taxNumber}
                    onChange={handleChange("taxNumber")}
                    className="w-full rounded-xl border border-ink-400/15 px-3 py-2 text-sm focus:border-emerald-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-700/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs text-ink-400">
                    العملة
                  </label>

                  <select
                    value={filters.currency}
                    onChange={handleChange("currency")}
                    className="w-full rounded-xl border border-ink-400/15 bg-white px-3 py-2 text-sm focus:border-emerald-700/50 focus:outline-none"
                  >
                    <option value="">الكل</option>

                    {CURRENCIES.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs text-ink-400">
                    الحالة
                  </label>

                  <select
                    value={filters.isActive}
                    onChange={handleChange("isActive")}
                    className="w-full rounded-xl border border-ink-400/15 bg-white px-3 py-2 text-sm focus:border-emerald-700/50 focus:outline-none"
                  >
                    <option value="">الكل</option>
                    <option value="true">نشط</option>
                    <option value="false">غير نشط</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 pt-1 text-xs text-ink-400 hover:text-emerald-700"
                  >
                    <RotateCcw size={12} />
                    إعادة تعيين الفلاتر
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Print */}
          <Button variant="outline" onClick={printList}>
            <Printer size={16} />
            طباعة القائمة
          </Button>

          {/* Create */}
          <Button onClick={openCreate}>
            <Plus size={16} />
            إنشاء شريك
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading && (
          <div className="space-y-2 p-4">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-10 animate-pulse rounded-lg bg-ink-400/5"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="py-16 text-center">
            <p className="mb-3 text-red-500">حدث خطأ أثناء تحميل البيانات</p>

            <Button variant="outline" onClick={refetch}>
              إعادة المحاولة
            </Button>
          </div>
        )}

        {!isLoading && !isError && parties.length === 0 && (
          <div className="py-16 text-center">
            <p className="mb-3 text-ink-400">لا يوجد عملاء أو موردين</p>

            <Button onClick={openCreate}>
              <Plus size={16} />
              إنشاء شريك
            </Button>
          </div>
        )}

        {!isLoading && !isError && parties.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-ink-400/5 text-xs text-ink-400">
                    <th className="px-4 py-3 font-medium">الكود</th>

                    <th className="px-4 py-3 font-medium">الاسم</th>

                    <th className="px-4 py-3 font-medium">التليفون</th>

                    <th className="px-4 py-3 font-medium">العملة</th>

                    <th className="px-4 py-3 font-medium">حد الائتمان</th>

                    <th className="px-4 py-3 font-medium">الحالة</th>

                    <th className="px-4 py-3 font-medium">إجراءات</th>
                  </tr>
                </thead>

                <tbody>
                  {parties.map((party) => (
                    <tr
                      key={party.id}
                      onClick={() =>
                        navigate(`/dashboard/partners/${party.id}`)
                      }
                      className="cursor-pointer border-t border-ink-400/10 transition-colors hover:bg-ink-400/5"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ink-400">
                        {party.code}
                      </td>

                      <td className="max-w-[220px] truncate px-4 py-3 font-semibold text-ink-900">
                        {party.name}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-ink-700">
                        {party.phoneNumber || "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ink-700">
                        {party.currency}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink-900">
                        {party.creditLimit != null
                          ? party.creditLimit.toLocaleString("ar-EG")
                          : "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={
                            party.isActive
                              ? "rounded-full bg-emerald-700/10 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                              : "rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-500"
                          }
                        >
                          {party.isActive ? "نشط" : "غير نشط"}
                        </span>
                      </td>

                      <td
                        className="px-4 py-3"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          onClick={() => setEditingParty(party)}
                          className="h-8 px-2"
                        >
                          <Pencil size={15} />
                          تعديل
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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

      {/* Print */}
      <div className="hidden">
        <div ref={printRef}>
          <PartyListPrintTemplate parties={parties} filters={filters} />
        </div>
      </div>

      {/* Create Partner Wizard */}
      <PartnerSetupWizard
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          setShowCreateModal(false);
          refetch();
        }}
      />

      {/* Edit Partner */}
      <EditPartyModal
        isOpen={!!editingParty}
        party={editingParty}
        onClose={() => setEditingParty(null)}
      />
    </div>
  );
}
