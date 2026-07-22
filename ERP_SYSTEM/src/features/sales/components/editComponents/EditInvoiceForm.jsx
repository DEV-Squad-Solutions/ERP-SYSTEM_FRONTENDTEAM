import { useState, useEffect } from "react";
import { Plus, Save, Loader2, History } from "lucide-react";
import { toast } from "sonner";
import { useGetPartiesSelectQuery } from "../../../partners/partnersApi";
import {
  useGetInvoiceByIdQuery,
  useUpdateSaleLineMutation,
} from "../../../sales/salesApi";
import LedgerPanel from "../../../../shared/components/ui/LedgerPanel";
import LedgerField from "../../../../shared/components/ui/LedgerField";
import LedgerSelect from "../../../../shared/components/ui/LedgerSelect";
import Button from "../../../../shared/components/ui/Button";
import NewInvoiceLineRow from "../createComponents/NewInvoiceLineRow";
const movementOptions = [
  { value: "sale", label: "مبيعات" },
  { value: "purchase", label: "مشتريات" },
];

const currencyLabels = { EGP: "جنيه مصري", USD: "دولار أمريكي" };

/**
 * @param {{ invoiceId: string, onSuccess?: () => void }} props
 */
export default function EditInvoiceForm({ invoiceId, onSuccess }) {
  const {
    data: invoice,
    isLoading,
    isFetching,
  } = useGetInvoiceByIdQuery(invoiceId);
  const { data: customers } = useGetPartiesSelectQuery();
  const [updateInvoice, { isLoading: isSaving }] = useUpdateSaleLineMutation();
  const [header, setHeader] = useState(null);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (invoice) {
      const { items, ...rest } = invoice;
      setHeader(rest);
      setLines(items);
    }
  }, [invoice]);

  const setHeaderField = (key, value) =>
    setHeader((h) => ({ ...h, [key]: value }));
  const updateLine = (index, newLine) =>
    setLines((prev) => prev.map((l, i) => (i === index ? newLine : l)));
  const removeLine = (index) =>
    setLines((prev) => prev.filter((_, i) => i !== index));
  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        itemId: "",
        itemName: "",
        packagingUnitId: "",
        packagingUnitName: "",
        packagingCount: 0,
        weight: 0,
        quantity: 0,
        price: 0,
        notes: "",
      },
    ]);
    toast.info("تم إضافة صف جديد");
  };

  // مهم: لازم ننتظر "header" برضو مش بس "invoice" — الـ state بيتملى
  // بعد الـ render عن طريق useEffect، فلو اعتمدنا على invoice بس هيحصل
  // render فيه header لسه null قبل ما الـ effect يشتغل، وده كان بيكسّر
  // الصفحة (Cannot read properties of null) عند فتح فاتورة للتعديل.
  if (isLoading || isFetching || !invoice || !invoice.items || !header) {
    return (
      <div className="space-y-3 animate-fadeUp">
        <div className="h-8 w-48 rounded bg-ink-400/10 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-ink-400/5 animate-pulse" />
        ))}
      </div>
    );
  }

  const pricedLines = lines.filter((l) => Number(l.price) > 0);
  const unpricedCount = lines.filter(
    (l) => l.itemId && !(Number(l.price) > 0),
  ).length;

  const total = pricedLines.reduce(
    (sum, l) => sum + (Number(l.quantity) || 0) * Number(l.price),
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

    try {
      await updateInvoice({
        id: invoiceId,
        ...header,
        items: validLines,
      }).unwrap();
      toast.success("تم حفظ التعديلات بنجاح");
      onSuccess?.();
    } catch (err) {
      console.error("فشل حفظ التعديلات:", err);
      toast.error("حدث خطأ أثناء حفظ التعديلات");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* شريط معلومات خاص بوضع التعديل بس */}
      <div className="flex items-center gap-2 bg-gold-50 border border-gold-100 text-gold-700 text-sm px-4 py-2.5 rounded-xl">
        <History size={15} />
        بتعدّل على فاتورة موجودة بالفعل — رقمها الأصلي{" "}
        <span className="num font-semibold">{header.invoiceNumber}</span>
      </div>

      <LedgerPanel title="بيانات الفاتورة">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* نوع العملية مقفول في وضع التعديل — منطق خاص بالتعديل بس */}
          <LedgerSelect
            label="نوع العملية"
            options={movementOptions}
            value={header.movementType}
            disabled
          />
          <LedgerField
            label="رقم الفاتورة"
            value={header.invoiceNumber}
            onChange={(e) => setHeaderField("invoiceNumber", e.target.value)}
          />
        </div>

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

        <div className="flex items-stretch">
          <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
            العملة
          </div>
          <div className="flex-1 px-3 py-2.5 text-sm bg-ink-400/5 text-ink-600 flex items-center">
            {currencyLabels[header.currency] || header.currency}
          </div>
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

      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h4 className="text-sm font-medium text-ink-600">أصناف الفاتورة</h4>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-ink-400">{lines.length} صنف</span>
            {unpricedCount > 0 && (
              <span className="text-gold-600 bg-gold-50 px-2 py-0.5 rounded-full">
                {unpricedCount} بدون سعر
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card">
          <table className="w-full text-right border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
                <th className="p-2.5 font-medium">#</th>
                <th className="p-2.5 font-medium">الصنف</th>
                <th className="p-2.5 font-medium">نوع العبوة</th>
                <th className="p-2.5 font-medium">عدد العبوات</th>
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
            إضافة صنف آخر
          </button>
        </div>
      </div>

      <LedgerPanel title="الإجماليات" className="max-w-sm mr-0 ml-auto">
        <div className="flex items-stretch">
          <div className="w-32 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
            الإجمالي المُسعّر
          </div>
          <div className="flex-1 px-3 py-2.5 text-sm num font-semibold text-ink-900 flex items-center">
            {total.toLocaleString("ar-EG")}{" "}
            {header.currency === "USD" ? "$" : "ج.م"}
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
            {remaining.toLocaleString("ar-EG")}{" "}
            {header.currency === "USD" ? "$" : "ج.م"}
          </div>
        </div>
      </LedgerPanel>

      <Button type="submit" disabled={isSaving} className="w-full">
        {isSaving ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          <>
            <Save size={16} />
            حفظ التعديلات
          </>
        )}
      </Button>
    </form>
  );
}
