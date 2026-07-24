import React from "react";

function InfoField({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-800">{value || "—"}</dd>
    </div>
  );
}

export default function InvoiceInfoCard({ invoice }) {
  const paymentLabel =
    invoice.paymentMethod === "آجل" ? "آجل" : invoice.cashboxOrBank;
  const paymentFieldLabel =
    invoice.paymentMethod === "نقدي"
      ? "الخزنة"
      : invoice.paymentMethod === "بنكي"
      ? "البنك"
      : "طريقة السداد";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold text-slate-500">بيانات الفاتورة</h2>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
        <InfoField label="رقم الفاتورة" value={`#${invoice.id}`} />
        <InfoField label="نوع الفاتورة" value={invoice.type} />
        <InfoField label="التاريخ" value={invoice.date} />
        <InfoField label="العميل" value={invoice.client} />
        <InfoField label="العملة" value={invoice.currency} />
        <InfoField label="المخزن" value={invoice.warehouse} />
        <InfoField label="السائق" value={invoice.driver} />
        <InfoField label="رقم السيارة" value={invoice.carNumber} />
        <InfoField label="البلد" value={invoice.country} />
        <InfoField label="طريقة الدفع" value={invoice.paymentMethod} />
        <InfoField label={paymentFieldLabel} value={paymentLabel} />
      </dl>
    </div>
  );
}
