const statusConfig = {
  completed: { label: "مكتملة", className: "bg-positive/10 text-positive" },
  pending: { label: "قيد المراجعة", className: "bg-gold-50 text-gold-600" },
  cancelled: { label: "ملغية", className: "bg-ink-400/10 text-ink-400" },
  returned: { label: "مرتجعة", className: "bg-negative/10 text-negative" },
};

export default function InvoiceStatusBadge({ status }) {
  const config = statusConfig[status] || {
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
