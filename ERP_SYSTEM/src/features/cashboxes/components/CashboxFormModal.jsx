import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

import {
  useCreateCashboxMutation,
  useUpdateCashboxMutation,
} from "../cashboxesApi";

const schema = z.object({
  name: z.string().min(2, "اسم الخزنة مطلوب"),

  currency: z.enum(["EGP", "USD", "EUR", "GBP", "SAR", "AED", "KWD"]),

  openingBalance: z
    .number({
      invalid_type_error: "أدخل رقم صحيح",
    })
    .min(0),

  openingBalanceDate: z.string().min(1, "التاريخ مطلوب"),

  openingExchangeRate: z
    .number({
      invalid_type_error: "أدخل رقم صحيح",
    })
    .min(0)
    .optional(),

  isActive: z.boolean(),

  notes: z.string().optional(),
});

const emptyValues = {
  name: "",
  currency: "EGP",
  openingBalance: 0,
  openingBalanceDate: new Date().toISOString().slice(0, 10),
  openingExchangeRate: 1,
  isActive: true,
  notes: "",
};

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onSaved?: (cashbox: Object) => void,
 *   cashbox?: Object | null
 * }} props
 */
export default function CashboxFormModal({
  isOpen,
  onClose,
  onSaved,
  cashbox = null,
}) {
  const isEdit = Boolean(cashbox);

  const [createCashbox, { isLoading: isCreating }] = useCreateCashboxMutation();

  const [updateCashbox, { isLoading: isUpdating }] = useUpdateCashboxMutation();

  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isOpen) return;

    reset(
      cashbox
        ? {
            name: cashbox.name ?? "",

            currency: cashbox.currency ?? "EGP",

            openingBalance: cashbox.openingBalance ?? 0,

            openingBalanceDate:
              cashbox.openingBalanceDate ?? emptyValues.openingBalanceDate,

            openingExchangeRate: cashbox.openingExchangeRate ?? 1,

            isActive: cashbox.isActive ?? true,

            notes: cashbox.notes ?? "",
          }
        : emptyValues,
    );
  }, [cashbox, isOpen, reset]);

  const onSubmit = async (values) => {
    try {
      const saved = isEdit
        ? await updateCashbox({
            id: cashbox.id,
            rowVersion: cashbox.rowVersion,
            ...values,
          }).unwrap()
        : await createCashbox(values).unwrap();

      toast.success(isEdit ? "تم تحديث الخزنة بنجاح" : "تم إنشاء الخزنة بنجاح");

      onSaved?.(saved);
      onClose();
    } catch (err) {
      const code = err?.data?.code ?? err?.data?.errorCode;

      if (code === "Cashboxes.Concurrency") {
        toast.error("تم تعديل الخزنة من مكان آخر، حدّث الصفحة وحاول تاني");
        return;
      }

      if (err?.status === 400 && (err?.data?.message || err?.data?.detail)) {
        toast.error(err.data.message ?? err.data.detail);
        return;
      }

      toast.error(isEdit ? "تعذر تحديث الخزنة" : "تعذر إنشاء الخزنة");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "تعديل بيانات الخزنة" : "إضافة خزنة جديدة"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* اسم الخزنة */}
        <Input
          label="اسم الخزنة"
          placeholder="مثال: خزنة الفرع الرئيسي"
          error={errors.name?.message}
          {...register("name")}
        />

        {/* الرصيد الحالي */}
        {isEdit && (
          <div className="rounded-lg border bg-ink-400/5 p-3">
            <p className="text-xs text-ink-400 mb-1">
              الرصيد الحالي (محسوب من الحركة)
            </p>

            <p className="text-sm font-semibold text-ink-900">
              {cashbox.currentBalance != null
                ? cashbox.currentBalance.toLocaleString("ar-EG")
                : "—"}{" "}
              {cashbox.currency}
            </p>
          </div>
        )}

        {/* الرصيد الافتتاحي */}
        <Input
          label="الرصيد الافتتاحي"
          type="number"
          step="0.01"
          error={errors.openingBalance?.message}
          {...register("openingBalance", {
            valueAsNumber: true,
          })}
        />

        {/* تاريخ الرصيد الافتتاحي */}
        <Input
          label="تاريخ الرصيد الافتتاحي"
          type="date"
          error={errors.openingBalanceDate?.message}
          {...register("openingBalanceDate")}
        />

        {/* العملة */}
        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <div>
              <label className="mb-1 block text-sm font-medium">العملة</label>

              <select {...field} className="w-full rounded-lg border px-3 py-2">
                <option value="EGP">الجنيه المصري</option>

                <option value="USD">الدولار الأمريكي</option>

                <option value="EUR">اليورو</option>

                <option value="GBP">الجنيه الإسترليني</option>

                <option value="SAR">الريال السعودي</option>

                <option value="AED">الدرهم الإماراتي</option>

                <option value="KWD">الدينار الكويتي</option>
              </select>

              {errors.currency && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.currency.message}
                </p>
              )}
            </div>
          )}
        />

        {/* سعر الصرف */}
        <Input
          label="سعر الصرف الافتتاحي"
          type="number"
          step="0.0001"
          error={errors.openingExchangeRate?.message}
          {...register("openingExchangeRate", {
            valueAsNumber: true,
          })}
        />

        {/* حالة الخزنة */}
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <label className="flex items-center justify-between rounded-lg border p-3">
              <span className="font-medium">تفعيل الخزنة</span>

              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="h-5 w-5"
              />
            </label>
          )}
        />

        {/* الملاحظات */}
        <Input
          label="ملاحظات (اختياري)"
          placeholder="..."
          {...register("notes")}
        />

        {/* تنبيه التعديل */}
        {isEdit && (
          <p className="text-xs text-ink-400">
            تنبيه: الرصيد الافتتاحي والعملة مينفعش يتغيروا لو فيه سندات مسجلة
            على الخزنة دي — السيرفر هيرفض الحفظ ويوضح السبب.
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>

          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "جاري الحفظ..."
              : isEdit
                ? "حفظ التعديلات"
                : "حفظ الخزنة"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
