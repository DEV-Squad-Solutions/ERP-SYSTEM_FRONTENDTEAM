import {
  useGetStockLedgerQuery,
  useDeleteStockEntryMutation,
} from "../inventoryApi";
import {
  Trash2,
  Pencil,
  Printer,
  Boxes,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";

/**
 * @param {{ filters: Object }} props
 */
export default function StockLedgerTable({ filters }) {
  const { data: rows, isLoading, isError } = useGetStockLedgerQuery(filters);
  const [deleteEntry] = useDeleteStockEntryMutation();

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
        حدث خطأ في تحميل البيانات
      </p>
    );

  if (rows?.length === 0) {
    return (
      <div className="text-center py-14 border border-dashed border-ink-400/20 rounded-2xl">
        <Boxes size={32} className="mx-auto text-ink-400/40 mb-2" />
        <p className="text-ink-400 text-sm">لا توجد حركات مطابقة لهذا الفلتر</p>
      </div>
    );
  }

  const totalQtyIn = rows?.reduce((sum, r) => sum + r.quantityIn, 0) || 0;
  const totalQtyOut = rows?.reduce((sum, r) => sum + r.quantityOut, 0) || 0;
  const totalWeightIn = rows?.reduce((sum, r) => sum + r.weightIn, 0) || 0;
  const totalWeightOut = rows?.reduce((sum, r) => sum + r.weightOut, 0) || 0;
  const totalValue = rows?.reduce((sum, r) => sum + r.total, 0) || 0;

  return (
    <div className="overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card">
      <table className="w-full text-right border-collapse min-w-[1200px]">
        <thead>
          {/* الصف الأول: العناوين المجمعة (الكمية / الوزن) */}
          <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
            <th
              className="p-3 font-medium border-b border-ink-400/10"
              rowSpan={2}
            >
              رقم الفاتورة
            </th>
            <th
              className="p-3 font-medium border-b border-ink-400/10"
              rowSpan={2}
            >
              التاريخ
            </th>
            <th
              className="p-3 font-medium border-b border-ink-400/10"
              rowSpan={2}
            >
              النوع
            </th>

            <th
              className="p-3 font-medium border-b border-ink-400/10"
              rowSpan={2}
            >
              العميل / المورد
            </th>
            <th
              className="p-3 font-medium border-b border-ink-400/10"
              rowSpan={2}
            >
              بيان الصنف
            </th>
            <th
              className="p-2 font-medium border-b border-x border-ink-400/10 text-center"
              colSpan={2}
            >
              الكمية
            </th>
            <th
              className="p-2 font-medium border-b border-x border-ink-400/10 text-center"
              colSpan={2}
            >
              الوزن
            </th>
            <th
              className="p-3 font-medium border-b border-ink-400/10"
              rowSpan={2}
            >
              سعر
            </th>
            <th
              className="p-3 font-medium border-b border-ink-400/10"
              rowSpan={2}
            >
              ربح
            </th>
            <th
              className="p-3 font-medium border-b border-ink-400/10"
              rowSpan={2}
            >
              الإجمالي
            </th>
            <th
              className="p-3 font-medium border-b border-ink-400/10"
              rowSpan={2}
            >
              إجراءات
            </th>
          </tr>
          {/* الصف الثاني: وارد/صادر تحت كل مجموعة */}
          <tr className="bg-ink-900/[0.02] text-ink-400 text-[11px]">
            <th className="p-2 font-medium border-b border-x border-ink-400/10 text-positive">
              وارد
            </th>
            <th className="p-2 font-medium border-b border-x border-ink-400/10 text-negative">
              صادر
            </th>
            <th className="p-2 font-medium border-b border-x border-ink-400/10 text-positive">
              وارد
            </th>
            <th className="p-2 font-medium border-b border-x border-ink-400/10 text-negative">
              صادر
            </th>
          </tr>
        </thead>

        <tbody>
          {rows?.map((row) => (
            <tr
              key={row.id}
              className="border-b border-ink-400/5 last:border-0 hover:bg-ink-900/[0.015] transition-colors"
            >
              <td className="p-3.5 num text-ink-600">{row.invoiceNumber}</td>
              <td className="p-3.5 num text-ink-600">{row.date}</td>
              <td className="p-3.5">
                {row.movementType === "purchase" ? (
                  <span className="inline-flex items-center gap-1.5 bg-positive/10 text-positive text-xs font-medium px-2.5 py-1 rounded-full">
                    <ArrowDownCircle size={13} />
                    شراء
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-negative/10 text-negative text-xs font-medium px-2.5 py-1 rounded-full">
                    <ArrowUpCircle size={13} />
                    بيع
                  </span>
                )}
              </td>

              <td className="p-3.5 text-ink-900">{row.partyName}</td>
              <td className="p-3.5 font-medium text-ink-900">{row.itemName}</td>
              <td className="p-3.5 num text-positive border-x border-ink-400/5 text-center">
                {row.quantityIn > 0
                  ? row.quantityIn.toLocaleString("ar-EG")
                  : "—"}
              </td>
              <td className="p-3.5 num text-negative border-l border-ink-400/5 text-center">
                {row.quantityOut > 0
                  ? row.quantityOut.toLocaleString("ar-EG")
                  : "—"}
              </td>
              <td className="p-3.5 num text-positive border-x border-ink-400/5 text-center">
                {row.weightIn > 0 ? row.weightIn.toLocaleString("ar-EG") : "—"}
              </td>
              <td className="p-3.5 num text-negative border-l border-ink-400/5 text-center">
                {row.weightOut > 0
                  ? row.weightOut.toLocaleString("ar-EG")
                  : "—"}
              </td>
              <td className="p-3.5 num text-ink-600">
                {row.price.toLocaleString("ar-EG")}
              </td>
              <td className="p-3.5 num text-gold-600">
                {row.profit > 0 ? row.profit.toLocaleString("ar-EG") : "—"}
              </td>
              <td className="p-3.5 num font-medium text-ink-900">
                {row.total.toLocaleString("ar-EG")}
              </td>
              <td className="p-3.5">
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-400/5 transition-colors">
                    <Printer size={15} />
                  </button>
                  <button
                    onClick={() => deleteEntry(row.id)}
                    className="p-1.5 rounded-lg text-negative hover:bg-negative/5 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr className="bg-primary-50/50 border-t-2 border-primary-100 font-semibold text-ink-900">
            <td className="p-3.5" colSpan={5}>
              الرصيد الإجمالي
            </td>
            <td className="p-3.5 num text-positive text-center">
              {totalQtyIn.toLocaleString("ar-EG")}
            </td>
            <td className="p-3.5 num text-negative text-center">
              {totalQtyOut.toLocaleString("ar-EG")}
            </td>
            <td className="p-3.5 num text-positive text-center">
              {totalWeightIn.toLocaleString("ar-EG")}
            </td>
            <td className="p-3.5 num text-negative text-center">
              {totalWeightOut.toLocaleString("ar-EG")}
            </td>
            <td className="p-3.5" colSpan={2}></td>
            <td className="p-3.5 num">
              {totalValue.toLocaleString("ar-EG")} ج.م
            </td>
            <td className="p-3.5"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
