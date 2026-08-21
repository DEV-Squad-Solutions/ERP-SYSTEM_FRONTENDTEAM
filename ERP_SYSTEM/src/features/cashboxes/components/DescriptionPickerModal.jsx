import { useState, useEffect, useMemo } from "react";

import { useGetCashMovementTypeOptionsQuery } from "../cashMovementTypesApi";

import Modal from "../../../shared/components/ui/Modal";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Input from "../../../shared/components/ui/Input";

/**
 * نفس فئات التوصيف المستخدمة في CashVoucherEditModal — لازم تفضل متطابقة
 * بين المودالين. لو عدّلت واحدة عدّل التانية.
 */
const TAWSEEF_CATEGORIES = [
  {
    value: "PartnerSettlement",
    label: "عملاء وموردين",
    accountKind: "partner",
    partyType: "Partner",
  },
  {
    value: "Revenue",
    label: "إيرادات",
    accountKind: "movementType",
    partyType: "None",
  },
  {
    value: "Expense",
    label: "مصاريف",
    accountKind: "movementType",
    partyType: "None",
  },
  {
    value: "Driver",
    label: "سائقين",
    accountKind: "driver",
    partyType: "Driver",
  },
  {
    value: "Salary",
    label: "رواتب وأجور",
    accountKind: "employee",
    partyType: "Employee",
  },
  {
    value: "Advance",
    label: "سلف",
    accountKind: "employee",
    partyType: "Employee",
  },
];

function getCategory(value) {
  return (
    TAWSEEF_CATEGORIES.find((c) => c.value === value) || TAWSEEF_CATEGORIES[0]
  );
}

// ⚠️ نفس الافتراض المستخدم في CashVoucherEditModal — عدّل اسم الفيلد لو مختلف عندك.
function typeRequiresBeneficiary(type) {
  if (!type) return false;
  return Boolean(
    type.requiresBeneficiary ||
    type.isPersonalExpense ||
    String(type.name || "").includes("شخصي"),
  );
}

/**
 * مودال توصيف الحركة — بيستخدم في تكملة سند اتسجل Draft (بدون توصيف) من
 * قايمة كشف الخزنة. بيرجّع نفس شكل الـ payload القديم زيادة عليه employee
 * و beneficiaryName عشان يفضل متوافق مع أي كود بيستهلك onConfirm حاليًا،
 * لكن لازم تتأكد إن المكان اللي بيستقبل النتيجة ده بقى يقرا partyType==="Employee".
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onConfirm: (result: object) => void,
 *   partyOptions: Array<{id: string|number, name: string}>,
 *   driverOptions: Array<{id: string|number, name: string}>,
 *   employeeOptions: Array<{id: string|number, name: string}>,
 *   direction?: "Receipt" | "Payment",
 *   initialValue?: object,
 * }} props
 */
export default function DescriptionPickerModal({
  isOpen,
  onClose,
  onConfirm,
  partyOptions = [],
  driverOptions = [],
  employeeOptions = [],
  direction,
  initialValue,
}) {
  const [tawseef, setTawseef] = useState("PartnerSettlement");
  const [movementTypeId, setMovementTypeId] = useState("");
  const [businessPartnerId, setBusinessPartnerId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    // لو initialValue جاي من سند اتحفظ قبل كده وعنده tawseef صريح استخدمه،
    // وإلا حاول نستنتجه من partyType القديم كـ fallback بس.
    if (initialValue?.tawseef) {
      setTawseef(initialValue.tawseef);
    } else if (initialValue?.partyType === "Employee") {
      setTawseef("Salary");
    } else if (initialValue?.partyType === "Driver") {
      setTawseef("Driver");
    } else if (initialValue?.partyType === "Partner") {
      setTawseef("PartnerSettlement");
    } else {
      setTawseef("PartnerSettlement");
    }

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

    setEmployeeId(
      initialValue?.employeeId ? String(initialValue.employeeId) : "",
    );

    setBeneficiaryName(initialValue?.beneficiaryName || "");
  }, [isOpen, initialValue]);

  const category = useMemo(() => getCategory(tawseef), [tawseef]);

  const { data: movementTypeOptions = [], isFetching: loadingTypes } =
    useGetCashMovementTypeOptionsQuery(
      {
        ...(direction ? { direction } : {}),
        classification: tawseef,
        forPartner: category.accountKind === "partner",
      },
      {
        skip: !isOpen,
      },
    );

  useEffect(() => {
    if (!movementTypeId) return;

    const exists = movementTypeOptions.some(
      (type) => String(type.id) === String(movementTypeId),
    );

    if (!exists) {
      setMovementTypeId("");
    }
  }, [movementTypeOptions, movementTypeId]);

  const selectedMovementType = useMemo(
    () =>
      movementTypeOptions.find(
        (type) => String(type.id) === String(movementTypeId),
      ),
    [movementTypeOptions, movementTypeId],
  );

  const isPersonalExpense =
    category.value === "Expense" &&
    typeRequiresBeneficiary(selectedMovementType);

  const movementOptions = useMemo(() => {
    return movementTypeOptions.map((type) => ({
      value: String(type.id),
      label:
        category.accountKind === "movementType"
          ? type.name
          : `${type.name} — ${type.direction === "Receipt" ? "وارد" : "صادر"}`,
    }));
  }, [movementTypeOptions, category.accountKind]);

  const partnerOptions = useMemo(
    () =>
      partyOptions.map((party) => ({
        value: String(party.id),
        label: party.name,
      })),
    [partyOptions],
  );

  const driverSelectOptions = useMemo(
    () =>
      driverOptions.map((driver) => ({
        value: String(driver.id),
        label: driver.name,
      })),
    [driverOptions],
  );

  const employeeSelectOptions = useMemo(
    () =>
      employeeOptions.map((emp) => ({
        value: String(emp.id),
        label: emp.name,
      })),
    [employeeOptions],
  );

  function handleTawseefChange(value) {
    setTawseef(value);
    setBusinessPartnerId("");
    setDriverId("");
    setEmployeeId("");
    setBeneficiaryName("");
    setMovementTypeId("");
  }

  function handleConfirm() {
    const movementType = movementTypeOptions.find(
      (type) => String(type.id) === String(movementTypeId),
    );

    if (!movementType) return;

    const businessPartner =
      category.accountKind === "partner"
        ? partyOptions.find(
            (party) => String(party.id) === String(businessPartnerId),
          )
        : null;

    const driver =
      category.accountKind === "driver"
        ? driverOptions.find((driver) => String(driver.id) === String(driverId))
        : null;

    const employee =
      category.accountKind === "employee"
        ? employeeOptions.find((emp) => String(emp.id) === String(employeeId))
        : null;

    onConfirm({
      tawseef,

      cashMovementType: {
        value: movementType.id,
        label: movementType.name,
        direction: movementType.direction,
      },

      direction: movementType.direction,

      partyType: category.partyType,

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

      employee: employee
        ? {
            value: employee.id,
            label: employee.name,
          }
        : null,

      // المستفيد بيان إضافي مستقل — مش الحساب اللي بينزل عليه القيد
      beneficiaryName: isPersonalExpense ? beneficiaryName.trim() : "",
    });

    onClose();
  }

  const canConfirm =
    Boolean(movementTypeId) &&
    (category.accountKind !== "partner" || Boolean(businessPartnerId)) &&
    (category.accountKind !== "driver" || Boolean(driverId)) &&
    (category.accountKind !== "employee" || Boolean(employeeId)) &&
    (!isPersonalExpense || Boolean(beneficiaryName.trim()));

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="توصيف الحركة">
      <div className="space-y-5">
        {/* التوصيف */}
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">
            التوصيف
          </label>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TAWSEEF_CATEGORIES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleTawseefChange(opt.value)}
                className={`rounded-xl border px-3 py-2.5 text-sm transition ${
                  tawseef === opt.value
                    ? "border-emerald-600 bg-emerald-50 font-medium text-emerald-800"
                    : "border-gold/30 bg-white text-ink/70 hover:border-gold/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* نوع الحركة */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            {category.accountKind === "movementType"
              ? "الحساب (نوع الحركة)"
              : "نوع الحركة"}
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
              لا توجد أنواع حركة متاحة لهذا التوصيف.
            </p>
          )}
        </div>

        {/* العميل / المورد */}
        {category.accountKind === "partner" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              الحساب (عميل / مورد)
            </label>

            <CompactSelect
              options={partnerOptions}
              value={businessPartnerId}
              onChange={(value) => setBusinessPartnerId(value || "")}
              placeholder="اختر العميل / المورد"
            />
          </div>
        )}

        {/* السائق */}
        {category.accountKind === "driver" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              الحساب (السائق)
            </label>

            <CompactSelect
              options={driverSelectOptions}
              value={driverId}
              onChange={(value) => setDriverId(value || "")}
              placeholder="اختر السائق"
            />
          </div>
        )}

        {/* الموظف */}
        {category.accountKind === "employee" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              الحساب (الموظف)
            </label>

            <CompactSelect
              options={employeeSelectOptions}
              value={employeeId}
              onChange={(value) => setEmployeeId(value || "")}
              placeholder="اختر الموظف"
            />
          </div>
        )}

        {/* المستفيد — بيان إضافي مستقل في حالة المصروف الشخصي */}
        {isPersonalExpense && (
          <div>
            <Input
              label="المستفيد"
              value={beneficiaryName}
              onChange={(e) => setBeneficiaryName(e.target.value)}
              placeholder="اسم الشخص المستفيد من المصروف الشخصي"
            />
            <p className="mt-1 text-xs text-ink/50">
              ده بيان توضيحي بس، القيد بيتسجل على "مصروف شخصي" كحساب مش على
              الشخص ده.
            </p>
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
