import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Select from "react-select";
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

import {
  useCreateStockAdjustmentMutation,
  useUpdateStockAdjustmentMutation,
} from "../stockAdjustmentsApi";
import { useGetStoresSelectQuery } from "../../stores/storesApi";
import { useGetItemsSelectQuery } from "../../inventory/inventoryApi";
import Input from "../../../shared/components/ui/Input"; // عدّل المسار حسب مكانك
import Button from "../../../shared/components/ui/Button"; // عدّل المسار حسب مكانك

// ---------- Validation ----------
const lineSchema = z.object({
  itemId: z.coerce.number().min(1, "اختر الصنف"),
  quantity: z.coerce.number().positive("الكمية يجب أن تكون أكبر من صفر"),
  reason: z.string().optional(),
  // مطلوب فقط لسطور الزيادة (بيتحقق منه في superRefine تحت لأنه بيعتمد
  // على direction المستند ككل، مش على السطر نفسه)
  unitCost: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
});

const schema = z
  .object({
    storeId: z.coerce.number().min(1, "اختر المخزن"),
    documentNumber: z.string().min(1, "رقم المستند مطلوب"),
    documentDate: z.string().min(1, "التاريخ مطلوب"),
    direction: z.enum(["Increase", "Decrease"], {
      required_error: "اختر نوع التسوية",
    }),
    reason: z.string().optional(),
    lines: z.array(lineSchema).min(1, "أضف سطر واحد على الأقل"),
  })
  .superRefine((data, ctx) => {
    if (data.direction === "Increase") {
      data.lines.forEach((line, idx) => {
        if (
          line.unitCost === undefined ||
          line.unitCost === "" ||
          line.unitCost === null ||
          Number.isNaN(Number(line.unitCost))
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "تكلفة الوحدة مطلوبة لسطور الزيادة",
            path: ["lines", idx, "unitCost"],
          });
        }
      });
    }
  });

const emptyLine = { itemId: "", quantity: "", reason: "", unitCost: "" };

const defaultValues = {
  storeId: "",
  documentNumber: "",
  documentDate: new Date().toISOString().slice(0, 10),
  direction: "Increase",
  reason: "",
  lines: [emptyLine],
};

// تحويل بيانات الفورم لشكل الـ payload المطلوب في POST/PUT بالظبط:
// - unitCost بيتشال تمامًا من السطور لو direction = Decrease (السيرفر
//   بيرفض الطلب لو بعتناها أصلًا حسب توصيف الـ API).
function buildPayload(data) {
  return {
    storeId: data.storeId,
    documentNumber: data.documentNumber,
    documentDate: data.documentDate,
    direction: data.direction,
    reason: data.reason || undefined,
    lines: data.lines.map((line) => ({
      itemId: line.itemId,
      quantity: line.quantity,
      reason: line.reason || undefined,
      ...(data.direction === "Increase"
        ? { unitCost: Number(line.unitCost) }
        : {}),
    })),
  };
}

/**
 * فورم موحّد للإنشاء والتعديل (parity زي CreateInvoiceForm/InvoiceEditPage).
 * لو اتبعت `adjustment` (من useGetStockAdjustmentByIdQuery) بيشتغل في وضع تعديل.
 */
export default function StockAdjustmentForm({ adjustment, isEditMode }) {
  const navigate = useNavigate();

  const { data: stores } = useGetStoresSelectQuery();
  const { data: items } = useGetItemsSelectQuery();
  const [createStockAdjustment, { isLoading: isCreating }] =
    useCreateStockAdjustmentMutation();
  const [updateStockAdjustment, { isLoading: isUpdating }] =
    useUpdateStockAdjustmentMutation();
  const isSaving = isCreating || isUpdating;

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const direction = watch("direction");
  const isIncrease = direction === "Increase";

  // تعبئة الفورم في وضع التعديل
  useEffect(() => {
    if (isEditMode && adjustment) {
      reset({
        storeId: adjustment.storeId,
        documentNumber: adjustment.documentNumber,
        documentDate: adjustment.documentDate?.slice(0, 10),
        direction: adjustment.direction,
        reason: adjustment.reason ?? "",
        lines: adjustment.lines?.length
          ? adjustment.lines.map((l) => ({
              itemId: l.itemId,
              quantity: l.quantity,
              reason: l.reason ?? "",
              unitCost: l.unitCost ?? "",
            }))
          : [emptyLine],
      });
    }
  }, [isEditMode, adjustment, reset]);

  const itemOptions =
    items?.map((i) => ({ value: i.id, label: `${i.code} - ${i.name}` })) ?? [];

  const onSubmit = async (data) => {
    try {
      const payload = buildPayload(data);

      if (isEditMode) {
        await updateStockAdjustment({
          id: adjustment.id,
          ...payload,
          rowVersion: adjustment.rowVersion, // إجباري لـ optimistic concurrency
        }).unwrap();
        toast.success("تم تحديث التسوية بنجاح");
      } else {
        await createStockAdjustment(payload).unwrap();
        toast.success("تم إنشاء التسوية بنجاح");
      }
      navigate("/dashboard/inventory/adjustments");
    } catch (err) {
      // الباك اند بيرجع 409 (تعارض rowVersion) لو حد عدّل نفس التسوية في نفس الوقت
      if (err?.status === 409) {
        toast.error(
          "التسوية دي اتعدّلت من حد تاني في نفس الوقت. حدّث الصفحة وحاول تاني.",
        );
      } else {
        toast.error(
          err?.data?.title ||
            (isEditMode ? "فشل تحديث التسوية" : "فشل إنشاء التسوية"),
        );
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
      {/* بيانات الهيدر */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              المخزن
            </label>
            <select
              {...register("storeId")}
              className="w-full rounded-xl border border-ink-400/15 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-500"
            >
              <option value="">اختر المخزن</option>
              {stores?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.storeId && (
              <p className="text-negative text-xs mt-1">
                {errors.storeId.message}
              </p>
            )}
          </div>

          <Input
            label="رقم المستند"
            {...register("documentNumber")}
            error={errors.documentNumber?.message}
          />

          <Input
            type="date"
            label="التاريخ"
            {...register("documentDate")}
            error={errors.documentDate?.message}
          />

          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              نوع التسوية
            </label>
            <div className="flex items-center gap-1 bg-ink-50 rounded-xl p-1">
              <DirectionToggle
                control={control}
                value="Increase"
                label="زيادة"
                icon={ArrowUpCircle}
                activeClass="bg-emerald-500 text-white"
              />
              <DirectionToggle
                control={control}
                value="Decrease"
                label="نقص"
                icon={ArrowDownCircle}
                activeClass="bg-rose-500 text-white"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Input
            label="سبب التسوية (اختياري)"
            {...register("reason")}
            error={errors.reason?.message}
          />
        </div>
      </div>

      {/* السطور */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-semibold text-ink-900">
            أصناف التسوية
          </h3>
          <button
            type="button"
            onClick={() => append(emptyLine)}
            className="flex items-center gap-1.5 text-xs font-medium text-ink-600 hover:text-ink-900 bg-ink-50 hover:bg-ink-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={14} />
            إضافة صنف
          </button>
        </div>

        {errors.lines?.root && (
          <p className="text-negative text-xs mb-3">
            {errors.lines.root.message}
          </p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start border-b border-ink-50 pb-3 last:border-0"
            >
              <div className="sm:col-span-4">
                <Controller
                  control={control}
                  name={`lines.${index}.itemId`}
                  render={({ field: f }) => (
                    <Select
                      isRtl
                      options={itemOptions}
                      value={
                        itemOptions.find((o) => o.value === f.value) || null
                      }
                      onChange={(opt) => f.onChange(opt?.value)}
                      placeholder="ابحث عن صنف..."
                      classNamePrefix="rs"
                    />
                  )}
                />
                {errors.lines?.[index]?.itemId && (
                  <p className="text-negative text-xs mt-1">
                    {errors.lines[index].itemId.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Input
                  type="number"
                  step="any"
                  placeholder="الكمية"
                  {...register(`lines.${index}.quantity`)}
                  error={errors.lines?.[index]?.quantity?.message}
                />
              </div>

              {/* تكلفة الوحدة تظهر بس مع الزيادة - في النقص السيرفر بيحسبها */}
              {isIncrease ? (
                <div className="sm:col-span-2">
                  <Input
                    type="number"
                    step="any"
                    placeholder="تكلفة الوحدة"
                    {...register(`lines.${index}.unitCost`)}
                    error={errors.lines?.[index]?.unitCost?.message}
                  />
                </div>
              ) : (
                <div className="sm:col-span-2 flex items-center">
                  <span className="text-xs text-ink-400">
                    تُحسب تلقائيًا من متوسط التكلفة
                  </span>
                </div>
              )}

              <div className="sm:col-span-3">
                <Input
                  placeholder="سبب السطر (اختياري)"
                  {...register(`lines.${index}.reason`)}
                />
              </div>

              <div className="sm:col-span-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => fields.length > 1 && remove(index)}
                  disabled={fields.length <= 1}
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 disabled:opacity-30"
                  title="حذف السطر"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving
            ? "جاري الحفظ..."
            : isEditMode
              ? "حفظ التعديلات"
              : "إنشاء التسوية"}
        </Button>
        <button
          type="button"
          onClick={() => navigate("/dashboard/inventory/adjustments")}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-50 transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

function DirectionToggle({ control, value, label, icon: Icon, activeClass }) {
  return (
    <Controller
      control={control}
      name="direction"
      render={({ field }) => (
        <button
          type="button"
          onClick={() => field.onChange(value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            field.value === value
              ? activeClass
              : "text-ink-500 hover:text-ink-700"
          }`}
        >
          <Icon size={14} />
          {label}
        </button>
      )}
    />
  );
}
