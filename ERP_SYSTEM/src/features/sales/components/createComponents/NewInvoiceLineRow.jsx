import { useEffect, useRef, memo } from "react";
import { Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useGetItemsSelectQuery } from "../../../inventory/inventoryApi";
import { useGetItemUnitsSelectQuery } from "../../../units/itemUnitsApi";
import CompactSelect from "../../../../shared/components/ui/CompactSelect";

function InvoiceLineRow({ line, onChange, onRemove, index }) {
  const {
    data: items,
    isLoading: isLoadingItems,
    isError: isItemsError,
  } = useGetItemsSelectQuery();

  const { data: itemUnits, isLoading: isLoadingUnits } =
    useGetItemUnitsSelectQuery(line.itemId, {
      skip: !line.itemId,
    });

  const set = (key, value) => {
    onChange({
      ...line,
      [key]: value,
    });
  };

  // تتبّع أول تحميل للصف عشان منصفرش بيانات جاية من الباك (تعديل فاتورة موجودة)
  const isFirstItemRender = useRef(true);
  const prevItemIdRef = useRef(line.itemId);

  /**
   * عند اختيار الصنف
   * أول تحميل (mount): بس بنحدّث اسم/كود الصنف، من غير ما نلمس أي حاجة تانية
   * (عشان القيم دي ممكن تكون جاية جاهزة من الباك في وضع التعديل)
   * أي تغيير بعد كده (المستخدم غيّر الصنف فعلاً): بنصفّر الوحدة والوزن والكمية
   * لأنه صنف مختلف تمامًا
   */
  useEffect(() => {
    if (!items || !line.itemId) return;

    const selected = items.find((i) => i.id === line.itemId);
    if (!selected) return;

    if (isFirstItemRender.current) {
      isFirstItemRender.current = false;
      prevItemIdRef.current = line.itemId;
      onChange({
        ...line,
        itemId: selected.id,
        itemName: selected.name,
        itemCode: selected.code,
      });
      return;
    }

    if (line.itemId !== prevItemIdRef.current) {
      prevItemIdRef.current = line.itemId;
      onChange({
        ...line,
        itemId: selected.id,
        itemName: selected.name,
        itemCode: selected.code,
        itemUnitId: null,
        itemUnitName: "",
        weight: 0,
        quantity: 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line.itemId, items]);

  /**
   * عند اختيار الوحدة
   * الوحدة اسم بس، مالهاش أي علاقة بالوزن أو الكمية إطلاقًا
   */
  useEffect(() => {
    if (!itemUnits || !line.itemUnitId) return;

    const unit = itemUnits.find((u) => u.id === line.itemUnitId);
    if (!unit) return;

    if (unit.name === line.itemUnitName) return;

    onChange({
      ...line,
      itemUnitId: unit.id,
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
   * تغيير الوزن
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
        />
      </td>

      {/* الوزن */}
      <td className="p-2 w-24">
        <input
          type="number"
          value={line.weight ?? ""}
          onChange={(e) => handleWeightChange(Number(e.target.value))}
          className={inputCls}
        />
      </td>

      {/* الكمية */}
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
            set("price", e.target.value === "" ? 0 : Number(e.target.value))
          }
          className={inputCls}
        />
      </td>

      {/* الإجمالي */}
      <td className="p-2 w-28 text-center">
        <span className="num font-semibold">
          {total.toLocaleString("ar-EG")}
        </span>
      </td>

      {/* الملاحظات */}
      <td className="p-2 min-w-[130px]">
        <input
          value={line.notes || ""}
          onChange={(e) => set("notes", e.target.value)}
          className="w-full rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm bg-white"
          placeholder="ملاحظات"
        />
      </td>

      {/* حذف */}
      <td className="p-2 w-12 text-center">
        <button
          type="button"
          onClick={handleRemove}
          className="p-2 rounded-lg text-ink-400 hover:text-negative hover:bg-negative/10"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}

export default memo(InvoiceLineRow);
