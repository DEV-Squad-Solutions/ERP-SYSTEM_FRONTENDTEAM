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
// Employee Movement Type
// ============================================================
// EmployeeMovements API:
// Debit = 1, Credit = 2, Advance = 3, Deduction = 4, Bonus = 5, Withdrawal = 6
// ============================================================

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

export const currencyOptions = [
  { value: "EGP", label: "جنيه مصري" },
  { value: "USD", label: "دولار أمريكي" },
  { value: "EUR", label: "يورو" },
  { value: "GBP", label: "جنيه إسترليني" },
  { value: "SAR", label: "ريال سعودي" },
  { value: "AED", label: "درهم إماراتي" },
  { value: "KWD", label: "دينار كويتي" },
];

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
