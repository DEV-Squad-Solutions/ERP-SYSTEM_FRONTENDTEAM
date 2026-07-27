import { useState, useRef, useEffect, useCallback } from "react";
import { useReactToPrint } from "react-to-print";

/**
 * Hook موحّد لطباعة فاتورة واحدة من أي مكان (جدول أو صفحة تفاصيل)
 * بيرجع: printRef (يترّبط بالـ template المخفي)، invoiceToPrint (البيانات الحالية)، printInvoice (function تستدعيها بالفاتورة)
 */
export function useInvoicePrint() {
  const [invoiceToPrint, setInvoiceToPrint] = useState(null);
  const printRef = useRef(null);

  const reactToPrintFn = useReactToPrint({
    contentRef: printRef,
    documentTitle: invoiceToPrint
      ? `فاتورة-${invoiceToPrint.invoiceNumber}`
      : "فاتورة",
    onAfterPrint: () => setInvoiceToPrint(null),
  });

  // لازم نستنى الـ state يترندر جوه الـ template المخفي الأول قبل ما نطبع فعليًا
  useEffect(() => {
    if (invoiceToPrint) {
      reactToPrintFn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceToPrint]);

  const printInvoice = useCallback((invoice) => {
    setInvoiceToPrint(invoice);
  }, []);

  return { printInvoice, printRef, invoiceToPrint };
}
