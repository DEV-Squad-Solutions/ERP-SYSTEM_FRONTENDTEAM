import { useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import { useAddBankTransactionMutation } from "../bankApi";

export default function NewBankTransactionModal({ isOpen, onClose }) {
  const [addBankTransaction, { isLoading }] = useAddBankTransactionMutation();
  const [form, setForm] = useState({
    type: "in",
    amount: "",
    bankName: "",
    accountNumber: "",
    category: "",
    partyName: "",
    referenceNumber: "",
    notes: "",
  });

  const typeOptions = [
    { value: "in", label: "إيداع / تحويل وارد" },
    { value: "out", label: "تحويل صادر / سداد" },
  ];

  const fieldInputCls =
    "w-full h-[38px] rounded-lg border border-ink-400/15 px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-shadow placeholder:text-ink-400/50";

  const fieldLabelCls = "text-xs font-medium text-ink-600 mb-1.5 block";

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.bankName) return;

    try {
      await addBankTransaction({
        ...form,
        amount: Number(form.amount),
      }).unwrap();
      onClose();
      setForm({
        type: "in",
        amount: "",
        bankName: "",
        accountNumber: "",
        category: "",
        partyName: "",
        referenceNumber: "",
        notes: "",
      });
    } catch (err) {
      console.error("فشل إضافة المعاملة البنكية:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="معاملة بنكية جديدة">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        
        <div className="grid grid-cols-2 gap-3 items-start">
          <div className="w-full">
            <label className={fieldLabelCls}>نوع المعاملة</label>
            <CompactSelect
              options={typeOptions}
              value={form.type}
              onChange={(val) => setField("type", val)}
              placeholder="اختر النوع"
            />
          </div>

          <div className="w-full">
            <label className={fieldLabelCls}>المبلغ</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setField("amount", e.target.value)}
              className={fieldInputCls}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 items-start">
          <div className="w-full">
            <label className={fieldLabelCls}>اسم البنك</label>
            <input
              type="text"
              value={form.bankName}
              onChange={(e) => setField("bankName", e.target.value)}
              className={fieldInputCls}
              placeholder="مثال: البنك الأهلي المصري"
              required
            />
          </div>

          <div className="w-full">
            <label className={fieldLabelCls}>رقم الحساب / IBAN</label>
            <input
              type="text"
              value={form.accountNumber}
              onChange={(e) => setField("accountNumber", e.target.value)}
              className={fieldInputCls}
              placeholder="اختر أو ادخل رقم الحساب"
            />
          </div>
        </div>

        <div>
          <label className={fieldLabelCls}>البيان / التصنيف</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => setField("category", e.target.value)}
            className={fieldInputCls}
            placeholder="مثال: تحويل بنكي / سداد شيك"
          />
        </div>

        <div>
          <label className={fieldLabelCls}>الجهة / اسم العميل أو المورد</label>
          <input
            type="text"
            value={form.partyName}
            onChange={(e) => setField("partyName", e.target.value)}
            className={fieldInputCls}
            placeholder="اسم الجهة المتعامل معها"
          />
        </div>

        <div>
          <label className={fieldLabelCls}>رقم المرجع / الشيك</label>
          <input
            type="text"
            value={form.referenceNumber}
            onChange={(e) => setField("referenceNumber", e.target.value)}
            className={fieldInputCls}
            placeholder="رقم الإيصال أو التحويل"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : "حفظ المعاملة"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}