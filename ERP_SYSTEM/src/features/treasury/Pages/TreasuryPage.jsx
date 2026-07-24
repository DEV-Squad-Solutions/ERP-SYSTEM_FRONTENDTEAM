import { useState } from "react";
import { Plus, ArrowDownCircle, ArrowUpCircle, RefreshCw, AlertCircle, FileSearch } from "lucide-react";
import TreasuryFilters from "../components/TreasuryFilters";
import TreasuryTotals from "../components/TreasuryTotals";
import NewTransactionModal from "../components/NewTransactionModal";
import Button from "../../../shared/components/ui/Button";
import { useGetTreasuryTransactionsQuery } from "../treasuryApi";

export default function TreasuryPage() {
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ date: "", search: "", type: "all" });

  const { data: transactions, isLoading, isError, refetch } = useGetTreasuryTransactionsQuery(filters);

  return (
    <div className="animate-fadeUp space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">الخزنة والحسابات</h2>
          <p className="text-sm text-ink-400 mt-1">إدارة وحصر المقبوضات والمصروفات والنيّة المالية</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} />
          إضافة حركة جديدة
        </Button>
      </div>

      {/* Filters */}
      <TreasuryFilters filters={filters} onChange={setFilters} />

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Table List */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-ink-400/10 shadow-card overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-ink-400/5 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <AlertCircle size={32} className="mx-auto text-negative mb-2" />
              <p className="text-sm text-ink-900 font-medium">خطأ في تحميل الحركات</p>
              <button onClick={refetch} className="text-xs text-primary-500 mt-2 flex items-center gap-1 mx-auto">
                <RefreshCw size={12} /> إعادة المحاولة
              </button>
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="text-center py-12">
              <FileSearch size={32} className="mx-auto text-ink-400/50 mb-2" />
              <p className="text-sm text-ink-400">لا توجد حركات تسوية مطابقة</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scroll">
              <table className="w-full text-right border-collapse text-sm">
                <thead>
                  <tr className="bg-ink-900/[0.02] text-ink-400 border-b border-ink-400/10 text-xs">
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">النوع</th>
                    <th className="p-3">البيان</th>
                    <th className="p-3">الجهة</th>
                    <th className="p-3">المرجع</th>
                    <th className="p-3 text-center">المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-ink-400/5 last:border-0 hover:bg-ink-900/[0.01]">
                      <td className="p-3 num text-ink-500">{tx.date}</td>
                      <td className="p-3">
                        {tx.type === "in" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-positive bg-positive/10 px-2 py-0.5 rounded-full font-medium">
                            <ArrowDownCircle size={12} /> إيداع
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-negative bg-negative/10 px-2 py-0.5 rounded-full font-medium">
                            <ArrowUpCircle size={12} /> صرف
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-medium text-ink-900">{tx.category}</td>
                      <td className="p-3 text-ink-600">{tx.partyName || "—"}</td>
                      <td className="p-3 num text-ink-400 text-xs">{tx.referenceNumber || "—"}</td>
                      <td className={`p-3 num text-center font-bold ${tx.type === "in" ? "text-positive" : "text-negative"}`}>
                        {tx.type === "in" ? "+" : "-"}{Number(tx.amount).toLocaleString("ar-EG")} ج.م
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Totals Sidebar */}
        <div className="lg:col-span-1 sticky top-6">
          <TreasuryTotals />
        </div>
      </div>

      {/* Modal */}
      <NewTransactionModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}