const paymentTermLabels = { Cash: "نقدي", Credit: "آجل" };

/**
 * @param {{ invoice: Object }} props
 */
export default function InvoiceInfoCard({ invoice }) {
  const driverLine = invoice.usesExternalDriver
    ? `${invoice.externalDriverName} (سائق خارجي)`
    : invoice.driverName || "—";

  const rows = [
    { label: "تاريخ الفاتورة", value: invoice.invoiceDate, num: true },
    { label: "تاريخ الاستحقاق", value: invoice.dueDate, num: true },
    { label: "العميل / المورد", value: invoice.businessPartnerName },
    { label: "المخزن", value: invoice.storeName },
    { label: "مخزن العبوات", value: invoice.containerStoreName },
    { label: "الدولة", value: invoice.countryName },
    { label: "السائق", value: driverLine },
    ...(invoice.actualDriverName && invoice.actualDriverId !== invoice.driverId
      ? [{ label: "السائق الفعلي", value: invoice.actualDriverName }]
      : []),
    { label: "رقم السيارة", value: invoice.vehicleNumber, num: true },
    {
      label: "طريقة الدفع",
      value: paymentTermLabels[invoice.paymentTerm] || invoice.paymentTerm,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-5">
      <h3 className="font-display font-bold text-ink-900 mb-4">
        بيانات الفاتورة
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between text-ink-600">
            <span>{row.label}</span>
            <span
              className={`text-ink-900 font-medium ${row.num ? "num" : ""}`}
            >
              {row.value || "—"}
            </span>
          </div>
        ))}
      </div>
      {invoice.notes && (
        <div className="mt-4 pt-4 border-t border-ink-400/10">
          <p className="text-xs text-ink-400 mb-1">ملاحظات</p>
          <p className="text-sm text-ink-700">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}
