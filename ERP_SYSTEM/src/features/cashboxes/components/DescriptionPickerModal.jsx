// features/cashboxes/components/DescriptionPickerModal.jsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useGetCashMovementTypeOptionsQuery } from "../cashMovementTypesApi";

// partyType الحقيقي حسب توثيق الباك: None / Partner / Driver / Other
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

  // بيتحمل أول ما المودال يتفتح، وكل ما partyType (وبالتالي forPartner) يتغير
  const { data: movementTypeOptions = [], isFetching: loadingTypes } =
    useGetCashMovementTypeOptionsQuery({ forPartner }, { skip: !isOpen });

  // لو نوع الطرف اتغير وبقى النوع القديم مش موجود في الليستة الجديدة، امسحه
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-ink-400/10">
          <h3 className="font-display font-bold text-ink-900">توصيف الحركة</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-900/5 text-ink-400"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs text-ink-400 mb-1">نوع الطرف</label>
            <div className="grid grid-cols-4 gap-1.5">
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
                  className={`text-xs px-2 py-2 rounded-lg border transition-colors ${
                    partyType === p.value
                      ? "bg-primary-50 border-primary-300 text-primary-600 font-medium"
                      : "bg-white border-ink-400/15 text-ink-600 hover:border-ink-400/30"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-ink-400 mb-1">
              نوع الحركة *
            </label>
            <select
              value={movementTypeId}
              onChange={(e) => setMovementTypeId(e.target.value)}
              disabled={loadingTypes}
              className="w-full text-sm border border-ink-400/15 rounded-lg px-3 py-2 bg-white disabled:opacity-50"
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
              <p className="text-xs text-ink-400 mt-1">
                لا توجد أنواع حركة متاحة لنوع الطرف ده
              </p>
            )}
          </div>

          {partyType === "Partner" && (
            <div>
              <label className="block text-xs text-ink-400 mb-1">
                العميل / المورد
              </label>
              <select
                value={businessPartnerId}
                onChange={(e) => setBusinessPartnerId(e.target.value)}
                className="w-full text-sm border border-ink-400/15 rounded-lg px-3 py-2 bg-white"
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
              <label className="block text-xs text-ink-400 mb-1">السائق</label>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full text-sm border border-ink-400/15 rounded-lg px-3 py-2 bg-white"
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
              <label className="block text-xs text-ink-400 mb-1">
                اسم الطرف
              </label>
              <input
                type="text"
                value={externalPartyName}
                onChange={(e) => setExternalPartyName(e.target.value)}
                className="w-full text-sm border border-ink-400/15 rounded-lg px-3 py-2"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-ink-400/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-ink-400 hover:text-ink-700"
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg disabled:opacity-50"
          >
            تأكيد
          </button>
        </div>
      </div>
    </div>
  );
}
