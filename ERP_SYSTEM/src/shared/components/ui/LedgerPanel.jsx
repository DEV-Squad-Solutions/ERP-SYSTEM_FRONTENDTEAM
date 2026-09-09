export default function LedgerPanel({ title, children, className = "" }) {
  return (
    <section
      className={`
        overflow-hidden
        rounded-2xl
        border
        border-ink-400/15
        bg-white
        shadow-sm
        transition-shadow
        duration-200
        hover:shadow-card
        ${className}
      `}
    >
      {/* Header */}
      <div
        className="
          relative
          flex
          min-h-11
          items-center
          justify-center
          border-b
          border-primary-600/20
          bg-primary-500
          px-4
          py-2.5
          text-center
          text-sm
          font-semibold
          text-white
        "
      >
        {/* Subtle highlight */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-px
            bg-white/20
          "
        />

        <h2 className="font-display leading-5 tracking-tight">{title}</h2>
      </div>

      {/* Content */}
      <div
        className="
          divide-y
          divide-ink-400/10
          bg-white
        "
      >
        {children}
      </div>
    </section>
  );
}
