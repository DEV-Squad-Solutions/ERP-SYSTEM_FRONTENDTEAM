import * as XLSX from "xlsx";

const typeLabels = {
  Sales: "بيع",
  Purchase: "شراء",
  SalesReturn: "مرتجع بيع",
  PurchaseReturn: "مرتجع شراء",
};

const paymentLabels = {
  Cash: "نقدي",
  Credit: "آجل",
};

/**
 * تصدير قائمة فواتير لملف Excel
 * @param {Array} invoices
 * @param {string} fileName
 */
export function exportInvoicesToExcel(invoices, fileName = "فواتير") {
  if (!invoices?.length) return;

  const rows = invoices.map((inv, i) => ({
    "#": i + 1,
    "رقم الفاتورة": inv.invoiceNumber,
    التاريخ: inv.invoiceDate,
    النوع: typeLabels[inv.invoiceType] || inv.invoiceType,
    العميل: inv.businessPartnerName || "—",
    المخزن: inv.storeName || "—",
    الدفع: paymentLabels[inv.paymentTerm] || "—",
    "الإجمالي الفرعي": Number(inv.subtotal || 0),
    الخصم: Number(inv.discountAmount || 0),
    الإجمالي: Number(inv.total || 0),
    المدفوع: Number(inv.paidAmount || 0),
    المتبقي: Number(inv.remainingAmount || 0),
    "حالة الدفع": inv.paymentStatus === "Unpaid" ? "غير مدفوعة" : "مدفوعة",
    العملة: inv.currency || "EGP",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // عرض أعمدة مناسب بدل ما تبقى ضيقة
  worksheet["!cols"] = [
    { wch: 5 }, // #
    { wch: 14 }, // رقم الفاتورة
    { wch: 12 }, // التاريخ
    { wch: 10 }, // النوع
    { wch: 22 }, // العميل
    { wch: 16 }, // المخزن
    { wch: 8 }, // الدفع
    { wch: 14 }, // الإجمالي الفرعي
    { wch: 10 }, // الخصم
    { wch: 14 }, // الإجمالي
    { wch: 14 }, // المدفوع
    { wch: 14 }, // المتبقي
    { wch: 14 }, // حالة الدفع
    { wch: 8 }, // العملة
  ];

  // اتجاه الشيت RTL
  worksheet["!dir"] = "rtl";

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "الفواتير");
  workbook.Workbook = { Views: [{ RTL: true }] };

  const today = new Date().toISOString().split("T")[0];
  XLSX.writeFile(workbook, `${fileName}-${today}.xlsx`);
}
