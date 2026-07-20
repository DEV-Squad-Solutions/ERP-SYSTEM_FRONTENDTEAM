import { FileSearch, AlertCircle, RefreshCw } from "lucide-react";
import { useGetPurchasesLinesQuery } from "../purchaseApi";
import InvoiceCard from "./PurchaseLineRow";
import InvoiceDetailsModal from "./InvoiceDetailsModal";
import { useState } from "react";

/**
 * @param {{ filters: Object }} props
 */
export default function PurchasesTable({ filters }) {
  const {
    data: invoices,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetPurchasesLinesQuery(filters);

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

  // حالة الفاضي — مفيش فواتير مطابقة (بس لو مش بيتم تحديث دلوقتي)
  if (!isFetching && (!invoices || invoices.length === 0)) {
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
    <div className="relative">
      {/* شريط تحديث خفيف يظهر فوق القائمة أثناء إعادة الفلترة، من غير ما يخفي البيانات القديمة فجأة */}
      {isFetching && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-primary-500 text-white text-xs px-3 py-1 rounded-full shadow-card animate-fadeUp">
          <RefreshCw size={11} className="animate-spin" />
          جاري التحديث...
        </div>
      )}

      <div
        className={`space-y-5 overflow-y-auto custom-scroll max-h-[calc(100vh-300px)] transition-opacity duration-200 ${
          isFetching ? "opacity-50" : "opacity-100"
        }`}
      >
        {invoices?.map((invoice, i) => (
          <div
            key={invoice.id}
            style={{ animationDelay: `${i * 60}ms` }}
            className="animate-fadeUp"
          >
            <InvoiceCard invoice={invoice} />
          </div>
        ))}
      </div>
    </div>
  );
}
