import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

/**
 * Hook لطباعة تقرير لوحة الأجور والمرتبات
 */
export function usePayrollDashboardPrint({
  title = "تقرير الأجور والمرتبات",
} = {}) {
  const printRef = useRef(null);

  const printDashboard = useReactToPrint({
    contentRef: printRef,
    documentTitle: title,
  });

  return {
    printDashboard,
    printRef,
  };
}
