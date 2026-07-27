const typeConfig = {
  Sales: { label: "بيع", className: "bg-negative/10 text-negative" },
  Purchase: { label: "شراء", className: "bg-positive/10 text-positive" },
  SalesReturn: { label: "مرتجع بيع", className: "bg-gold-50 text-gold-600" },
  PurchaseReturn: {
    label: "مرتجع شراء",
    className: "bg-gold-50 text-gold-600",
  },
};

const paymentStatusConfig = {
  Paid: { label: "مدفوعة", className: "bg-positive/10 text-positive" },
  PartiallyPaid: {
    label: "مدفوعة جزئيًا",
    className: "bg-gold-50 text-gold-600",
  },
  Unpaid: { label: "غير مدفوعة", className: "bg-negative/10 text-negative" },
};

export function InvoiceTypeBadge({ type }) {
  const config = typeConfig[type] || {
    label: type || "—",
    className: "bg-ink-400/10 text-ink-600",
  };
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export function PaymentStatusBadge({ status }) {
  const config = paymentStatusConfig[status] || {
    label: status || "—",
    className: "bg-ink-400/10 text-ink-600",
  };
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  );
}
