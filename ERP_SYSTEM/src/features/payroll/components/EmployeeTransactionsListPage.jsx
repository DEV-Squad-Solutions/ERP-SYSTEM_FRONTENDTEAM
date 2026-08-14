// features/payroll/components/EmployeeTransactionsListPage.jsx
//
// كومبوننت List عام بيتلف حواليه صفحتين: Overtime & Allowances و Deductions.
// الفلترة بتصنيف (category) بتحصل client-side حاليًا (parseCategory من notes)
// لحد ما الباك إند يوفر حقل category حقيقي في EmployeeTransactions.

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Search,
  RotateCcw,
  Plus,
  Pencil,
  Trash2,
  Eye,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  useGetEmployeeTransactionsQuery,
  useDeleteEmployeeTransactionMutation,
} from "../payrollApi";
import { parseCategory, categoryLabel, fmtMoney } from "../payroll.constants";
import TransactionFormModal from "./TransactionFormModal";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";

const emptyFilters = { search: "", category: "" };

export default function EmployeeTransactionsListPage({
  title,
  subtitle,
  categoryOptions,
  categoryKeys,
  emptyIcon: EmptyIcon,
  emptyLabel,
  onView,
}) {
  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetEmployeeTransactionsQuery({
      PageNumber: page,
      PageSize: pageSize,
      Search: applied.search || undefined,
    });

  const [deleteTransaction] = useDeleteEmployeeTransactionMutation();

  // فلترة client-side على التصنيفات الخاصة بالصفحة دي (mock)
  const rows = useMemo(() => {
    const items = data?.items || [];
    return items
      .map((t) => ({ ...t, ...parseCategory(t.notes) }))
      .filter((t) => categoryKeys.includes(t.category))
      .filter((t) =>
        applied.category ? t.category === applied.category : true,
      );
  }, [data, categoryKeys, applied.category]);

  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const handleSearch = () => {
    setApplied(draft);
    setPage(1);
  };

  const handleReset = () => {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setPage(1);
  };

  const openAdd = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setShowModal(true);
  };

  const handleDelete = (row) => {
    toast(`حذف الحركة؟`, {
      description: "الإجراء ده لا يمكن التراجع عنه",
      action: {
        label: "تأكيد الحذف",
        onClick: async () => {
          try {
            await deleteTransaction(row.id).unwrap();
            toast.success("تم الحذف بنجاح");
          } catch {
            toast.error("حصل خطأ أثناء الحذف، حاول تاني");
          }
        },
      },
      cancel: { label: "إلغاء" },
      duration: 6000,
    });
  };

  return (
    <div className="animate-fadeUp space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            {title}
          </h2>
          <p className="text-sm text-ink-400 mt-1">{subtitle}</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} />
          إضافة
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="بحث"
            value={draft.search}
            onChange={(e) => setField("search", e.target.value)}
            placeholder="اسم الموظف..."
          />
          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              النوع
            </label>
            <CompactSelect
              options={categoryOptions}
              value={draft.category}
              onChange={(val) => setField("category", val)}
              placeholder="الكل"
            />
          </div>
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

      {isLoading ? (
        <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card overflow-hidden">
          <div className="h-10 bg-ink-900/[0.03] border-b border-ink-400/10" />
          <div className="divide-y divide-ink-400/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-3 py-3">
                <div className="h-3.5 w-24 rounded bg-ink-400/10 animate-pulse" />
                <div className="h-3.5 w-20 rounded bg-ink-400/10 animate-pulse" />
                <div className="h-3.5 w-16 rounded bg-ink-400/10 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="text-center py-14 border border-dashed border-negative/25 bg-negative/[0.02] rounded-2xl">
          <AlertCircle
            size={32}
            className="mx-auto text-negative/70 mb-3"
            strokeWidth={1.6}
          />
          <p className="text-ink-900 font-medium text-sm mb-1">
            حدث خطأ في تحميل البيانات
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
        <div className="text-center py-16 border border-dashed border-ink-400/20 rounded-2xl">
          {EmptyIcon && (
            <div className="w-14 h-14 rounded-full bg-ink-400/5 flex items-center justify-center mx-auto mb-3">
              <EmptyIcon
                size={24}
                className="text-ink-400/50"
                strokeWidth={1.6}
              />
            </div>
          )}
          <p className="text-ink-900 font-medium text-sm mb-1">{emptyLabel}</p>
          <Button onClick={openAdd} variant="outline" className="mt-3">
            <Plus size={14} />
            إضافة
          </Button>
        </div>
      ) : (
        <>
          <div
            className={`overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity duration-200 ${isFetching ? "opacity-60" : ""}`}
          >
            <table className="w-full text-right border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الموظف
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    النوع
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    التاريخ
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الوصف
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    القيمة
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الحالة
                  </th>
                  <th className="p-2.5 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="border-b border-ink-400/5 last:border-0 hover:bg-primary-50/30 transition-colors animate-fadeUp"
                    style={{ animationDelay: `${Math.min(idx, 12) * 25}ms` }}
                  >
                    <td className="p-2.5 text-sm text-ink-900 border-l border-ink-400/5">
                      {r.employeeName}
                    </td>
                    <td className="p-2.5 text-xs text-ink-700 border-l border-ink-400/5">
                      {categoryLabel(r.category)}
                    </td>
                    <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                      {r.transactionDate}
                    </td>
                    <td className="p-2.5 text-xs text-ink-600 max-w-[200px] truncate border-l border-ink-400/5">
                      {r.cleanNotes || "—"}
                    </td>
                    <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                      {fmtMoney(r.amount)}
                    </td>
                    <td className="p-2.5 border-l border-ink-400/5">
                      <span
                        className={
                          r.isProcessed
                            ? "inline-block text-emerald-700 text-xs font-semibold bg-emerald-700/10 px-2 py-0.5 rounded-full"
                            : "inline-block text-amber-600 text-xs font-semibold bg-amber-50 px-2 py-0.5 rounded-full"
                        }
                      >
                        {r.isProcessed ? "تم الترحيل" : "معلّق"}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-1">
                        {onView && (
                          <button
                            onClick={() => onView(r)}
                            className="p-1.5 rounded-lg text-ink-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            title="عرض"
                          >
                            <Eye size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(r)}
                          className="p-1.5 rounded-lg text-ink-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="تعديل"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
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

      <TransactionFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        transaction={editing}
        categoryOptions={categoryOptions}
        title={title}
      />
    </div>
  );
}
