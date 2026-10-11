export default function Card({ className = "", children }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-ink-400/10 shadow-card dark:border-dark-border dark:bg-dark-surface dark:shadow-dark-card ${className}`}
    >
      {children}
    </div>
  );
}
