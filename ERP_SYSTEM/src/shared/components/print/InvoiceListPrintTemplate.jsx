import { useSelector } from "react-redux";

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

const fmt = (v) => Number(v || 0).toLocaleString("ar-EG");

/**
 * @param {{ invoices: Array, filters: Object, summary: Object }} props
 * تصميم A4 لطباعة قائمة فواتير كتقرير (مش فاتورة واحدة تفصيلية)
 */
export default function InvoiceListPrintTemplate({
  invoices,
  filters,
  summary,
}) {
  const company = useSelector((state) => state.auth.selectedCompany);
  if (!invoices) return null;

  const today = new Date().toLocaleDateString("ar-EG");

  return (
    <div
      dir="rtl"
      style={{
        width: "297mm", // A4 landscape - أنسب لجدول بعدد أعمدة كبير
        minHeight: "210mm",
        padding: "12mm",
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
        color: "#111827",
        fontSize: "11px",
        boxSizing: "border-box",
      }}
    >
      {/* الهيدر */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "2px solid #0F6E5E",
          paddingBottom: "10px",
          marginBottom: "12px",
        }}
      >
        <div>
          {/* ⚠️ اسم الشركة placeholder، اربطه ببيانات الشركة لو متوفرة */}
          <h1 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
            {company?.name || "—"}{" "}
          </h1>
          <p style={{ fontSize: "10px", color: "#6b7280", margin: "4px 0 0" }}>
            تقرير الفواتير
          </p>
        </div>
        <div style={{ textAlign: "left", fontSize: "10px" }}>
          <p style={{ margin: "2px 0" }}>تاريخ الطباعة: {today}</p>
          <p style={{ margin: "2px 0" }}>عدد الفواتير: {invoices.length}</p>
        </div>
      </div>

      {/* ملخص الفلاتر المطبقة */}
      {filters && (
        <div
          style={{
            fontSize: "10px",
            color: "#6b7280",
            marginBottom: "10px",
            display: "flex",
            gap: "14px",
            flexWrap: "wrap",
          }}
        >
          {filters.fromDate && <span>من: {filters.fromDate}</span>}
          {filters.toDate && <span>إلى: {filters.toDate}</span>}
          {filters.movementType && (
            <span>
              النوع:{" "}
              {typeLabels[
                { sale: "Sales", purchase: "Purchase" }[filters.movementType]
              ] || filters.movementType}
            </span>
          )}
        </div>
      )}

      {/* جدول الفواتير */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "10.5px",
        }}
      >
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            {[
              "#",
              "رقم الفاتورة",
              "التاريخ",
              "النوع",
              "العميل",
              "المخزن",
              "الدفع",
              "الإجمالي",
              "المدفوع",
              "المتبقي",
            ].map((h) => (
              <th
                key={h}
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "5px",
                  textAlign: "center",
                  fontWeight: 700,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv, i) => (
            <tr key={inv.id} style={{ breakInside: "avoid" }}>
              <td style={cellCenter}>{i + 1}</td>
              <td style={cellCenter}>{inv.invoiceNumber}</td>
              <td style={cellCenter}>{inv.invoiceDate}</td>
              <td style={cellCenter}>
                {typeLabels[inv.invoiceType] || inv.invoiceType}
              </td>
              <td style={cellRight}>{inv.businessPartnerName || "—"}</td>
              <td style={cellRight}>{inv.storeName || "—"}</td>
              <td style={cellCenter}>
                {paymentLabels[inv.paymentTerm] || "—"}
              </td>
              <td style={cellCenter}>{fmt(inv.total)}</td>
              <td style={cellCenter}>{fmt(inv.paidAmount)}</td>
              <td style={cellCenter}>{fmt(inv.remainingAmount)}</td>
            </tr>
          ))}
        </tbody>
        {summary && (
          <tfoot>
            <tr style={{ background: "#f3f4f6", fontWeight: 700 }}>
              <td colSpan={7} style={{ ...cellCenter, textAlign: "left" }}>
                الإجمالي
              </td>
              <td style={cellCenter}>{fmt(summary.totalAmount)}</td>
              <td style={cellCenter}>{fmt(summary.totalPaid)}</td>
              <td style={cellCenter}>{fmt(summary.totalRemaining)}</td>
            </tr>
          </tfoot>
        )}
      </table>

      {/* التوقيع */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "32px",
          fontSize: "11px",
        }}
      >
        <div style={{ textAlign: "center", width: "180px" }}>
          <div style={{ borderTop: "1px solid #111827", paddingTop: "6px" }}>
            توقيع المسؤول
          </div>
        </div>
      </div>
    </div>
  );
}

const cellCenter = {
  border: "1px solid #e5e7eb",
  padding: "5px",
  textAlign: "center",
};

const cellRight = {
  border: "1px solid #e5e7eb",
  padding: "5px",
  textAlign: "right",
};
