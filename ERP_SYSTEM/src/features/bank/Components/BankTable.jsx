import { Edit3, Printer, Trash2, Landmark } from "lucide-react";

export default function BankTable({ transactions = [], isLoading, onEdit, onDelete, onPrintRow }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-slate-200/60 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-14 border border-dashed border-ink-400/20 rounded-2xl bg-white">
        <Landmark size={32} className="mx-auto text-ink-400/40 mb-2" />
        <p className="text-ink-400 text-sm">لا توجد حركات بنكية مسجلة</p>
      </div>
    );
  }

  let runningBalance = 0;

  const processedRows = transactions.map((row) => {
    const debit = Number(row.amountIn ?? row.debit ?? (row.type === "in" ? row.amount : 0) ?? 0);
    const credit = Number(row.amountOut ?? row.credit ?? (row.type === "out" ? row.amount : 0) ?? 0);

    runningBalance += debit - credit;

    return {
      ...row,
      debit,
      credit,
      computedBalance: row.balance !== undefined && row.balance !== null ? Number(row.balance) : runningBalance,
      displayName: row.partyName || row.partnerName || row.accountName || row.party?.name || row.partner?.name || "-",
    };
  });

  const totalDebit = processedRows.reduce((acc, curr) => acc + curr.debit, 0);
  const totalCredit = processedRows.reduce((acc, curr) => acc + curr.credit, 0);
  const netBalance = totalDebit - totalCredit;

  return (
    <div className="overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card">
      <table className="w-full text-right border-collapse min-w-[1000px]">
        <thead>
          <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
            <th className="p-3 font-medium border-b border-ink-400/10 text-center w-28">التاريخ</th>
            <th className="p-3 font-medium border-b border-ink-400/10">اسم الحساب</th>
            <th className="p-3 font-medium border-b border-ink-400/10 text-center w-28 text-positive">إيداع (مدين)</th>
            <th className="p-3 font-medium border-b border-ink-400/10 text-center w-28 text-negative">سحب (دائن)</th>
            <th className="p-3 font-medium border-b border-ink-400/10 text-center w-32">الرصيد المتراكم</th>
            <th className="p-3 font-medium border-b border-ink-400/10">الملاحظات</th>
            <th className="p-3 font-medium border-b border-ink-400/10 text-center w-28">إجراءات</th>
          </tr>
        </thead>

        <tbody>
          {processedRows.map((row) => (
            <tr key={row.id || Math.random()} className="border-b border-ink-400/5 last:border-0 hover:bg-ink-900/[0.015] transition-colors">
              <td className="p-3.5 num text-ink-600 text-center text-xs">{row.date}</td>
              <td className="p-3.5 text-ink-900 font-medium">{row.displayName}</td>
              <td className="p-3.5 num text-positive border-x border-ink-400/5 text-center font-medium">
                {row.debit > 0 ? row.debit.toLocaleString("ar-EG") : "—"}
              </td>
              <td className="p-3.5 num text-negative border-l border-ink-400/5 text-center font-medium">
                {row.credit > 0 ? row.credit.toLocaleString("ar-EG") : "—"}
              </td>
              <td className="p-3.5 num text-ink-900 font-semibold border-l border-ink-400/5 text-center">
                {row.computedBalance.toLocaleString("ar-EG")}
              </td>
              <td className="p-3.5 text-ink-600 text-xs truncate max-w-[220px]">{row.notes || row.category || "-"}</td>
              <td className="p-3.5">
                <div className="flex justify-center gap-1">
                  <button onClick={() => onEdit?.(row)} className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors" title="تعديل">
                    <Edit3 size={15} />
                  </button>
                  <button onClick={() => onPrintRow?.(row)} className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-400/5 transition-colors" title="طباعة">
                    <Printer size={15} />
                  </button>
                  <button onClick={() => onDelete?.(row.id)} className="p-1.5 rounded-lg text-negative hover:bg-negative/5 transition-colors" title="حذف">
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr className="bg-primary-50/50 border-t-2 border-primary-100 font-semibold text-ink-900">
            <td className="p-3.5" colSpan={2}>الرصيد الإجمالي بالحساب</td>
            <td className="p-3.5 num text-positive text-center">{totalDebit.toLocaleString("ar-EG")}</td>
            <td className="p-3.5 num text-negative text-center">{totalCredit.toLocaleString("ar-EG")}</td>
            <td className="p-3.5 num text-ink-900 text-center font-bold">{netBalance.toLocaleString("ar-EG")} ج.م</td>
            <td className="p-3.5" colSpan={2}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}