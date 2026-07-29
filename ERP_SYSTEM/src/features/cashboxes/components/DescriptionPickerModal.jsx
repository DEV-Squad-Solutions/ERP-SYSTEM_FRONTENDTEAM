// features/cashboxes/components/DescriptionPickerModal.jsx
import { useState, useMemo } from "react";
import {
  X,
  ChevronRight,
  Search,
  Users,
  Receipt,
  Wallet,
  Truck,
} from "lucide-react";

const categories = [
  { value: "customers_suppliers", label: "عملاء وموردين", icon: Users },
  { value: "expenses", label: "مصاريف", icon: Receipt },
  { value: "wages", label: "أجور ومرتبات", icon: Wallet },
  { value: "drivers", label: "سائقين", icon: Truck },
];

export { categories };

export default function DescriptionPickerModal({
  isOpen,
  onClose,
  onConfirm,
  partyOptions = [],
}) {
  const [step, setStep] = useState("category");
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filteredParties = () => {
    if (!search.trim()) return partyOptions;
    const q = search.trim().toLowerCase();
    return partyOptions.filter((p) => p.name.toLowerCase().includes(q));
  };

  const handleClose = () => {
    setStep("category");
    setSearch("");
    onClose();
  };

  const handleCategoryClick = (category) => {
    if (category.value === "customers_suppliers") {
      setStep("partners");
      return;
    }
    onConfirm({ category, party: null });
    handleClose();
  };

  const handlePartyClick = (party) => {
    onConfirm({
      category: categories.find((c) => c.value === "customers_suppliers"),
      party: { value: party.id, label: party.name },
    });
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-ink-400/10">
          <div className="flex items-center gap-2">
            {step === "partners" && (
              <button
                onClick={() => setStep("category")}
                className="p-1 rounded-lg text-ink-400 hover:bg-ink-900/5 hover:text-ink-900 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            )}
            <h3 className="text-sm font-semibold text-ink-900">
              {step === "category" ? "اختر التوصيف" : "اختر العميل / المورد"}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-900/5 hover:text-ink-900 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {step === "category" ? (
          <div className="p-3 grid grid-cols-2 gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryClick(cat)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-ink-400/10 hover:border-primary-300 hover:bg-primary-50/50 px-3 py-4 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-medium text-ink-900">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col max-h-[60vh]">
            <div className="p-3 border-b border-ink-400/10">
              <div className="flex items-center gap-2 rounded-lg border border-ink-400/15 px-3 py-2">
                <Search size={14} className="text-ink-400" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن عميل أو مورد..."
                  className="flex-1 text-sm outline-none"
                />
              </div>
            </div>
            <div className="overflow-y-auto custom-scroll">
              {filteredParties().length === 0 ? (
                <p className="text-center text-sm text-ink-400 py-8">
                  لا يوجد نتائج
                </p>
              ) : (
                filteredParties().map((party) => (
                  <button
                    key={party.id}
                    onClick={() => handlePartyClick(party)}
                    className="w-full text-right px-4 py-2.5 text-sm text-ink-900 hover:bg-primary-50/50 transition-colors border-b border-ink-400/5 last:border-0"
                  >
                    {party.name}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
