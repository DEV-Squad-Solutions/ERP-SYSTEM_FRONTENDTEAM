import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Printer,
  Save,
  X,
  Pencil,
  Plus,
  Wallet2,
  ArrowDownCircle,
  ArrowUpCircle,
  Package,
  Loader2,
} from "lucide-react";
import { useGetItemsQuery } from "../../inventory/inventoryApi";
import { mockPackagingUnits } from "../../../mocks/data/packagingUnits";
import {
  useUpdateSaleLineMutation,
  useDeleteSaleLineMutation,
} from "../salesApi";

const emptyItem = () => ({
  itemId: "",
  itemName: "",
  packagingUnitId: "",
  packagingUnitName: "",
  packagingIn: 0,
  packagingOut: 0,
  weight: 0,
  quantity: 0,
  price: 0,
  notes: "",
});

/**
 * @param {{ invoice: Object }} props
 */
export default function InvoiceCard({ invoice }) {
  const { data: stockItems } = useGetItemsQuery();
  const navigate = useNavigate();
  const [updateInvoice, { isLoading: isSaving }] = useUpdateSaleLineMutation();
  const [deleteInvoice, { isLoading: isDeleting }] =
    useDeleteSaleLineMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [draftItems, setDraftItems] = useState(invoice?.items || []);
  const [draftTotals, setDraftTotals] = useState({
    discount: invoice?.discount || 0,
    tax: invoice?.tax || 0,
    paid: invoice?.paid || 0,
  });

  if (!invoice) return null;

  const isPurchase = invoice.movementType === "purchase";

  const startEdit = () => {
    setDraftItems(invoice.items);
    setDraftTotals({
      discount: invoice.discount || 0,
      tax: invoice.tax || 0,
      paid: invoice.paid || 0,
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraftItems(invoice.items);
    setDraftTotals({
      discount: invoice.discount || 0,
      tax: invoice.tax || 0,
      paid: invoice.paid || 0,
    });
    setIsEditing(false);
  };

  const setItemField = (index, key, value) =>
    setDraftItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [key]: value } : it)),
    );

  const setTotalField = (key, value) =>
    setDraftTotals((prev) => ({ ...prev, [key]: Number(value) }));

  const addDraftItem = () => setDraftItems((prev) => [...prev, emptyItem()]);
  const removeDraftItem = (index) =>
    setDraftItems((prev) => prev.filter((_, i) => i !== index));

  const saveEdit = async () => {
    const items = draftItems.map((it) => {
      const selectedItem = stockItems?.find((s) => s.id === it.itemId);
      const selectedUnit = mockPackagingUnits.find(
        (u) => u.id === it.packagingUnitId,
      );
      return {
        ...it,
        itemName: selectedItem ? selectedItem.name : it.itemName,
        packagingUnitName: selectedUnit
          ? selectedUnit.name
          : it.packagingUnitName,
        value: Number(it.quantity) * Number(it.price),
      };
    });
    try {
      await updateInvoice({
        id: invoice.id,
        ...invoice,
        items,
        discount: draftTotals.discount,
        tax: draftTotals.tax,
        paid: draftTotals.paid,
      }).unwrap();
      setIsEditing(false);
    } catch (err) {
      console.error("فشل حفظ التعديلات:", err);
    }
  };

  const handleDeleteInvoice = () => {
    if (confirm("متأكد إنك عايز تحذف الفاتورة دي بالكامل (كل أصنافها)؟")) {
      deleteInvoice(invoice.id);
    }
  };

  const handlePrint = () => window.print();

  const displayItems = isEditing ? draftItems : invoice.items;
  const displayTotals = isEditing ? draftTotals : invoice;

  const itemsTotal = displayItems.reduce(
    (s, it) => s + (Number(it.quantity) || 0) * (Number(it.price) || 0),
    0,
  );
  const discount = displayTotals.discount || 0;
  const tax = displayTotals.tax || 0;
  const paid = displayTotals.paid || 0;
  const remaining = itemsTotal - discount + tax - paid;

  const inputCls =
    "w-full rounded-lg border border-ink-400/15 px-2 py-1.5 text-sm num text-center focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-shadow";
  const selectCls =
    "w-full rounded-lg border border-ink-400/15 px-2 py-1.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-shadow";
  const iconBtnCls =
    "p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none";

  return (
    <div
      className={`rounded-2xl border bg-white shadow-card overflow-hidden transition-opacity ${isDeleting ? "opacity-40" : "border-ink-400/10"}`}
    >
      {/* رأس الفاتورة */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-ink-900/[0.03] border-b border-ink-400/10 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
          {isPurchase ? (
            <span className="inline-flex items-center gap-1.5 bg-positive/10 text-positive text-xs font-medium px-2.5 py-1 rounded-full">
              <ArrowDownCircle size={13} />
              مشتريات
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-negative/10 text-negative text-xs font-medium px-2.5 py-1 rounded-full">
              <ArrowUpCircle size={13} />
              مبيعات
            </span>
          )}
          <span className="num font-semibold text-ink-900">
            {invoice.invoiceNumber}
          </span>
          <span className="num text-ink-500">{invoice.date}</span>
          <span className="text-ink-900 font-medium">{invoice.partyName}</span>
          <span className="text-ink-400 hidden sm:inline">
            {invoice.country}
          </span>
          <span className="text-ink-400 hidden md:inline">
            {invoice.driverName} —{" "}
            <span className="num">{invoice.carNumber}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="num font-semibold text-ink-900">
            {itemsTotal.toLocaleString("ar-EG")} ج.م
          </span>
          <div className="flex gap-1">
            {isEditing ? (
              <>
                <button
                  onClick={saveEdit}
                  disabled={isSaving}
                  className={`${iconBtnCls} text-positive hover:bg-positive/10`}
                  title="حفظ"
                >
                  {isSaving ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                </button>
                <button
                  onClick={cancelEdit}
                  className={`${iconBtnCls} text-ink-400 hover:bg-ink-400/5`}
                  title="إلغاء"
                >
                  <X size={15} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/dashboard/treasury")}
                  className={`${iconBtnCls} text-gold-600 hover:bg-gold-50`}
                  title="الخزنة"
                >
                  <Wallet2 size={15} />
                </button>
                <button
                  onClick={startEdit}
                  className={`${iconBtnCls} text-primary-500 hover:bg-primary-50`}
                  title="تعديل"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={handlePrint}
                  className={`${iconBtnCls} text-ink-400 hover:bg-ink-400/5`}
                  title="طباعة"
                >
                  <Printer size={15} />
                </button>
                <button
                  onClick={handleDeleteInvoice}
                  disabled={isDeleting}
                  className={`${iconBtnCls} text-negative hover:bg-negative/10`}
                  title="حذف"
                >
                  {isDeleting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* حالة فاضية داخل الفاتورة (نظرياً نادر، بس للأمان) */}
      {displayItems.length === 0 ? (
        <div className="text-center py-8">
          <Package
            size={24}
            className="mx-auto text-ink-400/40 mb-2"
            strokeWidth={1.6}
          />
          <p className="text-sm text-ink-400">لا توجد أصناف في هذه الفاتورة</p>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-right border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-ink-900/[0.02] text-ink-400 text-xs">
                <th
                  className="p-2.5 font-medium border-b border-ink-400/10"
                  rowSpan={2}
                >
                  م
                </th>
                <th
                  className="p-2.5 font-medium border-b border-ink-400/10"
                  rowSpan={2}
                >
                  الصنف
                </th>
                <th
                  className="p-2 font-medium border-b border-x border-ink-400/10 text-center"
                  colSpan={3}
                >
                  العبوة
                </th>
                <th
                  className="p-2.5 font-medium border-b border-ink-400/10"
                  rowSpan={2}
                >
                  وزن
                </th>
                <th
                  className="p-2.5 font-medium border-b border-ink-400/10"
                  rowSpan={2}
                >
                  كمية
                </th>
                <th
                  className="p-2.5 font-medium border-b border-ink-400/10"
                  rowSpan={2}
                >
                  سعر
                </th>
                <th
                  className="p-2.5 font-medium border-b border-ink-400/10"
                  rowSpan={2}
                >
                  قيمة
                </th>
                <th
                  className="p-2.5 font-medium border-b border-ink-400/10"
                  rowSpan={2}
                >
                  ملاحظات
                </th>
                {isEditing && (
                  <th
                    className="p-2.5 font-medium border-b border-ink-400/10"
                    rowSpan={2}
                  ></th>
                )}
              </tr>
              <tr className="bg-ink-900/[0.015] text-ink-400 text-[11px]">
                <th className="p-1.5 font-medium border-b border-x border-ink-400/10">
                  النوع
                </th>
                <th className="p-1.5 font-medium border-b border-x border-ink-400/10 text-positive">
                  وارد
                </th>
                <th className="p-1.5 font-medium border-b border-x border-ink-400/10 text-negative">
                  صادر
                </th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item, index) => {
                const value =
                  (Number(item.quantity) || 0) * (Number(item.price) || 0);
                return (
                  <tr
                    key={index}
                    className="border-b border-ink-400/5 last:border-0 hover:bg-ink-900/[0.01] transition-colors"
                  >
                    <td className="p-2.5 text-center text-ink-400 text-sm num">
                      {index + 1}
                    </td>
                    <td className="p-2 min-w-[150px]">
                      {isEditing ? (
                        <select
                          value={item.itemId}
                          onChange={(e) =>
                            setItemField(index, "itemId", e.target.value)
                          }
                          className={selectCls}
                        >
                          <option value="">— اختر الصنف —</option>
                          {stockItems?.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-medium text-ink-900">
                          {item.itemName}
                        </span>
                      )}
                    </td>
                    <td className="p-2 min-w-[100px] border-x border-ink-400/5">
                      {isEditing ? (
                        <select
                          value={item.packagingUnitId}
                          onChange={(e) =>
                            setItemField(
                              index,
                              "packagingUnitId",
                              e.target.value,
                            )
                          }
                          className={selectCls}
                        >
                          <option value="">— العبوة —</option>
                          {mockPackagingUnits.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm text-ink-600">
                          {item.packagingUnitName}
                        </span>
                      )}
                    </td>
                    <td className="p-2 w-16 text-center border-l border-ink-400/5">
                      {isEditing ? (
                        <input
                          type="number"
                          value={item.packagingIn}
                          onChange={(e) =>
                            setItemField(
                              index,
                              "packagingIn",
                              Number(e.target.value),
                            )
                          }
                          className={inputCls}
                        />
                      ) : (
                        <span className="num text-positive">
                          {item.packagingIn > 0 ? item.packagingIn : "—"}
                        </span>
                      )}
                    </td>
                    <td className="p-2 w-16 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          value={item.packagingOut}
                          onChange={(e) =>
                            setItemField(
                              index,
                              "packagingOut",
                              Number(e.target.value),
                            )
                          }
                          className={inputCls}
                        />
                      ) : (
                        <span className="num text-negative">
                          {item.packagingOut > 0 ? item.packagingOut : "—"}
                        </span>
                      )}
                    </td>
                    <td className="p-2 w-20 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          value={item.weight}
                          onChange={(e) =>
                            setItemField(
                              index,
                              "weight",
                              Number(e.target.value),
                            )
                          }
                          className={inputCls}
                        />
                      ) : (
                        <span className="num text-ink-600">
                          {(item.weight || 0).toLocaleString("ar-EG")}
                        </span>
                      )}
                    </td>
                    <td className="p-2 w-20 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            setItemField(
                              index,
                              "quantity",
                              Number(e.target.value),
                            )
                          }
                          className={inputCls}
                        />
                      ) : (
                        <span className="num text-ink-900 font-medium">
                          {(item.quantity || 0).toLocaleString("ar-EG")}
                        </span>
                      )}
                    </td>
                    <td className="p-2 w-24 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            setItemField(index, "price", Number(e.target.value))
                          }
                          className={inputCls}
                        />
                      ) : (
                        <span className="num text-ink-600">
                          {(item.price || 0).toLocaleString("ar-EG")}
                        </span>
                      )}
                    </td>
                    <td className="p-2 w-28 text-center num font-medium text-ink-900">
                      {value.toLocaleString("ar-EG")}
                    </td>
                    <td className="p-2 min-w-[110px]">
                      {isEditing ? (
                        <input
                          value={item.notes}
                          onChange={(e) =>
                            setItemField(index, "notes", e.target.value)
                          }
                          className="w-full rounded-lg border border-ink-400/15 px-2.5 py-1.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-shadow"
                        />
                      ) : (
                        <span className="text-ink-400 text-sm">
                          {item.notes || "—"}
                        </span>
                      )}
                    </td>
                    {isEditing && (
                      <td className="p-2 w-10 text-center">
                        <button
                          type="button"
                          onClick={() => removeDraftItem(index)}
                          className="p-1.5 rounded-lg text-negative hover:bg-negative/10 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {isEditing && (
            <button
              type="button"
              onClick={addDraftItem}
              className="w-full flex items-center justify-center gap-2 text-sm text-primary-500 hover:bg-primary-50/50 py-2.5 border-t border-ink-400/10 transition-colors"
            >
              <Plus size={16} />
              إضافة صنف آخر لنفس الفاتورة
            </button>
          )}
        </div>
      )}

      {/* فوتر الإجماليات */}
      <div className="border-t border-ink-400/10 bg-ink-900/[0.015] px-4 py-3">
        <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-ink-400">الإجمالي</span>
            <span className="num font-semibold text-ink-900">
              {itemsTotal.toLocaleString("ar-EG")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-ink-400">الخصم</span>
            {isEditing ? (
              <input
                type="number"
                value={draftTotals.discount}
                onChange={(e) => setTotalField("discount", e.target.value)}
                className={`${inputCls} w-24`}
              />
            ) : (
              <span className="num font-medium text-negative">
                {discount.toLocaleString("ar-EG")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-ink-400">الضريبة</span>
            {isEditing ? (
              <input
                type="number"
                value={draftTotals.tax}
                onChange={(e) => setTotalField("tax", e.target.value)}
                className={`${inputCls} w-24`}
              />
            ) : (
              <span className="num font-medium text-ink-600">
                {tax.toLocaleString("ar-EG")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-ink-400">المدفوع</span>
            {isEditing ? (
              <input
                type="number"
                value={draftTotals.paid}
                onChange={(e) => setTotalField("paid", e.target.value)}
                className={`${inputCls} w-24`}
              />
            ) : (
              <span className="num font-medium text-positive">
                {paid.toLocaleString("ar-EG")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 border-r border-ink-400/10 pr-6">
            <span className="text-ink-900 font-medium">الباقي</span>
            <span
              className={`num font-bold ${remaining > 0 ? "text-negative" : "text-positive"}`}
            >
              {remaining.toLocaleString("ar-EG")} ج.م
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
