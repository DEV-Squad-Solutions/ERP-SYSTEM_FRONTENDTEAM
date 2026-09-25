import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

/**
 * Hook لطباعة قائمة قيود المرتبات (تقرير)
 */
export function usePayrollListPrint({ title = "تقرير المرتبات" } = {}) {
  const printRef = useRef(null);

  const printList = useReactToPrint({
    contentRef: printRef,
    documentTitle: title,
  });

  return { printList, printRef };
}
