import React, { useState } from "react";
import { X } from "lucide-react";

const OPTIONS = [
  { key: "original", label: "طباعة أصل" },
  { key: "copy", label: "نسخة" },
  { key: "pdf", label: "PDF" },
];

export default function PrintPreviewModal({ open, onClose, invoiceId, onConfirm }) {
  const [mode, setMode] = useState("original");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">معاينة الطباعة</h3>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          فاتورة #{invoiceId} — اختر طريقة الإخراج
        </p>
        <div className="space-y-2">
          {OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-sm ${
                mode === opt.key
                  ? "border-[#0F6E5E] bg-[#0F6E5E]/5 text-[#0F6E5E] font-medium"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {opt.label}
              <input
                type="radio"
                name="print-mode"
                checked={mode === opt.key}
                onChange={() => setMode(opt.key)}
                className="accent-[#0F6E5E]"
              />
            </label>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            إلغاء
          </button>
          <button
            onClick={() => {
              onConfirm(mode);
              onClose();
            }}
            className="flex-1 rounded-lg bg-[#0F6E5E] px-3 py-2.5 text-sm font-medium text-white hover:bg-[#0C5A4D]"
          >
            تأكيد
          </button>
        </div>
      </div>
    </div>
  );
}
