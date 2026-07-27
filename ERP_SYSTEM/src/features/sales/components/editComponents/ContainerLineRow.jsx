import { memo } from "react";
import { Trash2 } from "lucide-react";
import { useGetContainersSelectQuery } from "../../../containers/containersApi";
import CompactSelect from "../../../../shared/components/ui/CompactSelect";

/**
 * @param {{ line: Object, onChange: (line: Object) => void, onRemove: () => void, index: number }} props
 */
function ContainerLineRow({ line, onChange, onRemove, index }) {
  const { data: containers, isLoading } = useGetContainersSelectQuery();

  const set = (key, value) => onChange({ ...line, [key]: value });

  const handleContainerChange = (containerId) => {
    const selected = containers?.find((c) => c.id === containerId);
    onChange({
      ...line,
      containerId,
      containerName: selected?.name,
      containerCode: selected?.code,
    });
  };

  const containerOptions =
    containers?.map((c) => ({ value: c.id, label: c.name })) || [];

  const inputCls =
    "w-full rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm num text-center bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-shadow";

  return (
    <tr className="border-b border-ink-400/5 last:border-0 hover:bg-ink-900/[0.012] transition-colors group">
      <td className="p-2.5 text-center text-ink-400 text-xs num">
        {index + 1}
      </td>
      <td className="p-2 min-w-[170px]">
        <CompactSelect
          options={containerOptions}
          value={line.containerId}
          onChange={handleContainerChange}
          isLoading={isLoading}
          placeholder="اختر العبوة"
        />
      </td>
      <td className="p-2 w-28">
        <input
          type="number"
          value={line.outgoingUnits ?? ""}
          onChange={(e) => set("outgoingUnits", Number(e.target.value))}
          className={inputCls}
          placeholder="0"
        />
      </td>
      <td className="p-2 w-28">
        <input
          type="number"
          value={line.incomingUnits ?? ""}
          onChange={(e) => set("incomingUnits", Number(e.target.value))}
          className={inputCls}
          placeholder="0"
        />
      </td>
      <td className="p-2 w-12 text-center">
        <button
          type="button"
          onClick={onRemove}
          className="p-2 rounded-lg text-ink-400 opacity-60 group-hover:opacity-100 hover:text-negative hover:bg-negative/10 transition-all"
          title="حذف العبوة"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}

export default memo(ContainerLineRow);
