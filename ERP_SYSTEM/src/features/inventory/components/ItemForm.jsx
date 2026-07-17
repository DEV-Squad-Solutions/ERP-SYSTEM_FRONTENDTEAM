import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateItemMutation } from "../inventoryApi";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

const itemSchema = z.object({
  name: z.string().min(2, "اسم الصنف مطلوب"),
  code: z.string().min(1, "كود الصنف مطلوب"),
  unit: z.string().min(1, "وحدة القياس مطلوبة"),
  minQuantity: z.coerce.number().min(0, "لا يمكن أن يكون سالب"),
  purchasePrice: z.coerce.number().min(0, "سعر الشراء مطلوب"),
  salePrice: z.coerce.number().min(0, "سعر البيع مطلوب"),
});

/**
 * @param {{ onSuccess?: () => void }} props
 */
export default function ItemForm({ onSuccess }) {
  const [createItem, { isLoading }] = useCreateItemMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: "",
      code: "",
      unit: "",
      minQuantity: 0,
      purchasePrice: 0,
      salePrice: 0,
    },
  });

  const onSubmit = async (data) => {
    try {
      await createItem(data).unwrap();
      reset();
      onSuccess?.();
    } catch (err) {
      console.error("فشل إضافة الصنف:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="اسم الصنف"
        {...register("name")}
        error={errors.name?.message}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="كود الصنف"
          {...register("code")}
          error={errors.code?.message}
        />
        <Input
          label="وحدة القياس"
          placeholder="كرتونة / كيلو / قطعة"
          {...register("unit")}
          error={errors.unit?.message}
        />
      </div>
      <Input
        label="حد الطلب الأدنى"
        type="number"
        {...register("minQuantity")}
        error={errors.minQuantity?.message}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="سعر الشراء"
          type="number"
          {...register("purchasePrice")}
          error={errors.purchasePrice?.message}
        />
        <Input
          label="سعر البيع"
          type="number"
          {...register("salePrice")}
          error={errors.salePrice?.message}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "جاري الحفظ..." : "حفظ الصنف"}
      </Button>
    </form>
  );
}
