import { useState, useCallback, memo } from "react";
import { Loader2, FileSearch, ChevronDown, ChevronUp } from "lucide-react";
import { useGetReturnSourcesQuery } from "../../../invoices/invoicesApi";
import LedgerPanel from "../../../../shared/components/ui/LedgerPanel";
import useDebouncedValue from "../../../../shared/hooks/useDebouncedValue";

const RETURN_TYPE_MAP = {
  salesReturn: "SalesReturn",
  purchaseReturn: "PurchaseReturn",
};

// دالة نقية برّا الكومبوننت - مفيش داعي نعيد إنشاءها كل render
function buildLineFromSource(invoice, sourceLine, quantity) {
  return {
    itemId: sourceLine.itemId,
    itemName: sourceLine.itemName,
    itemCode: sourceLine.itemCode,
    isTemporaryItem: false,
    itemUnitId: sourceLine.itemUnitId,
    itemUnitName: sourceLine.itemUnitName,
    count: null,
    weight: null,
    quantity,
    price: sourceLine.unitPrice,
    notes: "",
    sourceInvoiceLineId: sourceLine.sourceInvoiceLineId,
    sourceInvoiceId: invoice.invoiceId,
    sourceInvoiceNumber: invoice.invoiceNumber,
    isReturnLine: true,
    maxReturnQuantity: sourceLine.availableQuantity,
  };
}

function ReturnSourceInvoiceRow({
  invoice,
  isExpanded,
  isLockedByOtherInvoice,
  onToggleExpand,
  selectedQuantities,
  onQtyChange,
  onAddSelected,
  onFullReturn,
}) {
  const hasSelection = invoice.lines.some(
    (l) => Number(selectedQuantities[l.sourceInvoiceLineId]) > 0,
  );
  const fullReturnEligible = invoice.lines.every(
    (l) => l.availableQuantity === l.originalQuantity,
  );

  return (
    <div className={isLockedByOtherInvoice ? "opacity-40" : ""}>
      <button
        type="button"
        disabled={isLockedByOtherInvoice}
        onClick={() => onToggleExpand(invoice.invoiceId)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-right hover:bg-ink-900/[0.02] transition-colors disabled:cursor-not-allowed"
      >
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-sm font-medium text-ink-900">
            {invoice.invoiceNumber}
            {invoice.partnerInvoiceNo ? ` (${invoice.partnerInvoiceNo})` : ""}
          </span>
          <span className="text-xs text-ink-400">
            {invoice.invoiceDate} — {invoice.businessPartnerName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="num text-sm font-semibold text-ink-900">
            {invoice.originalTotal.toLocaleString("ar-EG")} {invoice.currency}
          </span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isLockedByOtherInvoice && (
        <div className="px-3 pb-2 text-xs text-ink-400">
          في أصناف مضافة بالفعل من فاتورة تانية — شيلها الأول عشان ترجع من هنا
        </div>
      )}

      {isExpanded && !isLockedByOtherInvoice && (
        <div className="bg-ink-900/[0.015] px-3 py-3">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={!fullReturnEligible}
              onClick={() => onFullReturn(invoice)}
              className="flex-1 rounded-lg border border-primary-200 bg-primary-50 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-40"
              title={
                fullReturnEligible
                  ? `هيتطبق خصم الفاتورة الأصلي (${invoice.originalDiscountAmount || 0})`
                  : "الفاتورة اتعمللها مرتجع جزئي قبل كده - مينفعش ترجعها بالكامل"
              }
            >
              إرجاع الفاتورة بالكامل
            </button>
            <span className="flex items-center justify-center px-2 text-xs text-ink-400">
              أو حدد أصناف بعينها تحت
            </span>
          </div>

          {!fullReturnEligible && (
            <p className="mb-2 text-xs text-gold-700">
              الفاتورة دي اتعمللها مرتجع جزئي قبل كده، فمينفعش ترجعها بالكامل
              والخصم مش هيتطبق
            </p>
          )}

          <div className="overflow-x-auto rounded-xl border border-ink-400/10 bg-white">
            <table className="w-full min-w-[600px] border-collapse text-right text-sm">
              <thead>
                <tr className="bg-ink-900/[0.03] text-xs text-ink-400">
                  <th className="p-2 font-medium">الصنف</th>
                  <th className="p-2 font-medium">الوحدة</th>
                  <th className="p-2 font-medium">الكمية الأصلية</th>
                  <th className="p-2 font-medium">مرتجع سابقًا</th>
                  <th className="p-2 font-medium">المتاح</th>
                  <th className="p-2 font-medium">السعر</th>
                  <th className="p-2 font-medium">كمية المرتجع</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((l) => {
                  const disabled = l.availableQuantity <= 0;
                  return (
                    <tr
                      key={l.sourceInvoiceLineId}
                      className={`border-t border-ink-400/5 ${disabled ? "opacity-40" : ""}`}
                    >
                      <td className="p-2">{l.itemName}</td>
                      <td className="p-2">{l.itemUnitName}</td>
                      <td className="p-2 num">{l.originalQuantity}</td>
                      <td className="p-2 num">{l.returnedQuantity}</td>
                      <td className="p-2 num font-semibold">
                        {l.availableQuantity}
                      </td>
                      <td className="p-2 num">{l.unitPrice}</td>
                      <td className="p-2 w-28">
                        <input
                          type="number"
                          min={0}
                          max={l.availableQuantity}
                          disabled={disabled}
                          value={
                            selectedQuantities[l.sourceInvoiceLineId] ?? ""
                          }
                          onChange={(e) => onQtyChange(l, e.target.value)}
                          className="w-full rounded-lg border border-ink-400/15 px-2 py-1.5 text-sm num text-center outline-none focus:border-primary-500 disabled:bg-ink-400/5"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            disabled={!hasSelection}
            onClick={() => onAddSelected(invoice)}
            className="mt-2 w-full rounded-lg bg-primary-500 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            إضافة الأصناف المحددة (من غير خصم)
          </button>
        </div>
      )}
    </div>
  );
}

const MemoReturnSourceInvoiceRow = memo(ReturnSourceInvoiceRow);

function ReturnSourcePicker({
  movementType,
  partyId,
  storeId,
  asOfDate,
  currentReturnInvoiceId,
  activeSourceInvoiceId,
  onAddLines,
}) {
  const [searchInput, setSearchInput] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [selectedQuantities, setSelectedQuantities] = useState({});

  // دباونس عشان مبعتش طلب API مع كل حرف
  const debouncedSearch = useDebouncedValue(searchInput, 350);

  const returnType = RETURN_TYPE_MAP[movementType];
  const canQuery = Boolean(partyId && storeId && asOfDate && returnType);

  const { data, isLoading, isFetching, isError } = useGetReturnSourcesQuery(
    {
      businessPartnerId: partyId,
      storeId,
      returnType,
      asOfDate,
      search: debouncedSearch || undefined,
      currentReturnInvoiceId,
      pageNumber: 1,
      pageSize: 20,
    },
    { skip: !canQuery },
  );

  const invoices = data?.items || [];

  const handleToggleExpand = useCallback((invoiceId) => {
    setExpandedId((prev) => (prev === invoiceId ? null : invoiceId));
  }, []);

  const handleQtyChange = useCallback((line, value) => {
    const max = line.availableQuantity;
    let qty = value === "" ? "" : Number(value);
    if (qty !== "" && qty > max) qty = max;
    setSelectedQuantities((prev) => ({
      ...prev,
      [line.sourceInvoiceLineId]: qty,
    }));
  }, []);

  const handleAddSelected = useCallback(
    (invoice) => {
      const linesToAdd = invoice.lines
        .filter((l) => Number(selectedQuantities[l.sourceInvoiceLineId]) > 0)
        .map((l) =>
          buildLineFromSource(
            invoice,
            l,
            Number(selectedQuantities[l.sourceInvoiceLineId]),
          ),
        );

      if (!linesToAdd.length) return;

      onAddLines(linesToAdd, {
        isFullReturn: false,
        sourceInvoiceId: invoice.invoiceId,
        discountAmount: 0,
      });
      setSelectedQuantities({});
    },
    [selectedQuantities, onAddLines],
  );

  const handleFullReturn = useCallback(
    (invoice) => {
      const linesToAdd = invoice.lines
        .filter((l) => l.originalQuantity > 0)
        .map((l) => buildLineFromSource(invoice, l, l.originalQuantity));

      onAddLines(linesToAdd, {
        isFullReturn: true,
        sourceInvoiceId: invoice.invoiceId,
        discountAmount: invoice.originalDiscountAmount || 0,
      });
      setSelectedQuantities({});
    },
    [onAddLines],
  );

  if (!canQuery) {
    return (
      <div className="rounded-2xl border border-dashed border-gold-200 bg-gold-50/40 py-6 text-center text-sm text-gold-700">
        اختر العميل/المورد والمخزن والتاريخ الأول عشان تظهر الفواتير الأصلية
      </div>
    );
  }

  return (
    <LedgerPanel
      title={
        <span className="flex items-center gap-2 pr-3">
          <FileSearch size={15} />
          الفواتير الأصلية للمرتجع
        </span>
      }
    >
      <div className="p-3">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="ابحث برقم الفاتورة..."
          className="w-full rounded-lg border border-ink-400/15 px-3 py-2 text-sm outline-none focus:border-primary-500"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-ink-400">
          <Loader2 size={16} className="animate-spin" />
          جاري التحميل...
        </div>
      )}

      {isError && (
        <div className="py-6 text-center text-sm text-negative">
          حصل خطأ في تحميل الفواتير
        </div>
      )}

      {!isLoading && !isError && invoices.length === 0 && (
        <div className="py-6 text-center text-sm text-ink-400">
          مفيش فواتير عندها كمية متاحة للمرتجع
        </div>
      )}

      {/* isFetching (مش isLoading) بيفضل يعرض النتايج القديمة وقت إعادة الجلب - مفيش وميض */}
      <div
        className={`divide-y divide-ink-400/5 ${isFetching && !isLoading ? "opacity-70" : ""}`}
      >
        {invoices.map((inv) => (
          <MemoReturnSourceInvoiceRow
            key={inv.invoiceId}
            invoice={inv}
            isExpanded={expandedId === inv.invoiceId}
            isLockedByOtherInvoice={
              Boolean(activeSourceInvoiceId) &&
              activeSourceInvoiceId !== inv.invoiceId
            }
            selectedQuantities={selectedQuantities}
            onToggleExpand={handleToggleExpand}
            onQtyChange={handleQtyChange}
            onAddSelected={handleAddSelected}
            onFullReturn={handleFullReturn}
          />
        ))}
      </div>
    </LedgerPanel>
  );
}

export default memo(ReturnSourcePicker);
