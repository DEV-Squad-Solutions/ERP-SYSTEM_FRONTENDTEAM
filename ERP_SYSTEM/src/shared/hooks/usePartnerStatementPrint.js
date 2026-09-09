import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

/**
 * Hook لطباعة كشف حساب عميل / مورد
 */
export function usePartnerStatementPrint({ title = "كشف حساب" } = {}) {
  const printRef = useRef(null);

  const printStatement = useReactToPrint({
    contentRef: printRef,
    documentTitle: title,
  });

  return {
    printStatement,
    printRef,
  };
}

export default usePartnerStatementPrint;
