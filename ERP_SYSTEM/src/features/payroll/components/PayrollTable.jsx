import { useState, useMemo } from "react";
import { Trash2, Users, AlertTriangle, Printer } from "lucide-react";
import { useGetPayrollQuery, useDeletePayrollRecordMutation } from "../payrollApi";

export default function PayrollTable({ filters }) {
  const { data: payrollList, isLoading, isError } = useGetPayrollQuery(filters);
  const [deletePayrollRecord, { isLoading: isDeleting }] = useDeletePayrollRecordMutation();
  const [selectedItemToDelete, setSelectedItemToDelete] = useState(null);

  // دالة لطباعة إشعار مرتب الموظف بشكل منفصل
  const handlePrintSingle = (item) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>إشعار مفردات مرتب - ${item.employeeName}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 20px; color: #1e293b; }
            .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #f1f5f9; }
            .bold { font-weight: bold; }
            .net { background: #f8fafc; font-size: 1.2rem; padding: 12px; border-radius: 8px; margin-top: 16px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h2>إشعار صرف مرتب</h2>
              <p>فترة العمل: ${item.workStartDate || "—"} إلى ${item.workEndDate || "—"}</p>
            </div>
            <div class="row"><span>كود الموظف:</span> <span class="bold">${item.code}</span></div>
            <div class="row"><span>اسم الموظف:</span> <span class="bold">${item.employeeName}</span></div>
            <hr style="margin: 15px 0; border: none; border-top: 1px solid #e2e8f0;" />
            <div class="row"><span>المرتب الأساسي:</span> <span>${item.basicSalary?.toLocaleString("ar-EG")} ج.م</span></div>
            <div class="row"><span>الإضافي:</span> <span>${item.overtime?.toLocaleString("ar-EG") || 0} ج.م</span></div>
            <div class="row"><span>المكافآت:</span> <span>${item.bonuses?.toLocaleString("ar-EG") || 0} ج.م</span></div>
            <div class="row bold" style="color: #059669;"><span>إجمالي المستحق:</span> <span>${item.totalEarned?.toLocaleString("ar-EG")} ج.م</span></div>
            <hr style="margin: 15px 0; border: none; border-top: 1px solid #e2e8f0;" />
            <div class="row"><span>السلف:</span> <span>${item.advances?.toLocaleString("ar-EG") || 0} ج.م</span></div>
            <div class="row"><span>الجزاءات:</span> <span>${item.penalties?.toLocaleString("ar-EG") || 0} ج.م</span></div>
            <div class="row bold" style="color: #e11d48;"><span>إجمالي المستقطع:</span> <span>${item.totalDeductions?.toLocaleString("ar-EG")} ج.م</span></div>
            <div class="row net bold"><span>صافي المرتب:</span> <span>${item.netSalary?.toLocaleString("ar-EG")} ج.م</span></div>
            ${item.notes ? `<p style="margin-top: 15px; font-size: 12px; color: #64748b;">ملاحظات: ${item.notes}</p>` : ""}
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const totals = useMemo(() => {
    if (!payrollList || payrollList.length === 0) {
      return {
        basicSalary: 0,
        overtime: 0,
        bonuses: 0,
        totalEarned: 0,
        advances: 0,
        penalties: 0,
        totalDeductions: 0,
        netSalary: 0,
      };
    }

    return payrollList.reduce(
      (acc, item) => ({
        basicSalary: acc.basicSalary + (Number(item.basicSalary) || 0),
        overtime: acc.overtime + (Number(item.overtime) || 0),
        bonuses: acc.bonuses + (Number(item.bonuses) || 0),
        totalEarned: acc.totalEarned + (Number(item.totalEarned) || 0),
        advances: acc.advances + (Number(item.advances) || 0),
        penalties: acc.penalties + (Number(item.penalties) || 0),
        totalDeductions: acc.totalDeductions + (Number(item.totalDeductions) || 0),
        netSalary: acc.netSalary + (Number(item.netSalary) || 0),
      }),
      {
        basicSalary: 0,
        overtime: 0,
        bonuses: 0,
        totalEarned: 0,
        advances: 0,
        penalties: 0,
        totalDeductions: 0,
        netSalary: 0,
      }
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

  if (payrollList?.length === 0) {
    return (
      <div className="text-center py-14 border border-dashed border-ink-400/20 rounded-2xl">
        <Users size={32} className="mx-auto text-ink-400/40 mb-2" />
        <p className="text-ink-400 text-sm">لا توجد سجلات مرتبات مسجلة بعد</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-ink-900/[0.02] border-b border-ink-400/10 text-ink-400 text-xs">
              <th rowSpan={2} className="p-3.5 font-medium whitespace-nowrap">الكود</th>
              <th rowSpan={2} className="p-3.5 font-medium min-w-[160px] whitespace-nowrap">اسم الموظف</th>
              <th colSpan={2} className="p-2 text-center border-l border-ink-400/10 bg-ink-900/[0.01] whitespace-nowrap">فترة العمل</th>
              <th colSpan={4} className="p-2 text-center border-l border-ink-400/10 bg-emerald-500/5 text-emerald-700 font-semibold whitespace-nowrap">المستحقات</th>
              <th colSpan={3} className="p-2 text-center border-l border-ink-400/10 bg-rose-500/5 text-negative font-semibold whitespace-nowrap">الاستقطاعات</th>
              <th rowSpan={2} className="p-3.5 font-bold text-ink-900 bg-ink-900/[0.03] min-w-[120px] whitespace-nowrap">صافي المرتب</th>
              <th rowSpan={2} className="p-3.5 font-medium min-w-[120px] whitespace-nowrap">الملاحظات</th>
              <th rowSpan={2} className="p-3.5 font-medium text-center print:hidden whitespace-nowrap">إجراءات</th>
            </tr>

            <tr className="bg-ink-900/[0.01] border-b border-ink-400/10 text-ink-400 text-[11px]">
              <th className="p-2 font-medium whitespace-nowrap">من</th>
              <th className="p-2 font-medium whitespace-nowrap">إلى</th>

              <th className="p-2 font-medium whitespace-nowrap">الأساسي</th>
              <th className="p-2 font-medium whitespace-nowrap">الإضافي</th>
              <th className="p-2 font-medium whitespace-nowrap">المكافآت</th>
              <th className="p-2 font-bold text-emerald-600 whitespace-nowrap">إجمالي المستحق</th>

              <th className="p-2 font-medium whitespace-nowrap">السلف</th>
              <th className="p-2 font-medium whitespace-nowrap">الجزاءات</th>
              <th className="p-2 font-bold text-negative whitespace-nowrap">إجمالي المستقطع</th>
            </tr>
          </thead>

          <tbody>
            {payrollList?.map((item) => (
              <tr
                key={item.id}
                className="border-b border-ink-400/5 last:border-0 hover:bg-ink-900/[0.015] transition-colors"
              >
                <td className="p-3.5 text-ink-400 num whitespace-nowrap">{item.code}</td>
                <td className="p-3.5 font-medium text-ink-900 whitespace-nowrap">{item.employeeName}</td>
                <td className="p-3.5 num text-ink-400 text-xs whitespace-nowrap">{item.workStartDate}</td>
                <td className="p-3.5 num text-ink-400 text-xs whitespace-nowrap">{item.workEndDate}</td>

                {/* المستحقات */}
                <td className="p-3.5 num text-ink-600 whitespace-nowrap">
                  {item.basicSalary?.toLocaleString("ar-EG")} ج.م
                </td>
                <td className="p-3.5 num text-ink-600 whitespace-nowrap">
                  {item.overtime ? `${item.overtime.toLocaleString("ar-EG")} ج.م` : "—"}
                </td>
                <td className="p-3.5 num text-ink-600 whitespace-nowrap">
                  {item.bonuses ? `${item.bonuses.toLocaleString("ar-EG")} ج.م` : "—"}
                </td>
                <td className="p-3.5 num font-bold text-emerald-600 whitespace-nowrap">
                  {item.totalEarned?.toLocaleString("ar-EG")} ج.م
                </td>

                {/* الاستقطاعات */}
                <td className="p-3.5 num text-ink-600 whitespace-nowrap">
                  {item.advances ? `${item.advances.toLocaleString("ar-EG")} ج.م` : "—"}
                </td>
                <td className="p-3.5 num text-ink-600 whitespace-nowrap">
                  {item.penalties ? `${item.penalties.toLocaleString("ar-EG")} ج.م` : "—"}
                </td>
                <td className="p-3.5 num font-bold text-negative whitespace-nowrap">
                  {item.totalDeductions?.toLocaleString("ar-EG")} ج.م
                </td>

                {/* صافي المرتب */}
                <td className="p-3.5 num font-bold text-ink-900 bg-ink-900/[0.02] whitespace-nowrap">
                  {item.netSalary?.toLocaleString("ar-EG")} ج.م
                </td>

                <td className="p-3.5 text-ink-400 text-xs whitespace-nowrap">{item.notes || "—"}</td>

                {/* أزرار الإجراءات (طباعة منفردة + حذف) */}
                <td className="p-3.5 print:hidden whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handlePrintSingle(item)}
                      className="p-1.5 rounded-lg text-ink-600 hover:bg-ink-900/5 transition-colors"
                      title="طباعة إشعار مفردات مرتب"
                    >
                      <Printer size={16} />
                    </button>
                    <button
                      onClick={() => setSelectedItemToDelete(item)}
                      className="p-1.5 rounded-lg text-negative hover:bg-negative/5 transition-colors"
                      title="حذف السجل"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

          {/* صف الإجماليات */}
          <tfoot>
            <tr className="bg-ink-900/[0.04] border-t-2 border-ink-400/20 text-ink-900">
              <td colSpan={4} className="p-4 text-right font-black text-base text-ink-900 whitespace-nowrap">
                الإجمالــــي
              </td>

              <td className="p-4 num font-bold text-sm text-ink-900 whitespace-nowrap">{totals.basicSalary.toLocaleString("ar-EG")} ج.م</td>
              <td className="p-4 num font-bold text-sm text-ink-900 whitespace-nowrap">{totals.overtime.toLocaleString("ar-EG")} ج.م</td>
              <td className="p-4 num font-bold text-sm text-ink-900 whitespace-nowrap">{totals.bonuses.toLocaleString("ar-EG")} ج.م</td>
              <td className="p-4 num font-black text-base text-emerald-600 bg-emerald-500/10 whitespace-nowrap">
                {totals.totalEarned.toLocaleString("ar-EG")} ج.م
              </td>

              <td className="p-4 num font-bold text-sm text-ink-900 whitespace-nowrap">{totals.advances.toLocaleString("ar-EG")} ج.م</td>
              <td className="p-4 num font-bold text-sm text-ink-900 whitespace-nowrap">{totals.penalties.toLocaleString("ar-EG")} ج.م</td>
              <td className="p-4 num font-black text-base text-negative bg-rose-500/10 whitespace-nowrap">
                {totals.totalDeductions.toLocaleString("ar-EG")} ج.م
              </td>

              <td className="p-4 num font-black text-lg text-ink-900 bg-ink-900/10 whitespace-nowrap">
                {totals.netSalary.toLocaleString("ar-EG")} ج.م
              </td>

              <td colSpan={2} className="p-4 print:hidden whitespace-nowrap"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* مودال تأكيد الحذف */}
      {selectedItemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-card border border-ink-400/10">
            <div className="flex items-center gap-3 text-negative mb-3">
              <div className="p-2.5 rounded-xl bg-negative/10">
                <AlertTriangle size={22} />
              </div>
              <h3 className="font-bold text-base text-ink-900">تأكيد عملية الحذف</h3>
            </div>

            <p className="text-xs text-ink-400 leading-relaxed mb-5">
              هل أنت متأكد من حذف سجل الموظف{" "}
              <span className="font-semibold text-ink-900">
                "{selectedItemToDelete.employeeName}"
              </span>
              ؟
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                disabled={isDeleting}
                onClick={() => setSelectedItemToDelete(null)}
                className="px-4 py-2 rounded-xl border border-ink-400/20 text-xs text-ink-600 hover:bg-ink-900/[0.02] font-medium"
              >
                إلغاء
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-negative hover:bg-negative/90 text-white text-xs font-semibold shadow-sm"
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