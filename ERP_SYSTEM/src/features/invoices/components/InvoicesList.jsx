import { useGetInvoicesQuery, useDeleteInvoiceMutation } from "../invoicesApi";
import { FileText, Trash2, Eye } from "lucide-react";

/**
 * @param {{ type: 'purchase' | 'sale' }} props
 */
export default function InvoicesList({ type }) {
  const { data: invoices, isLoading, isError } = useGetInvoicesQuery(type);
  const [deleteInvoice] = useDeleteInvoiceMutation();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-ink-400/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError)
    return (
      <p className="p-6 text-center text-negative text-sm">
        حدث خطأ في تحميل الفواتير
      </p>
    );

  if (invoices?.length === 0) {
    return (
      <div className="text-center py-14 border border-dashed border-ink-400/20 rounded-2xl">
        <FileText size={32} className="mx-auto text-ink-400/40 mb-2" />
        <p className="text-ink-400 text-sm">لا توجد فواتير مسجلة بعد</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card">
      <table className="w-full text-right border-collapse">
        <thead>
          <tr className="bg-ink-900/[0.02] border-b border-ink-400/10 text-ink-400 text-xs">
            <th className="p-3.5 font-medium">رقم الفاتورة</th>
            <th className="p-3.5 font-medium">التاريخ</th>
            <th className="p-3.5 font-medium">
              {type === "purchase" ? "المورد" : "العميل"}
            </th>
            <th className="p-3.5 font-medium">طريقة الدفع</th>
            <th className="p-3.5 font-medium">الإجمالي</th>
            <th className="p-3.5 font-medium">الباقي</th>
            <th className="p-3.5 font-medium">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {invoices?.map((inv) => (
            <tr
              key={inv.id}
              className="border-b border-ink-400/5 last:border-0 hover:bg-ink-900/[0.015] transition-colors"
            >
              <td className="p-3.5 num font-medium text-ink-900">
                {inv.invoiceNumber}
              </td>
              <td className="p-3.5 num text-ink-600">{inv.date}</td>
              <td className="p-3.5 text-ink-900">{inv.partyName}</td>
              <td className="p-3.5">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full ${inv.account === "نقدي" ? "bg-positive/10 text-positive" : "bg-gold-50 text-gold-600"}`}
                >
                  {inv.account}
                </span>
              </td>
              <td className="p-3.5 num font-medium text-ink-900">
                {inv.total.toLocaleString("ar-EG")} ج.م
              </td>
              <td
                className={`p-3.5 num font-medium ${inv.remaining > 0 ? "text-negative" : "text-positive"}`}
              >
                {inv.remaining.toLocaleString("ar-EG")} ج.م
              </td>
              <td className="p-3.5">
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors">
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => deleteInvoice(inv.id)}
                    className="p-1.5 rounded-lg text-negative hover:bg-negative/5 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
