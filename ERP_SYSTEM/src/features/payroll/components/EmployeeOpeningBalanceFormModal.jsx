// features/payroll/components/EmployeeOpeningBalanceFormModal.jsx
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

import {
  useCreateEmployeeOpeningBalanceMutation,
  useUpdateEmployeeOpeningBalanceMutation,
  useGetEmployeesSelectQuery,
} from "../payrollApi";

import { currencyOptions, balanceTypeOptions } from "../payroll.constants";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const emptyForm = {
  employeeId: "",
  documentDate: getToday(),
  currency: "EGP",
  balanceType: "Debit",
  amount: "",
  notes: "",
  exchangeRate: 1,
};

export default function EmployeeOpeningBalanceFormModal({
  isOpen,
  onClose,
  balance,
  onSaved,
}) {
  const [form, setForm] = useState(emptyForm);

  const { data: employees } = useGetEmployeesSelectQuery();

  const [createBalance, { isLoading: isCreating }] =
    useCreateEmployeeOpeningBalanceMutation();
  const [updateBalance, { isLoading: isUpdating }] =
    useUpdateEmployeeOpeningBalanceMutation();

  const isEditing = Boolean(balance?.id);
  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (!isOpen) return;

    if (balance) {
      setForm({
        employeeId: String(balance.employeeId || ""),
        documentDate: balance.documentDate || getToday(),
        currency: balance.currency || "EGP",
        balanceType: balance.balanceType || "Debit",
        amount: balance.amount ?? "",
        notes: balance.notes || "",
        exchangeRate: balance.exchangeRate ?? 1,
      });
    } else {
      setForm(emptyForm);
    }
  }, [isOpen, balance]);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.employeeId) {
      toast.error("اختر الموظف أولاً");
      return;
    }

    if (!form.documentDate) {
      toast.error("حدد تاريخ المستند");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("أدخل قيمة صحيحة للرصيد");
      return;
    }

    const payload = {
      employeeId: Number(form.employeeId),
      documentDate: form.documentDate,
      currency: form.currency,
      balanceType: form.balanceType,
      amount: Number(form.amount),
      notes: form.notes || undefined,
      exchangeRate: Number(form.exchangeRate) || 1,
    };

    try {
      if (isEditing) {
        await updateBalance({ id: balance.id, ...payload }).unwrap();
        toast.success("تم تعديل الرصيد الافتتاحي بنجاح");
      } else {
        await createBalance(payload).unwrap();
        toast.success("تم إنشاء الرصيد الافتتاحي بنجاح");
      }

      onSaved?.();
    } catch (error) {
      console.error("Employee opening balance save error:", error);
      toast.error(
        error?.data?.message ||
          error?.data?.title ||
          "حدث خطأ أثناء الحفظ، حاول تاني",
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "تعديل رصيد افتتاحي" : "رصيد افتتاحي جديد"}
    >
      <div className="space-y-3">
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
            value={form.employeeId}
            onChange={(value) => setField("employeeId", value)}
            placeholder="اختر موظف"
            disabled={isEditing}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="تاريخ المستند"
            type="date"
            value={form.documentDate}
            onChange={(event) => setField("documentDate", event.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              نوع الرصيد
            </label>

            <CompactSelect
              options={balanceTypeOptions}
              value={form.balanceType}
              onChange={(value) => setField("balanceType", value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="القيمة"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(event) => setField("amount", event.target.value)}
            placeholder="0.00"
          />

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              العملة
            </label>

            <CompactSelect
              options={currencyOptions}
              value={form.currency}
              onChange={(value) => setField("currency", value)}
            />
          </div>
        </div>

        {form.currency !== "EGP" && (
          <Input
            label="سعر الصرف"
            type="number"
            min="0"
            step="0.0001"
            value={form.exchangeRate}
            onChange={(event) => setField("exchangeRate", event.target.value)}
            placeholder="1.00"
          />
        )}

        <div>
          <label className="block text-xs font-medium text-ink-400 mb-1">
            ملاحظات
          </label>

          <textarea
            value={form.notes}
            onChange={(event) => setField("notes", event.target.value)}
            rows={2}
            className="w-full rounded-lg border border-ink-400/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 transition-colors resize-none"
            placeholder="ملاحظات اختيارية..."
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            إلغاء
          </Button>

          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {isSaving ? "جارِ الحفظ..." : "حفظ"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
