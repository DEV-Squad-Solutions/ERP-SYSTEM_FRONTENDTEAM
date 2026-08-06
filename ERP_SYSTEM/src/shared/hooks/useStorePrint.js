import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

export function useStorePrint() {
  const printRef = useRef(null);
  const [storeToPrint, setStoreToPrint] = useState(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: storeToPrint
      ? `store-${storeToPrint.code || storeToPrint.id}`
      : "store",
  });

  const printStore = (store) => {
    setStoreToPrint(store);
    // تأخير بسيط عشان الـ DOM يتحدث بالبيانات الجديدة قبل ما نطبع
    setTimeout(() => handlePrint(), 0);
  };

  return { printStore, printRef, storeToPrint };
}
