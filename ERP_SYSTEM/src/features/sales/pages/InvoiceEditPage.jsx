import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Save, ArrowRight, Plus, AlertCircle } from "lucide-react";

import {
  useGetInvoiceByIdQuery,
  useUpdateInvoiceMutation,
} from "../../invoices/invoicesApi";

import { buildInvoiceUpdateBody } from "../../invoices/components/buildInvoicePayload";

import {
  useGetPartiesSelectQuery,
  useGetPartyContainerStoreQuery,
} from "../../partners/partiesApi";

import { useGetStoresSelectQuery } from "../../stores/storesApi";
import { useGetDriversSelectQuery } from "../../drivers/driversApi";
import { useGetCountriesSelectQuery } from "../../countries/countriesApi";
import { useGetCashboxOptionsQuery } from "../../cashboxes/cashboxesApi";
import { useGetCashMovementTypeOptionsQuery } from "../../cashboxes/cashMovementTypesApi";

import { useGetItemsCategoriesSelectQuery } from "../../itemsCategories/itemsCategoriesApi";

// مهم:
// جلب الأصناف لأن السطر ممكن يكون صنف موجود أو صنف يدوي
import { useGetItemsSelectQuery } from "../../inventory/inventoryApi";

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

const invoiceContentTypeOptions = [
  { value: "Items", label: "أصناف" },
  { value: "Containers", label: "عبوات" },
];

const paymentStatusLabels = {
  Unpaid: "غير مدفوعة",
  PartiallyPaid: "مدفوعة جزئيًا",
  Paid: "مدفوعة بالكامل",
};

const currencyLabels = {
  EGP: "جنيه مصري",
  USD: "دولار أمريكي",
  EUR: "يورو",
  GBP: "جنيه إسترليني",
  SAR: "ريال سعودي",
  AED: "درهم إماراتي",
  KWD: "دينار كويتي",
};

const emptyLine = () => ({
  id: null,
  sourceInvoiceLineId: null,

  itemId: null,
  itemName: "",
  itemCode: "",

  // true معناها السطر يدوي وليس مربوطًا بصنف من المخزون
  isTemporaryItem: true,

  itemUnitId: null,
  itemUnitName: "",

  count: 0,
  weight: 0,
  quantity: 0,
  price: 0,

  notes: "",

  returnUnitCost: null,
});

const emptyContainerLine = () => ({
  id: null,
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

  const { data: itemsCategories, isLoading: isLoadingCategories } =
    useGetItemsCategoriesSelectQuery();

  // =========================================================
  // الأصناف
  // =========================================================

  const {
    data: itemsResponse,
    isLoading: isLoadingItems,
    isFetching: isFetchingItems,
    isError: isItemsError,
  } = useGetItemsSelectQuery();

  /**
   * الـ API ممكن يرجع:
   *
   * [
   *   { id, name, code }
   * ]
   *
   * أو:
   *
   * {
   *   items: [...]
   * }
   *
   * لذلك بنوحّد الشكل هنا.
   */
  const items = useMemo(() => {
    if (Array.isArray(itemsResponse)) {
      return itemsResponse;
    }

    if (Array.isArray(itemsResponse?.items)) {
      return itemsResponse.items;
    }

    if (Array.isArray(itemsResponse?.data)) {
      return itemsResponse.data;
    }

    return [];
  }, [itemsResponse]);

  const itemOptions = useMemo(() => {
    return items.map((item) => ({
      value: item.id,
      label: item.code ? `${item.name} - ${item.code}` : item.name,
    }));
  }, [items]);

  const [form, setForm] = useState(null);

  const [lines, setLines] = useState([]);

  const [containerLines, setContainerLines] = useState([]);

  const [rowVersion, setRowVersion] = useState(null);

  const [containerStoreName, setContainerStoreName] = useState("");

  const prevPartyIdRef = useRef(null);

  const hasPayment = Number(form?.paidAmount) > 0;

  // =========================================================
  // الخزائن
  // =========================================================

  const { data: cashboxes } = useGetCashboxOptionsQuery(undefined, {
    skip: !hasPayment,
  });

  const { data: cashMovementTypeOptions } = useGetCashMovementTypeOptionsQuery(
    undefined,
    {
      skip: !hasPayment,
    },
  );

  // =========================================================
  // مخزن العبوات الخاص بالعميل
  // =========================================================

  const {
    data: partyContainerStoreData,
    isFetching: isLoadingPartyContainerStore,
  } = useGetPartyContainerStoreQuery(form?.businessPartnerId, {
    skip: !form?.businessPartnerId,
  });

  // =========================================================
  // تعبئة الفورم من الفاتورة
  // =========================================================

  useEffect(() => {
    if (!invoice) return;

    setForm({
      invoiceType: invoice.invoiceType,

      paymentTerm: invoice.paymentTerm,

      contentType: invoice.contentType,

      invoiceDate: invoice.invoiceDate,

      dueDate: invoice.dueDate,

      businessPartnerId: invoice.businessPartnerId,

      storeId: invoice.storeId,

      containerStoreId: invoice.containerStoreId,

      countryId: invoice.countryId,

      driverId: invoice.driverId,

      actualDriverName: invoice.actualDriverName || "",

      vehicleNumber: invoice.vehicleNumber || "",

      exportInvoiceCode: invoice.exportInvoiceCode || "",

      partnerInvoiceNo: invoice.partnerInvoiceNo || "",

      itemsCategoryId: invoice.itemsCategoryId || "",

      exchangeRate: invoice.exchangeRate ?? "",

      discountAmount: invoice.discountAmount ?? 0,

      paidAmount: invoice.paidAmount ?? 0,

      cashboxId: invoice.cashboxId ?? "",

      cashboxName: invoice.cashboxName || "",

      cashMovementTypeId: invoice.cashMovementTypeId ?? "",

      cashMovementTypeName: invoice.cashMovementTypeName || "",

      cashboxExchangeRate: invoice.cashboxExchangeRate ?? "",

      notes: invoice.notes || "",

      wbWeight: invoice.wbWeight ?? "",

      wbScaleDifference: invoice.wbScaleDifference ?? "",

      wbDiscount: invoice.wbDiscount ?? "",
    });

    // =======================================================
    // مهم جدًا:
    //
    // itemId ممكن يكون null
    //
    // لو itemId موجود => صنف من المخزون
    //
    // لو itemId null => صنف يدوي
    // =======================================================

    setLines(
      invoice.lines?.length
        ? invoice.lines.map((l) => ({
            id: l.id,

            sourceInvoiceLineId: l.sourceInvoiceLineId ?? null,

            itemId: l.itemId ?? null,

            itemName: l.itemName || "",

            itemCode: l.itemCode || "",

            // أهم تعديل:
            // الصنف اليدوي يتحدد من عدم وجود itemId
            isTemporaryItem: l.itemId == null,

            itemUnitId: l.itemUnitId ?? null,

            itemUnitName: l.itemUnitName || "",

            count: l.count ?? 0,

            weight: l.weight ?? 0,

            quantity: l.quantity ?? 0,

            price: l.price ?? 0,

            notes: l.notes || "",

            returnUnitCost: l.returnUnitCost ?? null,
          }))
        : Array.from({ length: 10 }, () => emptyLine()),
    );

    setContainerLines(
      invoice.containerLines?.length
        ? invoice.containerLines.map((c) => ({
            id: c.id,

            containerId: c.containerId ?? null,

            containerName: c.containerName || "",

            outgoingUnits: c.outgoingUnits ?? 0,

            incomingUnits: c.incomingUnits ?? 0,
          }))
        : [],
    );

    setContainerStoreName(invoice.containerStoreName || "");

    setRowVersion(invoice.rowVersion);

    prevPartyIdRef.current = invoice.businessPartnerId;
  }, [invoice]);

  // =========================================================
  // تغيير العميل
  // =========================================================

  useEffect(() => {
    if (!form) return;

    if (form.businessPartnerId === prevPartyIdRef.current) {
      return;
    }

    if (!partyContainerStoreData) {
      return;
    }

    prevPartyIdRef.current = form.businessPartnerId;

    const store = partyContainerStoreData.containerStore;

    if (store?.id) {
      setForm((prev) => ({
        ...prev,
        containerStoreId: store.id,
      }));

      setContainerStoreName(store.name || "");

      toast.info(`تم تحديد مخزن العبوات تلقائيًا: ${store.name || "—"}`);
    } else {
      setForm((prev) => ({
        ...prev,
        containerStoreId: null,
      }));

      setContainerStoreName("");

      toast.warning("العميل ده مالوش مخزن عبوات مرتبط");
    }
  }, [partyContainerStoreData, form?.businessPartnerId]);

  // =========================================================
  // لو المدفوع رجع صفر
  // =========================================================

  useEffect(() => {
    if (!form) return;

    if (!hasPayment && (form.cashboxId || form.cashMovementTypeId)) {
      setForm((prev) => ({
        ...prev,

        cashboxId: "",
        cashboxName: "",

        cashMovementTypeId: "",
        cashMovementTypeName: "",

        cashboxExchangeRate: "",
      }));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPayment]);

  // =========================================================
  // Helpers
  // =========================================================

  const setField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCashboxChange = (cashboxId) => {
    const cashbox = cashboxes?.find((c) => String(c.id) === String(cashboxId));

    setField("cashboxId", cashboxId);

    setField("cashboxName", cashbox?.name || "");
  };

  const handleCashMovementTypeChange = (typeId) => {
    const type = cashMovementTypeOptions?.find(
      (t) => String(t.id) === String(typeId),
    );

    setField("cashMovementTypeId", typeId);

    setField("cashMovementTypeName", type?.name || "");
  };

  // =========================================================
  // Invoice Lines
  // =========================================================

  const updateLine = (index, updatedLine) => {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? updatedLine : line)),
    );
  };

  const addLine = () => {
    setLines((prev) => [...prev, emptyLine()]);
  };

  const removeLine = (index) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  // =========================================================
  // Container Lines
  // =========================================================

  const updateContainerLine = (index, updated) => {
    setContainerLines((prev) =>
      prev.map((line, i) => (i === index ? updated : line)),
    );
  };

  const addContainerLine = () => {
    setContainerLines((prev) => [...prev, emptyContainerLine()]);
  };

  const removeContainerLine = (index) => {
    setContainerLines((prev) => prev.filter((_, i) => i !== index));
  };

  // =========================================================
  // حسابات العرض فقط
  // =========================================================

  const displaySubtotal = useMemo(
    () =>
      lines.reduce(
        (sum, line) =>
          sum + (Number(line.quantity) || 0) * (Number(line.price) || 0),
        0,
      ),
    [lines],
  );

  const displayTotal = Math.max(
    displaySubtotal - (Number(form?.discountAmount) || 0),
    0,
  );

  const displayRemaining = Math.max(
    displayTotal - (Number(form?.paidAmount) || 0),
    0,
  );

  const displayWbTotal =
    (parseFloat(form?.wbWeight) || 0) -
    (parseFloat(form?.wbScaleDifference) || 0) -
    (parseFloat(form?.wbDiscount) || 0);

  const isReturnInvoice =
    form?.invoiceType === "SalesReturn" ||
    form?.invoiceType === "PurchaseReturn";

  // =========================================================
  // حفظ التعديل
  // =========================================================

  const handleSubmit = async () => {
    if (!form) return;

    // =====================================================
    // مهم:
    //
    // ممنوع نمنع itemId === null
    //
    // لأن الـ API بالفعل يسمح بسطر يدوي:
    //
    // itemId: null
    // itemName: "lohvhfg"
    //
    // وبالتالي التحقق يكون على البيانات الأساسية فقط.
    // =====================================================

    const hasInvalidLine = lines.some((line) => {
      const hasAnyData =
        line.itemId ||
        String(line.itemName || "").trim() ||
        Number(line.count) > 0 ||
        Number(line.weight) > 0 ||
        Number(line.quantity) > 0;

      if (!hasAnyData) {
        return false;
      }

      return Number(line.count) <= 0 || Number(line.weight) <= 0;
    });

    if (hasInvalidLine) {
      toast.error("كل سطر مستخدم لازم يكون له عدد ووزن أكبر من صفر");

      return;
    }

    // =====================================================
    // الفاتورة النقدية
    // =====================================================

    if (
      form.paymentTerm === "Cash" &&
      Number(form.paidAmount) !== displayTotal
    ) {
      toast.error(
        "الفاتورة النقدية لازم يكون المدفوع = إجمالي الفاتورة بالظبط",
      );

      return;
    }

    // =====================================================
    // المدفوع يحتاج خزنة ونوع حركة
    // =====================================================

    if (
      Number(form.paidAmount) > 0 &&
      (!form.cashboxId || !form.cashMovementTypeId)
    ) {
      toast.error("اختر الخزنة ونوع الحركة أولاً لإن فيه مبلغ مدفوع");

      return;
    }

    // =====================================================
    // rowVersion
    // =====================================================

    if (!rowVersion) {
      toast.error("رقم إصدار الفاتورة مفقود، أعد تحميل الفاتورة");

      return;
    }

    try {
      const body = buildInvoiceUpdateBody({
        form,
        lines,
        containerLines,
        rowVersion,
      });

      await updateInvoice({
        id,
        ...body,
      }).unwrap();

      toast.success("تم حفظ التعديلات بنجاح");

      navigate(`/dashboard/sales/${id}`);
    } catch (err) {
      if (err?.status === 409) {
        toast.error("الفاتورة اتعدلت من حد تاني، لازم تحمّل النسخة الأحدث", {
          duration: 6000,
        });

        refetch();
      } else {
        toast.error(
          err?.data?.message || err?.message || "حصل خطأ أثناء حفظ التعديلات",
        );
      }
    }
  };

  // =========================================================
  // Loading
  // =========================================================

  if (isLoading || !form) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-48 rounded bg-ink-400/10 animate-pulse" />

        <div className="h-40 rounded-2xl bg-ink-400/5 animate-pulse" />

        <div className="h-64 rounded-2xl bg-ink-400/5 animate-pulse" />
      </div>
    );
  }

  // =========================================================
  // Error
  // =========================================================

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

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="animate-fadeUp pb-24" dir="rtl">
      {/* =====================================================
          Header
      ====================================================== */}

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-ink-400 hover:bg-ink-400/5"
          >
            <ArrowRight size={18} />
          </button>

          <div>
            <h2 className="font-display text-2xl font-bold text-ink-900">
              تعديل الفاتورة #{invoice.invoiceNumber}
            </h2>

            {invoice.paymentStatus && (
              <span className="inline-flex items-center text-[11px] font-medium text-ink-400 bg-ink-400/10 rounded-full px-2 py-0.5 mt-1">
                {paymentStatusLabels[invoice.paymentStatus] ||
                  invoice.paymentStatus}
                {" · "}
                متبقي:{" "}
                {Number(invoice.remainingAmount || 0).toLocaleString(
                  "ar-EG",
                )}{" "}
                {invoice.currency}
              </span>
            )}
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={isSaving}>
          <Save size={16} />

          {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
        </Button>
      </div>

      {/* =====================================================
          بيانات الفاتورة الأساسية
      ====================================================== */}

      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* نوع الفاتورة */}
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

          {/* طريقة الدفع */}
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

          {/* تاريخ الفاتورة */}
          <Input
            type="date"
            label="تاريخ الفاتورة"
            value={form.invoiceDate}
            onChange={(e) => setField("invoiceDate", e.target.value)}
          />

          {/* تاريخ الاستحقاق */}
          <Input
            type="date"
            label="تاريخ الاستحقاق"
            value={form.dueDate}
            onChange={(e) => setField("dueDate", e.target.value)}
          />

          {/* العميل / المورد */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              العميل / المورد
            </label>

            <CompactSelect
              options={
                parties?.map((p) => ({
                  value: p.id,
                  label: p.name,
                })) || []
              }
              value={form.businessPartnerId}
              onChange={(v) => setField("businessPartnerId", v)}
              isLoading={isLoadingParties}
            />
          </div>

          {/* المخزن */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              المخزن
            </label>

            <CompactSelect
              options={
                stores?.map((s) => ({
                  value: s.id,
                  label: s.name,
                })) || []
              }
              value={form.storeId}
              onChange={(v) => setField("storeId", v)}
              isLoading={isLoadingStores}
            />
          </div>

          {/* مخزن العبوات */}
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

          {/* البلد */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              البلد
            </label>

            <CompactSelect
              options={
                countries?.map((c) => ({
                  value: c.id,
                  label: c.name,
                })) || []
              }
              value={form.countryId}
              onChange={(v) => setField("countryId", v)}
              isLoading={isLoadingCountries}
            />
          </div>

          {/* السائق الأساسي */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              السائق
            </label>

            <CompactSelect
              options={
                drivers?.map((d) => ({
                  value: d.id,
                  label: d.name,
                })) || []
              }
              value={form.driverId}
              onChange={(v) => setField("driverId", v)}
              isLoading={isLoadingDrivers}
            />
          </div>

          {/* السائق الفعلي */}
          <Input
            label="السائق الفعلي"
            value={form.actualDriverName}
            onChange={(e) => setField("actualDriverName", e.target.value)}
            placeholder="اسم السائق الفعلي"
          />

          {/* رقم السيارة */}
          <Input
            label="رقم السيارة"
            value={form.vehicleNumber}
            onChange={(e) => setField("vehicleNumber", e.target.value)}
          />

          {/* كود فاتورة التصدير */}
          <Input
            label="كود فاتورة التصدير"
            value={form.exportInvoiceCode}
            onChange={(e) => setField("exportInvoiceCode", e.target.value)}
          />

          {/* رقم فاتورة الشريك */}
          <Input
            label="رقم فاتورة الشريك"
            value={form.partnerInvoiceNo}
            onChange={(e) => setField("partnerInvoiceNo", e.target.value)}
          />

          {/* تصنيف الأصناف */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              تصنيف الأصناف
            </label>

            <CompactSelect
              options={
                itemsCategories?.map((c) => ({
                  value: c.id,
                  label: c.name,
                })) || []
              }
              value={form.itemsCategoryId}
              onChange={(v) => setField("itemsCategoryId", v)}
              isLoading={isLoadingCategories}
              placeholder="اختياري"
            />
          </div>

          {/* محتوى الفاتورة */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              محتوى الفاتورة
            </label>

            <CompactSelect
              options={invoiceContentTypeOptions}
              value={form.contentType}
              onChange={(v) => setField("contentType", v)}
            />
          </div>

          {/* سعر الصرف */}
          <Input
            type="number"
            label="سعر الصرف"
            value={form.exchangeRate}
            onChange={(e) => setField("exchangeRate", e.target.value)}
          />

          {/* العملة */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              العملة
            </label>

            <div className="w-full rounded-lg border border-ink-400/10 px-3 py-2 text-sm bg-ink-400/5 text-ink-700 min-h-[38px] flex items-center">
              {currencyLabels[invoice.currency] || invoice.currency}
            </div>
          </div>
        </div>

        {/* الدفع */}
        {hasPayment && (
          <div className="mt-4 pt-4 border-t border-ink-400/10 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* الخزنة */}
            <div>
              <label className="block mb-1.5 text-sm font-medium text-ink-900">
                الخزنة <span className="text-negative">*</span>
              </label>

              <CompactSelect
                options={
                  cashboxes?.map((c) => ({
                    value: c.id,
                    label: `${c.name} (${
                      currencyLabels[c.currency] || c.currency
                    })`,
                  })) || []
                }
                value={form.cashboxId}
                onChange={handleCashboxChange}
                placeholder="اختر الخزنة"
              />
            </div>

            {/* نوع الحركة */}
            <div>
              <label className="block mb-1.5 text-sm font-medium text-ink-900">
                نوع الحركة <span className="text-negative">*</span>
              </label>

              <CompactSelect
                options={
                  cashMovementTypeOptions?.map((t) => ({
                    value: t.id,
                    label: t.name,
                  })) || []
                }
                value={form.cashMovementTypeId}
                onChange={handleCashMovementTypeChange}
                placeholder="اختر نوع الحركة"
              />
            </div>

            {/* سعر صرف الخزنة */}
            <Input
              type="number"
              label="سعر صرف الخزنة"
              value={form.cashboxExchangeRate}
              onChange={(e) => setField("cashboxExchangeRate", e.target.value)}
            />
          </div>
        )}

        {/* الملاحظات */}
        <div className="mt-3">
          <Input
            label="ملاحظات عامة"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
          />
        </div>

        {/* وزن البسكال */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input
            type="number"
            label="وزن البسكال"
            value={form.wbWeight}
            onChange={(e) => setField("wbWeight", e.target.value)}
          />

          <Input
            type="number"
            label="فرق الميزان"
            value={form.wbScaleDifference}
            onChange={(e) => setField("wbScaleDifference", e.target.value)}
          />

          <Input
            type="number"
            label="الخصم"
            value={form.wbDiscount}
            onChange={(e) => setField("wbDiscount", e.target.value)}
          />

          <div>
            <label className="block mb-1.5 text-sm font-medium text-ink-900">
              الإجمالي
            </label>

            <div className="w-full rounded-lg border border-ink-400/10 px-3 py-2 text-sm num bg-ink-400/5 text-ink-700 min-h-[38px] flex items-center">
              {displayWbTotal.toLocaleString("ar-EG")}
            </div>

            <p className="text-[11px] text-ink-400 mt-1">بيتحسب تلقائيًا</p>
          </div>
        </div>
      </div>

      {/* =====================================================
          أصناف الفاتورة
      ====================================================== */}

      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display font-bold text-ink-900">الأصناف</h3>

            <p className="text-[11px] text-ink-400 mt-1">
              يمكن أن يكون السطر مرتبطًا بصنف من المخزون أو صنفًا يدويًا غير
              موجود بالمخزون.
            </p>
          </div>

          <Button variant="outline" onClick={addLine}>
            <Plus size={15} />
            إضافة صنف
          </Button>
        </div>

        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-right border-collapse min-w-[1050px]">
            <thead>
              <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
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
                  key={line.sourceInvoiceLineId ?? line.id ?? index}

                  index={index}

                  line={line}

                  storeId={form.storeId}

                  invoiceDate={form.invoiceDate}

                  // =================================================
                  // دول مهمين جدًا
                  // =================================================

                  items={items}

                  itemOptions={itemOptions}

                  isLoadingItems={isLoadingItems || isFetchingItems}

                  isItemsError={isItemsError}

                  onChange={(newLine) => updateLine(index, newLine)}

                  onRemove={() => removeLine(index)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {isReturnInvoice && (
          <p className="text-xs text-gold-600 bg-gold-50 rounded-lg px-3 py-2 mt-3">
            فاتورة مرتجع — كل سطر محتاج يتربط بسطر الفاتورة الأصلي لو كان
            مرتجعًا من فاتورة سابقة.
          </p>
        )}
      </div>

      {/* =====================================================
          العبوات
      ====================================================== */}

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

                  <th className="p-2.5"></th>
                </tr>
              </thead>

              <tbody>
                {containerLines.map((line, index) => (
                  <ContainerLineRow
                    key={line.id ?? index}

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

      {/* =====================================================
          الملخص المالي
      ====================================================== */}

      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4">
        <h3 className="font-display font-bold text-ink-900 mb-3">
          الملخص المالي
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* الخصم */}
          <Input
            type="number"
            label="الخصم"
            value={form.discountAmount}
            onChange={(e) =>
              setField("discountAmount", Number(e.target.value) || 0)
            }
          />

          {/* المدفوع */}
          <Input
            type="number"
            label="المدفوع"
            value={form.paidAmount}
            onChange={(e) =>
              setField("paidAmount", Number(e.target.value) || 0)
            }
          />

          {/* الإجمالي */}
          <div>
            <p className="text-xs text-ink-400 mb-1">الإجمالي (تقديري)</p>

            <p className="num font-bold text-ink-900">
              {displayTotal.toLocaleString("ar-EG")} {invoice.currency}
            </p>
          </div>

          {/* المتبقي */}
          <div>
            <p className="text-xs text-ink-400 mb-1">المتبقي (تقديري)</p>

            <p
              className={`num font-bold ${
                displayRemaining > 0 ? "text-negative" : "text-positive"
              }`}
            >
              {displayRemaining.toLocaleString("ar-EG")} {invoice.currency}
            </p>
          </div>
        </div>

        <p className="text-[11px] text-ink-400 mt-2">
          القيم دي تقديرية للعرض بس — القيم الفعلية زي المخزون والتكاليف بيحسبها
          السيرفر بعد الحفظ.
        </p>
      </div>
    </div>
  );
}
