import React from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDeleteModal({ open, onClose, invoiceId, onConfirm, isDeleting }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
        <div className="mb-1 flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">حذف الفاتورة</h3>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          سيتم حذف الفاتورة #{invoiceId} نهائيًا. لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "جارٍ الحذف..." : "حذف نهائي"}
          </button>
        </div>
      </div>
    </div>
  );
}
