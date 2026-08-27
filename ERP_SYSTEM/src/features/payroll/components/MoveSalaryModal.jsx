// features/payroll/components/MoveSalaryModal.jsx

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";

import { useMoveSalaryMutation } from "../payrollApi";

const schema = z.object({
  postingDate: z.string().min(1, "التاريخ مطلوب"),
  cashboxId: z.string().min(1, "الخزينة مطلوبة"),
  cashMovementTypeId: z.string().min(1, "نوع الحركة مطلوب"),
  notes: z.string().optional(),
});

const defaultValues = {
  postingDate: "",
  cashboxId: "",
  cashMovementTypeId: "",
  notes: "",
};

export default function MoveSalaryModal({
  row,
  cashboxes,
  cashMovementTypes,
  onClose,
  onSaved,
}) {
  const isOpen = Boolean(row);

  const [moveSalary, { isLoading }] = useMoveSalaryMutation();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues });

  const wasOpenRef = { current: false };
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      reset({
        ...defaultValues,
        postingDate: new Date().toISOString().slice(0, 10),
      });
    }
    wasOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!row) return null;

  const onSubmit = async (data) => {
    try {
      await moveSalary({ id: row.id, ...data }).unwrap();
      toast.success("تم ترحيل الراتب بنجاح");
      onSaved();
    } catch {
      toast.error("حصل خطأ أثناء الترحيل، حاول تاني");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`ترحيل راتب ${row.employeeName}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="تاريخ الترحيل"
          type="date"
          {...register("postingDate")}
          error={errors.postingDate?.message}
        />

        <div>
          <label className="block text-xs font-medium text-ink-400 mb-1">
            الخزينة
          </label>
          <Controller
            name="cashboxId"
            control={control}
            render={({ field }) => (
              <CompactSelect
                options={cashboxes.map((c) => ({ value: c.id, label: c.name }))}
                value={field.value}
                onChange={field.onChange}
                placeholder="اختر الخزينة"
              />
            )}
          />
          {errors.cashboxId && (
            <p className="text-xs text-negative mt-1">
              {errors.cashboxId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-400 mb-1">
            نوع الحركة
          </label>
          <Controller
            name="cashMovementTypeId"
            control={control}
            render={({ field }) => (
              <CompactSelect
                options={cashMovementTypes.map((t) => ({
                  value: t.id,
                  label: t.name,
                }))}
                value={field.value}
                onChange={field.onChange}
                placeholder="اختر نوع الحركة"
              />
            )}
          />
          {errors.cashMovementTypeId && (
            <p className="text-xs text-negative mt-1">
              {errors.cashMovementTypeId.message}
            </p>
          )}
        </div>

        <Input
          label="ملاحظات"
          {...register("notes")}
          error={errors.notes?.message}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-ink-400/10">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "جارِ الترحيل..." : "ترحيل"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
