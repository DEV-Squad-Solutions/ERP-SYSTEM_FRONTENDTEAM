import { useState } from "react";
import { Receipt, FileWarning, ExternalLink, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useGetCashVouchersQuery } from "../../cashboxes/cashVouchersApi";
import { useGetCashboxesQuery } from "../../cashboxes/cashboxesApi";
import { useGetCashMovementTypesQuery } from "../../cashboxes/cashMovementTypesApi";
import { useGetExpenseAccountsSelectQuery } from "../../accounts/accountsApi";

import ExpenseFilters from "../components/ExpenseFilters";
import ExpenseDetailsModal from "../components/ExpenseDetailsModal";
import Pagination from "../../../shared/components/ui/Pagination";

const emptyFilters = {
  search: "",
  voucherNumber: "",
  cashboxId: "",
  cashMovementTypeId: "",
  accountId: "",
  includeSubAccounts: false,
  fromDate: "",
  toDate: "",
  isDraft: "",
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
        ? `${v.driverName ?? "—"} (رحلة ${v.driverTripInvoiceNumber})`
        : (v.driverName ?? "—");

    case "Employee":
      return v.employeeName ?? "—";

    case "Other":
      return v.externalPartyName ?? "—";

    default:
      return "—";
  }
}

export default function ExpensesPage() {
  const navigate = useNavigate();

  const [viewingVoucher, setViewingVoucher] = useState(null);

  const [filters, setFilters] = useState({
    draft: { ...emptyFilters },
    applied: { ...emptyFilters },
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: cashboxesData } = useGetCashboxesQuery();

  const cashboxes = Array.isArray(cashboxesData)
    ? cashboxesData
    : (cashboxesData?.items ?? []);

  const { data: movementTypesData } = useGetCashMovementTypesQuery();

  const cashMovementTypes = Array.isArray(movementTypesData)
    ? movementTypesData
    : (movementTypesData?.items ?? []);

  const { data: expenseAccountsData } = useGetExpenseAccountsSelectQuery();

  const expenseAccounts = Array.isArray(expenseAccountsData)
    ? expenseAccountsData
    : (expenseAccountsData?.items ?? []);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetCashVouchersQuery({
      classification: "Expense",
      pageNumber: page,
      pageSize,
      ...filters.applied,
    });

  function handleSearch() {
    setFilters((prev) => ({
      ...prev,
      applied: {
        ...prev.draft,
      },
    }));

    setPage(1);
  }

  function handleReset() {
    const reset = { ...emptyFilters };

    setFilters({
      draft: reset,
      applied: reset,
    });

    setPage(1);
  }

  function openVoucher(voucher) {
    if (!voucher?.cashboxId || !voucher?.id) {
      return;
    }

    navigate(
      `/dashboard/treasury/${voucher.cashboxId}?voucherId=${voucher.id}`,
    );
  }

  return (
    <div className="animate-fadeUp">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">
            <Receipt size={20} className="text-primary-500" />
            المصاريف
          </h2>

          <p className="mt-1 text-sm text-ink-400">
            جميع سندات الصرف المصنّفة كمصروفات
          </p>
        </div>
      </div>

      <ExpenseFilters
        draft={filters.draft}
        cashboxes={cashboxes}
        cashMovementTypes={cashMovementTypes}
        expenseAccounts={expenseAccounts}
        onChange={(value) =>
          setFilters((prev) => ({
            ...prev,
            draft: value,
          }))
        }
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {isLoading && (
        <div className="rounded-2xl border border-dashed border-ink-400/20 py-16 text-center text-ink-400">
          جاري تحميل المصاريف...
        </div>
      )}

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

      {data && (
        <div
          className={`overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${
            isFetching ? "opacity-70" : ""
          }`}
        >
          <div className="overflow-x-auto">
            <table
              className="w-full min-w-[1150px] table-fixed text-sm"
              dir="rtl"
            >
              <colgroup>
                <col className="w-[9%]" />
                <col className="w-[8%]" />
                <col className="w-[11%]" />
                <col className="w-[12%]" />
                <col className="w-[15%]" />
                <col className="w-[13%]" />
                <col className="w-[11%]" />
                <col className="w-[10%]" />
                <col className="w-[7%]" />
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

                  <th className="px-3 py-2.5 text-right font-medium">
                    حساب المصروف
                  </th>

                  <th className="px-3 py-2.5 text-right font-medium">الجهة</th>

                  <th className="px-3 py-2.5 text-right font-medium">المبلغ</th>

                  <th className="px-3 py-2.5 text-right font-medium">الوصف</th>

                  <th className="px-3 py-2.5 text-right font-medium">الحالة</th>

                  <th className="px-3 py-2.5 text-right font-medium">
                    إجراءات
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.items?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
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

                      <td className="whitespace-nowrap px-3 py-2.5 text-xs text-ink-600">
                        {fmtDate(v.voucherDate)}
                      </td>

                      <td className="px-3 py-2.5" title={v.cashboxName || ""}>
                        <span className="block truncate font-medium text-ink-800">
                          {v.cashboxName || "—"}
                        </span>
                      </td>

                      <td
                        className="px-3 py-2.5"
                        title={v.cashMovementTypeName || ""}
                      >
                        <span className="block truncate text-ink-700">
                          {v.cashMovementTypeName || "—"}
                        </span>
                      </td>

                      <td
                        className="px-3 py-2.5"
                        title={
                          v.accountName
                            ? `${v.accountCode || ""} - ${v.accountName}`
                            : ""
                        }
                      >
                        {v.accountName ? (
                          <div className="min-w-0">
                            <span className="block truncate font-medium text-ink-800">
                              {v.accountName}
                            </span>

                            {v.accountCode && (
                              <span className="block truncate text-[10px] text-ink-400">
                                {v.accountCode}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-ink-300">—</span>
                        )}
                      </td>

                      <td className="px-3 py-2.5" title={partyLabel(v)}>
                        <span className="block truncate text-ink-700">
                          {partyLabel(v)}
                        </span>
                      </td>

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

                      <td
                        className="px-3 py-2.5 text-ink-400"
                        title={v.description || ""}
                      >
                        <span className="block truncate">
                          {v.description || "—"}
                        </span>
                      </td>

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

                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingVoucher(v)}
                            title="عرض التفاصيل"
                            className="rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-400/10 hover:text-ink-700"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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

      <ExpenseDetailsModal
        voucher={viewingVoucher}
        onClose={() => setViewingVoucher(null)}
        onEdit={() => {}}
      />
    </div>
  );
}
