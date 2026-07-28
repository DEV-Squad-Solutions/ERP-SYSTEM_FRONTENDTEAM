import { forwardRef } from "react";

const NumericInput = forwardRef(
  (
    {
      value,
      onChange,
      placeholder = "",
      className = "",
      decimals = true,
      ...props
    },
    ref,
  ) => {
    const handleChange = (e) => {
      const val = e.target.value;

      if (val === "") {
        onChange?.("");
        return;
      }

      const regex = decimals ? /^\d*\.?\d*$/ : /^\d*$/;

      if (!regex.test(val)) return;

      onChange?.(val); // ✅ رجع String
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
