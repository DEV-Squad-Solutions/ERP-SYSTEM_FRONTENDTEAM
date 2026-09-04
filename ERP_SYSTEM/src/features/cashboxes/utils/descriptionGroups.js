/**
 * =========================================================
 * توصيف حركات الخزنة (Cash Voucher Description)
 * =========================================================
 *
 * القاعدة من الـ API الجديد (PUT /CashVouchers/{id}):
 * "Send exactly one posting target: employeeId, businessPartnerId,
 * driverId, externalPartyName, or accountId. cashMovementTypeId is
 * optional and can be sent WITH the target as an additional
 * descriptor. driverTripId is allowed only with driverId."
 *
 * ملحوظة مهمة: accountId هو الـ posting target للمصاريف والإيرادات
 * (Use Receipt with Revenue account and Payment with Expense
 * account). cashMovementTypeId حاجة تانية تمامًا — نوع حركة وصفي
 * اختياري بييجي من endpoint منفصل (CashMovementTypes/select) ومش
 * متاح في الشاشة دي دلوقتي، فبنسيبه زي ما هو في السند (لو موجود)
 * ومبنحطوش من هنا.
 *
 * التوصيف بيحدد شكل قائمة "الحساب":
 *   عملاء وموردين → حسابات (businessPartnerId)
 *   إيرادات       → حسابات إيرادات (accountId, accountType Revenue)
 *   مصاريف        → حسابات مصروفات (accountId, accountType Expense)
 *   سائقين        → سائقين (driverId [+ driverTripId])
 *   رواتب وأجور   → موظفين (employeeId)
 *   سلف           → موظفين (employeeId)
 *
 * شكل رد GET /api/v1/CashVouchers/party-select الفعلي:
 *
 * {
 *   businessPartners: [{ id, name }],
 *   drivers:          [{ id, name }],
 *   employees:        [{ id, name }],
 *   expenses:         [{ id, name, classification, code, accountType: "Expense"-ish }],
 *   revenues:         [{ id, name, classification, code, accountType: "Revenue"-ish }],
 * }
 *
 * expenses/revenues دي حسابات فعلية (ليها code و accountType) —
 * مش أنواع حركة (cashMovementTypeId).
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

  // إيرادات — حسابات إيراد، الـ posting target بتاعها accountId.
  // تتعرض بس لو الاتجاه وارد أو مش محدد بعد
  const revenues = partySelect.revenues || [];
  if (revenues.length && direction !== "Payment") {
    groups.push({
      key: "revenue",
      label: "إيرادات",
      options: revenues.map((t) => ({
        value: makeValue(PREFIX.revenue, t.id),
        label: t.name,
        meta: { accountId: t.id },
      })),
    });
  }

  // مصاريف — حسابات مصروف، الـ posting target بتاعها accountId.
  // تتعرض بس لو الاتجاه صادر أو مش محدد بعد
  const expenses = partySelect.expenses || [];
  if (expenses.length && direction !== "Receipt") {
    groups.push({
      key: "expense",
      label: "مصاريف",
      options: expenses.map((t) => ({
        value: makeValue(PREFIX.expense, t.id),
        label: t.name,
        meta: { accountId: t.id },
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

  if (voucher.accountId) {
    // الحساب هو الـ target للمصاريف والإيرادات؛ الاتجاه بيحدد
    // أي مجموعة نرجّعها بس للعرض (revenue أو expense)
    const prefix =
      voucher.direction === "Receipt" ? PREFIX.revenue : PREFIX.expense;

    return makeValue(prefix, voucher.accountId);
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
    accountId: null,
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

  if (meta.accountId != null) {
    return { ...empty, accountId: Number(meta.accountId) };
  }

  return empty;
}
