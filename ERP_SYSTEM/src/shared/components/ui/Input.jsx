export default function Input({ label, error, className = "", ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1.5 text-sm font-medium text-ink-900">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-white transition-all
          ${error ? "border-negative focus:ring-2 focus:ring-negative/20" : "border-ink-400/15 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"}
          focus:outline-none ${className}`}
        {...props}
      />
      {error && <p className="text-negative text-xs mt-1.5">{error}</p>}
    </div>
  );
}
