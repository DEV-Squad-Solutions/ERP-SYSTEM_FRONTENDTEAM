import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2, Pencil, Save, Printer } from "lucide-react";
import { useGetPartiesQuery, useCreateInvoiceMutation } from "../invoicesApi";
import { useGetItemsQuery } from "../../inventory/inventoryApi";
import Input from "../../../shared/components/ui/Input";

/**
 * @param {{ type: 'purchase' | 'sale', onSuccess?: () => void }} props
 */
export default function InvoiceForm({ type, onSuccess }) {
  const isPurchase = type === "purchase";
  const partyType = isPurchase ? "supplier" : "customer";

  const { data: parties } = useGetPartiesQuery(partyType);
  const { data: items } = useGetItemsQuery();
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();

  const { register, control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      invoiceNumber: `${isPurchase ? "PUR" : "SAL"}-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().slice(0, 10),
      partyId: "",
      account: "نقدي",
      country: "",
      vehicleNumber: "",
      driverName: "",
      items: [{ itemId: "", quantity: 0, weight: 0, price: 0, notes: "" }],
      discount: 0,
      tax: 0,
      totalPaid: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");
  const discount = Number(watch("discount")) || 0;
  const tax = Number(watch("tax")) || 0;
  const totalPaid = Number(watch("totalPaid")) || 0;

  const subtotal = watchedItems.reduce(
    (sum, item) =>
      sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
    0,
  );
  const total = subtotal - discount + tax;
  const remaining = total - totalPaid;

  const onSubmit = async (data) => {
    const party = parties?.find((p) => p.id === data.partyId);
    const lineItems = data.items.map((item) => {
      const itemInfo = items?.find((i) => i.id === item.itemId);
      return {
        itemId: item.itemId,
        itemName: itemInfo?.name || "",
        quantity: Number(item.quantity),
        weight: Number(item.weight),
        price: Number(item.price),
        value: Number(item.quantity) * Number(item.price),
        notes: item.notes,
      };
    });

    try {
      await createInvoice({
        type,
        invoiceNumber: data.invoiceNumber,
        date: data.date,
        partyId: data.partyId,
        partyName: party?.name || "",
        account: data.account,
        country: data.country,
        vehicleNumber: data.vehicleNumber,
        driverName: data.driverName,
        items: lineItems,
        subtotal,
        discount,
        tax,
        totalPaid,
        remaining,
        total,
      }).unwrap();
      reset();
      onSuccess?.();
    } catch (err) {
      console.error("فشل حفظ الفاتورة:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* بيانات رأس الفاتورة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input label="التاريخ" type="date" {...register("date")} />
        <Input label="رقم الفاتورة" {...register("invoiceNumber")} />

        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            {isPurchase ? "مورد" : "عميل"}
          </label>
          <select
            {...register("partyId")}
            className="w-full rounded-xl border border-ink-400/15 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
          >
            <option value="">اختر</option>
            {parties?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            الحساب
          </label>
          <select
            {...register("account")}
            className="w-full rounded-xl border border-ink-400/15 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
          >
            <option value="نقدي">نقدي</option>
            <option value="آجل">آجل</option>
          </select>
        </div>

        <Input label="البلد" {...register("country")} />
        <Input label="رقم السيارة" {...register("vehicleNumber")} />
        <Input label="اسم السائق" {...register("driverName")} />
      </div>

      {/* جدول الأصناف */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-ink-900">الأصناف</h3>
          <button
            type="button"
            onClick={() =>
              append({
                itemId: "",
                quantity: 0,
                weight: 0,
                price: 0,
                notes: "",
              })
            }
            className="flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-600"
          >
            <Plus size={16} />
            إضافة صنف
          </button>
        </div>

        <div className="overflow-x-auto custom-scroll rounded-xl border border-ink-400/10">
          <table className="w-full text-right min-w-[800px]">
            <thead>
              <tr className="bg-ink-900/[0.02] text-ink-400 text-xs">
                <th className="p-2.5 font-medium w-10">م</th>
                <th className="p-2.5 font-medium">الصنف</th>
                <th className="p-2.5 font-medium w-24">الكمية</th>
                <th className="p-2.5 font-medium w-24">الوزن</th>
                <th className="p-2.5 font-medium w-28">سعر</th>
                <th className="p-2.5 font-medium w-28">قيمة</th>
                <th className="p-2.5 font-medium">ملاحظات</th>
                <th className="p-2.5 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const qty = Number(watchedItems[index]?.quantity) || 0;
                const price = Number(watchedItems[index]?.price) || 0;
                return (
                  <tr key={field.id} className="border-t border-ink-400/5">
                    <td className="p-2 text-center text-ink-400 text-sm num">
                      {index + 1}
                    </td>
                    <td className="p-2">
                      <select
                        {...register(`items.${index}.itemId`)}
                        className="w-full rounded-lg border border-ink-400/15 px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-primary-500"
                      >
                        <option value="">اختر صنف</option>
                        {items?.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        {...register(`items.${index}.quantity`)}
                        className="w-full rounded-lg border border-ink-400/15 px-2 py-1.5 text-sm num focus:outline-none focus:border-primary-500"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        {...register(`items.${index}.weight`)}
                        className="w-full rounded-lg border border-ink-400/15 px-2 py-1.5 text-sm num focus:outline-none focus:border-primary-500"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        {...register(`items.${index}.price`)}
                        className="w-full rounded-lg border border-ink-400/15 px-2 py-1.5 text-sm num focus:outline-none focus:border-primary-500"
                      />
                    </td>
                    <td className="p-2 num text-sm font-medium text-ink-900">
                      {(qty * price).toLocaleString("ar-EG")}
                    </td>
                    <td className="p-2">
                      <input
                        {...register(`items.${index}.notes`)}
                        className="w-full rounded-lg border border-ink-400/15 px-2 py-1.5 text-sm focus:outline-none focus:border-primary-500"
                      />
                    </td>
                    <td className="p-2 text-center">
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-negative hover:bg-negative/5 p-1 rounded-lg"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* الإجماليات */}
      <div className="bg-ink-900/[0.02] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input label="خصم" type="number" {...register("discount")} />
        <Input label="الضريبة" type="number" {...register("tax")} />
        <Input label="المدفوع" type="number" {...register("totalPaid")} />

        <div className="space-y-1 text-sm justify-self-end sm:justify-self-auto">
          <div className="flex justify-between gap-6 text-ink-600">
            <span>الإجمالي</span>
            <span className="num font-medium text-ink-900">
              {total.toLocaleString("ar-EG")}
            </span>
          </div>
          <div
            className={`flex justify-between gap-6 font-semibold ${remaining > 0 ? "text-negative" : "text-positive"}`}
          >
            <span>الباقي</span>
            <span className="num">{remaining.toLocaleString("ar-EG")}</span>
          </div>
        </div>
      </div>

      {/* أزرار الإجراءات */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm border border-negative/30 text-negative hover:bg-negative/5 transition-colors"
        >
          <Trash2 size={16} />
          حذف
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm border border-ink-400/20 text-ink-600 hover:bg-ink-400/5 transition-colors"
        >
          <Pencil size={16} />
          تعديل
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {isLoading ? "جاري الحفظ..." : "حفظ"}
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm border border-ink-400/20 text-ink-600 hover:bg-ink-400/5 transition-colors"
        >
          <Printer size={16} />
          طباعة
        </button>
      </div>
    </form>
  );
}
