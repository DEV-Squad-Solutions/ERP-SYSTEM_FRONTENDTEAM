import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateCustomerMutation } from "../customersApi";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

const schema = z.object({
  name: z.string().min(2, "اسم العميل مطلوب"),
  phone: z.string().min(6, "رقم الهاتف مطلوب"),
  currency: z.enum(["EGP", "USD"]),
});

/**
 * @param {{ isOpen: boolean, onClose: () => void, onCreated: (customer: Object) => void }} props
 */
export default function QuickAddCustomerModal({ isOpen, onClose, onCreated }) {
  const [createCustomer, { isLoading }] = useCreateCustomerMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", currency: "EGP" },
  });

  const onSubmit = async (data) => {
    try {
      const newCustomer = await createCustomer(data).unwrap();
      toast.success("تم إضافة العميل بنجاح");
      reset();
      onCreated(newCustomer);
      onClose();
    } catch (err) {
      toast.error("فشل إضافة العميل");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة عميل / مورد جديد">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="الاسم"
          {...register("name")}
          error={errors.name?.message}
        />
        <Input
          label="رقم الهاتف"
          {...register("phone")}
          error={errors.phone?.message}
        />
        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            العملة
          </label>
          <select
            {...register("currency")}
            className="w-full rounded-xl border border-ink-400/15 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-500"
          >
            <option value="EGP">جنيه مصري</option>
            <option value="USD">دولار أمريكي</option>
          </select>
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "جاري الإضافة..." : "إضافة"}
        </Button>
      </form>
    </Modal>
  );
}
