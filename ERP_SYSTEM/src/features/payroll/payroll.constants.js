// features/payroll/payroll.constants.js

// ============================================================
// Employee Types
// ============================================================

export const workPlaceStatusOptions = [
  { value: "InCompany", label: "داخل الشركة" },
  { value: "OutCompany", label: "خارج الشركة" },
];

export const employeeStatusOptions = [
  { value: "", label: "الكل" },
  { value: "true", label: "نشط" },
  { value: "false", label: "غير نشط" },
];

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

export const ATTENDANCE_STATUS = {
  Absent: "غائب",
  Present: "حاضر",
};

export const ATTENDANCE_STATUS_VALUE = {
  Absent: 0,
  Present: 1,
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

export const DAY_RATIO = {
  OneDay: 1,
  FullDay: 1,
  TwoDays: 2,
  ThreeDays: 3,
  FourDays: 4,
  FiveDays: 5,
  ThreeQuarterDay: 6,
  TwoThirdsDay: 7,
  HalfDay: 8,
  ThirdDay: 9,
  QuarterDay: 10,
};

export const DAY_RATIO_LABELS = {
  OneDay: "يوم كامل",
  FullDay: "يوم كامل",
  TwoDays: "يومان",
  ThreeDays: "ثلاثة أيام",
  FourDays: "أربعة أيام",
  FiveDays: "خمسة أيام",
  ThreeQuarterDay: "ثلاثة أرباع يوم",
  TwoThirdsDay: "ثلثا يوم",
  HalfDay: "نصف يوم",
  ThirdDay: "ثلث يوم",
  QuarterDay: "ربع يوم",
};

export const dayRatioOptions = [
  { value: 1, label: "يوم كامل" },
  { value: 2, label: "يومان" },
  { value: 3, label: "ثلاثة أيام" },
  { value: 4, label: "أربعة أيام" },
  { value: 5, label: "خمسة أيام" },
  { value: 6, label: "ثلاثة أرباع يوم" },
  { value: 7, label: "ثلثا يوم" },
  { value: 8, label: "نصف يوم" },
  { value: 9, label: "ثلث يوم" },
  { value: 10, label: "ربع يوم" },
];

export const DAY_RATIO_BY_VALUE = {
  1: "يوم كامل",
  2: "يومان",
  3: "ثلاثة أيام",
  4: "أربعة أيام",
  5: "خمسة أيام",
  6: "ثلاثة أرباع يوم",
  7: "ثلثا يوم",
  8: "نصف يوم",
  9: "ثلث يوم",
  10: "ربع يوم",
};

// ============================================================
// Employee Movement Type
// ============================================================
// ملاحظة: MOVEMENT_TYPE_LABELS / movementTypeOptions فيها كل القيم
// (بما فيها Advance و Withdrawal) وتُستخدم في العرض والفلترة فقط.
// الـ API (POST /EmployeeMovements) بيقبل 4 قيم بس، عشان كده فيه
// createMovementTypeOptions منفصلة تُستخدم في فورم الإنشاء.

export const MOVEMENT_TYPE_LABELS = {
  Debit: "مدين",
  Credit: "دائن",
  Advance: "سلفة",
  Deduction: "خصم",
  Bonus: "مكافأة",
  Withdrawal: "سحب",
};

export const movementTypeOptions = Object.entries(MOVEMENT_TYPE_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  }),
);

export const movementTypeBadge = {
  Debit: "text-positive bg-positive/10",
  Credit: "text-negative bg-negative/10",
  Advance: "text-amber-600 bg-amber-50",
  Deduction: "text-negative bg-negative/10",
  Bonus: "text-positive bg-positive/10",
  Withdrawal: "text-negative bg-negative/10",
};

// القيم المسموح بيها فعليًا في POST /EmployeeMovements
export const CREATE_MOVEMENT_TYPE_LABELS = {
  Deduction: "خصم",
  Bonus: "مكافأة",
  Debit: "مدين",
  Credit: "دائن",
};

export const createMovementTypeOptions = Object.entries(
  CREATE_MOVEMENT_TYPE_LABELS,
).map(([value, label]) => ({
  value,
  label,
}));

// ============================================================
// Payroll Status
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
// Currency
// ============================================================

export const currencyOptions = [
  { value: "EGP", label: "جنيه مصري" },
  { value: "USD", label: "دولار أمريكي" },
  { value: "EUR", label: "يورو" },
  { value: "GBP", label: "جنيه إسترليني" },
  { value: "SAR", label: "ريال سعودي" },
  { value: "AED", label: "درهم إماراتي" },
  { value: "KWD", label: "دينار كويتي" },
];

// ============================================================
// Balance Type
// ============================================================

export const balanceTypeOptions = [
  { value: "Debit", label: "مدين" },
  { value: "Credit", label: "دائن" },
];

export const BALANCE_TYPE_LABELS = {
  Debit: "مدين",
  Credit: "دائن",
};

export const balanceTypeBadge = {
  Debit: "text-negative bg-negative/10",
  Credit: "text-positive bg-positive/10",
};

// ============================================================
// Money Formatter
// ============================================================

export const fmtMoney = (value) => Number(value || 0).toLocaleString("ar-EG");
