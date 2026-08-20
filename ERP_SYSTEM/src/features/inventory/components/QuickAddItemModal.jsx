import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { useCreateItemMutation, useUpdateItemMutation } from "../inventoryApi";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

import { useGetItemUnitsSelectQuery } from "../../units/itemUnitsApi";

const schema = z.object({
  itemUnitId: z.coerce.number().min(1, "اختر الوحدة"),

  name: z.string().min(2, "اسم الصنف مطلوب"),

  description: z.string().optional(),

  isActive: z.boolean(),
});

const emptyDefaults = {
  itemUnitId: "",
  name: "",
  description: "",
  isActive: true,
};

export default function QuickAddItemModal({
  isOpen,
  onClose,
  item,
  onCreated,
  onUpdated,
}) {
  const isEditMode = Boolean(item?.id);

  const [createItem, { isLoading: isCreating }] = useCreateItemMutation();

  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();

  const isLoading = isCreating || isUpdating;

  const { data: itemUnits } = useGetItemUnitsSelectQuery();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults,
  });

  // =========================================================
  // Fill form
  // =========================================================
  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode) {
      reset({
        itemUnitId: item.itemUnitId ?? "",
        name: item.name ?? "",
        description: item.description ?? "",
        isActive: item.isActive ?? true,
      });
    } else {
      reset(emptyDefaults);
    }
  }, [isOpen, isEditMode, item, reset]);

  // =========================================================
  // Submit
  // =========================================================
  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        const updated = await updateItem({
          id: item.id,
          ...data,
        }).unwrap();

        toast.success("تم تحديث الصنف بنجاح");

        onUpdated?.(updated);

        onClose();

        return;
      }

      // =====================================================
      // Create
      // =====================================================
      const created = await createItem(data).unwrap();

      toast.success("تم إضافة الصنف بنجاح");

      /*
       * مهم جدًا:
       * نرجع الصنف الجديد للصفحة الأب.
       *
       * الصفحة الأب هتعمل:
       *
       * 1. تحديث الليست.
       * 2. إضافة الصنف الجديد للسطر.
       * 3. اختياره تلقائيًا.
       */
      onCreated?.(created);

      reset(emptyDefaults);

      onClose();
    } catch (error) {
      console.error("Item save error:", error);

      toast.error(isEditMode ? "فشل تحديث الصنف" : "فشل إضافة الصنف");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "تعديل بيانات الصنف" : "إضافة صنف جديد"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* الوحدة */}
        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            الوحدة
          </label>

          <select
            {...register("itemUnitId")}
            disabled={isLoading}
            className="w-full rounded-xl border border-ink-400/15 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-500 disabled:opacity-60"
          >
            <option value="">اختر الوحدة</option>

            {itemUnits?.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>

          {errors.itemUnitId && (
            <p className="text-negative text-xs mt-1">
              {errors.itemUnitId.message}
            </p>
          )}
        </div>

        {/* اسم الصنف */}
        <Input
          label="اسم الصنف"
          disabled={isLoading}
          {...register("name")}
          error={errors.name?.message}
        />

        {/* الوصف */}
        <Input
          label="الوصف"
          disabled={isLoading}
          {...register("description")}
          error={errors.description?.message}
        />

        {/* الحالة */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            disabled={isLoading}
            {...register("isActive")}
          />
          الصنف نشط
        </label>

        {/* Submit */}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading
            ? isEditMode
              ? "جاري الحفظ..."
              : "جاري الإضافة..."
            : isEditMode
              ? "حفظ التعديلات"
              : "إضافة الصنف"}
        </Button>
      </form>
    </Modal>
  );
}
