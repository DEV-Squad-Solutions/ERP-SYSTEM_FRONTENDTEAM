import Select from "react-select";

const compactStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "36px",
    borderRadius: "8px",
    borderColor: state.isFocused ? "#2563EB" : "rgba(148,163,184,0.25)",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
    "&:hover": { borderColor: "#2563EB" },
    fontSize: "13px",
  }),
  valueContainer: (base) => ({ ...base, padding: "0 8px" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, padding: "6px" }),
  placeholder: (base) => ({ ...base, color: "#9CA3AF", fontSize: "13px" }),
  singleValue: (base) => ({ ...base, fontSize: "13px" }),
  menu: (base) => ({
    ...base,
    zIndex: 30,
    borderRadius: "10px",
    overflow: "hidden",
    fontSize: "13px",
  }),
  menuList: (base) => ({ ...base, padding: "4px" }),
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
};

/**
 * @param {{ options: {value: string, label: string}[], value: string, onChange: (value: string) => void, isLoading?: boolean, isDisabled?: boolean, placeholder?: string }} props
 */
export default function CompactSelect({
  options = [],
  value,
  onChange,
  isLoading,
  isDisabled,
  placeholder = "— اختر —",
}) {
  const selectedOption = options.find((o) => o.value === value) || null;

  return (
    <Select
      className="w-full "
      value={selectedOption}
      onChange={(opt) => onChange(opt ? opt.value : "")}
      options={options}
      isLoading={isLoading}
      isDisabled={isDisabled}
      isClearable
      isRtl
      placeholder={placeholder}
      noOptionsMessage={() => "لا توجد نتائج"}
      loadingMessage={() => "جاري التحميل..."}
      styles={compactStyles}
      menuPortalTarget={document.body}
    />
  );
}
