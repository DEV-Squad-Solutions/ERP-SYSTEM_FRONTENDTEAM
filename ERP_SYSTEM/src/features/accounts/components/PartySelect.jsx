import { useGetSaleLinesQuery } from "../../sales/salesApi";
import LedgerSelect from "../../../shared/components/ui/LedgerSelect";

/**
 * @param {{ value: string, onChange: (partyName: string) => void }} props
 */
export default function PartySelect({ value, onChange }) {
  const { data: allInvoices } = useGetSaleLinesQuery({ movementType: "all" });

  // استخراج قائمة فريدة بأسماء العملاء/الموردين من كل الفواتير
  const parties = Array.from(
    new Map(
      (allInvoices || []).map((inv) => [
        inv.partyName,
        {
          name: inv.partyName,
          type: inv.movementType === "sale" ? "عميل" : "مورد",
        },
      ]),
    ).values(),
  );

  const options = parties.map((p) => ({
    value: p.name,
    label: `${p.name} (${p.type})`,
  }));

  return (
    <LedgerSelect
      label="اسم العميل / المورد"
      options={options}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
