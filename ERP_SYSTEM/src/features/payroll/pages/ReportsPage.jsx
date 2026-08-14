// features/payroll/pages/ReportsPage.jsx
//
// TODO INTEGRATION: مفيش endpoints تقارير مخصصة في الـshapes المبعوتة. الصفحة
// دي بتبني الفلاتر والواجهة بشكل كامل، وزرار "عرض التقرير" بيستخدم
// useGetPayrollEntriesQuery/useGetEmployeeAttendancesQuery/useGetEmployeeTransactionsQuery
// الموجودين فعليًا بفلاتر الفترة، وبيعرض النتيجة كجدول بسيط. أزرار
// Export Excel/PDF نقطة تكامل واضحة - لسه محتاجة تعرف مكتبة الـExport
// المستخدمة عندك في باقي المشروع (SheetJS مذكورة في الذاكرة الخاصة بيك
// لصفحة الفواتير، فمفترض تقدر تستخدم نفس الـpattern هنا).

import { useState } from "react";
import { FileBarChart, Printer, FileSpreadsheet, FileDown } from "lucide-react";
import {
  useGetPayrollEntriesQuery,
  useGetEmployeeAttendancesQuery,
  useGetEmployeeTransactionsQuery,
} from "../payrollApi";
import { fmtMoney } from "../payroll.constants";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";

const REPORT_TYPES = [
  { value: "salaries", label: "تقرير المرتبات" },
  { value: "attendance", label: "تقرير الحضور والغياب" },
  { value: "deductions", label: "تقرير الخصومات" },
  { value: "advances", label: "تقرير السلف" },
  { value: "overtime", label: "تقرير الإضافي والبدلات" },
  { value: "netSalaries", label: "تقرير صافي المرتبات" },
];

const emptyFilters = { reportType: "salaries", fromDate: "", toDate: "" };

export default function ReportsPage() {
  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(null);

  const handleView = () => setApplied(draft);

  return (
    <div className="animate-fadeUp space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">
          التقارير
        </h2>
        <p className="text-sm text-ink-400 mt-1">تقارير الأجور والمرتبات</p>
      </div>

      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              نوع التقرير
            </label>
            <CompactSelect
              options={REPORT_TYPES}
              value={draft.reportType}
              onChange={(val) => setDraft((d) => ({ ...d, reportType: val }))}
            />
          </div>
          <Input
            label="من تاريخ"
            type="date"
            value={draft.fromDate}
            onChange={(e) =>
              setDraft((d) => ({ ...d, fromDate: e.target.value }))
            }
          />
          <Input
            label="إلى تاريخ"
            type="date"
            value={draft.toDate}
            onChange={(e) =>
              setDraft((d) => ({ ...d, toDate: e.target.value }))
            }
          />
          <div className="flex items-end">
            <Button onClick={handleView} className="h-9 w-full">
              <FileBarChart size={14} />
              عرض التقرير
            </Button>
          </div>
        </div>
      </div>

      {applied && (
        <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink-900">
              {REPORT_TYPES.find((r) => r.value === applied.reportType)?.label}
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.print()}>
                <Printer size={14} />
                طباعة
              </Button>
              {/* TODO INTEGRATION: وصّل بنفس مكتبة SheetJS المستخدمة في صفحة الفواتير */}
              <Button variant="outline">
                <FileSpreadsheet size={14} />
                Excel
              </Button>
              <Button variant="outline">
                <FileDown size={14} />
                PDF
              </Button>
            </div>
          </div>

          <ReportTable
            reportType={applied.reportType}
            fromDate={applied.fromDate}
            toDate={applied.toDate}
          />
        </div>
      )}
    </div>
  );
}

function ReportTable({ reportType, fromDate, toDate }) {
  if (reportType === "salaries" || reportType === "netSalaries") {
    return (
      <SalariesReport
        fromDate={fromDate}
        toDate={toDate}
        netOnly={reportType === "netSalaries"}
      />
    );
  }
  if (reportType === "attendance")
    return <AttendanceReport fromDate={fromDate} toDate={toDate} />;
  if (
    reportType === "deductions" ||
    reportType === "advances" ||
    reportType === "overtime"
  ) {
    return <TransactionsReport fromDate={fromDate} toDate={toDate} />;
  }
  return null;
}

function SalariesReport({ fromDate, toDate, netOnly }) {
  const { data, isLoading } = useGetPayrollEntriesQuery({
    FromDate: fromDate || undefined,
    ToDate: toDate || undefined,
    PageSize: 100,
  });
  const rows = data?.items || [];
  if (isLoading)
    return (
      <p className="text-sm text-ink-400 py-6 text-center">جارِ التحميل...</p>
    );
  if (rows.length === 0)
    return (
      <p className="text-sm text-ink-400 py-6 text-center">لا توجد بيانات</p>
    );

  return (
    <div className="overflow-x-auto custom-scroll">
      <table className="w-full text-right border-collapse">
        <thead>
          <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              الموظف
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              الفترة
            </th>
            {!netOnly && (
              <th className="p-2.5 font-medium border-l border-ink-400/5">
                إجمالي المرتب
              </th>
            )}
            <th className="p-2.5 font-medium">صافي المرتب</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-ink-400/5 last:border-0">
              <td className="p-2.5 text-sm text-ink-900 border-l border-ink-400/5">
                {r.employeeName}
              </td>
              <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                {r.startDate} - {r.endDate}
              </td>
              {!netOnly && (
                <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                  {fmtMoney(r.grossSalary)}
                </td>
              )}
              <td className="p-2.5 num font-semibold text-[13px]">
                {fmtMoney(r.netSalary)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AttendanceReport({ fromDate, toDate }) {
  const { data, isLoading } = useGetEmployeeAttendancesQuery({
    FromDate: fromDate || undefined,
    ToDate: toDate || undefined,
    PageSize: 100,
  });
  const rows = data?.items || [];
  if (isLoading)
    return (
      <p className="text-sm text-ink-400 py-6 text-center">جارِ التحميل...</p>
    );
  if (rows.length === 0)
    return (
      <p className="text-sm text-ink-400 py-6 text-center">لا توجد بيانات</p>
    );

  return (
    <div className="overflow-x-auto custom-scroll">
      <table className="w-full text-right border-collapse">
        <thead>
          <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              الموظف
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              التاريخ
            </th>
            <th className="p-2.5 font-medium">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-ink-400/5 last:border-0">
              <td className="p-2.5 text-sm text-ink-900 border-l border-ink-400/5">
                {r.employeeName}
              </td>
              <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                {r.workDate}
              </td>
              <td className="p-2.5 text-xs">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TransactionsReport({ fromDate, toDate }) {
  const { data, isLoading } = useGetEmployeeTransactionsQuery({
    FromDate: fromDate || undefined,
    ToDate: toDate || undefined,
    PageSize: 100,
  });
  const rows = data?.items || [];
  if (isLoading)
    return (
      <p className="text-sm text-ink-400 py-6 text-center">جارِ التحميل...</p>
    );
  if (rows.length === 0)
    return (
      <p className="text-sm text-ink-400 py-6 text-center">لا توجد بيانات</p>
    );

  return (
    <div className="overflow-x-auto custom-scroll">
      <table className="w-full text-right border-collapse">
        <thead>
          <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              الموظف
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              التاريخ
            </th>
            <th className="p-2.5 font-medium">القيمة</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-ink-400/5 last:border-0">
              <td className="p-2.5 text-sm text-ink-900 border-l border-ink-400/5">
                {r.employeeName}
              </td>
              <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                {r.transactionDate}
              </td>
              <td className="p-2.5 num text-[13px]">{fmtMoney(r.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
