import { FileSearch, AlertCircle, RefreshCw } from "lucide-react";
import BalanceBadge from "./BalanceBadge";
import Pagination from "../../../shared/components/ui/Pagination";

const SOURCE_TYPE_LABELS = {
  OpeningBalance: "رصيد افتتاحي",
  SalaryTransfer: "تحويل راتب",
  Movement: "حركة",
  CashVoucher: "سند نقدي",
};

export default function EmployeeStatementTable({
  data,
  isLoading,
  isFetching,
  isError,
  refetch,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-ink-400/5" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-negative/25 bg-negative/[0.02] py-14 text-center">
        <AlertCircle
          size={34}
          className="mx-auto mb-3 text-negative/70"
          strokeWidth={1.6}
        />

        <p className="mb-1 font-medium text-ink-900">
          حدث خطأ في تحميل كشف حساب الموظف
        </p>

        <button
          type="button"
          onClick={refetch}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-500 transition-colors hover:bg-primary-100 hover:text-primary-600"
        >
          <RefreshCw size={15} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const items = data?.items || [];
  const currency = data?.currency || "EGP";
  const baseCurrency = data?.baseCurrency || "EGP";
  const isForeignCurrency = currency !== baseCurrency;

  const fmt = (value, maximumFractionDigits = 2) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    return Number(value).toLocaleString("ar-EG", {
      minimumFractionDigits: 0,
      maximumFractionDigits,
    });
  };

  const fmtRate = (value) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    return Number(value).toLocaleString("ar-EG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  };

  const formatMoney = (value, code = currency) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    return `${fmt(value)} ${code}`;
  };

  const renderBaseValue = (value, className = "") => {
    if (!isForeignCurrency) {
      return null;
    }

    return (
      <div
        className={[
          "mt-1 text-[10px] font-normal text-ink-400",
          className,
        ].join(" ")}
      >
        ≈ {formatMoney(value, baseCurrency)}
      </div>
    );
  };

  if (!isFetching && items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-400/20 py-16 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-ink-400/5">
          <FileSearch size={26} className="text-ink-400/50" strokeWidth={1.6} />
        </div>

        <p className="font-medium text-ink-900">لا توجد حركات مطابقة</p>
      </div>
    );
  }

  return (
    <div
      className={[
        "overflow-hidden rounded-2xl",
        "border border-ink-400/10",
        "bg-white shadow-card",
        "transition-opacity duration-200",
        isFetching ? "opacity-60" : "",
      ].join(" ")}
    >
      <div className="overflow-x-auto custom-scroll">
        <table className="min-w-[1050px] border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr className="border-b border-ink-400/10 text-xs font-semibold text-ink-600">
              <th className="w-48 px-4 py-3 text-center">
                الرصيد
                <div className="mt-0.5 text-[10px] font-normal text-ink-400">
                  {currency}
                </div>
              </th>

              <th className="w-32 px-4 py-3 text-center text-positive">
                مدين
                <div className="mt-0.5 text-[10px] font-normal text-ink-400">
                  {currency}
                </div>
              </th>

              <th className="w-32 px-4 py-3 text-center text-negative">
                دائن
                <div className="mt-0.5 text-[10px] font-normal text-ink-400">
                  {currency}
                </div>
              </th>

              <th className="min-w-[280px] px-4 py-3 text-right">البيان</th>

              <th className="w-36 px-4 py-3 text-center">التاريخ</th>

              <th className="w-44 px-4 py-3 text-right">رقم المستند</th>

              <th className="w-40 px-4 py-3 text-right">رقم المرجع</th>

              {isForeignCurrency && (
                <th className="w-32 px-4 py-3 text-center">سعر الصرف</th>
              )}
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => {
              const sourceLabel =
                SOURCE_TYPE_LABELS[item.sourceType] ||
                item.sourceType ||
                "حركة";

              const movementName = item.movementName?.trim() || null;

              return (
                <tr
                  key={`${item.sourceType}-${item.sourceId}-${item.date}-${index}`}
                  className="border-b border-ink-400/5 transition-colors hover:bg-slate-50 last:border-0"
                >
                  <td className="px-4 py-3 text-center">
                    <BalanceBadge
                      amount={item.balanceAmount}
                      description={item.balanceDescription}
                    />

                    {renderBaseValue(item.baseBalanceAmount)}
                  </td>

                  <td className="num px-4 py-3 text-center font-medium text-positive">
                    {item.debitAmount > 0 ? formatMoney(item.debitAmount) : "—"}

                    {item.debitAmount > 0 &&
                      renderBaseValue(item.baseDebitAmount)}
                  </td>

                  <td className="num px-4 py-3 text-center font-medium text-negative">
                    {item.creditAmount > 0
                      ? formatMoney(item.creditAmount)
                      : "—"}

                    {item.creditAmount > 0 &&
                      renderBaseValue(item.baseCreditAmount)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="font-medium text-ink-900">
                      {sourceLabel}
                    </div>

                    <div className="mt-0.5 text-xs text-ink-500">
                      {movementName || "بدون توصيف للحركة"}
                    </div>

                    {item.description && (
                      <div className="mt-1 rounded-md bg-slate-50 px-2 py-1 text-xs text-ink-400">
                        {item.description}
                      </div>
                    )}
                  </td>

                  <td className="num whitespace-nowrap px-4 py-3 text-center text-ink-600">
                    {item.date || "—"}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <span className="font-medium text-ink-600">
                      {item.documentNumber || "—"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <span className="text-ink-500">
                      {item.referenceNumber || "—"}
                    </span>
                  </td>

                  {isForeignCurrency && (
                    <td className="num px-4 py-3 text-center">
                      <span className="font-medium text-ink-700">
                        {fmtRate(item.exchangeRate)}
                      </span>

                      <div className="mt-0.5 text-[10px] text-ink-400">
                        {currency} → {baseCurrency}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data?.summary && (
        <div className="border-t border-ink-400/10 bg-slate-50 px-5 py-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-ink-900">
                ملخص كشف الحساب
              </h3>

              <p className="mt-0.5 text-xs text-ink-400">
                العملة: {currency}
                {isForeignCurrency && ` · العملة الأساسية: ${baseCurrency}`}
              </p>
            </div>

            {isForeignCurrency && (
              <div className="rounded-lg border border-ink-400/10 bg-white px-3 py-1.5 text-xs text-ink-500">
                القيم الأساسية معروضة بالجنيه المصري
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-ink-400/10 bg-white p-4">
              <div className="mb-2 text-xs text-ink-400">رصيد أول المدة</div>

              <BalanceBadge
                amount={data.summary.openingBalanceAmount}
                description={data.summary.openingBalanceDescription}
              />

              {isForeignCurrency && (
                <div className="mt-2 text-xs text-ink-400">
                  ≈{" "}
                  {formatMoney(
                    data.summary.baseOpeningBalanceAmount,
                    baseCurrency,
                  )}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-ink-400/10 bg-white p-4">
              <div className="mb-2 text-xs text-ink-400">إجمالي المدين</div>

              <div className="num text-lg font-semibold text-positive">
                {formatMoney(data.summary.totalDebits)}
              </div>

              {isForeignCurrency && (
                <div className="mt-1 text-xs text-ink-400">
                  ≈ {formatMoney(data.summary.baseTotalDebits, baseCurrency)}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-ink-400/10 bg-white p-4">
              <div className="mb-2 text-xs text-ink-400">إجمالي الدائن</div>

              <div className="num text-lg font-semibold text-negative">
                {formatMoney(data.summary.totalCredits)}
              </div>

              {isForeignCurrency && (
                <div className="mt-1 text-xs text-ink-400">
                  ≈ {formatMoney(data.summary.baseTotalCredits, baseCurrency)}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-ink-400/10 bg-white p-4">
              <div className="mb-2 text-xs font-semibold text-ink-900">
                رصيد آخر المدة
              </div>

              <BalanceBadge
                amount={data.summary.closingBalanceAmount}
                description={data.summary.closingBalanceDescription}
              />

              {isForeignCurrency && (
                <div className="mt-2 text-xs text-ink-400">
                  ≈{" "}
                  {formatMoney(
                    data.summary.baseClosingBalanceAmount,
                    baseCurrency,
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {data?.totalPages > 0 && (
        <div className="border-t border-ink-400/10 bg-white px-5 py-4">
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={data?.totalCount || 0}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            label="حركة"
          />
        </div>
      )}
    </div>
  );
}
