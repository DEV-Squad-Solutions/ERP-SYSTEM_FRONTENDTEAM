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
  code: z.string().min(1, "كود الدولة مطلوب"),
  name: z.string().min(1, "الاسم بالإنجليزي مطلوب"),
  arabicName: z.string().min(1, "الاسم بالعربي مطلوب"),
  isActive: z.preprocess((v) => v === "true" || v === true, z.boolean()),
});

/**
 * @param {{ isOpen: boolean, onClose: () => void, country?: object|null }} props
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
    defaultValues: { code: "", name: "", arabicName: "", isActive: true },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      country
        ? {
            code: country.code,
            name: country.name,
            arabicName: country.arabicName,
            isActive: country.isActive,
          }
        : { code: "", name: "", arabicName: "", isActive: true },
    );
  }, [isOpen, country, reset]);

  async function onSubmit(values) {
    try {
      if (isEditing) {
        await updateCountry({ id: country.id, ...values }).unwrap();
        toast.success("تم تحديث الدولة بنجاح");
      } else {
        await createCountry(values).unwrap();
        toast.success("تم إضافة الدولة بنجاح");
      }
      onClose();
    } catch (err) {
      toast.error("حصل خطأ، حاول تاني");
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "تعديل دولة" : "دولة جديدة"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs text-ink-400 mb-1.5">الكود</label>
          <input
            type="text"
            placeholder="مثال: EG"
            className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
            {...register("code")}
          />
          {errors.code && (
            <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs text-ink-400 mb-1.5">
            الاسم بالإنجليزي
          </label>
          <input
            type="text"
            placeholder="مثال: Egypt"
            className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs text-ink-400 mb-1.5">
            الاسم بالعربي
          </label>
          <input
            type="text"
            placeholder="مثال: مصر"
            className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
            {...register("arabicName")}
          />
          {errors.arabicName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.arabicName.message}
            </p>
          )}
        </div>

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

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isEditing ? "حفظ التعديلات" : "إضافة"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
