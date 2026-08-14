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

// ============================================================
// MOCK: تصنيف فرعي لـ EmployeeTransactions
// ============================================================
// الـbackend حاليًا مش بيرجع غير type: Debit/Credit. لحد ما يتوفر حقل
// "category" حقيقي، بنعمل mock عن طريق ترميز التصنيف جوه حقل notes بصيغة
// "[CATEGORY] نص الملاحظة الحقيقي". دي حل مؤقت بحت عشان تقدر تشتغل على
// الواجهة (سلف/خصومات/إضافي وبدلات) وهي متفرقة عن بعض، وسهل شيله لما ييجي
// حقل category حقيقي من الباك إند (غيّر بس encodeCategory/parseCategory).

export const TRANSACTION_CATEGORY = {
  Overtime: { label: "ساعات إضافية", type: "Credit" },
  TransportAllowance: { label: "بدل انتقال", type: "Credit" },
  HousingAllowance: { label: "بدل سكن", type: "Credit" },
  MealAllowance: { label: "بدل وجبة", type: "Credit" },
  Bonus: { label: "مكافأة", type: "Credit" },
  Incentive: { label: "حافز", type: "Credit" },
  OtherAddition: { label: "أخرى (إضافة)", type: "Credit" },

  AbsenceDeduction: { label: "خصم غياب", type: "Debit" },
  LatenessDeduction: { label: "خصم تأخير", type: "Debit" },
  Penalty: { label: "جزاء", type: "Debit" },
  AdminDeduction: { label: "خصم إداري", type: "Debit" },
  OtherDeduction: { label: "أخرى (خصم)", type: "Debit" },

  Advance: { label: "سلفة", type: "Debit" },
};

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

export function categoryOptionsFor(categoryKeys) {
  return categoryKeys.map((key) => ({
    value: key,
    label: TRANSACTION_CATEGORY[key].label,
  }));
}

export function encodeCategory(category, notes) {
  return `[${category}] ${notes || ""}`.trim();
}

export function parseCategory(notes) {
  const match = /^\[([A-Za-z]+)\]\s*(.*)$/.exec(notes || "");
  if (!match) return { category: null, cleanNotes: notes || "" };
  return { category: match[1], cleanNotes: match[2] };
}

export function categoryLabel(category) {
  return TRANSACTION_CATEGORY[category]?.label || "—";
}

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
