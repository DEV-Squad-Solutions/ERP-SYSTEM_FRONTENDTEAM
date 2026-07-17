import { useState } from "react";
import { FileSearch } from "lucide-react";
import { useGetSaleLinesQuery } from "../salesApi";
import SaleLineRow from "./SaleLineRow";
import InvoiceDetailsModal from "./InvoiceDetailsModal";

export default function SalesTable({ filters }) {
  const { data: rows, isLoading, isError } = useGetSaleLinesQuery(filters);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-ink-400/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="p-6 text-center text-negative text-sm">
        حدث خطأ في تحميل البيانات
      </p>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="text-center py-14 border border-dashed border-ink-400/20 rounded-2xl">
        <FileSearch size={32} className="mx-auto text-ink-400/40 mb-2" />
        <p className="text-ink-400 text-sm">لا توجد نتائج مطابقة لهذا البحث</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card">
        <table className="w-full text-right border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
              <th
                className="p-3 font-medium border-b border-ink-400/10"
                rowSpan={2}
              >
                م
              </th>
              <th
                className="p-3 font-medium border-b border-ink-400/10"
                rowSpan={2}
              >
                الصنف
              </th>
              <th
                className="p-3 font-medium border-b border-ink-400/10"
                rowSpan={2}
              >
                الوحدة
              </th>
              <th
                className="p-2 font-medium border-b border-x border-ink-400/10 text-center"
                colSpan={2}
              >
                الكمية
              </th>
              <th
                className="p-3 font-medium border-b border-ink-400/10"
                rowSpan={2}
              >
                الوزن
              </th>
              <th
                className="p-3 font-medium border-b border-ink-400/10"
                rowSpan={2}
              >
                السعر
              </th>
              <th
                className="p-3 font-medium border-b border-ink-400/10"
                rowSpan={2}
              >
                القيمة
              </th>
              <th
                className="p-3 font-medium border-b border-ink-400/10"
                rowSpan={2}
              >
                ملاحظات
              </th>
              <th
                className="p-3 font-medium border-b border-ink-400/10"
                rowSpan={2}
              >
                إجراءات
              </th>
            </tr>
            <tr className="bg-ink-900/[0.02] text-ink-400 text-[11px]">
              <th className="p-2 font-medium border-b border-x border-ink-400/10 text-positive">
                وارد
              </th>
              <th className="p-2 font-medium border-b border-x border-ink-400/10 text-negative">
                صادر
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <SaleLineRow
                key={row.id}
                row={row}
                index={index}
                onShowDetails={setSelectedInvoice}
              />
            ))}
          </tbody>
        </table>
      </div>

      <InvoiceDetailsModal
        invoiceNumber={selectedInvoice}
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </>
  );
}
