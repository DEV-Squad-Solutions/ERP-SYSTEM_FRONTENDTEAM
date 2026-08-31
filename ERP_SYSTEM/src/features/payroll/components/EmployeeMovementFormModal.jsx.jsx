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
import { movementTypeOptions, currencyOptions } from "../payroll.constants";

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
    currency: z.string().min(1, "العملة مطلوبة"),
    exchangeRate: z.coerce.number().optional(),
    movementDate: z.string().min(1, "تاريخ الحركة مطلوب"),
    cashboxId: z.string().min(1, "اختر الخزينة"),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.currency !== "EGP" &&
      (!data.exchangeRate || data.exchangeRate <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exchangeRate"],
        message: "أدخل سعر الصرف لعملة غير الجنيه المصري",
      });
    }
  });

const defaultValues = {
  employeeId: "",
  type: "Debit",
  amount: "",
  currency: "EGP",
  exchangeRate: "",
  movementDate: getToday(),
  cashboxId: "",
  notes: "",
};

export default function EmployeeMovementFormModal({
  isOpen,
  onClose,
  employeeOptions = [],
  cashboxOptions = [],
  onSaved,
}) {
  const [createMovement, { isLoading: isSubmitting }] =
    useCreateEmployeeMovementMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const currency = watch("currency");
  const isForeign = currency !== "EGP";

  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      reset(defaultValues);
    }

    wasOpenRef.current = isOpen;
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    const payload = {
      employeeId: Number(data.employeeId),
      type: data.type,
      amount: Number(data.amount),
      currency: data.currency,
      exchangeRate: isForeign ? Number(data.exchangeRate) : 1,
      movementDate: data.movementDate,
      cashboxId: Number(data.cashboxId),
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تسجيل حركة موظف">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink-400 mb-1">
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
              <p className="text-xs text-negative mt-1">
                {errors.employeeId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              نوع الحركة
            </label>

            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <CompactSelect
                  options={movementTypeOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            {errors.type && (
              <p className="text-xs text-negative mt-1">
                {errors.type.message}
              </p>
            )}
          </div>

          <Input
            label="تاريخ الحركة"
            type="date"
            {...register("movementDate")}
            error={errors.movementDate?.message}
          />

          <Input
            label="المبلغ"
            type="number"
            step="0.01"
            {...register("amount")}
            error={errors.amount?.message}
          />

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
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
                />
              )}
            />

            {errors.currency && (
              <p className="text-xs text-negative mt-1">
                {errors.currency.message}
              </p>
            )}
          </div>

          {isForeign && (
            <Input
              label="سعر الصرف مقابل الجنيه المصري"
              type="number"
              step="0.0001"
              {...register("exchangeRate")}
              error={errors.exchangeRate?.message}
            />
          )}

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink-400 mb-1">
              الخزينة <span className="text-negative">*</span>
            </label>

            <Controller
              name="cashboxId"
              control={control}
              render={({ field }) => (
                <CompactSelect
                  options={cashboxOptions}
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

            {!cashboxOptions.length && (
              <p className="text-xs text-warning mt-1">
                لا توجد خزائن متاحة للاختيار
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink-400 mb-1">
              ملاحظات
            </label>

            <textarea
              {...register("notes")}
              rows={2}
              className="w-full rounded-lg border border-ink-400/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-ink-400/10">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !cashboxOptions.length}
          >
            {isSubmitting ? "جارِ الحفظ..." : "حفظ الحركة"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
