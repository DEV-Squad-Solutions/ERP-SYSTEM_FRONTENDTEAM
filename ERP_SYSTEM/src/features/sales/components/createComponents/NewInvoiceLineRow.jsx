import { useEffect, useRef, useState, useMemo, memo, useCallback } from "react";

import { Trash2, AlertCircle, PenLine, Plus, Undo2 } from "lucide-react";

import { toast } from "sonner";

import { useGetItemUnitsSelectQuery } from "../../../units/itemUnitsApi";

import CompactSelect from "../../../../shared/components/ui/CompactSelect";

import NumericInput from "../../../../shared/components/ui/NumericInput";

import Input from "../../../../shared/components/ui/Input";

import QuickAddItemModal from "../../../inventory/components/QuickAddItemModal";

import { useGetItemBalanceQuery } from "../../../invoices/invoicesApi";

/* =========================================================
   Helpers
========================================================= */

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

const fmtNumber = (value) =>
  (round2(value) ?? 0).toLocaleString("ar-EG", {
    maximumFractionDigits: 2,
  });

// الـ API (Invoices/item-balance) بيستنى asOfDate بصيغة DD/MM/YYYY، مش
// ISO. invoiceDate ممكن ييجي من input تاريخ بصيغة ISO (YYYY-MM-DD) أو
// Date object أو بالفعل DD/MM/YYYY، فبنوحّدها هنا قبل الاستعلام بدل ما
// نبعتها زي ما هي.
const toApiDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }

    const day = String(value.getDate()).padStart(2, "0");
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const year = value.getFullYear();

    return `${day}/${month}/${year}`;
  }

  const str = String(value);

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    return str;
  }

  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;

    return `${day}/${month}/${year}`;
  }

  return str;
};

/* =========================================================
   Component
========================================================= */

function InvoiceLineRow({
  line,
  index,
  storeId,
  invoiceDate,

  // الأصناف تأتي من CreateInvoiceForm
  items,
  itemOptions: itemOptionsProp,
  isLoadingItems,
  isItemsError,

  onChange,
  onRemove,
}) {
  const [showAddItem, setShowAddItem] = useState(false);

  const isReturnLine = Boolean(line.isReturnLine);

  /* =========================================================
     Refs
  ========================================================= */

  const isFirstItemRender = useRef(true);

  const prevItemIdRef = useRef(line.itemId);

  /* =========================================================
     رصيد الصنف
  ========================================================= */

  const asOfDate = useMemo(() => toApiDate(invoiceDate), [invoiceDate]);

  const { data: balanceData, isLoading: isLoadingBalance } =
    useGetItemBalanceQuery(
      {
        storeId,
        itemId: line.itemId,
        asOfDate,
      },
      {
        skip:
          !storeId ||
          !line.itemId ||
          !asOfDate ||
          line.isTemporaryItem ||
          isReturnLine,
      },
    );

  /* =========================================================
     وحدات الصنف
  ========================================================= */

  const { data: itemUnits, isLoading: isLoadingUnits } =
    useGetItemUnitsSelectQuery(line.itemId, {
      skip: !line.itemId || line.isTemporaryItem || isReturnLine,
    });

  /* =========================================================
     خيارات الأصناف
  ========================================================= */

  const itemOptions = useMemo(() => {
    if (itemOptionsProp) {
      return itemOptionsProp;
    }

    return (
      items?.map((item) => ({
        value: item.id,
        label: item.name,
      })) ?? []
    );
  }, [itemOptionsProp, items]);

  /* =========================================================
     خيارات الوحدات
  ========================================================= */

  const unitOptions = useMemo(
    () =>
      itemUnits?.map((unit) => ({
        value: unit.id,
        label: unit.name,
      })) || [],
    [itemUnits],
  );

  /* =========================================================
     Helper لتحديث السطر
  ========================================================= */

  const set = useCallback(
    (key, value) => {
      onChange({
        ...line,
        [key]: value,
      });
    },
    [line, onChange],
  );

  /* =========================================================
     تحديث بيانات الصنف عند اختياره
  ========================================================= */

  useEffect(() => {
    if (!items || !line.itemId || line.isTemporaryItem || isReturnLine) {
      return;
    }

    const selected = items.find(
      (item) => String(item.id) === String(line.itemId),
    );

    if (!selected) {
      return;
    }

    /* =====================================================
       أول Render
    ===================================================== */

    if (isFirstItemRender.current) {
      isFirstItemRender.current = false;

      prevItemIdRef.current = line.itemId;

      if (line.itemName === selected.name && line.itemCode === selected.code) {
        return;
      }

      onChange({
        ...line,
        itemId: selected.id,
        itemName: selected.name,
        itemCode: selected.code,
      });

      return;
    }

    /* =====================================================
       الصنف تغير
    ===================================================== */

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

  /* =========================================================
     تحديث اسم الوحدة
  ========================================================= */

  useEffect(() => {
    if (!itemUnits || !line.itemUnitId || isReturnLine) {
      return;
    }

    const unit = itemUnits.find(
      (u) => String(u.id) === String(line.itemUnitId),
    );

    if (!unit) {
      return;
    }

    if (unit.name === line.itemUnitName) {
      return;
    }

    onChange({
      ...line,
      itemUnitId: unit.id,
      itemUnitName: unit.name,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line.itemUnitId, itemUnits]);

  /* =========================================================
     العدد

     لو الكمية موجودة قبل التغيير:
       Weight = Quantity ÷ Count

     وإلا لو الوزن موجود:
       Quantity = Count × Weight

     وإلا نخزن العدد فقط.
  ========================================================= */

  const handleCountChange = useCallback(
    (count) => {
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

      if (countNumber === null) {
        onChange({
          ...line,
          count,
        });

        return;
      }

      const quantityNumber = toNumber(line.quantity);

      const weightNumber = toNumber(line.weight);

      /* =========================================
           العدد = صفر
        ========================================= */

      if (countNumber === 0) {
        onChange({
          ...line,

          count,

          ...(quantityNumber !== null
            ? {
                weight: null,
              }
            : weightNumber !== null
              ? {
                  quantity: 0,
                }
              : {}),
        });

        return;
      }

      /* =========================================
           الكمية موجودة

           Weight = Quantity ÷ Count
        ========================================= */

      if (quantityNumber !== null) {
        onChange({
          ...line,

          count,

          weight: round2(quantityNumber / countNumber),
        });

        return;
      }

      /* =========================================
           الكمية غير موجودة
           لكن الوزن موجود

           Quantity = Count × Weight
        ========================================= */

      if (weightNumber !== null) {
        onChange({
          ...line,

          count,

          quantity: round2(countNumber * weightNumber),
        });

        return;
      }

      /* =========================================
           لا توجد كمية ولا وزن
        ========================================= */

      onChange({
        ...line,
        count,
      });
    },
    [line, onChange],
  );

  /* =========================================================
     وزن الوحدة

     لو العدد موجود:
       Quantity = Count × Weight

     وإلا لو الكمية موجودة:
       Count = Quantity ÷ Weight

     وإلا نخزن الوزن فقط.
  ========================================================= */

  const handleWeightChange = useCallback(
    (weight) => {
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

      if (weightNumber === null) {
        onChange({
          ...line,
          weight,
        });

        return;
      }

      const countNumber = toNumber(line.count);

      const quantityNumber = toNumber(line.quantity);

      /* =========================================
           الوزن = صفر
        ========================================= */

      if (weightNumber === 0) {
        onChange({
          ...line,

          weight,

          ...(countNumber !== null
            ? {
                quantity: 0,
              }
            : {}),
        });

        return;
      }

      /* =========================================
           العدد موجود

           Quantity = Count × Weight
        ========================================= */

      if (countNumber !== null && countNumber > 0) {
        onChange({
          ...line,

          weight,

          quantity: round2(countNumber * weightNumber),
        });

        return;
      }

      /* =========================================
           العدد غير موجود
           والكمية موجودة

           Count = Quantity ÷ Weight
        ========================================= */

      if (quantityNumber !== null && weightNumber > 0) {
        onChange({
          ...line,

          weight,

          count: round2(quantityNumber / weightNumber),
        });

        return;
      }

      /* =========================================
           لا يوجد عدد ولا كمية
        ========================================= */

      onChange({
        ...line,
        weight,
      });
    },
    [line, onChange],
  );

  /* =========================================================
     الكمية

     لو العدد موجود:
       Weight = Quantity ÷ Count

     وإلا لو الوزن موجود:
       Count = Quantity ÷ Weight

     وإلا نخزن الكمية فقط.
  ========================================================= */

  const handleQuantityChange = useCallback(
    (quantity) => {
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

      /* =========================================
           المرتجع
        ========================================= */

      if (isReturnLine && line.maxReturnQuantity != null) {
        const maxReturnQuantity = toNumber(line.maxReturnQuantity);

        if (maxReturnQuantity !== null && qty > maxReturnQuantity) {
          const limitedQuantity = round2(maxReturnQuantity);

          toast.warning("الكمية محدودة بالمتاح للإرجاع", {
            description: `أقصى كمية: ${limitedQuantity}`,
          });

          const countNumber = toNumber(line.count);

          if (countNumber !== null && countNumber > 0) {
            onChange({
              ...line,

              quantity: limitedQuantity,

              weight: round2(limitedQuantity / countNumber),
            });
          } else {
            onChange({
              ...line,

              quantity: limitedQuantity,
            });
          }

          return;
        }
      }

      const countNumber = toNumber(line.count);

      const weightNumber = toNumber(line.weight);

      /* =========================================
           العدد موجود

           Weight = Quantity ÷ Count
        ========================================= */

      if (countNumber !== null && countNumber > 0) {
        onChange({
          ...line,

          quantity,

          weight: round2(qty / countNumber),
        });

        return;
      }

      /* =========================================
           العدد غير موجود
           والوزن موجود

           Count = Quantity ÷ Weight
        ========================================= */

      if (weightNumber !== null && weightNumber > 0) {
        onChange({
          ...line,

          quantity,

          count: round2(qty / weightNumber),
        });

        return;
      }

      /* =========================================
           لا يوجد عدد ولا وزن
        ========================================= */

      onChange({
        ...line,
        quantity,
      });
    },
    [line, onChange, isReturnLine],
  );

  /* =========================================================
     صنف يدوي
  ========================================================= */

  const handleToggleTemporaryItem = useCallback(() => {
    if (isReturnLine) {
      return;
    }

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
  }, [line, onChange, isReturnLine]);

  /* =========================================================
     إضافة صنف جديد
  ========================================================= */

  const handleItemCreated = useCallback(
    (newItem) => {
      if (!newItem?.id) {
        toast.error("تم إنشاء الصنف ولكن لم يتم استلام بياناته");

        return;
      }

      onChange({
        ...line,

        isTemporaryItem: false,

        itemId: newItem.id,

        itemName: newItem.name ?? "",

        itemCode: newItem.code ?? "",

        itemUnitId: newItem.itemUnitId ?? null,

        itemUnitName: newItem.itemUnitName ?? "",

        weight: null,
        count: null,
        quantity: null,
      });

      setShowAddItem(false);

      toast.success(`تم إضافة الصنف "${newItem.name}" واختياره`);
    },
    [line, onChange],
  );

  /* =========================================================
     حذف
  ========================================================= */

  const handleRemove = useCallback(() => {
    onRemove();

    toast.success("تم حذف الصنف من الفاتورة", {
      description: line.itemName || "صنف بدون اسم",
    });
  }, [line.itemName, onRemove]);

  /* =========================================================
     الإجمالي

     Total = Quantity × Price
  ========================================================= */

  const total =
    round2((toNumber(line.quantity) ?? 0) * (toNumber(line.price) ?? 0)) ?? 0;

  /* =========================================================
     CSS
  ========================================================= */

  const readonlyCls =
    "w-full rounded-lg border border-ink-400/10 px-2.5 py-2 text-sm num text-center bg-ink-400/5 text-ink-600 transition-colors";

  const iconButtonCls =
    "shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 active:scale-90";

  /* =========================================================
     Render
  ========================================================= */

  return (
    <tr
      className={`animate-in fade-in slide-in-from-top-1 duration-200 border-b border-ink-400/5 last:border-0 transition-colors group ${
        isReturnLine ? "bg-primary-500/[0.025]" : "hover:bg-ink-900/[0.015]"
      }`}
    >
      {/* =====================================================
          #
      ===================================================== */}

      <td className="p-2.5 text-center text-ink-300 text-xs num w-10 font-medium">
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
                value={line.itemName ?? ""}
                onChange={(e) => set("itemName", e.target.value)}
                placeholder="اكتب اسم الصنف"
                className="flex-1 min-w-0 rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
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

            <button
              type="button"
              onClick={handleToggleTemporaryItem}
              className={`${iconButtonCls} ${
                line.isTemporaryItem
                  ? "bg-primary-100 text-primary-600 hover:bg-primary-200"
                  : "text-ink-400 hover:text-primary-500 hover:bg-primary-50 hover:scale-105"
              }`}
              title="صنف مش موجود بالمخزن - اكتب اسمه يدويًا"
            >
              <PenLine size={15} />
            </button>

            <button
              type="button"
              onClick={() => setShowAddItem(true)}
              className={`${iconButtonCls} text-ink-400 hover:text-primary-500 hover:bg-primary-50 hover:scale-105`}
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
        <div className="rounded-lg border border-ink-400/10 bg-ink-400/5 px-2.5 py-1.5 text-right transition-colors">
          {isReturnLine ? (
            <span className="text-sm font-medium text-ink-700">
              متاح: {round2(line.maxReturnQuantity) ?? "-"}
            </span>
          ) : line.isTemporaryItem || !line.itemId ? (
            <span className="text-sm text-ink-300">—</span>
          ) : isLoadingBalance ? (
            <div className="flex flex-col items-end gap-1 py-0.5">
              <span className="h-3.5 w-14 animate-pulse rounded bg-ink-400/15" />
              <span className="h-2.5 w-20 animate-pulse rounded bg-ink-400/10" />
            </div>
          ) : (
            <div className="leading-tight">
              <span className="num block text-sm font-semibold text-ink-900">
                {fmtNumber(balanceData?.balance)}
              </span>

              <span className="num block text-[10px] text-ink-400">
                إجمالي التكلفة:
                {fmtNumber(balanceData?.totalCostWithPricingExpenses)}
              </span>
            </div>
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
        <span className="num inline-block rounded-lg bg-ink-900/[0.03] px-2.5 py-1 text-sm font-semibold text-ink-900 transition-colors">
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
          className="w-full rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm bg-white transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
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
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-ink-300 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-negative/10 hover:text-negative hover:scale-105 active:scale-90"
          title="حذف الصنف"
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
