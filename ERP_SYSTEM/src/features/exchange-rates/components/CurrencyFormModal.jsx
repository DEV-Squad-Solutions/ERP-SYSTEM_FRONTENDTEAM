import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";
import {
  useCreateExchangeRateMutation,
  useUpdateExchangeRateMutation,
} from "../exchangeRatesApi";
import { useGetCurrenciesSelectQuery } from "../../currencies/currenciesApi";

const schema = z.object({
  currency: z.string().min(1, "اختر العملة"),
  rate: z.coerce.number().positive("السعر لازم يكون أكبر من صفر"),
  rateDate: z.string().min(1, "التاريخ مطلوب"),
  notes: z.string().optional(),
  updateLinkedTransactions: z.boolean().optional(),
});

const defaultValues = {
  currency: "",
  rate: 0,
  rateDate: "",
  notes: "",
  updateLinkedTransactions: false,
};

export default function CurrencyFormModal({ isOpen, rate, onClose, onSaved }) {
  const isEdit = Boolean(rate);
  const wasOpenRef = useRef(false);

  const { data: currencies } = useGetCurrenciesSelectQuery();

  const [createExchangeRate, { isLoading: isCreating }] =
    useCreateExchangeRateMutation();

  const [updateExchangeRate, { isLoading: isUpdating }] =
    useUpdateExchangeRateMutation();

  const isSubmitting = isCreating || isUpdating;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      if (rate) {
        reset({
          currency: rate.currency,
          rate: rate.rate,
          rateDate: rate.rateDate,
          notes: rate.notes || "",
          updateLinkedTransactions: false,
        });
      } else {
        reset(defaultValues);
      }
    }

    wasOpenRef.current = isOpen;
  }, [isOpen, rate, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateExchangeRate({
          id: rate.id,
          currency: data.currency,
          rate: data.rate,
          rateDate: data.rateDate,
          source: rate.source || "Manual",
          provider: rate.provider || undefined,
          notes: data.notes,
          updateLinkedTransactions: data.updateLinkedTransactions,
          rowVersion: rate.rowVersion,
        }).unwrap();

        toast.success("تم تحديث سعر العملة بنجاح");
      } else {
        await createExchangeRate({
          currency: data.currency,
          rate: data.rate,
          rateDate: data.rateDate,
          source: "Manual",
          notes: data.notes,
        }).unwrap();

        toast.success("تمت إضافة سعر العملة بنجاح");
      }

      onSaved();
    } catch (error) {
      const message =
        error?.data?.detail ||
        error?.data?.title ||
        "حصل خطأ أثناء الحفظ، حاول تاني";

      toast.error(message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `تعديل سعر ${rate.currency}` : "إضافة سعر عملة"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-ink-400 mb-1">
            العملة
          </label>

          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <CompactSelect
                options={
                  currencies?.map((c) => ({
                    value: c.value,
                    label: c.description
                      ? `${c.value} — ${c.description}`
                      : c.value,
                  })) || []
                }
                value={field.value}
                onChange={field.onChange}
                placeholder="اختر العملة"
                disabled={isEdit}
              />
            )}
          />

          {errors.currency && (
            <p className="text-xs text-negative mt-1">
              {errors.currency.message}
            </p>
          )}
        </div>

        <Input
          label="السعر"
          type="number"
          step="0.0001"
          {...register("rate")}
          error={errors.rate?.message}
        />

        <Input
          label="تاريخ السعر"
          type="date"
          {...register("rateDate")}
          error={errors.rateDate?.message}
        />

        <Input
          label="ملاحظات (اختياري)"
          {...register("notes")}
          error={errors.notes?.message}
        />

        {isEdit && (
          <label className="flex items-start gap-2 rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 text-sm text-ink-700">
            <input
              type="checkbox"
              {...register("updateLinkedTransactions")}
              className="mt-0.5 rounded border-ink-400/30"
            />

            <span>
              تحديث كل الفواتير والسندات وتحويلات الخزائن والأرصدة المرتبطة بنفس
              سعر الصرف
              <span className="mt-0.5 block text-xs text-amber-600">
                تنبيه: ده هيعيد حساب حركات قديمة مرتبطة بالسعر ده — استخدمه
                بحذر.
              </span>
            </span>
          </label>
        )}

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
