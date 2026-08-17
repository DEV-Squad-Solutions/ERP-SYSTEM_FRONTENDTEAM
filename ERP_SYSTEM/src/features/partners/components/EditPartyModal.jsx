import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

import { useUpdatePartyMutation } from "../partiesApi";

const CURRENCIES = [
  { value: "EGP", label: "جنيه مصري" },
  { value: "USD", label: "دولار أمريكي" },
  { value: "EUR", label: "يورو" },
  { value: "GBP", label: "جنيه إسترليني" },
  { value: "SAR", label: "ريال سعودي" },
  { value: "AED", label: "درهم إماراتي" },
  { value: "KWD", label: "دينار كويتي" },
];

const editPartySchema = z.object({
  name: z.string().trim().min(2, "اسم الشريك مطلوب"),

  email: z
    .string()
    .trim()
    .email("البريد الإلكتروني غير صحيح")
    .or(z.literal("")),

  currency: z.enum(["EGP", "USD", "EUR", "GBP", "SAR", "AED", "KWD"]),

  address: z.string().optional(),

  phoneNumber: z.string().optional(),

  taxNumber: z.string().optional(),

  creditLimit: z.union([z.coerce.number().min(0), z.literal("")]).optional(),

  isActive: z.boolean(),
});

const DEFAULT_VALUES = {
  name: "",
  email: "",
  currency: "EGP",
  address: "",
  phoneNumber: "",
  taxNumber: "",
  creditLimit: "",
  isActive: true,
};

export default function EditPartyModal({ isOpen, onClose, party }) {
  const [updateParty, { isLoading }] = useUpdatePartyMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editPartySchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!party || !isOpen) return;

    reset({
      name: party.name ?? "",
      email: party.email ?? "",
      currency: party.currency ?? "EGP",
      address: party.address ?? "",
      phoneNumber: party.phoneNumber ?? "",
      taxNumber: party.taxNumber ?? "",
      creditLimit: party.creditLimit ?? "",
      isActive: party.isActive ?? true,
    });
  }, [party, isOpen, reset]);

  const handleClose = () => {
    reset(DEFAULT_VALUES);
    onClose?.();
  };

  const onSubmit = async (data) => {
    if (!party?.id) return;

    try {
      await updateParty({
        id: party.id,
        ...data,
        creditLimit: data.creditLimit === "" ? null : Number(data.creditLimit),
      }).unwrap();

      toast.success("تم تعديل الشريك بنجاح");

      handleClose();
    } catch (error) {
      toast.error(
        error?.data?.message || error?.data?.title || "تعذر تعديل الشريك",
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="تعديل الشريك" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* اسم الشريك */}
        <Input
          label="اسم الشريك"
          {...register("name")}
          error={errors.name?.message}
        />

        {/* البريد الإلكتروني */}
        <Input
          label="البريد الإلكتروني"
          type="email"
          placeholder="example@email.com"
          {...register("email")}
          error={errors.email?.message}
        />

        {/* العملة */}
        <div>
          <label className="mb-1.5 block text-xs text-ink-500">العملة</label>

          <select
            {...register("currency")}
            className="w-full rounded-xl border border-ink-400/15 bg-white px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.value} value={currency.value}>
                {currency.label}
              </option>
            ))}
          </select>

          {errors.currency?.message && (
            <p className="mt-1 text-xs text-red-500">
              {errors.currency.message}
            </p>
          )}
        </div>

        {/* رقم الهاتف */}
        <Input
          label="رقم الهاتف"
          {...register("phoneNumber")}
          error={errors.phoneNumber?.message}
        />

        {/* الرقم الضريبي */}
        <Input
          label="الرقم الضريبي"
          {...register("taxNumber")}
          error={errors.taxNumber?.message}
        />

        {/* العنوان */}
        <Input
          label="العنوان"
          {...register("address")}
          error={errors.address?.message}
        />

        {/* حد الائتمان */}
        <Input
          label="حد الائتمان"
          type="number"
          min="0"
          {...register("creditLimit")}
          error={errors.creditLimit?.message}
        />

        {/* الحالة */}
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" {...register("isActive")} />

          <span>الشريك نشط</span>
        </label>

        {/* الأزرار */}
        <div className="flex gap-3 pt-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            إلغاء
          </Button>

          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
