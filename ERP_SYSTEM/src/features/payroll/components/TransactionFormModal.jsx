// features/payroll/components/TransactionFormModal.jsx
//
// كومبوننت واحد بيتعاد استخدامه في 3 صفحات (الإضافي والبدلات / الخصومات / السلف)
// بيفرق بينهم بس عن طريق "categoryOptions" اللي بتتبعت له. راجع تعليق
// TRANSACTION_CATEGORY في payroll.constants.js لتفاصيل الـmock.

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";
import {
  useCreateEmployeeTransactionMutation,
  useUpdateEmployeeTransactionMutation,
  useGetEmployeesSelectQuery,
} from "../payrollApi";
import {
  encodeCategory,
  parseCategory,
  TRANSACTION_CATEGORY,
} from "../payroll.constants";

const schema = z.object({
  employeeId: z.string().min(1, "الموظف مطلوب"),
  category: z.string().min(1, "النوع مطلوب"),
  transactionDate: z.string().min(1, "التاريخ مطلوب"),
  amount: z.coerce.number().positive("القيمة لازم تكون أكبر من صفر"),
  notes: z.string().optional(),
});

const defaultValues = {
  employeeId: "",
  category: "",
  transactionDate: "",
  amount: 0,
  notes: "",
};

export default function TransactionFormModal({
  isOpen,
  onClose,
  transaction,
  categoryOptions,
  title,
}) {
  const isEdit = Boolean(transaction);
  const { data: employees } = useGetEmployeesSelectQuery();
  const [createTransaction, { isLoading: isCreating }] =
    useCreateEmployeeTransactionMutation();
  const [updateTransaction, { isLoading: isUpdating }] =
    useUpdateEmployeeTransactionMutation();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues });

  const wasOpenRef = { current: false };
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      if (transaction) {
        const { category, cleanNotes } = parseCategory(transaction.notes);
        reset({
          employeeId: transaction.employeeId,
          category: category || "",
          transactionDate: transaction.transactionDate,
          amount: transaction.amount,
          notes: cleanNotes,
        });
      } else {
        reset(defaultValues);
      }
    }
    wasOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const onSubmit = async (data) => {
    const type = TRANSACTION_CATEGORY[data.category]?.type || "Debit";
    const payload = {
      employeeId: data.employeeId,
      type,
      amount: data.amount,
      transactionDate: data.transactionDate,
      notes: encodeCategory(data.category, data.notes),
    };
    try {
      if (isEdit) {
        await updateTransaction({ id: transaction.id, ...payload }).unwrap();
        toast.success("تم التحديث بنجاح");
      } else {
        await createTransaction(payload).unwrap();
        toast.success("تمت الإضافة بنجاح");
      }
      onClose();
    } catch {
      toast.error("حصل خطأ أثناء الحفظ، حاول تاني");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `تعديل ${title}` : `إضافة ${title}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-ink-400 mb-1">
            الموظف
          </label>
          <Controller
            name="employeeId"
            control={control}
            render={({ field }) => (
              <CompactSelect
                options={
                  employees?.map((e) => ({ value: e.id, label: e.name })) || []
                }
                value={field.value}
                onChange={field.onChange}
                placeholder="اختر الموظف"
              />
            )}
          />
          {errors.employeeId && (
            <p className="text-xs text-negative mt-1">
              {errors.employeeId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-400 mb-1">
            النوع
          </label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <CompactSelect
                options={categoryOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="اختر النوع"
              />
            )}
          />
          {errors.category && (
            <p className="text-xs text-negative mt-1">
              {errors.category.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="التاريخ"
            type="date"
            {...register("transactionDate")}
            error={errors.transactionDate?.message}
          />
          <Input
            label="القيمة"
            type="number"
            step="0.01"
            {...register("amount")}
            error={errors.amount?.message}
          />
        </div>

        <Input
          label="الوصف"
          {...register("notes")}
          error={errors.notes?.message}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-ink-400/10">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "جارِ الحفظ..." : "حفظ"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
