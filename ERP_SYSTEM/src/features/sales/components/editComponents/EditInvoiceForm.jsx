import { useEffect, memo } from "react";
import { Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useGetItemsSelectQuery } from "../../../inventory/inventoryApi";
import { useGetItemUnitsSelectQuery } from "../../../units/itemUnitsApi";
import CompactSelect from "../../../../shared/components/ui/CompactSelect";

/**
 * @param {{
 * line: Object,
 * onChange: (line:Object)=>void,
 * onRemove: ()=>void,
 * index:number
 * }} props
 */

function InvoiceLineRow({ line, onChange, onRemove, index }) {
  const {
    data: items,
    isLoading: isLoadingItems,
    isError: isItemsError,
  } = useGetItemsSelectQuery();

  const { data: itemUnits, isLoading: isLoadingUnits } =
    useGetItemUnitsSelectQuery();

  const set = (key, value) => {
    onChange({
      ...line,
      [key]: value,
    });
  };

  /**
   * تحديث بيانات الصنف فقط
   */
  useEffect(() => {
    if (!items || !line.itemId) return;

    const selected = items.find((i) => i.id === line.itemId);

    if (!selected) return;

    onChange({
      ...line,
      itemId: selected.id,
      itemName: selected.name,
      itemCode: selected.code,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line.itemId, items]);

  /**
   * تحديث اسم الوحدة فقط
   * الوزن لا يتغير من الوحدة
   */
  useEffect(() => {
    if (!itemUnits || !line.itemUnitId) return;

    const unit = itemUnits.find((u) => u.id === line.itemUnitId);

    if (!unit) return;

    onChange({
      ...line,
      itemUnitName: unit.name,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line.itemUnitId, itemUnits]);

  /**
   * تغيير العدد
   */
  const handleCountChange = (count) => {
    const weight = Number(line.weight) || 0;

    onChange({
      ...line,
      count,
      quantity: count * weight,
    });
  };

  /**
   * تغيير الوزن يدويا
   */
  const handleWeightChange = (weight) => {
    const count = Number(line.count) || 0;

    onChange({
      ...line,
      weight,
      quantity: count * weight,
    });
  };

  const handleRemove = () => {
    onRemove();

    toast.success("تم حذف الصنف من الفاتورة", {
      description: line.itemName || "صنف بدون اسم",
    });
  };

  const total = (Number(line.quantity) || 0) * (Number(line.price) || 0);

  const itemOptions =
    items?.map((i) => ({
      value: i.id,
      label: i.name,
    })) || [];

  const unitOptions =
    itemUnits?.map((u) => ({
      value: u.id,
      label: u.name,
    })) || [];

  const inputCls =
    "w-full rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm num text-center bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-shadow";

  const readonlyCls =
    "w-full rounded-lg border border-ink-400/10 px-2.5 py-2 text-sm num text-center bg-ink-400/5 text-ink-600";

  return (
    <tr className="border-b border-ink-400/5 last:border-0 hover:bg-ink-900/[0.012] transition-colors group">
      {/* رقم السطر */}
      <td className="p-2.5 text-center text-ink-400 text-xs num">
        {index + 1}
      </td>

      {/* الصنف */}
      <td className="p-2 min-w-[170px]">
        {isItemsError ? (
          <div className="flex items-center gap-1.5 text-xs text-negative px-2 py-2 bg-negative/5 rounded-lg">
            <AlertCircle size={13} />
            تعذر التحميل
          </div>
        ) : (
          <CompactSelect
            options={itemOptions}

            value={line.itemId}

            onChange={(value) => set("itemId", value)}

            isLoading={isLoadingItems}

            placeholder="اختر الصنف"
          />
        )}
      </td>

      {/* الوحدة */}
      <td className="p-2 min-w-[120px]">
        <CompactSelect
          options={unitOptions}

          value={line.itemUnitId}

          onChange={(value) => set("itemUnitId", value)}

          isLoading={isLoadingUnits}

          isDisabled={!line.itemId}

          placeholder={line.itemId ? "الوحدة" : "اختر الصنف أولاً"}
        />
      </td>

      {/* العدد */}
      <td className="p-2 w-20">
        <input
          type="number"

          value={line.count ?? ""}

          onChange={(e) => handleCountChange(Number(e.target.value))}

          className={inputCls}

          placeholder="0"
        />
      </td>

      {/* الوزن Editable */}
      <td className="p-2 w-24">
        <input
          type="number"

          value={line.weight ?? ""}

          onChange={(e) => handleWeightChange(Number(e.target.value))}

          className={inputCls}

          placeholder="0"
        />
      </td>

      {/* الكمية محسوبة */}
      <td className="p-2 w-24">
        <div className={`${readonlyCls} font-medium text-ink-900`}>
          {(line.quantity || 0).toLocaleString("ar-EG")}
        </div>
      </td>

      {/* السعر */}
      <td className="p-2 w-28">
        <input
          type="number"

          value={line.price ?? ""}

          onChange={(e) =>
            set("price", e.target.value ? Number(e.target.value) : 0)
          }

          className={inputCls}

          placeholder="بدون سعر"
        />
      </td>

      {/* الإجمالي */}
      <td className="p-2 w-28 text-center">
        {Number(line.price) > 0 ? (
          <span className="num font-semibold text-ink-900">
            {total.toLocaleString("ar-EG")}
          </span>
        ) : (
          <span className="inline-flex items-center text-xs text-gold-600 bg-gold-50 px-2 py-1 rounded-full">
            بانتظار التسعير
          </span>
        )}
      </td>

      {/* الملاحظات */}
      <td className="p-2 min-w-[130px]">
        <input
          value={line.notes || ""}

          onChange={(e) => set("notes", e.target.value)}

          placeholder="ملاحظة اختيارية"

          className="w-full rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm bg-white focus:outline-none"
        />
      </td>

      {/* حذف */}
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
    </tr>
  );
}

export default memo(InvoiceLineRow);
