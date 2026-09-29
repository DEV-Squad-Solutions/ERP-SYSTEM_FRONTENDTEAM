import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

/**
 * Hook لطباعة قائمة التدفقات النقدية
 */
export function useCashFlowPrint({ title = "قائمة التدفقات النقدية" } = {}) {
  const printRef = useRef(null);

  const printReport = useReactToPrint({
    contentRef: printRef,
    documentTitle: title,
  });

  return { printReport, printRef };
}
