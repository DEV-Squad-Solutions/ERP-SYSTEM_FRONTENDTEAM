import React from "react";
import { Loader2 } from "lucide-react";
import Drawer from "./Drawer";
import { useGetInvoiceAuditLogQuery } from "../../salesApi";

export default function AuditLogDrawer({ open, onClose, invoiceId }) {
  const {
    data: log,
    isLoading,
    isError,
  } = useGetInvoiceAuditLogQuery(invoiceId, {
    skip: !open,
  });

  return (
    <Drawer open={open} onClose={onClose} title="سجل العمليات">
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          جارٍ تحميل السجل...
        </div>
      )}

      {isError && (
        <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
          تعذر تحميل سجل العمليات، حاول مرة أخرى.
        </p>
      )}

      {!isLoading && !isError && (
        <ol className="relative ms-2 space-y-6 border-s-2 border-slate-100 ps-5">
          {(log ?? []).map((entry) => (
            <li key={entry.id} className="relative">
              <span className="absolute -start-[26px] top-1 h-2.5 w-2.5 rounded-full bg-[#0F6E5E] ring-4 ring-white" />
              <p className="text-sm font-medium text-slate-800">
                {entry.action}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {entry.date} · {entry.user}
              </p>
            </li>
          ))}
          {(log ?? []).length === 0 && (
            <p className="text-sm text-slate-400">لا توجد عمليات مسجّلة بعد.</p>
          )}
        </ol>
      )}
    </Drawer>
  );
}
