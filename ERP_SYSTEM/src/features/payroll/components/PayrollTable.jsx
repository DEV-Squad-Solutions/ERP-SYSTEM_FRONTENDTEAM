import { useState, useMemo } from "react";
import { Trash2, Users, AlertTriangle } from "lucide-react";
import { useDeletePayrollRecordMutation, useGetPayrollQuery } from "../payrollApi";

export default function PayrollTable({ filters }) {
  const { data: payrollList, isLoading, isError } = useGetPayrollQuery(filters);
  const [deletePayrollRecord, { isLoading: isDeleting }] = useDeletePayrollRecordMutation();

  const [selectedItemToDelete, setSelectedItemToDelete] = useState(null);

  const totals = useMemo(() => {
    if (!payrollList || payrollList.length === 0) {
      return { totalDebit: 0, totalCredit: 0, totalBalance: 0 };
    }
    return payrollList.reduce(
      (acc, item) => ({
        totalDebit: acc.totalDebit + (Number(item.debit) || 0),
        totalCredit: acc.totalCredit + (Number(item.credit) || 0),
        totalBalance: acc.totalBalance + (Number(item.balance) || 0),
      }),
      { totalDebit: 0, totalCredit: 0, totalBalance: 0 }
    );
  }, [payrollList]);

  const handleDeleteConfirm = async () => {
    if (selectedItemToDelete) {
      await deletePayrollRecord(selectedItemToDelete.id);
      setSelectedItemToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-ink-400/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="p-6 text-center text-negative text-sm">
        حدث خطأ أثناء تحميل سجل الأجور والمرتبات
      </p>
    );
  }

  if (payrollList?.length === 0) {
    return (
      <div className="text-center py-14 border border-dashed border-ink-400/20 rounded-2xl">
        <Users size={32} className="mx-auto text-ink-400/40 mb-2" />
        <p className="text-ink-400 text-sm">لا توجد سجلات أجور أو مرتبات مسجلة</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card print:border-none print:shadow-none">
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr className="bg-ink-900/[0.04] border-b border-ink-400/10 text-ink-600 font-semibold">
              <th rowSpan={2} className="p-3 border-l border-ink-400/10">الكود</th>
              <th rowSpan={2} className="p-3 border-l border-ink-400/10 min-w-[140px]">اسم الموظف</th>
              <th colSpan={2} className="p-2 text-center border-l border-ink-400/10">أيام العمل / المدة</th>
              <th colSpan={2} className="p-2 text-center border-l border-ink-400/10">المبالغ</th>
              <th rowSpan={2} className="p-3 border-l border-ink-400/10">الرصيد</th>
              <th rowSpan={2} className="p-3 border-l border-ink-400/10 min-w-[150px]">الملاحظات</th>
              <th rowSpan={2} className="p-3 text-center print:hidden">إجراءات</th>
            </tr>

            <tr className="bg-ink-900/[0.02] border-b border-ink-400/10 text-ink-400 text-[11px]">
              <th className="p-2 border-l border-ink-400/10 font-medium">تاريخ بداية</th>
              <th className="p-2 border-l border-ink-400/10 font-medium">تاريخ نهاية</th>
              <th className="p-2 border-l border-ink-400/10 font-medium">مدين</th>
              <th className="p-2 border-l border-ink-400/10 font-medium">دائن</th>
            </tr>
          </thead>

          <tbody>
            {payrollList?.map((item) => (
              <tr
                key={item.id}
                className="border-b border-ink-400/5 last:border-0 hover:bg-ink-900/[0.015] transition-colors"
              >
                <td className="p-3 text-ink-400 num border-l border-ink-400/5">{item.code}</td>
                <td className="p-3 font-semibold text-ink-900 border-l border-ink-400/5">{item.employeeName}</td>
                <td className="p-3 num text-ink-500 border-l border-ink-400/5">{item.workStartDate}</td>
                <td className="p-3 num text-ink-500 border-l border-ink-400/5">{item.workEndDate}</td>
                <td className="p-3 num font-medium text-emerald-600 border-l border-ink-400/5">
                  {item.debit?.toLocaleString("ar-EG")} ج.م
                </td>
                <td className="p-3 num font-medium text-rose-600 border-l border-ink-400/5">
                  {item.credit?.toLocaleString("ar-EG")} ج.م
                </td>
                <td className="p-3 num font-bold text-ink-900 border-l border-ink-400/5">
                  {item.balance?.toLocaleString("ar-EG")} ج.م
                </td>
                <td className="p-3 text-ink-500 border-l border-ink-400/5">{item.notes || "—"}</td>
                <td className="p-3 print:hidden">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => setSelectedItemToDelete(item)}
                      className="p-1.5 rounded-lg text-negative hover:bg-negative/5 transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

    
<tfoot>
  <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900 text-sm">
    {/* تم المحاذاة لليمين وتكبير الخط */}
    <td colSpan={4} className="p-4 text-right border-l border-slate-200 font-extrabold text-base text-slate-800">
      الإجمالـــي
    </td>
    <td className="p-4 num text-emerald-700 border-l border-slate-200 text-base font-extrabold">
      {totals.totalDebit.toLocaleString("ar-EG")} ج.م
    </td>
    <td className="p-4 num text-rose-700 border-l border-slate-200 text-base font-extrabold">
      {totals.totalCredit.toLocaleString("ar-EG")} ج.م
    </td>
    <td className="p-4 num text-slate-900 border-l border-slate-200 bg-slate-200/60 text-base font-black">
      {totals.totalBalance.toLocaleString("ar-EG")} ج.م
    </td>
    <td colSpan={2} className="p-4 text-slate-400 font-normal text-xs print:hidden">
      —
    </td>
  </tr>
</tfoot>
        </table>

        <div className="flex items-center justify-between p-3 bg-slate-50 border-t border-ink-400/10 text-xs text-slate-600 print:bg-transparent">
          <span className="font-semibold">عدد السجلات: {payrollList?.length || 0}</span>
        </div>
      </div>

      {selectedItemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2.5 rounded-xl bg-rose-50">
                <AlertTriangle size={22} />
              </div>
              <h3 className="font-bold text-base text-slate-800">تأكيد عملية الحذف</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              هل أنت متأكد من حذف سجل الموظف{" "}
              <span className="font-semibold text-slate-900">"{selectedItemToDelete.employeeName}"</span>؟
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                disabled={isDeleting}
                onClick={() => setSelectedItemToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              >
                إلغاء
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                {isDeleting ? "جاري الحذف..." : "نعم، احذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}