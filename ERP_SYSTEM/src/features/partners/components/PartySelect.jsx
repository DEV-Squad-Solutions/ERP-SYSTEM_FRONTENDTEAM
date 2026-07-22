import { useGetPartiesSelectQuery } from "../partnersApi";
import LedgerSelect from "../../../shared/components/ui/LedgerSelect";

export default function PartySelect({ value, onChange }) {
  const { data: partners = [] } = useGetPartiesSelectQuery();

  const options = partners.map((partner) => ({
    value: partner.id,
    label: partner.name,
  }));

  return (
    <LedgerSelect
      label="الشريك"
      options={options}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
