import Select from "react-select";

const compactStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "38px",
    height: "38px",
    borderRadius: "8px",
    borderColor: state.isFocused ? "#2563EB" : "rgba(148,163,184,0.25)",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
    "&:hover": {
      borderColor: "#2563EB",
    },
    fontSize: "13px",
  }),

  valueContainer: (base) => ({
    ...base,
    padding: "0 8px",
  }),

  indicatorSeparator: () => ({
    display: "none",
  }),

  dropdownIndicator: (base) => ({
    ...base,
    padding: "6px",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#9CA3AF",
    fontSize: "13px",
  }),

  singleValue: (base) => ({
    ...base,
    fontSize: "13px",
  }),

  menu: (base) => ({
    ...base,
    zIndex: 9999,
    borderRadius: "10px",
    overflow: "hidden",
    fontSize: "13px",
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),

  menuList: (base) => ({
    ...base,
    padding: "4px",
  }),

  option: (base, state) => ({
    ...base,
    borderRadius: "6px",

    backgroundColor: state.isSelected
      ? "#2563EB"
      : state.isFocused
        ? "rgba(37,99,235,0.08)"
        : "transparent",

    color: state.isSelected ? "white" : "#111827",

    cursor: "pointer",
  }),

  group: (base) => ({
    ...base,
    padding: "0",
  }),

  groupHeading: (base) => ({
    ...base,
    margin: "0",
    padding: "8px 10px 5px",
    color: "#64748B",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "none",
  }),
};

export default function CompactSelect({
  options = [],
  value,
  onChange,
  isLoading,
  isDisabled,
  placeholder = "— اختر —",
}) {
  /**
   * يدعم:
   *
   * 1. Options عادية:
   *
   * [
   *   { value: "1", label: "عميل" }
   * ]
   *
   * 2. Grouped Options:
   *
   * [
   *   {
   *     label: "عملاء / موردين",
   *     options: [
   *       { value: "1", label: "أحمد" },
   *       { value: "2", label: "محمد" }
   *     ]
   *   }
   * ]
   */

  const isGrouped = options.some((option) => Array.isArray(option?.options));

  /**
   * البحث عن القيمة المختارة.
   */
  const selectedOption = useMemoSelectedOption(options, value, isGrouped);

  return (
    <Select
      className="w-full"
      value={selectedOption}
      onChange={(option) => onChange(option ? option.value : "")}
      options={options}
      isLoading={isLoading}
      isDisabled={isDisabled}
      isClearable
      isRtl
      placeholder={placeholder}
      noOptionsMessage={() => "لا توجد نتائج"}
      loadingMessage={() => "جاري التحميل..."}
      styles={compactStyles}
      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
      menuPosition="fixed"
      classNamePrefix="compact-select"
    />
  );
}

/**
 * البحث عن option المختار
 * سواء كانت options عادية
 * أو grouped options.
 */
function useMemoSelectedOption(options, value, isGrouped) {
  if (!value) {
    return null;
  }

  if (!isGrouped) {
    return (
      options.find((option) => String(option.value) === String(value)) || null
    );
  }

  for (const group of options) {
    if (!Array.isArray(group.options)) {
      continue;
    }

    const selected = group.options.find(
      (option) => String(option.value) === String(value),
    );

    if (selected) {
      return selected;
    }
  }

  return null;
}
