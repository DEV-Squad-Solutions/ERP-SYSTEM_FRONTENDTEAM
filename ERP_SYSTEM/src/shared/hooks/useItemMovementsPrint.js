import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

/**
 * هوك طباعة حركة الصنف — بنفس نمط useInvoiceListPrint
 * @param {{ title?: string }} options
 */
export function useItemMovementsPrint({ title = "حركة-صنف" } = {}) {
  const printRef = useRef(null);

  const printList = useReactToPrint({
    contentRef: printRef,
    documentTitle: title,
    pageStyle: `
      @page { size: A4; margin: 12mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `,
  });

  return { printList, printRef };
}
