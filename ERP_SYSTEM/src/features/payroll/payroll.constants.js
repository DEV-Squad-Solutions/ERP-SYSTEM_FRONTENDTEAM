// features/payroll/payroll.constants.js
//
// TODO INTEGRATION: القيم دي بس المؤكدة من الـJSON اللي بعتها. الباقي (المعلّم
// بـ "?") تخمين منطقي وممكن يحتاج تعديل لما تتأكد من enum الفعلي في الباك إند.

export const EMPLOYEE_TYPE = {
  Daily: "يومي",
  Monthly: "شهري", // "?" غير مؤكد من الـAPI
};

export const employeeTypeOptions = Object.entries(EMPLOYEE_TYPE).map(
  ([value, label]) => ({ value, label }),
);

export const ATTENDANCE_STATUS = {
  Present: "حاضر",
  Absent: "غائب", // "?"
  Late: "متأخر", // "?"
  Vacation: "إجازة", // "?"
};

export const attendanceStatusOptions = Object.entries(ATTENDANCE_STATUS).map(
  ([value, label]) => ({ value, label }),
);

export const attendanceStatusBadge = {
  Present: "text-positive bg-positive/10",
  Absent: "text-negative bg-negative/10",
  Late: "text-amber-600 bg-amber-50",
  Vacation: "text-ink-400 bg-ink-400/10",
};

// TODO INTEGRATION: القيم الكاملة لـ workDayRatio / workOverTimeRatio /
// workDaysDeductionRatio غير مؤكدة، معروف بس "QuarterDay"
export const DAY_RATIO = {
  QuarterDay: "ربع يوم",
  HalfDay: "نص يوم", // "?"
  ThreeQuarterDay: "ثلاثة أرباع يوم", // "?"
  FullDay: "يوم كامل", // "?"
};

export const dayRatioOptions = Object.entries(DAY_RATIO).map(
  ([value, label]) => ({ value, label }),
);

// TODO INTEGRATION: Debit/Credit مؤكدين، لكن التصنيف الفرعي (سلفة/خصم/إضافي/بدل)
// محتاج حقل category حقيقي من الباك إند. الوسيط ده مؤقت لحد ما يتوفر.
export const TRANSACTION_TYPE = {
  Debit: "خصم",
  Credit: "إضافة",
};

export const transactionTypeOptions = Object.entries(TRANSACTION_TYPE).map(
  ([value, label]) => ({ value, label }),
);

// حالات المرتب - افتراض منطقي بناءً على الـSpec (لسه مش موجودة في الـJSON المبعوت)
// TODO INTEGRATION: تأكيد من PayrollEntries الفعلي هل فيه حقل status
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

export const fmtMoney = (v) => Number(v || 0).toLocaleString("ar-EG");
