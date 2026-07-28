import { Wallet2, Plus } from "lucide-react";
import { useGetCashboxesSelectQuery } from "../cashboxesApi";
import CompactSelect from "../../../shared/components/ui/CompactSelect";

/**
 * @param {{ cashboxId: string, onChange: (id: string) => void, onAddNew: () => void }} props
 */
export default function CashboxSelector({ cashboxId, onChange, onAddNew }) {
  const { data: cashboxes, isLoading } = useGetCashboxesSelectQuery();
  const options = cashboxes?.map((c) => ({ value: c.id, label: c.name })) || [];

  return (
    <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 mb-4">
      <div className="flex items-stretch gap-2">
        <div className="w-11 h-11 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center shrink-0">
          <Wallet2 size={20} />
        </div>
        <div className="flex-1">
          <label className="block mb-1 text-xs text-ink-400">اختر الخزنة</label>
          <CompactSelect
            options={options}
            value={cashboxId}
            onChange={onChange}
            isLoading={isLoading}
            placeholder="اختر الخزنة"
          />
        </div>
        <button
          onClick={onAddNew}
          className="px-3 rounded-xl border border-ink-400/15 text-primary-500 hover:bg-primary-50 transition-colors shrink-0"
          title="إضافة خزنة جديدة"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
