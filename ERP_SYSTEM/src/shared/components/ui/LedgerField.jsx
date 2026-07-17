/**
 * صف حقل بشكل "خانة الدفتر": تسمية على اليمين (خلفية خفيفة) + إدخال على الشمال
 * @param {{ label: string, error?: string, className?: string }} props
 */
export default function LedgerField({ label, error, className = "", ...inputProps }) {
  return (
    <div>
      <div className="flex items-stretch">
        <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
          {label}
        </div>
        <input
          className={`flex-1 px-3 py-2.5 text-sm bg-white focus:outline-none focus:bg-primary-50/30 transition-colors ${className}`}
          {...inputProps}
        />
      </div>
      {error && <p className="text-negative text-xs px-3 py-1 bg-negative/5">{error}</p>}
    </div>
  );
}