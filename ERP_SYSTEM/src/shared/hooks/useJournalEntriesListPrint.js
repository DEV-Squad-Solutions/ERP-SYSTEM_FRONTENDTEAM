// src/features/journalEntries/hooks/useJournalEntriesListPrint.js

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

/**
 * Hook لطباعة قائمة قيود اليومية كتقرير
 */
export function useJournalEntriesListPrint({
  title = "تقرير قيود اليومية",
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
