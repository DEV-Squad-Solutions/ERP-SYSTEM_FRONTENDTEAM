import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

/**
 * Hook لطباعة كشف حساب موظف
 */
export default function useEmployeeStatementPrint({
  title = "كشف حساب موظف",
} = {}) {
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
