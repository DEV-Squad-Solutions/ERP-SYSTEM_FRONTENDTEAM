import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

import { useGetCashVoucherPartySelectQuery } from "../cashVouchersApi";

import {
  buildDescriptionGroups,
  getCurrentDescriptionValue,
  buildPostingTargetPayload,
} from "../utils/descriptionGroups";

import DescriptionCascadeSelect from "./DescriptionCascadeSelect";

const schema = z.object({
  voucherDate: z.string().min(1, "التاريخ مطلوب"),

  direction: z.enum(["Receipt", "Payment"]),

  descriptionValue: z.string().min(1, "اختر توصيف الحركة"),

  amount: z
    .string()
    .min(1, "المبلغ مطلوب")
    .refine((value) => Number(value) > 0, "المبلغ يجب أن يكون أكبر من صفر"),

  exchangeRate: z.string().optional(),

  referenceNumber: z.string().optional(),

  description: z.string().optional(),

  notes: z.string().optional(),
});

/**
 * تعديل كامل لسند خزنة قائم.
 *
 * API:
 * PUT /CashVouchers/{id}
 *
 * يجب إرسال هدف ترحيل واحد فقط:
 * employeeId
 * businessPartnerId
 * driverId
 * externalPartyName
 * cashMovementTypeId
 *
 * يتم استخدام نفس DescriptionCascadeSelect
 * ونفس buildPostingTargetPayload لضمان توحيد
 * منطق هدف الترحيل.
 */
export default function CashVoucherEditModal({
  isOpen,
  onClose,
  onSave,
  voucher,
  isForeign,
  currency,
  baseCurrency,
}) {
  const [saving, setSaving] = useState(false);

  const { data: partySelect, isFetching: isLoadingPartySelect } =
    useGetCashVoucherPartySelectQuery(undefined, {
      skip: !isOpen,
    });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),

    defaultValues: {
      voucherDate: new Date().toISOString().slice(0, 10),
      direction: "Payment",
      descriptionValue: "",
      amount: "",
      exchangeRate: "",
      referenceNumber: "",
      description: "",
      notes: "",
    },
  });

  const direction = watch("direction");

  const groups = useMemo(
    () =>
      buildDescriptionGroups(partySelect, {
        direction,
      }),
    [partySelect, direction],
  );

  /**
   * تعبئة البيانات عند فتح المودال
   * أو تغيير السند المحدد.
   */
  useEffect(() => {
    if (!isOpen || !voucher) return;

    reset({
      voucherDate: voucher.voucherDate?.slice(0, 10) || "",

      direction: voucher.direction || "Payment",

      descriptionValue: getCurrentDescriptionValue(voucher),

      amount: String(voucher.amount ?? ""),

      exchangeRate:
        voucher.exchangeRate != null ? String(voucher.exchangeRate) : "",

      referenceNumber: voucher.referenceNumber || "",

      description: voucher.description || "",

      notes: voucher.notes || "",
    });
  }, [isOpen, voucher, reset]);

  if (!isOpen || !voucher) {
    return null;
  }

  const isInvoiceGenerated = Boolean(voucher.invoiceId);

  async function onSubmit(values) {
    const selectedOption = groups
      .flatMap((group) => group.options)
      .find((option) => option.value === values.descriptionValue);

    if (!selectedOption) {
      toast.error("اختر توصيف صحيح للحركة");
      return;
    }

    const target = buildPostingTargetPayload(selectedOption.meta, {
      driverTripId: voucher.driverTripId,
    });

    const payload = {
      voucherDate: values.voucherDate,

      direction: values.direction,

      amount: Number(values.amount),

      ...target,

      referenceNumber: values.referenceNumber || undefined,

      description: values.description || undefined,

      notes: values.notes || undefined,
    };

    if (isForeign) {
      payload.exchangeRate = values.exchangeRate
        ? Number(values.exchangeRate)
        : undefined;
    }

    setSaving(true);

    try {
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`تعديل السند ${voucher.voucherNumber || ""}`}
    >
      {isInvoiceGenerated ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-700">
            هذا السند مولد من فاتورة رقم{" "}
            <span className="font-semibold">
              {voucher.invoiceNumber || voucher.invoiceId}
            </span>
            ، ولا يمكن تعديله من هنا.
            <br />
            يمكن تعديله من خلال الفاتورة نفسها.
          </div>

          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              إغلاق
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* التاريخ + الاتجاه */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              type="date"
              label="تاريخ السند"
              {...register("voucherDate")}
              error={errors.voucherDate?.message}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-900">
                الاتجاه
              </label>

              <Controller
                control={control}
                name="direction"
                render={({ field }) => (
                  <div className="flex overflow-hidden rounded-lg border border-ink-400/15">
                    <button
                      type="button"
                      onClick={() => field.onChange("Receipt")}
                      className={`flex-1 py-2 text-xs font-medium transition ${
                        field.value === "Receipt"
                          ? "bg-positive/15 text-positive"
                          : "text-ink-400 hover:bg-ink-900/5"
                      }`}
                    >
                      وارد
                    </button>

                    <button
                      type="button"
                      onClick={() => field.onChange("Payment")}
                      className={`flex-1 border-r border-ink-400/15 py-2 text-xs font-medium transition ${
                        field.value === "Payment"
                          ? "bg-negative/15 text-negative"
                          : "text-ink-400 hover:bg-ink-900/5"
                      }`}
                    >
                      صادر
                    </button>
                  </div>
                )}
              />
            </div>
          </div>

          {/* التوصيف */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-900">
              التوصيف
            </label>

            <Controller
              control={control}
              name="descriptionValue"
              render={({ field }) => (
                <DescriptionCascadeSelect
                  groups={groups}
                  value={field.value}
                  onChange={field.onChange}
                  isLoading={isLoadingPartySelect}
                  placeholder="اختر الحساب أو التوصيف"
                />
              )}
            />

            {errors.descriptionValue && (
              <p className="mt-1 text-xs text-negative">
                {errors.descriptionValue.message}
              </p>
            )}
          </div>

          {/* المبلغ + سعر الصرف */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              type="number"
              step="0.01"
              label={`المبلغ (${currency || "EGP"})`}
              {...register("amount")}
              error={errors.amount?.message}
            />

            {isForeign && (
              <Input
                type="number"
                step="0.0001"
                label={`سعر الصرف (${baseCurrency || "EGP"})`}
                placeholder="سعر يوم السند تلقائيًا إن ترك فارغًا"
                {...register("exchangeRate")}
                error={errors.exchangeRate?.message}
              />
            )}
          </div>

          {/* الرقم المرجعي */}
          <Input
            label="الرقم المرجعي"
            {...register("referenceNumber")}
            error={errors.referenceNumber?.message}
          />

          {/* البيان */}
          <Input
            label="البيان"
            {...register("description")}
            error={errors.description?.message}
          />

          {/* الملاحظات */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-900">
              ملاحظات
            </label>

            <textarea
              {...register("notes")}
              rows={3}
              className="w-full resize-none rounded-lg border border-ink-400/15 px-3 py-2 text-sm outline-none transition placeholder:text-ink-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10"
              placeholder="أضف ملاحظات إن وجدت..."
            />

            {errors.notes && (
              <p className="mt-1 text-xs text-negative">
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t border-ink-400/10 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              إلغاء
            </Button>

            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save size={16} />
                  حفظ التعديلات
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
