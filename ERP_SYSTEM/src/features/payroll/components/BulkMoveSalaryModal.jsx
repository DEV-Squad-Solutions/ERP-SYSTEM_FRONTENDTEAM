// features/payroll/components/BulkMoveSalaryModal.jsx

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

import { useBulkMoveSalaryMutation } from "../payrollApi";

const defaultValues = {
  defaultPostingDate: "",
  notes: "",
};

export default function BulkMoveSalaryModal({
  isOpen,
  payrollEntryIds = [],
  onClose,
  onSaved,
}) {
  const [bulkMoveSalary, { isLoading }] = useBulkMoveSalaryMutation();

  const wasOpenRef = useRef(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues,
  });

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      reset({
        ...defaultValues,
        defaultPostingDate: new Date().toISOString().slice(0, 10),
      });
    }

    wasOpenRef.current = isOpen;
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      await bulkMoveSalary({
        payrollEntryIds: payrollEntryIds.map(Number),
        defaultPostingDate: data.defaultPostingDate,
        notes: data.notes,
      }).unwrap();

      toast.success(`تم ترحيل ${payrollEntryIds.length} راتب بنجاح`);

      onSaved?.();
    } catch (error) {
      // الباك هو المسؤول عن الخطأ
      toast.error(
        error?.data?.message || error?.data?.title || "حدث خطأ أثناء الترحيل",
      );
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`ترحيل ${payrollEntryIds.length} راتب`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-xs text-ink-400 -mt-1">
          سيتم تطبيق تاريخ الترحيل والملاحظات على جميع القيود المحددة.
        </p>

        <Input
          label="تاريخ الترحيل"
          type="date"
          {...register("defaultPostingDate")}
        />

        <Input
          label="ملاحظات عامة"
          {...register("notes")}
          placeholder="أضف ملاحظات إن وجدت"
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-ink-400/10">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
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
