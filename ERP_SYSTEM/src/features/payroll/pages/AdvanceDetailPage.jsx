// features/payroll/pages/AdvanceDetailPage.jsx
//
// MOCK: جدول الأقساط بالكامل مبني client-side لغاية ما يتوفر endpoint حقيقي
// للسلف بالأقساط (installments schema) من الباك إند. القيمة الأساسية للسلفة
// وتاريخها حقيقيين (من EmployeeTransactions)، لكن تقسيمها لأقساط شهرية
// ومتابعة "مدفوع/مستحق" كله تقريبي وموضح بشارة واضحة في الصفحة.

import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { useGetEmployeeTransactionsQuery } from "../payrollApi";
import { parseCategory, fmtMoney } from "../payroll.constants";

const MOCK_INSTALLMENT_MONTHS = 3;

function buildMockInstallments(advance) {
  const monthly =
    Math.round((advance.amount / MOCK_INSTALLMENT_MONTHS) * 100) / 100;
  const startDate = new Date(advance.transactionDate);
  return Array.from({ length: MOCK_INSTALLMENT_MONTHS }).map((_, i) => {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + i + 1);
    const label = d.toLocaleDateString("ar-EG", {
      month: "long",
      year: "numeric",
    });
    return {
      month: label,
      amount: monthly,
      dueDate: d.toISOString().slice(0, 10),
      status: i === 0 && advance.isProcessed ? "مدفوع" : "مستحق",
    };
  });
}

export default function AdvanceDetailPage() {
  const { advanceId } = useParams();
  const navigate = useNavigate();

  // TODO INTEGRATION: مفيش getEmployeeTransactionById في الـAPI، فبنجيب
  // الليستة كلها ونفلتر عليها. لو فيه endpoint by id استبدل الاستدعاء ده.
  const { data, isLoading } = useGetEmployeeTransactionsQuery({
    PageSize: 200,
  });
  const advance = data?.items?.find((t) => String(t.id) === String(advanceId));

  if (isLoading) return <div className="p-6 text-ink-400">جاري التحميل...</div>;
  if (!advance)
    return <div className="p-6 text-red-500">تعذر إيجاد السلفة</div>;

  const { cleanNotes } = parseCategory(advance.notes);
  const installments = buildMockInstallments(advance);
  const paid = installments
    .filter((i) => i.status === "مدفوع")
    .reduce((s, i) => s + i.amount, 0);
  const remaining = advance.amount - paid;

  return (
    <div className="animate-fadeUp space-y-6">
      <button
        onClick={() => navigate("/dashboard/payroll/advances")}
        className="flex items-center gap-1.5 text-sm text-emerald-700 hover:underline"
      >
        <ArrowRight size={14} />
        رجوع لقائمة السلف
      </button>

      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <AlertTriangle size={15} className="shrink-0 mt-0.5" />
        <p>
          جدول الأقساط ده بيانات تجريبية (Mock) لحد ما يتوفر endpoint حقيقي
          لتفاصيل أقساط السلف من الباك إند. القيمة الإجمالية وتاريخ السلفة بس
          هما البيانات الحقيقية.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-ink-900 mb-1">
          {advance.employeeName}
        </h2>
        <p className="text-sm text-ink-400 mb-6">{cleanNotes || "سلفة"}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <p className="text-xs text-ink-400 mb-1">قيمة السلفة</p>
            <p className="text-lg font-bold num text-ink-900">
              {fmtMoney(advance.amount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-400 mb-1">إجمالي المدفوع</p>
            <p className="text-lg font-bold num text-positive">
              {fmtMoney(paid)}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-400 mb-1">المتبقي</p>
            <p className="text-lg font-bold num text-negative">
              {fmtMoney(remaining)}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-400 mb-1">القسط الشهري</p>
            <p className="text-lg font-bold num text-ink-900">
              {fmtMoney(advance.amount / MOCK_INSTALLMENT_MONTHS)}
            </p>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-ink-900 mb-3">
          جدول الأقساط
        </h3>
        <div className="overflow-x-auto custom-scroll rounded-xl border border-ink-400/10">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
                <th className="p-2.5 font-medium border-l border-ink-400/5">
                  الشهر
                </th>
                <th className="p-2.5 font-medium border-l border-ink-400/5">
                  قيمة القسط
                </th>
                <th className="p-2.5 font-medium border-l border-ink-400/5">
                  تاريخ الاستحقاق
                </th>
                <th className="p-2.5 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {installments.map((i, idx) => (
                <tr
                  key={idx}
                  className="border-b border-ink-400/5 last:border-0"
                >
                  <td className="p-2.5 text-sm text-ink-900 border-l border-ink-400/5">
                    {i.month}
                  </td>
                  <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                    {fmtMoney(i.amount)}
                  </td>
                  <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                    {i.dueDate}
                  </td>
                  <td className="p-2.5">
                    <span
                      className={
                        i.status === "مدفوع"
                          ? "inline-block text-emerald-700 text-xs font-semibold bg-emerald-700/10 px-2 py-0.5 rounded-full"
                          : "inline-block text-amber-600 text-xs font-semibold bg-amber-50 px-2 py-0.5 rounded-full"
                      }
                    >
                      {i.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
