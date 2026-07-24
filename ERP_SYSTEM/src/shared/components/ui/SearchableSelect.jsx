import React, { useMemo } from "react";
import Select from "react-select";

/**
 * مكوّن اختيار عام (Searchable Select) مبني على react-select
 * يدعم شكلين من البيانات:
 *  1) مصفوفة كائنات بسيطة { value, label }
 *  2) مصفوفة كائنات مخصصة (مثل CUSTOMERS) مع تمرير getOptionLabel / getOptionValue
 *
 * Props:
 * - data: array            → قائمة العناصر (options)
 * - value: any              → القيمة الحالية (نفس نوع value في العنصر، مش الـ object الكامل)
 * - onChange(value|item)    → عند التغيير. لو تم تمرير getOptionValue بيرجع الـ item كامل، غير كده بيرجع value فقط
 * - placeholder: string
 * - getOptionLabel(item)    → دالة اختيارية لتحديد النص المعروض
 * - getOptionValue(item)    → دالة اختيارية لتحديد القيمة المميزة للعنصر
 * - isClearable: boolean
 * - isDisabled: boolean
 * - styles: object          → لتخصيص إضافي فوق التنسيق الافتراضي
 */
export default function SearchableSelect({
  data = [],
  value,
  onChange,
  placeholder = "اختر...",
  getOptionLabel,
  getOptionValue,
  isClearable = false,
  isDisabled = false,
  styles = {},
}) {
  // دوال افتراضية لو البيانات بسيطة { value, label }
  const resolveLabel = getOptionLabel || ((item) => item.label ?? item);
  const resolveValue = getOptionValue || ((item) => item.value ?? item);

  const options = useMemo(() => data, [data]);

  const selectedOption = useMemo(() => {
    if (value === undefined || value === null || value === "") return null;
    return options.find((item) => resolveValue(item) === value) || null;
  }, [options, value]);

  const handleChange = (option) => {
    if (!option) {
      onChange(null);
      return;
    }
    // لو فيه getOptionValue مخصص، نرجّع القيمة (id) زي ما السلوك القديم كان
    onChange(resolveValue(option));
  };

  return (
    <Select
      options={options}
      value={selectedOption}
      onChange={handleChange}
      getOptionLabel={resolveLabel}
      getOptionValue={(item) => String(resolveValue(item))}
      placeholder={placeholder}
      isClearable={isClearable}
      isDisabled={isDisabled}
      isRtl
      noOptionsMessage={() => "لا توجد نتائج"}
      styles={{ ...defaultStyles, ...styles }}
    />
  );
}

const defaultStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "38px",
    borderRadius: "0.5rem",
    borderColor: state.isFocused ? "#0F6B62" : "#DCE1EA",
    boxShadow: state.isFocused ? "0 0 0 1px #0F6B62" : "none",
    "&:hover": { borderColor: "#0F6B62" },
    fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
    fontSize: "0.875rem",
  }),
  valueContainer: (base) => ({ ...base, padding: "2px 10px" }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.875rem",
    backgroundColor: state.isSelected
      ? "#0F6B62"
      : state.isFocused
        ? "#EEF1F6"
        : "white",
    color: state.isSelected ? "white" : "#1C2733",
    cursor: "pointer",
  }),
  menu: (base) => ({ ...base, zIndex: 30 }),
  placeholder: (base) => ({ ...base, color: "#94A3B8" }),
};
