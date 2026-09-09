export default function Input({
  label,
  error,
  className = "",
  id,
  required = false,
  disabled = false,
  ...props
}) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="
            mb-1.5
            block
            text-sm
            font-semibold
            text-ink-800
          "
        >
          {label}

          {required && (
            <span className="ms-1 text-negative" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {/* Input */}
      <input
        id={inputId}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`
          w-full
          min-h-10
          rounded-xl
          border
          bg-white
          px-3.5
          py-2.5
          text-sm
          font-medium
          text-ink-900
          placeholder:text-ink-400

          outline-none

          transition-[border-color,box-shadow,background-color]
          duration-200
          ease-out

          hover:border-ink-400/25

          focus:bg-white
          focus:ring-4

          disabled:cursor-not-allowed
          disabled:bg-ink-400/[0.04]
          disabled:text-ink-400
          disabled:opacity-70

          ${
            error
              ? `
                border-negative/60
                focus:border-negative
                focus:ring-negative/10
              `
              : `
                border-ink-400/15
                focus:border-primary-500
                focus:ring-primary-500/10
              `
          }

          ${className}
        `}
        {...props}
      />

      {/* Error */}
      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="
            mt-1.5
            flex
            items-center
            gap-1
            text-xs
            font-medium
            text-negative
          "
        >
          <span
            aria-hidden="true"
            className="
              inline-flex
              h-1.5
              w-1.5
              shrink-0
              rounded-full
              bg-negative
            "
          />

          {error}
        </p>
      )}
    </div>
  );
}
