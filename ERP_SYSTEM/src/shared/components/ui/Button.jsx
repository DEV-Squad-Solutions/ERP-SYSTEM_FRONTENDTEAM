const variants = {
  primary: "bg-primary-500 text-white hover:bg-primary-600 shadow-card",
  gold: "bg-gold-500 text-white hover:bg-gold-600 shadow-card",
  outline: "border border-ink-400/20 text-ink-900 hover:bg-ink-400/5",
  ghost: "text-ink-400 hover:bg-ink-400/5",
  danger: "bg-negative text-white hover:bg-red-700",
};

/**
 * @param {{ variant?: keyof typeof variants, className?: string, children: any }} props
 */
export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
