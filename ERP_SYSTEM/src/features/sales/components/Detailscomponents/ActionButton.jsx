import React from "react";

const variants = {
  default:
    "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300",
  primary: "bg-[#0F6E5E] text-white border-[#0F6E5E] hover:bg-[#0C5A4D]",
  danger:
    "bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300",
};

export default function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = "default",
  disabled,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]}`}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
