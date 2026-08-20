import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRightLeft, Info, Wallet, CircleDollarSign } from "lucide-react";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

import {
  useCreateCashboxTransferMutation,
  useUpdateCashboxTransferMutation,
} from "../cashboxTransfersApi";

const today = new Date().toISOString().slice(0, 10);

// =========================================================
// Validation
// =========================================================

const schema = z
  .object({
    sourceCashboxId: z.coerce
      .number({
        invalid_type_error: "اختر الخزنة المحوّل منها",
      })
      .positive("اختر الخزنة المحوّل منها"),

    destinationCashboxId: z.coerce
      .number({
        invalid_type_error: "اختر الخزنة المحوّل إليها",
      })
      .positive("اختر الخزنة المحوّل إليها"),

    amount: z.coerce
      .number({
        invalid_type_error: "أدخل مبلغ صحيح",
      })
      .positive("المبلغ لازم يكون أكبر من صفر"),

    transferDate: z.string().min(1, "التاريخ مطلوب"),

    description: z.string().optional(),

    notes: z.string().optional(),

    // =====================================================
    // conversionRate
    // 1 source currency = X destination currency
    // =====================================================
    conversionRate: z
      .union([
        z.coerce
          .number({
            invalid_type_error: "أدخل سعر تحويل صحيح",
          })
          .positive("سعر التحويل لازم يكون أكبر من صفر"),
        z.literal(""),
      ])
      .optional(),
  })
  .refine((data) => data.sourceCashboxId !== data.destinationCashboxId, {
    message: "لا يمكن التحويل لنفس الخزنة",
    path: ["destinationCashboxId"],
  });

const emptyValues = {
  sourceCashboxId: "",
  destinationCashboxId: "",
  amount: "",
  transferDate: today,
  description: "",
  notes: "",
  conversionRate: "",
};

// =========================================================
// Helpers
// =========================================================

function formatNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("ar-EG", {
    maximumFractionDigits: 6,
  });
}

function getCurrency(cashbox) {
  return (
    cashbox?.currency || cashbox?.currencyCode || cashbox?.currencyName || ""
  );
}

function getBalance(cashbox) {
  return Number(
    cashbox?.currentBalance ??
      cashbox?.balance ??
      cashbox?.availableBalance ??
      0,
  );
}

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   cashboxes?: Array,
 *   transfer?: object|null,
 *   onSaved?: (saved: object) => void
 * }} props
 */

export default function CashboxTransferFormModal({
  isOpen,
  onClose,
  cashboxes = [],
  transfer = null,
  onSaved,
}) {
  const isEdit = Boolean(transfer);

  const cashboxOptions = Array.isArray(cashboxes) ? cashboxes : [];

  const [createTransfer, { isLoading: isCreating }] =
    useCreateCashboxTransferMutation();

  const [updateTransfer, { isLoading: isUpdating }] =
    useUpdateCashboxTransferMutation();

  const isLoading = isCreating || isUpdating;

  // =========================================================
  // Form
  // =========================================================

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  const sourceCashboxId = watch("sourceCashboxId");
  const destinationCashboxId = watch("destinationCashboxId");
  const amount = watch("amount");
  const conversionRate = watch("conversionRate");

  // =========================================================
  // Selected Cashboxes
  // =========================================================

  const sourceCashbox = useMemo(
    () =>
      cashboxOptions.find(
        (cashbox) => Number(cashbox.id) === Number(sourceCashboxId),
      ),
    [cashboxOptions, sourceCashboxId],
  );

  const destinationCashbox = useMemo(
    () =>
      cashboxOptions.find(
        (cashbox) => Number(cashbox.id) === Number(destinationCashboxId),
      ),
    [cashboxOptions, destinationCashboxId],
  );

  const sourceCurrency = getCurrency(sourceCashbox);
  const destinationCurrency = getCurrency(destinationCashbox);

  const isDifferentCurrency =
    Boolean(sourceCurrency) &&
    Boolean(destinationCurrency) &&
    sourceCurrency !== destinationCurrency;

  // =========================================================
  // Balance
  // =========================================================

  const sourceBalance = getBalance(sourceCashbox);

  const numericAmount = Number(amount);

  const hasInsufficientBalance =
    Boolean(sourceCashbox) &&
    Number.isFinite(numericAmount) &&
    numericAmount > sourceBalance;

  // =========================================================
  // Destination Amount Preview
  // =========================================================

  const convertedAmount = useMemo(() => {
    const numericSourceAmount = Number(amount);
    const numericConversionRate = Number(conversionRate);

    if (!isDifferentCurrency) {
      return null;
    }

    if (!Number.isFinite(numericSourceAmount) || numericSourceAmount <= 0) {
      return null;
    }

    if (!Number.isFinite(numericConversionRate) || numericConversionRate <= 0) {
      return null;
    }

    return numericSourceAmount * numericConversionRate;
  }, [amount, conversionRate, isDifferentCurrency]);

  // =========================================================
  // Reset Form
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    if (transfer) {
      reset({
        sourceCashboxId:
          transfer.sourceCashboxId ?? transfer.fromCashboxId ?? "",

        destinationCashboxId:
          transfer.destinationCashboxId ?? transfer.toCashboxId ?? "",

        amount: transfer.amount ?? "",

        transferDate:
          transfer.transferDate?.slice(0, 10) ??
          transfer.date?.slice(0, 10) ??
          today,

        description: transfer.description ?? "",

        notes: transfer.notes ?? "",

        conversionRate:
          transfer.conversionRate ?? transfer.conversionRateValue ?? "",
      });
    } else {
      reset(emptyValues);
    }
  }, [transfer, isOpen, reset]);

  // =========================================================
  // Submit
  // =========================================================

  const onSubmit = async (values) => {
    if (hasInsufficientBalance) {
      toast.error(
        `الرصيد غير كافي. الرصيد الحالي ${formatNumber(
          sourceBalance,
        )} ${sourceCurrency}`,
      );
      return;
    }

    if (
      isDifferentCurrency &&
      (!values.conversionRate || Number(values.conversionRate) <= 0)
    ) {
      toast.error("يجب إدخال سعر التحويل بين العملتين");
      return;
    }

    try {
      const payload = {
        transferDate: values.transferDate,

        sourceCashboxId: Number(values.sourceCashboxId),

        destinationCashboxId: Number(values.destinationCashboxId),

        amount: Number(values.amount),

        description: values.description?.trim() || "",

        notes: values.notes?.trim() || "",
      };

      // =====================================================
      // Different currencies
      //
      // API:
      // conversionRate =
      // destination currency units per 1 source unit
      //
      // Example:
      // 1 USD = 50.25 EGP
      // conversionRate = 50.25
      // =====================================================

      if (isDifferentCurrency) {
        payload.conversionRate = Number(values.conversionRate);

        // لا نرسل destinationAmount عمدًا.
        // الـ API سيحسبه:
        //
        // destinationAmount =
        // amount * conversionRate
        //
        // وهذا يمنع اختلافات التقريب بين Frontend و Backend.
      }

      console.log("Cashbox transfer payload:", payload);

      const saved = isEdit
        ? await updateTransfer({
            id: transfer.id,
            rowVersion: transfer.rowVersion,
            ...payload,
          }).unwrap()
        : await createTransfer(payload).unwrap();

      toast.success(
        isEdit ? "تم تعديل التحويل بنجاح" : "تم التحويل بين الخزائن بنجاح",
      );

      onSaved?.(saved);

      onClose();
    } catch (err) {
      console.error("Cashbox transfer error:", err);

      const message =
        err?.data?.message ||
        err?.data?.title ||
        err?.data?.detail ||
        err?.data?.errors?.[0] ||
        "حدث خطأ أثناء تنفيذ التحويل";

      toast.error(message);
    }
  };

  // =========================================================
  // Render
  // =========================================================

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "تعديل تحويل بين الخزائن" : "تحويل بين الخزائن"}
      wide
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" dir="rtl">
        {/* =====================================================
            Source / Destination
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Source */}

          <Controller
            control={control}
            name="sourceCashboxId"
            render={({ field }) => (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-900">
                  من خزنة
                </label>

                <select
                  {...field}
                  className="w-full rounded-xl border border-ink-400/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                >
                  <option value="">اختر الخزنة المحوّل منها</option>

                  {cashboxOptions.map((cashbox) => (
                    <option
                      key={cashbox.id}
                      value={cashbox.id}
                      disabled={cashbox.isActive === false}
                    >
                      {cashbox.name}
                      {cashbox.code ? ` (${cashbox.code})` : ""}
                      {" — "}
                      {formatNumber(getBalance(cashbox))} {getCurrency(cashbox)}
                      {cashbox.isActive === false ? " — غير نشطة" : ""}
                    </option>
                  ))}
                </select>

                {errors.sourceCashboxId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.sourceCashboxId.message}
                  </p>
                )}

                {sourceCashbox && (
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-ink-400/5 px-3 py-2 text-xs text-ink-500">
                    <span>الرصيد الحالي</span>

                    <strong className="text-ink-900">
                      {formatNumber(sourceBalance)} {sourceCurrency}
                    </strong>
                  </div>
                )}
              </div>
            )}
          />

          {/* Destination */}

          <Controller
            control={control}
            name="destinationCashboxId"
            render={({ field }) => (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-900">
                  إلى خزنة
                </label>

                <select
                  {...field}
                  className="w-full rounded-xl border border-ink-400/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                >
                  <option value="">اختر الخزنة المحوّل إليها</option>

                  {cashboxOptions.map((cashbox) => (
                    <option
                      key={cashbox.id}
                      value={cashbox.id}
                      disabled={cashbox.isActive === false}
                    >
                      {cashbox.name}
                      {cashbox.code ? ` (${cashbox.code})` : ""}
                      {" — "}
                      {formatNumber(getBalance(cashbox))} {getCurrency(cashbox)}
                      {cashbox.isActive === false ? " — غير نشطة" : ""}
                    </option>
                  ))}
                </select>

                {errors.destinationCashboxId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.destinationCashboxId.message}
                  </p>
                )}

                {destinationCashbox && (
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-ink-400/5 px-3 py-2 text-xs text-ink-500">
                    <span>الرصيد الحالي</span>

                    <strong className="text-ink-900">
                      {formatNumber(getBalance(destinationCashbox))}{" "}
                      {destinationCurrency}
                    </strong>
                  </div>
                )}
              </div>
            )}
          />
        </div>

        {/* =====================================================
            Currency Information
        ====================================================== */}

        {sourceCashbox &&
          destinationCashbox &&
          sourceCurrency &&
          destinationCurrency && (
            <div
              className={`rounded-xl border px-4 py-3 ${
                isDifferentCurrency
                  ? "border-amber-200 bg-amber-50"
                  : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <ArrowRightLeft
                  size={17}
                  className={
                    isDifferentCurrency ? "text-amber-600" : "text-emerald-600"
                  }
                />

                <span className="text-sm font-medium text-ink-900">
                  {sourceCurrency} → {destinationCurrency}
                </span>
              </div>

              {isDifferentCurrency ? (
                <p className="mt-1 text-xs text-amber-700">
                  العملات مختلفة، يجب تحديد سعر التحويل.
                </p>
              ) : (
                <p className="mt-1 text-xs text-emerald-700">
                  نفس العملة، لا يحتاج التحويل إلى سعر تحويل.
                </p>
              )}
            </div>
          )}

        {/* =====================================================
            Amount / Conversion Rate
        ====================================================== */}

        <div
          className={`grid grid-cols-1 gap-4 ${
            isDifferentCurrency ? "md:grid-cols-2" : "md:grid-cols-1"
          }`}
        >
          <Input
            label={
              sourceCurrency ? `المبلغ المحوّل (${sourceCurrency})` : "المبلغ"
            }
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register("amount")}
          />

          {isDifferentCurrency && (
            <Input
              label={`سعر التحويل (${sourceCurrency} → ${destinationCurrency})`}
              type="number"
              step="0.000001"
              min="0.000001"
              placeholder="مثال: 50.25"
              error={errors.conversionRate?.message}
              {...register("conversionRate")}
            />
          )}
        </div>

        {/* =====================================================
            Insufficient Balance
        ====================================================== */}

        {hasInsufficientBalance && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <Wallet size={18} className="mt-0.5 shrink-0 text-red-600" />

            <div className="text-sm">
              <p className="font-medium text-red-900">الرصيد غير كافي</p>

              <p className="mt-1 text-red-700">
                الرصيد المتاح:{" "}
                <strong>
                  {formatNumber(sourceBalance)} {sourceCurrency}
                </strong>
              </p>

              <p className="text-red-700">
                المبلغ المطلوب:{" "}
                <strong>
                  {formatNumber(numericAmount)} {sourceCurrency}
                </strong>
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            Conversion Preview
        ====================================================== */}

        {isDifferentCurrency && convertedAmount !== null && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-2">
              <Info size={17} className="mt-0.5 shrink-0 text-blue-600" />

              <div className="text-sm">
                <p className="font-medium text-blue-900">
                  قيمة التحويل المتوقعة
                </p>

                <p className="mt-1 text-blue-700">
                  سيتم خصم{" "}
                  <strong>
                    {formatNumber(amount)} {sourceCurrency}
                  </strong>{" "}
                  من الخزنة الأولى، وستصل للخزنة الثانية قيمة تقريبية:
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <CircleDollarSign size={16} className="text-blue-600" />

                  <strong className="text-blue-900">
                    {formatNumber(convertedAmount)} {destinationCurrency}
                  </strong>
                </div>

                <p className="mt-1 text-xs text-blue-600">
                  1 {sourceCurrency} = {formatNumber(conversionRate)}{" "}
                  {destinationCurrency}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            Date
        ====================================================== */}

        <Input
          label="تاريخ التحويل"
          type="date"
          error={errors.transferDate?.message}
          {...register("transferDate")}
        />

        {/* =====================================================
            Description
        ====================================================== */}

        <Input
          label="البيان"
          placeholder="مثال: تحويل نقدية من الخزنة الرئيسية إلى خزنة المبيعات"
          error={errors.description?.message}
          {...register("description")}
        />

        {/* =====================================================
            Notes
        ====================================================== */}

        <Input
          label="ملاحظات"
          placeholder="ملاحظات إضافية (اختياري)"
          error={errors.notes?.message}
          {...register("notes")}
        />

        {/* =====================================================
            Actions
        ====================================================== */}

        <div className="flex items-center justify-end gap-2 border-t border-ink-400/10 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            إلغاء
          </Button>

          <Button type="submit" disabled={isLoading || hasInsufficientBalance}>
            {isLoading
              ? "جاري تنفيذ التحويل..."
              : isEdit
                ? "حفظ التعديلات"
                : "تنفيذ التحويل"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
