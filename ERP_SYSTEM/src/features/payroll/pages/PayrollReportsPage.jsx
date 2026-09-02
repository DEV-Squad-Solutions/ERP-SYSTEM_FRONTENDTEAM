import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Printer,
  CalendarDays,
  Users,
  Wallet,
  Banknote,
  Clock3,
  CheckCircle2,
  CircleDollarSign,
  UserCheck,
  UserX,
  Timer,
  TrendingUp,
  TrendingDown,
  ReceiptText,
  ArrowUpRight,
} from "lucide-react";

import { useGetPayrollReportQuery } from "../payrollApi";
import { fmtMoney } from "../payroll.constants";

import Button from "../../../shared/components/ui/Button";
import { usePayrollReportPrint } from "../../../shared/hooks/usePayrollReportPrint";
import PayrollReportPrintTemplate from "../../../shared/components/print/PayrollReportPrintTemplate";

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getFirstDayOfMonth = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}-01`;
};

function formatDate(date) {
  if (!date) return "—";

  try {
    return new Intl.DateTimeFormat("ar-EG").format(
      new Date(`${date}T00:00:00`),
    );
  } catch {
    return date;
  }
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconClassName = "",
  valueClassName = "",
  description,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{title}</p>

          <p
            className={`mt-2 text-xl font-bold tracking-tight text-slate-900 ${valueClassName}`}
          >
            {value}
          </p>

          {description && (
            <p className="mt-1 text-[11px] text-slate-400">{description}</p>
          )}
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 ${iconClassName}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description, count }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon size={17} />
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>

          {description && (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          )}
        </div>
      </div>

      {count !== undefined && (
        <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
          {count} موظف
        </span>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
        <ReceiptText size={21} />
      </div>

      <p className="text-sm font-semibold text-slate-700">لا توجد بيانات</p>

      <p className="mt-1 max-w-md text-xs text-slate-500">
        لا توجد كشوف رواتب أو بيانات موظفين ضمن الفترة المحددة.
      </p>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-[105px] animate-pulse rounded-2xl bg-slate-100"
          />
        ))}
      </div>

      <div className="h-[500px] animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}

export default function PayrollReportsPage() {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(getFirstDayOfMonth());

  const [endDate, setEndDate] = useState(getToday());

  const params = useMemo(
    () => ({
      StartDate: startDate,
      EndDate: endDate,
    }),
    [startDate, endDate],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetPayrollReportQuery(params);

  const { printReport, printRef } = usePayrollReportPrint({
    title: "تقرير الأجور والمرتبات",
  });

  const summary = data?.summary ?? {};

  const employees = Array.isArray(data?.employees) ? data.employees : [];

  const paidPercentage = useMemo(() => {
    const total = Number(summary.totalEntries ?? 0);

    if (!total) return 0;

    return Math.round((Number(summary.paidCount ?? 0) / total) * 100);
  }, [summary]);

  const handlePrint = () => {
    if (!data) return;

    printReport();
  };

  const handleOpenPayroll = (payrollEntryId) => {
    if (!payrollEntryId) return;

    navigate(`/dashboard/payroll/salaries/${payrollEntryId}`);
  };

  if (isLoading) {
    return (
      <div dir="rtl" className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            تقارير الأجور والمرتبات
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            تقرير تفصيلي للرواتب والموظفين والحضور والاستحقاقات
          </p>
        </div>

        <ReportSkeleton />
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <ReceiptText size={19} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                تقارير الأجور والمرتبات
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                تقرير تفصيلي للرواتب والموظفين والحضور والاستحقاقات
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={refetch} disabled={isFetching}>
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
            تحديث
          </Button>

          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={isFetching || isError || !data}
          >
            <Printer size={15} />
            طباعة
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={17} className="text-slate-500" />

          <div>
            <h2 className="text-sm font-bold text-slate-900">فترة التقرير</h2>

            <p className="mt-0.5 text-xs text-slate-500">
              حدد الفترة المطلوب استخراج تقرير الرواتب عنها
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              من تاريخ
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-[38px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              إلى تاريخ
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-[38px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          حدث خطأ أثناء تحميل تقرير الأجور والمرتبات.
        </div>
      )}

      {/* Summary */}
      <div>
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900">ملخص التقرير</h2>

          <p className="mt-1 text-xs text-slate-500">
            إجمالي المؤشرات المالية والتشغيلية للفترة المحددة
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="إجمالي كشوف الرواتب"
            value={summary.totalEntries ?? 0}
            icon={ReceiptText}
            iconClassName="text-slate-600"
          />

          <StatCard
            title="عدد الموظفين"
            value={summary.totalEmployees ?? 0}
            icon={Users}
            iconClassName="text-violet-600"
          />

          <StatCard
            title="إجمالي الإجمالي"
            value={fmtMoney(summary.totalGrossSalary ?? 0)}
            icon={Wallet}
            iconClassName="text-blue-600"
            valueClassName="text-blue-700"
          />

          <StatCard
            title="إجمالي الراتب المحسوب"
            value={fmtMoney(summary.totalCalculatedSalary ?? 0)}
            icon={TrendingUp}
            iconClassName="text-indigo-600"
            valueClassName="text-indigo-700"
          />

          <StatCard
            title="إجمالي المكافآت"
            value={fmtMoney(summary.totalBonus ?? 0)}
            icon={TrendingUp}
            iconClassName="text-emerald-600"
            valueClassName="text-emerald-700"
          />

          <StatCard
            title="إجمالي الخصومات"
            value={fmtMoney(summary.totalDeduction ?? 0)}
            icon={TrendingDown}
            iconClassName="text-red-600"
            valueClassName="text-red-700"
          />

          <StatCard
            title="صافي الرواتب"
            value={fmtMoney(summary.totalNetSalary ?? 0)}
            icon={CircleDollarSign}
            iconClassName="text-emerald-600"
            valueClassName="text-emerald-700"
          />

          <StatCard
            title="المبلغ المدفوع"
            value={fmtMoney(summary.paidAmount ?? 0)}
            icon={Banknote}
            iconClassName="text-blue-600"
            valueClassName="text-blue-700"
          />

          <StatCard
            title="المبلغ المعلق"
            value={fmtMoney(summary.pendingAmount ?? 0)}
            icon={Clock3}
            iconClassName="text-amber-600"
            valueClassName="text-amber-700"
          />

          <StatCard
            title="أيام الحضور"
            value={summary.totalPresentDays ?? 0}
            icon={UserCheck}
            iconClassName="text-emerald-600"
            valueClassName="text-emerald-700"
          />

          <StatCard
            title="أيام الغياب"
            value={summary.totalAbsentDays ?? 0}
            icon={UserX}
            iconClassName="text-red-600"
            valueClassName="text-red-700"
          />

          <StatCard
            title="إجمالي وحدات العمل"
            value={summary.totalWorkedUnits ?? 0}
            icon={Timer}
            iconClassName="text-violet-600"
          />
        </div>
      </div>

      {/* Payment Status */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <CheckCircle2 size={17} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">حالة السداد</h2>

              <p className="mt-0.5 text-xs text-slate-500">
                توزيع كشوف الرواتب بين المدفوع والمعلق
              </p>
            </div>
          </div>

          <span className="text-sm font-bold text-slate-700">
            {paidPercentage}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{
              width: `${paidPercentage}%`,
            }}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-emerald-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-700">مدفوع</span>

              <CheckCircle2 size={15} className="text-emerald-600" />
            </div>

            <p className="mt-2 text-lg font-bold text-emerald-800">
              {summary.paidCount ?? 0}
            </p>

            <p className="mt-0.5 text-[11px] text-emerald-600">
              {fmtMoney(summary.paidAmount ?? 0)}
            </p>
          </div>

          <div className="rounded-xl bg-amber-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-700">معلق</span>

              <Clock3 size={15} className="text-amber-600" />
            </div>

            <p className="mt-2 text-lg font-bold text-amber-800">
              {summary.pendingCount ?? 0}
            </p>

            <p className="mt-0.5 text-[11px] text-amber-600">
              {fmtMoney(summary.pendingAmount ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4 pb-0">
          <SectionHeader
            icon={Users}
            title="تفاصيل الموظفين"
            description="تفاصيل كشوف الرواتب والحضور لكل موظف"
            count={employees.length}
          />
        </div>

        {employees.length === 0 ? (
          <div className="p-4">
            <EmptyState />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-right">
              <thead>
                <tr className="border-y border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-xs font-bold text-slate-600">
                    الموظف
                  </th>

                  <th className="px-4 py-3 text-xs font-bold text-slate-600">
                    النوع
                  </th>

                  <th className="px-4 py-3 text-xs font-bold text-slate-600">
                    الفترة
                  </th>

                  <th className="px-4 py-3 text-xs font-bold text-slate-600">
                    الحضور
                  </th>

                  <th className="px-4 py-3 text-xs font-bold text-slate-600">
                    الغياب
                  </th>

                  <th className="px-4 py-3 text-xs font-bold text-slate-600">
                    وحدات العمل
                  </th>

                  <th className="px-4 py-3 text-xs font-bold text-slate-600">
                    إضافي
                  </th>

                  <th className="px-4 py-3 text-xs font-bold text-slate-600">
                    الخصم
                  </th>

                  <th className="px-4 py-3 text-xs font-bold text-slate-600">
                    الإجمالي
                  </th>

                  <th className="px-4 py-3 text-xs font-bold text-slate-600">
                    المكافأة
                  </th>

                  <th className="px-4 py-3 text-xs font-bold text-slate-600">
                    الخصم المالي
                  </th>

                  <th className="px-4 py-3 text-xs font-bold text-slate-600">
                    الصافي
                  </th>

                  <th className="px-4 py-3 text-xs font-bold text-slate-600">
                    الحالة
                  </th>

                  <th className="px-4 py-3 text-xs font-bold text-slate-600">
                    التفاصيل
                  </th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={`${employee.payrollEntryId}-${employee.employeeId}`}
                    className="border-b border-slate-100 transition hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {employee.employeeName || "—"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {employee.employeeCode || "—"}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                        {employee.employeeType === "Daily" ? "يومي" : "شهري"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-500">
                      <div>{formatDate(employee.startDate)}</div>

                      <div className="mt-0.5">
                        {formatDate(employee.endDate)}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold text-emerald-700">
                      {employee.presentDays ?? 0}
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold text-red-700">
                      {employee.absentDays ?? 0}
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-700">
                      {employee.workedUnits ?? 0}
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-700">
                      {employee.overtimeUnits ?? 0}
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-700">
                      {employee.deductionUnits ?? 0}
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                      {fmtMoney(employee.grossSalary ?? 0)}
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold text-emerald-700">
                      {fmtMoney(employee.bonus ?? 0)}
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold text-red-700">
                      {fmtMoney(employee.deduction ?? 0)}
                    </td>

                    <td className="px-4 py-3 text-sm font-bold text-slate-900">
                      {fmtMoney(employee.netSalary ?? 0)}
                    </td>

                    <td className="px-4 py-3">
                      {employee.isPaid ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 size={12} />
                          مدفوع
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                          <Clock3 size={12} />
                          معلق
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenPayroll(employee.payrollEntryId)
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        عرض
                        <ArrowUpRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Footer */}
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} />

          <span>
            الفترة: {formatDate(startDate)} — {formatDate(endDate)}
          </span>
        </div>

        <span>إجمالي الموظفين: {summary.totalEmployees ?? 0}</span>
      </div>

      {/* Print */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <PayrollReportPrintTemplate
            data={data}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </div>
    </div>
  );
}
