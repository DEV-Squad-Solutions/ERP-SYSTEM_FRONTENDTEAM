import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";
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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount) return;

    try {
      await addTransaction({
        ...form,
        amount: Number(form.amount),
      }).unwrap();
      onClose();
      setForm({ type: "in", amount: "", category: "", partyName: "", referenceNumber: "", notes: "" });
    } catch (err) {
      console.error("فشل إضافة الحركة:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeUp">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-400/10 bg-ink-900/[0.02]">
          <h3 className="font-display font-bold text-ink-900">حركة خزنة جديدة</h3>
          <button onClick={onClose} className="p-1 text-ink-400 hover:text-ink-900">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-ink-600 mb-1 block">نوع الحركة</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-lg border border-ink-400/15 px-3 py-2 text-sm focus:outline-none focus:border-primary-500 bg-white"
              >
                <option value="in">إيداع (تحصيل)</option>
                <option value="out">صرف (مصروف)</option>
              </select>
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
      </div>
    </div>
  );
}