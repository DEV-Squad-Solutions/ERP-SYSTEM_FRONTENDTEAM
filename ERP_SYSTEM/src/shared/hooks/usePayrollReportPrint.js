import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

/**
 * Hook لطباعة تقرير الأجور والمرتبات
 */
export function usePayrollReportPrint({
  title = "تقرير الأجور والمرتبات",
} = {}) {
  const printRef = useRef(null);

  const printReport = useReactToPrint({
    contentRef: printRef,
    documentTitle: title,
  });

  return {
    printReport,
    printRef,
  };
}
