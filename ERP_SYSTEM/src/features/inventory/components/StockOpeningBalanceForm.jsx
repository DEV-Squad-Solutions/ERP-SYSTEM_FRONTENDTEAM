import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Save,
  Loader2,
  X,
  Trash2,
  StoreIcon,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import { useGetStoresSelectQuery } from "../../stores/storesApi";
import { useGetItemsSelectQuery } from "../inventoryApi";
import {
  useCreateStockOpeningBalanceMutation,
  useUpdateStockOpeningBalanceMutation,
} from "../stockOpeningBalancesApi";
import {
  buildCreateStockOpeningBalanceRequest,
  buildStockOpeningBalanceUpdateBody,
} from "./buildStockOpeningBalancePayload";

import LedgerPanel from "../../../shared/components/ui/LedgerPanel";
import LedgerField from "../../../shared/components/ui/LedgerField";
import Button from "../../../shared/components/ui/Button";
import CompactSelect from "../../../shared/components/ui/CompactSelect";

const emptyLine = () => ({
  itemId: null,
  itemName: "",
  itemUnitName: "",
  count: "",
  weight: "",
  price: "",
  notes: "",
});

function emptyHeader() {
  return {
    storeId: "",
    documentNumber: "",
    documentDate: new Date().toISOString().slice(0, 10),
    notes: "",
  };
}

export default function StockOpeningBalanceForm({
  editingItem,
  onSuccess,
  onCancel,
}) {
  const { data: stores } = useGetStoresSelectQuery();
  const { data: items } = useGetItemsSelectQuery();

  const [createBalance, { isLoading: isCreating }] =
    useCreateStockOpeningBalanceMutation();
  const [updateBalance, { isLoading: isUpdating }] =
    useUpdateStockOpeningBalanceMutation();

  const isEditing = Boolean(editingItem);
  const isSaving = isCreating || isUpdating;

  const [header, setHeader] = useState(emptyHeader());
  const [lines, setLines] = useState(() =>
    Array.from({ length: 5 }, emptyLine),
  );

  useEffect(() => {
    if (editingItem) {
      setHeader({
        storeId: editingItem.storeId ?? "",
        documentNumber: editingItem.documentNumber ?? "",
        documentDate:
          editingItem.documentDate ?? new Date().toISOString().slice(0, 10),
        notes: editingItem.notes ?? "",
      });
      setLines(
        (editingItem.lines || []).map((l) => ({
          itemId: l.itemId,
          itemName: l.itemName,
          itemUnitName: l.itemUnitName,
          count: l.count,
          weight: l.weight,
          price: l.price,
          notes: l.notes || "",
        })),
      );
    }
  }, [editingItem]);

  const setHeaderField = (key, value) =>
    setHeader((h) => ({ ...h, [key]: value }));

  const updateLine = (index, patch) =>
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    );

  const removeLine = (index) =>
    setLines((prev) => prev.filter((_, i) => i !== index));

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);

  const handleItemChange = (index, itemId) => {
    const item = items?.find((it) => it.id === itemId);
    updateLine(index, {
      itemId,
      itemName: item?.name || "",
      itemUnitName: item?.unitName || "",
    });
  };

  // الكمية والإجمالي بيتحسبوا هنا للعرض بس - السيرفر هو اللي بيحسبهم فعليًا ومبيقبلش نبعتهم
  const linesWithTotals = useMemo(
    () =>
      lines.map((l) => {
        const quantity = (Number(l.count) || 0) * (Number(l.weight) || 0);
        const total = Math.round(quantity * (Number(l.price) || 0) * 100) / 100;
        return { ...l, quantity, total };
      }),
    [lines],
  );

  const documentTotal = linesWithTotals.reduce((sum, l) => sum + l.total, 0);

  const handleSubmit = async () => {
    if (!header.storeId) {
      toast.error("اختر المخزن");
      return;
    }
    if (!header.documentNumber.trim()) {
      toast.error("رقم المستند مطلوب");
      return;
    }
    if (header.documentNumber.trim().length > 50) {
      toast.error("رقم المستند لازم يكون 50 حرف كحد أقصى");
      return;
    }
    if (!header.documentDate) {
      toast.error("التاريخ مطلوب");
      return;
    }

    const validLinesCount = lines.filter(
      (l) => l.itemId && Number(l.count) > 0 && Number(l.weight) > 0,
    ).length;
    if (validLinesCount === 0) {
      toast.error("لازم صنف واحد على الأقل بعدد ووزن أكبر من صفر");
      return;
    }

    try {
      if (isEditing) {
        const body = buildStockOpeningBalanceUpdateBody({
          header,
          lines,
          rowVersion: editingItem.rowVersion,
        });
        await updateBalance({ id: editingItem.id, ...body }).unwrap();
        toast.success("تم تعديل الرصيد الافتتاحي المخزني بنجاح");
      } else {
        const payload = buildCreateStockOpeningBalanceRequest({
          header,
          lines,
        });
        await createBalance(payload).unwrap();
        toast.success("تم إضافة الرصيد الافتتاحي المخزني بنجاح");
      }
      onSuccess?.();
    } catch (err) {
      const serverMessage =
        err?.data?.detail || err?.data?.title || "تعذر حفظ الرصيد الافتتاحي";
      toast.error(serverMessage);
    }
  };

  return (
    <div className="space-y-5">
      <LedgerPanel
        title={
          <span className="flex items-center gap-2 pr-3">
            <FileText size={15} />
            بيانات السند
          </span>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3">
          <LedgerField
            label="رقم المستند"
            value={header.documentNumber}
            onChange={(e) => setHeaderField("documentNumber", e.target.value)}
          />
          <LedgerField
            label="التاريخ"
            type="date"
            value={header.documentDate}
            onChange={(e) => setHeaderField("documentDate", e.target.value)}
          />
          <div className="flex items-stretch">
            <div className="w-28 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
              المخزن <span className="text-negative">*</span>
            </div>
            <CompactSelect
              options={
                stores?.map((s) => ({ value: s.id, label: s.name })) || []
              }
              value={header.storeId}
              onChange={(val) => setHeaderField("storeId", val)}
              placeholder="اختر المخزن"
            />
          </div>
        </div>
        <div className="grid grid-cols-1">
          <LedgerField
            label="ملاحظات"
            value={header.notes}
            onChange={(e) => setHeaderField("notes", e.target.value)}
          />
        </div>
      </LedgerPanel>

      <LedgerPanel
        title={
          <span className="flex items-center gap-2 pr-3">
            <StoreIcon size={15} />
            الأصناف
          </span>
        }
      >
        <div className="overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card">
          <table className="w-full text-right border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
                <th className="p-2.5 font-medium">#</th>
                <th className="p-2.5 font-medium">الصنف</th>
                <th className="p-2.5 font-medium">الوحدة</th>
                <th className="p-2.5 font-medium">العدد</th>
                <th className="p-2.5 font-medium">الوزن</th>
                <th className="p-2.5 font-medium">الكمية</th>
                <th className="p-2.5 font-medium">السعر</th>
                <th className="p-2.5 font-medium">الإجمالي</th>
                <th className="p-2.5 font-medium">ملاحظات</th>
                <th className="p-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {linesWithTotals.map((line, index) => (
                <tr
                  key={index}
                  className="border-b border-ink-400/5 last:border-0"
                >
                  <td className="p-2 text-xs text-ink-400 num">{index + 1}</td>
                  <td className="p-1.5 min-w-[220px]">
                    <CompactSelect
                      options={
                        items?.map((it) => ({
                          value: it.id,
                          label: it.name,
                        })) || []
                      }
                      value={line.itemId}
                      onChange={(val) => handleItemChange(index, val)}
                      placeholder="اختر الصنف"
                    />
                  </td>
                  <td className="p-2 text-xs text-ink-500 num">
                    {line.itemUnitName || "—"}
                  </td>
                  <td className="p-1.5 w-24">
                    <input
                      type="number"
                      value={line.count}
                      onChange={(e) =>
                        updateLine(index, { count: e.target.value })
                      }
                      className="w-full text-xs bg-white border border-ink-400/15 rounded-lg px-2 py-1.5 num"
                    />
                  </td>
                  <td className="p-1.5 w-24">
                    <input
                      type="number"
                      value={line.weight}
                      onChange={(e) =>
                        updateLine(index, { weight: e.target.value })
                      }
                      className="w-full text-xs bg-white border border-ink-400/15 rounded-lg px-2 py-1.5 num"
                    />
                  </td>
                  <td className="p-2 text-xs text-ink-600 num text-center">
                    {line.quantity.toLocaleString("ar-EG")}
                  </td>
                  <td className="p-1.5 w-24">
                    <input
                      type="number"
                      value={line.price}
                      onChange={(e) =>
                        updateLine(index, { price: e.target.value })
                      }
                      className="w-full text-xs bg-white border border-ink-400/15 rounded-lg px-2 py-1.5 num"
                    />
                  </td>
                  <td className="p-2 text-xs font-semibold text-ink-900 num text-center">
                    {line.total.toLocaleString("ar-EG")}
                  </td>
                  <td className="p-1.5 min-w-[140px]">
                    <input
                      type="text"
                      value={line.notes}
                      onChange={(e) =>
                        updateLine(index, { notes: e.target.value })
                      }
                      className="w-full text-xs bg-white border border-ink-400/15 rounded-lg px-2 py-1.5"
                    />
                  </td>
                  <td className="p-1.5">
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-ink-400 hover:bg-negative/10 hover:text-negative transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-primary-50/50 border-t-2 border-primary-100 font-semibold text-ink-900">
                <td className="p-2.5" colSpan={7}>
                  الإجمالي
                </td>
                <td className="p-2.5 num text-center">
                  {documentTotal.toLocaleString("ar-EG")}
                </td>
                <td className="p-2.5" colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
          <button
            type="button"
            onClick={addLine}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary-500 hover:bg-primary-50/60 py-3 border-t border-ink-400/10 transition-colors"
          >
            <Plus size={16} />
            إضافة صنف آخر
          </button>
        </div>
      </LedgerPanel>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          className="h-10 flex-1"
        >
          {isSaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          حفظ
        </Button>
        <Button
          variant="ghost"
          type="button"
          onClick={onCancel}
          className="h-10 flex-1"
        >
          <X size={16} />
          إلغاء
        </Button>
      </div>
    </div>
  );
}
