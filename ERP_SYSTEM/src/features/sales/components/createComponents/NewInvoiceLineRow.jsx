import { useEffect, useRef, useState, memo } from "react";
import { Trash2, AlertCircle, PenLine, Plus, Undo2 } from "lucide-react";
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
  const isReturnLine = Boolean(line.isReturnLine);

  const {
    data: items,
    isLoading: isLoadingItems,
    isError: isItemsError,
  } = useGetItemsSelectQuery(undefined, { skip: isReturnLine });

  const { data: balanceData, isLoading: isLoadingBalance } =
    useGetItemBalanceQuery(
      {
        storeId,
        itemId: line.itemId,
        asOfDate: invoiceDate,
      },
      {
        skip:
          !storeId ||
          !line.itemId ||
          !invoiceDate ||
          line.isTemporaryItem ||
          isReturnLine,
      },
    );

  const { data: itemUnits, isLoading: isLoadingUnits } =
    useGetItemUnitsSelectQuery(line.itemId, {
      skip: !line.itemId || line.isTemporaryItem || isReturnLine,
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
    if (!items || !line.itemId || line.isTemporaryItem || isReturnLine) return;

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
    if (!itemUnits || !line.itemUnitId || isReturnLine) return;

    const unit = itemUnits.find((u) => u.id === line.itemUnitId);

    if (!unit) return;

    if (unit.name === line.itemUnitName) return;

    onChange({
      ...line,
      itemUnitId: unit.id,
      itemUnitName: unit.name,
    });
  }, [line.itemUnitId, itemUnits]);

  const handleCountChange = (count) => {
    const weight = Number(line.weight) || 0;

    onChange({
      ...line,
      count,
      quantity:
        count === "" || !weight ? line.quantity : Number(count) * weight,
    });
  };

  const handleWeightChange = (weight) => {
    const count = Number(line.count) || 0;

    onChange({
      ...line,
      weight,
      quantity:
        weight === "" || !count ? line.quantity : count * Number(weight),
    });
  };

  const handleQuantityChange = (quantity) => {
    if (quantity === "") {
      onChange({ ...line, quantity: null });
      return;
    }

    let qty = Number(quantity);

    if (isReturnLine && line.maxReturnQuantity != null) {
      if (qty > line.maxReturnQuantity) {
        qty = line.maxReturnQuantity;
        toast.warning("الكمية محدودة بالمتاح للإرجاع", {
          description: `أقصى كمية: ${line.maxReturnQuantity}`,
        });
      }
    }

    const count = Number(line.count) || 0;

    if (count > 0 && !isReturnLine) {
      onChange({
        ...line,
        quantity: qty,
        weight: qty / count,
      });
    } else {
      onChange({ ...line, quantity: qty });
    }
  };

  const handleToggleTemporaryItem = () => {
    if (isReturnLine) return;
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
    <tr
      className={`border-b border-ink-400/5 last:border-0 transition-colors group ${
        isReturnLine ? "bg-primary-500/[0.025]" : "hover:bg-ink-900/[0.012]"
      }`}
    >
      <td className="p-2.5 text-center text-ink-400 text-xs num w-10">
        {index + 1}
      </td>

      <td className="p-2 min-w-[180px]">
        {isReturnLine ? (
          <div className="flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50/60 px-2.5 py-2 text-sm text-ink-900">
            <Undo2 size={13} className="shrink-0 text-primary-500" />
            <span className="truncate">{line.itemName}</span>
            {line.sourceInvoiceNumber && (
              <span className="mr-auto shrink-0 text-[11px] text-ink-400">
                من {line.sourceInvoiceNumber}
              </span>
            )}
          </div>
        ) : (
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
        )}
      </td>

      <td className="p-2 w-[110px]">
        <div className={`${readonlyCls} font-medium`}>
          {isReturnLine
            ? `متاح: ${line.maxReturnQuantity ?? "-"}`
            : line.isTemporaryItem || !line.itemId
              ? "-"
              : isLoadingBalance
                ? "..."
                : Number(balanceData?.balance ?? 0).toLocaleString("ar-EG")}
        </div>
      </td>

      <td className="p-2 min-w-[120px]">
        {isReturnLine ? (
          <div className={readonlyCls}>{line.itemUnitName || "-"}</div>
        ) : (
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
        )}
      </td>

      <td className="p-2 w-[90px]">
        {isReturnLine ? (
          <div className={readonlyCls}>—</div>
        ) : (
          <NumericInput
            value={line.count}
            decimals={true}
            placeholder="العدد"
            onChange={handleCountChange}
          />
        )}
      </td>

      <td className="p-2 w-[100px]">
        {isReturnLine ? (
          <div className={readonlyCls}>—</div>
        ) : (
          <NumericInput
            value={line.weight}
            decimals={true}
            placeholder="الوزن"
            onChange={handleWeightChange}
          />
        )}
      </td>

      <td className="p-2 w-[110px]">
        <NumericInput
          value={line.quantity}
          decimals={true}
          placeholder="الكمية"
          onChange={handleQuantityChange}
        />
      </td>

      <td className="p-2 w-[120px]">
        <NumericInput
          value={line.price}
          decimals={true}
          placeholder="السعر"
          disabled={isReturnLine}
          onChange={(value) => set("price", value === "" ? null : value)}
        />
      </td>

      <td className="p-2 w-[130px] text-center">
        <span className="num font-semibold">
          {total.toLocaleString("ar-EG")}
        </span>
      </td>

      <td className="p-2 min-w-[150px]">
        <Input
          value={line.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          className="w-full rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm bg-white focus:outline-none focus:border-primary-500"
          placeholder="ملاحظات"
        />
      </td>

      <td className="p-2 w-[50px] text-center">
        <button
          type="button"
          onClick={handleRemove}
          className="p-2 rounded-lg text-ink-400 hover:text-negative hover:bg-negative/10 transition"
        >
          <Trash2 size={15} />
        </button>
      </td>

      {!isReturnLine && (
        <QuickAddItemModal
          isOpen={showAddItem}
          onClose={() => setShowAddItem(false)}
          onCreated={handleItemCreated}
        />
      )}
    </tr>
  );
}

export default memo(InvoiceLineRow);
