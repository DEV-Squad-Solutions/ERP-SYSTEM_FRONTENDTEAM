import { useState, useEffect } from "react";
import { Plus, Save, Receipt, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGetCustomersQuery } from "../../customers/customersApi";
import { useCreateSaleInvoiceMutation } from "../salesApi";
import { generateInvoiceNumber } from "../../../mocks/data/sales";
import LedgerPanel from "../../../shared/components/ui/LedgerPanel";
import LedgerField from "../../../shared/components/ui/LedgerField";
import LedgerSelect from "../../../shared/components/ui/LedgerSelect";
import Button from "../../../shared/components/ui/Button";
import NewInvoiceLineRow from "./NewInvoiceLineRow";

const emptyLine = () => ({
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

const movementOptions = [
  { value: "sale", label: "مبيعات" },
  { value: "purchase", label: "مشتريات" },
];

/**
 * @param {{ onSuccess?: () => void }} props
 */
export default function NewInvoiceForm({ onSuccess }) {
  const { data: customers } = useGetCustomersQuery();
  const [createInvoice, { isLoading }] = useCreateSaleInvoiceMutation();

  const [header, setHeader] = useState({
    date: new Date().toISOString().slice(0, 10),
    movementType: "sale",
    invoiceNumber: generateInvoiceNumber("sale"),
    partyName: "",
    country: "",
    driverName: "",
    carNumber: "",
    discount: 0,
    tax: 0,
    paid: 0,
  });

  const [lines, setLines] = useState([emptyLine()]);

  // لما نوع العملية يتغير، رقم الفاتورة يتحدث تلقائي
  useEffect(() => {
    setHeader((h) => ({
      ...h,
      invoiceNumber: generateInvoiceNumber(h.movementType),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header.movementType]);

  const setHeaderField = (key, value) =>
    setHeader((h) => ({ ...h, [key]: value }));
  const updateLine = (index, newLine) =>
    setLines((prev) => prev.map((l, i) => (i === index ? newLine : l)));
  const removeLine = (index) =>
    setLines((prev) => prev.filter((_, i) => i !== index));
  const addLine = () => {
    setLines((prev) => [...prev, emptyLine()]);
    toast.info("تم إضافة صف جديد");
  };

  const total = lines.reduce(
    (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.price) || 0),
    0,
  );
  const remaining =
    total - (header.discount || 0) + (header.tax || 0) - (header.paid || 0);

  const customerOptions =
    customers?.map((c) => ({ value: c.name, label: c.name })) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validLines = lines.filter((l) => l.itemId && l.quantity > 0);
    if (validLines.length === 0) {
      toast.error("لازم تضيف صنف واحد على الأقل بكمية أكبر من صفر");
      return;
    }
    if (!header.partyName) {
      toast.error("اختر العميل أو المورد أولاً");
      return;
    }

    try {
      await createInvoice({ ...header, items: validLines }).unwrap();
      toast.success("تم حفظ الفاتورة بنجاح", {
        description: `رقم الفاتورة: ${header.invoiceNumber}`,
      });
      onSuccess?.();
    } catch (err) {
      console.error("فشل حفظ الفاتورة:", err);
      toast.error("حدث خطأ أثناء حفظ الفاتورة", {
        description: "حاول مرة أخرى أو راجع البيانات المدخلة",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* رأس الفاتورة */}
      <LedgerPanel title="بيانات الفاتورة">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <LedgerSelect
            label="نوع العملية"
            options={movementOptions}
            value={header.movementType}
            onChange={(e) => setHeaderField("movementType", e.target.value)}
          />
          <LedgerField
            label="رقم الفاتورة"
            value={header.invoiceNumber}
            readOnly
            className="bg-ink-400/5 font-medium"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <LedgerField
            label="التاريخ"
            type="date"
            value={header.date}
            onChange={(e) => setHeaderField("date", e.target.value)}
          />
          <LedgerSelect
            label="عميل / مورد"
            options={customerOptions}
            value={header.partyName}
            onChange={(e) => setHeaderField("partyName", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <LedgerField
            label="البلد"
            value={header.country}
            onChange={(e) => setHeaderField("country", e.target.value)}
          />
          <LedgerField
            label="اسم السائق"
            value={header.driverName}
            onChange={(e) => setHeaderField("driverName", e.target.value)}
          />
        </div>
        <LedgerField
          label="رقم السيارة"
          value={header.carNumber}
          onChange={(e) => setHeaderField("carNumber", e.target.value)}
        />
      </LedgerPanel>

      {/* جدول الأصناف الديناميكي */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h4 className="text-sm font-medium text-ink-600">أصناف الفاتورة</h4>
          <span className="text-xs text-ink-400">{lines.length} صنف</span>
        </div>

        <div className="overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card">
          <table className="w-full text-right border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
                <th className="p-2.5 font-medium">#</th>
                <th className="p-2.5 font-medium">الصنف</th>
                <th className="p-2.5 font-medium">العبوة</th>
                <th className="p-2.5 font-medium text-positive">وارد</th>
                <th className="p-2.5 font-medium text-negative">صادر</th>
                <th className="p-2.5 font-medium">الوزن</th>
                <th className="p-2.5 font-medium">الكمية</th>
                <th className="p-2.5 font-medium">السعر</th>
                <th className="p-2.5 font-medium">القيمة</th>
                <th className="p-2.5 font-medium">ملاحظات</th>
                <th className="p-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <NewInvoiceLineRow
                  key={index}
                  index={index}
                  line={line}
                  movementType={header.movementType}
                  onChange={(newLine) => updateLine(index, newLine)}
                  onRemove={() => removeLine(index)}
                />
              ))}
            </tbody>
          </table>

          <button
            type="button"
            onClick={addLine}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary-500 hover:bg-primary-50/60 py-3 border-t border-ink-400/10 transition-colors"
          >
            <Plus size={16} />
            إضافة صنف آخر لنفس الفاتورة
          </button>
        </div>
      </div>

      {/* الإجماليات */}
      <LedgerPanel title="الإجماليات" className="max-w-sm mr-0 ml-auto">
        <div className="flex items-stretch">
          <div className="w-32 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
            الإجمالي
          </div>
          <div className="flex-1 px-3 py-2.5 text-sm num font-semibold text-ink-900 flex items-center">
            {total.toLocaleString("ar-EG")} ج.م
          </div>
        </div>
        <LedgerField
          label="الخصم"
          type="number"
          value={header.discount}
          onChange={(e) => setHeaderField("discount", Number(e.target.value))}
        />
        <LedgerField
          label="الضريبة"
          type="number"
          value={header.tax}
          onChange={(e) => setHeaderField("tax", Number(e.target.value))}
        />
        <LedgerField
          label="المدفوع"
          type="number"
          value={header.paid}
          onChange={(e) => setHeaderField("paid", Number(e.target.value))}
        />
        <div className="flex items-stretch">
          <div className="w-32 shrink-0 bg-primary-50 px-3 py-2.5 text-sm font-semibold text-primary-500 flex items-center border-l border-ink-400/10">
            الباقي
          </div>
          <div
            className={`flex-1 px-3 py-2.5 text-sm num font-semibold flex items-center ${remaining > 0 ? "text-negative" : "text-positive"}`}
          >
            {remaining.toLocaleString("ar-EG")} ج.م
          </div>
        </div>
      </LedgerPanel>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          <>
            <Save size={16} />
            حفظ الفاتورة
          </>
        )}
      </Button>
    </form>
  );
}
