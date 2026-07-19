import { useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useGetItemsQuery } from "../../inventory/inventoryApi";
import { mockPackagingUnits } from "../../../mocks/data/packagingUnits";

/**
 * @param {{ line: Object, onChange: (line: Object) => void, onRemove: () => void, movementType: string }} props
 */
export default function NewInvoiceLineRow({
  line,
  onChange,
  onRemove,
  movementType,
}) {
  const { data: items } = useGetItemsQuery();

  const set = (key, value) => onChange({ ...line, [key]: value });

  // لما تختار صنف، السعر يتملى تلقائي من المخزون (بيع/شراء حسب نوع العملية)
  useEffect(() => {
    const selected = items?.find((i) => i.id === line.itemId);
    if (selected) {
      const price =
        movementType === "purchase"
          ? selected.purchasePrice
          : selected.salePrice;
      onChange({
        ...line,
        itemId: line.itemId,
        itemName: selected.name,
        price,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line.itemId, items]);

  // لما تختار عبوة، اسمها يتخزن جنب الـ id
  useEffect(() => {
    const unit = mockPackagingUnits.find((u) => u.id === line.packagingUnitId);
    if (unit) onChange({ ...line, packagingUnitName: unit.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line.packagingUnitId]);

  const value = (Number(line.quantity) || 0) * (Number(line.price) || 0);
  const cellCls =
    "w-full rounded-lg border border-ink-400/15 px-2 py-1.5 text-sm focus:outline-none focus:border-primary-500";

  return (
    <tr className="border-b border-ink-400/5 last:border-0">
      <td className="p-2 min-w-[150px]">
        <select
          value={line.itemId}
          onChange={(e) => set("itemId", e.target.value)}
          className={cellCls}
        >
          <option value="">— اختر الصنف —</option>
          {items?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </td>
      <td className="p-2 min-w-[100px]">
        <select
          value={line.packagingUnitId}
          onChange={(e) => set("packagingUnitId", e.target.value)}
          className={cellCls}
        >
          <option value="">— العبوة —</option>
          {mockPackagingUnits.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </td>
      <td className="p-2 w-20">
        <input
          type="number"
          value={line.packagingIn}
          onChange={(e) => set("packagingIn", Number(e.target.value))}
          className={`${cellCls} num text-center`}
        />
      </td>
      <td className="p-2 w-20">
        <input
          type="number"
          value={line.packagingOut}
          onChange={(e) => set("packagingOut", Number(e.target.value))}
          className={`${cellCls} num text-center`}
        />
      </td>
      <td className="p-2 w-20">
        <input
          type="number"
          value={line.weight}
          onChange={(e) => set("weight", Number(e.target.value))}
          className={`${cellCls} num text-center`}
        />
      </td>
      <td className="p-2 w-20">
        <input
          type="number"
          value={line.quantity}
          onChange={(e) => set("quantity", Number(e.target.value))}
          className={`${cellCls} num text-center`}
        />
      </td>
      <td className="p-2 w-24">
        <input
          type="number"
          value={line.price}
          onChange={(e) => set("price", Number(e.target.value))}
          className={`${cellCls} num text-center`}
        />
      </td>
      <td className="p-2 w-28 num text-center font-medium text-ink-900">
        {value.toLocaleString("ar-EG")}
      </td>
      <td className="p-2 min-w-[100px]">
        <input
          value={line.notes}
          onChange={(e) => set("notes", e.target.value)}
          className={cellCls}
        />
      </td>
      <td className="p-2 w-10 text-center">
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg text-negative hover:bg-negative/5"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}
