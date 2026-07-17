import { Users, ShoppingCart, TrendingUp, Wallet } from "lucide-react";

const stats = [
  {
    label: "إجمالي المبيعات",
    value: "0 ج.م",
    icon: TrendingUp,
    color: "text-green-600 bg-green-50",
  },
  {
    label: "إجمالي المشتريات",
    value: "0 ج.م",
    icon: ShoppingCart,
    color: "text-orange-600 bg-orange-50",
  },
  {
    label: "رصيد الخزينة",
    value: "0 ج.م",
    icon: Wallet,
    color: "text-blue-600 bg-blue-50",
  },
  {
    label: "عدد العملاء",
    value: "0",
    icon: Users,
    color: "text-purple-600 bg-purple-50",
  },
];

export default function DashboardHome() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">نظرة عامة</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border p-5 flex items-center gap-4"
          >
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
