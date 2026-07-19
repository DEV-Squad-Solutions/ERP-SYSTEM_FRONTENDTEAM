import { useState } from "react";
import { FileSearch, AlertCircle, RefreshCw } from "lucide-react";
import { useGetSaleLinesQuery } from "../salesApi";
import InvoiceCard from "./SaleLineRow";

/**
 * @param {{ filters: Object }} props
 */
export default function SalesTable({ filters }) {
  const { data: invoices, isLoading, isError } = useGetSaleLinesQuery(filters);

  // حالة التحميل — سكيلتون بشكل كروت الفواتير نفسها
  if (isLoading) {
    return (
      <div className="space-y-5">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-ink-400/10 bg-white shadow-card overflow-hidden animate-fadeUp"
          >
            <div className="flex items-center justify-between gap-3 bg-ink-900/[0.03] px-4 py-3">
              <div className="flex gap-4">
                <div className="h-4 w-20 rounded bg-ink-400/10 animate-pulse" />
                <div className="h-4 w-24 rounded bg-ink-400/10 animate-pulse" />
                <div className="h-4 w-28 rounded bg-ink-400/10 animate-pulse" />
              </div>
              <div className="h-4 w-16 rounded bg-ink-400/10 animate-pulse" />
            </div>
            <div className="p-4 space-y-2">
              {[1, 2].map((j) => (
                <div
                  key={j}
                  className="h-9 rounded-lg bg-ink-400/5 animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // حالة الخطأ — أيقونة تحذير + زرار إعادة محاولة
  if (isError) {
    return (
      <div className="text-center py-14 border border-dashed border-negative/25 bg-negative/[0.02] rounded-2xl animate-fadeUp">
        <AlertCircle
          size={34}
          className="mx-auto text-negative/70 mb-3"
          strokeWidth={1.6}
        />
        <p className="text-ink-900 font-medium mb-1">
          حدث خطأ في تحميل الفواتير
        </p>
        <p className="text-sm text-ink-400 mb-4">
          تأكد من الاتصال وحاول مرة أخرى
        </p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw size={15} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // حالة الفاضي — مفيش فواتير مطابقة
  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-ink-400/20 rounded-2xl animate-fadeUp">
        <div className="w-14 h-14 rounded-full bg-ink-400/5 flex items-center justify-center mx-auto mb-3">
          <FileSearch size={26} className="text-ink-400/50" strokeWidth={1.6} />
        </div>
        <p className="text-ink-900 font-medium mb-1">لا توجد فواتير مطابقة</p>
        <p className="text-sm text-ink-400">
          جرّب تغيير الفلاتر أو أنشئ فاتورة جديدة
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5   overflow-y-scroll custom-scroll max-h-0 md:max-h-[calc(100vh-300px)]">
      {invoices.map((invoice, i) => (
        <div
          key={invoice.id}
          style={{ animationDelay: `${i * 60}ms` }}
          className="animate-fadeUp"
        >
          <InvoiceCard invoice={invoice} />
        </div>
      ))}
    </div>
  );
}
