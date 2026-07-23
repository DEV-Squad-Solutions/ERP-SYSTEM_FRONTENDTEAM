import React from "react";
import {
  Pencil,
  Printer,
  Copy,
  FileDown,
  PackageOpen,
  Trash2,
  ArrowRight,
  History,
} from "lucide-react";
import ActionButton from "./ActionButton";
import { paymentBadgeStyles } from "../../utils/formatters";

export default function InvoiceHeader({ invoice, onAction }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-xl font-bold text-slate-900"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            فاتورة {invoice.type} رقم #{invoice.id}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            تم الإنشاء بتاريخ {invoice.createdAt}
          </p>
        </div>
        <span
          className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${paymentBadgeStyles[invoice.paymentMethod]}`}
        >
          {invoice.paymentMethod}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-5 py-3">
        <ActionButton
          icon={Pencil}
          label="تعديل"
          onClick={() => onAction("edit")}
        />
        <ActionButton
          icon={Printer}
          label="طباعة"
          onClick={() => onAction("print")}
        />
        <ActionButton
          icon={Copy}
          label="نسخ"
          onClick={() => onAction("copy")}
        />
        <ActionButton
          icon={FileDown}
          label="PDF"
          onClick={() => onAction("pdf")}
        />
        <ActionButton
          icon={PackageOpen}
          label="مخزن العبوات"
          onClick={() => onAction("packaging")}
        />
        <ActionButton
          icon={History}
          label="سجل العمليات"
          onClick={() => onAction("audit")}
        />
        <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />
        <ActionButton
          icon={Trash2}
          label="حذف"
          variant="danger"
          onClick={() => onAction("delete")}
        />
        <div className="ms-auto">
          <ActionButton
            icon={ArrowRight}
            label="رجوع"
            onClick={() => onAction("back")}
          />
        </div>
      </div>
    </div>
  );
}
