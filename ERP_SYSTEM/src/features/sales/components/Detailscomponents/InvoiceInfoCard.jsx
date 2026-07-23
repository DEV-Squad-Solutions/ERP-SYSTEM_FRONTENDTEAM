const paymentLabels = { cash: "نقدي", bank: "بنك", credit: "آجل" };
const currencyLabels = { EGP: "جنيه مصري", USD: "دولار أمريكي" };

/**
 * @param {{ invoice: Object }} props
 */
export default function InvoiceInfoCard({ invoice }) {
  const rows = [
    { label: "التاريخ", value: invoice.date, num: true },
    { label: "عميل / مورد", value: invoice.partyName },
    { label: "المخزن", value: invoice.storeName },
    {
      label: "العملة",
      value: currencyLabels[invoice.currency] || invoice.currency,
    },
    { label: "السائق", value: invoice.driverName },
    { label: "رقم الرخصة", value: invoice.licenseNumber, num: true },
    { label: "البلد", value: invoice.country },
    { label: "رقم السيارة", value: invoice.carNumber, num: true },
    { label: "طريقة الدفع", value: paymentLabels[invoice.paymentMethod] },
    ...(invoice.paymentMethod === "cash"
      ? [{ label: "الخزنة / البنك", value: invoice.treasuryAccount }]
      : []),
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
    </div>
  );
}
