import { useSelector } from "react-redux";

const SOURCE_TYPE_LABELS = {
  OpeningBalance: "رصيد افتتاحي",
  SalaryTransfer: "تحويل راتب",
  Movement: "حركة",
  CashVoucher: "سند نقدي",
};

const fmt = (value) =>
  Number(value || 0).toLocaleString("ar-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatRate = (value) =>
  Number(value || 0).toLocaleString("ar-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("ar-EG");
};

/**
 * @param {{
 *   employee: Object,
 *   data: Object,
 *   filters: Object
 * }} props
 *
 * تصميم A4 لطباعة كشف حساب الموظف
 */
export default function EmployeeStatementPrintTemplate({
  employee,
  data,
  filters,
}) {
  const company = useSelector((state) => state.auth.selectedCompany);

  if (!data) return null;

  const currency = data?.currency || "EGP";
  const baseCurrency = data?.baseCurrency || "EGP";
  const isForeignCurrency = currency !== baseCurrency;

  const items = Array.isArray(data?.items) ? data.items : [];
  const summary = data?.summary || {};

  const employeeName =
    employee?.employeeName || employee?.name || data?.employeeName || "—";

  const employeeCode =
    employee?.employeeCode || employee?.code || data?.employeeCode || "—";

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
        {/* Company */}
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
            كشف حساب موظف
          </p>
        </div>

        {/* Print Info */}
        <div
          style={{
            textAlign: "left",
            fontSize: "10px",
          }}
        >
          <p style={{ margin: "2px 0" }}>تاريخ الطباعة: {today}</p>

          <p style={{ margin: "2px 0" }}>عدد الحركات: {items.length}</p>

          <p style={{ margin: "2px 0" }}>العملة: {currency}</p>
        </div>
      </div>

      {/* =========================================================
          Employee Information
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
            الموظف
          </div>

          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            {employeeName}
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
            كود الموظف
          </div>

          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            {employeeCode}
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
          {filters.FromDate && <span>من: {filters.FromDate}</span>}

          {filters.ToDate && <span>إلى: {filters.ToDate}</span>}

          {filters.SourceType && (
            <span>
              المصدر:{" "}
              {SOURCE_TYPE_LABELS[filters.SourceType] || filters.SourceType}
            </span>
          )}

          {filters.MovementType && (
            <span>نوع الحركة: {filters.MovementType}</span>
          )}

          {filters.Search && <span>البحث: {filters.Search}</span>}
        </div>
      )}

      {/* =========================================================
          Statement Table
      ========================================================= */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "10px",
        }}
      >
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            {[
              "#",
              "التاريخ",
              "رقم المستند",
              "المرجع",
              "البيان",
              `مدين (${currency})`,
              `دائن (${currency})`,
              `الرصيد (${currency})`,
              ...(isForeignCurrency ? ["سعر الصرف"] : []),
            ].map((header) => (
              <th
                key={header}
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "6px 5px",
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
          {items.map((item, index) => {
            const sourceLabel =
              SOURCE_TYPE_LABELS[item.sourceType] || item.sourceType || "—";

            return (
              <tr
                key={item.sourceId ?? index}
                style={{
                  breakInside: "avoid",
                }}
              >
                {/* # */}
                <td style={cellCenter}>{index + 1}</td>

                {/* Date */}
                <td style={cellCenter}>{formatDate(item.date)}</td>

                {/* Document */}
                <td style={cellCenter}>{item.documentNumber || "—"}</td>

                {/* Reference */}
                <td style={cellCenter}>{item.referenceNumber || "—"}</td>

                {/* Statement */}
                <td style={cellRight}>
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: "2px",
                    }}
                  >
                    {item.movementName || "—"}
                  </div>

                  <div
                    style={{
                      fontSize: "9px",
                      color: "#6b7280",
                    }}
                  >
                    {sourceLabel}
                  </div>

                  {item.description && (
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#6b7280",
                        marginTop: "2px",
                      }}
                    >
                      {item.description}
                    </div>
                  )}
                </td>

                {/* Debit */}
                <td style={cellNumber}>
                  {fmt(item.debitAmount)}

                  {isForeignCurrency && (
                    <div style={baseAmount}>
                      {fmt(item.baseDebitAmount)} {baseCurrency}
                    </div>
                  )}
                </td>

                {/* Credit */}
                <td style={cellNumber}>
                  {fmt(item.creditAmount)}

                  {isForeignCurrency && (
                    <div style={baseAmount}>
                      {fmt(item.baseCreditAmount)} {baseCurrency}
                    </div>
                  )}
                </td>

                {/* Balance */}
                <td style={cellNumber}>
                  <div
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    {fmt(item.balanceAmount)}
                  </div>

                  {item.balanceDescription && (
                    <div
                      style={{
                        fontSize: "8.5px",
                        color: "#6b7280",
                        marginTop: "2px",
                      }}
                    >
                      {item.balanceDescription}
                    </div>
                  )}

                  {isForeignCurrency && (
                    <div style={baseAmount}>
                      {fmt(item.baseBalanceAmount)} {baseCurrency}
                    </div>
                  )}
                </td>

                {/* Exchange Rate */}
                {isForeignCurrency && (
                  <td style={cellCenter}>{formatRate(item.exchangeRate)}</td>
                )}
              </tr>
            );
          })}

          {!items.length && (
            <tr>
              <td
                colSpan={isForeignCurrency ? 9 : 8}
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
            width: "360px",
            borderCollapse: "collapse",
            fontSize: "10.5px",
          }}
        >
          <tbody>
            {/* Opening */}
            <tr>
              <td style={summaryTitle}>الرصيد الافتتاحي</td>

              <td style={summaryValue}>{fmt(summary.openingBalanceAmount)}</td>
            </tr>

            {/* Debits */}
            <tr>
              <td style={summaryTitle}>إجمالي المدين</td>

              <td style={summaryValue}>{fmt(summary.totalDebits)}</td>
            </tr>

            {/* Credits */}
            <tr>
              <td style={summaryTitle}>إجمالي الدائن</td>

              <td
                style={{
                  ...summaryValue,
                  color: "#16a34a",
                  fontWeight: 700,
                }}
              >
                {fmt(summary.totalCredits)}
              </td>
            </tr>

            {/* Closing */}
            <tr>
              <td
                style={{
                  ...summaryTitle,
                  fontWeight: 700,
                }}
              >
                الرصيد الختامي
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

            {/* Closing Description */}
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

            {/* Foreign Currency */}
            {isForeignCurrency && (
              <>
                <tr>
                  <td style={summaryTitle}>الرصيد الختامي ({baseCurrency})</td>

                  <td style={summaryValue}>
                    {fmt(summary.baseClosingBalanceAmount)}
                  </td>
                </tr>

                <tr>
                  <td style={summaryTitle}>إجمالي المدين ({baseCurrency})</td>

                  <td style={summaryValue}>{fmt(summary.baseTotalDebits)}</td>
                </tr>

                <tr>
                  <td style={summaryTitle}>إجمالي الدائن ({baseCurrency})</td>

                  <td style={summaryValue}>{fmt(summary.baseTotalCredits)}</td>
                </tr>
              </>
            )}
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
            توقيع الموظف
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

/* =========================================================
   Table Styles
========================================================= */

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

const cellNumber = {
  border: "1px solid #e5e7eb",
  padding: "5px",
  textAlign: "center",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
};

const baseAmount = {
  marginTop: "2px",
  fontSize: "8px",
  color: "#6b7280",
  fontWeight: 400,
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
