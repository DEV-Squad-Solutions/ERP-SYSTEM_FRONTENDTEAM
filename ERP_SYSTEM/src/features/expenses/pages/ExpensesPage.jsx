import { useState } from "react";
import { Receipt, FileWarning } from "lucide-react";

import { useGetCashVouchersQuery } from "../../cashboxes/cashVouchersApi";
import { useGetCashboxesQuery } from "../../cashboxes/cashboxesApi";
import { useGetCashMovementTypesQuery } from "../../cashMovementTypes/cashMovementTypesApi";
import ExpenseFilters from "../components/ExpenseFilters";

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
  return `${new Intl.NumberFormat("ar-EG").format(n ?? 0)} ${currency ?? ""}`;
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
  const [filters, setFilters] = useState({
    draft: emptyFilters,
    applied: emptyFilters,
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const { data: cashboxesData } = useGetCashboxesQuery();
  const cashboxes = Array.isArray(cashboxesData)
    ? cashboxesData
    : (cashboxesData?.items ?? []);

  const { data: movementTypesData } = useGetCashMovementTypesQuery();
  const cashMovementTypes = Array.isArray(movementTypesData)
    ? movementTypesData
    : (movementTypesData?.items ?? []);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetCashVouchersQuery({
      Direction: "Payment", // المصاريف = سندات الصرف؛ ثابتة ومش قابلة للتغيير من الفلاتر
      PageNumber: page,
      PageSize: pageSize,
      ...filters.applied,
    });

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, applied: prev.draft }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters({ draft: emptyFilters, applied: emptyFilters });
    setPage(1);
  };

  return (
    <div className="animate-fadeUp">
      <div className="mb-6">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">
          <Receipt size={20} className="text-primary-500" />
          المصاريف
        </h2>
        <p className="mt-1 text-sm text-ink-400">
          سندات الصرف (Payment) من حركة الخزائن — تحصيلات المصاريف والدفعات
          النقدية
        </p>
      </div>

      <ExpenseFilters
        draft={filters.draft}
        cashboxes={cashboxes}
        cashMovementTypes={cashMovementTypes}
        onChange={(value) => setFilters((prev) => ({ ...prev, draft: value }))}
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
            onClick={refetch}
            className="rounded-lg border border-rose-200 bg-white px-3 py-1 text-xs font-medium hover:bg-rose-100"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {data && (
        <div className="overflow-x-auto rounded-2xl border border-ink-400/10 bg-white shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-400/5 text-ink-400">
                <th className="px-3 py-2 text-right font-medium">رقم السند</th>
                <th className="px-3 py-2 text-right font-medium">التاريخ</th>
                <th className="px-3 py-2 text-right font-medium">الخزينة</th>
                <th className="px-3 py-2 text-right font-medium">نوع الحركة</th>
                <th className="px-3 py-2 text-right font-medium">الجهة</th>
                <th className="px-3 py-2 text-right font-medium">المبلغ</th>
                <th className="px-3 py-2 text-right font-medium">الوصف</th>
                <th className="px-3 py-2 text-right font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-10 text-center text-ink-400"
                  >
                    لا توجد مصاريف مطابقة
                  </td>
                </tr>
              ) : (
                data.items.map((v) => (
                  <tr key={v.id} className="border-t border-ink-400/10">
                    <td className="px-3 py-2 font-medium text-ink-900">
                      {v.voucherNumber}
                      {v.invoiceNumber && (
                        <div className="text-xs text-ink-400">
                          فاتورة: {v.invoiceNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {fmtDate(v.voucherDate)}
                    </td>
                    <td className="px-3 py-2">{v.cashboxName}</td>
                    <td className="px-3 py-2">
                      {v.cashMovementTypeName ?? "—"}
                    </td>
                    <td className="px-3 py-2">{partyLabel(v)}</td>
                    <td className="px-3 py-2 font-bold text-rose-600">
                      {fmtAmount(v.amount, v.currency)}
                    </td>
                    <td className="px-3 py-2 text-ink-400">
                      {v.description || "—"}
                    </td>
                    <td className="px-3 py-2">
                      {v.isDraft ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-xs text-amber-600">
                          <FileWarning size={12} />
                          مسودة
                        </span>
                      ) : (
                        <span className="rounded bg-primary-500/10 px-2 py-0.5 text-xs text-primary-500">
                          معتمد
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-ink-400/10 px-4 py-2 text-xs text-ink-400">
            <span>
              صفحة {data.pageNumber} من {data.totalPages} — إجمالي{" "}
              {data.totalCount} مصروف
              {isFetching && " · جاري التحديث..."}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-ink-400/20 px-2 py-1 disabled:opacity-40"
              >
                السابق
              </button>
              <button
                disabled={data.pageNumber >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-ink-400/20 px-2 py-1 disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
