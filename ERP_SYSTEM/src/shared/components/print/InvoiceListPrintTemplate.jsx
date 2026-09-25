import { Fragment } from "react";
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

const ITEM_COLUMNS = [
  "كود الصنف",
  "اسم الصنف",
  "الوحدة",
  "العدد",
  "الوزن",
  "الكمية",
  "السعر",
  "الإجمالي",
];

/**
 * @param {{ invoices: Array, filters: Object, summary: Object }} props
 * تصميم A4 لطباعة قائمة فواتير كتقرير — جدول واحد مستمر: كل فاتورة صف
 * فاصل بعرض الجدول كامل، وتحته أصنافها مباشرة كصفوف عادية بنفس أعمدة الجدول
 */
export default function InvoiceListPrintTemplate({
  invoices,
  filters,
  summary,
}) {
  const company = useSelector((state) => state.auth.selectedCompany);

  if (!invoices) return null;

  const today = new Date().toLocaleDateString("ar-EG");

  // إجمالي الكمية عبر كل أصناف كل الفواتير المعروضة في التقرير
  const totalQuantity = invoices.reduce(
    (sum, inv) =>
      sum + (inv.lines?.reduce((s, l) => s + Number(l.quantity || 0), 0) || 0),
    0,
  );

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
            تقرير الفواتير التفصيلي
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

          <p style={{ margin: "2px 0" }}>إجمالي الكمية: {fmt(totalQuantity)}</p>
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

      {/* جدول واحد مستمر: صف فاصل لكل فاتورة، وتحته صفوف أصنافها مباشرة */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "10px",
        }}
      >
        <thead>
          <tr style={{ background: "#0F6E5E" }}>
            {ITEM_COLUMNS.map((h) => (
              <th
                key={h}
                style={{
                  border: "1px solid #0b5546",
                  padding: "5px",
                  textAlign: "center",
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {invoices.map((inv, i) => (
            <Fragment key={inv.id ?? i}>
              {/* صف فاصل بعرض الجدول كامل - بيانات الفاتورة نفسها */}
              <tr style={{ breakInside: "avoid" }}>
                <td
                  colSpan={ITEM_COLUMNS.length}
                  style={{
                    border: "1px solid #e5e7eb",
                    background: "#f3f4f6",
                    padding: "6px 8px",
                    fontSize: "10.5px",
                    fontWeight: 700,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      gap: "10px",
                    }}
                  >
                    <span>
                      #{i + 1} — فاتورة {inv.invoiceNumber || "—"} —{" "}
                      {typeLabels[inv.invoiceType] || inv.invoiceType || "—"}
                    </span>
                    <span style={{ fontWeight: 400, color: "#4b5563" }}>
                      {inv.invoiceDate || "—"}
                      {" · "}
                      {inv.businessPartnerName || "—"}
                      {" · "}
                      {inv.storeName || "—"}
                      {" · "}
                      {paymentLabels[inv.paymentTerm] || "—"}
                    </span>
                    <span>
                      إجمالي: {fmt(inv.total)}
                      {" · "}مدفوع: {fmt(inv.paidAmount)}
                      {" · "}متبقي: {fmt(inv.remainingAmount)}
                    </span>
                  </div>
                </td>
              </tr>

              {/* أصناف الفاتورة - صفوف عادية بنفس أعمدة الجدول */}
              {inv.lines?.length > 0 ? (
                inv.lines.map((line, li) => (
                  <tr key={line.id ?? li}>
                    <td style={cellCenter}>{line.itemCode || "—"}</td>
                    <td style={cellRight}>{line.itemName || "—"}</td>
                    <td style={cellCenter}>{line.itemUnitName || "—"}</td>
                    <td style={cellCenter}>{fmt(line.count)}</td>
                    <td style={cellCenter}>{fmt(line.weight)}</td>
                    <td style={cellCenter}>{fmt(line.quantity)}</td>
                    <td style={cellCenter}>{fmt(line.price)}</td>
                    <td style={cellCenter}>{fmt(line.total)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={ITEM_COLUMNS.length}
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "6px 10px",
                      color: "#9ca3af",
                      textAlign: "center",
                    }}
                  >
                    لا توجد أصناف مسجلة لهذه الفاتورة
                  </td>
                </tr>
              )}
            </Fragment>
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
                <td style={summaryTitle}>إجمالي الكمية</td>
                <td style={{ ...summaryValue, fontWeight: 700 }}>
                  {fmt(totalQuantity)}
                </td>
              </tr>

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
