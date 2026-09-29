import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

/**
 * Hook لطباعة قائمة المركز المالي
 */
export function useFinancialPositionPrint({
  title = "قائمة المركز المالي",
} = {}) {
  const printRef = useRef(null);

  const printReport = useReactToPrint({
    contentRef: printRef,
    documentTitle: title,
  });

  return { printReport, printRef };
}
