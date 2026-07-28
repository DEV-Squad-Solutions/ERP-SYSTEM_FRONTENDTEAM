/**
 * صف حقل بشكل "خانة الدفتر"
 */
export default function LedgerField({
  label,
  error,
  className = "",
  type = "text",
  value,
  onChange,
  ...inputProps
}) {
  const handleChange = (e) => {
    if (type !== "number") {
      onChange?.(e);
      return;
    }

    let val = e.target.value;

    // يسمح بالفراغ
    if (val === "") {
      onChange?.({
        ...e,
        target: {
          ...e.target,
          value: "",
        },
      });
      return;
    }

    // يسمح بالأرقام الصحيحة والعشرية
    if (!/^\d*\.?\d*$/.test(val)) return;

    onChange?.({
      ...e,
      target: {
        ...e.target,
        value: val,
      },
    });
  };

  return (
    <div>
      <div className="flex items-stretch rounded-lg overflow-hidden border border-ink-400/10">
        <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
          {label}
        </div>

        <input
          type={type === "number" ? "text" : type}
          inputMode={type === "number" ? "decimal" : undefined}
          value={value ?? ""}
          onChange={handleChange}
          className={`
            flex-1
            min-w-0
            px-3
            py-2.5
            text-sm
            bg-white
            num
            outline-none
            transition
            focus:bg-primary-50/30
            focus:ring-2
            focus:ring-primary-500/10
            ${className}
          `}
          {...inputProps}
        />
      </div>

      {error && (
        <p className="px-3 py-1 text-xs text-negative bg-negative/5">{error}</p>
      )}
    </div>
  );
}
