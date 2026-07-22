import { useState } from "react";
import PartySelect from "./components/PartySelect";
import AccountStatementTable from "./components/AccountStatementTable";

export default function PartnersPage() {
  const [partyName, setPartyName] = useState("");

  return (
    <div className="animate-fadeUp">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-900">
          كشف حساب عملاء / موردين
        </h2>
        <p className="text-sm text-ink-400 mt-1">
          عرض حركة الحساب المدين والدائن ورصيده التراكمي
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 mb-4  ">
        <PartySelect value={partyName} onChange={setPartyName} />
      </div>

      <AccountStatementTable partyName={partyName} />
    </div>
  );
}
