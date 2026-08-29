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
  Trash2,
  Loader2,
} from "lucide-react";

import {
  useGetPayrollEntriesQuery,
  useRecalculatePayrollEntryMutation,
  useBulkDeletePayrollEntriesMutation,
} from "../payrollApi";

import {
  EMPLOYEE_TYPE,
  employeeTypeOptions,
  fmtMoney,
} from "../payroll.constants";

import { useGetCashboxOptionsQuery } from "../../cashboxes/cashboxesApi";
import { useGetCashMovementTypesQuery } from "../../cashboxes/cashMovementTypesApi";

import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";

import MoveSalaryModal from "../components/MoveSalaryModal";
import BulkMoveSalaryModal from "../components/BulkMoveSalaryModal";

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

  const { data, isLoading, isFetching, isError, refetch } =
    useGetPayrollEntriesQuery({
      PageNumber: page,
      PageSize: pageSize,
      StartDate: applied.startDate || undefined,
      EndDate: applied.endDate || undefined,
      EmployeeType: applied.employeeType || undefined,
      Search: applied.search || undefined,
    });

  const { data: cashboxesData } = useGetCashboxOptionsQuery();

  const cashboxes = Array.isArray(cashboxesData)
    ? cashboxesData
    : (cashboxesData?.items ?? []);

  const { data: movementTypesData } = useGetCashMovementTypesQuery();

  const cashMovementTypes = Array.isArray(movementTypesData)
    ? movementTypesData
    : (movementTypesData?.items ?? []);

  const [recalculate, { isLoading: isRecalculating }] =
    useRecalculatePayrollEntryMutation();

  const [bulkDelete, { isLoading: isDeleting }] =
    useBulkDeletePayrollEntriesMutation();

  const rows = data?.items || [];

  const deletableRows = rows.filter(
    (row) => !row.isSalaryMoveToEmployeeAccount,
  );

  const setField = (key, value) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    setApplied(draft);
    setPage(1);
    setSelectedIds(new Set());
  };

  const handleReset = () => {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setPage(1);
    setSelectedIds(new Set());
  };

  function toggleRow(id) {
    const row = rows.find((item) => item.id === id);

    if (row?.isSalaryMoveToEmployeeAccount) {
      return;
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function toggleAll() {
    const ids = deletableRows.map((row) => row.id);

    setSelectedIds((prev) => {
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id));

      if (allSelected) {
        return new Set();
      }

      return new Set(ids);
    });
  }

  async function handleRecalculate(id) {
    try {
      await recalculate(id).unwrap();
      await refetch();
    } catch (error) {
      toastError(
        error?.data?.message ||
          error?.data?.title ||
          "حدث خطأ أثناء إعادة احتساب المرتب",
      );
    }
  }

  async function handleBulkDelete() {
    const ids = [...selectedIds];

    if (!ids.length) {
      toastError("حدد سجلاً واحدًا على الأقل للحذف");
      return;
    }

    if (!window.confirm(`هل أنت متأكد من حذف ${ids.length} سجل مرتب؟`)) {
      return;
    }

    try {
      await bulkDelete({
        payrollEntryIds: ids,
      }).unwrap();

      toastSuccess(`تم حذف ${ids.length} سجل مرتب بنجاح`);

      setSelectedIds(new Set());

      if (rows.length === ids.length && page > 1) {
        setPage((current) => current - 1);
      } else {
        await refetch();
      }
    } catch (error) {
      toastError(
        error?.data?.message ||
          error?.data?.title ||
          "حدث خطأ أثناء حذف قيود المرتبات",
      );
    }
  }

  const allDeletableSelected =
    deletableRows.length > 0 &&
    deletableRows.every((row) => selectedIds.has(row.id));

  return (
    <div className="animate-fadeUp space-y-5" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">المرتبات</h1>

          <p className="text-xs text-ink-400 mt-1">
            عرض ومتابعة قيود مرتبات الموظفين
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <Button
                onClick={() => setBulkMoveOpen(true)}
                className="h-9"
                disabled={isDeleting}
              >
                <Send size={14} />
                ترحيل المحدد ({selectedIds.size})
              </Button>

              <Button
                variant="outline"
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="h-9 text-negative hover:text-negative"
              >
                {isDeleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}

                {isDeleting
                  ? "جارِ الحذف..."
                  : `حذف المحدد (${selectedIds.size})`}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            onClick={() => window.print()}
            className="h-9"
          >
            <Printer size={14} />
            طباعة
          </Button>

          <Button
            onClick={() => navigate("/dashboard/payroll/salaries/create")}
            className="h-9"
          >
            <Plus size={14} />
            قيود مرتبات جديدة
          </Button>
        </div>
      </div>

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

      {selectedIds.size > 0 && (
        <div className="rounded-2xl border border-negative/15 bg-negative/[0.03] px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-ink-900">
                تم تحديد {selectedIds.size} سجل
              </p>

              <p className="text-xs text-ink-400 mt-0.5">
                يمكنك ترحيل أو حذف السجلات المحددة
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setSelectedIds(new Set())}
              disabled={isDeleting}
              className="h-8"
            >
              <RotateCcw size={13} />
              إلغاء التحديد
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingTable />
      ) : isError ? (
        <ErrorState refetch={refetch} />
      ) : rows.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div
            className={`
              overflow-x-auto custom-scroll
              rounded-2xl
              border border-ink-400/10
              bg-white
              shadow-card
              transition-opacity duration-200
              ${isFetching || isDeleting ? "opacity-60" : ""}
            `}
          >
            <table className="w-full text-right border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
                  <th className="p-2.5 border-l border-ink-400/5 w-8">
                    <input
                      type="checkbox"
                      checked={allDeletableSelected}
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

                  const isSelected = selectedIds.has(row.id);

                  return (
                    <tr
                      key={row.id}
                      className={`
                        border-b border-ink-400/5
                        last:border-0
                        transition-colors
                        animate-fadeUp
                        ${
                          isSelected
                            ? "bg-negative/[0.03]"
                            : "hover:bg-primary-50/30"
                        }
                      `}
                      style={{
                        animationDelay: `${Math.min(index, 12) * 25}ms`,
                      }}
                    >
                      <td className="p-2.5 border-l border-ink-400/5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(row.id)}
                          disabled={isMoved || isDeleting}
                          className="rounded border-ink-400/30 disabled:opacity-30"
                        />
                      </td>

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

                      <td className="p-2.5 border-l border-ink-400/5">
                        <span className="text-xs text-ink-700">
                          {EMPLOYEE_TYPE[row.employeeType] ||
                            row.employeeType ||
                            "—"}
                        </span>
                      </td>

                      <td className="p-2.5 num text-[12px] border-l border-ink-400/5">
                        <div>{row.startDate}</div>
                        <div className="text-ink-400">{row.endDate}</div>
                      </td>

                      <td className="p-2.5 num text-positive text-[13px] border-l border-ink-400/5">
                        {fmtMoney(row.bonus)}
                      </td>

                      <td className="p-2.5 num text-negative text-[13px] border-l border-ink-400/5">
                        {fmtMoney(row.deduction)}
                      </td>

                      <td className="p-2.5 num font-medium text-[13px] border-l border-ink-400/5">
                        {fmtMoney(row.grossSalary)}
                      </td>

                      <td className="p-2.5 num font-bold text-[13px] border-l border-ink-400/5">
                        {fmtMoney(row.netSalary)}
                      </td>

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

          {data?.totalCount > 0 && (
            <Pagination
              page={page}
              pageSize={pageSize}
              totalCount={data.totalCount}
              onPageChange={(value) => {
                setPage(value);
                setSelectedIds(new Set());
              }}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
                setSelectedIds(new Set());
              }}
            />
          )}
        </>
      )}

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
    </div>
  );
}

function toastSuccess(message) {
  import("sonner").then(({ toast }) => {
    toast.success(message);
  });
}

function toastError(message) {
  import("sonner").then(({ toast }) => {
    toast.error(message);
  });
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
