import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import { useCreatePartyMutation, useUpdatePartyMutation } from "../partiesApi";

const CURRENCIES = [
  { value: "EGP", label: "جنيه مصري" },
  { value: "USD", label: "دولار أمريكي" },
  { value: "EUR", label: "يورو" },
  { value: "GBP", label: "جنيه إسترليني" },
  { value: "SAR", label: "ريال سعودي" },
  { value: "AED", label: "درهم إماراتي" },
  { value: "KWD", label: "دينار كويتي" },
];

const schema = z.object({
  code: z.string().min(1, "الكود مطلوب"),
  name: z.string().min(2, "الاسم مطلوب"),
  phoneNumber: z.string().optional(),
  email: z.string().email("إيميل غير صحيح").optional().or(z.literal("")),
  address: z.string().optional(),
  taxNumber: z.string().optional(),
  currency: z.enum(["EGP", "USD", "EUR", "GBP", "SAR", "AED", "KWD"]),
  creditLimit: z.coerce.number().min(0, "لا يمكن أن يكون سالبًا").optional(),
  isActive: z.boolean().optional(),
});

const emptyValues = {
  code: "",
  name: "",
  phoneNumber: "",
  email: "",
  address: "",
  taxNumber: "",
  currency: "EGP",
  creditLimit: 0,
  isActive: true,
};

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onSaved?: (party: Object) => void,
 *   party?: Object | null
 * }} props
 */
export default function QuickAddPartyModal({
  isOpen,
  onClose,
  onSaved,
  party = null,
}) {
  const isEdit = Boolean(party);
  const [createParty, { isLoading: isCreating }] = useCreatePartyMutation();
  const [updateParty, { isLoading: isUpdating }] = useUpdatePartyMutation();
  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      party
        ? {
            code: party.code ?? "",
            name: party.name ?? "",
            phoneNumber: party.phoneNumber ?? "",
            email: party.email ?? "",
            address: party.address ?? "",
            taxNumber: party.taxNumber ?? "",
            currency: party.currency ?? "EGP",
            creditLimit: party.creditLimit ?? 0,
            isActive: party.isActive ?? true,
          }
        : emptyValues,
    );
  }, [party, isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      const response = isEdit
        ? await updateParty({ id: party.id, ...data }).unwrap()
        : await createParty(data).unwrap();

      toast.success(
        isEdit ? "تم تحديث البيانات بنجاح" : "تم إضافة العميل/المورد بنجاح",
      );

      const savedParty = response?.data ?? response;
      onSaved?.(savedParty);
      onClose();
    } catch {
      toast.error("تعذر الحفظ، حاول مرة أخرى");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "تعديل بيانات عميل / مورد" : "إضافة عميل / مورد جديد"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="الكود"
            {...register("code")}
            error={errors.code?.message}
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
        </div>

        <Input
          label="الاسم"
          {...register("name")}
          error={errors.name?.message}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="رقم الهاتف"
            {...register("phoneNumber")}
            error={errors.phoneNumber?.message}
          />
          <Input
            label="الإيميل"
            {...register("email")}
            error={errors.email?.message}
          />
        </div>

        <Input
          label="العنوان"
          {...register("address")}
          error={errors.address?.message}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="الرقم الضريبي"
            {...register("taxNumber")}
            error={errors.taxNumber?.message}
          />
          <Input
            label="حد الائتمان"
            type="number"
            step="0.01"
            {...register("creditLimit")}
            error={errors.creditLimit?.message}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            {...register("isActive")}
            className="rounded border-ink-400/30"
          />
          نشط
        </label>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة"}
        </Button>
      </form>
    </Modal>
  );
}
