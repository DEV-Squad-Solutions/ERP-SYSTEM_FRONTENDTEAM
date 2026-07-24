import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateItemMutation } from "../../inventory/inventoryApi";
import { useGetStoresSelectQuery } from "../../stores/storesApi";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

const schema = z.object({
  code: z.string().min(1, "كود الصنف مطلوب"),
  name: z.string().min(2, "اسم الصنف مطلوب"),
  category: z.string().min(1, "الفئة مطلوبة"),
  defaultUnitName: z.string().min(1, "الوحدة الافتراضية مطلوبة"),
  unitWeight: z.coerce.number().min(0.01, "وزن الوحدة مطلوب"),
  pricePerKg: z.coerce.number().optional(),
  storeId: z.string().min(1, "المخزن مطلوب"),
});

/**
 * @param {{ isOpen: boolean, onClose: () => void, onCreated: (item: Object) => void }} props
 */
export default function QuickAddItemModal({ isOpen, onClose, onCreated }) {
  const [createItem, { isLoading }] = useCreateItemMutation();
  const { data: stores } = useGetStoresSelectQuery();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      name: "",
      category: "",
      defaultUnitName: "",
      unitWeight: "",
      pricePerKg: "",
      storeId: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const newItem = await createItem(data).unwrap();
      toast.success("تم إضافة الصنف بنجاح");
      reset();
      onCreated(newItem);
      onClose();
    } catch {
      toast.error("فشل إضافة الصنف");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة صنف جديد">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="الكود"
          {...register("code")}
          error={errors.code?.message}
        />
        <Input
          label="اسم الصنف"
          {...register("name")}
          error={errors.name?.message}
        />
        <Input
          label="الفئة"
          {...register("category")}
          error={errors.category?.message}
        />
        <Input
          label="الوحدة الافتراضية"
          {...register("defaultUnitName")}
          error={errors.defaultUnitName?.message}
        />
        <Input
          label="وزن الوحدة"
          type="number"
          {...register("unitWeight")}
          error={errors.unitWeight?.message}
        />
        <Input
          label="سعر الكيلو (اختياري)"
          type="number"
          {...register("pricePerKg")}
        />
        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            المخزن
          </label>
          <select
            {...register("storeId")}
            className="w-full rounded-xl border border-ink-400/15 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-500"
          >
            <option value="">— اختر —</option>
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
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "جاري الإضافة..." : "إضافة"}
        </Button>
      </form>
    </Modal>
  );
}
