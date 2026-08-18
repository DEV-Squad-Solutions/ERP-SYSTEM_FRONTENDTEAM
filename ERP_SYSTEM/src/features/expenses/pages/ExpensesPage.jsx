import { useState } from "react";
import { Receipt, FileWarning, ExternalLink, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useGetCashVouchersQuery } from "../../cashboxes/cashVouchersApi";
import { useGetCashboxesQuery } from "../../cashboxes/cashboxesApi";
import { useGetCashMovementTypesQuery } from "../../cashboxes/cashMovementTypesApi";

import ExpenseFilters from "../components/ExpenseFilters";
import ExpenseQuickEntryModal from "../../cashboxes/components/ExpenseQuickEntryModal";

import Pagination from "../../../shared/components/ui/Pagination";

const emptyFilters = {
  Search: "",
  VoucherNumber: "",
  CashboxId: "",
  CashMovementTypeId: "",
  FromDate: "",
  ToDate: "",
  IsDraft: "",
};

function fmtAmount(n, currency) {
  return `${new Intl.NumberFormat("ar-EG", {
    maximumFractionDigits: 2,
  }).format(n ?? 0)} ${currency ?? ""}`;
}

function fmtDate(d) {
  if (!d) return "—";

  return new Date(d).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function partyLabel(v) {
  switch (v.partyType) {
    case "Partner":
      return v.businessPartnerName ?? "—";

    case "Driver":
      return v.driverTripInvoiceNumber
        ? `${v.driverName} (رحلة ${v.driverTripInvoiceNumber})`
        : (v.driverName ?? "—");

    case "Other":
      return v.externalPartyName ?? "—";

    default:
      return "—";
  }
}

export default function ExpensesPage() {
  const navigate = useNavigate();

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    draft: emptyFilters,
    applied: emptyFilters,
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // =========================================================
  // Cashboxes
  // =========================================================

  const { data: cashboxesData } = useGetCashboxesQuery();

  const cashboxes = Array.isArray(cashboxesData)
    ? cashboxesData
    : (cashboxesData?.items ?? []);

  // =========================================================
  // Cash Movement Types
  // =========================================================

  const { data: movementTypesData } = useGetCashMovementTypesQuery();

  const cashMovementTypes = Array.isArray(movementTypesData)
    ? movementTypesData
    : (movementTypesData?.items ?? []);

  // =========================================================
  // Expenses
  // =========================================================

  const { data, isLoading, isFetching, isError, refetch } =
    useGetCashVouchersQuery({
      Direction: "Payment",

      PageNumber: page,
      PageSize: pageSize,

      ...filters.applied,
    });

  // =========================================================
  // Search
  // =========================================================

  function handleSearch() {
    setFilters((prev) => ({
      ...prev,
      applied: prev.draft,
    }));

    setPage(1);
  }

  // =========================================================
  // Reset
  // =========================================================

  function handleReset() {
    setFilters({
      draft: emptyFilters,
      applied: emptyFilters,
    });

    setPage(1);
  }

  // =========================================================
  // Open Voucher
  // =========================================================

  /**
   * فتح السند داخل الخزنة
   *
   * route:
   * /dashboard/treasury/{cashboxId}?voucherId={voucherId}
   */
  function openVoucher(voucher) {
    if (!voucher?.cashboxId || !voucher?.id) {
      return;
    }

    navigate(
      `/dashboard/treasury/${voucher.cashboxId}?voucherId=${voucher.id}`,
    );
  }

  // =========================================================
  // Expense Saved
  // =========================================================

  return (
    <div className="animate-fadeUp">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">
            <Receipt size={20} className="text-primary-500" />
            المصاريف
          </h2>

          <p className="mt-1 text-sm text-ink-400">
            جميع سندات الصرف المسجلة على الخزائن
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpenseModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-600"
        >
          <Plus size={16} />
          تسجيل مصروف
        </button>
      </div>

      {/* Filters */}
      <ExpenseFilters
        draft={filters.draft}
        cashboxes={cashboxes}
        cashMovementTypes={cashMovementTypes}
        onChange={(value) =>
          setFilters((prev) => ({
            ...prev,
            draft: value,
          }))
        }
        onSearch={handleSearch}
        onReset={handleReset}
      />
      {/* ==================== Loading ==================== */}

      {isLoading && (
        <div className="rounded-2xl border border-dashed border-ink-400/20 py-16 text-center text-ink-400">
          جاري تحميل المصاريف...
        </div>
      )}

      {/* ==================== Error ==================== */}

      {isError && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          <span>حدث خطأ أثناء تحميل المصاريف.</span>

          <button
            type="button"
            onClick={refetch}
            className="rounded-lg border border-rose-200 bg-white px-3 py-1 text-xs font-medium transition hover:bg-rose-100"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* ==================== Data ==================== */}

      {data && (
        <div
          className={`overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${
            isFetching ? "opacity-70" : ""
          }`}
        >
          <div className="overflow-x-auto">
            <table
              className="w-full min-w-[900px] table-fixed text-sm"
              dir="rtl"
            >
              <colgroup>
                <col className="w-[11%]" />
                <col className="w-[10%]" />
                <col className="w-[14%]" />
                <col className="w-[16%]" />
                <col className="w-[15%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
                <col className="w-[8%]" />
              </colgroup>

              <thead>
                <tr className="bg-ink-400/5 text-xs text-ink-400">
                  <th className="px-3 py-2.5 text-right font-medium">
                    رقم السند
                  </th>

                  <th className="px-3 py-2.5 text-right font-medium">
                    التاريخ
                  </th>

                  <th className="px-3 py-2.5 text-right font-medium">
                    الخزينة
                  </th>

                  <th className="px-3 py-2.5 text-right font-medium">
                    نوع الحركة
                  </th>

                  <th className="px-3 py-2.5 text-right font-medium">الجهة</th>

                  <th className="px-3 py-2.5 text-right font-medium">المبلغ</th>

                  <th className="px-3 py-2.5 text-right font-medium">الوصف</th>

                  <th className="px-3 py-2.5 text-right font-medium">الحالة</th>
                </tr>
              </thead>

              <tbody>
                {data.items?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-14 text-center text-ink-400"
                    >
                      لا توجد مصاريف مطابقة
                    </td>
                  </tr>
                ) : (
                  data.items.map((v) => (
                    <tr
                      key={v.id}
                      className="border-t border-ink-400/10 transition-colors hover:bg-ink-900/[0.015]"
                    >
                      {/* ==================== Voucher ==================== */}

                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => openVoucher(v)}
                          className="group flex max-w-full items-center gap-1.5 text-right"
                          title="فتح السند داخل الخزنة"
                        >
                          <span className="truncate font-semibold text-primary-600 transition-colors group-hover:text-primary-800 group-hover:underline">
                            {v.voucherNumber || `#${v.id}`}
                          </span>

                          <ExternalLink
                            size={12}
                            className="shrink-0 text-ink-300 opacity-0 transition-opacity group-hover:opacity-100"
                          />
                        </button>

                        {v.invoiceNumber && (
                          <div
                            className="mt-0.5 truncate text-[11px] text-ink-400"
                            title={`فاتورة: ${v.invoiceNumber}`}
                          >
                            فاتورة: {v.invoiceNumber}
                          </div>
                        )}
                      </td>

                      {/* ==================== Date ==================== */}

                      <td className="whitespace-nowrap px-3 py-2.5 text-xs text-ink-600">
                        {fmtDate(v.voucherDate)}
                      </td>

                      {/* ==================== Cashbox ==================== */}

                      <td className="px-3 py-2.5" title={v.cashboxName || ""}>
                        <span className="block truncate font-medium text-ink-800">
                          {v.cashboxName || "—"}
                        </span>
                      </td>

                      {/* ==================== Movement Type ==================== */}

                      <td
                        className="px-3 py-2.5"
                        title={v.cashMovementTypeName || ""}
                      >
                        <span className="block truncate text-ink-700">
                          {v.cashMovementTypeName ?? "—"}
                        </span>
                      </td>

                      {/* ==================== Party ==================== */}

                      <td className="px-3 py-2.5" title={partyLabel(v)}>
                        <span className="block truncate text-ink-700">
                          {partyLabel(v)}
                        </span>
                      </td>

                      {/* ==================== Amount ==================== */}

                      <td className="whitespace-nowrap px-3 py-2.5 font-bold text-rose-600">
                        {fmtAmount(v.amount, v.currency)}

                        {v.baseCurrency &&
                          v.baseCurrency !== v.currency &&
                          v.baseAmount != null && (
                            <div className="mt-0.5 text-[10px] font-normal text-ink-400">
                              {fmtAmount(v.baseAmount, v.baseCurrency)}
                            </div>
                          )}
                      </td>

                      {/* ==================== Description ==================== */}

                      <td
                        className="px-3 py-2.5 text-ink-400"
                        title={v.description || ""}
                      >
                        <span className="block truncate">
                          {v.description || "—"}
                        </span>
                      </td>

                      {/* ==================== Status ==================== */}

                      <td className="px-3 py-2.5">
                        {v.isDraft ? (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-amber-500/10 px-2 py-1 text-[11px] text-amber-600">
                            <FileWarning size={12} />
                            مسودة
                          </span>
                        ) : (
                          <span className="inline-flex whitespace-nowrap rounded-md bg-primary-500/10 px-2 py-1 text-[11px] text-primary-500">
                            معتمد
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ==================== Pagination ==================== */}

          {data.totalCount > 0 && (
            <Pagination
              page={data.pageNumber || page}
              pageSize={data.pageSize || pageSize}
              totalCount={data.totalCount}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              label="مصروف"
            />
          )}
        </div>
      )}

      {/* =====================================================
          Add Expense Modal
      ===================================================== */}

      <ExpenseQuickEntryModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        onSaved={() => {
          setPage(1);
          refetch();
        }}
      />
    </div>
  );
}
