import { forwardRef } from "react";

const NumericInput = forwardRef(
  (
    {
      value,
      onChange,
      placeholder = "",
      className = "",
      decimals = true,
      maxDecimals = 2,
      ...props
    },
    ref,
  ) => {
    const handleChange = (e) => {
      let val = e.target.value;

      // السماح بمسح القيمة بالكامل
      if (val === "") {
        onChange?.("");
        return;
      }

      // أرقام صحيحة فقط
      if (!decimals) {
        if (!/^\d*$/.test(val)) return;
        onChange?.(val);
        return;
      }

      // دعم 12,5 و 12.5
      val = val.replace(",", ".");

      // السماح أثناء الكتابة بـ 12. و .5
      if (!/^\d*\.?\d*$/.test(val)) return;

      const decimalIndex = val.indexOf(".");

      // منع أكثر من علامة عشرية
      if (decimalIndex !== -1 && val.indexOf(".", decimalIndex + 1) !== -1) {
        return;
      }

      // حد أقصى منزلتين عشريتين
      if (decimalIndex !== -1) {
        const decimalPart = val.slice(decimalIndex + 1);

        if (decimalPart.length > maxDecimals) return;
      }

      // لا نحول إلى Number هنا؛ الحفاظ على String مهم لكتابة 12.
      onChange?.(val);
    };

    return (
      <input
        ref={ref}
        type="text"
        inputMode={decimals ? "decimal" : "numeric"}
        value={value ?? ""}
        onChange={handleChange}
        placeholder={placeholder}
        className={`
          w-full
          min-w-0
          rounded-lg
          border
          border-ink-400/15
          bg-white
          px-2.5
          py-2
          text-sm
          text-center
          num
          outline-none
          transition
          focus:border-primary-500
          focus:ring-2
          focus:ring-primary-500/10
          ${className}
        `}
        {...props}
      />
    );
  },
);

NumericInput.displayName = "NumericInput";

export default NumericInput;
