// features/payroll/pages/SalariesPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RotateCcw,
  Printer,
  Wallet,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { useGetPayrollEntriesQuery } from "../payrollApi";
import {
  EMPLOYEE_TYPE,
  employeeTypeOptions,
  fmtMoney,
} from "../payroll.constants";

import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";

const currentYear = new Date().getFullYear();

const emptyFilters = {
  startDate: `${currentYear}-01-01`,
  endDate: `${currentYear}-12-31`,
  employeeType: "",
  search: "",
};

export default function SalariesPage() {
  const navigate = useNavigate();

  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetPayrollEntriesQuery({
      PageNumber: page,
      PageSize: pageSize,

      StartDate: applied.startDate || undefined,
      EndDate: applied.endDate || undefined,
      EmployeeType: applied.employeeType || undefined,
      Search: applied.search || undefined,
    });

  const rows = data?.items || [];

  const setField = (key, value) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    setApplied(draft);
    setPage(1);
  };

  const handleReset = () => {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setPage(1);
  };

  return (
    <div className="animate-fadeUp space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">المرتبات</h1>

          <p className="text-xs text-ink-400 mt-1">
            عرض ومتابعة قيود مرتبات الموظفين
          </p>
        </div>

        <Button variant="outline" onClick={() => window.print()}>
          <Printer size={14} />
          طباعة
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input
            label="من تاريخ"
            type="date"
            value={draft.startDate}
            onChange={(e) => setField("startDate", e.target.value)}
          />

          <Input
            label="إلى تاريخ"
            type="date"
            value={draft.endDate}
            onChange={(e) => setField("endDate", e.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              نوع الموظف
            </label>

            <CompactSelect
              options={employeeTypeOptions}
              value={draft.employeeType}
              onChange={(value) => setField("employeeType", value)}
              placeholder="كل الأنواع"
            />
          </div>

          <Input
            label="بحث"
            value={draft.search}
            onChange={(e) => setField("search", e.target.value)}
            placeholder="اسم الموظف أو الكود..."
          />

          <div className="flex items-end gap-2">
            <Button onClick={handleSearch} className="h-9 flex-1">
              <Search size={14} />
              بحث
            </Button>

            <Button variant="outline" onClick={handleReset} className="h-9">
              <RotateCcw size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <LoadingTable />
      ) : isError ? (
        <ErrorState refetch={refetch} />
      ) : rows.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Table */}
          <div
            className={`
              overflow-x-auto custom-scroll
              rounded-2xl
              border border-ink-400/10
              bg-white
              shadow-card
              transition-opacity duration-200
              ${isFetching ? "opacity-60" : ""}
            `}
          >
            <table className="w-full text-right border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الموظف
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    النوع
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الفترة
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الإضافات
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الخصومات
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الإجمالي
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الصافي
                  </th>

                  <th className="p-2.5 font-medium">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="
                      border-b border-ink-400/5
                      last:border-0
                      hover:bg-primary-50/30
                      transition-colors
                      animate-fadeUp
                    "
                    style={{
                      animationDelay: `${Math.min(index, 12) * 25}ms`,
                    }}
                  >
                    {/* Employee */}
                    <td className="p-2.5 border-l border-ink-400/5">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/dashboard/payroll/salaries/${row.id}`)
                        }
                        className="
                          text-primary-600
                          hover:text-primary-700
                          hover:underline
                          text-sm
                          font-semibold
                          text-right
                        "
                      >
                        {row.employeeName}
                      </button>

                      {row.employeeCode && (
                        <div className="text-[11px] text-ink-400 mt-0.5">
                          {row.employeeCode}
                        </div>
                      )}
                    </td>

                    {/* Employee type */}
                    <td className="p-2.5 border-l border-ink-400/5">
                      <span className="text-xs text-ink-700">
                        {EMPLOYEE_TYPE[row.employeeType] ||
                          row.employeeType ||
                          "—"}
                      </span>
                    </td>

                    {/* Period */}
                    <td className="p-2.5 num text-[12px] border-l border-ink-400/5">
                      <div>{row.startDate}</div>
                      <div className="text-ink-400">{row.endDate}</div>
                    </td>

                    {/* Bonus */}
                    <td className="p-2.5 num text-positive text-[13px] border-l border-ink-400/5">
                      {fmtMoney(row.bonus)}
                    </td>

                    {/* Deduction */}
                    <td className="p-2.5 num text-negative text-[13px] border-l border-ink-400/5">
                      {fmtMoney(row.deduction)}
                    </td>

                    {/* Gross */}
                    <td className="p-2.5 num font-medium text-[13px] border-l border-ink-400/5">
                      {fmtMoney(row.grossSalary)}
                    </td>

                    {/* Net */}
                    <td className="p-2.5 num font-bold text-[13px] border-l border-ink-400/5">
                      {fmtMoney(row.netSalary)}
                    </td>

                    {/* Actions */}
                    <td className="p-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/dashboard/payroll/salaries/${row.id}`)
                        }
                        className="text-xs text-primary-600 hover:underline font-medium"
                      >
                        عرض التفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.totalCount > 0 && (
            <Pagination
              page={page}
              pageSize={pageSize}
              totalCount={data.totalCount}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

function LoadingTable() {
  return (
    <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card overflow-hidden">
      <div className="h-10 bg-ink-900/[0.03]" />

      <div className="divide-y divide-ink-400/5">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="flex items-center gap-6 px-4 py-4">
            <div className="h-3.5 w-32 rounded bg-ink-400/10 animate-pulse" />
            <div className="h-3.5 w-20 rounded bg-ink-400/10 animate-pulse" />
            <div className="h-3.5 w-28 rounded bg-ink-400/10 animate-pulse" />
            <div className="h-3.5 w-16 rounded bg-ink-400/10 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ refetch }) {
  return (
    <div className="text-center py-14 border border-dashed border-negative/25 bg-negative/[0.02] rounded-2xl">
      <AlertCircle
        size={32}
        className="mx-auto text-negative/70 mb-3"
        strokeWidth={1.6}
      />

      <p className="text-ink-900 font-medium text-sm mb-1">
        حدث خطأ في تحميل المرتبات
      </p>

      <button
        onClick={refetch}
        className="
          inline-flex
          items-center
          gap-2
          text-xs
          font-medium
          text-primary-500
          hover:text-primary-600
          bg-primary-50
          hover:bg-primary-100
          px-4
          py-2
          rounded-lg
          transition-colors
          mt-2
        "
      >
        <RefreshCw size={13} />
        إعادة المحاولة
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 border border-dashed border-ink-400/20 rounded-2xl">
      <div className="w-14 h-14 rounded-full bg-ink-400/5 flex items-center justify-center mx-auto mb-3">
        <Wallet size={24} className="text-ink-400/50" strokeWidth={1.6} />
      </div>

      <p className="text-ink-900 font-medium text-sm mb-1">لا توجد مرتبات</p>

      <p className="text-xs text-ink-400">
        لا توجد قيود مرتبات مطابقة للفلاتر الحالية
      </p>
    </div>
  );
}
