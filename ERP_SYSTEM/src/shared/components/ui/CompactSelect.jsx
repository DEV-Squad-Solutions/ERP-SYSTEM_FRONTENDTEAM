// src/shared/components/ui/CompactSelect.jsx

import Select from "react-select";

// src/shared/components/ui/CompactSelect.jsx
// (نفس الملف — تعديل compactStyles بس، الباقي زي ما هو)

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
    borderRadius: "12px",
    overflow: "hidden",
    fontSize: "13px",
    border: "1px solid rgba(148,163,184,0.15)",
    boxShadow:
      "0 10px 25px -5px rgba(15,23,42,0.1), 0 8px 10px -6px rgba(15,23,42,0.06)",
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),

  menuList: (base) => ({
    ...base,
    padding: "6px",
    maxHeight: "280px",
  }),

  option: (base, state) => ({
    ...base,
    borderRadius: "8px",
    margin: "2px 0",
    padding: "8px 10px",
    transition: "background-color 120ms ease",

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
    padding: "4px 0",
    "&:not(:first-of-type)": {
      marginTop: "4px",
      borderTop: "1px solid rgba(148,163,184,0.12)",
      paddingTop: "8px",
    },
  }),

  groupHeading: (base) => ({
    ...base,
    margin: "0 0 2px",
    padding: "4px 10px",
    color: "#2563EB",
    fontSize: "10.5px",
    fontWeight: 800,
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
  formatOptionLabel, // اختياري — بيتمرر من الـ caller لو محتاج شكل مخصص
  formatGroupLabel, // اختياري — نفس الفكرة لعنوان الجروب
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
   * 2. Grouped Options (وممكن تتخلط مع flat في نفس الـ array):
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

  const selectedOption = useMemoSelectedOption(options, value);

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
      formatOptionLabel={formatOptionLabel}
      formatGroupLabel={formatGroupLabel}
      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
      menuPosition="fixed"
      classNamePrefix="compact-select"
    />
  );
}

/**
 * البحث عن الـ option المختار.
 * بيدوّر في العناصر الفلات وجوه كل جروب في نفس الوقت،
 * بدل ما يفترض إن الـ array كله grouped أو كله flat.
 */
function useMemoSelectedOption(options, value) {
  if (!value) {
    return null;
  }

  for (const option of options) {
    if (Array.isArray(option?.options)) {
      const found = option.options.find(
        (opt) => String(opt.value) === String(value),
      );

      if (found) {
        return found;
      }

      continue;
    }

    if (String(option?.value) === String(value)) {
      return option;
    }
  }

  return null;
}
