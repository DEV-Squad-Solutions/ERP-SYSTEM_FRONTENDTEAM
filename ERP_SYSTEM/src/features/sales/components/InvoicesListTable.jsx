import {
  FileSearch,
  AlertCircle,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  Printer,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useDeleteSaleLineMutation, useGetSaleLinesQuery } from "../salesApi";

/**
 * @param {{ filters: Object, onView: (id: string) => void, onEdit: (id: string) => void }} props
 */
export default function InvoicesListTable({ filters, onView, onEdit }) {
  const {
    data: invoices,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetSaleLinesQuery(filters);
  const [deleteInvoice] = useDeleteSaleLineMutation();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-ink-400/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-14 border border-dashed border-negative/25 bg-negative/[0.02] rounded-2xl animate-fadeUp">
        <AlertCircle
          size={34}
          className="mx-auto text-negative/70 mb-3"
          strokeWidth={1.6}
        />
        <p className="text-ink-900 font-medium mb-1">
          حدث خطأ في تحميل الفواتير
        </p>
        <p className="text-sm text-ink-400 mb-4">
          تأكد من الاتصال وحاول مرة أخرى
        </p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw size={15} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!isFetching && (!invoices || invoices.length === 0)) {
    return (
      <div className="text-center py-16 border border-dashed border-ink-400/20 rounded-2xl animate-fadeUp">
        <div className="w-14 h-14 rounded-full bg-ink-400/5 flex items-center justify-center mx-auto mb-3">
          <FileSearch size={26} className="text-ink-400/50" strokeWidth={1.6} />
        </div>
        <p className="text-ink-900 font-medium mb-1">لا توجد فواتير مطابقة</p>
        <p className="text-sm text-ink-400">
          جرّب تغيير الفلاتر أو أنشئ فاتورة جديدة
        </p>
      </div>
    );
  }

  const withTotals = (invoices || []).map((inv) => {
    const total = inv.items.reduce((s, it) => s + (it.value || 0), 0);
    const remaining =
      total - (inv.discount || 0) + (inv.tax || 0) - (inv.paid || 0);
    return { ...inv, total, remaining };
  });

  const grandTotal = withTotals.reduce((s, inv) => s + inv.total, 0);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirm("متأكد إنك عايز تحذف الفاتورة دي بالكامل؟")) {
      deleteInvoice(id);
      toast.success("تم حذف الفاتورة");
    }
  };

  const handlePrint = (e) => {
    e.stopPropagation();
    window.print();
  };

  return (
    <div
      className={`overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${isFetching ? "opacity-60" : ""}`}
    >
      <table className="w-full text-right border-collapse min-w-[950px]">
        <thead>
          <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
            <th className="p-3 font-medium border-b border-ink-400/10">م</th>
            <th className="p-3 font-medium border-b border-ink-400/10">
              التاريخ
            </th>
            <th className="p-3 font-medium border-b border-ink-400/10">
              رقم الفاتورة
            </th>
            <th className="p-3 font-medium border-b border-ink-400/10">
              النوع
            </th>
            <th className="p-3 font-medium border-b border-ink-400/10">
              عميل / مورد
            </th>
            <th className="p-3 font-medium border-b border-ink-400/10">
              عدد الأصناف
            </th>
            <th className="p-3 font-medium border-b border-ink-400/10">
              الإجمالي
            </th>
            <th className="p-3 font-medium border-b border-ink-400/10">
              الباقي
            </th>
            <th className="p-3 font-medium border-b border-ink-400/10">
              إجراءات
            </th>
          </tr>
        </thead>
        <tbody>
          {withTotals.map((inv, i) => (
            <tr
              key={inv.id}
              onClick={() => onView(inv.id)}
              className="border-b border-ink-400/5 last:border-0 hover:bg-primary-50/40 cursor-pointer transition-colors"
            >
              <td className="p-3 text-center text-ink-400 text-sm num">
                {i + 1}
              </td>
              <td className="p-3 num text-ink-600">{inv.date}</td>
              <td className="p-3 num font-medium text-ink-900">
                {inv.invoiceNumber}
              </td>
              <td className="p-3">
                {inv.movementType === "purchase" ? (
                  <span className="inline-flex items-center gap-1.5 bg-positive/10 text-positive text-xs font-medium px-2.5 py-1 rounded-full">
                    <ArrowDownCircle size={12} />
                    مشتريات
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-negative/10 text-negative text-xs font-medium px-2.5 py-1 rounded-full">
                    <ArrowUpCircle size={12} />
                    مبيعات
                  </span>
                )}
              </td>
              <td className="p-3 text-ink-900">{inv.partyName}</td>
              <td className="p-3 text-center text-ink-600 num">
                {inv.items.length}
              </td>
              <td className="p-3 num font-medium text-ink-900">
                {inv.total.toLocaleString("ar-EG")}
              </td>
              <td
                className={`p-3 num font-medium ${inv.remaining > 0 ? "text-negative" : "text-positive"}`}
              >
                {inv.remaining.toLocaleString("ar-EG")}
              </td>
              <td className="p-3">
                <div
                  className="flex gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onView(inv.id)}
                    className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors"
                    title="عرض"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => onEdit(inv.id)}
                    className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors"
                    title="تعديل"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-400/5 transition-colors"
                    title="طباعة"
                  >
                    <Printer size={15} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, inv.id)}
                    className="p-1.5 rounded-lg text-negative hover:bg-negative/10 transition-colors"
                    title="حذف"
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
