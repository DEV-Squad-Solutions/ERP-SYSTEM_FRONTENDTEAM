import { useSelector } from "react-redux";

// =========================================================
// Constants
// =========================================================

const ENTRY_TYPE_LABELS = {
  Manual: "يدوي",
  Adjustment: "تسوية",
  Opening: "افتتاحي",
  Automatic: "تلقائي",
};

const STATUS_LABELS = {
  Posted: "مرحّل",
  Reversed: "معكوس",
};

// =========================================================
// Helpers
// =========================================================

const fmt = (value) =>
  Number(value ?? 0).toLocaleString("ar-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getEntryTypeLabel = (type) => {
  if (typeof type === "number") {
    return (
      {
        1: "يدوي",
        2: "تسوية",
        3: "افتتاحي",
        4: "تلقائي",
      }[type] ?? type
    );
  }

  return ENTRY_TYPE_LABELS[type] ?? type ?? "—";
};

const getStatusLabel = (status) => {
  if (typeof status === "number") {
    return (
      {
        1: "مرحّل",
        2: "معكوس",
      }[status] ?? status
    );
  }

  return STATUS_LABELS[status] ?? status ?? "—";
};

// =========================================================
// Component
// =========================================================

export default function JournalEntriesListPrintTemplate({
  entries = [],
  filters,
  summary,
}) {
  const company = useSelector((state) => state.auth.selectedCompany);

  const today = new Date().toLocaleDateString("ar-EG");

  const totalDebit = Number(summary?.totalDebit ?? 0);
  const totalCredit = Number(summary?.totalCredit ?? 0);
  const difference = Number(summary?.difference ?? totalDebit - totalCredit);

  return (
    <>
      <style>
        {`
          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          @media print {
            html,
            body {
              width: 100%;
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .journal-print-page {
              width: 100% !important;
              min-height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box !important;
            }

            .journal-print-table {
              width: 100% !important;
              table-layout: fixed !important;
              border-collapse: collapse !important;
            }

            .journal-print-table thead {
              display: table-header-group;
            }

            .journal-print-table tfoot {
              display: table-footer-group;
            }

            .journal-print-table tr {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .journal-print-summary {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .journal-print-signature {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .journal-print-description {
              overflow-wrap: anywhere !important;
              word-break: break-word !important;
              white-space: normal !important;
            }

            .journal-print-filter {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      <div
        dir="rtl"
        className="journal-print-page"
        style={{
          width: "100%",
          minHeight: "194mm",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
          fontFamily: "'Cairo', 'Tajawal', Arial, sans-serif",
          color: "#172033",
          background: "#fff",
          fontSize: "10px",
          lineHeight: 1.5,
        }}
      >
        {/* =====================================================
            Header
        ===================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "stretch",
            width: "100%",
            minHeight: "58px",
            marginBottom: "10px",
            paddingBottom: "9px",
            borderBottom: "2px solid #0F6E5E",
            boxSizing: "border-box",
          }}
        >
          {/* Company */}

          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: "19px",
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.2,
              }}
            >
              {company?.name || "—"}
            </div>

            <div
              style={{
                marginTop: "4px",
                fontSize: "9px",
                color: "#6b7280",
              }}
            >
              نظام الإدارة والمحاسبة
            </div>
          </div>

          {/* Report Title */}

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  color: "#0F6E5E",
                  lineHeight: 1.2,
                }}
              >
                تقرير قيود اليومية
              </div>

              <div
                style={{
                  marginTop: "3px",
                  fontSize: "8.5px",
                  color: "#6b7280",
                }}
              >
                Journal Entries Report
              </div>
            </div>
          </div>

          {/* Print Info */}

          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <div
              style={{
                minWidth: "175px",
                padding: "7px 10px",
                border: "1px solid #e5e7eb",
                borderRadius: "5px",
                background: "#f9fafb",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "3px",
                  fontSize: "8.5px",
                }}
              >
                <span style={{ color: "#6b7280" }}>تاريخ الطباعة</span>

                <strong style={{ color: "#111827" }}>{today}</strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  fontSize: "8.5px",
                }}
              >
                <span style={{ color: "#6b7280" }}>عدد القيود</span>

                <strong style={{ color: "#111827" }}>
                  {Number(entries.length).toLocaleString("ar-EG")}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            Filters
        ===================================================== */}

        {filters && (
          <div
            className="journal-print-filter"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              width: "100%",
              minHeight: "30px",
              marginBottom: "10px",
              padding: "6px 9px",
              border: "1px solid #e5e7eb",
              borderRadius: "5px",
              background: "#fafafa",
              boxSizing: "border-box",
              fontSize: "8.5px",
            }}
          >
            <div
              style={{
                fontWeight: 800,
                color: "#0F6E5E",
                paddingLeft: "7px",
                borderLeft: "1px solid #d1d5db",
                whiteSpace: "nowrap",
              }}
            >
              معايير التقرير
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "5px 15px",
                color: "#4b5563",
              }}
            >
              {filters.search && (
                <FilterItem label="البحث" value={filters.search} />
              )}

              {filters.fiscalYearName && (
                <FilterItem
                  label="السنة المالية"
                  value={filters.fiscalYearName}
                />
              )}

              {filters.entryType && (
                <FilterItem
                  label="نوع القيد"
                  value={getEntryTypeLabel(filters.entryType)}
                />
              )}

              {filters.status && (
                <FilterItem
                  label="الحالة"
                  value={getStatusLabel(filters.status)}
                />
              )}

              {filters.fromDate && (
                <FilterItem label="من" value={filters.fromDate} />
              )}

              {filters.toDate && (
                <FilterItem label="إلى" value={filters.toDate} />
              )}

              {!filters.search &&
                !filters.fiscalYearName &&
                !filters.entryType &&
                !filters.status &&
                !filters.fromDate &&
                !filters.toDate && (
                  <span style={{ color: "#9ca3af" }}>بدون فلاتر</span>
                )}
            </div>
          </div>
        )}

        {/* =====================================================
            Main Table
        ===================================================== */}

        <table
          className="journal-print-table"
          style={{
            width: "100%",
            tableLayout: "fixed",
            borderCollapse: "collapse",
            borderSpacing: 0,
            fontSize: "9px",
          }}
        >
          <colgroup>
            <col style={{ width: "4%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "34%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>

          <thead>
            <tr
              style={{
                background: "#0F6E5E",
                color: "#fff",
              }}
            >
              {[
                "#",
                "رقم القيد",
                "التاريخ",
                "البيان",
                "النوع",
                "الحالة",
                "مدين",
                "دائن",
              ].map((header) => (
                <th
                  key={header}
                  style={{
                    border: "1px solid #0F6E5E",
                    padding: "6px 4px",
                    textAlign: "center",
                    verticalAlign: "middle",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    boxSizing: "border-box",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={entry.id ?? index}
                style={{
                  breakInside: "avoid",
                  pageBreakInside: "avoid",
                  background: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                }}
              >
                <td style={cellCenter}>{index + 1}</td>

                <td
                  style={{
                    ...cellCenter,
                    direction: "ltr",
                    fontSize: "8.5px",
                    fontWeight: 600,
                  }}
                >
                  {entry.entryNumber ||
                    entry.journalEntryNumber ||
                    entry.number ||
                    "—"}
                </td>

                <td
                  style={{
                    ...cellCenter,
                    whiteSpace: "nowrap",
                    fontSize: "8.5px",
                  }}
                >
                  {entry.entryDate || "—"}
                </td>

                <td
                  className="journal-print-description"
                  style={{
                    ...cellRight,
                    whiteSpace: "normal",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                    lineHeight: 1.45,
                  }}
                >
                  {entry.description || "—"}
                </td>

                <td
                  style={{
                    ...cellCenter,
                    whiteSpace: "nowrap",
                  }}
                >
                  {getEntryTypeLabel(entry.entryType)}
                </td>

                <td
                  style={{
                    ...cellCenter,
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 7px",
                      borderRadius: "10px",
                      fontSize: "8px",
                      fontWeight: 700,
                      background:
                        getStatusLabel(entry.status) === "مرحّل"
                          ? "#ecfdf5"
                          : "#fef2f2",
                      color:
                        getStatusLabel(entry.status) === "مرحّل"
                          ? "#047857"
                          : "#b91c1c",
                    }}
                  >
                    {getStatusLabel(entry.status)}
                  </span>
                </td>

                <td
                  style={{
                    ...cellNumber,
                    direction: "ltr",
                    whiteSpace: "nowrap",
                    fontWeight: 600,
                  }}
                >
                  {fmt(entry.totalDebit)}
                </td>

                <td
                  style={{
                    ...cellNumber,
                    direction: "ltr",
                    whiteSpace: "nowrap",
                    fontWeight: 600,
                  }}
                >
                  {fmt(entry.totalCredit)}
                </td>
              </tr>
            ))}

            {entries.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    border: "1px solid #e5e7eb",
                    padding: "25px",
                    textAlign: "center",
                    color: "#9ca3af",
                  }}
                >
                  لا توجد قيود لعرضها
                </td>
              </tr>
            )}
          </tbody>

          {/* =================================================
              Table Footer
          ================================================= */}

          {summary && (
            <tfoot>
              <tr
                style={{
                  background: "#f3f4f6",
                  fontWeight: 700,
                }}
              >
                <td
                  colSpan={6}
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "6px",
                    textAlign: "right",
                    color: "#374151",
                  }}
                >
                  إجمالي التقرير
                </td>

                <td
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "6px",
                    textAlign: "center",
                    direction: "ltr",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fmt(totalDebit)}
                </td>

                <td
                  style={{
                    border: "1px solid #d1d5db",
                    padding: "6px",
                    textAlign: "center",
                    direction: "ltr",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fmt(totalCredit)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>

        {/* =====================================================
            Bottom Section
        ===================================================== */}

        {summary && (
          <div
            className="journal-print-summary"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "20px",
              width: "100%",
              marginTop: "10px",
            }}
          >
            {/* Balance Status */}

            <div
              style={{
                flex: 1,
                minHeight: "65px",
                padding: "8px 10px",
                border: "1px solid #e5e7eb",
                borderRadius: "5px",
                background: difference === 0 ? "#f0fdf4" : "#fef2f2",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  fontSize: "8px",
                  color: "#6b7280",
                  marginBottom: "3px",
                }}
              >
                حالة التوازن المحاسبي
              </div>

              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  color: difference === 0 ? "#15803d" : "#b91c1c",
                }}
              >
                {difference === 0 ? "القيد متوازن ✓" : "يوجد فرق في الأرصدة"}
              </div>

              <div
                style={{
                  marginTop: "2px",
                  fontSize: "8px",
                  color: "#6b7280",
                }}
              >
                الفرق:{" "}
                <strong
                  style={{
                    direction: "ltr",
                    display: "inline-block",
                  }}
                >
                  {fmt(difference)}
                </strong>
              </div>
            </div>

            {/* Summary */}

            <table
              style={{
                width: "290px",
                borderCollapse: "collapse",
                fontSize: "9px",
              }}
            >
              <tbody>
                <tr>
                  <td style={summaryTitle}>إجمالي المدين</td>

                  <td style={summaryValue}>{fmt(totalDebit)}</td>
                </tr>

                <tr>
                  <td style={summaryTitle}>إجمالي الدائن</td>

                  <td style={summaryValue}>{fmt(totalCredit)}</td>
                </tr>

                <tr>
                  <td
                    style={{
                      ...summaryTitle,
                      fontWeight: 800,
                    }}
                  >
                    الفرق
                  </td>

                  <td
                    style={{
                      ...summaryValue,
                      fontWeight: 800,
                      color: difference === 0 ? "#15803d" : "#b91c1c",
                    }}
                  >
                    {fmt(difference)}
                  </td>
                </tr>

                <tr>
                  <td style={summaryTitle}>عدد القيود</td>

                  <td style={summaryValue}>
                    {Number(summary.count ?? entries.length).toLocaleString(
                      "ar-EG",
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* =====================================================
            Signature
        ===================================================== */}

        <div
          className="journal-print-signature"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
            marginTop: "24px",
            paddingTop: "8px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              width: "160px",
              textAlign: "center",
              fontSize: "8.5px",
              color: "#4b5563",
            }}
          >
            <div
              style={{
                height: "22px",
                borderBottom: "1px solid #9ca3af",
                marginBottom: "4px",
              }}
            />
            توقيع المراجع
          </div>

          <div
            style={{
              textAlign: "center",
              fontSize: "8px",
              color: "#9ca3af",
            }}
          >
            تم استخراج التقرير بتاريخ {today}
          </div>

          <div
            style={{
              width: "160px",
              textAlign: "center",
              fontSize: "8.5px",
              color: "#4b5563",
            }}
          >
            <div
              style={{
                height: "22px",
                borderBottom: "1px solid #9ca3af",
                marginBottom: "4px",
              }}
            />
            توقيع المسؤول
          </div>
        </div>
      </div>
    </>
  );
}

// =========================================================
// Filter Item
// =========================================================

function FilterItem({ label, value }) {
  return (
    <span style={{ whiteSpace: "nowrap" }}>
      <span style={{ color: "#6b7280" }}>{label}:</span>{" "}
      <strong style={{ color: "#111827" }}>{value}</strong>
    </span>
  );
}

// =========================================================
// Table Styles
// =========================================================

const cellCenter = {
  border: "1px solid #e5e7eb",
  padding: "4px",
  textAlign: "center",
  verticalAlign: "middle",
  boxSizing: "border-box",
};

const cellRight = {
  border: "1px solid #e5e7eb",
  padding: "4px 6px",
  textAlign: "right",
  verticalAlign: "middle",
  boxSizing: "border-box",
};

const cellNumber = {
  border: "1px solid #e5e7eb",
  padding: "4px",
  textAlign: "center",
  verticalAlign: "middle",
  fontVariantNumeric: "tabular-nums",
  boxSizing: "border-box",
};

const summaryTitle = {
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
  padding: "5px 8px",
  textAlign: "right",
  fontWeight: 600,
  width: "60%",
  boxSizing: "border-box",
};

const summaryValue = {
  border: "1px solid #e5e7eb",
  padding: "5px 8px",
  textAlign: "center",
  fontWeight: 600,
  width: "40%",
  direction: "ltr",
  boxSizing: "border-box",
};
