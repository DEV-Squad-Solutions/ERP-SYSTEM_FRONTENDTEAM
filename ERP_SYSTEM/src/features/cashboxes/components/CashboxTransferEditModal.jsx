import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import { useUpdateCashboxTransferMutation } from "../cashboxTransfersApi";

const schema = z
  .object({
    fromCashboxId: z.coerce.number({
      invalid_type_error: "اختر الخزنة المحوّل منها",
    }),
    toCashboxId: z.coerce.number({
      invalid_type_error: "اختر الخزنة المحوّل إليها",
    }),
    amount: z.coerce
      .number({ invalid_type_error: "أدخل مبلغ صحيح" })
      .positive("المبلغ لازم يكون أكبر من صفر"),
    date: z.string().min(1, "التاريخ مطلوب"),
    notes: z.string().optional(),
  })
  .refine((data) => data.fromCashboxId !== data.toCashboxId, {
    message: "لا يمكن التحويل لنفس الخزنة",
    path: ["toCashboxId"],
  });

/**
 * @param {{ isOpen: boolean, onClose: () => void, cashboxes: Array, transfer: object|null, onDone?: () => void }} props
 */
export default function CashboxTransferEditModal({
  isOpen,
  onClose,
  cashboxes,
  transfer,
  onDone,
}) {
  const cashboxOptions = Array.isArray(cashboxes) ? cashboxes : [];

  const [updateTransfer, { isLoading }] = useUpdateCashboxTransferMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    values: transfer
      ? {
          fromCashboxId: transfer.sourceCashboxId,
          toCashboxId: transfer.destinationCashboxId,
          amount: transfer.amount,
          date: transfer.transferDate?.slice(0, 10),
          notes: transfer.notes ?? "",
        }
      : undefined,
  });

  const onSubmit = async (values) => {
    try {
      await updateTransfer({
        id: transfer.id,
        rowVersion: transfer.rowVersion,
        ...values,
      }).unwrap();
      toast.success("تم تعديل التحويل بنجاح");
      onDone?.();
      onClose();
    } catch (err) {
      const message = err?.data?.message ?? err?.data?.detail;
      toast.error(message ?? "تعذر تعديل التحويل");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تعديل تحويل">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          control={control}
          name="fromCashboxId"
          render={({ field }) => (
            <div>
              <label className="mb-1 block text-sm font-medium">من خزنة</label>
              <select {...field} className="w-full rounded-lg border px-3 py-2">
                <option value="">اختر الخزنة</option>
                {cashboxOptions.map((cb) => (
                  <option key={cb.id} value={cb.id}>
                    {cb.name} ({cb.code}) —{" "}
                    {cb.currentBalance?.toLocaleString("ar-EG")} {cb.currency}
                  </option>
                ))}
              </select>
              {errors.fromCashboxId && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.fromCashboxId.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          control={control}
          name="toCashboxId"
          render={({ field }) => (
            <div>
              <label className="mb-1 block text-sm font-medium">إلى خزنة</label>
              <select {...field} className="w-full rounded-lg border px-3 py-2">
                <option value="">اختر الخزنة</option>
                {cashboxOptions.map((cb) => (
                  <option key={cb.id} value={cb.id}>
                    {cb.name} ({cb.code}) —{" "}
                    {cb.currentBalance?.toLocaleString("ar-EG")} {cb.currency}
                  </option>
                ))}
              </select>
              {errors.toCashboxId && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.toCashboxId.message}
                </p>
              )}
            </div>
          )}
        />

        <Input
          label="المبلغ"
          type="number"
          step="0.01"
          error={errors.amount?.message}
          {...register("amount")}
        />

        <Input
          label="التاريخ"
          type="date"
          error={errors.date?.message}
          {...register("date")}
        />

        <Input
          label="ملاحظات (اختياري)"
          placeholder="..."
          {...register("notes")}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
