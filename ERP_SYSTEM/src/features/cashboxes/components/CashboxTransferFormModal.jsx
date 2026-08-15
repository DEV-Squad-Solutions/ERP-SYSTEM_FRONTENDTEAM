import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import {
  useCreateCashboxTransferMutation,
  useUpdateCashboxTransferMutation,
} from "../cashboxTransfersApi";

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

const emptyValues = {
  fromCashboxId: "",
  toCashboxId: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
};

/**
 * @param {{ isOpen: boolean, onClose: () => void, cashboxes: Array, transfer?: object|null, onDone?: () => void }} props
 */
export default function CashboxTransferFormModal({
  isOpen,
  onClose,
  cashboxes = [],
  transfer = null,
  onSaved,
}) {
  const isEdit = Boolean(transfer);
  const cashboxOptions = Array.isArray(cashboxes) ? cashboxes : [];

  const [createTransfer, { isLoading: isCreating }] =
    useCreateCashboxTransferMutation();
  const [updateTransfer, { isLoading: isUpdating }] =
    useUpdateCashboxTransferMutation();
  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      transfer
        ? {
            fromCashboxId: transfer.sourceCashboxId,
            toCashboxId: transfer.destinationCashboxId,
            amount: transfer.amount,
            date: transfer.transferDate?.slice(0, 10) ?? emptyValues.date,
            notes: transfer.notes ?? "",
          }
        : emptyValues,
    );
  }, [transfer, isOpen, reset]);

  const onSubmit = async (values) => {
    console.log("Submitting transfer form with values:", values);
    try {
      const saved = isEdit
        ? await updateTransfer({
            id: transfer.id,
            rowVersion: transfer.rowVersion,
            ...values,
          }).unwrap()
        : await createTransfer(values).unwrap();

      toast.success(
        isEdit ? "تم تعديل التحويل بنجاح" : "تم التحويل بين الخزائن بنجاح",
      );
      onSaved?.(saved);
      onClose();
    } catch (err) {}
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "تعديل تحويل" : "تحويل بين الخزائن"}
    >
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
            {isLoading
              ? "جاري الحفظ..."
              : isEdit
                ? "حفظ التعديلات"
                : "تنفيذ التحويل"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
