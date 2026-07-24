import React, { useState } from "react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Select from "react-select";
import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Loader2,
  X,
} from "lucide-react";
import Drawer from "./Drawer";
import { formatNumber } from "../../utils/formatters";
import {
  useGetInvoicePackagingQuery,
  useReceivePackagingMutation,
  useDeliverPackagingMutation,
} from "../../invoicesApi";

const movementSchema = z.object({
  unit: z.object(
    { value: z.string(), label: z.string() },
    { required_error: "اختر الوحدة" },
  ),
  quantity: z
    .number({ invalid_type_error: "أدخل رقمًا صحيحًا" })
    .positive("الكمية يجب أن تكون أكبر من صفر"),
});

/** نموذج صغير لتسجيل حركة استلام/تسليم عبوات (react-hook-form + zod) */
function PackagingMovementForm({
  mode,
  unitOptions,
  onCancel,
  onSubmit,
  isSubmitting,
}) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(movementSchema),
    defaultValues: { unit: null, quantity: "" },
  });

  const isReceive = mode === "receive";

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({ unit: values.unit.value, quantity: values.quantity }),
      )}
      className="mb-4 space-y-3 rounded-lg border border-slate-200 p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">
          {isReceive ? "استلام عبوات" : "تسليم عبوات"}
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          الوحدة
        </label>
        <Controller
          control={control}
          name="unit"
          render={({ field }) => (
            <Select
              {...field}
              options={unitOptions}
              placeholder="اختر الوحدة..."
              classNamePrefix="rs"
              noOptionsMessage={() => "لا توجد وحدات"}
            />
          )}
        />
        {errors.unit && (
          <p className="mt-1 text-xs text-red-500">{errors.unit.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          الكمية
        </label>
        <input
          type="number"
          step="1"
          {...register("quantity", { valueAsNumber: true })}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#0F6E5E] focus:outline-none focus:ring-1 focus:ring-[#0F6E5E]"
          placeholder="0"
        />
        {errors.quantity && (
          <p className="mt-1 text-xs text-red-500">{errors.quantity.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full rounded-lg px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50 ${
          isReceive
            ? "bg-[#0F6E5E] hover:bg-[#0C5A4D]"
            : "bg-slate-800 hover:bg-slate-900"
        }`}
      >
        {isSubmitting ? "جارٍ الحفظ..." : "تأكيد الحركة"}
      </button>
    </form>
  );
}

export default function PackagingDrawer({ open, onClose, invoiceId, client }) {
  const [activeForm, setActiveForm] = useState(null); // "receive" | "deliver" | null

  // skip: true تمنع الطلب لحد ما الـ Drawer يتفتح فعليًا
  const {
    data: packaging,
    isLoading,
    isError,
  } = useGetInvoicePackagingQuery(invoiceId, {
    skip: !open,
  });
  const [receivePackaging, { isLoading: isReceiving }] =
    useReceivePackagingMutation();
  const [deliverPackaging, { isLoading: isDelivering }] =
    useDeliverPackagingMutation();

  const unitOptions = (packaging ?? []).map((row) => ({
    value: row.unit,
    label: row.unit,
  }));

  const handleSubmitMovement = async ({ unit, quantity }) => {
    const mutate =
      activeForm === "receive" ? receivePackaging : deliverPackaging;
    const successMessage =
      activeForm === "receive"
        ? "تم تسجيل استلام العبوات"
        : "تم تسجيل تسليم العبوات";
    try {
      await mutate({ invoiceId, unit, quantity }).unwrap();
      toast.success(successMessage);
      setActiveForm(null);
    } catch {
      toast.error("تعذر تسجيل الحركة، حاول مرة أخرى");
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title="مخزن عبوات العميل">
      <div className="mb-4 rounded-lg bg-slate-50 px-4 py-3">
        <p className="text-sm font-medium text-slate-700">{client}</p>
        <p className="mt-0.5 text-xs text-slate-400">فاتورة رقم #{invoiceId}</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          جارٍ تحميل بيانات العبوات...
        </div>
      )}

      {isError && (
        <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
          تعذر تحميل بيانات مخزن العبوات، حاول مرة أخرى.
        </p>
      )}

      {activeForm && (
        <PackagingMovementForm
          mode={activeForm}
          unitOptions={unitOptions}
          onCancel={() => setActiveForm(null)}
          onSubmit={handleSubmitMovement}
          isSubmitting={activeForm === "receive" ? isReceiving : isDelivering}
        />
      )}

      {!isLoading && !isError && (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-3 py-2 text-start font-medium">الوحدة</th>
                <th className="px-3 py-2 text-start font-medium">له</th>
                <th className="px-3 py-2 text-start font-medium">عليه</th>
                <th className="px-3 py-2 text-start font-medium">الرصيد</th>
              </tr>
            </thead>
            <tbody>
              {(packaging ?? []).map((row) => (
                <tr key={row.unit} className="border-t border-slate-100">
                  <td className="px-3 py-2.5 font-medium text-slate-700">
                    {row.unit}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-emerald-600">
                    {formatNumber(row.lahu)}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-red-500">
                    {formatNumber(row.alayh)}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums font-semibold text-slate-800">
                    {formatNumber(row.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!activeForm && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setActiveForm("receive")}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowDownToLine className="h-4 w-4" />
            استلام عبوات
          </button>
          <button
            type="button"
            onClick={() => setActiveForm("deliver")}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0F6E5E] px-3 py-2.5 text-sm font-medium text-white hover:bg-[#0C5A4D]"
          >
            <ArrowUpFromLine className="h-4 w-4" />
            تسليم عبوات
          </button>
        </div>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
        <Package className="h-3.5 w-3.5" />
        كل حركة يتم ربطها تلقائيًا برقم الفاتورة #{invoiceId}
      </p>
    </Drawer>
  );
}
