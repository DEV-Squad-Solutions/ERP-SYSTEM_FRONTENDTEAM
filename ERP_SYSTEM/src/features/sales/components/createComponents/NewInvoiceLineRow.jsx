import { useEffect, useRef, useState, memo } from "react";
import { Trash2, AlertCircle, PenLine, Plus, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { useGetItemUnitsSelectQuery } from "../../../units/itemUnitsApi";

import CompactSelect from "../../../../shared/components/ui/CompactSelect";
import NumericInput from "../../../../shared/components/ui/NumericInput";
import Input from "../../../../shared/components/ui/Input";
import QuickAddItemModal from "../../../inventory/components/QuickAddItemModal";
import { useGetItemBalanceQuery } from "../../../invoices/invoicesApi";

const round2 = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.round((number + Number.EPSILON) * 100) / 100;
};

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

function InvoiceLineRow({
  line,
  index,
  storeId,
  invoiceDate,

  // =========================================================
  // الأصناف تأتي من CreateInvoiceForm
  // =========================================================
  items,
  isLoadingItems,
  isItemsError,

  onChange,
  onRemove,
}) {
  const [showAddItem, setShowAddItem] = useState(false);

  const isReturnLine = Boolean(line.isReturnLine);

  // =========================================================
  // رصيد الصنف
  // =========================================================

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

  // =========================================================
  // وحدات الصنف
  // =========================================================

  const { data: itemUnits, isLoading: isLoadingUnits } =
    useGetItemUnitsSelectQuery(line.itemId, {
      skip: !line.itemId || line.isTemporaryItem || isReturnLine,
    });

  // =========================================================
  // خيارات الأصناف
  // =========================================================

  const itemOptions =
    items?.map((item) => ({
      value: item.id,
      label: item.name,
    })) || [];

  // =========================================================
  // Helper
  // =========================================================

  const set = (key, value) => {
    onChange({
      ...line,
      [key]: value,
    });
  };

  // =========================================================
  // تحديث بيانات الصنف عند اختياره
  // =========================================================

  const isFirstItemRender = useRef(true);
  const prevItemIdRef = useRef(line.itemId);

  useEffect(() => {
    if (!items || !line.itemId || line.isTemporaryItem || isReturnLine) {
      return;
    }

    const selected = items.find(
      (item) => String(item.id) === String(line.itemId),
    );

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

    if (String(line.itemId) !== String(prevItemIdRef.current)) {
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

  // =========================================================
  // تحديث اسم الوحدة
  // =========================================================

  useEffect(() => {
    if (!itemUnits || !line.itemUnitId || isReturnLine) {
      return;
    }

    const unit = itemUnits.find(
      (u) => String(u.id) === String(line.itemUnitId),
    );

    if (!unit) return;

    if (unit.name === line.itemUnitName) return;

    onChange({
      ...line,
      itemUnitId: unit.id,
      itemUnitName: unit.name,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line.itemUnitId, itemUnits]);

  // =========================================================
  // العدد
  // =========================================================

  const handleCountChange = (count) => {
    if (count === "") {
      onChange({
        ...line,
        count: "",
      });

      return;
    }

    if (count.endsWith(".")) {
      onChange({
        ...line,
        count,
      });

      return;
    }

    const countNumber = toNumber(count);
    const weightNumber = toNumber(line.weight);

    if (countNumber === null || weightNumber === null) {
      onChange({
        ...line,
        count,
      });

      return;
    }

    onChange({
      ...line,
      count,
      quantity: round2(countNumber * weightNumber),
    });
  };

  // =========================================================
  // وزن الوحدة
  // =========================================================

  const handleWeightChange = (weight) => {
    if (weight === "") {
      onChange({
        ...line,
        weight: "",
      });

      return;
    }

    if (weight.endsWith(".")) {
      onChange({
        ...line,
        weight,
      });

      return;
    }

    const weightNumber = toNumber(weight);
    const countNumber = toNumber(line.count);

    if (weightNumber === null || countNumber === null) {
      onChange({
        ...line,
        weight,
      });

      return;
    }

    onChange({
      ...line,
      weight,
      quantity: round2(countNumber * weightNumber),
    });
  };

  // =========================================================
  // الكمية
  // =========================================================

  const handleQuantityChange = (quantity) => {
    if (quantity === "") {
      onChange({
        ...line,
        quantity: "",
      });

      return;
    }

    if (quantity.endsWith(".")) {
      onChange({
        ...line,
        quantity,
      });

      return;
    }

    const qty = toNumber(quantity);

    if (qty === null) {
      onChange({
        ...line,
        quantity,
      });

      return;
    }

    // المرتجع
    if (isReturnLine && line.maxReturnQuantity != null) {
      const maxReturnQuantity = toNumber(line.maxReturnQuantity);

      if (maxReturnQuantity !== null && qty > maxReturnQuantity) {
        const limitedQuantity = round2(maxReturnQuantity);

        toast.warning("الكمية محدودة بالمتاح للإرجاع", {
          description: `أقصى كمية: ${limitedQuantity}`,
        });

        onChange({
          ...line,
          quantity: limitedQuantity,
        });

        return;
      }
    }

    const count = toNumber(line.count);

    onChange({
      ...line,
      quantity,
      ...(count !== null && count > 0 && !isReturnLine
        ? {
            weight: round2(qty / count),
          }
        : {}),
    });
  };

  // =========================================================
  // صنف يدوي
  // =========================================================

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

  // =========================================================
  // إضافة صنف جديد
  // =========================================================

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

  // =========================================================
  // حذف
  // =========================================================

  const handleRemove = () => {
    onRemove();

    toast.success("تم حذف الصنف من الفاتورة", {
      description: line.itemName || "صنف بدون اسم",
    });
  };

  // =========================================================
  // الإجمالي
  // =========================================================

  const total =
    round2((toNumber(line.quantity) ?? 0) * (toNumber(line.price) ?? 0)) ?? 0;

  // =========================================================
  // خيارات الوحدات
  // =========================================================

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
      {/* =====================================================
          #
      ===================================================== */}

      <td className="p-2.5 text-center text-ink-400 text-xs num w-10">
        {index + 1}
      </td>

      {/* =====================================================
          الصنف
      ===================================================== */}

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
                تعذر تحميل الأصناف
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

            {/* صنف يدوي */}

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

            {/* إضافة صنف جديد */}

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

      {/* =====================================================
          الرصيد
      ===================================================== */}

      <td className="p-2 w-[130px]">
        <div
          className={`${readonlyCls} !text-right !bg-ink-400/5 flex flex-col gap-0.5 leading-tight px-2.5 py-1.5`}
        >
          {isReturnLine ? (
            <span className="font-medium">
              متاح: {round2(line.maxReturnQuantity) ?? "-"}
            </span>
          ) : line.isTemporaryItem || !line.itemId ? (
            <span>-</span>
          ) : isLoadingBalance ? (
            <span>...</span>
          ) : (
            <>
              <span className="font-medium">
                {(round2(balanceData?.balance) ?? 0).toLocaleString("ar-EG", {
                  maximumFractionDigits: 2,
                })}
              </span>

              <span className="text-[10px] text-ink-400">
                متوسط التكلفة:{" "}
                {(round2(balanceData?.averageCost) ?? 0).toLocaleString(
                  "ar-EG",
                  {
                    maximumFractionDigits: 2,
                  },
                )}
              </span>
            </>
          )}
        </div>
      </td>

      {/* =====================================================
          الوحدة
      ===================================================== */}

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

      {/* =====================================================
          العدد
      ===================================================== */}

      <td className="p-2 w-[90px]">
        {isReturnLine ? (
          <div className={readonlyCls}>—</div>
        ) : (
          <NumericInput
            value={line.count ?? ""}
            decimals
            maxDecimals={2}
            placeholder="العدد"
            onChange={handleCountChange}
          />
        )}
      </td>

      {/* =====================================================
          وزن الوحدة
      ===================================================== */}

      <td className="p-2 w-[100px]">
        {isReturnLine ? (
          <div className={readonlyCls}>—</div>
        ) : (
          <NumericInput
            value={line.weight ?? ""}
            decimals
            maxDecimals={2}
            placeholder="الوزن"
            onChange={handleWeightChange}
          />
        )}
      </td>

      {/* =====================================================
          الكمية
      ===================================================== */}

      <td className="p-2 w-[110px]">
        <NumericInput
          value={line.quantity ?? ""}
          decimals
          maxDecimals={2}
          placeholder="الكمية"
          onChange={handleQuantityChange}
        />
      </td>

      {/* =====================================================
          السعر
      ===================================================== */}

      <td className="p-2 w-[120px]">
        <NumericInput
          value={line.price ?? ""}
          decimals
          maxDecimals={2}
          placeholder="السعر"
          disabled={isReturnLine}
          onChange={(value) => set("price", value === "" ? null : value)}
        />
      </td>

      {/* =====================================================
          القيمة
      ===================================================== */}

      <td className="p-2 w-[130px] text-center">
        <span className="num font-semibold">
          {total.toLocaleString("ar-EG")}
        </span>
      </td>

      {/* =====================================================
          ملاحظات
      ===================================================== */}

      <td className="p-2 min-w-[150px]">
        <Input
          value={line.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          className="w-full rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm bg-white focus:outline-none focus:border-primary-500"
          placeholder="ملاحظات"
        />
      </td>

      {/* =====================================================
          حذف
      ===================================================== */}

      <td className="p-2 w-[50px] text-center">
        <button
          type="button"
          onClick={handleRemove}
          className="p-2 rounded-lg text-ink-400 hover:text-negative hover:bg-negative/10 transition"
        >
          <Trash2 size={15} />
        </button>
      </td>

      {/* =====================================================
          إضافة صنف جديد
      ===================================================== */}

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
