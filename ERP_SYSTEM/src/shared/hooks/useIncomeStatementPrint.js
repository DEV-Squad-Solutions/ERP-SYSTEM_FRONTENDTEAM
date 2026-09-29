import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

/**
 * Hook لطباعة قائمة الدخل
 */
export function useIncomeStatementPrint({ title = "قائمة الدخل" } = {}) {
  const printRef = useRef(null);

  const printReport = useReactToPrint({
    contentRef: printRef,
    documentTitle: title,
  });

  return { printReport, printRef };
}
