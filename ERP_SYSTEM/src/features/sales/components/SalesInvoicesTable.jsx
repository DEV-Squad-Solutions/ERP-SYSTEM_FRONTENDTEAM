import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Eye,
  Pencil,
  Printer,
  Boxes,
  Copy,
  Trash2,
  History,
  MoreVertical,
  FileSearch,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  useDeleteSaleLineMutation,
  useDuplicateInvoiceMutation,
} from "../salesApi";
import SortableHeader from "./SortableHeader";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import PackagingDrawer from "./PackagingDrawer";

const typeLabels = {
  sale: "بيع",
  purchase: "شراء",
  sale_return: "مرتجع بيع",
  purchase_return: "مرتجع شراء",
};
const paymentLabels = { cash: "نقدي", bank: "بنك", credit: "آجل" };

/**
 * @param {{ data: Object, isLoading: boolean, isFetching: boolean, isError: boolean, refetch: () => void, sortBy: string, sortDir: string, onSort: (field: string) => void }} props
 */
export default function SalesInvoicesTable({
  data,
  isLoading,
  isFetching,
  isError,
  refetch,
  sortBy,
  sortDir,
  onSort,
}) {
  const navigate = useNavigate();
  const [deleteInvoice] = useDeleteSaleLineMutation();
  const [duplicateInvoice] = useDuplicateInvoiceMutation();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [packagingFor, setPackagingFor] = useState(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-ink-400/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-14 border border-dashed border-negative/25 bg-negative/[0.02] rounded-2xl">
        <AlertCircle
          size={34}
          className="mx-auto text-negative/70 mb-3"
          strokeWidth={1.6}
        />
        <p className="text-ink-900 font-medium mb-1">
          حدث خطأ في تحميل الفواتير
        </p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors mt-2"
        >
          <RefreshCw size={15} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const invoices = data?.items || [];

  if (!isFetching && invoices.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-ink-400/20 rounded-2xl">
        <div className="w-14 h-14 rounded-full bg-ink-400/5 flex items-center justify-center mx-auto mb-3">
          <FileSearch size={26} className="text-ink-400/50" strokeWidth={1.6} />
        </div>
        <p className="text-ink-900 font-medium mb-1">لا توجد فواتير مطابقة</p>
        <p className="text-sm text-ink-400">جرّب تعديل الفلاتر</p>
      </div>
    );
  }

  const handleDelete = (id) => {
    setOpenMenuId(null);
    if (confirm("متأكد إنك عايز تحذف الفاتورة دي؟")) {
      deleteInvoice(id);
      toast.success("تم حذف الفاتورة");
    }
  };

  const handleDuplicate = async (id) => {
    setOpenMenuId(null);
    try {
      const newInvoice = await duplicateInvoice(id).unwrap();
      toast.success("تم نسخ الفاتورة بنجاح");
      navigate(`/dashboard/sales/${newInvoice.id}/edit`);
    } catch {
      toast.error("فشل نسخ الفاتورة");
    }
  };

  return (
    <>
      <div
        className={`overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${isFetching ? "opacity-60" : ""}`}
      >
        <table className="w-full text-right border-collapse min-w-[1150px]">
          <thead>
            <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
              <SortableHeader
                label="رقم الفاتورة"
                field="invoiceNumber"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={onSort}
              />
              <SortableHeader
                label="التاريخ"
                field="date"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={onSort}
              />
              <th className="p-3 font-medium border-b border-ink-400/10">
                النوع
              </th>
              <SortableHeader
                label="العميل"
                field="partyName"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={onSort}
              />
              <th className="p-3 font-medium border-b border-ink-400/10">
                المخزن
              </th>
              <th className="p-3 font-medium border-b border-ink-400/10">
                الدفع
              </th>
              <SortableHeader
                label="الإجمالي"
                field="total"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={onSort}
              />
              <SortableHeader
                label="المدفوع"
                field="paid"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={onSort}
              />
              <SortableHeader
                label="المتبقي"
                field="remaining"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={onSort}
              />
              <th className="p-3 font-medium border-b border-ink-400/10">
                الحالة
              </th>
              <th className="p-3 font-medium border-b border-ink-400/10">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                className="border-b border-ink-400/5 last:border-0 hover:bg-primary-50/30 transition-colors"
              >
                <td className="p-3 num font-medium text-ink-900">
                  {inv.invoiceNumber}
                </td>
                <td className="p-3 num text-ink-600">{inv.date}</td>
                <td className="p-3 text-ink-600 text-sm">
                  {typeLabels[inv.movementType] || inv.movementType}
                </td>
                <td className="p-3 text-ink-900">{inv.partyName}</td>
                <td className="p-3 text-ink-600 text-sm">
                  {inv.storeName || "—"}
                </td>
                <td className="p-3 text-ink-600 text-sm">
                  {paymentLabels[inv.paymentMethod] || "—"}
                </td>
                <td className="p-3 num font-medium text-ink-900">
                  {(inv.total || 0).toLocaleString("ar-EG")}
                </td>
                <td className="p-3 num text-positive">
                  {(inv.paid || 0).toLocaleString("ar-EG")}
                </td>
                <td
                  className={`p-3 num font-medium ${(inv.remaining || 0) > 0 ? "text-negative" : "text-positive"}`}
                >
                  {(inv.remaining || 0).toLocaleString("ar-EG")}
                </td>
                <td className="p-3">
                  <InvoiceStatusBadge status={inv.status} />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-0.5 relative">
                    <button
                      onClick={() => navigate(`/dashboard/sales/${inv.id}`)}
                      className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50"
                      title="عرض"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/dashboard/sales/${inv.id}/edit`)
                      }
                      className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50"
                      title="تعديل"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-400/5"
                      title="طباعة"
                    >
                      <Printer size={15} />
                    </button>
                    <button
                      onClick={() => setPackagingFor(inv)}
                      className="p-1.5 rounded-lg text-gold-600 hover:bg-gold-50"
                      title="مخزن العبوات"
                    >
                      <Boxes size={15} />
                    </button>

                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === inv.id ? null : inv.id)
                      }
                      className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-400/5"
                      title="المزيد"
                    >
                      <MoreVertical size={15} />
                    </button>

                    {openMenuId === inv.id && (
                      <>
                        <div
                          onClick={() => setOpenMenuId(null)}
                          className="fixed inset-0 z-10"
                        />
                        <div className="absolute left-0 top-full mt-1 w-44 bg-white rounded-xl shadow-card border border-ink-400/10 py-1 z-20 animate-fadeUp">
                          <button
                            onClick={() => handleDuplicate(inv.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-ink-400/5 text-right"
                          >
                            <Copy size={14} />
                            نسخ الفاتورة
                          </button>
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              toast.info("سجل العمليات قيد التطوير");
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-ink-400/5 text-right"
                          >
                            <History size={14} />
                            سجل العمليات
                          </button>
                          <div className="border-t border-ink-400/10 my-1" />
                          <button
                            onClick={() => handleDelete(inv.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-negative hover:bg-negative/5 text-right"
                          >
                            <Trash2 size={14} />
                            حذف الفاتورة
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PackagingDrawer
        partyName={packagingFor?.partyName}
        invoiceNumber={packagingFor?.invoiceNumber}
        isOpen={!!packagingFor}
        onClose={() => setPackagingFor(null)}
      />
    </>
  );
}
