import { useEffect, useState, memo } from "react";
import { Trash2, AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { useGetItemsSelectQuery } from "../../../inventory/inventoryApi";
import QuickAddItemModal from "../QuickAddItemModal";
import CompactSelect from "../../../../shared/components/ui/CompactSelect";
import { useGetItemUnitsSelectQuery } from "../../../units/itemUnitsApi";

function NewInvoiceLineRow({ line, onChange, onRemove, index }) {
  const {
    data: items,
    isLoading: isLoadingItems,
    isError: isItemsError,
  } = useGetItemsSelectQuery();
  const { data: itemUnits, isLoading: isLoadingUnits } =
    useGetItemUnitsSelectQuery(line.itemId, { skip: !line.itemId });
  const [showAddItem, setShowAddItem] = useState(false);

  const set = (key, value) => onChange({ ...line, [key]: value });

  useEffect(() => {
    const selected = items?.find((i) => i.id === line.itemId);
    if (selected)
      onChange({ ...line, itemId: line.itemId, itemName: selected.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line.itemId, items]);

  useEffect(() => {
    const unit = itemUnits?.find((u) => u.id === line.packagingUnitId);

    if (unit) {
      onChange({
        ...line,
        packagingUnitName: unit.name,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line.packagingUnitId, itemUnits]);

  const handleCountChange = (count) => {
    const weight = Number(line.unitWeight) || 0;

    onChange({
      ...line,
      packagingCount: count,
      quantity: count * weight,
    });
  };

  const handleItemCreated = (newItem) => {
    set("itemId", newItem.id);
    toast.info("تم اختيار الصنف الجديد في هذا الصف");
  };

  const handleRemove = () => {
    onRemove();
    toast.success("تم حذف الصنف من الفاتورة", {
      description: line.itemName || "صنف بدون اسم",
    });
  };

  const hasPrice = Number(line.price) > 0;
  const value = hasPrice
    ? (Number(line.quantity) || 0) * Number(line.price)
    : 0;

  const itemOptions = items?.map((i) => ({ value: i.id, label: i.name })) || [];
  const unitOptions =
    itemUnits?.map((u) => ({ value: u.id, label: u.name })) || [];

  const inputCls =
    "w-full rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm num text-center bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-shadow";
  const readonlyCls =
    "w-full rounded-lg border border-ink-400/10 px-2.5 py-2 text-sm num text-center bg-ink-400/5 text-ink-600";

  return (
    <tr className="border-b border-ink-400/5 last:border-0 hover:bg-ink-900/[0.012] transition-colors group">
      <td className="p-2.5 text-center text-ink-400 text-xs num">
        {index + 1}
      </td>

      {/* الصنف + زرار إضافة */}
      <td className="p-2 min-w-[180px]">
        <div className="flex gap-1">
          {isItemsError ? (
            <div className="flex items-center gap-1.5 text-xs text-negative px-2 py-2 bg-negative/5 rounded-lg flex-1">
              <AlertCircle size={13} />
              تعذر التحميل
            </div>
          ) : (
            <div className="flex-1 min-w-64">
              <CompactSelect
                options={itemOptions}
                value={line.itemId}
                onChange={(val) => set("itemId", val)}
                isLoading={isLoadingItems}
                placeholder="اختر الصنف"
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowAddItem(true)}
            className="p-2 rounded-lg text-primary-500 hover:bg-primary-50 shrink-0"
            title="إضافة صنف جديد"
          >
            <Plus size={15} />
          </button>
        </div>
      </td>

      {/* الوحدة - خاصة بالصنف المختار */}
      <td className="p-2 min-w-[130px]">
        <CompactSelect
          options={unitOptions}
          value={line.packagingUnitId}
          onChange={(val) => set("packagingUnitId", val)}
          isLoading={isLoadingUnits}
          isDisabled={!line.itemId}
          placeholder={line.itemId ? "الوحدة" : "اختر الصنف أولاً"}
        />
      </td>

      <td className="p-2 w-20">
        <input
          type="number"
          value={line.packagingCount}
          onChange={(e) => handleCountChange(Number(e.target.value))}
          className={inputCls}
          placeholder="0"
        />
      </td>

      <td className="p-2 w-24">
        <input
          type="number"
          value={line.unitWeight || ""}
          onChange={(e) => {
            const weight = Number(e.target.value) || 0;

            onChange({
              ...line,
              unitWeight: weight,
              quantity: (Number(line.packagingCount) || 0) * weight,
            });
          }}
          className={inputCls}
          placeholder="الوزن"
        />{" "}
      </td>

      <td className="p-2 w-24">
        <div className={`${readonlyCls} font-medium text-ink-900`}>
          {(line.quantity || 0).toLocaleString("ar-EG")}
        </div>
      </td>

      <td className="p-2 w-28">
        <input
          type="number"
          value={line.price || ""}
          onChange={(e) =>
            set("price", e.target.value ? Number(e.target.value) : 0)
          }
          className={inputCls}
          placeholder="بدون سعر"
        />
      </td>

      <td className="p-2 w-28 text-center">
        {hasPrice ? (
          <span className="num font-semibold text-ink-900">
            {value.toLocaleString("ar-EG")}
          </span>
        ) : (
          <span className="inline-flex items-center text-xs text-gold-600 bg-gold-50 px-2 py-1 rounded-full">
            بانتظار التسعير
          </span>
        )}
      </td>

      <td className="p-2 min-w-[130px]">
        <input
          value={line.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="ملاحظة اختيارية"
          className="w-full rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-shadow placeholder:text-ink-400/50"
        />
      </td>

      <td className="p-2 w-12 text-center">
        <button
          type="button"
          onClick={handleRemove}
          className="p-2 rounded-lg text-ink-400 opacity-60 group-hover:opacity-100 hover:text-negative hover:bg-negative/10 transition-all"
          title="حذف الصنف"
        >
          <Trash2 size={15} />
        </button>
      </td>

      <QuickAddItemModal
        isOpen={showAddItem}
        onClose={() => setShowAddItem(false)}
        onCreated={handleItemCreated}
      />
    </tr>
  );
}

export default memo(NewInvoiceLineRow);
