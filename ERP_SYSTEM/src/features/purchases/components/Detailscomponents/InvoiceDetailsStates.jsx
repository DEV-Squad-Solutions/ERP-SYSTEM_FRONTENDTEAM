import React from "react";
import { AlertTriangle } from "lucide-react";

export function InvoiceDetailsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-5 animate-pulse">
      <div className="h-28 rounded-xl border border-slate-200 bg-white" />
      <div className="h-40 rounded-xl border border-slate-200 bg-white" />
      <div className="h-64 rounded-xl border border-slate-200 bg-white" />
      <div className="h-32 rounded-xl border border-slate-200 bg-white" />
    </div>
  );
}

export function InvoiceDetailsError({ onRetry, onBack }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500" />
      <p className="font-semibold text-slate-800">تعذر تحميل بيانات الفاتورة</p>
      <p className="text-sm text-slate-500">
        قد تكون الفاتورة غير موجودة، أو حدثت مشكلة في الاتصال.
      </p>
      <div className="mt-2 flex gap-2">
        <button
          onClick={onBack}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          رجوع
        </button>
        <button
          onClick={onRetry}
          className="rounded-lg bg-[#0F6E5E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0C5A4D]"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
