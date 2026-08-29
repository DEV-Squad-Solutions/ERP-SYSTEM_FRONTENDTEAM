// features/payroll/pages/EmployeeOpeningBalancesPage.jsx
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  RotateCcw,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  RefreshCw,
  History,
} from "lucide-react";

import {
  useGetEmployeeOpeningBalancesQuery,
  useGetEmployeesSelectQuery,
  useDeleteEmployeeOpeningBalanceMutation,
} from "../payrollApi";

import {
  currencyOptions,
  balanceTypeOptions,
  BALANCE_TYPE_LABELS,
  balanceTypeBadge,
} from "../payroll.constants";

import EmployeeOpeningBalanceFormModal from "../components/EmployeeOpeningBalanceFormModal";

import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";

const emptyFilters = {
  employeeId: "",
  search: "",
  currency: "",
  balanceType: "",
  fromDate: "",
  toDate: "",
};

function fmt(n) {
  return new Intl.NumberFormat("ar-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);
}

export default function EmployeeOpeningBalancesPage() {
  // =========================================================
  // Filters
  // =========================================================

  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // =========================================================
  // Modal
  // =========================================================

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBalance, setEditingBalance] = useState(null);

  // =========================================================
  // Employees
  // =========================================================

  const { data: employees } = useGetEmployeesSelectQuery();

  // =========================================================
  // Opening Balances
  // =========================================================

  const { data, isLoading, isFetching, isError, refetch } =
    useGetEmployeeOpeningBalancesQuery({
      PageNumber: page,
      PageSize: pageSize,
      EmployeeId: applied.employeeId || undefined,
      Search: applied.search || undefined,
      Currency: applied.currency || undefined,
      BalanceType: applied.balanceType || undefined,
      FromDate: applied.fromDate || undefined,
      ToDate: applied.toDate || undefined,
    });

  // =========================================================
  // Delete
  // =========================================================

  const [deleteBalance] = useDeleteEmployeeOpeningBalanceMutation();

  // =========================================================
  // Filters
  // =========================================================

  const setField = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
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
  // Create / Edit
  // =========================================================

  const openCreate = () => {
    setEditingBalance(null);
    setShowFormModal(true);
  };

  const openEdit = (row) => {
    setEditingBalance(row);
    setShowFormModal(true);
  };

  const closeForm = () => {
    setShowFormModal(false);
    setEditingBalance(null);
  };

  const handleFormSaved = async () => {
    closeForm();

    try {
      await refetch();
    } catch (error) {
      console.error("Opening balances refetch error:", error);
    }
  };

  // =========================================================
  // Delete
  // =========================================================

  const handleDelete = (row) => {
    toast(`حذف الرصيد الافتتاحي للموظف "${row.employeeName}"؟`, {
      description: "الإجراء ده لا يمكن التراجع عنه",

      action: {
        label: "تأكيد الحذف",

        onClick: async () => {
          try {
            await deleteBalance(row.id).unwrap();

            toast.success("تم حذف الرصيد الافتتاحي بنجاح");

            await refetch();
          } catch (error) {
            console.error("Delete opening balance error:", error);

            toast.error("حصل خطأ أثناء الحذف، حاول تاني");
          }
        },
      },

      cancel: {
        label: "إلغاء",
      },

      duration: 6000,
    });
  };

  // =========================================================
  // Rows
  // =========================================================

  const rows = data?.items || [];

  // =========================================================
  // Summary
  // =========================================================

  const summary = useMemo(() => {
    const totalDebit = rows
      .filter((row) => row.balanceType === "Debit")
      .reduce((sum, row) => sum + (row.baseAmount || row.amount || 0), 0);

    const totalCredit = rows
      .filter((row) => row.balanceType === "Credit")
      .reduce((sum, row) => sum + (row.baseAmount || row.amount || 0), 0);

    return {
      count: rows.length,
      totalDebit,
      totalCredit,
      net: totalDebit - totalCredit,
    };
  }, [rows]);

  // =========================================================
  // Render
  // =========================================================

  return (
    <div className="animate-fadeUp space-y-4">
      {/* =====================================================
          Header
      ====================================================== */}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            الأرصدة الافتتاحية للموظفين
          </h2>

          <p className="text-sm text-ink-400 mt-1">
            إدارة الأرصدة الافتتاحية لحسابات الموظفين
          </p>
        </div>

        <Button onClick={openCreate}>
          <Plus size={16} />
          رصيد افتتاحي جديد
        </Button>
      </div>

      {/* =====================================================
          Summary
      ====================================================== */}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="عدد السجلات" value={summary.count} />

        <SummaryCard
          label="إجمالي مدين"
          value={fmt(summary.totalDebit)}
          tone="negative"
        />

        <SummaryCard
          label="إجمالي دائن"
          value={fmt(summary.totalCredit)}
          tone="positive"
        />

        <SummaryCard
          label="الصافي"
          value={fmt(summary.net)}
          tone={summary.net >= 0 ? "negative" : "positive"}
        />
      </div>

      {/* =====================================================
          Filters
      ====================================================== */}

      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Employee */}

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              الموظف
            </label>

            <CompactSelect
              options={
                employees?.map((employee) => ({
                  value: String(employee.id),
                  label: employee.name,
                })) || []
              }
              value={draft.employeeId}
              onChange={(value) => setField("employeeId", value)}
              placeholder="كل الموظفين"
            />
          </div>

          {/* Search */}

          <Input
            label="بحث"
            value={draft.search}
            onChange={(event) => setField("search", event.target.value)}
            placeholder="رقم المستند..."
          />

          {/* Currency */}

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              العملة
            </label>

            <CompactSelect
              options={currencyOptions}
              value={draft.currency}
              onChange={(value) => setField("currency", value)}
              placeholder="كل العملات"
            />
          </div>

          {/* Balance Type */}

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              نوع الرصيد
            </label>

            <CompactSelect
              options={balanceTypeOptions}
              value={draft.balanceType}
              onChange={(value) => setField("balanceType", value)}
              placeholder="الكل"
            />
          </div>

          {/* From */}

          <Input
            label="من تاريخ"
            type="date"
            value={draft.fromDate}
            onChange={(event) => setField("fromDate", event.target.value)}
          />

          {/* To */}

          <Input
            label="إلى تاريخ"
            type="date"
            value={draft.toDate}
            onChange={(event) => setField("toDate", event.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 mt-3">
          <Button onClick={handleSearch} className="h-9">
            <Search size={14} />
            بحث
          </Button>

          <Button variant="outline" onClick={handleReset} className="h-9">
            <RotateCcw size={14} />
            تصفير
          </Button>
        </div>
      </div>

      {/* =====================================================
          Loading
      ====================================================== */}

      {isLoading ? (
        <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card overflow-hidden">
          <div className="h-10 bg-ink-900/[0.03] border-b border-ink-400/10" />

          <div className="divide-y divide-ink-400/5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-3 py-3">
                <div className="h-3.5 w-28 rounded bg-ink-400/10 animate-pulse" />
                <div className="h-3.5 w-20 rounded bg-ink-400/10 animate-pulse" />
                <div className="h-3.5 w-16 rounded bg-ink-400/10 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        /* =====================================================
            Error
        ====================================================== */

        <div className="text-center py-14 border border-dashed border-negative/25 bg-negative/[0.02] rounded-2xl">
          <AlertCircle
            size={32}
            className="mx-auto text-negative/70 mb-3"
            strokeWidth={1.6}
          />

          <p className="text-ink-900 font-medium text-sm mb-1">
            حدث خطأ في تحميل الأرصدة الافتتاحية
          </p>

          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 text-xs font-medium text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors mt-2"
          >
            <RefreshCw size={13} />
            إعادة المحاولة
          </button>
        </div>
      ) : rows.length === 0 ? (
        /* =====================================================
            Empty
        ====================================================== */

        <div className="text-center py-16 border border-dashed border-ink-400/20 rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-ink-400/5 flex items-center justify-center mx-auto mb-3">
            <History size={24} className="text-ink-400/50" strokeWidth={1.6} />
          </div>

          <p className="text-ink-900 font-medium text-sm mb-1">
            لا توجد أرصدة افتتاحية
          </p>

          <p className="text-xs text-ink-400">
            جرّب تعديل الفلاتر أو أضف رصيد افتتاحي جديد
          </p>
        </div>
      ) : (
        <>
          {/* =================================================
              Table
          ================================================== */}

          <div
            className={`
              overflow-x-auto
              custom-scroll
              rounded-2xl
              border border-ink-400/10
              bg-white
              shadow-card
              transition-opacity
              duration-200
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
                    رقم المستند
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    التاريخ
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    نوع الرصيد
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    القيمة
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    العملة
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    ملاحظات
                  </th>

                  <th className="p-2.5 font-medium">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="border-b border-ink-400/5 last:border-0 hover:bg-primary-50/30 transition-colors animate-fadeUp"
                    style={{
                      animationDelay: `${Math.min(index, 12) * 25}ms`,
                    }}
                  >
                    {/* Employee */}

                    <td className="p-2.5 border-l border-ink-400/5">
                      <p className="text-sm font-medium text-ink-900">
                        {row.employeeName}
                      </p>

                      <p className="text-[10px] text-ink-400 num mt-0.5">
                        #{row.employeeId}
                        {row.employeeCode ? ` • ${row.employeeCode}` : ""}
                      </p>
                    </td>

                    {/* Document Number */}

                    <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                      {row.documentNumber || "—"}
                    </td>

                    {/* Date */}

                    <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                      {row.documentDate}
                    </td>

                    {/* Balance Type */}

                    <td className="p-2.5 border-l border-ink-400/5">
                      <span
                        className={`
                          inline-block
                          text-xs
                          font-semibold
                          px-2
                          py-0.5
                          rounded-full
                          ${
                            balanceTypeBadge[row.balanceType] ||
                            "text-ink-400 bg-ink-400/10"
                          }
                        `}
                      >
                        {BALANCE_TYPE_LABELS[row.balanceType] ||
                          row.balanceType}
                      </span>
                    </td>

                    {/* Amount */}

                    <td className="p-2.5 num text-[13px] font-semibold border-l border-ink-400/5">
                      {fmt(row.amount)}
                      {row.currency !== row.baseCurrency && (
                        <span className="block text-[10px] text-ink-400 font-normal">
                          ({fmt(row.baseAmount)} {row.baseCurrency})
                        </span>
                      )}
                    </td>

                    {/* Currency */}

                    <td className="p-2.5 text-[13px] border-l border-ink-400/5">
                      {row.currency}
                    </td>

                    {/* Notes */}

                    <td className="p-2.5 text-xs text-ink-600 max-w-[160px] truncate border-l border-ink-400/5">
                      {row.notes || "—"}
                    </td>

                    {/* Actions */}

                    <td className="p-2.5">
                      <div className="flex items-center gap-1">
                        {/* Edit */}

                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="p-1.5 rounded-lg text-ink-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="تعديل"
                        >
                          <Pencil size={15} />
                        </button>

                        {/* Delete */}

                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          className="p-1.5 rounded-lg text-ink-400 hover:text-negative hover:bg-negative/10 transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* =================================================
              Pagination
          ================================================== */}

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

      {/* =====================================================
          Form Modal
      ====================================================== */}

      <EmployeeOpeningBalanceFormModal
        isOpen={showFormModal}
        onClose={closeForm}
        balance={editingBalance}
        onSaved={handleFormSaved}
      />
    </div>
  );
}

// =========================================================
// Summary Card
// =========================================================

function SummaryCard({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-ink-400/10 bg-white p-3.5 shadow-card">
      <p className="text-xs text-ink-400 mb-1">{label}</p>

      <p
        className={`
          text-lg
          font-bold
          num
          ${
            tone === "positive"
              ? "text-positive"
              : tone === "negative"
                ? "text-negative"
                : "text-ink-900"
          }
        `}
      >
        {value}
      </p>
    </div>
  );
}
