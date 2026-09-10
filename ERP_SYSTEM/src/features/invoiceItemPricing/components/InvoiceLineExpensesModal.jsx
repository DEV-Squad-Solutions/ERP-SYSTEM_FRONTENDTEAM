// features/invoiceItemPricing/components/InvoiceLineExpensesModal.jsx
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";

import { useUpdateInvoiceLineExpensesMutation } from "../invoiceItemPricingApi";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

function fmt(n) {
  return new Intl.NumberFormat("ar-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);
}

function emptyRow() {
  return { _key: crypto.randomUUID(), name: "", amount: "", notes: "" };
}

export default function InvoiceLineExpensesModal({
  isOpen,
  onClose,
  line,
  onSaved,
}) {
  const [rows, setRows] = useState([]);

  const [updateExpenses, { isLoading: isSaving }] =
    useUpdateInvoiceLineExpensesMutation();

  useEffect(() => {
    if (!isOpen) return;

    const existing = line?.expenses?.length
      ? line.expenses.map((expense) => ({
          _key: crypto.randomUUID(),
          name: expense.name || "",
          amount: expense.amount ?? "",
          notes: expense.notes || "",
        }))
      : [];

    setRows(existing);
  }, [isOpen, line]);

  const addRow = () => {
    setRows((current) => [...current, emptyRow()]);
  };

  const removeRow = (index) => {
    setRows((current) => current.filter((_, i) => i !== index));
  };

  const updateRow = (index, key, value) => {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );
  };

  const total = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

  const handleSubmit = async () => {
    const invalidRow = rows.find(
      (row) => !row.name.trim() || row.amount === "" || Number(row.amount) < 0,
    );

    if (invalidRow) {
      toast.error("تأكد من إدخال اسم وقيمة صحيحة لكل مصروف");
      return;
    }

    const payload = rows.map((row) => ({
      name: row.name.trim(),
      amount: Number(row.amount),
      notes: row.notes || undefined,
    }));

    try {
      await updateExpenses({
        invoiceLineId: line.invoiceLineId,
        expenses: payload,
      }).unwrap();

      toast.success("تم حفظ مصروفات الصنف بنجاح");

      onSaved?.();
    } catch (error) {
      console.error("Update invoice line expenses error:", error);
      toast.error(
        error?.data?.message ||
          error?.data?.title ||
          "حدث خطأ أثناء الحفظ، حاول تاني",
      );
    }
  };

  if (!line) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`مصروفات الصنف — ${line.itemName}`}
      wide
    >
      <div className="space-y-4">
        {/* Line summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <SummaryChip label="الفاتورة" value={line.invoiceNumber} />
          <SummaryChip label="الكمية" value={line.quantity} />
          <SummaryChip label="متوسط التكلفة" value={fmt(line.averageCost)} />
          <SummaryChip
            label="التكلفة الإرشادية"
            value={fmt(line.indicativeUnitCost)}
          />
        </div>

        {/* Expenses rows */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-900">المصروفات</p>

            <Button variant="outline" className="h-8" onClick={addRow}>
              <Plus size={13} />
              إضافة مصروف
            </Button>
          </div>

          {rows.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-ink-400/20 rounded-xl">
              <p className="text-xs text-ink-400">
                لا توجد مصروفات مضافة على هذا الصنف
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {rows.map((row, index) => (
                <div
                  key={row._key}
                  className="grid grid-cols-12 gap-2 items-start rounded-xl border border-ink-400/10 p-2.5"
                >
                  <div className="col-span-4">
                    <Input
                      placeholder="اسم المصروف"
                      value={row.name}
                      onChange={(event) =>
                        updateRow(index, "name", event.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-3">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="القيمة"
                      value={row.amount}
                      onChange={(event) =>
                        updateRow(index, "amount", event.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-4">
                    <Input
                      placeholder="ملاحظات (اختياري)"
                      value={row.notes}
                      onChange={(event) =>
                        updateRow(index, "notes", event.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-1 flex items-center justify-center pt-1.5">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="p-1.5 rounded-lg text-ink-400 hover:text-negative hover:bg-negative/10 transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between rounded-xl bg-ink-400/5 px-3 py-2">
          <p className="text-xs text-ink-400">إجمالي المصروفات اليدوية</p>
          <p className="text-sm font-bold text-ink-900 num">{fmt(total)}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            إلغاء
          </Button>

          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {isSaving ? "جارِ الحفظ..." : "حفظ المصروفات"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function SummaryChip({ label, value }) {
  return (
    <div className="rounded-lg bg-ink-400/5 px-2.5 py-1.5">
      <p className="text-[10px] text-ink-400">{label}</p>
      <p className="text-xs font-semibold text-ink-900 num">{value}</p>
    </div>
  );
}
