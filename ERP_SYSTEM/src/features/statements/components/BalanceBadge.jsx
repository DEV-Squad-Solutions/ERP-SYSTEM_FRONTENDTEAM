function getTone(description = "") {
  if (description.includes("عليه") || description.includes("مدين"))
    return "text-positive";
  if (description.includes("له") || description.includes("دائن"))
    return "text-negative";
  return "text-ink-400";
}

export default function BalanceBadge({ amount, description }) {
  const tone = getTone(description);

  return (
    <span className={`num font-semibold ${tone}`}>
      {(amount ?? 0).toLocaleString("ar-EG")}{" "}
      <span className="text-xs font-normal">{description}</span>
    </span>
  );
}
