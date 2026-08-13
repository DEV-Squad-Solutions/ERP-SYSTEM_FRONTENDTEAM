import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import {
  useCreateItemUnitMutation,
  useUpdateItemUnitMutation,
} from "../itemUnitsApi";

const unitSchema = z.object({
  name: z.string().min(1, "اسم الوحدة مطلوب"),
  isActive: z.preprocess((v) => v === "true" || v === true, z.boolean()),
});

/**
 * @param {{ isOpen: boolean, onClose: () => void, unit?: object|null }} props
 */
export default function UnitFormModal({ isOpen, onClose, unit }) {
  const isEditing = Boolean(unit);

  const [createUnit, { isLoading: isCreating }] = useCreateItemUnitMutation();
  const [updateUnit, { isLoading: isUpdating }] = useUpdateItemUnitMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(unitSchema),
    defaultValues: { name: "", isActive: true },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      unit
        ? { name: unit.name, isActive: unit.isActive }
        : { name: "", isActive: true },
    );
  }, [isOpen, unit, reset]);

  async function onSubmit(values) {
    try {
      if (isEditing) {
        await updateUnit({ id: unit.id, ...values }).unwrap();
        toast.success("تم تحديث الوحدة بنجاح");
      } else {
        await createUnit(values).unwrap();
        toast.success("تم إضافة الوحدة بنجاح");
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
      title={isEditing ? "تعديل وحدة" : "وحدة جديدة"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs text-ink-400 mb-1.5">
            اسم الوحدة
          </label>
          <input
            type="text"
            placeholder="مثال: كيلوجرام"
            className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
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
