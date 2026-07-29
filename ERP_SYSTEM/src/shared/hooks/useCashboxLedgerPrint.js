import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

export function useCashboxLedgerPrint({ title = "كشف حركة الخزنة" }) {
  const printRef = useRef(null);

  const printList = useReactToPrint({
    contentRef: printRef,

    documentTitle: title,

    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 12mm;
      }

      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          font-family: Cairo, Tajawal, sans-serif;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          border: 1px solid #ddd;
          padding: 6px;
        }

        tr {
          break-inside: avoid;
        }
      }
    `,
  });

  return {
    printList,
    printRef,
  };
}
