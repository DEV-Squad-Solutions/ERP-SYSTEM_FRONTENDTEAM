export default function Card({ className = "", children }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-ink-400/10 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}
