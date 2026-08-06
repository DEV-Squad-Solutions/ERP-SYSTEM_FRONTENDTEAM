// features/cashboxes/components/DescriptionPickerModal.jsx
import { useState, useEffect } from "react";
import { useGetCashMovementTypeOptionsQuery } from "../cashMovementTypesApi";
import Modal from "../../../shared/components/ui/Modal";
const PARTY_TYPES = [
  { value: "None", label: "بدون طرف", forPartner: false },
  { value: "Partner", label: "عميل / مورد", forPartner: true },
  { value: "Driver", label: "سائق", forPartner: false },
  { value: "Other", label: "طرف آخر", forPartner: false },
];

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onConfirm: (payload: {
 *     cashMovementType: {value, label, direction},
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

  useEffect(() => {
    if (isOpen) {
      setPartyType(initialValue?.partyType || "None");
      setMovementTypeId(initialValue?.cashMovementTypeId || "");
      setBusinessPartnerId(initialValue?.businessPartnerId || "");
      setDriverId(initialValue?.driverId || "");
      setExternalPartyName(initialValue?.externalPartyName || "");
    }
  }, [isOpen, initialValue]);

  const forPartner =
    PARTY_TYPES.find((p) => p.value === partyType)?.forPartner ?? false;

  const { data: movementTypeOptions = [], isFetching: loadingTypes } =
    useGetCashMovementTypeOptionsQuery({ forPartner }, { skip: !isOpen });

  useEffect(() => {
    if (
      movementTypeId &&
      !movementTypeOptions.some((t) => String(t.id) === String(movementTypeId))
    ) {
      setMovementTypeId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movementTypeOptions]);

  if (!isOpen) return null;

  function handleConfirm() {
    const movementType = movementTypeOptions.find(
      (t) => String(t.id) === String(movementTypeId),
    );
    if (!movementType) return;

    const businessPartner =
      partyType === "Partner"
        ? partyOptions.find((p) => String(p.id) === String(businessPartnerId))
        : null;
    const driver =
      partyType === "Driver"
        ? driverOptions.find((d) => String(d.id) === String(driverId))
        : null;

    onConfirm({
      cashMovementType: {
        value: movementType.id,
        label: movementType.name,
        direction: movementType.direction,
      },
      direction: movementType.direction, // "Receipt" | "Payment" - جاي من النوع نفسه
      partyType,
      businessPartner: businessPartner
        ? { value: businessPartner.id, label: businessPartner.name }
        : null,
      driver: driver ? { value: driver.id, label: driver.name } : null,
      externalPartyName: partyType === "Other" ? externalPartyName : "",
    });
    onClose();
  }

  const canConfirm =
    movementTypeId &&
    (partyType !== "Partner" || businessPartnerId) &&
    (partyType !== "Driver" || driverId) &&
    (partyType !== "Other" || externalPartyName.trim());

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="توصيف الحركة">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            نوع الطرف
          </label>

          <div className="grid grid-cols-4 gap-2">
            {PARTY_TYPES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => {
                  setPartyType(p.value);
                  setBusinessPartnerId("");
                  setDriverId("");
                  setExternalPartyName("");
                }}
                className={`rounded-xl border px-3 py-2 text-sm transition ${
                  partyType === p.value
                    ? "border-emerald-600 bg-emerald-50 font-medium text-emerald-800"
                    : "border-gold/30 bg-white text-ink/70 hover:border-gold/50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            نوع الحركة
          </label>

          <select
            value={movementTypeId}
            onChange={(e) => setMovementTypeId(e.target.value)}
            disabled={loadingTypes}
            className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 disabled:opacity-50"
          >
            <option value="">
              {loadingTypes ? "جاري التحميل..." : "اختر نوع الحركة"}
            </option>

            {movementTypeOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.direction === "Receipt" ? "وارد" : "صادر"}
              </option>
            ))}
          </select>

          {!loadingTypes && movementTypeOptions.length === 0 && (
            <p className="mt-1 text-xs text-ink/50">
              لا توجد أنواع حركة متاحة.
            </p>
          )}
        </div>

        {partyType === "Partner" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              العميل / المورد
            </label>

            <select
              value={businessPartnerId}
              onChange={(e) => setBusinessPartnerId(e.target.value)}
              className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
            >
              <option value="">اختر</option>

              {partyOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {partyType === "Driver" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              السائق
            </label>

            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
            >
              <option value="">اختر</option>

              {driverOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {partyType === "Other" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              اسم الطرف
            </label>

            <input
              type="text"
              value={externalPartyName}
              onChange={(e) => setExternalPartyName(e.target.value)}
              className="w-full rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-gold/20 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gold/30 px-4 py-2 text-sm text-ink hover:bg-ink/5"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            تأكيد
          </button>
        </div>
      </div>
    </Modal>
  );
}
