// src/features/cashboxes/components/ExpenseQuickEntryModal.jsx

import { useState, useEffect, useMemo } from "react";

import { useGetCashboxesQuery } from "../cashboxesApi";
import { useGetCashMovementTypeOptionsQuery } from "../cashMovementTypesApi";
import { useCreateCashVoucherMutation } from "../cashVouchersApi";
import { useGetPartiesSelectQuery } from "../../partners/partiesApi";
import { useGetDriversSelectQuery } from "../../drivers/driversApi";
import { useGetEmployeesSelectQuery } from "../../payroll/payrollApi";

import Modal from "../../../shared/components/ui/Modal";
import CompactSelect from "../../../shared/components/ui/CompactSelect";

const PARTY_TYPES = [
  { value: "None", label: "بدون طرف" },
  { value: "Partner", label: "عميل / مورد" },
  { value: "Driver", label: "سائق" },
  { value: "Employee", label: "موظف" },
  { value: "Other", label: "طرف آخر" },
];

const emptyForm = {
  voucherDate: new Date().toISOString().slice(0, 10),
  cashboxId: "",
  cashMovementTypeId: "",
  partyType: "None",
  businessPartnerId: "",
  driverId: "",
  employeeId: "",
  externalPartyName: "",
  amount: "",
  referenceNumber: "",
  description: "",
  notes: "",
  exchangeRate: "",
};

export default function ExpenseQuickEntryModal({ isOpen, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (isOpen) setForm(emptyForm);
  }, [isOpen]);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // =========================================================
  // مصادر البيانات
  // =========================================================

  const { data: cashboxesData } = useGetCashboxesQuery(undefined, {
    skip: !isOpen,
  });

  const cashboxes = Array.isArray(cashboxesData)
    ? cashboxesData
    : (cashboxesData?.items ?? []);

  const selectedCashbox = useMemo(
    () => cashboxes.find((c) => String(c.id) === String(form.cashboxId)),
    [cashboxes, form.cashboxId],
  );

  const isForeignCurrency =
    selectedCashbox &&
    selectedCashbox.currency !== selectedCashbox.baseCurrency;

  const forPartner = form.partyType === "Partner";

  const { data: rawMovementTypeOptions = [], isFetching: loadingTypes } =
    useGetCashMovementTypeOptionsQuery({ forPartner }, { skip: !isOpen });

  // مصروفات فقط (Payment)
  const movementTypeOptions = useMemo(
    () => rawMovementTypeOptions.filter((t) => t.direction === "Payment"),
    [rawMovementTypeOptions],
  );

  const { data: partnersData } = useGetPartiesSelectQuery(undefined, {
    skip: !isOpen || form.partyType !== "Partner",
  });

  const { data: driversData } = useGetDriversSelectQuery(undefined, {
    skip: !isOpen || form.partyType !== "Driver",
  });

  const { data: employeesData } = useGetEmployeesSelectQuery(undefined, {
    skip: !isOpen || form.partyType !== "Employee",
  });

  const partnerOptions = useMemo(() => {
    const list = Array.isArray(partnersData)
      ? partnersData
      : (partnersData?.items ?? []);
    return list.map((p) => ({ value: String(p.id), label: p.name }));
  }, [partnersData]);

  const driverOptions = useMemo(() => {
    const list = Array.isArray(driversData)
      ? driversData
      : (driversData?.items ?? []);
    return list.map((d) => ({ value: String(d.id), label: d.name }));
  }, [driversData]);

  const employeeOptions = useMemo(() => {
    const list = Array.isArray(employeesData)
      ? employeesData
      : (employeesData?.items ?? []);
    return list.map((e) => ({ value: String(e.id), label: e.name }));
  }, [employeesData]);

  const movementOptions = useMemo(
    () =>
      movementTypeOptions.map((t) => ({ value: String(t.id), label: t.name })),
    [movementTypeOptions],
  );

  const cashboxOptions = useMemo(
    () => cashboxes.map((c) => ({ value: String(c.id), label: c.name })),
    [cashboxes],
  );

  // =========================================================
  // Submit
  // =========================================================

  const [createCashVoucher, { isLoading: isSaving }] =
    useCreateCashVoucherMutation();

  const canSubmit =
    Boolean(form.cashboxId) &&
    Boolean(form.cashMovementTypeId) &&
    Number(form.amount) > 0 &&
    (form.partyType !== "Partner" || Boolean(form.businessPartnerId)) &&
    (form.partyType !== "Driver" || Boolean(form.driverId)) &&
    (form.partyType !== "Employee" || Boolean(form.employeeId)) &&
    (form.partyType !== "Other" || Boolean(form.externalPartyName.trim()));

  async function handleSubmit() {
    if (!canSubmit) return;

    const payload = {
      voucherDate: form.voucherDate,
      direction: "Payment",
      cashboxId: Number(form.cashboxId),
      cashMovementTypeId: Number(form.cashMovementTypeId),
      partyType: form.partyType,
      amount: Number(form.amount),
      referenceNumber: form.referenceNumber || "",
      description: form.description || "",
      notes: form.notes || "",
    };

    if (isForeignCurrency && form.exchangeRate) {
      payload.exchangeRate = Number(form.exchangeRate);
    }

    switch (form.partyType) {
      case "Partner":
        payload.businessPartnerId = Number(form.businessPartnerId);
        break;
      case "Driver":
        payload.driverId = Number(form.driverId);
        break;
      case "Employee":
        payload.employeeId = Number(form.employeeId);
        break;
      case "Other":
        payload.externalPartyName = form.externalPartyName.trim();
        break;
      default:
        break;
    }

    try {
      await createCashVoucher(payload).unwrap();
      onSaved?.();
      onClose();
    } catch (err) {
      console.error("فشل تسجيل المصروف", err);
    }
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تسجيل مصروف">
      <div className="space-y-5">
        {/* الخزينة والتاريخ */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              الخزينة
            </label>
            <CompactSelect
              options={cashboxOptions}
              value={form.cashboxId}
              onChange={(value) => setField("cashboxId", value || "")}
              placeholder="اختر الخزينة"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              التاريخ
            </label>
            <input
              type="date"
              value={form.voucherDate}
              onChange={(e) => setField("voucherDate", e.target.value)}
              className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600"
            />
          </div>
        </div>

        {isForeignCurrency && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              سعر الصرف (اختياري - يستخدم السعر المسجل لو فاضي)
            </label>
            <input
              type="number"
              value={form.exchangeRate}
              onChange={(e) => setField("exchangeRate", e.target.value)}
              placeholder="سعر الصرف"
              className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600"
            />
          </div>
        )}

        {/* نوع الطرف */}
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">
            نوع الطرف
          </label>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {PARTY_TYPES.map((party) => (
              <button
                key={party.value}
                type="button"
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    partyType: party.value,
                    businessPartnerId: "",
                    driverId: "",
                    employeeId: "",
                    externalPartyName: "",
                    cashMovementTypeId: "",
                  }));
                }}
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

        {/* نوع المصروف */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            نوع المصروف
          </label>

          <CompactSelect
            options={movementOptions}
            value={form.cashMovementTypeId}
            onChange={(value) => setField("cashMovementTypeId", value || "")}
            isLoading={loadingTypes}
            isDisabled={loadingTypes}
            placeholder={
              loadingTypes
                ? "جاري تحميل أنواع المصروفات..."
                : "اختر نوع المصروف"
            }
          />
        </div>

        {form.partyType === "Partner" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              العميل / المورد
            </label>
            <CompactSelect
              options={partnerOptions}
              value={form.businessPartnerId}
              onChange={(value) => setField("businessPartnerId", value || "")}
              placeholder="اختر العميل / المورد"
            />
          </div>
        )}

        {form.partyType === "Driver" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              السائق
            </label>
            <CompactSelect
              options={driverOptions}
              value={form.driverId}
              onChange={(value) => setField("driverId", value || "")}
              placeholder="اختر السائق"
            />
          </div>
        )}

        {form.partyType === "Employee" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              الموظف
            </label>
            <CompactSelect
              options={employeeOptions}
              value={form.employeeId}
              onChange={(value) => setField("employeeId", value || "")}
              placeholder="اختر الموظف"
            />
          </div>
        )}

        {form.partyType === "Other" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              اسم الطرف
            </label>
            <input
              type="text"
              value={form.externalPartyName}
              onChange={(e) => setField("externalPartyName", e.target.value)}
              placeholder="اكتب اسم الطرف"
              className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600"
            />
          </div>
        )}

        {/* المبلغ */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            المبلغ
          </label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setField("amount", e.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600"
          />
        </div>

        {/* الوصف والملاحظات */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              رقم مرجعي
            </label>
            <input
              type="text"
              value={form.referenceNumber}
              onChange={(e) => setField("referenceNumber", e.target.value)}
              className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              الوصف
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            ملاحظات
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-gold/20 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gold/30 px-4 py-2 text-sm text-ink transition hover:bg-ink/5"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isSaving}
            className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "جاري الحفظ..." : "حفظ المصروف"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
