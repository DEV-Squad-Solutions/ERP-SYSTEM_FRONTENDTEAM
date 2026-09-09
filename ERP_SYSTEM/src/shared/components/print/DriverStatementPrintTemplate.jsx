import { useSelector } from "react-redux";

const fmt = (value) =>
  Number(value || 0).toLocaleString("ar-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("ar-EG");
};

export default function DriverStatementPrintTemplate({
  driver,
  data,
  filters,
}) {
  const company = useSelector((state) => state.auth.selectedCompany);

  if (!data) return null;

  const items = Array.isArray(data?.items) ? data.items : [];
  const summary = data?.summary || {};

  const driverName =
    driver?.name || driver?.driverName || data?.driverName || "—";

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
        background: "#fff",
      }}
    >
      {/* =========================================================
          Header
      ========================================================= */}
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
            كشف حساب سائق
          </p>
        </div>

        <div
          style={{
            textAlign: "left",
            fontSize: "10px",
          }}
        >
          <p style={{ margin: "2px 0" }}>تاريخ الطباعة: {today}</p>

          <p style={{ margin: "2px 0" }}>عدد الحركات: {items.length}</p>
        </div>
      </div>

      {/* =========================================================
          Driver Information
      ========================================================= */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            flex: 1,
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            padding: "8px 10px",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              color: "#6b7280",
              marginBottom: "3px",
            }}
          >
            السائق
          </div>

          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            {driverName}
          </div>
        </div>

        <div
          style={{
            width: "180px",
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            padding: "8px 10px",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              color: "#6b7280",
              marginBottom: "3px",
            }}
          >
            كود السائق
          </div>

          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            {data?.driverId || driver?.id || "—"}
          </div>
        </div>
      </div>

      {/* =========================================================
          Filters
      ========================================================= */}
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

          {filters.direction && (
            <span>
              اتجاه الحركة:{" "}
              {filters.direction === "Receipt"
                ? "وارد"
                : filters.direction === "Payment"
                  ? "صادر"
                  : filters.direction}
            </span>
          )}

          {filters.cashMovementTypeId && (
            <span>نوع الحركة: {filters.cashMovementTypeId}</span>
          )}

          {filters.driverTripId && (
            <span>رقم الرحلة: {filters.driverTripId}</span>
          )}

          {filters.invoiceNumber && (
            <span>رقم الفاتورة: {filters.invoiceNumber}</span>
          )}

          {filters.hasCost !== "" && filters.hasCost !== undefined && (
            <span>
              تكلفة الرحلة:{" "}
              {filters.hasCost === "true" ? "بها تكلفة" : "بدون تكلفة"}
            </span>
          )}

          {filters.transactionsWithoutTrip && <span>سندات عامة بدون رحلة</span>}

          {filters.search && <span>البحث: {filters.search}</span>}
        </div>
      )}

      {/* =========================================================
          Statement Table
      ========================================================= */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "9.5px",
        }}
      >
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            {[
              "#",
              "التاريخ",
              "المستند",
              "البيان",
              "البلد",
              "الخزنة",
              "الرحلة",
              "الفاتورة",
              "العميل",
              "مدفوع للسائق",
              "مستلم منه",
              "تكلفة الرحلة",
              "الرصيد",
            ].map((header) => (
              <th
                key={header}
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "5px 4px",
                  textAlign: "center",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {items.map((row, index) => (
            <tr
              key={`${row.sourceId}-${row.date}-${index}`}
              style={{
                breakInside: "avoid",
              }}
            >
              {/* # */}
              <td style={cellCenter}>{index + 1}</td>

              {/* التاريخ */}
              <td style={cellCenter}>{formatDate(row.date)}</td>

              {/* المستند */}
              <td style={cellCenter}>{row.documentNumber || "—"}</td>

              {/* البيان */}
              <td style={cellRight}>
                <div
                  style={{
                    fontWeight: 700,
                  }}
                >
                  {row.movementName || row.sourceName || "—"}
                </div>

                {row.sourceName && (
                  <div
                    style={{
                      fontSize: "8px",
                      color: "#6b7280",
                      marginTop: "2px",
                    }}
                  >
                    {row.sourceName}
                  </div>
                )}

                {row.description && (
                  <div
                    style={{
                      fontSize: "8px",
                      color: "#6b7280",
                      marginTop: "2px",
                    }}
                  >
                    {row.description}
                  </div>
                )}
              </td>

              {/* البلد */}
              <td style={cellRight}>{row.countryName || "—"}</td>

              {/* الخزنة */}
              <td style={cellRight}>{row.cashboxName || "—"}</td>

              {/* الرحلة */}
              <td style={cellCenter}>{row.driverTripNumber || "—"}</td>

              {/* الفاتورة */}
              <td style={cellCenter}>{row.invoiceNumber || "—"}</td>

              {/* العميل */}
              <td style={cellRight}>{row.businessPartnerName || "—"}</td>

              {/* مدفوع للسائق */}
              <td
                style={{
                  ...cellNumber,
                  color:
                    Number(row.amountPaidToDriver || 0) > 0
                      ? "#dc2626"
                      : "#6b7280",
                }}
              >
                {Number(row.amountPaidToDriver || 0) > 0
                  ? fmt(row.amountPaidToDriver)
                  : "—"}
              </td>

              {/* مستلم منه */}
              <td
                style={{
                  ...cellNumber,
                  color:
                    Number(row.amountReceivedFromDriver || 0) > 0
                      ? "#16a34a"
                      : "#6b7280",
                }}
              >
                {Number(row.amountReceivedFromDriver || 0) > 0
                  ? fmt(row.amountReceivedFromDriver)
                  : "—"}
              </td>

              {/* تكلفة الرحلة */}
              <td style={cellNumber}>
                {row.driverTripNumber ? (
                  Number(row.tripCost || 0) > 0 ? (
                    fmt(row.tripCost)
                  ) : (
                    <span
                      style={{
                        fontSize: "8px",
                        color: "#dc2626",
                        fontWeight: 700,
                      }}
                    >
                      غير متسعّرة
                    </span>
                  )
                ) : (
                  "—"
                )}
              </td>

              {/* الرصيد */}
              <td style={cellNumber}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "10px",
                  }}
                >
                  {fmt(row.balanceAmount)}
                </div>

                {row.balanceDescription && (
                  <div
                    style={{
                      marginTop: "2px",
                      fontSize: "8px",
                      color: row.balanceDescription.includes("مطلوب من السائق")
                        ? "#16a34a"
                        : row.balanceDescription.includes("مطلوب دفعه")
                          ? "#dc2626"
                          : "#6b7280",
                    }}
                  >
                    {row.balanceDescription}
                  </div>
                )}
              </td>
            </tr>
          ))}

          {!items.length && (
            <tr>
              <td
                colSpan={13}
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "18px",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                لا توجد حركات في كشف الحساب
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* =========================================================
          Summary
      ========================================================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "18px",
        }}
      >
        <table
          style={{
            width: "380px",
            borderCollapse: "collapse",
            fontSize: "10.5px",
          }}
        >
          <tbody>
            <tr>
              <td style={summaryTitle}>رصيد أول المدة</td>

              <td style={summaryValue}>{fmt(summary.openingBalanceAmount)}</td>
            </tr>

            <tr>
              <td style={summaryTitle}>إجمالي المدفوع للسائق</td>

              <td
                style={{
                  ...summaryValue,
                  color: "#dc2626",
                  fontWeight: 700,
                }}
              >
                {fmt(summary.totalPaidToDriver)}
              </td>
            </tr>

            <tr>
              <td style={summaryTitle}>إجمالي المستلم من السائق</td>

              <td
                style={{
                  ...summaryValue,
                  color: "#16a34a",
                  fontWeight: 700,
                }}
              >
                {fmt(summary.totalReceivedFromDriver)}
              </td>
            </tr>

            <tr>
              <td style={summaryTitle}>إجمالي تكلفة الرحلات</td>

              <td style={summaryValue}>{fmt(summary.totalTripCost)}</td>
            </tr>

            <tr>
              <td
                style={{
                  ...summaryTitle,
                  fontWeight: 700,
                }}
              >
                رصيد آخر المدة
              </td>

              <td
                style={{
                  ...summaryValue,
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              >
                {fmt(summary.closingBalanceAmount)}
              </td>
            </tr>

            <tr>
              <td
                colSpan={2}
                style={{
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  padding: "6px 10px",
                  textAlign: "center",
                  fontSize: "9px",
                  color: "#6b7280",
                }}
              >
                {summary.closingBalanceDescription || "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* =========================================================
          Signature
      ========================================================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "35px",
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
            توقيع السائق
          </div>
        </div>

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
  padding: "5px 4px",
  textAlign: "center",
  verticalAlign: "middle",
};

const cellRight = {
  border: "1px solid #e5e7eb",
  padding: "5px 4px",
  textAlign: "right",
  verticalAlign: "middle",
};

const cellNumber = {
  border: "1px solid #e5e7eb",
  padding: "5px 4px",
  textAlign: "center",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
};

const summaryTitle = {
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
  padding: "7px 10px",
  textAlign: "right",
  fontWeight: 700,
  width: "60%",
};

const summaryValue = {
  border: "1px solid #e5e7eb",
  padding: "7px 10px",
  textAlign: "center",
  fontWeight: 600,
  width: "40%",
};
