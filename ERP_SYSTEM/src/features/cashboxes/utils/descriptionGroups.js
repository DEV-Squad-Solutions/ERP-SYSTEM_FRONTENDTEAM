/**
 * =========================================================
 * توصيف حركات الخزنة (Cash Voucher Description)
 * =========================================================
 *
 * القاعدة من الـ API الجديد (PUT /CashVouchers/{id}):
 * "Send exactly one posting target: employeeId, businessPartnerId,
 * driverId, externalPartyName, or cashMovementTypeId. driverTripId
 * is allowed only with driverId."
 *
 * ملحوظة مهمة: الـ payload الجديد ملوش partyType خالص — الباك اند
 * بيعرف نوع الطرف من الحقل المرسل نفسه. فالملف ده اتبنى تاني من
 * الأول عشان يبقى فيه مصدر واحد للحقيقة، ومفيش أي إشارة لـ
 * partyType في أي مكان.
 *
 * التوصيف (cashMovementType) بيحدد شكل قائمة "الحساب":
 *   عملاء وموردين → حسابات (businessPartnerId)
 *   إيرادات       → أنواع إيرادات (cashMovementTypeId, Revenue)
 *   مصاريف        → أنواع مصروفات (cashMovementTypeId, Expense)
 *   سائقين        → سائقين (driverId [+ driverTripId])
 *   رواتب وأجور   → موظفين (employeeId)
 *   سلف           → موظفين (employeeId)
 *
 * شكل رد GET /api/v1/CashVouchers/party-select الفعلي (اتأكد منه
 * من الـ Swagger مباشرة):
 *
 * {
 *   businessPartners: [{ id, name }],
 *   drivers:          [{ id, name }],
 *   employees:        [{ id, name }],
 *   expenses:         [{ id, name, classification: "Expense" }],
 *   revenues:         [{ id, name, classification: "Revenue" }],
 * }
 *
 * ملحوظة: مفيش أي flag زي isPersonalExpense في الرد — فمفيش
 * تفرقة بين "مصروف عادي" و"مصروف شخصي" على مستوى الـ API. لو
 * محتاجها لاحقًا، لازم تتضاف من الباك اند الأول.
 */

const PREFIX = {
  partner: "partner",
  driver: "driver",
  employeeSalary: "emp-salary",
  employeeAdvance: "emp-advance",
  revenue: "revenue",
  expense: "expense",
};

function makeValue(prefix, id) {
  return `${prefix}:${id}`;
}

// =========================================================
// بناء المجموعات (Groups) لعرضها في DescriptionCascadeSelect
// =========================================================
export function buildDescriptionGroups(partySelect, { direction } = {}) {
  if (!partySelect) return [];

  const groups = [];

  // عملاء وموردين
  const partners = partySelect.businessPartners || [];
  if (partners.length) {
    groups.push({
      key: "partners",
      label: "عملاء وموردين",
      options: partners.map((p) => ({
        value: makeValue(PREFIX.partner, p.id),
        label: p.name,
        meta: { businessPartnerId: p.id },
      })),
    });
  }

  // سائقين
  const drivers = partySelect.drivers || [];
  if (drivers.length) {
    groups.push({
      key: "drivers",
      label: "سائقين",
      options: drivers.map((d) => ({
        value: makeValue(PREFIX.driver, d.id),
        label: d.name,
        meta: { driverId: d.id },
      })),
    });
  }

  // رواتب وأجور + سلف (نفس قائمة الموظفين، نفس هدف الترحيل
  // employeeId، بس مجموعتين منفصلتين عشان وضوح الاستخدام للمستخدم)
  const employees = partySelect.employees || [];
  if (employees.length) {
    groups.push({
      key: "employeeSalary",
      label: "رواتب وأجور",
      options: employees.map((e) => ({
        value: makeValue(PREFIX.employeeSalary, e.id),
        label: e.name,
        meta: { employeeId: e.id },
      })),
    });

    groups.push({
      key: "employeeAdvance",
      label: "سلف",
      options: employees.map((e) => ({
        value: makeValue(PREFIX.employeeAdvance, e.id),
        label: e.name,
        meta: { employeeId: e.id },
      })),
    });
  }

  // إيرادات — تتعرض بس لو الاتجاه وارد أو مش محدد بعد
  const revenues = partySelect.revenues || [];
  if (revenues.length && direction !== "Payment") {
    groups.push({
      key: "revenue",
      label: "إيرادات",
      options: revenues.map((t) => ({
        value: makeValue(PREFIX.revenue, t.id),
        label: t.name,
        meta: { cashMovementTypeId: t.id },
      })),
    });
  }

  // مصاريف — تتعرض بس لو الاتجاه صادر أو مش محدد بعد
  const expenses = partySelect.expenses || [];
  if (expenses.length && direction !== "Receipt") {
    groups.push({
      key: "expense",
      label: "مصاريف",
      options: expenses.map((t) => ({
        value: makeValue(PREFIX.expense, t.id),
        label: t.name,
        meta: { cashMovementTypeId: t.id },
      })),
    });
  }

  return groups;
}

// =========================================================
// استرجاع الـ value المطابق لسند موجود (لفتح المودال / عرض السطر)
// =========================================================
export function getCurrentDescriptionValue(voucher) {
  if (!voucher) return "";

  if (voucher.businessPartnerId) {
    return makeValue(PREFIX.partner, voucher.businessPartnerId);
  }

  if (voucher.driverId) {
    return makeValue(PREFIX.driver, voucher.driverId);
  }

  if (voucher.employeeId) {
    // مفيش تفرقة في البيانات المحفوظة بين راتب وسلفة، فبنرجّع
    // قيمة مجموعة "رواتب وأجور" كافتراضي عند العرض
    return makeValue(PREFIX.employeeSalary, voucher.employeeId);
  }

  if (voucher.cashMovementTypeId) {
    const prefix =
      voucher.direction === "Receipt" ? PREFIX.revenue : PREFIX.expense;

    return makeValue(prefix, voucher.cashMovementTypeId);
  }

  return "";
}

// =========================================================
// بناء posting target واحد بالظبط حسب الـ meta المختارة
// =========================================================
export function buildPostingTargetPayload(meta = {}, context = {}) {
  const empty = {
    businessPartnerId: null,
    driverId: null,
    driverTripId: null,
    employeeId: null,
    cashMovementTypeId: null,
    externalPartyName: undefined,
  };

  if (meta.businessPartnerId != null) {
    return { ...empty, businessPartnerId: Number(meta.businessPartnerId) };
  }

  if (meta.driverId != null) {
    return {
      ...empty,
      driverId: Number(meta.driverId),
      driverTripId: context.driverTripId
        ? Number(context.driverTripId)
        : undefined,
    };
  }

  if (meta.employeeId != null) {
    return { ...empty, employeeId: Number(meta.employeeId) };
  }

  if (meta.cashMovementTypeId != null) {
    return { ...empty, cashMovementTypeId: Number(meta.cashMovementTypeId) };
  }

  return empty;
}
