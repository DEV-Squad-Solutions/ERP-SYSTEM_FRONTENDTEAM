import { X, Pencil } from "lucide-react";

function fmtAmount(n, currency) {
  if (n == null) return "—";
  return `${new Intl.NumberFormat("ar-EG", {
    maximumFractionDigits: 2,
  }).format(n)} ${currency ?? ""}`;
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
    case "Employee":
      return v.employeeName ?? "—";
    case "Other":
      return v.externalPartyName ?? "—";
    default:
      return "—";
  }
}

function Row({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink-400/10 py-2 text-sm last:border-0">
      <span className="text-ink-400">{label}</span>
      <span className="text-right font-medium text-ink-800">{value}</span>
    </div>
  );
}

export default function ExpenseDetailsModal({ voucher, onClose, onEdit }) {
  if (!voucher) return null;

  const v = voucher;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
      onClick={onClose}
    >
      <div
        dir="rtl"
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-ink-900">
            تفاصيل سند {v.voucherNumber || `#${v.id}`}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-400/10"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-0.5">
          <Row label="التاريخ" value={fmtDate(v.voucherDate)} />
          <Row label="الخزينة" value={v.cashboxName} />
          <Row label="نوع الحركة" value={v.cashMovementTypeName} />
          <Row label="التصنيف" value={v.classification} />
          <Row label="الجهة" value={partyLabel(v)} />
          <Row
            label="المبلغ"
            value={
              <span className="font-bold text-rose-600">
                {fmtAmount(v.amount, v.currency)}
              </span>
            }
          />
          {v.baseCurrency && v.baseCurrency !== v.currency && (
            <>
              <Row label="سعر الصرف" value={v.exchangeRate} />
              <Row
                label="المبلغ بالعملة الأساسية"
                value={fmtAmount(v.baseAmount, v.baseCurrency)}
              />
              <Row
                label="فرق العملة المحقق"
                value={fmtAmount(v.realizedExchangeDifference, v.baseCurrency)}
              />
            </>
          )}
          <Row label="رقم المرجع" value={v.referenceNumber} />
          <Row label="الوصف" value={v.description} />
          <Row label="ملاحظات" value={v.notes} />
          {v.invoiceNumber && (
            <>
              <Row label="فاتورة مرتبطة" value={v.invoiceNumber} />
              <Row
                label="المبلغ المُطبّق على الفاتورة"
                value={fmtAmount(
                  v.appliedInvoiceAmount,
                  v.appliedInvoiceCurrency,
                )}
              />
            </>
          )}
          <Row label="الحالة" value={v.isDraft ? "مسودة" : "معتمد"} />
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-ink-400/20 px-4 py-2 text-sm text-ink-600 hover:bg-ink-400/5"
          >
            إغلاق
          </button>
          <button
            type="button"
            onClick={() => onEdit(v)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
          >
            <Pencil size={14} />
            تعديل
          </button>
        </div>
      </div>
    </div>
  );
}
