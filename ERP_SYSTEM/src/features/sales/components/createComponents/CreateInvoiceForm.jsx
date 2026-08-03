import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import { buildCreateInvoiceRequest } from "../../../invoices/components/buildInvoicePayload";
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

// ============ شريحة العملة - بتتحرك مع الظهور/الاختفاء/التغيير مع كل تغيير للعميل ============
function CurrencyChip({ currency }) {
  const [renderedCurrency, setRenderedCurrency] = useState(currency);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hideTimer;
    let showTimer;

    if (currency) {
      if (renderedCurrency && renderedCurrency !== currency) {
        // العملة اتغيرت (عميل جديد بعملة مختلفة) - اختفاء سريع ثم ظهور بالقيمة الجديدة
        setVisible(false);
        hideTimer = setTimeout(() => {
          setRenderedCurrency(currency);
          requestAnimationFrame(() => setVisible(true));
        }, 160);
      } else {
        setRenderedCurrency(currency);
        showTimer = setTimeout(() => setVisible(true), 10);
      }
    } else {
      // اتشال العميل - اختفاء ثم إزالة من الـ DOM
      setVisible(false);
      hideTimer = setTimeout(() => setRenderedCurrency(null), 160);
    }

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  if (!renderedCurrency) return null;

  const isUsd = renderedCurrency === "USD";

  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all duration-200 ease-out ${
        visible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-90 -translate-y-1"
      } ${
        isUsd
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-primary-200 bg-primary-50 text-primary-600"
      }`}
    >
      {isUsd ? "$" : "ج.م"}{" "}
      {currencyLabels[renderedCurrency] || renderedCurrency}
    </span>
  );
}

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
    invoiceNumber: "INVS-" + generateInvoiceNumber(),
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

  const partySelectRef = useRef(null);

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

  const setHeaderField = useCallback(
    (key, value) => setHeader((h) => ({ ...h, [key]: value })),
    [],
  );

  useEffect(() => {
    setItemsLocked(!header.storeId);
  }, [header.storeId]);

  // ==== مخزن العبوات بتاع العميل - بيتحدث تلقائيًا مع تغيير العميل ====
  const { data: partyContainerStoreData } = useGetPartyContainerStoreQuery(
    header.partyId,
    { skip: !header.partyId || !isSalesInvoice },
  );

  // الخزنة لازمة مع أي مبلغ مدفوع أكبر من صفر (نقدي أو آجل بدفعة جزئية)
  // ملاحظة: الـ API مبيقبلش نوع حركة نقدية - السيرفر بيختاره تلقائيًا حسب نوع الفاتورة
  const hasPayment = Number(header.paid) > 0;

  const { data: cashboxes } = useGetCashboxOptionsQuery(undefined, {
    skip: !hasPayment,
  });

  const handleCashboxChange = useCallback(
    (cashboxId) => {
      const cashbox = cashboxes?.find(
        (c) => String(c.id) === String(cashboxId),
      );
      setHeaderField("cashboxId", cashboxId);
      setHeaderField("cashboxName", cashbox?.name || "");
    },
    [cashboxes, setHeaderField],
  );

  // لما المدفوع يترجع صفر، صفّر الخزنة عشان متتبعتش من غير داعي
  useEffect(() => {
    if (!hasPayment && header.cashboxId) {
      setHeader((h) => ({
        ...h,
        cashboxId: "",
        cashboxName: "",
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
    if (
      !isSalesInvoice &&
      (containersMovement.items.length > 0 ||
        containersMovement.containerStoreId)
    ) {
      setContainersMovement({ containerStoreId: null, items: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSalesInvoice]);

  const handlePartyChange = useCallback(
    (id) => {
      const party = parties?.find((p) => p.id === id);
      setHeaderField("partyId", id);
      setHeaderField("partyName", party?.name || "");

      if (party?.currency) {
        setHeaderField("currency", party.currency);
      }
    },
    [parties, setHeaderField],
  );

  const handleCustomerCreated = useCallback(
    (newParty) => {
      setHeaderField("partyId", newParty.id);
      setHeaderField("partyName", newParty.name);

      if (newParty.currency) {
        setHeaderField("currency", newParty.currency);
      }
    },
    [setHeaderField],
  );

  const handleDriverChange = useCallback(
    (driverId) => {
      const driver = drivers?.find((d) => d.id === driverId);
      setHeaderField("driverId", driverId);
      setHeaderField("driverName", driver?.name || "");
    },
    [drivers, setHeaderField],
  );

  const handleDriverCreated = useCallback(
    (newDriver) => {
      setHeaderField("driverId", newDriver.id);
      setHeaderField("driverName", newDriver.name);
    },
    [setHeaderField],
  );

  const updateLine = useCallback(
    (index, newLine) =>
      setLines((prev) => prev.map((l, i) => (i === index ? newLine : l))),
    [],
  );
  const removeLine = useCallback(
    (index) => setLines((prev) => prev.filter((_, i) => i !== index)),
    [],
  );
  const addLine = useCallback(() => {
    if (itemsLocked) return;
    setLines((prev) => [...prev, emptyLine()]);
  }, [itemsLocked]);

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

  const unpricedCount = useMemo(
    () => lines.filter((l) => l.itemId && !(Number(l.price) > 0)).length,
    [lines],
  );

  const discount = parseFloat(header.discount) || 0;
  const paid = parseFloat(header.paid) || 0;

  const netTotal = Math.max(invoiceTotal - discount, 0);
  const remaining = Math.max(netTotal - paid, 0);

  // wbTotal بيتحسب في الباك تلقائيًا - هنا للعرض بس
  const wbTotal = useMemo(
    () =>
      (parseFloat(header.WBWeight) || 0) -
      (parseFloat(header.WBScaleDifference) || 0) -
      (parseFloat(header.WBDiscount) || 0),
    [header.WBWeight, header.WBScaleDifference, header.WBDiscount],
  );

  const handlePaymentMethodChange = useCallback(
    (method) => setHeaderField("paymentMethod", method),
    [setHeaderField],
  );

  const { printInvoice, printRef, invoiceToPrint } = useInvoicePrint();

  // ==== التحقق السريع قبل الحفظ - بيمنع إرسال فاتورة ناقصة ويوضح السبب للمستخدم ====
  const missingRequiredFields = useMemo(() => {
    const missing = [];
    if (!header.partyId) missing.push("العميل / المورد");
    if (!header.storeId) missing.push("المخزن");
    return missing;
  }, [header.partyId, header.storeId]);

  const isFormValid = missingRequiredFields.length === 0;

  const submitInvoice = useCallback(
    async (shouldPrint = false) => {
      if (!isFormValid || isLoading) {
        if (!isFormValid) {
          toast.error("في بيانات مطلوبة ناقصة", {
            description: missingRequiredFields.join("، "),
          });
          partySelectRef.current?.focus?.();
        }
        return;
      }

      const payload = buildCreateInvoiceRequest({
        movementType: header.movementType,
        header,
        lines,
        containersMovement,
        isTemporaryDriver,
      });

      try {
        const invoice = await createInvoice(payload).unwrap();

        toast.success("تم حفظ الفاتورة بنجاح", {
          description: `رقم الفاتورة: ${header.invoiceNumber}`,
        });

        onSuccess?.();

        if (shouldPrint) {
          printInvoice(invoice);
        }
      } catch {
        toast.error("تعذر حفظ الفاتورة، حاول مرة أخرى");
      }
    },
    [
      isFormValid,
      isLoading,
      missingRequiredFields,
      header,
      lines,
      containersMovement,
      isTemporaryDriver,
      createInvoice,
      onSuccess,
      printInvoice,
    ],
  );

  // ==== اختصارات الكيبورد: Ctrl/Cmd+S للحفظ، Ctrl/Cmd+Enter للحفظ والطباعة ====
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isModifier = e.ctrlKey || e.metaKey;
      if (!isModifier) return;

      if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        submitInvoice(false);
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        submitInvoice(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [submitInvoice]);

  const fmt = useCallback((v) => (v ?? 0).toLocaleString("ar-EG"), []);
  const currencySymbol = header.currency === "USD" ? "$" : "ج.م";
  const isForeignCurrency = header.currency && header.currency !== "EGP";
  const exchangeRateValue = parseFloat(header.exchangeRate) || 1;

  return (
    <div className="space-y-5 pb-2">
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
            hint={!isForeignCurrency ? "متاح فقط للعملات الأجنبية" : undefined}
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
            عميل / مورد <span className="mr-1 text-negative">*</span>
          </div>
          <CompactSelect
            ref={partySelectRef}
            label="عميل / مورد"
            options={
              parties?.map((p) => ({
                value: p.id,
                label: p.name,
              })) || []
            }
            value={header.partyId}
            onChange={handlePartyChange}
            placeholder="اختر العميل أو المورد"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowAddCustomer(true)}
            disabled={isLoading}
            className="px-3 text-primary-500 border-r border-ink-400/10 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-40"
            title="إضافة عميل/مورد جديد"
            aria-label="إضافة عميل أو مورد جديد"
          >
            <UserPlus size={17} />
          </button>
          <button
            type="button"
            onClick={() =>
              isSalesInvoice && header.partyName && setShowPackaging(true)
            }
            disabled={!isSalesInvoice || !header.partyName}
            className={`relative px-3 border-r border-ink-400/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
              !isSalesInvoice || !header.partyName
                ? "text-ink-400/40 pointer-events-none"
                : "text-primary-500 hover:bg-primary-50"
            }`}
            title={
              !isSalesInvoice
                ? "مخزن العبوات متاح لفواتير البيع فقط"
                : "مخزن العبوات"
            }
            aria-label="فتح مخزن العبوات"
          >
            {!isSalesInvoice ? <Lock size={17} /> : <Boxes size={17} />}
            {isSalesInvoice && containersMovement.items.length > 0 && (
              <Repeat2Icon
                className="absolute top-1 left-1 text-primary-600"
                size={12}
              />
            )}
          </button>
        </div>

        {!isSalesInvoice && (
          <div className="border-t border-ink-400/5 bg-ink-900/[0.02] px-3 py-2 text-xs text-ink-400">
            حركة العبوات متاحة بس مع فواتير البيع، ومش هتتبعت مع النوع الحالي.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="flex items-stretch">
            <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
              العملة
            </div>
            <div className="flex flex-1 items-center gap-2 overflow-hidden px-3 py-2.5 text-sm">
              <CurrencyChip
                currency={header.partyName ? header.currency : null}
              />
              {header.partyName ? (
                <span className="whitespace-nowrap text-xs text-ink-400">
                  (تلقائي حسب العميل)
                </span>
              ) : (
                <span className="whitespace-nowrap text-xs text-ink-400/50">
                  هتظهر بعد اختيار العميل
                </span>
              )}
            </div>
          </div>

          <div className="flex items-stretch">
            <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
              المخزن <span className="mr-1 text-negative">*</span>
            </div>
            <CompactSelect
              label="المخزن"
              options={
                stores?.map((s) => ({ value: s.id, label: s.name })) || []
              }
              value={header.storeId}
              onChange={(val) => setHeaderField("storeId", val)}
              placeholder="اختر المخزن"
              disabled={isLoading}
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
                className="flex-1 px-3 py-2 text-sm outline-none focus-visible:bg-ink-900/[0.02]"
                aria-label="اسم السائق الوقتي"
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
              className="px-3 text-primary-500 border-r border-ink-400/10 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              title="إضافة سائق جديد"
              aria-label="إضافة سائق جديد"
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
              className={`px-3 border-r border-ink-400/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
                isTemporaryDriver
                  ? "bg-primary-100 text-primary-600"
                  : "text-primary-500 hover:bg-primary-50"
              }`}
              title={isTemporaryDriver ? "إلغاء السائق الوقتي" : "سائق وقتي"}
              aria-pressed={isTemporaryDriver}
              aria-label="تبديل السائق الوقتي"
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
          <div className="grid grid-cols-1 gap-y-0 sm:grid-cols-2 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-stretch">
              <div className="w-36 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
                الخزنة <span className="mr-1 text-negative">*</span>
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
            <LedgerField
              label="سعر صرف الخزنة"
              type="number"
              value={header.cashboxExchangeRate}
              onChange={(e) =>
                setHeaderField("cashboxExchangeRate", e.target.value)
              }
            />
          </div>
        )}

        {/* ==== ملاحظات عامة ==== */}
        <div className="grid grid-cols-1">
          <LedgerField
            label="ملاحظات عامة"
            value={header.generalNotes}
            onChange={(e) => setHeaderField("generalNotes", e.target.value)}
          />
        </div>

        {/* ==== وزن البسكال ==== */}
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
              الإجمالي
            </div>
            <div className="flex flex-1 items-center gap-1.5 bg-ink-400/5 px-3 py-2.5 text-sm num text-ink-600">
              {wbTotal.toLocaleString("ar-EG")}
              <span className="text-[11px] text-ink-400">(يتحسب تلقائيًا)</span>
            </div>
          </div>
        </div>
      </LedgerPanel>

      {/* ============ القسم 4: الأصناف ============ */}
      <LedgerPanel
        title={
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="flex items-center gap-2 pr-3">
              <StoreIcon size={15} />
              الأصناف
            </span>
            {unpricedCount > 0 && (
              <span className="rounded-full bg-gold-50 px-2 py-0.5 text-xs font-medium text-gold-600">
                {unpricedCount} بدون سعر
              </span>
            )}
          </div>
        }
      >
        <div className="grid grid-cols-1 items-start gap-4">
          <div>
            {itemsLocked && (
              <div className="mb-3 rounded-2xl border border-dashed border-gold-200 bg-gold-50/40 py-6 text-center">
                <p className="text-sm text-gold-700">
                  اختر المخزن أولاً قبل إضافة الأصناف
                </p>
              </div>
            )}

            <div
              className={`overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity duration-150 ${
                itemsLocked ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <table className="w-full min-w-[950px] border-collapse text-right">
                <thead>
                  <tr className="bg-ink-900/[0.03] text-xs text-ink-400">
                    <th className="p-2.5 font-medium">#</th>
                    <th className="p-2.5 font-medium">الصنف</th>
                    <th className="p-2.5 font-medium">العدد بالمخزن</th>
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
                disabled={itemsLocked}
                className="flex w-full items-center justify-center gap-2 border-t border-ink-400/10 py-3 text-sm font-medium text-primary-500 transition-colors hover:bg-primary-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-400 disabled:cursor-not-allowed"
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
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="flex items-center gap-2 pr-3 text-sm font-semibold">
              <StoreIcon size={15} />
              ملخص الفاتورة
            </span>
          </div>
        }
      >
        <div className="space-y-3 lg:sticky lg:top-4">
          <div className="overflow-hidden rounded-xl border border-ink-400/10 bg-white">
            {/* عدد العبوات */}
            <div className="flex items-center justify-between border-b border-ink-400/10 px-3 py-2.5">
              <span className="text-sm text-ink-600">عدد العبوات</span>
              <span className="num text-sm font-semibold text-ink-900">
                {packagingBreakdown.length > 0
                  ? packagingBreakdown
                      .map((p) => `${fmt(p.count)} ${p.unitName}`)
                      .join("، ")
                  : "—"}
              </span>
            </div>

            {/* إجمالي الكمية */}
            <div className="flex items-center justify-between border-b border-ink-400/10 px-3 py-2.5">
              <span className="text-sm text-ink-600">إجمالي الكمية</span>
              <span className="num text-sm font-semibold text-ink-900">
                {fmt(totalQuantity)}
              </span>
            </div>

            {/* إجمالي الفاتورة */}
            <div className="flex items-center justify-between border-b border-ink-400/10 bg-primary-500/[0.03] px-3 py-2.5">
              <span className="text-sm font-semibold text-ink-900">
                إجمالي الفاتورة
              </span>
              <span className="num text-sm font-bold text-ink-900">
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
            <div className="flex items-center justify-between border-y border-ink-400/10 bg-ink-900/[0.02] px-3 py-2.5">
              <span className="text-sm font-semibold text-ink-900">الصافي</span>
              <span className="num text-sm font-bold text-ink-900">
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
            <div className="flex items-center justify-between bg-ink-900/[0.02] px-3 py-2.5">
              <span className="text-sm font-semibold text-ink-900">
                المتبقي
              </span>
              <span className="num text-sm font-bold text-ink-900">
                {fmt(remaining)} {currencySymbol}
              </span>
            </div>

            {/* المقابل بالجنيه المصري - يظهر فقط لو العملة أجنبية */}
            {isForeignCurrency && (
              <div className="flex items-center justify-between border-t border-ink-400/10 px-3 py-2 text-xs text-ink-400">
                <span>ما يقابل الصافي بالمصري</span>
                <span className="num">
                  {fmt(netTotal * exchangeRateValue)} ج.م
                </span>
              </div>
            )}
          </div>

          {!isFormValid && (
            <p className="text-xs text-negative">
              محتاج تحدد {missingRequiredFields.join("، ")} قبل الحفظ
            </p>
          )}
        </div>
      </LedgerPanel>

      {/* Buttons */}
      <div className="space-y-2">
        <Button
          onClick={() => submitInvoice(false)}
          disabled={isLoading || !isFormValid}
          title="حفظ (Ctrl+S)"
          className="h-10 w-full shadow-sm"
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
          disabled={isLoading || !isFormValid}
          title="حفظ وطباعة (Ctrl+Enter)"
          className="h-10 w-full"
        >
          <Printer size={16} />
          حفظ وطباعة
        </Button>

        <Button
          variant="ghost"
          type="button"
          onClick={onSuccess}
          disabled={isLoading}
          className="h-10 w-full"
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
