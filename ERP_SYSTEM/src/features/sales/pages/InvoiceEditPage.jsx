import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Save, ArrowRight, Plus, AlertCircle } from "lucide-react";
import {
  useGetInvoiceByIdQuery,
  useUpdateInvoiceMutation,
} from "../../invoices/invoicesApi";
import {
  useGetPartiesSelectQuery,
  useGetPartyContainerStoreQuery,
} from "../../partners/partiesApi";
import { useGetStoresSelectQuery } from "../../stores/storesApi";
import { useGetDriversSelectQuery } from "../../drivers/driversApi";
// ⚠️ افتراض اسم الـ hook ده، لازم تتأكد منه لو مختلف
import { useGetCountriesSelectQuery } from "../../countries/countriesApi";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import InvoiceLineRow from "../components/createComponents/NewInvoiceLineRow";
import ContainerLineRow from "../components/editComponents/ContainerLineRow";

const paymentTermOptions = [
  { value: "Cash", label: "نقدي" },
  { value: "Credit", label: "آجل" },
];

const invoiceTypeOptions = [
  { value: "Sales", label: "بيع" },
  { value: "Purchase", label: "شراء" },
  { value: "SalesReturn", label: "مرتجع بيع" },
  { value: "PurchaseReturn", label: "مرتجع شراء" },
];

const itemsCategoryOptions = [
  { value: "pickled", label: "مخلل" },
  { value: "fresh", label: "فريش" },
];

const invoiceContentTypeOptions = [
  { value: "items", label: "أصناف" },
  { value: "containers", label: "عبوات" },
];

const emptyLine = () => ({
  itemId: null,
  itemName: "",
  isTemporaryItem: false,
  itemCode: "",
  itemUnitId: null,
  itemUnitName: "",
  count: 0,
  weight: 0,
  quantity: 0,
  price: 0,
  notes: "",
});

const emptyContainerLine = () => ({
  containerId: null,
  containerName: "",
  outgoingUnits: 0,
  incomingUnits: 0,
});

export default function InvoiceEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: invoice,
    isLoading,
    isError,
    refetch,
  } = useGetInvoiceByIdQuery(id);
  const [updateInvoice, { isLoading: isSaving }] = useUpdateInvoiceMutation();

  const { data: parties, isLoading: isLoadingParties } =
    useGetPartiesSelectQuery();
  const { data: stores, isLoading: isLoadingStores } =
    useGetStoresSelectQuery();
  const { data: countries, isLoading: isLoadingCountries } =
    useGetCountriesSelectQuery();
  const { data: drivers, isLoading: isLoadingDrivers } =
    useGetDriversSelectQuery();

  const [form, setForm] = useState(null);
  const [lines, setLines] = useState([]);
  const [containerLines, setContainerLines] = useState([]);
  const [rowVersion, setRowVersion] = useState(null);
  const [containerStoreName, setContainerStoreName] = useState("");

  const prevPartyIdRef = useRef(null);

  // بيانات مخزن العبوات بتاع العميل الحالي (بيتغير أوتوماتيك مع تغيير العميل)
  const {
    data: partyContainerStoreData,
    isFetching: isLoadingPartyContainerStore,
  } = useGetPartyContainerStoreQuery(form?.businessPartnerId, {
    skip: !form?.businessPartnerId,
  });

  // تعبئة الفورم أول ما الفاتورة تتحمّل
  useEffect(() => {
    if (!invoice) return;
    setForm({
      invoiceType: invoice.invoiceType,
      paymentTerm: invoice.paymentTerm,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      businessPartnerId: invoice.businessPartnerId,
      storeId: invoice.storeId,
      containerStoreId: invoice.containerStoreId,
      countryId: invoice.countryId,
      driverId: invoice.driverId,
      actualDriverId: invoice.actualDriverId,
      usesExternalDriver: invoice.usesExternalDriver,
      externalDriverName: invoice.externalDriverName || "",
      vehicleNumber: invoice.vehicleNumber || "",
      exportInvoiceCode: invoice.exportInvoiceCode || "",
      discountAmount: invoice.discountAmount || 0,
      paidAmount: invoice.paidAmount || 0,
      itemsCategory: invoice.itemsCategory || "fresh",
      invoiceContentType: invoice.invoiceContentType || "items",
      generalNotes: invoice.generalNotes || invoice.notes || "",
      // ==== ملاحظات مقسمة لأربع حقول ====
      weighbridgeWeight: invoice.weighbridgeWeight || "",
      scaleDifference: invoice.scaleDifference || "",
      notesDiscount: invoice.notesDiscount || "",
      notesTotal: invoice.notesTotal || "",
    });
    setLines(
      invoice.lines?.length
        ? invoice.lines
        : Array.from({ length: 10 }, () => emptyLine()),
    );
    setContainerLines(invoice.containerLines || []);
    setContainerStoreName(invoice.containerStoreName || "");
    setRowVersion(invoice.rowVersion);

    // نسجل العميل الأصلي كخط أساس، عشان الـ effect التاني
    // ما يشتغلش تلقائي أول ما الصفحة تفتح
    prevPartyIdRef.current = invoice.businessPartnerId;
  }, [invoice]);

  // لما المستخدم يغيّر العميل يدويًا، نجيب مخزن العبوات بتاعه من الـ endpoint
  useEffect(() => {
    if (!form) return;
    if (form.businessPartnerId === prevPartyIdRef.current) return;
    if (!partyContainerStoreData) return;

    prevPartyIdRef.current = form.businessPartnerId;

    const store = partyContainerStoreData.containerStore;

    if (store?.id) {
      setForm((prev) => ({ ...prev, containerStoreId: store.id }));
      setContainerStoreName(store.name || "");
      toast.info(`تم تحديد مخزن العبوات تلقائيًا: ${store.name || "—"}`);
    } else {
      setForm((prev) => ({ ...prev, containerStoreId: null }));
      setContainerStoreName("");
      toast.warning("العميل ده مالوش مخزن عبوات مرتبط");
    }
  }, [partyContainerStoreData, form?.businessPartnerId]);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateLine = (index, updatedLine) => {
    setLines((prev) => prev.map((l, i) => (i === index ? updatedLine : l)));
  };
  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (index) =>
    setLines((prev) => prev.filter((_, i) => i !== index));

  const updateContainerLine = (index, updated) => {
    setContainerLines((prev) =>
      prev.map((c, i) => (i === index ? updated : c)),
    );
  };
  const addContainerLine = () =>
    setContainerLines((prev) => [...prev, emptyContainerLine()]);
  const removeContainerLine = (index) =>
    setContainerLines((prev) => prev.filter((_, i) => i !== index));

  // حسابات عرض فقط (السيرفر هو المتحكم في القيم الفعلية بعد الحفظ)
  const displaySubtotal = useMemo(
    () =>
      lines.reduce(
        (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.price) || 0),
        0,
      ),
    [lines],
  );
  const displayTotal = displaySubtotal - (Number(form?.discountAmount) || 0);

  const handleSubmit = async () => {
    if (!form) return;

    if (lines.some((l) => !l.itemId && !(l.isTemporaryItem && l.itemName))) {
      toast.error("لازم تختار صنف أو تكتب اسمه لكل سطر قبل الحفظ");
      return;
    }

    try {
      await updateInvoice({
        id,
        ...form,
        lines,
        containerLines,
        rowVersion,
      }).unwrap();

      toast.success("تم حفظ التعديلات بنجاح");
      navigate(`/dashboard/sales/${id}`);
    } catch (err) {
      // 409 = تعارض نسخة (حد تاني عدّل الفاتورة قبلك)
      if (err?.status === 409) {
        toast.error("الفاتورة اتعدلت من حد تاني، لازم تحمّل النسخة الأحدث", {
          duration: 6000,
        });
        refetch();
      } else {
        toast.error("حصل خطأ أثناء حفظ التعديلات");
      }
    }
  };

  if (isLoading || !form) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-48 rounded bg-ink-400/10 animate-pulse" />
        <div className="h-40 rounded-2xl bg-ink-400/5 animate-pulse" />
        <div className="h-64 rounded-2xl bg-ink-400/5 animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-14 border border-dashed border-negative/25 bg-negative/[0.02] rounded-2xl">
        <AlertCircle size={32} className="mx-auto text-negative/70 mb-3" />
        <p className="text-ink-900 font-medium mb-1">تعذر تحميل الفاتورة</p>
        <Button variant="outline" onClick={refetch}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fadeUp pb-24">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-ink-400 hover:bg-ink-400/5"
          >
            <ArrowRight size={18} />
          </button>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            تعديل الفاتورة #{invoice.invoiceNumber}
          </h2>
        </div>
        <Button onClick={handleSubmit} disabled={isSaving}>
          <Save size={16} />
          {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
        </Button>
      </div>

      {/* بيانات الفاتورة الأساسية */}
      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              نوع الفاتورة
            </label>
            <CompactSelect
              options={invoiceTypeOptions}
              value={form.invoiceType}
              onChange={(v) => setField("invoiceType", v)}
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              طريقة الدفع
            </label>
            <CompactSelect
              options={paymentTermOptions}
              value={form.paymentTerm}
              onChange={(v) => setField("paymentTerm", v)}
            />
          </div>

          <Input
            type="date"
            label="تاريخ الفاتورة"
            value={form.invoiceDate}
            onChange={(e) => setField("invoiceDate", e.target.value)}
          />
          <Input
            type="date"
            label="تاريخ الاستحقاق"
            value={form.dueDate}
            onChange={(e) => setField("dueDate", e.target.value)}
          />

          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              العميل / المورد
            </label>
            <CompactSelect
              options={
                parties?.map((p) => ({ value: p.id, label: p.name })) || []
              }
              value={form.businessPartnerId}
              onChange={(v) => setField("businessPartnerId", v)}
              isLoading={isLoadingParties}
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              المخزن
            </label>
            <CompactSelect
              options={
                stores?.map((s) => ({ value: s.id, label: s.name })) || []
              }
              value={form.storeId}
              onChange={(v) => setField("storeId", v)}
              isLoading={isLoadingStores}
            />
          </div>

          {/* مخزن العبوات - للعرض فقط، بيتحدد تلقائيًا حسب العميل */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              مخزن العبوات
            </label>
            <div className="w-full rounded-lg border border-ink-400/10 px-3 py-2 text-sm bg-ink-400/5 text-ink-700 min-h-[38px] flex items-center">
              {isLoadingPartyContainerStore ? (
                <span className="h-3.5 w-24 rounded bg-ink-400/10 animate-pulse" />
              ) : (
                containerStoreName || "—"
              )}
            </div>
            <p className="text-[11px] text-ink-400 mt-1">
              بيتحدد تلقائيًا حسب العميل المختار
            </p>
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              البلد
            </label>
            <CompactSelect
              options={
                countries?.map((c) => ({ value: c.id, label: c.name })) || []
              }
              value={form.countryId}
              onChange={(v) => setField("countryId", v)}
              isLoading={isLoadingCountries}
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              السائق
            </label>
            <CompactSelect
              options={
                drivers?.map((d) => ({ value: d.id, label: d.name })) || []
              }
              value={form.driverId}
              onChange={(v) => setField("driverId", v)}
              isLoading={isLoadingDrivers}
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              السائق الفعلي
            </label>
            <CompactSelect
              options={
                drivers?.map((d) => ({ value: d.id, label: d.name })) || []
              }
              value={form.actualDriverId}
              onChange={(v) => setField("actualDriverId", v)}
              isLoading={isLoadingDrivers}
            />
          </div>

          <Input
            label="رقم السيارة"
            value={form.vehicleNumber}
            onChange={(e) => setField("vehicleNumber", e.target.value)}
          />

          <Input
            label="كود فاتورة التصدير"
            value={form.exportInvoiceCode}
            onChange={(e) => setField("exportInvoiceCode", e.target.value)}
          />

          <label className="flex items-center gap-2 text-sm text-ink-900 mt-6">
            <input
              type="checkbox"
              checked={form.usesExternalDriver}
              onChange={(e) => setField("usesExternalDriver", e.target.checked)}
            />
            سائق خارجي
          </label>

          {form.usesExternalDriver && (
            <Input
              label="اسم السائق الخارجي"
              value={form.externalDriverName}
              onChange={(e) => setField("externalDriverName", e.target.value)}
            />
          )}

          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              نوع الأصناف
            </label>
            <CompactSelect
              options={itemsCategoryOptions}
              value={form.itemsCategory}
              onChange={(v) => setField("itemsCategory", v)}
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              محتوى الفاتورة
            </label>
            <CompactSelect
              options={invoiceContentTypeOptions}
              value={form.invoiceContentType}
              onChange={(v) => setField("invoiceContentType", v)}
            />
          </div>
        </div>

        {/* ==== ملاحظات عامة ==== */}
        <div className="mt-3">
          <Input
            label="ملاحظات عامة"
            value={form.generalNotes}
            onChange={(e) => setField("generalNotes", e.target.value)}
          />
        </div>

        {/* ==== ملاحظات: مقسمة لأربع حقول ==== */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input
            label="وزن البسكال"
            value={form.weighbridgeWeight}
            onChange={(e) => setField("weighbridgeWeight", e.target.value)}
          />
          <Input
            label="فرق الميزان"
            value={form.scaleDifference}
            onChange={(e) => setField("scaleDifference", e.target.value)}
          />
          <Input
            label="الخصم"
            value={form.notesDiscount}
            onChange={(e) => setField("notesDiscount", e.target.value)}
          />
          <Input
            label="الاجمالي"
            value={form.notesTotal}
            onChange={(e) => setField("notesTotal", e.target.value)}
          />
        </div>
      </div>

      {/* أصناف الفاتورة */}
      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-ink-900">الأصناف</h3>
          <Button variant="outline" onClick={addLine}>
            <Plus size={15} />
            إضافة صنف
          </Button>
        </div>
        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-right border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
                <th className="p-2.5 font-medium">#</th>
                <th className="p-2.5 font-medium">الصنف</th>
                <th className="p-2.5 font-medium">العدد</th>
                <th className="p-2.5 font-medium">وزن الوحدة</th>
                <th className="p-2.5 font-medium">الكمية</th>
                <th className="p-2.5 font-medium">سعر الكيلو</th>
                <th className="p-2.5 font-medium">القيمة</th>
                <th className="p-2.5 font-medium">ملاحظات</th>
                <th className="p-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <InvoiceLineRow
                  key={line.id ?? index}
                  index={index}
                  line={line}
                  storeId={form.storeId}
                  invoiceDate={form.invoiceDate}
                  onChange={(newLine) => updateLine(index, newLine)}
                  onRemove={() => removeLine(index)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* العبوات */}
      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-ink-900">العبوات</h3>
          <Button variant="outline" onClick={addContainerLine}>
            <Plus size={15} />
            إضافة عبوة
          </Button>
        </div>
        {containerLines.length > 0 && (
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-right border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
                  <th className="p-2.5 font-medium">#</th>
                  <th className="p-2.5 font-medium">العبوة</th>
                  <th className="p-2.5 font-medium">صادر</th>
                  <th className="p-2.5 font-medium">وارد</th>
                  <th className="p-2.5 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {containerLines.map((line, index) => (
                  <ContainerLineRow
                    key={index}
                    index={index}
                    line={line}
                    onChange={(updated) => updateContainerLine(index, updated)}
                    onRemove={() => removeContainerLine(index)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* الملخص المالي */}
      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4">
        <h3 className="font-display font-bold text-ink-900 mb-3">
          الملخص المالي
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input
            type="number"
            label="الخصم"
            value={form.discountAmount}
            onChange={(e) =>
              setField("discountAmount", Number(e.target.value) || 0)
            }
          />
          <div>
            <Input
              type="number"
              label="المدفوع"
              value={form.paidAmount}
              onChange={(e) =>
                setField("paidAmount", Number(e.target.value) || 0)
              }
            />
            <p className="text-[11px] text-ink-400 mt-1">إرشادي فقط</p>
          </div>
          <div>
            <p className="text-xs text-ink-400 mb-1">الإجمالي (تقديري)</p>
            <p className="num font-bold text-ink-900">
              {displayTotal.toLocaleString("ar-EG")} {invoice.currency}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
