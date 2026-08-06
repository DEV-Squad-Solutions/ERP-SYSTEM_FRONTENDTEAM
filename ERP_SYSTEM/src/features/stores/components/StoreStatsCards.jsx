import { Package, Layers, Coins, Clock } from "lucide-react";

function StatCard({ icon: Icon, label, value, isPlaceholder }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-ink-50 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-ink-600" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-ink-500 mb-1">{label}</p>
        {isPlaceholder ? (
          <p className="text-sm text-ink-300">— قريبًا —</p>
        ) : (
          <p className="font-display text-lg font-bold text-ink-900 truncate">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

// ملاحظة: الـ API الحالية (GET /Stores/{id}) لا ترجع إحصائيات مباشرة،
// لذلك القيم دي Placeholder لحين توفر endpoint مخصص (مثلاً /Stores/{id}/stats)
// أو حساب أولي من InventoryCostReports لكل صنف. اربطها هنا فور توفرها.
export default function StoreStatsCards({ stats }) {
  const cards = [
    {
      icon: Package,
      label: "عدد الأصناف",
      value: stats?.itemsCount,
    },
    {
      icon: Layers,
      label: "إجمالي الكمية",
      value: stats?.totalQuantity,
    },
    {
      icon: Coins,
      label: "إجمالي قيمة المخزون",
      value: stats?.totalValue,
    },
    {
      icon: Clock,
      label: "آخر حركة",
      value: stats?.lastMovementDate,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c) => (
        <StatCard
          key={c.label}
          icon={c.icon}
          label={c.label}
          value={c.value}
          isPlaceholder={c.value === undefined || c.value === null}
        />
      ))}
    </div>
  );
}
