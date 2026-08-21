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
  { value: "Employee", label: "موظف" },
  { value: "Other", label: "طرف آخر" },
];

const CLASSIFICATIONS = [
  {
    value: "PartnerSettlement",
    label: "تسوية عميل / مورد",
  },
  {
    value: "Expense",
    label: "مصروفات",
  },
  {
    value: "Revenue",
    label: "إيرادات",
  },
  {
    value: "Other",
    label: "أخرى",
  },
];

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
  employeeOptions = [],
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
    driverTripId: "",
    employeeId: "",
    externalPartyName: "",

    description: "",
    notes: "",
    referenceNumber: "",
  });

  /* =========================================================
     Initialize Form
  ========================================================= */

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

      driverTripId: voucher.driverTripId ? String(voucher.driverTripId) : "",

      employeeId: voucher.employeeId ? String(voucher.employeeId) : "",

      externalPartyName: voucher.externalPartyName || "",

      description: voucher.description || "",

      notes: voucher.notes || "",

      referenceNumber: voucher.referenceNumber || "",
    });
  }, [isOpen, voucher]);

  const set = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* =========================================================
     Party
  ========================================================= */

  const forPartner = useMemo(
    () => form.partyType === "Partner",
    [form.partyType],
  );

  /* =========================================================
     Movement Types
     
     هنا بنجيب الأنواع الخاصة بالاتجاه والطرف.
     
     التصنيف نفسه هنستخدمه في الـ grouping.
  ========================================================= */

  const { data: movementTypeOptions = [], isFetching: loadingTypes } =
    useGetCashMovementTypeOptionsQuery(
      {
        direction: form.direction,
        forPartner,
      },
      {
        skip: !isOpen,
      },
    );

  /* =========================================================
     Grouped Dropdown Options
     
     الشكل:
     
     تسوية عميل / مورد
        تحصيل عميل
        سداد مورد

     مصروفات
        كهرباء
        نقل

     إيرادات
        مبيعات

     أخرى
        ...
  ========================================================= */

  const groupedMovementOptions = useMemo(() => {
    const groups = {};

    CLASSIFICATIONS.forEach((classification) => {
      groups[classification.value] = {
        label: classification.label,
        options: [],
      };
    });

    movementTypeOptions.forEach((type) => {
      const classification =
        type.classification || type.cashMovementTypeClassification || "Other";

      if (!groups[classification]) {
        groups[classification] = {
          label: classification,
          options: [],
        };
      }

      groups[classification].options.push({
        value: String(type.id),

        label: type.name,

        classification,

        direction: type.direction,
      });
    });

    return Object.values(groups).filter((group) => group.options.length > 0);
  }, [movementTypeOptions]);

  /* =========================================================
     Selected Movement
  ========================================================= */

  const selectedMovement = useMemo(() => {
    for (const group of groupedMovementOptions) {
      const found = group.options.find(
        (option) => String(option.value) === String(form.movementTypeId),
      );

      if (found) return found;
    }

    return null;
  }, [groupedMovementOptions, form.movementTypeId]);

  /* =========================================================
     Select Options
  ========================================================= */

  const partnerSelectOptions = useMemo(
    () =>
      partyOptions.map((p) => ({
        value: String(p.id),
        label: p.name,
      })),
    [partyOptions],
  );

  const driverSelectOptions = useMemo(
    () =>
      driverOptions.map((d) => ({
        value: String(d.id),
        label: d.name,
      })),
    [driverOptions],
  );

  const employeeSelectOptions = useMemo(
    () =>
      employeeOptions.map((employee) => ({
        value: String(employee.id),
        label: employee.name,
      })),
    [employeeOptions],
  );

  /* =========================================================
     Party Type Change
  ========================================================= */

  const handlePartyTypeChange = (value) => {
    setForm((prev) => ({
      ...prev,

      partyType: value,

      businessPartnerId: "",
      driverId: "",
      driverTripId: "",
      employeeId: "",
      externalPartyName: "",
    }));
  };

  /* =========================================================
     Validation
  ========================================================= */

  const canSave =
    Number(form.amount) > 0 &&
    Boolean(form.movementTypeId) &&
    (!isForeign || Number(form.exchangeRate) > 0) &&
    (form.partyType !== "Partner" || Boolean(form.businessPartnerId)) &&
    (form.partyType !== "Driver" || Boolean(form.driverId)) &&
    (form.partyType !== "Employee" || Boolean(form.employeeId)) &&
    (form.partyType !== "Other" || Boolean(form.externalPartyName.trim()));

  /* =========================================================
     Submit
  ========================================================= */

  async function handleSubmit(e) {
    e.preventDefault();

    if (!canSave || !voucher) return;

    setSaving(true);

    try {
      await onSave({
        voucherDate: form.voucherDate,

        direction: form.direction,

        amount: Number(form.amount),

        ...(isForeign && {
          exchangeRate: Number(form.exchangeRate),
        }),

        cashMovementTypeId: form.movementTypeId,

        partyType: form.partyType,

        businessPartnerId:
          form.partyType === "Partner" ? form.businessPartnerId : null,

        driverId: form.partyType === "Driver" ? form.driverId : null,

        driverTripId:
          form.partyType === "Driver" && form.driverTripId
            ? form.driverTripId
            : null,

        employeeId: form.partyType === "Employee" ? form.employeeId : null,

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

  /* =========================================================
     Render
  ========================================================= */

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`تعديل السند ${voucher.voucherNumber ?? ""}`}
      wide
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* =====================================================
            Direction
        ===================================================== */}

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

        {/* =====================================================
            Date / Amount
        ===================================================== */}

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

        {/* =====================================================
            Exchange Rate
        ===================================================== */}

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
              سعر الصرف المستخدم في السند.
            </p>
          </div>
        )}

        {/* =====================================================
            Party Type
        ===================================================== */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900">
            نوع الطرف
          </label>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
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

        {/* =====================================================
            Partner
        ===================================================== */}

        {form.partyType === "Partner" && (
          <CompactSelect
            options={partnerSelectOptions}
            value={form.businessPartnerId}
            onChange={(value) => set("businessPartnerId", value || "")}
            placeholder="اختر العميل / المورد"
          />
        )}

        {/* =====================================================
            Driver
        ===================================================== */}

        {form.partyType === "Driver" && (
          <div className="space-y-3">
            <CompactSelect
              options={driverSelectOptions}
              value={form.driverId}
              onChange={(value) => set("driverId", value || "")}
              placeholder="اختر السائق"
            />

            <Input
              label="رقم الرحلة (اختياري)"
              type="number"
              value={form.driverTripId}
              onChange={(e) => set("driverTripId", e.target.value)}
            />
          </div>
        )}

        {/* =====================================================
            Employee
        ===================================================== */}

        {form.partyType === "Employee" && (
          <CompactSelect
            options={employeeSelectOptions}
            value={form.employeeId}
            onChange={(value) => set("employeeId", value || "")}
            placeholder="اختر الموظف"
          />
        )}

        {/* =====================================================
            Other Party
        ===================================================== */}

        {form.partyType === "Other" && (
          <Input
            label="اسم الطرف"
            value={form.externalPartyName}
            onChange={(e) => set("externalPartyName", e.target.value)}
          />
        )}

        {/* =====================================================
            التوصيف - GROUPED DROPDOWN
        ===================================================== */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900">
            التوصيف <span className="text-negative">*</span>
          </label>

          <CompactSelect
            options={groupedMovementOptions}
            value={form.movementTypeId}
            onChange={(value) => set("movementTypeId", value || "")}
            isLoading={loadingTypes}
            isDisabled={loadingTypes}
            placeholder={
              loadingTypes ? "جاري تحميل التوصيفات..." : "اختر التوصيف"
            }
          />

          {!loadingTypes && groupedMovementOptions.length === 0 && (
            <p className="mt-1.5 text-xs text-negative">
              مفيش توصيفات متاحة لهذا الاتجاه والطرف.
            </p>
          )}

          {selectedMovement && (
            <p className="mt-1.5 text-xs text-ink-400">
              التصنيف:{" "}
              {CLASSIFICATIONS.find(
                (item) => item.value === selectedMovement.classification,
              )?.label || selectedMovement.classification}
            </p>
          )}
        </div>

        {/* =====================================================
            Description
        ===================================================== */}

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

        {/* =====================================================
            Notes
        ===================================================== */}

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

        {/* =====================================================
            Reference
        ===================================================== */}

        <Input
          label="رقم مرجعي (اختياري)"
          value={form.referenceNumber}
          onChange={(e) => set("referenceNumber", e.target.value)}
        />

        {/* =====================================================
            Actions
        ===================================================== */}

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
            {saving && <Loader2 size={16} className="animate-spin" />}
            حفظ التعديلات
          </Button>
        </div>
      </form>
    </Modal>
  );
}
