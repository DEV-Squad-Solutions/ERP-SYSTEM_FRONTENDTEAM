// features/invoiceItemPricing/components/InvoiceItemPricingTable.jsx
import { Wallet, RefreshCw, AlertCircle, PackageSearch } from "lucide-react";

import Pagination from "../../../shared/components/ui/Pagination";

const INVOICE_TYPE_LABELS = {
  Sales: "مبيعات",
  Purchase: "مشتريات",
  SalesReturn: "مرتجع مبيعات",
  PurchaseReturn: "مرتجع مشتريات",
};

function fmt(n) {
  return new Intl.NumberFormat("ar-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);
}

export default function InvoiceItemPricingTable({
  data,
  isLoading,
  isFetching,
  isError,
  refetch,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onManageExpenses,
}) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card overflow-hidden">
        <div className="h-10 bg-ink-900/[0.03] border-b border-ink-400/10" />
        <div className="divide-y divide-ink-400/5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 px-3 py-3">
              <div className="h-3.5 w-28 rounded bg-ink-400/10 animate-pulse" />
              <div className="h-3.5 w-20 rounded bg-ink-400/10 animate-pulse" />
              <div className="h-3.5 w-16 rounded bg-ink-400/10 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-14 border border-dashed border-negative/25 bg-negative/[0.02] rounded-2xl">
        <AlertCircle
          size={32}
          className="mx-auto text-negative/70 mb-3"
          strokeWidth={1.6}
        />

        <p className="text-ink-900 font-medium text-sm mb-1">
          حدث خطأ في تحميل بيانات التكلفة
        </p>

        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 text-xs font-medium text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors mt-2"
        >
          <RefreshCw size={13} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const items = data?.items || [];

  if (items.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-ink-400/20 rounded-2xl">
        <div className="w-14 h-14 rounded-full bg-ink-400/5 flex items-center justify-center mx-auto mb-3">
          <PackageSearch
            size={24}
            className="text-ink-400/50"
            strokeWidth={1.6}
          />
        </div>

        <p className="text-ink-900 font-medium text-sm mb-1">
          لا توجد بيانات تكلفة
        </p>

        <p className="text-xs text-ink-400">جرّب تعديل الفلاتر</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={`
          overflow-x-auto
          custom-scroll
          rounded-2xl
          border border-ink-400/10
          bg-white
          shadow-card
          transition-opacity
          duration-200
          ${isFetching ? "opacity-60" : ""}
        `}
      >
        <table className="w-full text-right border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
              <th className="p-2.5 font-medium border-l border-ink-400/5">
                الفاتورة
              </th>
              <th className="p-2.5 font-medium border-l border-ink-400/5">
                النوع
              </th>
              <th className="p-2.5 font-medium border-l border-ink-400/5">
                الصنف
              </th>
              <th className="p-2.5 font-medium border-l border-ink-400/5">
                الكمية
              </th>
              <th className="p-2.5 font-medium border-l border-ink-400/5">
                سعر البيع
              </th>
              <th className="p-2.5 font-medium border-l border-ink-400/5">
                متوسط التكلفة
              </th>
              <th className="p-2.5 font-medium border-l border-ink-400/5">
                إجمالي المصروفات
              </th>
              <th className="p-2.5 font-medium border-l border-ink-400/5">
                التكلفة الإرشادية
              </th>
              <th className="p-2.5 font-medium">الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <tr
                key={item.invoiceLineId}
                className="border-b border-ink-400/5 last:border-0 hover:bg-primary-50/30 transition-colors animate-fadeUp"
                style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
              >
                <td className="p-2.5 border-l border-ink-400/5">
                  <p className="text-sm font-medium text-ink-900">
                    {item.invoiceNumber}
                  </p>
                  <p className="text-[10px] text-ink-400 num mt-0.5">
                    {item.invoiceDate}
                  </p>
                </td>

                <td className="p-2.5 text-xs border-l border-ink-400/5">
                  {INVOICE_TYPE_LABELS[item.invoiceType] || item.invoiceType}
                </td>

                <td className="p-2.5 border-l border-ink-400/5">
                  <p className="text-sm text-ink-900">{item.itemName}</p>
                  <p className="text-[10px] text-ink-400 num mt-0.5">
                    {item.itemCode} • {item.itemUnitName}
                  </p>
                </td>

                <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                  {item.quantity}
                </td>

                <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                  {fmt(item.invoiceUnitPrice)}
                </td>

                <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                  {fmt(item.averageCost)}
                </td>

                <td className="p-2.5 border-l border-ink-400/5">
                  <span
                    className={`text-[13px] num font-semibold ${
                      item.manualExpensesTotal > 0
                        ? "text-primary-600"
                        : "text-ink-400"
                    }`}
                  >
                    {fmt(item.manualExpensesTotal)}
                  </span>
                  {item.manualExpensesTotal > 0 && (
                    <p className="text-[10px] text-ink-400 num">
                      {fmt(item.manualExpensesPerUnit)} / وحدة
                    </p>
                  )}
                </td>

                <td className="p-2.5 num text-[13px] font-semibold border-l border-ink-400/5">
                  {fmt(item.indicativeUnitCost)}
                </td>

                <td className="p-2.5">
                  <button
                    type="button"
                    onClick={() => onManageExpenses(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Wallet size={13} />
                    المصروفات
                    {item.expenses?.length > 0 && (
                      <span className="text-[10px] bg-primary-500 text-white rounded-full px-1.5">
                        {item.expenses.length}
                      </span>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.totalCount > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={data.totalCount}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
