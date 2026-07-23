import { useState, useEffect } from "react";
import { Plus, Save, Printer, Loader2, UserPlus, Boxes, X } from "lucide-react";
import { toast } from "sonner";
import { useGetPartiesSelectQuery } from "../../../partners/partnersApi";
import {
  useGetDriversSelectQuery,
  useGetDriverByIdQuery,
} from "../../../drivers/driversApi";
import { useGetStoresSelectQuery } from "../../../stores/storesApi";
import QuickAddCustomerModal from "../QuickAddCustomerModal";
import QuickAddDriverModal from "../QuickAddDriverModal";
import PackagingDrawer from "../PackagingDrawer";
import { useCreateInvoiceMutation } from "../../salesApi";
import { generateInvoiceNumber } from "../../../../mocks/data/sales";
import LedgerPanel from "../../../../shared/components/ui/LedgerPanel";
import LedgerField from "../../../../shared/components/ui/LedgerField";
import LedgerSelect from "../../../../shared/components/ui/LedgerSelect";
import Button from "../../../../shared/components/ui/Button";
import NewInvoiceLineRow from "./NewInvoiceLineRow";
import CompactSelect from "../../../../shared/components/ui/CompactSelect";

const emptyLine = () => ({
  itemId: "",
  itemName: "",
  packagingUnitId: "",
  packagingUnitName: "",
  packagingCount: 0,
  unitWeight: 0,
  quantity: 0,
  price: 0,
  notes: "",
});

const movementOptions = [
  { value: "sale", label: "بيع" },
  { value: "purchase", label: "شراء" },
  { value: "return", label: "مرتجع" },
];

const paymentOptions = [
  { value: "cash", label: "نقدي" },
  { value: "credit", label: "آجل" },
];

const currencyLabels = { EGP: "جنيه مصري", USD: "دولار أمريكي" };

/**
 * @param {{ onSuccess?: () => void }} props
 */
export default function CreateInvoiceForm({ onSuccess }) {
  const { data: parties } = useGetPartiesSelectQuery();
  const { data: drivers } = useGetDriversSelectQuery();
  const { data: stores } = useGetStoresSelectQuery();
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [showPackaging, setShowPackaging] = useState(false);
  const [itemsLocked, setItemsLocked] = useState(true); // مقفول لحد ما يتختار مخزن

  const [header, setHeader] = useState({
    invoiceNumber: generateInvoiceNumber("sale"),
    movementType: "sale",
    date: new Date().toISOString().slice(0, 10),
    partyName: "",
    currency: "EGP",
    driverId: "",
    driverName: "",
    licenseNumber: "",
    storeId: "",
    country: "",
    carNumber: "",
    paymentMethod: "cash",
    treasuryAccount: "",
    discount: 0,
    tax: 0,
    paid: 0,
  });

  const [lines, setLines] = useState([emptyLine()]);

  const setHeaderField = (key, value) =>
    setHeader((h) => ({ ...h, [key]: value }));

  // المخزن إلزامي قبل الأصناف
  useEffect(() => {
    setItemsLocked(!header.storeId);
  }, [header.storeId]);

  const handlePartyChange = (name) => {
    const party = parties?.find((c) => c.name === name);
    setHeaderField("partyName", name);
    if (party?.currency) setHeaderField("currency", party.currency);
  };

  const handleCustomerCreated = (newParty) => {
    setHeaderField("partyName", newParty.name);
    if (newParty.currency) setHeaderField("currency", newParty.currency);
  };

  // لما يتختار سائق، نجيب بياناته كاملة عشان رقم الرخصة
  const { data: driverDetails } = useGetDriverByIdQuery(header.driverId, {
    skip: !header.driverId,
  });

  useEffect(() => {
    if (driverDetails?.licenseNumber) {
      setHeaderField("licenseNumber", driverDetails.licenseNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverDetails]);

  const handleDriverChange = (driverId) => {
    const driver = drivers?.find((d) => d.id === driverId);
    setHeaderField("driverId", driverId);
    setHeaderField("driverName", driver?.name || "");
  };

  const handleDriverCreated = (newDriver) => {
    setHeaderField("driverId", newDriver.id);
    setHeaderField("driverName", newDriver.name);
    setHeaderField("licenseNumber", newDriver.licenseNumber || "");
  };

  const updateLine = (index, newLine) =>
    setLines((prev) => prev.map((l, i) => (i === index ? newLine : l)));
  const removeLine = (index) =>
    setLines((prev) => prev.filter((_, i) => i !== index));
  const addLine = () => {
    if (itemsLocked) {
      toast.error("اختر المخزن أولاً قبل إضافة الأصناف");
      return;
    }
    setLines((prev) => [...prev, emptyLine()]);
    toast.info("تم إضافة صف جديد");
  };

  // ==== الملخص المالي الكامل ====
  const itemsCount = lines.filter((l) => l.itemId).length;
  const totalCount = lines.reduce(
    (s, l) => s + (Number(l.packagingCount) || 0),
    0,
  );
  const totalQuantity = lines.reduce(
    (s, l) => s + (Number(l.quantity) || 0),
    0,
  );

  const pricedLines = lines.filter((l) => Number(l.price) > 0);
  const invoiceTotal = pricedLines.reduce(
    (sum, l) => sum + (Number(l.quantity) || 0) * Number(l.price),
    0,
  );
  const unpricedCount = lines.filter(
    (l) => l.itemId && !(Number(l.price) > 0),
  ).length;

  const discount = header.discount || 0;
  const tax = header.tax || 0;
  const paid = header.paid || 0;

  const remaining = invoiceTotal - paid;

  const partyOptions =
    parties?.map((p) => ({ value: p.name, label: p.name })) || [];

  const submitInvoice = async (shouldPrint = false) => {
    if (!header.storeId) {
      toast.error("اختر المخزن أولاً");
      return;
    }

    const validLines = lines.filter(
      (line) => line.itemId && Number(line.quantity) > 0,
    );

    if (validLines.length === 0) {
      toast.error("لازم تضيف صنف واحد على الأقل");
      return;
    }

    if (!header.partyName) {
      toast.error("اختر العميل أو المورد أولاً");
      return;
    }

    const payload = {
      ...header,

      items: validLines.map((line) => ({
        itemId: line.itemId,
        packagingUnitId: line.packagingUnitId,
        packagingCount: Number(line.packagingCount),
        unitWeight: Number(line.unitWeight),
        quantity: Number(line.quantity),
        price: Number(line.price),
        notes: line.notes,
      })),
    };

    console.log("========== Invoice ==========");
    console.log(payload);
    console.log(JSON.stringify(payload, null, 2));

    try {
      await createInvoice(payload).unwrap();

      toast.success("تم حفظ الفاتورة بنجاح", {
        description: `رقم الفاتورة: ${header.invoiceNumber}`,
      });

      onSuccess?.();

      if (shouldPrint) {
        // افتح صفحة الطباعة هنا
      }
    } catch (err) {
      console.error("فشل حفظ الفاتورة:", err);
      toast.error("حدث خطأ أثناء حفظ الفاتورة");
    }
  };

  const fmt = (v) => v.toLocaleString("ar-EG");
  const currencySymbol = header.currency === "USD" ? "$" : "ج.م";

  return (
    <div className="space-y-5">
      <LedgerPanel title="بيانات الفاتورة">
        <div className="grid grid-cols-1 sm:grid-cols-3">
          <LedgerField
            label="رقم الفاتورة"
            value={header.invoiceNumber}
            onChange={(e) => setHeaderField("invoiceNumber", e.target.value)}
          />
          <LedgerSelect
            label="نوع الفاتورة"
            options={movementOptions}
            value={header.movementType}
            onChange={(e) => setHeaderField("movementType", e.target.value)}
          />
          <LedgerField
            label="التاريخ"
            type="date"
            value={header.date}
            onChange={(e) => setHeaderField("date", e.target.value)}
          />
        </div>
        <div className="flex items-stretch">
          <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
            عميل / مورد
          </div>
          <CompactSelect
            label="عميل / مورد"
            options={
              parties?.map((p) => ({ value: p.name, label: p.name })) || []
            }
            value={header.partyName}
            onChange={handlePartyChange}
            placeholder="اختر العميل أو المورد"
          />
          <button
            type="button"
            onClick={() => setShowAddCustomer(true)}
            className="px-3 text-primary-500 hover:bg-primary-50 border-r border-ink-400/10 transition-colors"
            title="إضافة عميل/مورد جديد"
          >
            <UserPlus size={17} />
          </button>
          <button
            type="button"
            onClick={() => header.partyName && setShowPackaging(true)}
            disabled={!header.partyName}
            className="px-3 text-primary-500 hover:bg-primary-50 border-r border-ink-400/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            title="مخزن العبوات"
          >
            <Boxes size={17} />
          </button>
        </div>

        <div className="flex  ">
          <div className="flex-1 flex items-stretch">
            <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
              العملة
            </div>
            <div className="  px-3 py-2.5 text-sm    flex items-center">
              {currencyLabels[header.currency]}
              {header.partyName && (
                <span className="text-xs text-ink-400 mr-2">
                  (تلقائي حسب العميل)
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 flex items-stretch">
            <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
              المخزن <span className="text-negative">*</span>
            </div>
            <CompactSelect
              label={"المخزن"}
              options={
                stores?.map((s) => ({ value: s.id, label: s.name })) || []
              }
              value={header.storeId}
              onChange={(val) => setHeaderField("storeId", val)}
              placeholder="اختر المخزن"
            />
          </div>
        </div>

        {/* السائق + رقم الرخصة التلقائي */}
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="flex items-stretch">
            <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
              السائق
            </div>
            <CompactSelect
              label="السائق"
              options={
                drivers?.map((d) => ({ value: d.id, label: d.name })) || []
              }
              value={header.driverId}
              onChange={handleDriverChange}
              placeholder="اختر السائق"
            />
            <button
              type="button"
              onClick={() => setShowAddDriver(true)}
              className="px-3 text-primary-500 hover:bg-primary-50 border-r border-ink-400/10 transition-colors"
              title="إضافة سائق جديد"
            >
              <UserPlus size={17} />
            </button>
          </div>

          <LedgerField
            label="رقم الرخصة"
            value={header.licenseNumber}
            readOnly
            className="bg-ink-400/5"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          <LedgerField
            label="البلد"
            value={header.country}
            onChange={(e) => setHeaderField("country", e.target.value)}
          />
          <LedgerField
            label="رقم السيارة"
            value={header.carNumber}
            onChange={(e) => setHeaderField("carNumber", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          <LedgerSelect
            label="طريقة الدفع"
            options={paymentOptions}
            value={header.paymentMethod}
            onChange={(e) => setHeaderField("paymentMethod", e.target.value)}
          />
          {header.paymentMethod === "cash" && (
            <LedgerField
              label="الخزنة / البنك"
              value={header.treasuryAccount}
              onChange={(e) =>
                setHeaderField("treasuryAccount", e.target.value)
              }
              placeholder="اسم الخزنة أو البنك"
            />
          )}
        </div>
      </LedgerPanel>

      <div className="grid grid-cols-1   gap-4 items-start">
        {/* جدول الأصناف */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h4 className="text-sm font-medium text-ink-600">الأصناف</h4>
            {unpricedCount > 0 && (
              <span className="text-xs text-gold-600 bg-gold-50 px-2 py-0.5 rounded-full">
                {unpricedCount} بدون سعر
              </span>
            )}
          </div>

          {itemsLocked && (
            <div className="text-center py-6 border border-dashed border-gold-200 bg-gold-50/40 rounded-2xl mb-3">
              <p className="text-sm text-gold-700">
                اختر المخزن أولاً قبل إضافة الأصناف
              </p>
            </div>
          )}

          <div
            className={`overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card ${itemsLocked ? "opacity-50 pointer-events-none" : ""}`}
          >
            <table className="w-full text-right border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
                  <th className="p-2.5 font-medium">#</th>
                  <th className="p-2.5 font-medium">الصنف</th>
                  <th className="p-2.5 font-medium">الوحدة</th>
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

        {/* ملخص الفاتورة الكامل */}
        <div className="lg:sticky lg:top-4">
          <LedgerPanel title="ملخص الفاتورة">
            <div className="flex items-stretch">
              <div className="w-32 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
                عدد الأصناف
              </div>
              <div className="flex-1 px-3 py-2.5 text-sm num flex items-center">
                {itemsCount}
              </div>
            </div>

            <div className="flex items-stretch">
              <div className="w-32 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
                إجمالي الكمية
              </div>
              <div className="flex-1 px-3 py-2.5 text-sm num flex items-center">
                {fmt(totalQuantity)}
              </div>
            </div>

            <div className="flex items-stretch">
              <div className="w-32 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-semibold text-ink-900 flex items-center border-l border-ink-400/10">
                إجمالي الفاتورة
              </div>
              <div className="flex-1 px-3 py-2.5 text-sm num font-semibold flex items-center">
                {fmt(invoiceTotal)} {currencySymbol}
              </div>
            </div>

            <LedgerField
              label="المدفوع"
              type="number"
              value={header.paid}
              onChange={(e) => setHeaderField("paid", Number(e.target.value))}
            />
            <div className="flex items-stretch">
              <div className="w-32 shrink-0 bg-gold-50 px-3 py-2.5 text-sm font-semibold text-gold-600 flex items-center border-l border-ink-400/10">
                المتبقي
              </div>
              <div
                className={`flex-1 px-3 py-2.5 text-sm num font-semibold flex items-center ${remaining > 0 ? "text-negative" : "text-positive"}`}
              >
                {fmt(remaining)} {currencySymbol}
              </div>
            </div>
          </LedgerPanel>

          <div className="space-y-2 mt-4">
            <Button
              onClick={() => submitInvoice(false)}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              حفظ
            </Button>
            <Button
              variant="outline"
              onClick={() => submitInvoice(true)}
              disabled={isLoading}
              className="w-full"
            >
              <Printer size={16} />
              حفظ وطباعة
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={onSuccess}
              className="w-full"
            >
              <X size={16} />
              إلغاء
            </Button>
          </div>
        </div>
      </div>

      <QuickAddCustomerModal
        isOpen={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onCreated={handleCustomerCreated}
      />
      <QuickAddDriverModal
        isOpen={showAddDriver}
        onClose={() => setShowAddDriver(false)}
        onCreated={handleDriverCreated}
      />
      <PackagingDrawer
        partyName={header.partyName}
        invoiceNumber={header.invoiceNumber}
        isOpen={showPackaging}
        onClose={() => setShowPackaging(false)}
      />
    </div>
  );
}
