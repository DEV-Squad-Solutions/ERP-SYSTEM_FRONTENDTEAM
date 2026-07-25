import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Modal from "../../../shared/components/ui/Modal";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import { 
  useAddBankTransactionMutation, 
  useUpdateBankTransactionMutation 
} from "../bankApi";
import { useGetPartiesSelectQuery } from "../../partners/partiesApi";

export default function NewBankTransactionModal({ isOpen, onClose, editData = null }) {
  const [addTransaction, { isLoading: isAdding }] = useAddBankTransactionMutation();
  const [updateTransaction, { isLoading: isUpdating }] = useUpdateBankTransactionMutation();
  const { data: partiesData = [], isLoading: isPartiesLoading } = useGetPartiesSelectQuery();

  const isLoading = isAdding || isUpdating;
  const isEditMode = Boolean(editData?.id);

  // خيارات قائمة الأطراف/الحسابات
  const partyOptions = partiesData?.map((p) => ({
    value: String(p.id || p.value),
    label: p.name || p.label || p.text,
  })) || [];

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    partyId: "",
    debit: "",
    credit: "",
    notes: "",
  });

  // تعبئة البيانات فور التعديل أو التصفير فور الإغلاق
  useEffect(() => {
    if (editData && isOpen) {
      setForm({
        date: editData.date || new Date().toISOString().split("T")[0],
        partyId: String(editData.partyId || editData.partnerId || ""),
        debit: editData.debit || editData.amountIn ? String(editData.debit || editData.amountIn) : "",
        credit: editData.credit || editData.amountOut ? String(editData.credit || editData.amountOut) : "",
        notes: editData.notes || "",
      });
    } else if (!isOpen) {
      setForm({
        date: new Date().toISOString().split("T")[0],
        partyId: "",
        debit: "",
        credit: "",
        notes: "",
      });
    }
  }, [editData, isOpen]);

  const fieldInputCls =
    "w-full h-[38px] rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-shadow placeholder:text-slate-400";
  const fieldLabelCls = "text-xs font-semibold text-slate-700 mb-1 block";

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.partyId) {
      alert("يرجى اختيار اسم الحساب");
      return;
    }

    const debitVal = Number(form.debit) || 0;
    const creditVal = Number(form.credit) || 0;

    if (debitVal === 0 && creditVal === 0) {
      alert("يرجى إدخال مبلغ في إيداع (مدين) أو تحويل (دائن)");
      return;
    }

    try {
      const selectedParty = partyOptions.find((p) => String(p.value) === String(form.partyId));

      const payload = {
        date: form.date,
        partyId: form.partyId,
        partnerId: form.partyId,
        partyName: selectedParty?.label || "",
        type: debitVal > 0 ? "in" : "out",
        debit: debitVal,
        credit: creditVal,
        amountIn: debitVal,
        amountOut: creditVal,
        notes: form.notes,
      };

      if (isEditMode) {
        await updateTransaction({ id: editData.id, ...payload }).unwrap();
      } else {
        await addTransaction(payload).unwrap();
      }

      onClose();
    } catch (err) {
      console.error("فشل تنفيذ عملية البنك:", err);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditMode ? "تعديل حركة بنكية" : "حركة بنكية جديدة"}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* التاريخ */}
        <div>
          <label className={fieldLabelCls}>التاريخ</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setField("date", e.target.value)}
            className={fieldInputCls}
            required
          />
        </div>

        {/* اسم الحساب */}
        <div>
          <label className={fieldLabelCls}>اسم الحساب (العميل / المورد)</label>
          <CompactSelect
            options={partyOptions}
            value={form.partyId}
            onChange={(val) => setField("partyId", val)}
            placeholder={isPartiesLoading ? "جاري التحميل..." : "اختر الحساب..."}
          />
        </div>

        {/* مدين / دائن */}
        <div className="grid grid-cols-2 gap-3 items-start">
          <div>
            <label className={`${fieldLabelCls} text-positive`}>إيداع بنكي (مدين)</label>
            <input
              type="number"
              step="any"
              value={form.debit}
              onChange={(e) => {
                setField("debit", e.target.value);
                if (e.target.value) setField("credit", "");
              }}
              className={`${fieldInputCls} focus:border-positive`}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className={`${fieldLabelCls} text-negative`}>سحب / تحويل (دائن)</label>
            <input
              type="number"
              step="any"
              value={form.credit}
              onChange={(e) => {
                setField("credit", e.target.value);
                if (e.target.value) setField("debit", "");
              }}
              className={`${fieldInputCls} focus:border-negative`}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* الملاحظات */}
        <div>
          <label className={fieldLabelCls}>الملاحظات / رقم المرجع البنكي</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-shadow placeholder:text-slate-400"
            placeholder="اكتب تفاصيل المعاملة البنكية..."
          />
        </div>

        {/* الأزرار */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm hover:bg-slate-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : (isEditMode ? "تعديل الحركة" : "حفظ الحركة")}
          </button>
        </div>
      </form>
    </Modal>
  );
}