import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import { useCreatePartyMutation } from "../partiesApi";

const CURRENCIES = [
  { value: "EGP", label: "جنيه مصري" },
  { value: "USD", label: "دولار أمريكي" },
  { value: "EUR", label: "يورو" },
  { value: "SAR", label: "ريال سعودي" },
];

const schema = z.object({
  code: z.string().min(1, "الكود مطلوب"),
  name: z.string().min(2, "الاسم مطلوب"),
  phone: z.string().optional(),
  address: z.string().optional(),
  partyType: z.enum(["customer", "supplier"]),
  currency: z.enum(["EGP", "USD", "EUR", "SAR"]),
});

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onCreated: (party: Object) => void,
 *   defaultPartyType?: "customer" | "supplier"
 * }} props
 */
export default function QuickAddPartyModal({
  isOpen,
  onClose,
  onCreated,
  defaultPartyType = "customer",
}) {
  const [createParty, { isLoading }] = useCreatePartyMutation();

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
      phone: "",
      address: "",
      partyType: defaultPartyType,
      currency: "EGP",
    },
  });

  const onSubmit = async (data) => {
    try {
      const newParty = await createParty(data).unwrap();
      toast.success(
        data.partyType === "customer"
          ? "تم إضافة العميل بنجاح"
          : "تم إضافة المورد بنجاح",
      );
      reset();
      onCreated?.(newParty);
      onClose();
    } catch {
      toast.error("تعذر الحفظ، حاول مرة أخرى");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة عميل / مورد جديد">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            نوع الحساب
          </label>
          <select
            {...register("partyType")}
            className="w-full rounded-xl border border-ink-400/15 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-500"
          >
            <option value="customer">عميل</option>
            <option value="supplier">مورد</option>
          </select>
        </div>

        <Input
          label="الكود"
          {...register("code")}
          error={errors.code?.message}
        />
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
        <Input
          label="العنوان"
          {...register("address")}
          error={errors.address?.message}
        />

        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            العملة
          </label>
          <select
            {...register("currency")}
            className="w-full rounded-xl border border-ink-400/15 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-500"
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "جاري الإضافة..." : "إضافة"}
        </Button>
      </form>
    </Modal>
  );
}
