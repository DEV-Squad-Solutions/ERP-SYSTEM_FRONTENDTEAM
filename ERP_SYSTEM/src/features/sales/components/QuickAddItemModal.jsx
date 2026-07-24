import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { useCreateItemMutation } from "../../inventory/inventoryApi";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import { useGetItemUnitsSelectQuery } from "../../units/itemUnitsApi";

const schema = z.object({
  itemUnitId: z.coerce.number().min(1, "اختر الوحدة"),
  code: z.string().min(1, "كود الصنف مطلوب"),
  name: z.string().min(2, "اسم الصنف مطلوب"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

export default function QuickAddItemModal({ isOpen, onClose, onCreated }) {
  const [createItem, { isLoading }] = useCreateItemMutation();
  const { data: itemUnits } = useGetItemUnitsSelectQuery();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      itemUnitId: "",
      code: "",
      name: "",
      description: "",
      isActive: true,
    },
  });

  const onSubmit = async (data) => {
    try {
      const newItem = await createItem(data).unwrap();

      toast.success("تم إضافة الصنف بنجاح");

      reset();

      onCreated?.(newItem);
      onClose();
    } catch {
      toast.error("فشل إضافة الصنف");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة صنف جديد">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            الوحدة
          </label>

          <select
            {...register("itemUnitId")}
            className="w-full rounded-xl border border-ink-400/15 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-500"
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

        <Input
          label="كود الصنف"
          {...register("code")}
          error={errors.code?.message}
        />

        <Input
          label="اسم الصنف"
          {...register("name")}
          error={errors.name?.message}
        />

        <Input
          label="الوصف"
          {...register("description")}
          error={errors.description?.message}
        />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("isActive")} />
          الصنف نشط
        </label>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "جاري الإضافة..." : "إضافة الصنف"}
        </Button>
      </form>
    </Modal>
  );
}
