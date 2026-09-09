import { useSelector } from "react-redux";

// ============================================================
// Helpers
// ============================================================

const SOURCE_TYPE_LABELS = {
  OpeningBalance: "رصيد افتتاحي",
  Invoice: "فاتورة",
  SalesInvoice: "فاتورة بيع",
  PurchaseInvoice: "فاتورة شراء",
  SalesReturn: "مرتجع بيع",
  PurchaseReturn: "مرتجع شراء",
  CashVoucher: "سند نقدي",
  CashMovement: "حركة نقدية",
  BankMovement: "حركة بنكية",
  Movement: "حركة",
  JournalEntry: "قيد يومية",
};

const MOVEMENT_TYPE_LABELS = {
  Sale: "بيع",
  Purchase: "شراء",
  SalesReturn: "مرتجع بيع",
  PurchaseReturn: "مرتجع شراء",
  CashReceipt: "قبض نقدي",
  CashPayment: "دفع نقدي",
  Receipt: "قبض",
  Payment: "دفع",
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

const getFilterValue = (filters, ...keys) => {
  if (!filters) return "";

  for (const key of keys) {
    if (
      filters[key] !== undefined &&
      filters[key] !== null &&
      filters[key] !== ""
    ) {
      return filters[key];
    }
  }

  return "";
};

const getSourceLabel = (value) => {
  if (!value) return "—";

  return SOURCE_TYPE_LABELS[value] || value;
};

const getMovementLabel = (value) => {
  if (!value) return "—";

  return MOVEMENT_TYPE_LABELS[value] || value;
};

// ============================================================
// Styles
// ============================================================

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

// ============================================================
// Component
// ============================================================

export default function PartnerStatementPrintTemplate({
  partner,
  data,
  filters,
}) {
  const company = useSelector((state) => state.auth.selectedCompany);

  if (!data) return null;

  // ============================================================
  // Data
  // ============================================================

  const items = Array.isArray(data?.items) ? data.items : [];
  const summary = data?.summary || {};

  const partnerName =
    data?.businessPartnerName ||
    partner?.name ||
    partner?.Name ||
    partner?.businessPartnerName ||
    "العميل / المورد";

  const businessPartnerId =
    data?.businessPartnerId || partner?.id || partner?.Id || "—";

  const currency = data?.currency || partner?.currency || "EGP";

  const baseCurrency = data?.baseCurrency || "EGP";

  const isForeignCurrency = currency !== baseCurrency;

  const today = new Date();

  // ============================================================
  // Calculations
  // ============================================================

  const calculatedOpeningBalance =
    summary?.openingBalanceAmount ?? summary?.openingBalance ?? 0;

  const calculatedTotalDebits =
    summary?.totalDebits ??
    items.reduce((total, item) => total + Number(item?.debitAmount || 0), 0);

  const calculatedTotalCredits =
    summary?.totalCredits ??
    items.reduce((total, item) => total + Number(item?.creditAmount || 0), 0);

  const calculatedClosingBalance =
    summary?.closingBalanceAmount ??
    Number(calculatedOpeningBalance) +
      Number(calculatedTotalDebits) -
      Number(calculatedTotalCredits);

  // ============================================================
  // Filters
  // ============================================================

  const fromDate = getFilterValue(filters, "FromDate", "fromDate");

  const toDate = getFilterValue(filters, "ToDate", "toDate");

  const search = getFilterValue(filters, "Search", "search");

  const sourceType = getFilterValue(filters, "SourceType", "sourceType");

  const movementType = getFilterValue(filters, "MovementType", "movementType");

  const cashMovementTypeId = getFilterValue(
    filters,
    "CashMovementTypeId",
    "cashMovementTypeId",
  );

  const classification = getFilterValue(
    filters,
    "Classification",
    "classification",
  );

  // ============================================================
  // Company info
  // ============================================================

  const companyName =
    company?.name || company?.Name || company?.companyName || "—";

  const companyPhone =
    company?.phone || company?.Phone || company?.mobile || "";

  const companyAddress = company?.address || company?.Address || "";

  return (
    <>
      {/* ========================================================
          Print CSS
      ======================================================== */}

      <style>
        {`
          @page {
            size: A4 landscape;
            margin: 0;
          }

          @media print {
            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
            }

            .partner-statement-print-page {
              width: 297mm !important;
              min-height: 210mm !important;
              margin: 0 !important;
              padding: 12mm !important;
              box-sizing: border-box !important;
            }

            table {
              page-break-inside: auto;
            }

            thead {
              display: table-header-group;
            }

            tfoot {
              display: table-footer-group;
            }

            tr {
              page-break-inside: avoid;
              break-inside: avoid;
            }

            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      {/* ========================================================
          A4 Page
      ======================================================== */}

      <div
        className="partner-statement-print-page"
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
        {/* ======================================================
            Header
        ====================================================== */}

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
                color: "#111827",
              }}
            >
              {companyName}
            </h1>

            <p
              style={{
                fontSize: "10px",
                color: "#6b7280",
                margin: "4px 0 0",
              }}
            >
              كشف حساب عميل / مورد
            </p>

            {companyAddress && (
              <p
                style={{
                  fontSize: "9px",
                  color: "#6b7280",
                  margin: "2px 0 0",
                }}
              >
                {companyAddress}
              </p>
            )}

            {companyPhone && (
              <p
                style={{
                  fontSize: "9px",
                  color: "#6b7280",
                  margin: "2px 0 0",
                }}
              >
                {companyPhone}
              </p>
            )}
          </div>

          {/* Print info */}

          <div
            style={{
              textAlign: "left",
              fontSize: "10px",
              color: "#374151",
            }}
          >
            <p style={{ margin: "2px 0" }}>
              تاريخ الطباعة: {formatDate(today)}
            </p>

            <p style={{ margin: "2px 0" }}>عدد الحركات: {items.length}</p>

            <p style={{ margin: "2px 0" }}>العملة: {currency}</p>
          </div>
        </div>

        {/* ======================================================
            Partner Information
        ====================================================== */}

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          {/* Partner */}

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
              العميل / المورد
            </div>

            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {partnerName}
            </div>
          </div>

          {/* Account Number */}

          <div
            style={{
              width: "150px",
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
              رقم الحساب
            </div>

            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {businessPartnerId}
            </div>
          </div>

          {/* Account Currency */}

          <div
            style={{
              width: "150px",
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
              عملة الحساب
            </div>

            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {currency}
            </div>
          </div>

          {/* Base Currency */}

          <div
            style={{
              width: "150px",
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
              العملة الأساسية
            </div>

            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {baseCurrency}
            </div>
          </div>
        </div>

        {/* ======================================================
            Filters
        ====================================================== */}

        {(fromDate ||
          toDate ||
          search ||
          sourceType ||
          movementType ||
          cashMovementTypeId ||
          classification) && (
          <div
            style={{
              marginBottom: "12px",
              padding: "8px 10px",
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              معايير الكشف
            </div>

            <div
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                fontSize: "9px",
                color: "#6b7280",
              }}
            >
              {fromDate && <span>من: {formatDate(fromDate)}</span>}

              {toDate && <span>إلى: {formatDate(toDate)}</span>}

              {sourceType && <span>المصدر: {getSourceLabel(sourceType)}</span>}

              {movementType && (
                <span>نوع الحركة: {getMovementLabel(movementType)}</span>
              )}

              {cashMovementTypeId && (
                <span>نوع الحركة النقدية: {cashMovementTypeId}</span>
              )}

              {classification && <span>التصنيف: {classification}</span>}

              {search && <span>البحث: {search}</span>}
            </div>
          </div>
        )}

        {/* ======================================================
            Statement Table
        ====================================================== */}

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "10px",
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f3f4f6",
              }}
            >
              <th
                style={{
                  ...cellCenter,
                  width: "4%",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                #
              </th>

              <th
                style={{
                  ...cellCenter,
                  width: "9%",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                التاريخ
              </th>

              <th
                style={{
                  ...cellCenter,
                  width: "11%",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                رقم المستند
              </th>

              <th
                style={{
                  ...cellCenter,
                  width: "14%",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                الحركة
              </th>

              <th
                style={{
                  ...cellCenter,
                  width: "22%",
                  fontWeight: 700,
                }}
              >
                البيان
              </th>

              <th
                style={{
                  ...cellCenter,
                  width: "9%",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                مدين ({currency})
              </th>

              <th
                style={{
                  ...cellCenter,
                  width: "9%",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                دائن ({currency})
              </th>

              <th
                style={{
                  ...cellCenter,
                  width: "11%",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                الرصيد ({currency})
              </th>

              {isForeignCurrency && (
                <th
                  style={{
                    ...cellCenter,
                    width: "11%",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  سعر الصرف
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {/* ==================================================
                Opening Balance
            ================================================== */}

            <tr>
              <td
                style={{
                  ...cellCenter,
                  fontWeight: 700,
                }}
              >
                —
              </td>

              <td style={cellCenter}>—</td>

              <td style={cellCenter}>—</td>

              <td
                style={{
                  ...cellRight,
                  fontWeight: 700,
                }}
              >
                رصيد افتتاحي
              </td>

              <td
                style={{
                  ...cellRight,
                  fontWeight: 600,
                }}
              >
                {summary?.openingBalanceDescription || "الرصيد الافتتاحي"}
              </td>

              <td style={cellNumber}>
                {Number(calculatedOpeningBalance) > 0
                  ? fmt(calculatedOpeningBalance)
                  : "—"}
              </td>

              <td style={cellNumber}>
                {Number(calculatedOpeningBalance) < 0
                  ? fmt(Math.abs(calculatedOpeningBalance))
                  : "—"}
              </td>

              <td
                style={{
                  ...cellNumber,
                  fontWeight: 700,
                }}
              >
                {fmt(calculatedOpeningBalance)}
              </td>

              {isForeignCurrency && <td style={cellNumber}>—</td>}
            </tr>

            {/* ==================================================
                Transactions
            ================================================== */}

            {items.map((item, index) => {
              const debitAmount = Number(item?.debitAmount || 0);

              const creditAmount = Number(item?.creditAmount || 0);

              const balanceAmount = Number(item?.balanceAmount ?? 0);

              const exchangeRate = Number(item?.exchangeRate || 0);

              const documentNumber =
                item?.invoiceNumber ||
                item?.referenceNumber ||
                item?.documentNumber ||
                item?.voucherNumber ||
                "—";

              const movement =
                item?.movementTypeName ||
                item?.movementType ||
                item?.sourceName ||
                item?.sourceType ||
                "—";

              const description =
                item?.description ||
                item?.movementDescription ||
                item?.notes ||
                "—";

              return (
                <tr key={item?.id || item?.Id || index}>
                  <td style={cellCenter}>{index + 1}</td>

                  <td style={cellCenter}>
                    {formatDate(
                      item?.date ||
                        item?.movementDate ||
                        item?.invoiceDate ||
                        item?.createdAt,
                    )}
                  </td>

                  <td
                    style={{
                      ...cellCenter,
                      fontWeight: 600,
                    }}
                  >
                    {documentNumber}
                  </td>

                  <td style={cellRight}>
                    <div
                      style={{
                        fontWeight: 600,
                      }}
                    >
                      {getMovementLabel(movement)}
                    </div>

                    {item?.sourceType && (
                      <div style={baseAmount}>
                        {getSourceLabel(item.sourceType)}
                      </div>
                    )}
                  </td>

                  <td style={cellRight}>
                    <div>{description}</div>

                    {item?.referenceNumber && item?.invoiceNumber && (
                      <div style={baseAmount}>مرجع: {item.referenceNumber}</div>
                    )}
                  </td>

                  <td style={cellNumber}>
                    {debitAmount > 0 ? fmt(debitAmount) : "—"}
                  </td>

                  <td
                    style={{
                      ...cellNumber,
                      color: creditAmount > 0 ? "#16a34a" : "#111827",
                    }}
                  >
                    {creditAmount > 0 ? fmt(creditAmount) : "—"}
                  </td>

                  <td
                    style={{
                      ...cellNumber,
                      fontWeight: 700,
                    }}
                  >
                    {fmt(balanceAmount)}
                  </td>

                  {isForeignCurrency && (
                    <td style={cellNumber}>
                      {exchangeRate > 0 ? formatRate(exchangeRate) : "—"}
                    </td>
                  )}
                </tr>
              );
            })}

            {/* ==================================================
                Empty State
            ================================================== */}

            {items.length === 0 && (
              <tr>
                <td
                  colSpan={isForeignCurrency ? 9 : 8}
                  style={{
                    border: "1px solid #e5e7eb",
                    padding: "18px",
                    textAlign: "center",
                    color: "#6b7280",
                    background: "#fafafa",
                  }}
                >
                  لا توجد حركات خلال الفترة المحددة
                </td>
              </tr>
            )}
          </tbody>

          {/* ====================================================
              Totals
          ==================================================== */}

          <tfoot>
            <tr
              style={{
                background: "#f9fafb",
              }}
            >
              <td
                colSpan={5}
                style={{
                  ...cellRight,
                  fontWeight: 700,
                }}
              >
                الإجمالي
              </td>

              <td
                style={{
                  ...cellNumber,
                  fontWeight: 700,
                }}
              >
                {fmt(calculatedTotalDebits)}
              </td>

              <td
                style={{
                  ...cellNumber,
                  color: "#16a34a",
                  fontWeight: 700,
                }}
              >
                {fmt(calculatedTotalCredits)}
              </td>

              <td
                style={{
                  ...cellNumber,
                  fontWeight: 700,
                }}
              >
                {fmt(calculatedClosingBalance)}
              </td>

              {isForeignCurrency && <td style={cellNumber}>—</td>}
            </tr>
          </tfoot>
        </table>

        {/* ======================================================
            Summary
        ====================================================== */}

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
                <td style={summaryTitle}>الرصيد الافتتاحي</td>

                <td style={summaryValue}>{fmt(calculatedOpeningBalance)}</td>
              </tr>

              <tr>
                <td style={summaryTitle}>إجمالي المدين</td>

                <td style={summaryValue}>{fmt(calculatedTotalDebits)}</td>
              </tr>

              <tr>
                <td style={summaryTitle}>إجمالي الدائن</td>

                <td
                  style={{
                    ...summaryValue,
                    color: "#16a34a",
                    fontWeight: 700,
                  }}
                >
                  {fmt(calculatedTotalCredits)}
                </td>
              </tr>

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
                  {fmt(calculatedClosingBalance)}
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
                  {summary?.closingBalanceDescription || "—"}
                </td>
              </tr>

              {/* Foreign Currency Summary */}

              {isForeignCurrency && (
                <>
                  {summary?.totalDebitsBaseCurrency !== undefined && (
                    <tr>
                      <td style={summaryTitle}>
                        إجمالي المدين ({baseCurrency})
                      </td>

                      <td style={summaryValue}>
                        {fmt(summary.totalDebitsBaseCurrency)}
                      </td>
                    </tr>
                  )}

                  {summary?.totalCreditsBaseCurrency !== undefined && (
                    <tr>
                      <td style={summaryTitle}>
                        إجمالي الدائن ({baseCurrency})
                      </td>

                      <td style={summaryValue}>
                        {fmt(summary.totalCreditsBaseCurrency)}
                      </td>
                    </tr>
                  )}

                  {summary?.closingBalanceBaseCurrency !== undefined && (
                    <tr>
                      <td
                        style={{
                          ...summaryTitle,
                          fontWeight: 700,
                        }}
                      >
                        الرصيد الختامي ({baseCurrency})
                      </td>

                      <td
                        style={{
                          ...summaryValue,
                          fontWeight: 700,
                        }}
                      >
                        {fmt(summary.closingBalanceBaseCurrency)}
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* ======================================================
            Signature
        ====================================================== */}

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
              توقيع العميل / المورد
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

        {/* ======================================================
            Footer
        ====================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "18px",
            paddingTop: "8px",
            borderTop: "1px solid #e5e7eb",
            fontSize: "8.5px",
            color: "#6b7280",
          }}
        >
          <span>كشف حساب تشغيلي — {partnerName}</span>

          <span>
            العملة: {currency}
            {isForeignCurrency ? ` | الأساسية: ${baseCurrency}` : ""}
          </span>

          <span>عدد السجلات: {items.length}</span>
        </div>
      </div>
    </>
  );
}
