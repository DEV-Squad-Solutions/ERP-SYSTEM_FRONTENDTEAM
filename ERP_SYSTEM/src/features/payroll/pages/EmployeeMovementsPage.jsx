import { useMemo, useState } from "react";
import { Search, RotateCcw, Plus, AlertCircle, FileSearch } from "lucide-react";

import {
  useGetEmployeeMovementsQuery,
  useGetEmployeesSelectQuery,
} from "../payrollApi";
import { useGetCashboxOptionsQuery } from "../../cashboxes/cashboxesApi"; // عدّل المسار/الاسم حسب الملف الفعلي عندك
import {
  MOVEMENT_TYPE_LABELS,
  movementTypeBadge,
  movementTypeOptions,
  currencyOptions,
} from "../payroll.constants";
import EmployeeMovementFormModal from "../components/EmployeeMovementFormModal.jsx";

import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";

const fmt = (n) => (n ?? 0).toLocaleString("ar-EG");

export default function EmployeeMovementsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [employeeId, setEmployeeId] = useState("");
  const [type, setType] = useState("");
  const [currency, setCurrency] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: employees } = useGetEmployeesSelectQuery();
  const { data: cashboxes } = useGetCashboxOptionsQuery();

  const employeeOptions = useMemo(
    () =>
      (employees || []).map((e) => ({ value: String(e.id), label: e.name })),
    [employees],
  );

  const cashboxOptions = useMemo(
    () =>
      (cashboxes?.items || cashboxes || []).map((c) => ({
        value: String(c.id),
        label: c.name,
      })),
    [cashboxes],
  );

  const queryParams = useMemo(
    () => ({
      PageNumber: page,
      PageSize: pageSize,
      ...(employeeId && { EmployeeId: Number(employeeId) }),
      ...(type && { Type: type }),
      ...(currency && { Currency: currency }),
      ...(fromDate && { FromDate: fromDate }),
      ...(toDate && { ToDate: toDate }),
      ...(search && { Search: search }),
    }),
    [page, pageSize, employeeId, type, currency, fromDate, toDate, search],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetEmployeeMovementsQuery(queryParams);

  const items = data?.items || [];

  const resetFilters = () => {
    setEmployeeId("");
    setType("");
    setCurrency("");
    setFromDate("");
    setToDate("");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="animate-fadeUp space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            حركات الموظفين
          </h2>
          <p className="text-sm text-ink-400 mt-1">
            سلف، خصومات، مكافآت، وسحوبات الموظفين
          </p>
        </div>

        <Button onClick={() => setIsFormOpen(true)}>
          <Plus size={15} />
          تسجيل حركة جديدة
        </Button>
      </div>

      <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-ink-400 mb-1">
              بحث
            </label>
            <div className="relative">
              <Search
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="ابحث..."
                className="w-full h-9 rounded-lg border border-ink-400/15 bg-white pr-9 pl-3 text-sm outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              الموظف
            </label>
            <CompactSelect
              options={employeeOptions}
              value={employeeId}
              onChange={(v) => {
                setEmployeeId(v);
                setPage(1);
              }}
              placeholder="كل الموظفين"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              نوع الحركة
            </label>
            <CompactSelect
              options={movementTypeOptions}
              value={type}
              onChange={(v) => {
                setType(v);
                setPage(1);
              }}
              placeholder="كل الأنواع"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              العملة
            </label>
            <CompactSelect
              options={currencyOptions}
              value={currency}
              onChange={(v) => {
                setCurrency(v);
                setPage(1);
              }}
              placeholder="كل العملات"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              من تاريخ
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-lg border border-ink-400/15 bg-white px-2 text-sm outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-lg border border-ink-400/15 bg-white px-2 text-sm outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <Button variant="outline" className="h-9" onClick={resetFilters}>
            <RotateCcw size={14} />
            تصفير الفلاتر
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-xl bg-ink-400/5"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-negative/25 bg-negative/[0.02] py-14 text-center">
          <AlertCircle
            size={34}
            className="mx-auto mb-3 text-negative/70"
            strokeWidth={1.6}
          />
          <p className="mb-1 font-medium text-ink-900">
            حدث خطأ في تحميل الحركات
          </p>
          <button
            onClick={refetch}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-500 hover:bg-primary-100 hover:text-primary-600"
          >
            <RotateCcw size={15} />
            إعادة المحاولة
          </button>
        </div>
      ) : !isFetching && items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-400/20 py-16 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-ink-400/5">
            <FileSearch
              size={26}
              className="text-ink-400/50"
              strokeWidth={1.6}
            />
          </div>
          <p className="font-medium text-ink-900">لا توجد حركات مطابقة</p>
        </div>
      ) : (
        <div
          className={`overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${
            isFetching ? "opacity-60" : ""
          }`}
        >
          <div className="overflow-x-auto custom-scroll">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-ink-400/10 text-xs font-semibold text-ink-600">
                  <th className="px-4 py-3 text-right">الموظف</th>
                  <th className="px-4 py-3 text-center">النوع</th>
                  <th className="px-4 py-3 text-center">التاريخ</th>
                  <th className="w-32 px-4 py-3 text-center text-positive">
                    مدين
                  </th>
                  <th className="w-32 px-4 py-3 text-center text-negative">
                    دائن
                  </th>
                  <th className="px-4 py-3 text-center">العملة</th>
                  <th className="px-4 py-3 text-right">رقم السند</th>
                  <th className="min-w-[200px] px-4 py-3 text-right">
                    ملاحظات
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-ink-400/5 transition-colors hover:bg-slate-50 last:border-0"
                  >
                    <td className="px-4 py-3 text-right">
                      <div className="font-medium text-ink-900">
                        {item.employeeName}
                      </div>
                      <div className="text-[11px] text-ink-400">
                        #{item.employeeCode}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          movementTypeBadge[item.type] ||
                          "bg-ink-400/10 text-ink-400"
                        }`}
                      >
                        {MOVEMENT_TYPE_LABELS[item.type] || item.type}
                      </span>
                    </td>

                    <td className="num whitespace-nowrap px-4 py-3 text-center text-ink-600">
                      {item.movementDate}
                    </td>

                    <td className="num px-4 py-3 text-center font-medium text-positive">
                      {item.debit > 0 ? fmt(item.debit) : "—"}
                    </td>

                    <td className="num px-4 py-3 text-center font-medium text-negative">
                      {item.credit > 0 ? fmt(item.credit) : "—"}
                    </td>

                    <td className="px-4 py-3 text-center text-ink-500">
                      {item.currency}
                    </td>

                    <td className="px-4 py-3 text-right text-ink-500">
                      {item.cashVoucherNumber || "—"}
                    </td>

                    <td className="px-4 py-3 text-right text-ink-500">
                      {item.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data?.totalPages > 0 && (
            <div className="border-t border-ink-400/10 bg-white px-5 py-4">
              <Pagination
                page={page}
                pageSize={pageSize}
                totalCount={data?.totalCount || 0}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
                label="حركة"
              />
            </div>
          )}
        </div>
      )}

      <EmployeeMovementFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        employeeOptions={employeeOptions}
        cashboxOptions={cashboxOptions}
        onSaved={refetch}
      />
    </div>
  );
}
