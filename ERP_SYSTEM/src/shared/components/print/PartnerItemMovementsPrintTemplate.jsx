export default function PartnerItemMovementsPrintTemplate({ data, filters }) {
  const rows = data?.movements ?? [];

  const summary = data?.summary ?? {
    totalSalesQuantity: 0,
    totalPurchaseQuantity: 0,
    totalSalesWeight: 0,
    totalPurchaseWeight: 0,
  };

  const fmt = (v) =>
    Number(v ?? 0).toLocaleString("ar-EG", { maximumFractionDigits: 3 });

  const movementLabel = (type) => {
    switch (type?.toLowerCase()) {
      case "sale":
        return "بيع";
      case "purchase":
        return "شراء";
      case "sale_return":
        return "مرتجع بيع";
      case "purchase_return":
        return "مرتجع شراء";
      default:
        return type || "-";
    }
  };

  return (
    <div
      style={{ padding: 24, fontFamily: "Cairo, sans-serif", direction: "rtl" }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 4 }}>
        حركة صنف: {data?.itemName || "-"}
      </h2>

      <p style={{ textAlign: "center", marginBottom: 16, color: "#555" }}>
        العميل / المورد: {data?.businessPartnerName || "-"}
      </p>

      {(filters?.fromDate || filters?.toDate) && (
        <p style={{ textAlign: "center", marginBottom: 16, fontSize: 12 }}>
          الفترة من {filters?.fromDate || "—"} إلى {filters?.toDate || "—"}
        </p>
      )}

      {/* Summary */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: 20,
          fontSize: 13,
        }}
      >
        <tbody>
          <tr>
            <td style={cellStyle}>إجمالي كمية المبيعات</td>
            <td style={cellStyle}>{fmt(summary.totalSalesQuantity)}</td>
            <td style={cellStyle}>إجمالي كمية المشتريات</td>
            <td style={cellStyle}>{fmt(summary.totalPurchaseQuantity)}</td>
          </tr>
          <tr>
            <td style={cellStyle}>إجمالي وزن المبيعات</td>
            <td style={cellStyle}>{fmt(summary.totalSalesWeight)}</td>
            <td style={cellStyle}>إجمالي وزن المشتريات</td>
            <td style={cellStyle}>{fmt(summary.totalPurchaseWeight)}</td>
          </tr>
        </tbody>
      </table>

      {/* Movements table */}
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
      >
        <thead>
          <tr>
            <th style={headStyle}>رقم الفاتورة</th>
            <th style={headStyle}>التاريخ</th>
            <th style={headStyle}>الحركة</th>
            <th style={headStyle}>العدد</th>
            <th style={headStyle}>الوزن</th>
            <th style={headStyle}>الكمية</th>
            <th style={headStyle}>السعر</th>
            <th style={headStyle}>الإجمالي</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, i) => (
            <tr key={`${row.invoiceId}-${i}`}>
              <td style={cellStyle}>{row.invoiceNumber || "-"}</td>
              <td style={cellStyle}>{row.invoiceDate || "-"}</td>
              <td style={cellStyle}>{movementLabel(row.movementType)}</td>
              <td style={cellStyle}>{fmt(row.count)}</td>
              <td style={cellStyle}>{fmt(row.weight)}</td>
              <td style={cellStyle}>{fmt(row.quantity)}</td>
              <td style={cellStyle}>{fmt(row.unitPrice)}</td>
              <td style={cellStyle}>{fmt(row.totalAmount)}</td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr style={{ fontWeight: "bold" }}>
            <td style={cellStyle} colSpan={3}>
              إجمالي النتائج
            </td>
            <td style={cellStyle}>
              {fmt(rows.reduce((s, r) => s + (Number(r.count) || 0), 0))}
            </td>
            <td style={cellStyle}>
              {fmt(rows.reduce((s, r) => s + (Number(r.weight) || 0), 0))}
            </td>
            <td style={cellStyle}>
              {fmt(rows.reduce((s, r) => s + (Number(r.quantity) || 0), 0))}
            </td>
            <td style={cellStyle}></td>
            <td style={cellStyle}>
              {fmt(rows.reduce((s, r) => s + (Number(r.totalAmount) || 0), 0))}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

const cellStyle = {
  border: "1px solid #ddd",
  padding: "6px 8px",
  textAlign: "center",
};

const headStyle = {
  ...cellStyle,
  background: "#f3f3f3",
  fontWeight: "bold",
};
