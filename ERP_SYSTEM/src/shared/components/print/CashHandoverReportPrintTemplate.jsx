const currencySymbols = {
  EGP: "ج.م",
  USD: "$",
  EUR: "€",
  GBP: "£",
  SAR: "﷼",
  AED: "د.إ",
  KWD: "د.ك",
};

const fmt = (n) =>
  Number(n ?? 0).toLocaleString("ar-EG", {
    maximumFractionDigits: 2,
  });

export default function CashHandoverReportPrintTemplate({
  cashboxName,
  items = [],
  summaries = [],
  cashboxBalances = [],
  fromDate,
  toDate,
}) {
  const printedAt = new Date().toLocaleString("ar-EG");

  return (
    <div
      dir="rtl"
      className="p-8 font-sans text-ink-900"
      style={{ width: "210mm" }}
    >
      <div className="mb-6 flex items-center justify-between border-b border-ink-200 pb-4">
        <div>
          <h1 className="text-xl font-bold">تقرير تسليم العهدة</h1>

          <p className="mt-1 text-sm text-ink-500">{cashboxName || "الخزنة"}</p>
        </div>

        <div className="text-left text-xs text-ink-400">
          <p>تاريخ الطباعة</p>
          <p>{printedAt}</p>
        </div>
      </div>

      {(fromDate || toDate) && (
        <div className="mb-6 rounded-lg border border-ink-200 p-3 text-sm">
          <span className="text-ink-500">الفترة: </span>
          <span className="font-medium">
            {fromDate || "—"} إلى {toDate || "—"}
          </span>
        </div>
      )}

      {cashboxBalances.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-bold">أرصدة الخزنة</h2>

          <div className="grid grid-cols-2 gap-4">
            {cashboxBalances.map((balance) => (
              <div
                key={`${balance.cashboxId}-${balance.currency}`}
                className="rounded-lg border border-ink-200 p-4"
              >
                <p className="mb-3 text-sm font-bold">
                  {currencySymbols[balance.currency] || ""} {balance.currency}
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <PrintField
                    label="الرصيد الحالي"
                    value={fmt(balance.currentBalance)}
                  />

                  <PrintField
                    label="الرصيد المتوقع بعد الترحيل"
                    value={fmt(balance.expectedBalance)}
                  />

                  <PrintField
                    label="مسودات وارد"
                    value={fmt(balance.draftReceipt)}
                  />

                  <PrintField
                    label="مسودات صادر"
                    value={fmt(balance.draftPayment)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {summaries.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-bold">ملخص التقرير</h2>

          <div className="grid grid-cols-2 gap-4">
            {summaries.map((summary) => (
              <div
                key={summary.currency}
                className="rounded-lg border border-ink-200 p-4"
              >
                <p className="mb-3 text-sm font-bold">
                  {currencySymbols[summary.currency] || ""} {summary.currency} —{" "}
                  {summary.count} سند
                </p>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <PrintField label="وارد" value={fmt(summary.receipt)} />

                  <PrintField label="صادر" value={fmt(summary.payment)} />

                  <PrintField label="الصافي" value={fmt(summary.net)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-bold">السندات</h2>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink-200">
              <th className="px-3 py-2 text-right font-semibold">رقم السند</th>

              <th className="px-3 py-2 text-right font-semibold">التاريخ</th>

              <th className="px-3 py-2 text-right font-semibold">الاتجاه</th>

              <th className="px-3 py-2 text-right font-semibold">البيان</th>

              <th className="px-3 py-2 text-left font-semibold">المبلغ</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-ink-100">
                <td className="px-3 py-2">{item.voucherNumber}</td>

                <td className="px-3 py-2 text-ink-500">{item.voucherDate}</td>

                <td className="px-3 py-2">
                  {item.direction === "Receipt" ? "وارد" : "صادر"}
                </td>

                <td className="px-3 py-2 text-ink-500">
                  {item.description || "-"}
                </td>

                <td className="px-3 py-2 text-left font-semibold">
                  {fmt(item.amount)}{" "}
                  {currencySymbols[item.currency] || item.currency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PrintField({ label, value }) {
  return (
    <div>
      <p className="mb-0.5 text-xs text-ink-500">{label}</p>

      <p className="font-medium">{value ?? "—"}</p>
    </div>
  );
}
