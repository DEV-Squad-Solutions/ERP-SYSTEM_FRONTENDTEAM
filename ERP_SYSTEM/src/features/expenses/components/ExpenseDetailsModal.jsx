import { Pencil } from "lucide-react";
import Modal from "../../../shared/components/ui/Modal";

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
    case "Account":
      // حسابات المصاريف والإيرادات (accountId) - نفس الـ posting target
      // اللي بيتحدد من DescriptionCascadeSelect.
      return v.accountName
        ? `${v.accountCode ? `${v.accountCode} - ` : ""}${v.accountName}`
        : "—";
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
  const v = voucher;

  return (
    <Modal
      isOpen={Boolean(v)}
      onClose={onClose}
      title={v ? `تفاصيل سند ${v.voucherNumber || `#${v.id}`}` : ""}
    >
      {v && (
        <div dir="rtl">
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
                  value={fmtAmount(
                    v.realizedExchangeDifference,
                    v.baseCurrency,
                  )}
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
        </div>
      )}
    </Modal>
  );
}
