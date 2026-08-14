// features/payroll/pages/PayrollDashboardPage.jsx
//
// TODO INTEGRATION: مفيش endpoint مخصص لـstats الداشبورد في الـshapes اللي
// بعتها. دلوقتي بيتم حساب الأرقام من useGetPayrollEntriesQuery للفترة الحالية
// (أول اللوجيك التقريبي) لحد ما يتوفر endpoint مخصص للملخص. لو فيه endpoint
// زي "PayrollEntries/summary" بلغني وأستبدل الحساب اليدوي بيه مباشرة.

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Users,
  PiggyBank,
  CreditCard,
} from "lucide-react";
import { useGetPayrollEntriesQuery, useGetEmployeesQuery } from "../payrollApi";
import { fmtMoney } from "../payroll.constants";

function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-ink-400/10 bg-white p-4 shadow-card hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-ink-400">{label}</p>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            tone === "negative"
              ? "bg-negative/10 text-negative"
              : tone === "positive"
                ? "bg-positive/10 text-positive"
                : "bg-primary-50 text-primary-500"
          }`}
        >
          <Icon size={15} />
        </div>
      </div>
      <p className="text-xl font-bold num text-ink-900">{value}</p>
    </div>
  );
}

export default function PayrollDashboardPage() {
  const navigate = useNavigate();
  const { data: employeesData } = useGetEmployeesQuery({ PageSize: 1 });
  const { data: entriesData, isLoading } = useGetPayrollEntriesQuery({
    PageSize: 100,
  });

  const entries = entriesData?.items || [];

  const stats = useMemo(() => {
    const totalGross = entries.reduce((s, e) => s + (e.grossSalary || 0), 0);
    const totalDeductions = entries.reduce((s, e) => s + (e.deduction || 0), 0);
    const totalNet = entries.reduce((s, e) => s + (e.netSalary || 0), 0);
    return { totalGross, totalDeductions, totalNet };
  }, [entries]);

  const totalEmployees = employeesData?.totalCount || 0;

  return (
    <div className="animate-fadeUp space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">
          لوحة تحكم الأجور والمرتبات
        </h2>
        <p className="text-sm text-ink-400 mt-1">
          نظرة عامة على المرتبات والمستحقات
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="إجمالي المرتبات"
          value={fmtMoney(stats.totalGross)}
          icon={Wallet}
        />
        <StatCard
          label="صافي المستحق"
          value={fmtMoney(stats.totalNet)}
          icon={TrendingUp}
          tone="positive"
        />
        {/* TODO INTEGRATION: "إجمالي ما تم صرفه" محتاج فلترة بحالة "تم الصرف" */}
        <StatCard label="إجمالي ما تم صرفه" value="—" icon={CreditCard} />
        <StatCard
          label="إجمالي الخصومات"
          value={fmtMoney(stats.totalDeductions)}
          icon={TrendingDown}
          tone="negative"
        />
        {/* TODO INTEGRATION: "إجمالي السلف" محتاج فلترة EmployeeTransactions بنوع السلفة تحديدًا */}
        <StatCard label="إجمالي السلف" value="—" icon={PiggyBank} />
        <StatCard label="عدد الموظفين" value={totalEmployees} icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-ink-900">
              المرتبات المعلّقة
            </h3>
            <button
              onClick={() => navigate("/payroll/salaries")}
              className="text-xs text-primary-600 hover:underline"
            >
              عرض الكل
            </button>
          </div>
          {isLoading ? (
            <p className="text-sm text-ink-400 py-6 text-center">
              جارِ التحميل...
            </p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-ink-400 py-6 text-center">
              لا توجد مرتبات معلّقة
            </p>
          ) : (
            <div className="space-y-2">
              {entries.slice(0, 6).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between py-2 border-b border-ink-400/5 last:border-0 cursor-pointer hover:bg-ink-900/[0.015] -mx-2 px-2 rounded-lg transition-colors"
                  onClick={() => navigate(`/payroll/salaries/${e.id}`)}
                >
                  <div>
                    <p className="text-sm text-ink-900">{e.employeeName}</p>
                    <p className="text-[11px] text-ink-400">
                      {e.startDate} - {e.endDate}
                    </p>
                  </div>
                  <span className="num text-sm font-semibold text-ink-900">
                    {fmtMoney(e.netSalary)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card p-4">
          <h3 className="text-sm font-semibold text-ink-900 mb-3">
            آخر العمليات
          </h3>
          {/* TODO INTEGRATION: مفيش endpoint لسجل عمليات (Activity Log) في
              الـshapes المبعوتة. محتاجين endpoint زي "PayrollEntries/activity"
              أو مصدر مشابه لعرض آخر عمليات إنشاء/اعتماد/صرف مرتب أو إضافة
              سلفة/خصم. لحد ما يتوفر، القسم ده فاضي كنقطة تكامل واضحة. */}
          <p className="text-sm text-ink-400 py-6 text-center">
            سجل العمليات — بانتظار endpoint من الباك إند
          </p>
        </div>
      </div>
    </div>
  );
}
