// features/cashboxes/components/CashboxFormModal.jsx
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import { useCreateCashboxMutation } from "../cashboxesApi";
import { Currency } from "lucide-react";

const schema = z.object({
  code: z.string().min(1, "الكود مطلوب"),

  name: z.string().min(2, "اسم الخزنة مطلوب"),

  currency: z.enum(["EGP", "USD", "EUR", "GBP", "SAR", "AED", "KWD"]),

  openingBalance: z
    .number({
      invalid_type_error: "أدخل رقم صحيح",
    })
    .min(0),

  isActive: z.boolean(),

  notes: z.string().optional(),
});

export default function CashboxFormModal({ isOpen, onClose, onCreated }) {
  const [createCashbox, { isLoading }] = useCreateCashboxMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      name: "",
      currency: "EGP",
      openingBalance: 0,
      isActive: true,
      notes: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      const created = await createCashbox(values).unwrap();
      toast.success("تم إنشاء الخزنة بنجاح");
      reset();
      onClose();
      onCreated?.(created);
    } catch (err) {}
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة خزنة جديدة">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="كود الخزنة"
          placeholder="مثال: CASH001"
          error={errors.code?.message}
          {...register("code")}
        />
        <Input
          label="اسم الخزنة"
          placeholder="مثال: خزنة الفرع الرئيسي"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="الرصيد الافتتاحي"
          type="number"
          step="0.01"
          error={errors.openingBalance?.message}
          {...register("openingBalance", { valueAsNumber: true })}
        />
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

        <Input
          label="ملاحظات (اختياري)"
          placeholder="..."
          {...register("notes")}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "جاري الحفظ..." : "حفظ الخزنة"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
