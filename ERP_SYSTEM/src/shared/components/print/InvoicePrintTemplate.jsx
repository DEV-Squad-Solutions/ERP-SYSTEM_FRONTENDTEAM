import { useSelector } from "react-redux";

const typeLabels = {
  Sales: "فاتورة بيع",
  Purchase: "فاتورة شراء",
  SalesReturn: "مرتجع بيع",
  PurchaseReturn: "مرتجع شراء",
};

const paymentLabels = {
  Cash: "نقدي",
  Credit: "آجل",
};

const fmt = (v) => Number(v || 0).toLocaleString("ar-EG");

/**
 * @param {{ invoice: Object }} props
 */
export default function InvoicePrintTemplate({ invoice }) {
  const company = useSelector((state) => state.auth.selectedCompany);

  if (!invoice) return null;

  const hasContainerLines = (invoice.containerLines || []).length > 0;

  return (
    <div
      dir="rtl"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "15mm",
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
        color: "#111827",
        fontSize: "13px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "2px solid #0F6E5E",
          paddingBottom: "12px",
          marginBottom: "16px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
            {company?.name || "—"}
          </h1>
          {/* ⚠️ حطيتها بشرط الوجود لحد ما تأكد إيه الحقول المتوفرة فعليًا في selectedCompany */}
          {company?.address && (
            <p
              style={{ fontSize: "11px", color: "#6b7280", margin: "4px 0 0" }}
            >
              {company.address}
            </p>
          )}
          {company?.phone && (
            <p
              style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0" }}
            >
              {company.phone}
            </p>
          )}
        </div>
        <div style={{ textAlign: "left" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
            {typeLabels[invoice.invoiceType] || invoice.invoiceType}
          </h2>
          <p style={{ fontSize: "12px", margin: "4px 0 0" }}>
            رقم الفاتورة:{" "}
            <strong style={{ fontVariantNumeric: "tabular-nums" }}>
              {invoice.invoiceNumber}
            </strong>
          </p>
        </div>
      </div>

      {/* باقي التمبلت زي ما هو من غير أي تغيير */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "16px",
          fontSize: "12px",
        }}
      >
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "10px",
          }}
        >
          <p style={{ fontWeight: 700, marginBottom: "6px" }}>بيانات العميل</p>
          <p style={{ margin: "2px 0" }}>
            الاسم: {invoice.businessPartnerName || "—"}
          </p>
          <p style={{ margin: "2px 0" }}>
            الدولة: {invoice.countryName || "—"}
          </p>
        </div>
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "10px",
          }}
        >
          <p style={{ fontWeight: 700, marginBottom: "6px" }}>
            بيانات الفاتورة
          </p>
          <p style={{ margin: "2px 0" }}>التاريخ: {invoice.invoiceDate}</p>
          <p style={{ margin: "2px 0" }}>تاريخ الاستحقاق: {invoice.dueDate}</p>
          <p style={{ margin: "2px 0" }}>
            طريقة الدفع: {paymentLabels[invoice.paymentTerm] || "—"}
          </p>
          <p style={{ margin: "2px 0" }}>المخزن: {invoice.storeName || "—"}</p>
          {invoice.vehicleNumber && (
            <p style={{ margin: "2px 0" }}>
              رقم السيارة: {invoice.vehicleNumber}
            </p>
          )}
          {(invoice.driverName || invoice.externalDriverName) && (
            <p style={{ margin: "2px 0" }}>
              السائق: {invoice.driverName || invoice.externalDriverName}
            </p>
          )}
        </div>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "12px",
          marginBottom: "16px",
        }}
      >
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            {[
              "#",
              "الصنف",
              "العدد",
              "الوزن",
              "الكمية",
              "السعر",
              "الإجمالي",
              "ملاحظات",
            ].map((h) => (
              <th
                key={h}
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "6px",
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
          {(invoice.lines || []).map((line, i) => (
            <tr key={line.id ?? i}>
              <td style={cellCenter}>{i + 1}</td>
              <td style={cellRight}>{line.itemName}</td>
              <td style={cellCenter}>{fmt(line.count)}</td>
              <td style={cellCenter}>{fmt(line.weight)}</td>
              <td style={cellCenter}>{fmt(line.quantity)}</td>
              <td style={cellCenter}>{fmt(line.price)}</td>
              <td style={cellCenter}>{fmt(line.total)}</td>
              <td style={cellRight}>{line.notes || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {hasContainerLines && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
            marginBottom: "16px",
          }}
        >
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              {["#", "العبوة", "صادر", "وارد"].map((h) => (
                <th
                  key={h}
                  style={{
                    border: "1px solid #e5e7eb",
                    padding: "6px",
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
            {invoice.containerLines.map((c, i) => (
              <tr key={c.id ?? i}>
                <td style={cellCenter}>{i + 1}</td>
                <td style={cellRight}>{c.containerName}</td>
                <td style={cellCenter}>{fmt(c.outgoingUnits)}</td>
                <td style={cellCenter}>{fmt(c.incomingUnits)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        <table style={{ fontSize: "12px", minWidth: "260px" }}>
          <tbody>
            <SummaryRow label="الإجمالي الفرعي" value={fmt(invoice.subtotal)} />
            <SummaryRow label="الخصم" value={fmt(invoice.discountAmount)} />
            <SummaryRow
              label="الإجمالي"
              value={`${fmt(invoice.total)} ${invoice.currency}`}
              bold
            />
            <SummaryRow label="المدفوع" value={fmt(invoice.paidAmount)} />
            <SummaryRow
              label="المتبقي"
              value={`${fmt(invoice.remainingAmount)} ${invoice.currency}`}
              bold
            />
          </tbody>
        </table>
      </div>

      {invoice.notes && (
        <div style={{ marginTop: "16px", fontSize: "12px" }}>
          <p style={{ fontWeight: 700, marginBottom: "4px" }}>ملاحظات:</p>
          <p style={{ margin: 0 }}>{invoice.notes}</p>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "48px",
          fontSize: "12px",
        }}
      >
        <div style={{ textAlign: "center", width: "200px" }}>
          <div style={{ borderTop: "1px solid #111827", paddingTop: "6px" }}>
            توقيع المستلم
          </div>
        </div>
        <div style={{ textAlign: "center", width: "200px" }}>
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
  padding: "6px",
  textAlign: "center",
};

const cellRight = {
  border: "1px solid #e5e7eb",
  padding: "6px",
  textAlign: "right",
};

function SummaryRow({ label, value, bold }) {
  return (
    <tr>
      <td
        style={{
          padding: "4px 8px",
          fontWeight: bold ? 700 : 400,
          borderTop: bold ? "1px solid #111827" : "none",
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: "4px 8px",
          fontWeight: bold ? 700 : 400,
          textAlign: "left",
          borderTop: bold ? "1px solid #111827" : "none",
        }}
      >
        {value}
      </td>
    </tr>
  );
}
