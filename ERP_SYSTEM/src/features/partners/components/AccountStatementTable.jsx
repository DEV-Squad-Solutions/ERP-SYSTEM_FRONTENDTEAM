import { FileSearch, Users } from "lucide-react";
import { useGetInvoicesQuery } from "../../sales/salesApi";

/**
 * @param {{ partyName: string }} props
 */
export default function AccountStatementTable({ partyName }) {
  const {
    data: invoices,
    isLoading,
    isFetching,
    isError,
  } = useGetInvoicesQuery({ partyName }, { skip: !partyName });

  if (!partyName) {
    return (
      <div className="text-center py-16 border border-dashed border-ink-400/20 rounded-2xl animate-fadeUp">
        <div className="w-14 h-14 rounded-full bg-ink-400/5 flex items-center justify-center mx-auto mb-3">
          <Users size={26} className="text-ink-400/50" strokeWidth={1.6} />
        </div>
        <p className="text-ink-900 font-medium mb-1">اختر عميل أو مورد</p>
        <p className="text-sm text-ink-400">لعرض كشف الحساب الخاص به</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-11 rounded-xl bg-ink-400/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="p-6 text-center text-negative text-sm">
        حدث خطأ في تحميل كشف الحساب
      </p>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-14 border border-dashed border-ink-400/20 rounded-2xl">
        <FileSearch size={32} className="mx-auto text-ink-400/40 mb-2" />
        <p className="text-ink-400 text-sm">لا توجد حركات لهذا الحساب</p>
      </div>
    );
  }

  const sorted = [...invoices].sort((a, b) => a.date.localeCompare(b.date));

  let runningBalance = 0;
  const rows = sorted.map((inv) => {
    const netAmount =
      inv.items.reduce((s, it) => s + (it.value || 0), 0) -
      (inv.discount || 0) +
      (inv.tax || 0);
    const paid = inv.paid || 0;

    const isSale = inv.movementType === "sale";
    const debit = isSale ? netAmount : paid; // مدين
    const credit = isSale ? paid : netAmount; // دائن

    runningBalance += debit - credit;

    return {
      id: inv.id,
      date: inv.date,
      description: `فاتورة ${isSale ? "مبيعات" : "مشتريات"} رقم ${inv.invoiceNumber}`,
      dueDate: inv.date,
      debit,
      credit,
      balance: runningBalance,
    };
  });

  const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0);
  const finalBalance = rows[rows.length - 1]?.balance || 0;

  return (
    <div
      className={`overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${isFetching ? "opacity-60" : ""}`}
    >
      <table className="w-full text-right border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
            <th className="p-3 font-medium border-b border-ink-400/10">
              التاريخ
            </th>
            <th className="p-3 font-medium border-b border-ink-400/10">
              البيان
            </th>
            <th className="p-3 font-medium border-b border-ink-400/10">
              تاريخ الاستحقاق
            </th>
            <th className="p-3 font-medium border-b border-ink-400/10 text-positive">
              مدين
            </th>
            <th className="p-3 font-medium border-b border-ink-400/10 text-negative">
              دائن
            </th>
            <th className="p-3 font-medium border-b border-ink-400/10">
              الرصيد
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-ink-400/5 last:border-0 hover:bg-ink-900/[0.015] transition-colors"
            >
              <td className="p-3 num text-ink-600">{row.date}</td>
              <td className="p-3 text-ink-900">{row.description}</td>
              <td className="p-3 num text-ink-500">{row.dueDate}</td>
              <td className="p-3 num text-positive">
                {row.debit > 0 ? row.debit.toLocaleString("ar-EG") : "—"}
              </td>
              <td className="p-3 num text-negative">
                {row.credit > 0 ? row.credit.toLocaleString("ar-EG") : "—"}
              </td>
              <td
                className={`p-3 num font-semibold ${row.balance > 0 ? "text-positive" : row.balance < 0 ? "text-negative" : "text-ink-600"}`}
              >
                {row.balance.toLocaleString("ar-EG")}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-primary-50/50 border-t-2 border-primary-100 font-semibold text-ink-900">
            <td className="p-3" colSpan={3}>
              الإجمالي
            </td>
            <td className="p-3 num text-positive">
              {totalDebit.toLocaleString("ar-EG")}
            </td>
            <td className="p-3 num text-negative">
              {totalCredit.toLocaleString("ar-EG")}
            </td>
            <td
              className={`p-3 num ${finalBalance > 0 ? "text-positive" : finalBalance < 0 ? "text-negative" : "text-ink-900"}`}
            >
              {finalBalance.toLocaleString("ar-EG")}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
