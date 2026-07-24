import { useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import { useAddTransactionMutation } from "../treasuryApi";

export default function NewTransactionModal({ isOpen, onClose }) {
  const [addTransaction, { isLoading }] = useAddTransactionMutation();
  const [form, setForm] = useState({
    type: "in",
    amount: "",
    category: "",
    partyName: "",
    referenceNumber: "",
    notes: "",
  });

  const typeOptions = [
        { value: "out", label: "صرف (مصروف)" },
    { value: "in", label: "إيداع (تحصيل)" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount) return;

    try {
      await addTransaction({
        ...form,
        amount: Number(form.amount),
      }).unwrap();
      onClose();
      setForm({
        type: "in",
        amount: "",
        category: "",
        partyName: "",
        referenceNumber: "",
        notes: "",
      });
    } catch (err) {
      console.error("فشل إضافة الحركة:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="حركة خزنة جديدة">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3 items-end">
          <div>
            <label className="text-xs font-medium text-ink-600 mb-1.5 block">
              نوع الحركة
            </label>
            <CompactSelect
              options={typeOptions}
              value={form.type}
              onChange={(val) => setForm({ ...form, type: val })}
              placeholder="اختر النوع"
            />
          </div>
          <Input
            label="المبلغ"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
        </div>

        <Input
          label="البيان / التصنيف"
          placeholder="مثال: تحصيل فاتورة / مصاريف صيانة"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <Input
          label="الجهة / الاسم"
          value={form.partyName}
          onChange={(e) => setForm({ ...form, partyName: e.target.value })}
        />

        <Input
          label="رقم المرجع / الفاتورة"
          value={form.referenceNumber}
          onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : "حفظ الحركة"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}