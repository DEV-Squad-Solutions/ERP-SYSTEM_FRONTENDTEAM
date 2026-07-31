import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Save,
  Printer,
  Loader2,
  UserPlus,
  Boxes,
  X,
  Truck,
  Repeat2Icon,
  FileText,
  MapPin,
  Wallet,
  Lock,
  StoreIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetPartiesSelectQuery,
  useGetPartyByIdQuery,
  useGetPartyContainerStoreQuery,
} from "../../../partners/partiesApi";
import { useGetDriversSelectQuery } from "../../../drivers/driversApi";
import { useGetStoresSelectQuery } from "../../../stores/storesApi";
import { useGetCountriesSelectQuery } from "../../../countries/countriesApi";
import QuickAddCustomerModal from "../QuickAddCustomerModal";
import QuickAddDriverModal from "../QuickAddDriverModal";
import PackagingDrawer from "../PackagingDrawer";
import { useCreateInvoiceMutation } from "../../../invoices/invoicesApi";
import { buildInvoicePayload } from "../../../invoices/components/buildInvoicePayload";
import { generateInvoiceNumber } from "../../../../mocks/data/sales";
import LedgerPanel from "../../../../shared/components/ui/LedgerPanel";
import LedgerField from "../../../../shared/components/ui/LedgerField";
import LedgerSelect from "../../../../shared/components/ui/LedgerSelect";
import Button from "../../../../shared/components/ui/Button";
import InvoiceLineRow from "./NewInvoiceLineRow";
import CompactSelect from "../../../../shared/components/ui/CompactSelect";
import { useInvoicePrint } from "../../../../shared/hooks/useInvoicePrint";
import InvoicePrintTemplate from "../../../../shared/components/print/InvoicePrintTemplate";
import NumericInput from "../../../../shared/components/ui/NumericInput";
import { useGetCashboxOptionsQuery } from "../../../cashboxes/cashboxesApi";
import { useGetCashMovementTypeOptionsQuery } from "../../../cashboxes/cashMovementTypesApi";

const emptyLine = () => ({
  itemId: null,
  itemName: "",
  itemCode: "",
  isTemporaryItem: false,
  itemUnitId: null,
  itemUnitName: "",
  count: null,
  weight: null,
  quantity: null,
  price: null,
  notes: "",
});

const movementOptions = [
  { value: "sale", label: "بيع" },
  { value: "purchase", label: "شراء" },
  { value: "salesReturn", label: "مرتجع بيع" },
  { value: "purchaseReturn", label: "مرتجع شراء" },
];

const paymentOptions = [
  { value: "cash", label: "نقدي" },
  { value: "credit", label: "آجل" },
];

const invoiceContentTypeOptions = [
  { value: "items", label: "أصناف" },
  { value: "containers", label: "عبوات" },
];

const currencyLabels = { EGP: "جنيه مصري", USD: "دولار أمريكي" };

export default function CreateInvoiceForm({ onSuccess }) {
  const { data: parties } = useGetPartiesSelectQuery();
  const { data: drivers } = useGetDriversSelectQuery();
  const { data: stores } = useGetStoresSelectQuery();
  const { data: countries } = useGetCountriesSelectQuery();
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [showPackaging, setShowPackaging] = useState(false);
  const [containersMovement, setContainersMovement] = useState({
    containerStoreId: null,
    items: [],
  });
  const [itemsLocked, setItemsLocked] = useState(true);
  const [isTemporaryDriver, setIsTemporaryDriver] = useState(false);

  const [header, setHeader] = useState({
    invoiceNumber: generateInvoiceNumber("sale"),
    movementType: "sale",
    date: new Date().toISOString().slice(0, 10),
    dueDate: new Date().toISOString().slice(0, 10),
    partyId: "",
    partyName: "",
    currency: "EGP",
    driverId: "",
    actualDriverId: "",
    driverName: "",
    storeId: "",
    countryId: "",
    carNumber: "",
    exportInvoiceCode: "",
    partnerInvoiceNo: "",
    paymentMethod: "credit",
    cashboxId: "",
    cashboxName: "",
    cashboxExchangeRate: "",
    cashMovementTypeId: "",
    cashMovementTypeName: "",
    discount: "",
    paid: "",
    exchangeRate: 1,
    invoiceContentType: "items",
    generalNotes: "",
    WBWeight: "",
    WBScaleDifference: "",
    WBDiscount: "",
  });

  const [lines, setLines] = useState(() =>
    Array.from({ length: 10 }, () => emptyLine()),
  );

  const packagingBreakdown = useMemo(() => {
    const totals = {};
    lines.forEach((l) => {
      const count = Number(l.count) || 0;
      if (!l.itemUnitName || !count) return;
      totals[l.itemUnitName] = (totals[l.itemUnitName] || 0) + count;
    });
    return Object.entries(totals).map(([unitName, count]) => ({
      unitName,
      count,
    }));
  }, [lines]);

  // نوع الفاتورة "بيع" هو الوحيد اللي بيسمح بحركة عبوات
  const isSalesInvoice = header.movementType === "sale";
  const isReturnInvoice =
    header.movementType === "salesReturn" ||
    header.movementType === "purchaseReturn";

  const setHeaderField = (key, value) =>
    setHeader((h) => ({ ...h, [key]: value }));

  useEffect(() => {
    setItemsLocked(!header.storeId);
  }, [header.storeId]);

  // ==== مخزن العبوات بتاع العميل - بيتحدث تلقائيًا مع تغيير العميل ====
  const { data: partyContainerStoreData } = useGetPartyContainerStoreQuery(
    header.partyId,
    { skip: !header.partyId || !isSalesInvoice },
  );

  // الخزنة ونوع الحركة لازمين مع أي مبلغ مدفوع أكبر من صفر (نقدي أو آجل بدفعة جزئية)
  const hasPayment = Number(header.paid) > 0;

  const { data: cashboxes } = useGetCashboxOptionsQuery(undefined, {
    skip: !hasPayment,
  });
  const { data: cashMovementTypeOptions } = useGetCashMovementTypeOptionsQuery(
    undefined,
    { skip: !hasPayment },
  );

  const handleCashboxChange = (cashboxId) => {
    const cashbox = cashboxes?.find((c) => String(c.id) === String(cashboxId));
    setHeaderField("cashboxId", cashboxId);
    setHeaderField("cashboxName", cashbox?.name || "");
  };

  const handleCashMovementTypeChange = (typeId) => {
    const type = cashMovementTypeOptions?.find(
      (t) => String(t.id) === String(typeId),
    );
    setHeaderField("cashMovementTypeId", typeId);
    setHeaderField("cashMovementTypeName", type?.name || "");
  };

  // لما المدفوع يترجع صفر، صفّر الخزنة ونوع الحركة عشان مايتبعتوش من غير داعي
  useEffect(() => {
    if (!hasPayment && (header.cashboxId || header.cashMovementTypeId)) {
      setHeader((h) => ({
        ...h,
        cashboxId: "",
        cashboxName: "",
        cashMovementTypeId: "",
        cashMovementTypeName: "",
        cashboxExchangeRate: "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPayment]);

  useEffect(() => {
    if (!isSalesInvoice) return;
    const store = partyContainerStoreData?.containerStore;
    setContainersMovement((prev) => ({
      ...prev,
      containerStoreId: store?.id || null,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partyContainerStoreData, isSalesInvoice]);

  // لو نوع الفاتورة مش بيع، نصفّر حركة العبوات بالكامل (منتبعتش للباك خالص)
  useEffect(() => {
    if (!isSalesInvoice && containersMovement.items.length > 0) {
      setContainersMovement({ containerStoreId: null, items: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSalesInvoice]);

  const handlePartyChange = (name) => {
    const party = parties?.find((c) => c.name === name);
    setHeaderField("partyName", name);
    setHeaderField("partyId", party?.id || "");
    if (party?.currency) setHeaderField("currency", party.currency);
  };

  const handleCustomerCreated = (newParty) => {
    setHeaderField("partyName", newParty.name);
    setHeaderField("partyId", newParty.id || "");
    if (newParty.currency) setHeaderField("currency", newParty.currency);
  };

  const handleDriverChange = (driverId) => {
    const driver = drivers?.find((d) => d.id === driverId);
    setHeaderField("driverId", driverId);
    setHeaderField("driverName", driver?.name || "");
  };

  const handleDriverCreated = (newDriver) => {
    setHeaderField("driverId", newDriver.id);
    setHeaderField("driverName", newDriver.name);
  };

  const updateLine = (index, newLine) =>
    setLines((prev) => prev.map((l, i) => (i === index ? newLine : l)));
  const removeLine = (index) =>
    setLines((prev) => prev.filter((_, i) => i !== index));
  const addLine = () => {
    if (itemsLocked) return;
    setLines((prev) => [...prev, emptyLine()]);
  };

  // ==== الملخص المالي الكامل - بيتحدث تلقائيًا مع أي تغيير في الأصناف/الخصم ====
  const totalQuantity = useMemo(
    () => lines.reduce((s, l) => s + (Number(l.quantity) || 0), 0),
    [lines],
  );

  const pricedLines = useMemo(
    () => lines.filter((l) => Number(l.price) > 0),
    [lines],
  );

  const invoiceTotal = useMemo(
    () =>
      pricedLines.reduce(
        (sum, l) => sum + (Number(l.quantity) || 0) * Number(l.price),
        0,
      ),
    [pricedLines],
  );

  const unpricedCount = lines.filter(
    (l) => l.itemId && !(Number(l.price) > 0),
  ).length;

  const discount = parseFloat(header.discount) || 0;
  const paid = parseFloat(header.paid) || 0;

  const netTotal = Math.max(invoiceTotal - discount, 0);
  const remaining = Math.max(netTotal - paid, 0);

  // wbTotal بيتحسب في الباك تلقائيًا - هنا للعرض بس
  const wbTotal =
    (parseFloat(header.WBWeight) || 0) -
    (parseFloat(header.WBScaleDifference) || 0) -
    (parseFloat(header.WBDiscount) || 0);

  const handlePaymentMethodChange = (method) => {
    setHeaderField("paymentMethod", method);
  };

  const { printInvoice, printRef, invoiceToPrint } = useInvoicePrint();

  const submitInvoice = async (shouldPrint = false) => {
    const hasTemporaryLine = lines.some(
      (l) => l.isTemporaryItem && Number(l.quantity) > 0,
    );
    if (hasTemporaryLine) {
      toast.error("مفيش دعم لصنف يدوي حاليًا", {
        description: "شيل الأصناف اليدوية واختار صنف موجود بالفعل قبل الحفظ",
      });
      return;
    }

    if (header.paymentMethod === "cash" && Number(header.paid) !== netTotal) {
      toast.error("الفاتورة النقدية لازم يكون المدفوع = صافي الفاتورة بالظبط");
      return;
    }

    if (
      Number(header.paid) > 0 &&
      (!header.cashboxId || !header.cashMovementTypeId)
    ) {
      toast.error("اختر الخزنة ونوع الحركة أولاً لإن فيه مبلغ مدفوع");
      return;
    }

    const payload = buildInvoicePayload({
      movementType: header.movementType,
      header,
      lines,
      containersMovement,
      isTemporaryDriver,
    });
    console.log(payload);

    const invoice = await createInvoice(payload).unwrap();

    toast.success("تم حفظ الفاتورة بنجاح", {
      description: `رقم الفاتورة: ${header.invoiceNumber}`,
    });

    onSuccess?.();

    if (shouldPrint) {
      printInvoice(invoice);
    }
  };

  const fmt = (v) => v.toLocaleString("ar-EG");
  const currencySymbol = header.currency === "USD" ? "$" : "ج.م";

  return (
    <div className="space-y-5">
      {/* ============ القسم 1: بيانات الفاتورة الأساسية ============ */}
      <LedgerPanel
        title={
          <span className="flex items-center gap-2 pr-3">
            <FileText size={15} />
            بيانات الفاتورة
          </span>
        }
      >
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
        <div className="grid grid-cols-1 sm:grid-cols-3">
          <LedgerField
            label="تاريخ الاستحقاق"
            type="date"
            value={header.dueDate}
            onChange={(e) => setHeaderField("dueDate", e.target.value)}
          />
          <LedgerField
            label="كود فاتورة التصدير"
            value={header.exportInvoiceCode}
            onChange={(e) =>
              setHeaderField("exportInvoiceCode", e.target.value)
            }
          />
          <LedgerField
            label="رقم فاتورة الشريك"
            value={header.partnerInvoiceNo}
            onChange={(e) => setHeaderField("partnerInvoiceNo", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3">
          <LedgerField
            label="سعر الصرف"
            type="number"
            value={header.exchangeRate}
            onChange={(e) => setHeaderField("exchangeRate", e.target.value)}
          />
          <LedgerSelect
            label="محتوى الفاتورة"
            options={invoiceContentTypeOptions}
            value={header.invoiceContentType}
            onChange={(e) =>
              setHeaderField("invoiceContentType", e.target.value)
            }
          />
        </div>
      </LedgerPanel>

      {/* ============ القسم 2: العميل والمخزن والنقل ============ */}
      <LedgerPanel
        title={
          <span className="flex items-center gap-2 pr-3">
            <MapPin size={15} />
            العميل والنقل
          </span>
        }
      >
        <div className="flex items-stretch">
          <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
            عميل / مورد <span className="text-negative">*</span>
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
            onClick={() =>
              isSalesInvoice && header.partyName && setShowPackaging(true)
            }
            disabled={!isSalesInvoice || !header.partyName}
            className={`relative px-3 border-r border-ink-400/10 transition-colors ${
              !isSalesInvoice || !header.partyName
                ? "text-ink-400/40 pointer-events-none"
                : "text-primary-500 hover:bg-primary-50"
            }`}
            title={
              !isSalesInvoice
                ? "مخزن العبوات متاح لفواتير البيع فقط"
                : "مخزن العبوات"
            }
          >
            {!isSalesInvoice ? <Lock size={17} /> : <Boxes size={17} />}
            {isSalesInvoice && containersMovement.items.length > 0 && (
              <Repeat2Icon className="absolute top-1 left-1" size={12} />
            )}
          </button>
        </div>

        {!isSalesInvoice && (
          <div className="px-3 py-2 text-xs text-ink-400 bg-ink-900/[0.02] border-t border-ink-400/5">
            حركة العبوات متاحة بس مع فواتير البيع، ومش هتتبعت مع النوع الحالي.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="flex items-stretch">
            <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
              العملة
            </div>
            <div className="px-3 py-2.5 text-sm flex items-center">
              {currencyLabels[header.currency]}
              {header.partyName && (
                <span className="text-xs text-ink-400 mr-2">
                  (تلقائي حسب العميل)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-stretch">
            <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
              المخزن <span className="text-negative">*</span>
            </div>
            <CompactSelect
              label="المخزن"
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
          <div className="flex items-stretch">
            <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
              السائق
            </div>
            {isTemporaryDriver ? (
              <input
                type="text"
                value={header.driverName}
                onChange={(e) => setHeaderField("driverName", e.target.value)}
                placeholder="اكتب اسم السائق"
                className="flex-1 px-3 py-2 outline-none text-sm"
              />
            ) : (
              <CompactSelect
                label="السائق"
                options={
                  drivers?.map((d) => ({ value: d.id, label: d.name })) || []
                }
                value={header.driverId}
                onChange={handleDriverChange}
                placeholder="اختر السائق"
              />
            )}
            <button
              type="button"
              onClick={() => setShowAddDriver(true)}
              className="px-3 text-primary-500 hover:bg-primary-50 border-r border-ink-400/10 transition-colors"
              title="إضافة سائق جديد"
            >
              <UserPlus size={17} />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsTemporaryDriver((prev) => !prev);
                setHeader((h) => ({
                  ...h,
                  driverId: "",
                  driverName: "",
                }));
              }}
              className={`px-3 border-r border-ink-400/10 transition-colors ${
                isTemporaryDriver
                  ? "bg-primary-100 text-primary-600"
                  : "text-primary-500 hover:bg-primary-50"
              }`}
              title="سائق وقتي"
            >
              <Truck size={17} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="flex items-stretch">
            <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
              السائق الفعلي
            </div>
            <CompactSelect
              label="السائق الفعلي"
              options={
                drivers?.map((d) => ({ value: d.id, label: d.name })) || []
              }
              value={header.actualDriverId}
              onChange={(val) => setHeaderField("actualDriverId", val)}
              placeholder="اختر السائق الفعلي (اختياري)"
            />
          </div>
          <LedgerField
            label="رقم السيارة"
            value={header.carNumber}
            onChange={(e) => setHeaderField("carNumber", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="flex items-stretch">
            <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
              البلد
            </div>
            <CompactSelect
              label="البلد"
              options={
                countries?.map((c) => ({ value: c.id, label: c.name })) || []
              }
              value={header.countryId}
              onChange={(val) => setHeaderField("countryId", val)}
              placeholder="اختر البلد"
            />
          </div>
        </div>
      </LedgerPanel>

      {/* ============ القسم 3: الدفع والملاحظات ============ */}
      <LedgerPanel
        title={
          <span className="flex items-center gap-2 pr-3">
            <Wallet size={15} />
            الدفع والملاحظات
          </span>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <LedgerSelect
            label="طريقة الدفع"
            options={paymentOptions}
            value={header.paymentMethod}
            onChange={(e) => handlePaymentMethodChange(e.target.value)}
          />
        </div>

        {hasPayment && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="flex items-stretch">
                <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
                  الخزنة <span className="text-negative">*</span>
                </div>
                <CompactSelect
                  label="الخزنة"
                  options={
                    cashboxes?.map((c) => ({
                      value: c.id,
                      label: `${c.name} (${currencyLabels[c.currency] || c.currency})`,
                    })) || []
                  }
                  value={header.cashboxId}
                  onChange={handleCashboxChange}
                  placeholder="اختر الخزنة"
                />
              </div>
              <div className="flex items-stretch">
                <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
                  نوع الحركة <span className="text-negative">*</span>
                </div>
                <CompactSelect
                  label="نوع الحركة"
                  options={
                    cashMovementTypeOptions?.map((t) => ({
                      value: t.id,
                      label: t.name,
                    })) || []
                  }
                  value={header.cashMovementTypeId}
                  onChange={handleCashMovementTypeChange}
                  placeholder="اختر نوع الحركة"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <LedgerField
                label="سعر صرف الخزنة"
                type="number"
                value={header.cashboxExchangeRate}
                onChange={(e) =>
                  setHeaderField("cashboxExchangeRate", e.target.value)
                }
              />
            </div>
          </>
        )}

        {/* ==== ملاحظات عامة ==== */}
        <div className="grid grid-cols-1">
          <LedgerField
            label="ملاحظات عامة"
            value={header.generalNotes}
            onChange={(e) => setHeaderField("generalNotes", e.target.value)}
          />
        </div>

        {/* ==== ملاحظات: وزن البسكال ==== */}
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <LedgerField
            label="وزن البسكال"
            value={header.WBWeight}
            onChange={(e) => setHeaderField("WBWeight", e.target.value)}
          />
          <LedgerField
            label="فرق الميزان"
            value={header.WBScaleDifference}
            onChange={(e) =>
              setHeaderField("WBScaleDifference", e.target.value)
            }
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <LedgerField
            label="الخصم"
            value={header.WBDiscount}
            onChange={(e) => setHeaderField("WBDiscount", e.target.value)}
          />
          <div className="flex items-stretch">
            <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
              الاجمالي
            </div>
            <div className="flex-1 px-3 py-2.5 text-sm num text-ink-600 bg-ink-400/5">
              {wbTotal.toLocaleString("ar-EG")}
              <span className="text-[11px] text-ink-400 mr-1.5">
                (يتحسب تلقائيًا)
              </span>
            </div>
          </div>
        </div>
      </LedgerPanel>

      {/* ============ القسم 4: الأصناف ============ */}
      <LedgerPanel
        title={
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="flex items-center gap-2 pr-3">
              <StoreIcon size={15} />
              الأصناف{" "}
            </span>{" "}
            {unpricedCount > 0 && (
              <span className="text-xs text-gold-600 bg-gold-50 px-2 py-0.5 rounded-full">
                {unpricedCount} بدون سعر
              </span>
            )}{" "}
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 items-start">
          <div>
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
              <table className="w-full text-right border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
                    <th className="p-2.5 font-medium">#</th>
                    <th className="p-2.5 font-medium">الصنف</th>
                    <th className="p-2.5 font-medium"> العدد بالمخزن</th>
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
                    <InvoiceLineRow
                      key={line.id ?? index}
                      index={index}
                      line={line}
                      storeId={header.storeId}
                      invoiceDate={header.date}
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
        </div>
      </LedgerPanel>

      {/* ============ القسم 5: ملخص الفاتورة ============ */}
      <LedgerPanel
        title={
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="flex items-center gap-2 pr-3 font-semibold text-sm">
              <StoreIcon size={15} />
              ملخص الفاتورة
            </span>
          </div>
        }
      >
        <div className="lg:sticky lg:top-4 space-y-3">
          <div className="rounded-xl border border-ink-400/10 overflow-hidden bg-white">
            {/* عدد العبوات */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-ink-400/10">
              <span className="text-sm text-ink-600">عدد العبوات</span>
              <span className="text-sm font-semibold num text-ink-900">
                {packagingBreakdown.length > 0
                  ? packagingBreakdown
                      .map((p) => `${fmt(p.count)} ${p.unitName}`)
                      .join("، ")
                  : "—"}
              </span>
            </div>

            {/* إجمالي الكمية */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-ink-400/10">
              <span className="text-sm text-ink-600">إجمالي الكمية</span>
              <span className="text-sm font-semibold num text-ink-900">
                {fmt(totalQuantity)}
              </span>
            </div>

            {/* إجمالي الفاتورة */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-ink-400/10 bg-primary-500/[0.03]">
              <span className="text-sm font-semibold text-ink-900">
                إجمالي الفاتورة
              </span>
              <span className="text-sm font-bold num text-ink-900">
                {fmt(invoiceTotal)} {currencySymbol}
              </span>
            </div>

            {/* الخصم */}
            <div className="flex items-stretch border-b border-ink-400/10">
              <div className="w-32 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
                الخصم
              </div>
              <div className="flex-1 p-2">
                <NumericInput
                  value={header.discount ?? ""}
                  decimals
                  onChange={(value) =>
                    setHeaderField("discount", value === "" ? "" : value)
                  }
                />
              </div>
            </div>

            {/* الصافي */}
            <div className="flex items-center justify-between px-3 py-2.5 border-y border-ink-400/10 bg-ink-900/[0.02]">
              <span className="text-sm font-semibold text-ink-900">الصافي</span>
              <span className="text-sm font-bold num text-ink-900">
                {fmt(netTotal)} {currencySymbol}
              </span>
            </div>

            {/* المدفوع */}
            <div className="flex items-stretch border-b border-ink-400/10">
              <div className="w-32 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
                المدفوع
              </div>
              <div className="flex-1 p-2">
                <NumericInput
                  value={header.paid ?? ""}
                  decimals
                  onChange={(value) =>
                    setHeaderField("paid", value === "" ? "" : value)
                  }
                />
              </div>
            </div>

            {/* المتبقي */}
            <div className="flex items-center justify-between px-3 py-2.5 bg-ink-900/[0.02]">
              <span className="text-sm font-semibold text-ink-900">
                المتبقي
              </span>
              <span className="text-sm font-bold num text-ink-900">
                {fmt(remaining)} {currencySymbol}
              </span>
            </div>
          </div>
        </div>
      </LedgerPanel>

      {/* Buttons */}
      <div className="space-y-2">
        <Button
          onClick={() => submitInvoice(false)}
          disabled={isLoading}
          className="
          w-full
          h-10
          shadow-sm
        "
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
          className="
          w-full
          h-10
        "
        >
          <Printer size={16} />
          حفظ وطباعة
        </Button>

        <Button
          variant="ghost"
          type="button"
          onClick={onSuccess}
          className="
          w-full
          h-10
        "
        >
          <X size={16} />
          إلغاء
        </Button>
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
        partyId={header.partyId}
        partyName={header.partyName}
        isOpen={showPackaging}
        onClose={() => setShowPackaging(false)}
        initialItems={containersMovement.items}
        onSave={(data) => setContainersMovement(data)}
      />
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <InvoicePrintTemplate invoice={invoiceToPrint} />
        </div>
      </div>
    </div>
  );
}
