import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

/**
 * Hook لطباعة قائمة فواتير (تقرير) - مختلف عن طباعة فاتورة واحدة
 */
export function useInvoiceListPrint({ title = "تقرير الفواتير" } = {}) {
  const printRef = useRef(null);

  const printList = useReactToPrint({
    contentRef: printRef,
    documentTitle: title,
  });

  return { printList, printRef };
}
