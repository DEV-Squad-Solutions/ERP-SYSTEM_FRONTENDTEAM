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
  Send,
  RotateCw,
  Plus,
  X,
} from "lucide-react";

import {
  useGetPayrollEntriesQuery,
  useMoveSalaryMutation,
  useBulkMoveSalaryMutation,
  useRecalculatePayrollEntryMutation,
} from "../payrollApi";
import {
  EMPLOYEE_TYPE,
  employeeTypeOptions,
  fmtMoney,
} from "../payroll.constants";

import { useGetCashboxesQuery } from "../../cashboxes/cashboxesApi";
import { useGetCashMovementTypesQuery } from "../../cashboxes/cashMovementTypesApi";

import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";

import MoveSalaryModal from "../components/MoveSalaryModal";
import BulkMoveSalaryModal from "../components/BulkMoveSalaryModal";
import BulkCreatePayrollEntriesModal from "../components/BulkCreatePayrollEntriesModal";

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

  const [selectedIds, setSelectedIds] = useState(new Set());

  const [moveModalRow, setMoveModalRow] = useState(null);
  const [bulkMoveOpen, setBulkMoveOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetPayrollEntriesQuery({
      PageNumber: page,
      PageSize: pageSize,

      StartDate: applied.startDate || undefined,
      EndDate: applied.endDate || undefined,
      EmployeeType: applied.employeeType || undefined,
      Search: applied.search || undefined,
    });

  const { data: cashboxesData } = useGetCashboxesQuery();
  const cashboxes = Array.isArray(cashboxesData)
    ? cashboxesData
    : (cashboxesData?.items ?? []);

  const { data: movementTypesData } = useGetCashMovementTypesQuery();
  const cashMovementTypes = Array.isArray(movementTypesData)
    ? movementTypesData
    : (movementTypesData?.items ?? []);

  const [recalculate, { isLoading: isRecalculating }] =
    useRecalculatePayrollEntryMutation();

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

  // =========================================================
  // Selection
  // =========================================================

  function toggleRow(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((prev) => {
      if (prev.size === rows.length) return new Set();
      return new Set(rows.map((r) => r.id));
    });
  }

  async function handleRecalculate(id) {
    try {
      await recalculate(id).unwrap();
    } catch {
      // معالجة الخطأ حسب نظام الإشعارات عندك
    }
  }

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

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button onClick={() => setBulkMoveOpen(true)} className="h-9">
              <Send size={14} />
              ترحيل المحدد ({selectedIds.size})
            </Button>
          )}

          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={14} />
            طباعة
          </Button>

          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus size={14} />
            قيود مرتبات جديدة
          </Button>
        </div>
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
            <table className="w-full text-right border-collapse min-w-[1050px]">
              <thead>
                <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
                  <th className="p-2.5 border-l border-ink-400/5 w-8">
                    <input
                      type="checkbox"
                      checked={
                        rows.length > 0 && selectedIds.size === rows.length
                      }
                      onChange={toggleAll}
                      className="rounded border-ink-400/30"
                    />
                  </th>

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

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    حالة الترحيل
                  </th>

                  <th className="p-2.5 font-medium">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => {
                  const isMoved = !!row.isSalaryMoveToEmployeeAccount;

                  return (
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
                      {/* Checkbox */}
                      <td className="p-2.5 border-l border-ink-400/5">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(row.id)}
                          onChange={() => toggleRow(row.id)}
                          disabled={isMoved}
                          className="rounded border-ink-400/30 disabled:opacity-30"
                        />
                      </td>

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

                      {/* Move status */}
                      <td className="p-2.5 border-l border-ink-400/5">
                        {isMoved ? (
                          <span className="inline-flex whitespace-nowrap rounded-md bg-primary-500/10 px-2 py-1 text-[11px] text-primary-500">
                            مُرحّل
                          </span>
                        ) : (
                          <span className="inline-flex whitespace-nowrap rounded-md bg-amber-500/10 px-2 py-1 text-[11px] text-amber-600">
                            لم يُرحّل
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/dashboard/payroll/salaries/${row.id}`)
                            }
                            className="text-xs text-primary-600 hover:underline font-medium"
                          >
                            التفاصيل
                          </button>

                          {!isMoved && (
                            <button
                              type="button"
                              onClick={() => setMoveModalRow(row)}
                              title="ترحيل الراتب لحساب الموظف"
                              className="rounded-lg p-1.5 text-ink-400 transition hover:bg-primary-500/10 hover:text-primary-600"
                            >
                              <Send size={14} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRecalculate(row.id)}
                            disabled={isRecalculating}
                            title="إعادة احتساب"
                            className="rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-400/10 hover:text-ink-700 disabled:opacity-40"
                          >
                            <RotateCw
                              size={14}
                              className={isRecalculating ? "animate-spin" : ""}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Single Move Salary */}
      <MoveSalaryModal
        row={moveModalRow}
        cashboxes={cashboxes}
        cashMovementTypes={cashMovementTypes}
        onClose={() => setMoveModalRow(null)}
        onSaved={() => {
          setMoveModalRow(null);
          refetch();
        }}
      />

      {/* Bulk Move Salary */}
      <BulkMoveSalaryModal
        isOpen={bulkMoveOpen}
        payrollEntryIds={[...selectedIds]}
        cashboxes={cashboxes}
        cashMovementTypes={cashMovementTypes}
        onClose={() => setBulkMoveOpen(false)}
        onSaved={() => {
          setBulkMoveOpen(false);
          setSelectedIds(new Set());
          refetch();
        }}
      />

      {/* Bulk Create Entries */}
      <BulkCreatePayrollEntriesModal
        isOpen={createModalOpen}
        cashboxes={cashboxes}
        cashMovementTypes={cashMovementTypes}
        onClose={() => setCreateModalOpen(false)}
        onSaved={() => {
          setCreateModalOpen(false);
          setPage(1);
          refetch();
        }}
      />
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
