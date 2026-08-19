// features/payroll/payroll.constants.js

// ============================================================
// Employee Types
// ============================================================

export const EMPLOYEE_TYPE = {
  Daily: "يومي",
  Monthly: "شهري",
};

export const employeeTypeOptions = Object.entries(EMPLOYEE_TYPE).map(
  ([value, label]) => ({
    value,
    label,
  }),
);

// ============================================================
// Attendance Status
// ============================================================
// EmployeeAttendances API:
// Present = 0
// Absent  = 1
//
// مهم:
// الـ API الحالي لا يدعم Late أو Vacation كـ status.
// التأخير يتم التعامل معه من خلال أوقات الحضور أو
// workOverTimeRatio / workDaysDeductionRatio حسب الـ backend.
// ============================================================

export const ATTENDANCE_STATUS = {
  Present: "حاضر",
  Absent: "غائب",
};

export const attendanceStatusOptions = Object.entries(ATTENDANCE_STATUS).map(
  ([value, label]) => ({
    value,
    label,
  }),
);

export const attendanceStatusBadge = {
  Present: "text-positive bg-positive/10",
  Absent: "text-negative bg-negative/10",
};

// ============================================================
// Day Ratios
// ============================================================
//
// القيم الظاهرة في EmployeeAttendances response:
//
// FullDay
//
// وهناك QuarterDay مؤكد حسب التكامل الحالي.
// باقي القيم مستخدمة في الواجهة كـ enum متوقع.
// ============================================================

export const DAY_RATIO = {
  QuarterDay: "ربع يوم",
  HalfDay: "نصف يوم",
  ThreeQuarterDay: "ثلاثة أرباع يوم",
  FullDay: "يوم كامل",
  None: "بدون",
};

export const dayRatioOptions = Object.entries(DAY_RATIO).map(
  ([value, label]) => ({
    value,
    label,
  }),
);

// ============================================================
// Transaction Type
// ============================================================

export const TRANSACTION_TYPE = {
  Debit: "خصم",
  Credit: "إضافة",
};

export const transactionTypeOptions = Object.entries(TRANSACTION_TYPE).map(
  ([value, label]) => ({
    value,
    label,
  }),
);

// ============================================================
// Employee Transaction Categories
// ============================================================
//
// مؤقت إلى أن يوفر الـ backend category حقيقي.
// ============================================================

export const TRANSACTION_CATEGORY = {
  // ----------------------------------------------------------
  // Credit
  // ----------------------------------------------------------

  Overtime: {
    label: "ساعات إضافية",
    type: "Credit",
  },

  TransportAllowance: {
    label: "بدل انتقال",
    type: "Credit",
  },

  HousingAllowance: {
    label: "بدل سكن",
    type: "Credit",
  },

  MealAllowance: {
    label: "بدل وجبة",
    type: "Credit",
  },

  Bonus: {
    label: "مكافأة",
    type: "Credit",
  },

  Incentive: {
    label: "حافز",
    type: "Credit",
  },

  OtherAddition: {
    label: "أخرى (إضافة)",
    type: "Credit",
  },

  // ----------------------------------------------------------
  // Debit
  // ----------------------------------------------------------

  AbsenceDeduction: {
    label: "خصم غياب",
    type: "Debit",
  },

  LatenessDeduction: {
    label: "خصم تأخير",
    type: "Debit",
  },

  Penalty: {
    label: "جزاء",
    type: "Debit",
  },

  AdminDeduction: {
    label: "خصم إداري",
    type: "Debit",
  },

  OtherDeduction: {
    label: "أخرى (خصم)",
    type: "Debit",
  },

  // ----------------------------------------------------------
  // Advance
  // ----------------------------------------------------------

  Advance: {
    label: "سلفة",
    type: "Debit",
  },
};

// ============================================================
// Category Groups
// ============================================================

export const overtimeAllowanceCategories = [
  "Overtime",
  "TransportAllowance",
  "HousingAllowance",
  "MealAllowance",
  "Bonus",
  "Incentive",
  "OtherAddition",
];

export const deductionCategories = [
  "AbsenceDeduction",
  "LatenessDeduction",
  "Penalty",
  "AdminDeduction",
  "OtherDeduction",
];

export const advanceCategories = ["Advance"];

// ============================================================
// Category Helpers
// ============================================================

export function categoryOptionsFor(categoryKeys = []) {
  return categoryKeys
    .filter((key) => TRANSACTION_CATEGORY[key])
    .map((key) => ({
      value: key,
      label: TRANSACTION_CATEGORY[key].label,
    }));
}

// ============================================================
// Temporary Category Encoding
// ============================================================
//
// مؤقت فقط إلى أن يضيف الـ backend حقل category حقيقي.
// ============================================================

export function encodeCategory(category, notes) {
  if (!category) {
    return notes || "";
  }

  const cleanNotes = String(notes || "").trim();

  return cleanNotes ? `[${category}] ${cleanNotes}` : `[${category}]`;
}

export function parseCategory(notes) {
  const value = String(notes || "");

  const match = /^\[([A-Za-z][A-Za-z0-9]*)\]\s*(.*)$/.exec(value);

  if (!match) {
    return {
      category: null,
      cleanNotes: value,
    };
  }

  return {
    category: match[1],
    cleanNotes: match[2],
  };
}

export function categoryLabel(category) {
  return TRANSACTION_CATEGORY[category]?.label || "—";
}

// ============================================================
// Payroll Status
// ============================================================
//
// TODO INTEGRATION:
// يتم الإبقاء عليها لأن هذه حالات Payroll وليست Attendance.
// يجب تأكيدها من PayrollEntries API.
// ============================================================

export const PAYROLL_STATUS = {
  Draft: "مسودة",
  UnderReview: "تحت المراجعة",
  Approved: "معتمد",
  Disbursed: "تم الصرف",
};

export const payrollStatusBadge = {
  Draft: "text-ink-400 bg-ink-400/10",

  UnderReview: "text-amber-600 bg-amber-50",

  Approved: "text-primary-600 bg-primary-50",

  Disbursed: "text-positive bg-positive/10",
};

// ============================================================
// Money Formatter
// ============================================================

export const fmtMoney = (value) => Number(value || 0).toLocaleString("ar-EG");
