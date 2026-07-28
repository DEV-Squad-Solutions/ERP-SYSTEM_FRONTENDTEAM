// features/cashboxes/components/CashboxCard.jsx
import { Wallet, Landmark, ChevronLeft } from "lucide-react";

export default function CashboxCard({ cashbox, onClick }) {
  const isBank = cashbox.type === "bank";
  console.log(cashbox);
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

      <h3 className="font-display font-bold text-ink-900 mt-4">
        {cashbox.name}
      </h3>
      <p className="text-xs text-ink-400 mt-1">
        {isBank ? "حساب بنكي" : "خزنة نقدية"}
      </p>

      <div className="mt-4 pt-4 border-t border-ink-400/10">
        <p className="text-xs text-ink-400 mb-1">الرصيد الحالي</p>
        <p className="font-display font-bold text-lg text-ink-900">
          {cashbox.currentBalance.toLocaleString("ar-EG", {
            minimumFractionDigits: 2,
          })}{" "}
          <span className="text-xs font-normal text-ink-400">
            {cashbox.currency || "ج.م"}
          </span>
        </p>
      </div>
    </button>
  );
}
