const config = {
  عليه: { className: "text-negative" },
  له: { className: "text-positive" },
  مسدد: { className: "text-ink-400" },
};

export default function BalanceBadge({ amount, description }) {
  const tone = config[description]?.className || "text-ink-600";
  return (
    <span className={`num font-semibold ${tone}`}>
      {amount.toLocaleString("ar-EG")}{" "}
      <span className="text-xs font-normal">{description}</span>
    </span>
  );
}
