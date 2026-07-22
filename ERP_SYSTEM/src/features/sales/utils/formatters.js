export const formatNumber = (n) =>
  new Intl.NumberFormat("ar-EG").format(Number(n) || 0);

export const paymentBadgeStyles = {
  "نقدي": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "بنكي": "bg-sky-50 text-sky-700 ring-sky-600/20",
  "آجل": "bg-amber-50 text-amber-800 ring-amber-600/20",
};

/**
 * يحسب إجماليات جدول الأصناف (يُستخدم في InvoiceSummaryCard)
 */
export const calculateInvoiceTotals = (items = []) =>
  items.reduce(
    (acc, it) => ({
      itemsCount: acc.itemsCount + 1,
      totalCount: acc.totalCount + Number(it.count || 0),
      totalQuantity: acc.totalQuantity + Number(it.quantity || 0),
      totalValue: acc.totalValue + Number(it.value || 0),
    }),
    { itemsCount: 0, totalCount: 0, totalQuantity: 0, totalValue: 0 }
  );
