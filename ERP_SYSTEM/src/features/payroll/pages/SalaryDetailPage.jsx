// features/payroll/pages/SalaryDetailPage.jsx
//
// TODO INTEGRATION: تفصيل بنود الاستحقاقات/الخصومات (كل نوع لوحده) مبني من
// EmployeeTransactions الحقيقية بتاعة نفس الموظف في فترة المرتب (فلترة
// client-side بـcategory المُرمّز في notes - راجع payroll.constants.js).
// لو الباك إند بيرجع تفصيل جاهز جوه PayrollEntries نفسه، استبدل الجزء ده
// بقراءة مباشرة من الـresponse بدل الفلترة اليدوية.
// حالة المرتب (status) مش موجودة في الـschema، فالأزرار شغالة كلها دايمًا
// وموصولة بـapprovePayrollEntry/disbursePayrollEntry الحقيقيين.

import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Wallet, Printer } from "lucide-react";
import {
  useGetPayrollEntryByIdQuery,
  useGetEmployeeTransactionsQuery,
  useApprovePayrollEntryMutation,
  useDisbursePayrollEntryMutation,
} from "../payrollApi";
import { parseCategory, categoryLabel, fmtMoney } from "../payroll.constants";
import Button from "../../../shared/components/ui/Button";

export default function SalaryDetailPage() {
  const { salaryId } = useParams();
  const navigate = useNavigate();

  const {
    data: entry,
    isLoading,
    isError,
  } = useGetPayrollEntryByIdQuery(salaryId);
  const { data: txData } = useGetEmployeeTransactionsQuery(
    { EmployeeId: entry?.employeeId, PageSize: 100 },
    { skip: !entry?.employeeId },
  );

  const [approve, { isLoading: isApproving }] =
    useApprovePayrollEntryMutation();
  const [disburse, { isLoading: isDisbursing }] =
    useDisbursePayrollEntryMutation();

  const { earnings, deductions } = useMemo(() => {
    const items = (txData?.items || []).map((t) => ({
      ...t,
      ...parseCategory(t.notes),
    }));
    return {
      earnings: items.filter((t) => t.type === "Credit"),
      deductions: items.filter((t) => t.type === "Debit"),
    };
  }, [txData]);

  const handleApprove = () => {
    toast(`اعتماد مرتب "${entry?.employeeName}"؟`, {
      action: {
        label: "تأكيد الاعتماد",
        onClick: async () => {
          try {
            await approve(salaryId).unwrap();
            toast.success("تم اعتماد المرتب بنجاح");
          } catch {
            toast.error("حصل خطأ أثناء الاعتماد، حاول تاني");
          }
        },
      },
      cancel: { label: "إلغاء" },
      duration: 6000,
    });
  };

  const handleDisburse = () => {
    toast(`صرف مرتب "${entry?.employeeName}"؟`, {
      description: "الإجراء ده لا يمكن التراجع عنه",
      action: {
        label: "تأكيد الصرف",
        onClick: async () => {
          try {
            await disburse(salaryId).unwrap();
            toast.success("تم صرف المرتب بنجاح");
          } catch {
            toast.error("حصل خطأ أثناء الصرف، حاول تاني");
          }
        },
      },
      cancel: { label: "إلغاء" },
      duration: 6000,
    });
  };

  if (isLoading) return <div className="p-6 text-ink-400">جاري التحميل...</div>;
  if (isError || !entry)
    return <div className="p-6 text-red-500">تعذر تحميل بيانات المرتب</div>;

  return (
    <div className="animate-fadeUp space-y-6">
      <button
        onClick={() => navigate("/dashboard/payroll/salaries")}
        className="flex items-center gap-1.5 text-sm text-emerald-700 hover:underline"
      >
        <ArrowRight size={14} />
        رجوع لقائمة المرتبات
      </button>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-ink-900">
              {entry.employeeName}
            </h2>
            <p className="text-sm text-ink-400 mt-1">
              مرتب {entry.startDate} إلى {entry.endDate}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer size={14} />
              طباعة
            </Button>
            <Button
              variant="outline"
              onClick={handleApprove}
              disabled={isApproving}
            >
              <CheckCircle2 size={14} />
              {isApproving ? "..." : "اعتماد المرتب"}
            </Button>
            <Button onClick={handleDisburse} disabled={isDisbursing}>
              <Wallet size={14} />
              {isDisbursing ? "..." : "صرف المرتب"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* الاستحقاقات */}
          <div>
            <h3 className="text-sm font-semibold text-ink-900 mb-3">
              الاستحقاقات
            </h3>
            <div className="rounded-xl border border-ink-400/10 divide-y divide-ink-400/5">
              <Row
                label="الراتب الأساسي"
                value={fmtMoney(entry.grossSalary - entry.bonus)}
              />
              {earnings.length === 0 ? (
                <Row label="بدون إضافات إضافية" value="—" muted />
              ) : (
                earnings.map((e) => (
                  <Row
                    key={e.id}
                    label={categoryLabel(e.category)}
                    value={fmtMoney(e.amount)}
                  />
                ))
              )}
              <Row
                label="إجمالي الاستحقاقات"
                value={fmtMoney(entry.grossSalary)}
                bold
              />
            </div>
          </div>

          {/* الخصومات */}
          <div>
            <h3 className="text-sm font-semibold text-ink-900 mb-3">
              الخصومات
            </h3>
            <div className="rounded-xl border border-ink-400/10 divide-y divide-ink-400/5">
              {deductions.length === 0 ? (
                <Row label="بدون خصومات" value="—" muted />
              ) : (
                deductions.map((d) => (
                  <Row
                    key={d.id}
                    label={categoryLabel(d.category)}
                    value={fmtMoney(d.amount)}
                    negative
                  />
                ))
              )}
              <Row
                label="إجمالي الخصومات"
                value={fmtMoney(entry.deduction)}
                bold
                negative
              />
            </div>
          </div>
        </div>

        {/* صافي المرتب */}
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-primary-500/[0.08] to-primary-500/[0.02] border border-primary-200 p-5 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-900">
            صافي المرتب
          </span>
          <span className="text-2xl font-bold num text-primary-600">
            {fmtMoney(entry.netSalary)}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, negative, muted }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className={`text-sm ${muted ? "text-ink-400" : "text-ink-700"}`}>
        {label}
      </span>
      <span
        className={`num text-sm ${bold ? "font-bold" : "font-medium"} ${
          negative ? "text-negative" : muted ? "text-ink-400" : "text-ink-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
