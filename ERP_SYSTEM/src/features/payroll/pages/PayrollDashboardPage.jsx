import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Users,
  PiggyBank,
  CreditCard,
  RefreshCw,
  CalendarDays,
  UserRound,
  Clock3,
  ArrowUpRight,
  ReceiptText,
  Banknote,
  Printer,
} from "lucide-react";

import {
  useGetPayrollDashboardQuery,
  useGetEmployeesSelectQuery,
} from "../payrollApi";

import { fmtMoney } from "../payroll.constants";

import Button from "../../../shared/components/ui/Button";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import { usePayrollDashboardPrint } from "../../../shared/hooks/usePayrollDashboardPrint";
import PayrollDashboardPrintTemplate from "../../../shared/components/print/PayrollDashboardPrintTemplate";

const EMPLOYEE_TYPES = {
  DAILY: "Daily",
  MONTHLY: "Monthly",
};

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

function StatCard({
  title,
  value,
  icon: Icon,
  iconClassName = "",
  valueClassName = "",
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{title}</p>

          <p
            className={`mt-2 truncate text-xl font-bold tracking-tight text-slate-900 ${valueClassName}`}
          >
            {value}
          </p>
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

function SectionHeader({ icon: Icon, title, count }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon size={17} />
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>

          {count !== undefined && (
            <p className="text-xs text-slate-500">
              {count} {count === 1 ? "عنصر" : "عناصر"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
        <ReceiptText size={20} />
      </div>

      <p className="text-sm font-semibold text-slate-700">{title}</p>

      {description && (
        <p className="mt-1 max-w-md text-xs text-slate-500">{description}</p>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-[100px] animate-pulse rounded-2xl bg-slate-100"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="h-[320px] animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-[320px] animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

export default function PayrollDashboardPage() {
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState(getFirstDayOfMonth);
  const [toDate, setToDate] = useState(getToday);
  const [employeeId, setEmployeeId] = useState("");
  const [employeeType, setEmployeeType] = useState("");

  const { data: employeesData, isLoading: employeesLoading } =
    useGetEmployeesSelectQuery();

  const employees = useMemo(() => {
    if (Array.isArray(employeesData)) {
      return employeesData;
    }

    if (Array.isArray(employeesData?.data)) {
      return employeesData.data;
    }

    if (Array.isArray(employeesData?.items)) {
      return employeesData.items;
    }

    return [];
  }, [employeesData]);

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: employee.id ?? employee.employeeId,
        label:
          employee.name ??
          employee.employeeName ??
          employee.fullName ??
          employee.code ??
          `موظف ${employee.id ?? employee.employeeId}`,
      })),
    [employees],
  );

  const employeeTypeOptions = useMemo(
    () => [
      {
        value: EMPLOYEE_TYPES.DAILY,
        label: "يومي",
      },
      {
        value: EMPLOYEE_TYPES.MONTHLY,
        label: "شهري",
      },
    ],
    [],
  );

  const params = useMemo(() => {
    const result = {};

    if (fromDate) {
      result.FromDate = fromDate;
    }

    if (toDate) {
      result.ToDate = toDate;
    }

    if (employeeId) {
      result.EmployeeId = Number(employeeId);
    }

    if (employeeType) {
      result.EmployeeType = employeeType;
    }

    return result;
  }, [fromDate, toDate, employeeId, employeeType]);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetPayrollDashboardQuery(params);

  const { printDashboard, printRef } = usePayrollDashboardPrint({
    title: "تقرير الأجور والمرتبات",
  });

  const selectedEmployeeName = useMemo(() => {
    if (!employeeId) {
      return "";
    }

    return (
      employeeOptions.find(
        (option) => String(option.value) === String(employeeId),
      )?.label || ""
    );
  }, [employeeId, employeeOptions]);

  const pendingPayrolls = Array.isArray(data?.pendingPayrolls)
    ? data.pendingPayrolls
    : [];

  const recentOperations = Array.isArray(data?.recentOperations)
    ? data.recentOperations
    : [];

  const handlePrint = () => {
    if (!data) {
      return;
    }

    printDashboard();
  };

  if (isLoading) {
    return (
      <div dir="rtl" className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            لوحة الأجور والمرتبات
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            ملخص شامل لحالة الرواتب والمدفوعات والاستحقاقات
          </p>
        </div>

        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            لوحة الأجور والمرتبات
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            ملخص شامل لحالة الرواتب والمدفوعات والاستحقاقات
          </p>
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

          <h2 className="text-sm font-bold text-slate-900">فلاتر التقرير</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* From Date */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              من تاريخ
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="h-[38px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              إلى تاريخ
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="h-[38px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* Employee */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              الموظف
            </label>

            <CompactSelect
              options={employeeOptions}
              value={employeeId}
              onChange={setEmployeeId}
              isLoading={employeesLoading}
              placeholder="كل الموظفين"
            />
          </div>

          {/* Employee Type */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              نوع الموظف
            </label>

            <CompactSelect
              options={employeeTypeOptions}
              value={employeeType}
              onChange={setEmployeeType}
              placeholder="كل الأنواع"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          حدث خطأ أثناء تحميل بيانات لوحة الأجور.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="إجمالي كشوف الرواتب"
          value={data?.totalPayrolls ?? 0}
          icon={ReceiptText}
          iconClassName="text-slate-600"
        />

        <StatCard
          title="صافي المستحق"
          value={fmtMoney(data?.netPayable ?? 0)}
          icon={Wallet}
          iconClassName="text-emerald-600"
          valueClassName="text-emerald-700"
        />

        <StatCard
          title="إجمالي المدفوع"
          value={fmtMoney(data?.totalPaid ?? 0)}
          icon={Banknote}
          iconClassName="text-blue-600"
          valueClassName="text-blue-700"
        />

        <StatCard
          title="إجمالي الخصومات"
          value={fmtMoney(data?.totalDeductions ?? 0)}
          icon={TrendingDown}
          iconClassName="text-red-600"
          valueClassName="text-red-700"
        />

        <StatCard
          title="إجمالي السلف"
          value={fmtMoney(data?.totalAdvances ?? 0)}
          icon={CreditCard}
          iconClassName="text-amber-600"
          valueClassName="text-amber-700"
        />

        <StatCard
          title="عدد الموظفين"
          value={data?.employeeCount ?? 0}
          icon={Users}
          iconClassName="text-violet-600"
        />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Pending Payrolls */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <SectionHeader
            icon={Clock3}
            title="كشوف الرواتب المعلقة"
            count={pendingPayrolls.length}
          />

          {pendingPayrolls.length === 0 ? (
            <EmptyState
              title="لا توجد كشوف معلقة"
              description="لا توجد رواتب معلقة ضمن الفلاتر الحالية."
            />
          ) : (
            <div className="space-y-2">
              {pendingPayrolls.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    navigate(`/dashboard/payroll/salaries/${item.id}`)
                  }
                  className="group flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-right transition hover:border-slate-200 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                      <UserRound size={17} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {item.employeeName || "—"}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.employeeCode || "—"} •{" "}
                        {item.employeeType === EMPLOYEE_TYPES.DAILY
                          ? "يومي"
                          : "شهري"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-left">
                      <p className="text-xs text-slate-500">صافي الراتب</p>

                      <p className="mt-0.5 text-sm font-bold text-slate-900">
                        {fmtMoney(item.netSalary ?? 0)}
                      </p>
                    </div>

                    <ArrowUpRight
                      size={16}
                      className="text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Recent Operations */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <SectionHeader
            icon={TrendingUp}
            title="آخر العمليات"
            count={recentOperations.length}
          />

          {recentOperations.length === 0 ? (
            <EmptyState
              title="لا توجد عمليات حديثة"
              description="لا توجد عمليات مالية ضمن الفترة المحددة."
            />
          ) : (
            <div className="space-y-2">
              {recentOperations.slice(0, 6).map((operation, index) => (
                <div
                  key={`${operation.sourceId}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                      <PiggyBank size={17} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {operation.operationName ||
                          operation.operationType ||
                          "عملية مالية"}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {operation.employeeName || "—"}
                        {operation.referenceNumber
                          ? ` • ${operation.referenceNumber}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-left">
                    <p className="text-sm font-bold text-slate-900">
                      {fmtMoney(operation.amount ?? 0)}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {operation.currency || "EGP"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} />

          <span>
            الفترة: {fromDate || "—"} إلى {toDate || "—"}
          </span>
        </div>

        <div>
          {employeeId
            ? `الموظف: ${selectedEmployeeName || "—"}`
            : "كل الموظفين"}
        </div>
      </div>

      {/* Print */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <PayrollDashboardPrintTemplate
            data={data}
            fromDate={fromDate}
            toDate={toDate}
            employeeId={employeeId}
            employeeType={employeeType}
            employeeName={selectedEmployeeName}
          />
        </div>
      </div>
    </div>
  );
}
