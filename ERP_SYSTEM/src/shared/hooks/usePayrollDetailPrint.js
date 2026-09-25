import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

/**
 * Hook لطباعة إيصال مرتب موظف واحد
 */
export function usePayrollDetailPrint({ title = "إيصال-مرتب" } = {}) {
  const printRef = useRef(null);

  const print = useReactToPrint({
    contentRef: printRef,
    documentTitle: title,
  });

  return { print, printRef };
}
