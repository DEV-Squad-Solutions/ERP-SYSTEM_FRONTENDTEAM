import { useState } from "react";
import { toast } from "sonner";
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";

import { useCreateCashVoucherMutation } from "../cashVouchersApi";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

function emptyForm() {
  return {
    voucherDate: new Date().toISOString().slice(0, 10),
    direction: "Receipt",
    amount: "",
    description: "",
  };
}

/**
 * ينشئ سند Draft فقط — بدون رقم سند، بدون توصيف، بدون طرف.
 * التوصيف والطرف وسعر الصرف بيتحددوا لاحقًا عن طريق تعديل السند (PUT).
 *
 * @param {{ isOpen: boolean, onClose: () => void, cashboxId: string, onCreated?: () => void }} props
 */
export default function CashVoucherFormModal({
  isOpen,
  onClose,
  cashboxId,
  onCreated,
}) {
  const [createVoucher, { isLoading }] = useCreateCashVoucherMutation();
  const [form, setForm] = useState(emptyForm());

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Number(form.amount) || Number(form.amount) <= 0) {
      toast.error("أدخل مبلغ أكبر من صفر");
      return;
    }

    try {
      await createVoucher({
        voucherDate: form.voucherDate,
        direction: form.direction,
        cashboxId,
        amount: Number(form.amount),
        description: form.description || undefined,
      }).unwrap();

      toast.success(
        form.direction === "Receipt"
          ? "تم تسجيل سند القبض (مسودة) — أكمل التوصيف بعدين"
          : "تم تسجيل سند الصرف (مسودة) — أكمل التوصيف بعدين",
      );

      setForm(emptyForm());
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(err?.data?.detail || "حدث خطأ أثناء حفظ السند");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="سند جديد">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="inline-flex w-full rounded-xl bg-ink-400/5 p-1">
          <button
            type="button"
            onClick={() => set("direction", "Receipt")}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors ${
              form.direction === "Receipt"
                ? "bg-white font-medium text-positive shadow-sm"
                : "text-ink-400"
            }`}
          >
            <ArrowDownCircle size={15} />
            استلام (قبض)
          </button>
          <button
            type="button"
            onClick={() => set("direction", "Payment")}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors ${
              form.direction === "Payment"
                ? "bg-white font-medium text-negative shadow-sm"
                : "text-ink-400"
            }`}
          >
            <ArrowUpCircle size={15} />
            صرف (دفع)
          </button>
        </div>

        <Input
          label="التاريخ"
          type="date"
          value={form.voucherDate}
          onChange={(e) => set("voucherDate", e.target.value)}
        />

        <Input
          label="المبلغ"
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(e) => set("amount", e.target.value)}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900">
            البيان (اختياري)
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            placeholder="مثال: استلام دفعة تحت حساب"
            className="w-full rounded-xl border border-ink-400/15 bg-white px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>

        <p className="text-xs text-ink-400">
          رقم السند بيتولد تلقائيًا من السيرفر. التوصيف (نوع الحركة والطرف) وسعر
          الصرف بيتحددوا بعدين من زر التعديل في الكشف.
        </p>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
          حفظ السند
        </Button>
      </form>
    </Modal>
  );
}
