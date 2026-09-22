import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

export function useCashHandoverReportPrint({
  title = "تقرير تسليم العهدة",
} = {}) {
  const printRef = useRef(null);

  const printList = useReactToPrint({
    contentRef: printRef,
    documentTitle: title,
  });

  return {
    printList,
    printRef,
  };
}

export default useCashHandoverReportPrint;
