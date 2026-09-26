import { useEffect, useMemo, memo, useCallback } from "react";
import { Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useGetItemsSelectQuery } from "../../../inventory/inventoryApi";
import { useGetItemUnitsSelectQuery } from "../../../units/itemUnitsApi";
import CompactSelect from "../../../../shared/components/ui/CompactSelect";

/* =========================================================
   Helpers — نفس المنطق المستخدم في نسخة التعديل (NewInvoiceLineRow)
   عشان الحسابات والـ payload يتصرفوا بنفس الطريقة في الإنشاء والتعديل
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

/**
 * @param {{
 * line: Object,
 * index:number
 * }} props
 *
 * ملحوظة أداء:
 * بنستقبل updateLine/removeLine (مراجع ثابتة عبر useCallback من الأب)
 * بدل onChange/onRemove جاهزين ومربوطين بالـ index. لو الأب بيبعتهم
 * كـ (newLine) => updateLine(index, newLine) inline جوه .map()، بيتبنوا
 * من جديد كل render ويلغوا فايدة memo() هنا تمامًا. لو الأب (على
 * الأغلب CreateInvoiceForm) لسه بيبعت onChange/onRemove زي ما هما،
 * لازم يتعدّل هو كمان بنفس الباتيرن اللي اتعمل في InvoiceEditPage.
 */

function InvoiceLineRow({ line, updateLine, removeLine, index }) {
  const onChange = useCallback(
    (newLine) => updateLine(index, newLine),
    [updateLine, index],
  );

  const onRemove = useCallback(() => removeLine(index), [removeLine, index]);

  const {
    data: items,
    isLoading: isLoadingItems,
    isError: isItemsError,
  } = useGetItemsSelectQuery();

  // الفيكس الأساسي: بنبعت line.itemId ونعمل skip لو مفيش صنف مختار،
  // بدل ما نجيب وحدات مش متربطة بالصنف خالص.
  const { data: itemUnits, isLoading: isLoadingUnits } =
    useGetItemUnitsSelectQuery(line.itemId, {
      skip: !line.itemId,
    });

  const set = useCallback(
    (key, value) => {
      onChange({
        ...line,
        [key]: value,
      });
    },
    [line, onChange],
  );

  /**
   * تحديث بيانات الصنف فقط
   */
  useEffect(() => {
    if (!items || !line.itemId) return;

    const selected = items.find((i) => i.id === line.itemId);

    if (!selected) return;

    // ما ننادوش onChange غير لو الاسم/الكود فعلاً مختلفين، عشان
    // مانعملش تحديث بلا داعي كل مرة الـ items array يتغيّر reference
    // بتاعها (زي refetch وقت العودة للتاب).
    if (line.itemName === selected.name && line.itemCode === selected.code) {
      return;
    }

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

    if (unit.name === line.itemUnitName) return;

    onChange({
      ...line,
      itemUnitName: unit.name,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line.itemUnitId, itemUnits]);

  /**
   * تغيير العدد
   *
   * مهم: لما الحقل يتفضّى بنسيب count = "" مش 0، عشان buildInvoicePayload
   * (hasCount check) يعتبره "مش موجود" ويرجع لوضع "الكمية فقط" بدل ما
   * يبعت count:0 للسيرفر غصب عنك.
   */
  const handleCountChange = useCallback(
    (rawValue) => {
      if (rawValue === "") {
        onChange({
          ...line,
          count: "",
          quantity: toNumber(line.weight) !== null ? 0 : line.quantity,
        });

        return;
      }

      const count = Number(rawValue);
      const weight = toNumber(line.weight) ?? 0;

      onChange({
        ...line,
        count,
        quantity: round2(count * weight),
      });
    },
    [line, onChange],
  );

  /**
   * تغيير الوزن يدويا
   */
  const handleWeightChange = useCallback(
    (rawValue) => {
      if (rawValue === "") {
        onChange({
          ...line,
          weight: "",
          quantity: toNumber(line.count) !== null ? 0 : line.quantity,
        });

        return;
      }

      const weight = Number(rawValue);
      const count = toNumber(line.count) ?? 0;

      onChange({
        ...line,
        weight,
        quantity: round2(count * weight),
      });
    },
    [line, onChange],
  );

  const handleRemove = useCallback(() => {
    onRemove();

    toast.success("تم حذف الصنف من الفاتورة", {
      description: line.itemName || "صنف بدون اسم",
    });
  }, [line.itemName, onRemove]);

  const total =
    round2((toNumber(line.quantity) ?? 0) * (toNumber(line.price) ?? 0)) ?? 0;

  const itemOptions = useMemo(
    () =>
      items?.map((i) => ({
        value: i.id,
        label: i.name,
      })) || [],
    [items],
  );

  const unitOptions = useMemo(
    () =>
      itemUnits?.map((u) => ({
        value: u.id,
        label: u.name,
      })) || [],
    [itemUnits],
  );

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
          onChange={(e) => handleCountChange(e.target.value)}
          className={inputCls}
          placeholder="0"
        />
      </td>

      {/* الوزن Editable */}
      <td className="p-2 w-24">
        <input
          type="number"
          value={line.weight ?? ""}
          onChange={(e) => handleWeightChange(e.target.value)}
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
            set("price", e.target.value === "" ? "" : Number(e.target.value))
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
