// features/fiscalYears/fiscalYears.constants.js

export const FISCAL_YEAR_STATUS_LABELS = {
  Open: "مفتوحة",
  Closed: "مغلقة",
};

export const fiscalYearStatusOptions = Object.entries(
  FISCAL_YEAR_STATUS_LABELS,
).map(([value, label]) => ({ value, label }));

export const fiscalYearStatusBadge = {
  Open: "text-positive bg-positive/10",
  Closed: "text-ink-400 bg-ink-400/10",
};

export const fiscalYearStatusDot = {
  Open: "bg-positive",
  Closed: "bg-ink-400",
};
