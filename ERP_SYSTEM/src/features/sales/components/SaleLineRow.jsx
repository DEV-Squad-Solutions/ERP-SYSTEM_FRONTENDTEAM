import { useState } from "react";
import {
  Trash2,
  Printer,
  Save,
  X,
  Pencil,
  Eye,
  EyeClosedIcon,
} from "lucide-react";
import { useGetItemsQuery } from "../../inventory/inventoryApi";
import {
  useUpdateSaleLineMutation,
  useDeleteSaleLineMutation,
} from "../salesApi";

export default function SaleLineRow({ row, index, onShowDetails }) {
  const { data: items } = useGetItemsQuery();
  const [updateLine] = useUpdateSaleLineMutation();
  const [deleteLine] = useDeleteSaleLineMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(row);

  const startEdit = () => {
    setDraft(row);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(row);
    setIsEditing(false);
  };

  const saveEdit = async () => {
    const selectedItem = items?.find((i) => i.id === draft.itemId);
    const changes = {
      ...draft,
      itemName: selectedItem ? selectedItem.name : draft.itemName,
      value:
        (Number(draft.quantityIn) + Number(draft.quantityOut)) *
        Number(draft.price),
    };
    await updateLine({ id: row.id, changes });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm("متأكد إنك عايز تحذف الصنف ده من الفاتورة؟")) {
      deleteLine(row.id);
    }
  };

  const handlePrint = () => window.print();

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  return (
    <tr className="border-b border-ink-400/5 last:border-0 hover:bg-ink-900/[0.015] transition-colors">
      <td className="p-3 text-center text-ink-400 text-sm num">{index + 1}</td>

      <td className="p-2 min-w-[160px]">
        {isEditing ? (
          <select
            value={draft.itemId}
            onChange={(e) => set("itemId", e.target.value)}
            className="w-full rounded-lg border border-ink-400/15 px-2.5 py-1.5 text-sm focus:outline-none focus:border-primary-500"
          >
            {items?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="font-medium text-ink-900">{row.itemName}</span>
        )}
      </td>

      <td className="p-2 text-sm text-ink-600">{row.unit}</td>

      <td className="p-2 w-20 text-center border-x border-ink-400/5">
        {isEditing ? (
          <input
            type="number"
            value={draft.quantityIn}
            onChange={(e) => set("quantityIn", Number(e.target.value))}
            className="w-full rounded-lg border border-ink-400/15 px-2 py-1.5 text-sm num text-center"
          />
        ) : (
          <span className="num text-positive">
            {row.quantityIn > 0 ? row.quantityIn : "—"}
          </span>
        )}
      </td>
      <td className="p-2 w-20 text-center border-l border-ink-400/5">
        {isEditing ? (
          <input
            type="number"
            value={draft.quantityOut}
            onChange={(e) => set("quantityOut", Number(e.target.value))}
            className="w-full rounded-lg border border-ink-400/15 px-2 py-1.5 text-sm num text-center"
          />
        ) : (
          <span className="num text-negative">
            {row.quantityOut > 0 ? row.quantityOut : "—"}
          </span>
        )}
      </td>

      <td className="p-2 w-24 text-center">
        {isEditing ? (
          <input
            type="number"
            value={draft.weight}
            onChange={(e) => set("weight", Number(e.target.value))}
            className="w-full rounded-lg border border-ink-400/15 px-2 py-1.5 text-sm num text-center"
          />
        ) : (
          <span className="num text-ink-600">
            {row.weight.toLocaleString("ar-EG")}
          </span>
        )}
      </td>

      <td className="p-2 w-24 text-center">
        {isEditing ? (
          <input
            type="number"
            value={draft.price}
            onChange={(e) => set("price", Number(e.target.value))}
            className="w-full rounded-lg border border-ink-400/15 px-2 py-1.5 text-sm num text-center"
          />
        ) : (
          <span className="num text-ink-600">
            {row.price.toLocaleString("ar-EG")}
          </span>
        )}
      </td>

      <td className="p-2 w-28 text-center num font-medium text-ink-900">
        {row.value.toLocaleString("ar-EG")}
      </td>

      <td className="p-2 min-w-[120px]">
        {isEditing ? (
          <input
            value={draft.notes}
            onChange={(e) => set("notes", e.target.value)}
            className="w-full rounded-lg border border-ink-400/15 px-2.5 py-1.5 text-sm"
          />
        ) : (
          <span className="text-ink-400 text-sm">{row.notes || "—"}</span>
        )}
      </td>

      <td className="p-2">
        <div className="flex gap-1 justify-center">
          {isEditing ? (
            <>
              <button
                onClick={saveEdit}
                className="p-1.5 rounded-lg text-positive hover:bg-positive/5"
              >
                <Save size={15} />
              </button>
              <button
                onClick={cancelEdit}
                className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-400/5"
              >
                <X size={15} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startEdit}
                className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={handlePrint}
                className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-400/5"
              >
                <Printer size={15} />
              </button>
              <button
                onClick={() => onShowDetails(row.invoiceNumber)}
                className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50"
                title="عرض تفاصيل الفاتورة"
              >
                <EyeClosedIcon size={15} />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg text-negative hover:bg-negative/5"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
