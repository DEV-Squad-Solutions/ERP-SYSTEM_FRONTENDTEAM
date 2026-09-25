import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";

import { useCreateEmployeeMovementMutation } from "../payrollApi";
import {
  currencyOptions,
  createMovementTypeOptions,
} from "../payroll.constants";

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

const schema = z
  .object({
    employeeId: z.string().min(1, "اختر الموظف"),
    type: z.string().min(1, "نوع الحركة مطلوب"),
    amount: z.coerce.number().positive("أدخل مبلغ صحيح"),
    currency: z.string().min(1, "اختر العملة"),
    exchangeRate: z.coerce.number().optional(),
    movementDate: z.string().min(1, "تاريخ الحركة مطلوب"),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.currency !== "EGP" && !(data.exchangeRate > 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exchangeRate"],
        message: "أدخل سعر الصرف",
      });
    }
  });

const defaultValues = {
  employeeId: "",
  type: "Deduction", // الأكثر استخدامًا يوميًا
  amount: "",
  currency: "EGP",
  exchangeRate: "",
  movementDate: getToday(),
  notes: "",
};

export default function EmployeeMovementFormModal({
  isOpen,
  onClose,
  employeeOptions = [],
  onSaved,
  defaultType, // اختياري: تقدر تفتح المودال بنوع محدد مسبقًا (مثلاً من زرار "خصم سريع")
}) {
  const [createMovement, { isLoading: isSubmitting }] =
    useCreateEmployeeMovementMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const currency = watch("currency");
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      reset({
        ...defaultValues,
        type: defaultType || defaultValues.type,
        movementDate: getToday(),
      });
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, reset, defaultType]);

  const onSubmit = async (data) => {
    const payload = {
      employeeId: Number(data.employeeId),
      type: data.type,
      amount: Number(data.amount),
      currency: data.currency,
      exchangeRate: data.currency === "EGP" ? 1 : Number(data.exchangeRate),
      movementDate: data.movementDate,
      notes: data.notes?.trim() || null,
    };

    try {
      await createMovement(payload).unwrap();
      toast.success("تم تسجيل الحركة بنجاح");
      onSaved?.();
      onClose();
    } catch (error) {
      console.error("Create employee movement error:", error);
      toast.error(
        error?.data?.message ||
          error?.data?.title ||
          "حدث خطأ أثناء تسجيل الحركة",
      );
    }
  };

  const quickAmounts = [100, 200, 500, 1000];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تسجيل حركة موظف">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Employee */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-ink-400">
              الموظف
            </label>
            <Controller
              name="employeeId"
              control={control}
              render={({ field }) => (
                <CompactSelect
                  options={employeeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="اختر الموظف"
                />
              )}
            />
            {errors.employeeId && (
              <p className="mt-1 text-xs text-negative">
                {errors.employeeId.message}
              </p>
            )}
          </div>

          {/* Movement Type */}
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">
              نوع الحركة
            </label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <CompactSelect
                  options={createMovementTypeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="اختر نوع الحركة"
                />
              )}
            />
            {errors.type && (
              <p className="mt-1 text-xs text-negative">
                {errors.type.message}
              </p>
            )}
          </div>

          {/* Date */}
          <Input
            label="تاريخ الحركة"
            type="date"
            {...register("movementDate")}
            error={errors.movementDate?.message}
          />

          {/* Amount */}
          <div className="sm:col-span-2">
            <Input
              label="المبلغ"
              type="number"
              step="0.01"
              min="0"
              {...register("amount")}
              error={errors.amount?.message}
            />
            <div className="mt-1.5 flex gap-1.5">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setValue("amount", amt)}
                  className="rounded-md border border-ink-400/15 px-2 py-1 text-[11px] text-ink-500 hover:border-primary-500 hover:text-primary-600"
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">
              العملة
            </label>
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <CompactSelect
                  options={currencyOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="اختر العملة"
                />
              )}
            />
            {errors.currency && (
              <p className="mt-1 text-xs text-negative">
                {errors.currency.message}
              </p>
            )}
          </div>

          {/* Exchange Rate - يظهر بس لو العملة مش EGP */}
          {currency !== "EGP" && (
            <Input
              label="سعر الصرف"
              type="number"
              step="0.0001"
              min="0"
              {...register("exchangeRate")}
              error={errors.exchangeRate?.message}
            />
          )}

          {/* Notes */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-ink-400">
              ملاحظات
            </label>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="أضف ملاحظات إن وجدت..."
              className="w-full rounded-lg border border-ink-400/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-ink-400/10 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "جارِ الحفظ..." : "حفظ الحركة"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
