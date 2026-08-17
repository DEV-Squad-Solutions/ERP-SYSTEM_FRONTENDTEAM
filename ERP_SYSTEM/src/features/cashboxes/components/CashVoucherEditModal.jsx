import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";

import { useGetCashMovementTypeOptionsQuery } from "../cashMovementTypesApi";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import CompactSelect from "../../../shared/components/ui/CompactSelect";

const PARTY_TYPES = [
  { value: "None", label: "بدون طرف" },
  { value: "Partner", label: "عميل / مورد" },
  { value: "Driver", label: "سائق" },
  { value: "Other", label: "طرف آخر" },
];

/**
 * مودال تعديل سند كامل — يعدّل: المبلغ، الاتجاه، التاريخ، التوصيف (نوع الحركة + الطرف)،
 * البيان، الملاحظات، وسعر الصرف عند الحاجة. يبعت rowVersion دايمًا.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onSave: (payload: object) => Promise<void>,
 *   voucher: object | null,
 *   isForeign: boolean,
 *   currency: string,
 *   baseCurrency: string,
 *   partyOptions: Array<{id: string|number, name: string}>,
 *   driverOptions: Array<{id: string|number, name: string}>,
 * }} props
 */
export default function CashVoucherEditModal({
  isOpen,
  onClose,
  onSave,
  voucher,
  isForeign,
  currency,
  baseCurrency,
  partyOptions = [],
  driverOptions = [],
}) {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    voucherDate: "",
    direction: "Receipt",
    amount: "",
    exchangeRate: "1",
    partyType: "None",
    movementTypeId: "",
    businessPartnerId: "",
    driverId: "",
    externalPartyName: "",
    description: "",
    notes: "",
    referenceNumber: "",
  });

  useEffect(() => {
    if (!isOpen || !voucher) return;

    setForm({
      voucherDate: voucher.voucherDate || new Date().toISOString().slice(0, 10),
      direction: voucher.direction || "Receipt",
      amount: voucher.amount ?? "",
      exchangeRate: String(voucher.exchangeRate ?? voucher.rate ?? 1),
      partyType: voucher.partyType || "None",
      movementTypeId: voucher.cashMovementTypeId
        ? String(voucher.cashMovementTypeId)
        : "",
      businessPartnerId: voucher.businessPartnerId
        ? String(voucher.businessPartnerId)
        : "",
      driverId: voucher.driverId ? String(voucher.driverId) : "",
      externalPartyName: voucher.externalPartyName || "",
      description: voucher.description || "",
      notes: voucher.notes || "",
      referenceNumber: voucher.referenceNumber || "",
    });
  }, [isOpen, voucher]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const forPartner = useMemo(
    () => form.partyType === "Partner",
    [form.partyType],
  );

  const { data: movementTypeOptions = [], isFetching: loadingTypes } =
    useGetCashMovementTypeOptionsQuery(
      { direction: form.direction, forPartner },
      { skip: !isOpen },
    );

  // لو نوع الحركة الحالي مش موجود في القائمة الجديدة (بعد تغيير الاتجاه/الطرف) نصفّره
  useEffect(() => {
    if (!form.movementTypeId) return;

    const exists = movementTypeOptions.some(
      (type) => String(type.id) === String(form.movementTypeId),
    );

    if (!exists) {
      set("movementTypeId", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movementTypeOptions]);

  const movementSelectOptions = useMemo(
    () =>
      movementTypeOptions.map((type) => ({
        value: String(type.id),
        label: `${type.name} — ${type.direction === "Receipt" ? "وارد" : "صادر"}`,
      })),
    [movementTypeOptions],
  );

  const partnerSelectOptions = useMemo(
    () => partyOptions.map((p) => ({ value: String(p.id), label: p.name })),
    [partyOptions],
  );

  const driverSelectOptions = useMemo(
    () => driverOptions.map((d) => ({ value: String(d.id), label: d.name })),
    [driverOptions],
  );

  const handlePartyTypeChange = (value) => {
    setForm((f) => ({
      ...f,
      partyType: value,
      businessPartnerId: "",
      driverId: "",
      externalPartyName: "",
    }));
  };

  const canSave =
    Number(form.amount) > 0 &&
    (!isForeign || Number(form.exchangeRate) > 0) &&
    (form.partyType !== "Partner" || Boolean(form.businessPartnerId)) &&
    (form.partyType !== "Driver" || Boolean(form.driverId)) &&
    (form.partyType !== "Other" || Boolean(form.externalPartyName.trim()));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSave || !voucher) return;

    setSaving(true);

    try {
      await onSave({
        voucherDate: form.voucherDate,
        direction: form.direction,
        amount: Number(form.amount),
        ...(isForeign && { exchangeRate: Number(form.exchangeRate) }),
        cashMovementTypeId: form.movementTypeId || null,
        partyType: form.partyType,
        businessPartnerId:
          form.partyType === "Partner" ? form.businessPartnerId : null,
        driverId: form.partyType === "Driver" ? form.driverId : null,
        externalPartyName:
          form.partyType === "Other" ? form.externalPartyName.trim() : null,
        description: form.description?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
        referenceNumber: form.referenceNumber?.trim() || undefined,
      });

      onClose();
    } catch (err) {
      toast.error(err?.data?.detail || "فشل حفظ تعديل السند");
    } finally {
      setSaving(false);
    }
  }

  if (!voucher) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`تعديل السند ${voucher.voucherNumber ?? ""}`}
      wide
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* استلام / صرف */}
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="التاريخ"
            type="date"
            value={form.voucherDate}
            onChange={(e) => set("voucherDate", e.target.value)}
          />
          <Input
            label={`المبلغ (${currency})`}
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
          />
        </div>

        {isForeign && (
          <div>
            <Input
              label={`سعر الصرف مقابل ${baseCurrency}`}
              type="number"
              min="0"
              step="0.0001"
              value={form.exchangeRate}
              onChange={(e) => set("exchangeRate", e.target.value)}
            />
            <p className="mt-1 text-xs text-ink-400">
              المقابل بالمصري بيتحسب في السيرفر وقت الحفظ.
            </p>
          </div>
        )}

        {/* نوع الطرف */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900">
            نوع الطرف
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PARTY_TYPES.map((party) => (
              <button
                key={party.value}
                type="button"
                onClick={() => handlePartyTypeChange(party.value)}
                className={`rounded-xl border px-3 py-2.5 text-sm transition ${
                  form.partyType === party.value
                    ? "border-emerald-600 bg-emerald-50 font-medium text-emerald-800"
                    : "border-gold/30 bg-white text-ink/70 hover:border-gold/50"
                }`}
              >
                {party.label}
              </button>
            ))}
          </div>
        </div>

        {form.partyType === "Partner" && (
          <CompactSelect
            options={partnerSelectOptions}
            value={form.businessPartnerId}
            onChange={(v) => set("businessPartnerId", v || "")}
            placeholder="اختر العميل / المورد"
          />
        )}

        {form.partyType === "Driver" && (
          <CompactSelect
            options={driverSelectOptions}
            value={form.driverId}
            onChange={(v) => set("driverId", v || "")}
            placeholder="اختر السائق"
          />
        )}

        {form.partyType === "Other" && (
          <Input
            label="اسم الطرف"
            value={form.externalPartyName}
            onChange={(e) => set("externalPartyName", e.target.value)}
          />
        )}

        {/* التوصيف */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900">
            نوع الحركة (التوصيف)
          </label>
          <CompactSelect
            options={movementSelectOptions}
            value={form.movementTypeId}
            onChange={(v) => set("movementTypeId", v || "")}
            isLoading={loadingTypes}
            isDisabled={loadingTypes}
            placeholder={
              loadingTypes ? "جاري تحميل أنواع الحركة..." : "بدون توصيف"
            }
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900">
            البيان
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-ink-400/15 bg-white px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900">
            ملاحظات
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-ink-400/15 bg-white px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>

        <Input
          label="رقم مرجعي (اختياري)"
          value={form.referenceNumber}
          onChange={(e) => set("referenceNumber", e.target.value)}
        />

        <div className="flex justify-end gap-2 border-t border-ink-400/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-ink-400/15 px-4 py-2 text-sm text-ink-700 transition hover:bg-ink-400/5"
          >
            إلغاء
          </button>

          <Button type="submit" disabled={!canSave || saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            حفظ التعديلات
          </Button>
        </div>
      </form>
    </Modal>
  );
}
