import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import {
  useCreateCountryMutation,
  useUpdateCountryMutation,
} from "../countriesApi";

const countrySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "الاسم بالعربي مطلوب")
    .max(200, "الاسم بالعربي يجب ألا يتجاوز 200 حرف"),

  englishName: z
    .string()
    .trim()
    .min(1, "الاسم بالإنجليزي مطلوب")
    .max(200, "الاسم بالإنجليزي يجب ألا يتجاوز 200 حرف"),

  isActive: z.preprocess((value) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  }, z.boolean()),
});

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   country?: object|null
 * }} props
 */
export default function CountryFormModal({ isOpen, onClose, country }) {
  const isEditing = Boolean(country);

  const [createCountry, { isLoading: isCreating }] = useCreateCountryMutation();

  const [updateCountry, { isLoading: isUpdating }] = useUpdateCountryMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(countrySchema),

    defaultValues: {
      name: "",
      englishName: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (country) {
      reset({
        name: country.name || "",
        englishName: country.englishName || "",
        isActive: country.isActive ?? true,
      });
    } else {
      reset({
        name: "",
        englishName: "",
        isActive: true,
      });
    }
  }, [isOpen, country, reset]);

  async function onSubmit(values) {
    try {
      const payload = {
        name: values.name.trim(),
        englishName: values.englishName.trim(),
        isActive: values.isActive,
      };

      if (isEditing) {
        await updateCountry({
          id: country.id,
          ...payload,
        }).unwrap();

        toast.success("تم تحديث الدولة بنجاح");
      } else {
        await createCountry(payload).unwrap();

        toast.success("تم إضافة الدولة بنجاح");
      }

      onClose();
    } catch (err) {
      const message = err?.data?.message || err?.data?.title || err?.message;

      if (err?.status === 409) {
        toast.error("كود الدولة مستخدم بالفعل");
      } else {
        toast.error(message || "حدث خطأ أثناء حفظ الدولة");
      }
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "تعديل دولة" : "دولة جديدة"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
        {/* الاسم بالعربي */}
        <div>
          <label className="block text-xs text-ink-400 mb-1.5">
            الاسم بالعربي
          </label>

          <input
            type="text"
            placeholder="مثال: مصر"
            className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
            {...register("name")}
          />

          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* الاسم بالإنجليزي */}
        <div>
          <label className="block text-xs text-ink-400 mb-1.5">
            الاسم بالإنجليزي
          </label>

          <input
            type="text"
            dir="ltr"
            placeholder="Example: Egypt"
            className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
            {...register("englishName")}
          />

          {errors.englishName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.englishName.message}
            </p>
          )}
        </div>

        {/* الحالة */}
        <div>
          <label className="block text-xs text-ink-400 mb-1.5">الحالة</label>

          <select
            className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
            {...register("isActive")}
          >
            <option value="true">نشطة</option>

            <option value="false">غير نشطة</option>
          </select>
        </div>

        {/* الأزرار */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>

          <Button type="submit" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating
              ? "جاري الحفظ..."
              : isEditing
                ? "حفظ التعديلات"
                : "إضافة"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
