export default function LedgerPanel({ title, children, className = "" }) {
  return (
    <div
      className={`border-2 border-ink-900/15 rounded-xl overflow-hidden bg-white ${className}`}
    >
      <div className="bg-primary-500 text-white text-center py-2.5 font-display font-semibold text-sm">
        {title}
      </div>
      <div className="divide-y divide-ink-400/10">{children}</div>
    </div>
  );
}
