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
 * تصميم A4 لطباعة قائمة فواتير كتقرير
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
        width: "297mm",
        minHeight: "210mm",
        padding: "12mm",
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
        color: "#111827",
        fontSize: "11px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
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
          <h1
            style={{
              fontSize: "18px",
              fontWeight: 700,
              margin: 0,
            }}
          >
            {company?.name || "—"}
          </h1>

          <p
            style={{
              fontSize: "10px",
              color: "#6b7280",
              margin: "4px 0 0",
            }}
          >
            تقرير الفواتير
          </p>
        </div>

        <div
          style={{
            textAlign: "left",
            fontSize: "10px",
          }}
        >
          <p style={{ margin: "2px 0" }}>تاريخ الطباعة: {today}</p>

          <p style={{ margin: "2px 0" }}>عدد الفواتير: {invoices.length}</p>
        </div>
      </div>

      {/* الفلاتر */}
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
              النوع:
              {typeLabels[
                {
                  sale: "Sales",
                  purchase: "Purchase",
                  sale_return: "SalesReturn",
                  purchase_return: "PurchaseReturn",
                }[filters.movementType]
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
            <tr key={inv.id ?? i} style={{ breakInside: "avoid" }}>
              <td style={cellCenter}>{i + 1}</td>

              <td style={cellCenter}>{inv.invoiceNumber || "—"}</td>

              <td style={cellCenter}>{inv.invoiceDate || "—"}</td>

              <td style={cellCenter}>
                {typeLabels[inv.invoiceType] || inv.invoiceType || "—"}
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
      </table>

      {/* ملخص التقرير */}
      {summary && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "18px",
          }}
        >
          <table
            style={{
              width: "330px",
              borderCollapse: "collapse",
              fontSize: "11px",
            }}
          >
            <tbody>
              <tr>
                <td style={summaryTitle}>إجمالي قبل الخصم</td>
                <td style={summaryValue}>{fmt(summary.subtotal)}</td>
              </tr>

              <tr>
                <td style={summaryTitle}>إجمالي الخصم</td>
                <td style={summaryValue}>{fmt(summary.discountAmount)}</td>
              </tr>

              <tr>
                <td style={summaryTitle}>الإجمالي النهائي</td>
                <td
                  style={{
                    ...summaryValue,
                    fontWeight: 700,
                  }}
                >
                  {fmt(summary.total)}
                </td>
              </tr>

              <tr>
                <td style={summaryTitle}>المدفوع</td>
                <td
                  style={{
                    ...summaryValue,
                    color: "#16a34a",
                    fontWeight: 700,
                  }}
                >
                  {fmt(summary.paidAmount)}
                </td>
              </tr>

              <tr>
                <td style={summaryTitle}>المتبقي</td>
                <td
                  style={{
                    ...summaryValue,
                    color: "#dc2626",
                    fontWeight: 700,
                  }}
                >
                  {fmt(summary.remainingAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* التوقيع */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "32px",
          fontSize: "11px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            width: "180px",
          }}
        >
          <div
            style={{
              borderTop: "1px solid #111827",
              paddingTop: "6px",
            }}
          >
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
  verticalAlign: "middle",
};

const cellRight = {
  border: "1px solid #e5e7eb",
  padding: "5px",
  textAlign: "right",
  verticalAlign: "middle",
};

const summaryTitle = {
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
  padding: "8px 10px",
  textAlign: "right",
  fontWeight: 700,
  width: "60%",
};

const summaryValue = {
  border: "1px solid #e5e7eb",
  padding: "8px 10px",
  textAlign: "center",
  fontWeight: 600,
  width: "40%",
};
