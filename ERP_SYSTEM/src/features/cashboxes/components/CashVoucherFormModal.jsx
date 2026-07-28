import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";
import { useCreateCashVoucherMutation } from "../cashVouchersApi";
import { useGetCashMovementTypeOptionsQuery } from "../cashMovementTypesApi";
import { useGetPartiesSelectQuery } from "../../partners/partiesApi";
import { useGetDriversSelectQuery } from "../../drivers/driversApi";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import CompactSelect from "../../../shared/components/ui/CompactSelect";

const partyTypeOptions = [
  { value: "None", label: "بدون طرف" },
  { value: "Partner", label: "عميل / مورد" },
  { value: "Driver", label: "سائق" },
  { value: "Other", label: "جهة أخرى" },
];

/**
 * @param {{ isOpen: boolean, onClose: () => void, cashboxId: string, onCreated?: () => void }} props
 */
export default function CashVoucherFormModal({
  isOpen,
  onClose,
  cashboxId,
  onCreated,
}) {
  const [createVoucher, { isLoading }] = useCreateCashVoucherMutation();
  const { data: parties } = useGetPartiesSelectQuery();
  const { data: drivers } = useGetDriversSelectQuery();

  const [form, setForm] = useState({
    voucherNumber: "",
    voucherDate: new Date().toISOString().slice(0, 10),
    direction: "Receipt", // استلام افتراضيًا
    partyType: "None",
    businessPartnerId: "",
    driverId: "",
    externalPartyName: "",
    amount: "",
    referenceNumber: "",
    description: "", // البيان الحر — المحاسب بيكتبه بنفسه
    notes: "",
    cashMovementTypeId: "",
  });

  const { data: movementTypes, isLoading: isLoadingTypes } =
    useGetCashMovementTypeOptionsQuery({
      direction: form.direction,
      forPartner: form.partyType === "Partner",
    });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // كل ما تتغير الجهة (استلام/صرف) أو نوع الطرف، نصفّر نوع الحركة عشان يتختار من القائمة الجديدة
  useEffect(() => {
    set("cashMovementTypeId", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.direction, form.partyType]);

  const resetForm = () => {
    setForm({
      voucherNumber: "",
      voucherDate: new Date().toISOString().slice(0, 10),
      direction: "Receipt",
      partyType: "None",
      businessPartnerId: "",
      driverId: "",
      externalPartyName: "",
      amount: "",
      referenceNumber: "",
      description: "",
      notes: "",
      cashMovementTypeId: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.voucherNumber ||
      !form.cashMovementTypeId ||
      !Number(form.amount) ||
      Number(form.amount) <= 0
    ) {
      toast.error("أدخل رقم السند ونوع الحركة ومبلغ أكبر من صفر");
      return;
    }
    if (!form.description) {
      toast.error("اكتب البيان — وصف الحركة مهم لمراجعة الخزنة لاحقًا");
      return;
    }

    try {
      await createVoucher({
        voucherNumber: form.voucherNumber,
        voucherDate: form.voucherDate,
        direction: form.direction,
        cashboxId,
        cashMovementTypeId: form.cashMovementTypeId,
        partyType: form.partyType,
        businessPartnerId:
          form.partyType === "Partner" ? form.businessPartnerId : null,
        driverId: form.partyType === "Driver" ? form.driverId : null,
        externalPartyName:
          form.partyType === "Other" ? form.externalPartyName : null,
        amount: Number(form.amount),
        referenceNumber: form.referenceNumber,
        description: form.description,
        notes: form.notes,
      }).unwrap();

      toast.success(
        form.direction === "Receipt"
          ? "تم تسجيل سند القبض بنجاح"
          : "تم تسجيل سند الصرف بنجاح",
      );
      resetForm();
      onCreated?.();
      onClose();
    } catch (err) {
      console.error("فشل حفظ السند:", err);
      toast.error(err?.data?.detail || "حدث خطأ أثناء حفظ السند");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="سند جديد" wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* استلام / صرف */}
        <div className="inline-flex bg-ink-400/5 rounded-xl p-1 w-full">
          <button
            type="button"
            onClick={() => set("direction", "Receipt")}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm rounded-lg transition-colors ${
              form.direction === "Receipt"
                ? "bg-white text-positive font-medium shadow-sm"
                : "text-ink-400"
            }`}
          >
            <ArrowDownCircle size={15} />
            استلام (قبض)
          </button>
          <button
            type="button"
            onClick={() => set("direction", "Payment")}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm rounded-lg transition-colors ${
              form.direction === "Payment"
                ? "bg-white text-negative font-medium shadow-sm"
                : "text-ink-400"
            }`}
          >
            <ArrowUpCircle size={15} />
            صرف (دفع)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="رقم السند"
            value={form.voucherNumber}
            onChange={(e) => set("voucherNumber", e.target.value)}
          />
          <Input
            label="التاريخ"
            type="date"
            value={form.voucherDate}
            onChange={(e) => set("voucherDate", e.target.value)}
          />
        </div>

        {/* الطرف المرتبط (اختياري) */}
        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            مرتبط بـ
          </label>
          <CompactSelect
            options={partyTypeOptions}
            value={form.partyType}
            onChange={(v) => set("partyType", v)}
            placeholder="اختر"
          />
        </div>

        {form.partyType === "Partner" && (
          <CompactSelect
            options={
              parties?.map((p) => ({ value: p.id, label: p.name })) || []
            }
            value={form.businessPartnerId}
            onChange={(v) => set("businessPartnerId", v)}
            placeholder="اختر العميل أو المورد"
          />
        )}
        {form.partyType === "Driver" && (
          <CompactSelect
            options={
              drivers?.map((d) => ({ value: d.id, label: d.name })) || []
            }
            value={form.driverId}
            onChange={(v) => set("driverId", v)}
            placeholder="اختر السائق"
          />
        )}
        {form.partyType === "Other" && (
          <Input
            label="اسم الجهة"
            value={form.externalPartyName}
            onChange={(e) => set("externalPartyName", e.target.value)}
          />
        )}
        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            نوع الحركة
          </label>
          <CompactSelect
            options={
              movementTypes?.map((t) => ({ value: t.id, label: t.name })) || []
            }
            value={form.cashMovementTypeId}
            onChange={(v) => set("cashMovementTypeId", v)}
            isLoading={isLoadingTypes}
            placeholder="اختر نوع الحركة"
          />
        </div>
        <Input
          label="المبلغ"
          type="number"
          value={form.amount}
          onChange={(e) => set("amount", e.target.value)}
        />

        {/* البيان الحر — دي أهم خانة، المحاسب بيوصف الحركة بنفسه */}
        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            البيان <span className="text-negative">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            placeholder="مثال: استلام دفعة من العميل أحمد تحت حساب فاتورة SAL-2021"
            className="w-full rounded-xl border border-ink-400/15 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            ملاحظات
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-ink-400/15 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-500"
          />
        </div>

        <Input
          label="رقم مرجعي (اختياري)"
          value={form.referenceNumber}
          onChange={(e) => set("referenceNumber", e.target.value)}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
          حفظ السند
        </Button>
      </form>
    </Modal>
  );
}
