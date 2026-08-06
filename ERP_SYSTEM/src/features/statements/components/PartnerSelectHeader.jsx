import { useState } from "react";
import { Boxes, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

import { useGetPartiesSelectQuery } from "../../partners/partiesApi";
import QuickAddCustomerModal from "../../partners/components/QuickAddPartyModal";
import CompactSelect from "../../../shared/components/ui/CompactSelect";

/**
 * @param {{
 *   partnerId: string,
 *   onChange: (id: string) => void
 * }} props
 */
export default function PartnerSelectHeader({ partnerId, onChange }) {
  const { data: parties, isLoading } = useGetPartiesSelectQuery();
  const [showAdd, setShowAdd] = useState(false);

  const handleCreated = (newParty) => {
    onChange(newParty.id);
  };

  return (
    <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 mb-4">
      <div className="flex items-stretch gap-2">
        <div className="flex-1">
          <CompactSelect
            label="العميل / المورد"
            options={
              parties?.map((p) => ({
                value: p.id,
                label: p.name,
              })) || []
            }
            value={partnerId}
            onChange={onChange}
            isLoading={isLoading}
            placeholder="اختر عميل أو مورد لعرض كشف حسابه"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="px-3 rounded-xl border border-ink-400/15 text-primary-500 hover:bg-primary-50 transition-colors shrink-0"
          title="إضافة عميل أو مورد"
        >
          <UserPlus size={18} />
        </button>

        <Link
          to={partnerId ? `/dashboard/stores/containers/${partnerId}` : "#"}
          onClick={(e) => {
            if (!partnerId) e.preventDefault();
          }}
          className={`flex items-center justify-center px-3 rounded-xl border border-ink-400/15 transition-colors shrink-0 ${
            partnerId
              ? "text-gold-600 hover:bg-gold-50"
              : "pointer-events-none opacity-40 text-ink-400"
          }`}
          title="مخزن العبوات"
        >
          <Boxes size={18} />
        </Link>
      </div>

      <QuickAddCustomerModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
