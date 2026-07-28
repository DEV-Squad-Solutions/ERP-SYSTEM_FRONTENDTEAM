import { useState } from "react";
import { Boxes, UserPlus, Printer } from "lucide-react";
import { useGetPartiesSelectQuery } from "../../partners/partiesApi";
import QuickAddCustomerModal from "../../partners/components/QuickaddPartyModal";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";

/**
 * @param {{ partnerId: string, onChange: (id: string) => void, onOpenPackaging: () => void }} props
 */
export default function PartnerSelectHeader({
  partnerId,
  onChange,
  onOpenPackaging,
}) {
  const { data: parties, isLoading } = useGetPartiesSelectQuery();
  const [showAdd, setShowAdd] = useState(false);

  const handleCreated = (newParty) => onChange(newParty.id);

  return (
    <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 mb-4">
      <div className="flex items-stretch gap-2">
        <div className="flex-1">
          <CompactSelect
            label="العميل / المورد"
            options={
              parties?.map((p) => ({ value: p.id, label: p.name })) || []
            }
            value={partnerId}
            onChange={onChange}
            isLoading={isLoading}
            placeholder="اختر عميل أو مورد لعرض كشف حسابه"
          />
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-3 rounded-xl border border-ink-400/15 text-primary-500 hover:bg-primary-50 transition-colors shrink-0"
          title="إضافة عميل/مورد جديد"
        >
          <UserPlus size={18} />
        </button>
        <button
          onClick={onOpenPackaging}
          disabled={!partnerId}
          className="px-3 rounded-xl border border-ink-400/15 text-gold-600 hover:bg-gold-50 transition-colors shrink-0 disabled:opacity-30 disabled:pointer-events-none"
          title="مخزن العبوات"
        >
          <Boxes size={18} />
        </button>
        <Button
          variant="outline"
          onClick={() => window.print()}
          disabled={!partnerId}
          className="shrink-0"
        >
          <Printer size={16} />
          طباعة
        </Button>
      </div>

      <QuickAddCustomerModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
