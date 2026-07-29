import { useEffect, useRef, useState, memo } from "react";
import { Trash2, AlertCircle, PenLine, Plus } from "lucide-react";
import { toast } from "sonner";

import { useGetItemsSelectQuery } from "../../../inventory/inventoryApi";
import { useGetItemUnitsSelectQuery } from "../../../units/itemUnitsApi";
import { useGetItemBalanceQuery } from "../../../invoices/invoicesApi";

import CompactSelect from "../../../../shared/components/ui/CompactSelect";
import NumericInput from "../../../../shared/components/ui/NumericInput";
import Input from "../../../../shared/components/ui/Input";
import QuickAddItemModal from "../QuickAddItemModal";

function InvoiceLineRow({
  line,
  index,
  storeId,
  invoiceDate,
  onChange,
  onRemove,
}) {
  const [showAddItem, setShowAddItem] = useState(false);

  const {
    data: items,
    isLoading: isLoadingItems,
    isError: isItemsError,
  } = useGetItemsSelectQuery();

  const { data: balanceData, isLoading: isLoadingBalance } =
    useGetItemBalanceQuery(
      {
        storeId,
        itemId: line.itemId,
        asOfDate: invoiceDate,
      },
      {
        skip: !storeId || !line.itemId || !invoiceDate || line.isTemporaryItem,
      },
    );

  const { data: itemUnits, isLoading: isLoadingUnits } =
    useGetItemUnitsSelectQuery(line.itemId, {
      skip: !line.itemId || line.isTemporaryItem,
    });

  const set = (key, value) => {
    onChange({
      ...line,
      [key]: value,
    });
  };

  const isFirstItemRender = useRef(true);
  const prevItemIdRef = useRef(line.itemId);

  useEffect(() => {
    if (!items || !line.itemId || line.isTemporaryItem) return;

    const selected = items.find((item) => item.id === line.itemId);

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

        weight: null,
        count: null,
        quantity: null,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line.itemId, items]);

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
  }, [line.itemUnitId, itemUnits]);

  // العدد × الوزن = الكمية
  const handleCountChange = (count) => {
    const weight = Number(line.weight) || 0;

    onChange({
      ...line,
      count,
      quantity:
        count === "" || !weight ? line.quantity : Number(count) * weight,
    });
  };

  // الوزن × العدد = الكمية
  const handleWeightChange = (weight) => {
    const count = Number(line.count) || 0;

    onChange({
      ...line,
      weight,
      quantity:
        weight === "" || !count ? line.quantity : count * Number(weight),
    });
  };

  // الكمية ÷ العدد = الوزن (لو العدد متوفر)
  const handleQuantityChange = (quantity) => {
    if (quantity === "") {
      onChange({ ...line, quantity: null });
      return;
    }

    const count = Number(line.count) || 0;

    if (count > 0) {
      onChange({
        ...line,
        quantity: Number(quantity),
        weight: Number(quantity) / count,
      });
    } else {
      onChange({ ...line, quantity: Number(quantity) });
    }
  };

  const handleToggleTemporaryItem = () => {
    onChange({
      ...line,
      isTemporaryItem: !line.isTemporaryItem,
      itemId: null,
      itemName: "",
      itemCode: "",
      itemUnitId: null,
      itemUnitName: "",
      weight: null,
      count: null,
      quantity: null,
    });
  };

  const handleItemCreated = (newItem) => {
    onChange({
      ...line,
      isTemporaryItem: false,
      itemId: newItem.id,
      itemName: newItem.name,
      itemCode: newItem.code,
      itemUnitId: null,
      itemUnitName: "",
      weight: null,
      count: null,
      quantity: null,
    });
    setShowAddItem(false);
  };

  const handleRemove = () => {
    onRemove();

    toast.success("تم حذف الصنف من الفاتورة", {
      description: line.itemName || "صنف بدون اسم",
    });
  };

  const total = (Number(line.quantity) || 0) * (Number(line.price) || 0);

  const itemOptions =
    items?.map((item) => ({
      value: item.id,
      label: item.name,
    })) || [];

  const unitOptions =
    itemUnits?.map((unit) => ({
      value: unit.id,
      label: unit.name,
    })) || [];

  const readonlyCls =
    "w-full rounded-lg border border-ink-400/10 px-2.5 py-2 text-sm num text-center bg-ink-400/5 text-ink-600";

  return (
    <tr className="border-b border-ink-400/5 last:border-0 hover:bg-ink-900/[0.012] transition-colors group">
      {/* رقم السطر */}
      <td className="p-2.5 text-center text-ink-400 text-xs num w-10">
        {index + 1}
      </td>

      {/* الصنف */}
      <td className="p-2 min-w-[180px]">
        <div className="flex items-stretch gap-1">
          {line.isTemporaryItem ? (
            <input
              type="text"
              value={line.itemName}
              onChange={(e) => set("itemName", e.target.value)}
              placeholder="اكتب اسم الصنف"
              className="flex-1 min-w-0 rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm outline-none focus:border-primary-500"
            />
          ) : isItemsError ? (
            <div className="flex-1 flex items-center gap-1.5 text-xs text-negative px-2 py-2 bg-negative/5 rounded-lg">
              <AlertCircle size={13} />
              تعذر التحميل
            </div>
          ) : (
            <div className="flex-1 min-w-[180px]">
              <CompactSelect
                options={itemOptions}
                value={line.itemId}
                onChange={(value) => set("itemId", value)}
                isLoading={isLoadingItems}
                placeholder="اختر الصنف"
              />
            </div>
          )}
          <button
            type="button"
            onClick={handleToggleTemporaryItem}
            className={`shrink-0 px-2 rounded-lg transition-colors ${
              line.isTemporaryItem
                ? "bg-primary-100 text-primary-600"
                : "text-ink-400 hover:text-primary-500 hover:bg-primary-50"
            }`}
            title="صنف مش موجود بالمخزن - اكتب اسمه يدويًا"
          >
            <PenLine size={15} />
          </button>
          <button
            type="button"
            onClick={() => setShowAddItem(true)}
            className="shrink-0 px-2 rounded-lg text-ink-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
            title="إضافة صنف جديد للمخزون"
          >
            <Plus size={15} />
          </button>
        </div>
      </td>

      {/* الرصيد */}
      <td className="p-2 w-[110px]">
        <div className={`${readonlyCls} font-medium`}>
          {line.isTemporaryItem || !line.itemId
            ? "-"
            : isLoadingBalance
              ? "..."
              : Number(balanceData?.balance ?? 0).toLocaleString("ar-EG")}
        </div>
      </td>

      {/* الوحدة */}
      <td className="p-2 min-w-[120px]">
        <CompactSelect
          options={unitOptions}
          value={line.itemUnitId}
          onChange={(value) => set("itemUnitId", value)}
          isLoading={isLoadingUnits}
          isDisabled={!line.itemId || line.isTemporaryItem}
          placeholder={
            line.isTemporaryItem
              ? "غير متاح للصنف اليدوي"
              : line.itemId
                ? "الوحدة"
                : "اختر الصنف أولاً"
          }
        />
      </td>

      {/* العدد */}
      <td className="p-2 w-[90px]">
        <NumericInput
          value={line.count}
          decimals={true}
          placeholder="العدد"
          onChange={handleCountChange}
        />
      </td>

      {/* الوزن */}
      <td className="p-2 w-[100px]">
        <NumericInput
          value={line.weight}
          decimals={true}
          placeholder="الوزن"
          onChange={handleWeightChange}
        />
      </td>

      {/* الكمية */}
      <td className="p-2 w-[110px]">
        <NumericInput
          value={line.quantity}
          decimals={true}
          placeholder="الكمية"
          onChange={handleQuantityChange}
        />
      </td>

      {/* السعر */}
      <td className="p-2 w-[120px]">
        <NumericInput
          value={line.price}
          decimals={true}
          placeholder="السعر"
          onChange={(value) => set("price", value === "" ? null : value)}
        />
      </td>

      {/* الإجمالي */}
      <td className="p-2 w-[130px] text-center">
        <span className="num font-semibold">
          {total.toLocaleString("ar-EG")}
        </span>
      </td>

      {/* الملاحظات */}
      <td className="p-2 min-w-[150px]">
        <Input
          value={line.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          className="
            w-full
            rounded-lg
            border
            border-ink-400/15
            px-2.5
            py-2
            text-sm
            bg-white
            focus:outline-none
            focus:border-primary-500
          "
          placeholder="ملاحظات"
        />
      </td>

      <td className="p-2 w-[50px] text-center">
        <button
          type="button"
          onClick={handleRemove}
          className="
            p-2
            rounded-lg
            text-ink-400
            hover:text-negative
            hover:bg-negative/10
            transition
          "
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

export default memo(InvoiceLineRow);
