// features/cashboxes/components/CashboxCard.jsx
import { Wallet, Landmark, ChevronLeft } from "lucide-react";

export default function CashboxCard({ cashbox, onClick }) {
  const isBank = cashbox.type === "bank";
  const currency = cashbox.currency || "EGP";
  const baseCurrency = cashbox.baseCurrency || "EGP";
  const isForeign = currency !== baseCurrency;

  const fmt = (n) =>
    (n ?? 0).toLocaleString("ar-EG", { minimumFractionDigits: 2 });

  return (
    <button
      onClick={onClick}
      className="group text-right bg-white rounded-2xl border border-ink-400/10 shadow-card p-5 hover:border-brand/40 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            isBank ? "bg-blue-50 text-blue-600" : "bg-brand/10 text-brand"
          }`}
        >
          {isBank ? <Landmark size={20} /> : <Wallet size={20} />}
        </div>
        <ChevronLeft
          size={18}
          className="text-ink-400 group-hover:-translate-x-1 transition-transform mt-2"
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <h3 className="font-display font-bold text-ink-900">{cashbox.name}</h3>
        {isForeign && (
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            {currency}
          </span>
        )}
      </div>
      <p className="text-xs text-ink-400 mt-1">
        {isBank ? "حساب بنكي" : "خزنة نقدية"}
      </p>

      <div className="mt-4 pt-4 border-t border-ink-400/10">
        <p className="text-xs text-ink-400 mb-1">الرصيد الحالي</p>
        <p className="font-display font-bold text-lg text-ink-900">
          {fmt(cashbox.currentBalance)}{" "}
          <span className="text-xs font-normal text-ink-400">{currency}</span>
        </p>

        {isForeign && (
          <p className="mt-0.5 text-xs text-ink-400">
            ≈ {fmt(cashbox.currentBalance * (cashbox.openingExchangeRate || 1))}{" "}
            {baseCurrency}
          </p>
        )}
      </div>
    </button>
  );
}
