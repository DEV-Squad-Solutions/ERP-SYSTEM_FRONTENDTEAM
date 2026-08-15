// features/cashboxes/components/DescriptionPickerModal.jsx

import { useState, useEffect, useMemo } from "react";

import { useGetCashMovementTypeOptionsQuery } from "../cashMovementTypesApi";

import Modal from "../../../shared/components/ui/Modal";
import CompactSelect from "../../../shared/components/ui/CompactSelect";

const PARTY_TYPES = [
  {
    value: "None",
    label: "بدون طرف",
  },
  {
    value: "Partner",
    label: "عميل / مورد",
  },
  {
    value: "Driver",
    label: "سائق",
  },
  {
    value: "Other",
    label: "طرف آخر",
  },
];

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onConfirm: (payload: {
 *     cashMovementType: {
 *       value: number,
 *       label: string,
 *       direction: "Receipt" | "Payment"
 *     },
 *     direction: "Receipt" | "Payment",
 *     partyType: string,
 *     businessPartner: {value, label} | null,
 *     driver: {value, label} | null,
 *     externalPartyName: string,
 *   }) => void,
 *   partyOptions: Array<{id, name}>,
 *   driverOptions: Array<{id, name}>,
 *   initialValue?: Object,
 * }}
 */

export default function DescriptionPickerModal({
  isOpen,
  onClose,
  onConfirm,
  partyOptions = [],
  driverOptions = [],
  initialValue,
}) {
  const [partyType, setPartyType] = useState("None");
  const [movementTypeId, setMovementTypeId] = useState("");
  const [businessPartnerId, setBusinessPartnerId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [externalPartyName, setExternalPartyName] = useState("");

  /*
   * Initialize values when modal opens
   */
  useEffect(() => {
    if (!isOpen) return;

    setPartyType(initialValue?.partyType || "None");

    setMovementTypeId(
      initialValue?.cashMovementTypeId
        ? String(initialValue.cashMovementTypeId)
        : "",
    );

    setBusinessPartnerId(
      initialValue?.businessPartnerId
        ? String(initialValue.businessPartnerId)
        : "",
    );

    setDriverId(initialValue?.driverId ? String(initialValue.driverId) : "");

    setExternalPartyName(initialValue?.externalPartyName || "");
  }, [isOpen, initialValue]);

  /*
   * Determine whether movement types should be
   * filtered for partners.
   */
  const forPartner = useMemo(() => {
    return PARTY_TYPES.find((p) => p.value === partyType)?.value === "Partner";
  }, [partyType]);

  /*
   * Cash Movement Types
   */
  const { data: movementTypeOptions = [], isFetching: loadingTypes } =
    useGetCashMovementTypeOptionsQuery(
      { forPartner },
      {
        skip: !isOpen,
      },
    );

  /*
   * If selected movement type is no longer available
   * after changing party type, clear it.
   */
  useEffect(() => {
    if (!movementTypeId) return;

    const exists = movementTypeOptions.some(
      (type) => String(type.id) === String(movementTypeId),
    );

    if (!exists) {
      setMovementTypeId("");
    }
  }, [movementTypeOptions, movementTypeId]);

  /*
   * Convert API options to CompactSelect options
   */
  const movementOptions = useMemo(() => {
    return movementTypeOptions.map((type) => ({
      value: String(type.id),
      label: `${type.name} — ${type.direction === "Receipt" ? "وارد" : "صادر"}`,
    }));
  }, [movementTypeOptions]);

  const partnerOptions = useMemo(() => {
    return partyOptions.map((party) => ({
      value: String(party.id),
      label: party.name,
    }));
  }, [partyOptions]);

  const driverSelectOptions = useMemo(() => {
    return driverOptions.map((driver) => ({
      value: String(driver.id),
      label: driver.name,
    }));
  }, [driverOptions]);

  /*
   * Confirm
   */
  function handleConfirm() {
    const movementType = movementTypeOptions.find(
      (type) => String(type.id) === String(movementTypeId),
    );

    if (!movementType) return;

    const businessPartner =
      partyType === "Partner"
        ? partyOptions.find(
            (party) => String(party.id) === String(businessPartnerId),
          )
        : null;

    const driver =
      partyType === "Driver"
        ? driverOptions.find((driver) => String(driver.id) === String(driverId))
        : null;

    onConfirm({
      cashMovementType: {
        value: movementType.id,
        label: movementType.name,
        direction: movementType.direction,
      },

      direction: movementType.direction,

      partyType,

      businessPartner: businessPartner
        ? {
            value: businessPartner.id,
            label: businessPartner.name,
          }
        : null,

      driver: driver
        ? {
            value: driver.id,
            label: driver.name,
          }
        : null,

      externalPartyName: partyType === "Other" ? externalPartyName.trim() : "",
    });

    onClose();
  }

  /*
   * Validation
   */
  const canConfirm =
    Boolean(movementTypeId) &&
    (partyType !== "Partner" || Boolean(businessPartnerId)) &&
    (partyType !== "Driver" || Boolean(driverId)) &&
    (partyType !== "Other" || Boolean(externalPartyName.trim()));

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="توصيف الحركة">
      <div className="space-y-5">
        {/* Party Type */}
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">
            نوع الطرف
          </label>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PARTY_TYPES.map((party) => (
              <button
                key={party.value}
                type="button"
                onClick={() => {
                  setPartyType(party.value);

                  setBusinessPartnerId("");
                  setDriverId("");
                  setExternalPartyName("");
                  setMovementTypeId("");
                }}
                className={`rounded-xl border px-3 py-2.5 text-sm transition ${
                  partyType === party.value
                    ? "border-emerald-600 bg-emerald-50 font-medium text-emerald-800"
                    : "border-gold/30 bg-white text-ink/70 hover:border-gold/50"
                }`}
              >
                {party.label}
              </button>
            ))}
          </div>
        </div>

        {/* Movement Type */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            نوع الحركة
          </label>

          <CompactSelect
            options={movementOptions}
            value={movementTypeId}
            onChange={(value) => setMovementTypeId(value || "")}
            isLoading={loadingTypes}
            isDisabled={loadingTypes}
            placeholder={
              loadingTypes ? "جاري تحميل أنواع الحركة..." : "اختر نوع الحركة"
            }
          />

          {!loadingTypes && movementTypeOptions.length === 0 && (
            <p className="mt-1.5 text-xs text-ink/50">
              لا توجد أنواع حركة متاحة لهذا النوع من الأطراف.
            </p>
          )}
        </div>

        {/* Partner */}
        {partyType === "Partner" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              العميل / المورد
            </label>

            <CompactSelect
              options={partnerOptions}
              value={businessPartnerId}
              onChange={(value) => setBusinessPartnerId(value || "")}
              placeholder="اختر العميل / المورد"
            />
          </div>
        )}

        {/* Driver */}
        {partyType === "Driver" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              السائق
            </label>

            <CompactSelect
              options={driverSelectOptions}
              value={driverId}
              onChange={(value) => setDriverId(value || "")}
              placeholder="اختر السائق"
            />
          </div>
        )}

        {/* Other */}
        {partyType === "Other" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              اسم الطرف
            </label>

            <input
              type="text"
              value={externalPartyName}
              onChange={(e) => setExternalPartyName(e.target.value)}
              placeholder="اكتب اسم الطرف"
              className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600"
            />
          </div>
        )}

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
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            تأكيد
          </button>
        </div>
      </div>
    </Modal>
  );
}
