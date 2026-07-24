/**
 * نفس شكل LedgerField بس select بدل input
 * @param {{ label: string, options: {value: string, label: string}[], error?: string }} props
 */
export default function LedgerSelect({
  label,
  options,
  error,
  ...selectProps
}) {
  return (
    <div>
      <div className="flex items-stretch">
        <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
          {label}
        </div>
        <select
          className="flex-1 px-3 py-2.5 text-sm bg-white focus:outline-none focus:bg-primary-50/30  transition-colors"
          {...selectProps}
        >
          <option value="">— اختر —</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="text-negative text-xs px-3 py-1 bg-negative/5">{error}</p>
      )}
    </div>
  );
}
