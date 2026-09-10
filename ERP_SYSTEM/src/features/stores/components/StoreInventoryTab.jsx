import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Search,
  PackageX,
  Plus,
  Eye,
  Calculator,
  X,
  Loader2,
  ReceiptText,
  Pencil,
  Trash2,
  Save,
} from "lucide-react";
import {
  useGetStoreStockReportQuery,
  usePutItemPricingExpensesMutation,
} from "../storesApi";
import Pagination from "../../../shared/components/ui/Pagination";
import QuickAddItemModal from "../../inventory/components/QuickAddItemModal";
import Modal from "../../../shared/components/ui/Modal";
import { useLazyGetItemBalanceQuery } from "../../invoices/invoicesApi";

const fmt = (v) => Number(v || 0).toLocaleString("ar-EG");

export default function StoreInventoryTab({
  storeId,
  activeTab = "inventory",
}) {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [hasStock, setHasStock] = useState(undefined);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { data, isFetching, isError } = useGetStoreStockReportQuery({
    storeId,
    pageNumber,
    pageSize,
    search: search.trim() || undefined,
    hasStock,
  });

  const [
    getItemBalance,
    {
      data: itemBalance,
      isFetching: isItemBalanceFetching,
      isError: isItemBalanceError,
    },
  ] = useLazyGetItemBalanceQuery();

  const items = data?.items ?? [];

  const handleOpenItemBalance = async (row) => {
    setSelectedItem(row);

    try {
      await getItemBalance({
        storeId,
        itemId: row.itemId,
        asOfDate: formatDateForApi(new Date()),
      }).unwrap();
    } catch {
      toast.error("تعذر تحميل تفاصيل تكلفة الصنف");
    }
  };

  const handleCloseItemBalance = () => {
    setSelectedItem(null);
  };

  const handleRefreshItemBalance = async () => {
    if (!selectedItem?.itemId) return;

    try {
      await getItemBalance({
        storeId,
        itemId: selectedItem.itemId,
        asOfDate: formatDateForApi(new Date()),
      }).unwrap();
    } catch {
      toast.error("تعذر تحديث تفاصيل تكلفة الصنف");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-6" dir="rtl">
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-ink-400 absolute right-3 top-1/2 -translate-y-1/2" />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageNumber(1);
            }}
            placeholder="ابحث بكود أو اسم الصنف..."
            className="w-full pr-9 pl-3 py-2 text-sm rounded-xl border border-ink-100 focus:outline-none focus:ring-2 focus:ring-ink-200"
          />
        </div>

        <div className="flex items-center gap-1 bg-ink-50 rounded-xl p-1">
          {[
            { label: "الكل", value: undefined },
            { label: "برصيد فقط", value: true },
            { label: "بدون رصيد", value: false },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => {
                setHasStock(opt.value);
                setPageNumber(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                hasStock === opt.value
                  ? "bg-white shadow-sm text-ink-900"
                  : "text-ink-500 hover:text-ink-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-white bg-ink-900 hover:bg-ink-800 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          إضافة صنف جديد
        </button>
      </div>

      {data?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <SummaryChip
            label="إجمالي الأصناف"
            value={fmt(data.summary.totalItemCount)}
          />

          <SummaryChip
            label="أصناف برصيد"
            value={fmt(data.summary.itemsWithStockCount)}
          />

          <SummaryChip
            label="إجمالي قيمة المخزون"
            value={`${fmt(data.summary.totalInventoryValue)} ${
              data.baseCurrency || ""
            }`}
          />
        </div>
      )}

      {isFetching && (
        <div className="py-14 text-center text-sm text-ink-400">
          جاري تحميل الأصناف...
        </div>
      )}

      {isError && (
        <div className="py-14 text-center text-sm text-rose-500">
          حدث خطأ أثناء تحميل أصناف المخزن.
        </div>
      )}

      {!isFetching && !isError && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-ink-500 text-xs border-b border-ink-100">
                  <th className="py-2.5 px-3 text-right font-medium">
                    كود الصنف
                  </th>

                  <th className="py-2.5 px-3 text-right font-medium">
                    اسم الصنف
                  </th>

                  <th className="py-2.5 px-3 text-right font-medium">الوحدة</th>

                  <th className="py-2.5 px-3 text-right font-medium">
                    الكمية الحالية
                  </th>

                  <th className="py-2.5 px-3 text-right font-medium">
                    متوسط التكلفة
                  </th>

                  <th className="py-2.5 px-3 text-right font-medium">
                    قيمة المخزون
                  </th>

                  <th className="py-2.5 px-3 text-center font-medium">
                    التفاصيل
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.length ? (
                  items.map((row) => (
                    <tr
                      key={row.itemId}
                      className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono text-ink-600">
                        {row.itemCode || "—"}
                      </td>

                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/dashboard/items/${row.itemId}?fromStore=${storeId}&tab=${activeTab}`,
                            )
                          }
                          className="font-medium text-ink-900 hover:text-primary-600 hover:underline transition-colors"
                        >
                          {row.itemName || "—"}
                        </button>
                      </td>

                      <td className="py-2.5 px-3 text-ink-600">
                        {row.itemUnitName || "—"}
                      </td>

                      <td className="py-2.5 px-3 text-ink-900 font-medium">
                        {fmt(row.balance)}
                      </td>

                      <td className="py-2.5 px-3 text-ink-700">
                        {fmt(row.averageCost)}
                      </td>

                      <td className="py-2.5 px-3 text-ink-900 font-medium">
                        {fmt(row.inventoryValue)}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => handleOpenItemBalance(row)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-ink-700 bg-ink-50 hover:bg-ink-100 hover:text-ink-900 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            التفاصيل
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-14">
                      <div className="flex flex-col items-center text-center">
                        <PackageX className="w-8 h-8 text-ink-300 mb-2" />

                        <p className="text-ink-400 text-sm">
                          لا توجد أصناف مطابقة داخل هذا المخزن.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data?.totalCount > 0 && (
            <Pagination
              page={pageNumber}
              pageSize={pageSize}
              totalCount={data.totalCount}
              onPageChange={setPageNumber}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPageNumber(1);
              }}
              label="صنف"
            />
          )}
        </>
      )}

      <QuickAddItemModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={() => {}}
      />

      {selectedItem && (
        <ItemBalanceModal
          isOpen={Boolean(selectedItem)}
          item={selectedItem}
          data={itemBalance}
          isLoading={isItemBalanceFetching}
          isError={isItemBalanceError}
          onClose={handleCloseItemBalance}
          onSaved={handleRefreshItemBalance}
        />
      )}
    </div>
  );
}

function ItemBalanceModal({
  isOpen,
  item,
  data,
  isLoading,
  isError,
  onClose,
  onSaved,
}) {
  const [putExpenses, { isLoading: isSaving }] =
    usePutItemPricingExpensesMutation();

  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [expenseForm, setExpenseForm] = useState({
    name: "",
    amount: "",
    notes: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    if (Array.isArray(data?.pricingExpenses)) {
      setExpenses(
        data.pricingExpenses.map((expense, index) => ({
          id: expense.id ?? `expense-${index}`,
          name: expense.name || "",
          amount: expense.amount ?? 0,
          notes: expense.notes || "",
        })),
      );
    } else {
      setExpenses([]);
    }

    setEditingId(null);
    setExpenseForm({
      name: "",
      amount: "",
      notes: "",
    });
  }, [data, isOpen]);

  const totalExpenses = useMemo(
    () =>
      expenses.reduce((sum, expense) => sum + Number(expense?.amount || 0), 0),
    [expenses],
  );

  const resetForm = () => {
    setExpenseForm({
      name: "",
      amount: "",
      notes: "",
    });

    setEditingId(null);
  };

  const handleFormChange = (field, value) => {
    setExpenseForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddExpense = () => {
    const name = expenseForm.name.trim();
    const amount = Number(expenseForm.amount);

    if (!name) {
      toast.error("اكتب اسم المصروف");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("اكتب مبلغ المصروف بشكل صحيح");
      return;
    }

    if (editingId !== null) {
      setExpenses((prev) =>
        prev.map((expense) =>
          expense.id === editingId
            ? {
                ...expense,
                name,
                amount,
                notes: expenseForm.notes.trim(),
              }
            : expense,
        ),
      );
    } else {
      setExpenses((prev) => [
        ...prev,
        {
          id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name,
          amount,
          notes: expenseForm.notes.trim(),
        },
      ]);
    }

    resetForm();
  };

  const handleEditExpense = (expense) => {
    setEditingId(expense.id);

    setExpenseForm({
      name: expense.name || "",
      amount: expense.amount ?? "",
      notes: expense.notes || "",
    });
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));

    if (editingId === id) {
      resetForm();
    }
  };

  const handleSaveExpenses = async () => {
    if (!item?.itemId) {
      toast.error("لم يتم تحديد الصنف");
      return;
    }

    try {
      await putExpenses({
        itemId: item.itemId,
        expenses: expenses.map((expense) => ({
          name: expense.name.trim(),
          amount: Number(expense.amount || 0),
          notes: expense.notes?.trim() || "",
        })),
      }).unwrap();

      toast.success("تم حفظ مصروفات الصنف بنجاح");

      resetForm();

      await onSaved?.();
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.data?.title ||
          error?.message ||
          "تعذر حفظ مصروفات الصنف",
      );
    }
  };

  return (
    <Modal isOpen={isOpen} wide onClose={onClose} title="تفاصيل تكلفة الصنف">
      <div className="py-5 max-h-[70vh] overflow-y-auto">
        {isLoading && (
          <div className="py-14 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-7 h-7 text-ink-400 animate-spin mb-3" />

            <p className="text-sm text-ink-500">
              جاري تحميل تفاصيل تكلفة الصنف...
            </p>
          </div>
        )}

        {isError && !isLoading && (
          <div className="py-14 text-center">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <ReceiptText className="w-5 h-5" />
            </div>

            <p className="text-sm font-medium text-rose-600">
              تعذر تحميل تفاصيل الصنف
            </p>

            <p className="text-xs text-ink-400 mt-1">
              حاول إغلاق النافذة وفتح التفاصيل مرة أخرى.
            </p>
          </div>
        )}

        {data && !isLoading && !isError && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <DetailCard label="المخزن" value={data.storeName} />

              <DetailCard label="الوحدة" value={data.itemUnitName} />

              <DetailCard
                label="الكمية الحالية"
                value={fmt(data.currentQuantity)}
              />

              <DetailCard
                label="تاريخ الرصيد"
                value={formatDisplayDate(data.asOfDate)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-4">
                <p className="text-xs text-ink-500 mb-2">متوسط التكلفة</p>

                <p className="text-lg font-bold text-ink-900">
                  {fmt(data.averageCost)}
                </p>
              </div>

              <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-4">
                <p className="text-xs text-ink-500 mb-2">قيمة المخزون</p>

                <p className="text-lg font-bold text-ink-900">
                  {fmt(data.inventoryValue)}
                </p>
              </div>

              <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-4">
                <p className="text-xs text-primary-600 mb-2">
                  التكلفة شاملة مصروفات التسعير
                </p>

                <p className="text-lg font-bold text-primary-700">
                  {fmt(data.totalCostWithPricingExpenses)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-ink-100 overflow-hidden">
              <div className="px-4 py-3 bg-ink-50/70 border-b border-ink-100">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-ink-900">
                      {editingId !== null ? "تعديل المصروف" : "إضافة مصروف"}
                    </h3>

                    <p className="text-xs text-ink-400 mt-0.5">
                      أضف المصروفات التي تدخل ضمن تكلفة تسعير الصنف
                    </p>
                  </div>

                  {editingId !== null && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs text-ink-500 hover:text-ink-900"
                    >
                      إلغاء التعديل
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink-600 mb-1.5">
                      اسم المصروف
                    </label>

                    <input
                      value={expenseForm.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      placeholder="مثال: شحن"
                      className="w-full px-3 py-2 rounded-xl border border-ink-100 text-sm focus:outline-none focus:ring-2 focus:ring-ink-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink-600 mb-1.5">
                      المبلغ
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={(e) =>
                        handleFormChange("amount", e.target.value)
                      }
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-xl border border-ink-100 text-sm focus:outline-none focus:ring-2 focus:ring-ink-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink-600 mb-1.5">
                      ملاحظات
                    </label>

                    <input
                      value={expenseForm.notes}
                      onChange={(e) =>
                        handleFormChange("notes", e.target.value)
                      }
                      placeholder="ملاحظات اختيارية"
                      className="w-full px-3 py-2 rounded-xl border border-ink-100 text-sm focus:outline-none focus:ring-2 focus:ring-ink-200"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    onClick={handleAddExpense}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-white bg-ink-900 hover:bg-ink-800 transition-colors"
                  >
                    {editingId !== null ? (
                      <>
                        <Pencil className="w-4 h-4" />
                        تحديث المصروف
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        إضافة المصروف
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">
                    مصروفات التسعير
                  </h3>

                  <p className="text-xs text-ink-400 mt-0.5">
                    المصروفات المرتبطة بهذا الصنف
                  </p>
                </div>

                <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-ink-50 text-ink-600">
                  {fmt(expenses.length)} مصروف
                </span>
              </div>

              {expenses.length ? (
                <div className="border border-ink-100 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-ink-50 text-xs text-ink-500">
                          <th className="py-2.5 px-3 text-right font-medium">
                            المصروف
                          </th>

                          <th className="py-2.5 px-3 text-right font-medium">
                            المبلغ
                          </th>

                          <th className="py-2.5 px-3 text-right font-medium">
                            ملاحظات
                          </th>

                          <th className="py-2.5 px-3 text-center font-medium">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {expenses.map((expense) => (
                          <tr
                            key={expense.id}
                            className="border-t border-ink-50"
                          >
                            <td className="py-3 px-3 font-medium text-ink-800">
                              {expense.name || "—"}
                            </td>

                            <td className="py-3 px-3 font-semibold text-ink-900">
                              {fmt(expense.amount)}
                            </td>

                            <td className="py-3 px-3 text-ink-500">
                              {expense.notes || "—"}
                            </td>

                            <td className="py-3 px-3">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleEditExpense(expense)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-50 hover:text-ink-900 transition-colors"
                                  title="تعديل"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteExpense(expense.id)
                                  }
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                  title="حذف"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>

                      <tfoot>
                        <tr className="border-t border-ink-100 bg-ink-50/60">
                          <td className="py-3 px-3 font-semibold text-ink-800">
                            إجمالي المصروفات
                          </td>

                          <td className="py-3 px-3 font-bold text-ink-900">
                            {fmt(totalExpenses)}
                          </td>

                          <td />

                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-ink-200 py-8 text-center">
                  <ReceiptText className="w-7 h-7 text-ink-300 mx-auto mb-2" />

                  <p className="text-sm text-ink-400">
                    لا توجد مصروفات تسعير لهذا الصنف.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-ink-900 text-white p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-white/60">إجمالي مصروفات التسعير</p>

                <p className="text-xl font-bold mt-1">{fmt(totalExpenses)}</p>
              </div>

              <button
                type="button"
                onClick={handleSaveExpenses}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-ink-900 text-sm font-semibold hover:bg-ink-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    حفظ المصروفات
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-xl bg-ink-50/70 px-3.5 py-3">
      <p className="text-[11px] text-ink-400 mb-1">{label}</p>

      <p className="text-sm font-semibold text-ink-900 truncate">
        {value ?? "—"}
      </p>
    </div>
  );
}

function SummaryChip({ label, value }) {
  return (
    <div className="bg-ink-50 rounded-xl px-3.5 py-2.5">
      <p className="text-[11px] text-ink-500 mb-0.5">{label}</p>

      <p className="text-sm font-semibold text-ink-900">{value ?? "—"}</p>
    </div>
  );
}

function formatDateForApi(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function formatDisplayDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("ar-EG");
}
