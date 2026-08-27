// features/payroll/components/BulkMoveSalaryModal.jsx

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";

import { useBulkMoveSalaryMutation } from "../payrollApi";

const schema = z.object({
  defaultPostingDate: z.string().min(1, "التاريخ مطلوب"),
  defaultCashboxId: z.string().min(1, "الخزينة مطلوبة"),
  defaultCashMovementTypeId: z.string().min(1, "نوع الحركة مطلوب"),
  notes: z.string().optional(),
});

const defaultValues = {
  defaultPostingDate: "",
  defaultCashboxId: "",
  defaultCashMovementTypeId: "",
  notes: "",
};

export default function BulkMoveSalaryModal({
  isOpen,
  payrollEntryIds,
  cashboxes,
  cashMovementTypes,
  onClose,
  onSaved,
}) {
  const [bulkMoveSalary, { isLoading }] = useBulkMoveSalaryMutation();

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
        defaultPostingDate: new Date().toISOString().slice(0, 10),
      });
    }
    wasOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      await bulkMoveSalary({ payrollEntryIds, ...data }).unwrap();
      toast.success(`تم ترحيل ${payrollEntryIds.length} راتب بنجاح`);
      onSaved();
    } catch {
      toast.error("حصل خطأ أثناء الترحيل الجماعي، حاول تاني");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`ترحيل ${payrollEntryIds.length} راتب`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-xs text-ink-400 -mt-1">
          الإعدادات دي هتتطبق على كل القيود المحددة.
        </p>

        <Input
          label="تاريخ الترحيل"
          type="date"
          {...register("defaultPostingDate")}
          error={errors.defaultPostingDate?.message}
        />

        <div>
          <label className="block text-xs font-medium text-ink-400 mb-1">
            الخزينة
          </label>
          <Controller
            name="defaultCashboxId"
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
          {errors.defaultCashboxId && (
            <p className="text-xs text-negative mt-1">
              {errors.defaultCashboxId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-400 mb-1">
            نوع الحركة
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
                placeholder="اختر نوع الحركة"
              />
            )}
          />
          {errors.defaultCashMovementTypeId && (
            <p className="text-xs text-negative mt-1">
              {errors.defaultCashMovementTypeId.message}
            </p>
          )}
        </div>

        <Input
          label="ملاحظات عامة"
          {...register("notes")}
          error={errors.notes?.message}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-ink-400/10">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "جارِ الترحيل..."
              : `ترحيل (${payrollEntryIds.length})`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
