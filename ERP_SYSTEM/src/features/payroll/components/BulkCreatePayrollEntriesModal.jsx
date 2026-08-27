// features/payroll/components/BulkCreatePayrollEntriesModal.jsx

import { useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";

import {
  useBulkCreatePayrollEntriesMutation,
  useGetEmployeesSelectQuery,
} from "../payrollApi";

const entrySchema = z.object({
  employeeId: z.string().min(1, "الموظف مطلوب"),
  bonus: z.coerce.number().min(0, "القيمة لا يمكن أن تكون سالبة"),
  deduction: z.coerce.number().min(0, "القيمة لا يمكن أن تكون سالبة"),
});

const schema = z.object({
  defaultStartDate: z.string().min(1, "التاريخ مطلوب"),
  defaultEndDate: z.string().min(1, "التاريخ مطلوب"),
  defaultCashboxId: z.string().optional(),
  defaultCashMovementTypeId: z.string().optional(),
  defaultIsSalaryMoveToEmployeeAccount: z.boolean().optional(),
  entries: z.array(entrySchema).min(1, "أضف موظف واحد على الأقل"),
});

const emptyEntry = () => ({ employeeId: "", bonus: 0, deduction: 0 });

const defaultValues = {
  defaultStartDate: "",
  defaultEndDate: "",
  defaultCashboxId: "",
  defaultCashMovementTypeId: "",
  defaultIsSalaryMoveToEmployeeAccount: false,
  entries: [emptyEntry()],
};

export default function BulkCreatePayrollEntriesModal({
  isOpen,
  cashboxes,
  cashMovementTypes,
  onClose,
  onSaved,
}) {
  const { data: employees } = useGetEmployeesSelectQuery();

  const [bulkCreate, { isLoading }] = useBulkCreatePayrollEntriesMutation();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  const wasOpenRef = { current: false };
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      const today = new Date().toISOString().slice(0, 10);
      reset({
        ...defaultValues,
        defaultStartDate: today,
        defaultEndDate: today,
      });
    }
    wasOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      await bulkCreate({
        entries: data.entries.map((entry) => ({
          ...entry,
          startDate: data.defaultStartDate,
          endDate: data.defaultEndDate,
          isSalaryMoveToEmployeeAccount:
            data.defaultIsSalaryMoveToEmployeeAccount,
          cashboxId: data.defaultCashboxId,
          cashMovementTypeId: data.defaultCashMovementTypeId,
        })),
        defaultStartDate: data.defaultStartDate,
        defaultEndDate: data.defaultEndDate,
        defaultIsSalaryMoveToEmployeeAccount:
          data.defaultIsSalaryMoveToEmployeeAccount,
        defaultCashboxId: data.defaultCashboxId,
        defaultCashMovementTypeId: data.defaultCashMovementTypeId,
      }).unwrap();

      toast.success("تم إنشاء قيود المرتبات بنجاح");
      onSaved();
    } catch {
      toast.error("حصل خطأ أثناء إنشاء القيود، حاول تاني");
    }
  };

  return (
    <Modal
      wide
      isOpen={isOpen}
      onClose={onClose}
      title="إنشاء قيود مرتبات جديدة"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-ink-400/5 p-3">
          <Input
            label="من تاريخ"
            type="date"
            {...register("defaultStartDate")}
            error={errors.defaultStartDate?.message}
          />

          <Input
            label="إلى تاريخ"
            type="date"
            {...register("defaultEndDate")}
            error={errors.defaultEndDate?.message}
          />

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              الخزينة (اختياري)
            </label>
            <Controller
              name="defaultCashboxId"
              control={control}
              render={({ field }) => (
                <CompactSelect
                  options={cashboxes.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="بدون ترحيل تلقائي"
                />
              )}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              نوع الحركة (اختياري)
            </label>
            <Controller
              name="defaultCashMovementTypeId"
              control={control}
              render={({ field }) => (
                <CompactSelect
                  options={cashMovementTypes.map((t) => ({
                    value: t.id,
                    label: t.name,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="—"
                />
              )}
            />
          </div>

          <label className="col-span-2 flex items-center gap-2 text-sm text-ink-600">
            <input
              type="checkbox"
              {...register("defaultIsSalaryMoveToEmployeeAccount")}
              className="rounded border-ink-400/30"
            />
            ترحيل كل الرواتب لحساب الموظفين تلقائيًا عند الإنشاء
          </label>
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-end gap-2 rounded-xl border border-ink-400/10 p-3"
            >
              <div className="flex-1">
                <label className="block text-xs font-medium text-ink-400 mb-1">
                  الموظف
                </label>
                <Controller
                  name={`entries.${index}.employeeId`}
                  control={control}
                  render={({ field: f }) => (
                    <CompactSelect
                      options={
                        employees?.map((e) => ({
                          value: e.id,
                          label: e.name,
                        })) || []
                      }
                      value={f.value}
                      onChange={f.onChange}
                      placeholder="اختر الموظف"
                    />
                  )}
                />
                {errors.entries?.[index]?.employeeId && (
                  <p className="text-xs text-negative mt-1">
                    {errors.entries[index].employeeId.message}
                  </p>
                )}
              </div>

              <div className="w-28">
                <Input
                  label="إضافات"
                  type="number"
                  step="0.01"
                  {...register(`entries.${index}.bonus`)}
                  error={errors.entries?.[index]?.bonus?.message}
                />
              </div>

              <div className="w-28">
                <Input
                  label="خصومات"
                  type="number"
                  step="0.01"
                  {...register(`entries.${index}.deduction`)}
                  error={errors.entries?.[index]?.deduction?.message}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                className="mb-0.5 !px-2"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>

        {errors.entries?.message && (
          <p className="text-xs text-negative">{errors.entries.message}</p>
        )}

        <button
          type="button"
          onClick={() => append(emptyEntry())}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline"
        >
          <Plus size={14} />
          إضافة موظف
        </button>

        <div className="flex justify-end gap-2 pt-2 border-t border-ink-400/10">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "جارِ الحفظ..." : "حفظ القيود"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
