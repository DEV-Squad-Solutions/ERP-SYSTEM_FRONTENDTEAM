import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateCashMovementTypeMutation,
  useUpdateCashMovementTypeMutation,
} from "../../cashboxes/cashMovementTypesApi";
import { toast } from "sonner";
import Modal from "../../../shared/components/ui/Modal";

const DEFAULT_FLAG_DIRECTION = {
  isDefaultForSales: "Receipt",
  isDefaultForPurchaseReturn: "Receipt",
  isDefaultForPurchase: "Payment",
  isDefaultForSalesReturn: "Payment",
};

const CLASSIFICATION_OPTIONS = [
  { value: "PartnerSettlement", label: "تسوية عميل/مورد" },
  { value: "Expense", label: "مصروفات" },
  { value: "Revenue", label: "إيرادات" },
  { value: "Other", label: "أخرى" },
];

const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "اسم النوع مطلوب")
      .max(100, "الاسم طويل جدًا"),
    direction: z.enum(["Receipt", "Payment"], {
      errorMap: () => ({ message: "اختر اتجاه الحركة" }),
    }),
    classification: z.enum(
      ["PartnerSettlement", "Expense", "Revenue", "Other"],
      {
        errorMap: () => ({ message: "اختر تصنيف النوع" }),
      },
    ),
    forPartner: z.boolean(),
    isActive: z.boolean(),
    isDefaultForSales: z.boolean(),
    isDefaultForPurchase: z.boolean(),
    isDefaultForSalesReturn: z.boolean(),
    isDefaultForPurchaseReturn: z.boolean(),
    notes: z
      .string()
      .max(500, "الملاحظات طويلة جدًا")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    // تسوية عميل/مورد لازم forPartner = true
    if (data.classification === "PartnerSettlement" && !data.forPartner) {
      ctx.addIssue({
        code: z.custom,
        path: ["forPartner"],
        message: 'تصنيف "تسوية عميل/مورد" لازم يكون مرتبط بعميل/مورد',
      });
    }

    // أي default flag متفعّل لازم يطابق الاتجاه المسموح بيه
    for (const [flag, requiredDirection] of Object.entries(
      DEFAULT_FLAG_DIRECTION,
    )) {
      if (data[flag] && data.direction !== requiredDirection) {
        ctx.addIssue({
          code: z.custom,
          path: [flag],
          message: `الافتراضي ده لازم يكون اتجاهه ${requiredDirection === "Receipt" ? "قبض" : "صرف"}`,
        });
      }
    }

    const anyDefault =
      data.isDefaultForSales ||
      data.isDefaultForPurchase ||
      data.isDefaultForSalesReturn ||
      data.isDefaultForPurchaseReturn;

    // الافتراضي للفواتير محصور في تصنيف تسوية عميل/مورد فقط
    if (anyDefault && data.classification !== "PartnerSettlement") {
      ctx.addIssue({
        code: z.custom,
        path: ["isDefaultForSales"],
        message: 'الافتراضي للفواتير متاح بس لتصنيف "تسوية عميل/مورد"',
      });
    }

    if (anyDefault && !data.isActive) {
      ctx.addIssue({
        code: z.custom,
        path: ["isActive"],
        message: "النوع لازم يكون نشط عشان يبقى افتراضي لفاتورة",
      });
    }
  });

const DEFAULT_VALUES = {
  name: "",
  direction: "Receipt",
  classification: "PartnerSettlement",
  forPartner: true,
  isActive: true,
  isDefaultForSales: false,
  isDefaultForPurchase: false,
  isDefaultForSalesReturn: false,
  isDefaultForPurchaseReturn: false,
  notes: "",
};

const DEFAULT_FLAG_LABELS = [
  {
    key: "isDefaultForSales",
    label: "افتراضي لفواتير البيع",
    direction: "Receipt",
  },
  {
    key: "isDefaultForPurchaseReturn",
    label: "افتراضي لمرتجع المشتريات",
    direction: "Receipt",
  },
  {
    key: "isDefaultForPurchase",
    label: "افتراضي لفواتير الشراء",
    direction: "Payment",
  },
  {
    key: "isDefaultForSalesReturn",
    label: "افتراضي لمرتجع المبيعات",
    direction: "Payment",
  },
];

export default function CashMovementTypeFormModal({
  open,
  onClose,
  editingType,
}) {
  const isEdit = Boolean(editingType);
  const [createType, { isLoading: isCreating }] =
    useCreateCashMovementTypeMutation();
  const [updateType, { isLoading: isUpdating }] =
    useUpdateCashMovementTypeMutation();
  const isSaving = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const direction = watch("direction");
  const classification = watch("classification");
  const forPartner = watch("forPartner");

  useEffect(() => {
    if (open) {
      reset(
        editingType
          ? {
              name: editingType.name,
              direction: editingType.direction,
              classification: editingType.classification || "PartnerSettlement",
              forPartner: editingType.forPartner,
              isActive: editingType.isActive,
              isDefaultForSales: editingType.isDefaultForSales,
              isDefaultForPurchase: editingType.isDefaultForPurchase,
              isDefaultForSalesReturn: editingType.isDefaultForSalesReturn,
              isDefaultForPurchaseReturn:
                editingType.isDefaultForPurchaseReturn,
              notes: editingType.notes ?? "",
            }
          : DEFAULT_VALUES,
      );
    }
  }, [open, editingType, reset]);

  // لما التصنيف يبقى "تسوية عميل/مورد" — forPartner لازم true إجباري
  useEffect(() => {
    if (classification === "PartnerSettlement" && !forPartner) {
      setValue("forPartner", true, { shouldValidate: true });
    }
  }, [classification, forPartner, setValue]);

  // لما التصنيف يخرج من "تسوية عميل/مورد" — نلغي كل الـ Default flags بتاعة الفواتير
  useEffect(() => {
    if (classification !== "PartnerSettlement") {
      for (const flag of Object.keys(DEFAULT_FLAG_DIRECTION)) {
        setValue(flag, false, { shouldValidate: true });
      }
    }
  }, [classification, setValue]);

  // لما يتغيّر الاتجاه، أي default flag مش متوافق معاه يتلغى تلقائي
  useEffect(() => {
    for (const [flag, requiredDirection] of Object.entries(
      DEFAULT_FLAG_DIRECTION,
    )) {
      if (requiredDirection !== direction) {
        setValue(flag, false, { shouldValidate: true });
      }
    }
  }, [direction, setValue]);

  const accentEffect = useMemo(() => {
    if (!forPartner) return "بدون تأثير على حساب عميل/مورد";
    return direction === "Receipt"
      ? "دائن (Credit) على حساب العميل/المورد"
      : "مدين (Debit) على حساب العميل/المورد";
  }, [direction, forPartner]);

  const canEditDefaults = classification === "PartnerSettlement";

  const onSubmit = async (values) => {
    const payload = { ...values, notes: values.notes || undefined };
    try {
      if (isEdit) {
        await updateType({
          id: editingType.id,
          rowVersion: editingType.rowVersion,
          ...payload,
        }).unwrap();
        toast.success("تم تعديل نوع الحركة");
      } else {
        await createType(payload).unwrap();
        toast.success("تم إنشاء نوع الحركة");
      }
      onClose();
    } catch (err) {
      if (err?.status === 409) {
        toast.error("في نوع حركة بنفس الاسم والاتجاه موجود بالفعل");
      } else {
        toast.error("حصل خطأ أثناء الحفظ، حاول تاني");
      }
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={isEdit ? "تعديل نوع حركة" : "إضافة نوع حركة جديد"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* الاسم */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            اسم النوع
          </label>
          <input
            {...register("name")}
            placeholder="مثال: تحصيل من عميل"
            className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-emerald-600"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* التصنيف */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            التصنيف
          </label>
          <Controller
            control={control}
            name="classification"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2">
                {CLASSIFICATION_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => field.onChange(opt.value)}
                    className={`rounded-xl border px-3 py-2 text-sm transition ${
                      field.value === opt.value
                        ? "border-emerald-600 bg-emerald-50 font-medium text-emerald-800"
                        : "border-gold/30 bg-white text-ink/70 hover:border-gold/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          />
          <p className="mt-1 text-xs text-ink/50">
            مصروفات/إيرادات مستقلة عن الاتجاه ويمكن ربطها بعميل/مورد اختياريًا.
            تسوية عميل/مورد لازم تكون مرتبطة بطرف.
          </p>
        </div>

        {/* الاتجاه */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            اتجاه الحركة
          </label>
          <Controller
            control={control}
            name="direction"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "Receipt", label: "قبض (يزوّد رصيد الخزنة)" },
                  { value: "Payment", label: "صرف (يقلّل رصيد الخزنة)" },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => field.onChange(opt.value)}
                    className={`rounded-xl border px-3 py-2 text-sm transition ${
                      field.value === opt.value
                        ? "border-emerald-600 bg-emerald-50 font-medium text-emerald-800"
                        : "border-gold/30 bg-white text-ink/70 hover:border-gold/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        {/* مرتبط بعميل/مورد */}
        <label
          className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
            classification === "PartnerSettlement"
              ? "cursor-not-allowed border-gold/10 bg-ink/5"
              : "cursor-pointer border-gold/20 bg-white"
          }`}
        >
          <span className="text-sm text-ink">
            مرتبط بعميل/مورد (forPartner)
            {classification === "PartnerSettlement" && (
              <span className="mr-1 text-xs text-ink/40">
                — إجباري لهذا التصنيف
              </span>
            )}
          </span>
          <input
            type="checkbox"
            disabled={classification === "PartnerSettlement"}
            {...register("forPartner")}
            className="h-4 w-4 accent-emerald-700"
          />
        </label>
        {errors.forPartner && (
          <p className="text-xs text-red-600">{errors.forPartner.message}</p>
        )}

        {/* الأثر المحاسبي المشتق */}
        <div className="rounded-xl bg-ink/5 px-3 py-2 text-xs text-ink/70">
          الأثر المحاسبي التلقائي:{" "}
          <span className="font-medium text-ink">{accentEffect}</span>
        </div>

        {/* نشط */}
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gold/20 bg-white px-3 py-2">
          <span className="text-sm text-ink">نشط</span>
          <input
            type="checkbox"
            {...register("isActive")}
            className="h-4 w-4 accent-emerald-700"
          />
        </label>

        {/* افتراضي للفواتير — محصور في تسوية عميل/مورد */}
        <div>
          <p className="mb-2 text-sm font-medium text-ink">
            افتراضي لأنواع الفواتير
            {!canEditDefaults && (
              <span className="mr-1 text-xs text-ink/40">
                — متاح بس لتصنيف "تسوية عميل/مورد"
              </span>
            )}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEFAULT_FLAG_LABELS.map(({ key, label, direction: reqDir }) => {
              const disabled = !canEditDefaults || direction !== reqDir;
              return (
                <label
                  key={key}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs ${
                    disabled
                      ? "cursor-not-allowed border-gold/10 bg-ink/5 text-ink/30"
                      : "cursor-pointer border-gold/20 bg-white text-ink"
                  }`}
                  title={
                    !canEditDefaults
                      ? "متاح بس لتصنيف تسوية عميل/مورد"
                      : disabled
                        ? `يتطلب اتجاه ${reqDir === "Receipt" ? "قبض" : "صرف"}`
                        : ""
                  }
                >
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    disabled={disabled}
                    {...register(key)}
                    className="h-4 w-4 accent-emerald-700"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* ملاحظات */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            ملاحظات (اختياري)
          </label>
          <textarea
            {...register("notes")}
            rows={2}
            className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-emerald-600"
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-gold/20 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gold/30 px-4 py-2 text-sm text-ink hover:bg-ink/5"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {isSaving
              ? "جاري الحفظ..."
              : isEdit
                ? "حفظ التعديلات"
                : "إضافة النوع"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
