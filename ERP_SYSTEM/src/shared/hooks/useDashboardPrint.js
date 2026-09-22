import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

export function useDashboardPrint({ title = "تقرير لوحة التحكم" } = {}) {
  const printRef = useRef(null);

  const printDashboard = useReactToPrint({
    contentRef: printRef,
    documentTitle: title,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 10mm;
      }

      @media print {
        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
        }

        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        table {
          page-break-inside: auto;
        }

        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }

        .print-break-inside-avoid {
          break-inside: avoid;
          page-break-inside: avoid;
        }
      }
    `,
  });

  return {
    printDashboard,
    printRef,
  };
}

export default useDashboardPrint;
