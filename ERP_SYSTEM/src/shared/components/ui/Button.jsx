const variants = {
  primary:
    "bg-primary-500 text-white shadow-sm hover:bg-primary-600 hover:shadow-card focus-visible:ring-primary-500/30",

  gold: "bg-gold-500 text-white shadow-sm hover:bg-gold-600 hover:shadow-card focus-visible:ring-gold-500/30",

  outline:
    "border border-ink-400/20 bg-white text-ink-900 shadow-sm hover:bg-ink-400/5 hover:border-ink-400/30 focus-visible:ring-ink-400/20",

  ghost:
    "bg-transparent text-ink-500 hover:bg-ink-400/5 hover:text-ink-900 focus-visible:ring-ink-400/20",

  danger:
    "bg-negative text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500/30",
};

/**
 * @param {{
 *   variant?: keyof typeof variants,
 *   className?: string,
 *   children?: React.ReactNode,
 *   loading?: boolean,
 *   loadingText?: string,
 *   disabled?: boolean,
 *   type?: "button" | "submit" | "reset",
 * }} props
 */

export default function Button({
  variant = "primary",
  className = "",
  children,
  loading = false,
  loadingText,
  disabled = false,
  type = "button",
  ...props
}) {
  const variantClass = variants[variant] || variants.primary;

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      className={`
        inline-flex
        min-h-10
        items-center
        justify-center
        gap-2
        rounded-xl
        px-4
        py-2.5
        text-sm
        font-semibold
        leading-none
        whitespace-nowrap

        transition-[background-color,color,border-color,box-shadow,transform]
        duration-200
        ease-out

        focus:outline-none
        focus-visible:ring-4

        active:scale-[0.97]
        hover:-translate-y-[1px]

        disabled:pointer-events-none
        disabled:cursor-not-allowed
        disabled:opacity-50
        disabled:transform-none

        ${variantClass}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="
              h-4
              w-4
              shrink-0
              animate-spin
              rounded-full
              border-2
              border-current
              border-t-transparent
            "
            aria-hidden="true"
          />

          <span>{loadingText || "جاري التنفيذ..."}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
