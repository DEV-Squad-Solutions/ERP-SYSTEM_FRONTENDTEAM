// src/features/journalEntries/components/JournalEntriesListPrintTemplate.jsx

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

  return (
    <>
      {/* ===================================================
          Print CSS
      =================================================== */}
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
              max-width: 100% !important;
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
          }
        `}
      </style>

      {/* ===================================================
          Page
      =================================================== */}

      <div
        dir="rtl"
        className="journal-print-page"
        style={{
          width: "100%",
          minHeight: "194mm",
          boxSizing: "border-box",
          padding: 0,
          margin: 0,
          fontFamily: "'Cairo', 'Tajawal', Arial, sans-serif",
          color: "#111827",
          fontSize: "10px",
          lineHeight: 1.45,
          background: "#fff",
        }}
      >
        {/* =================================================
            Header
        ================================================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
            borderBottom: "2px solid #0F6E5E",
            paddingBottom: "7px",
            marginBottom: "9px",
            boxSizing: "border-box",
          }}
        >
          {/* Company */}

          <div
            style={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "17px",
                lineHeight: 1.3,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              {company?.name || "—"}
            </h1>

            <p
              style={{
                margin: "3px 0 0",
                fontSize: "9px",
                color: "#6b7280",
              }}
            >
              تقرير قيود اليومية
            </p>
          </div>

          {/* Print Info */}

          <div
            style={{
              width: "180px",
              flexShrink: 0,
              textAlign: "left",
              fontSize: "9px",
              color: "#4b5563",
            }}
          >
            <p
              style={{
                margin: "1px 0",
              }}
            >
              تاريخ الطباعة:{" "}
              <strong style={{ color: "#111827" }}>{today}</strong>
            </p>

            <p
              style={{
                margin: "1px 0",
              }}
            >
              عدد القيود:{" "}
              <strong style={{ color: "#111827" }}>
                {Number(entries.length).toLocaleString("ar-EG")}
              </strong>
            </p>
          </div>
        </div>

        {/* =================================================
            Filters
        ================================================= */}

        {filters && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px 16px",
              flexWrap: "wrap",
              width: "100%",
              boxSizing: "border-box",
              marginBottom: "9px",
              padding: "5px 8px",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              background: "#f9fafb",
              fontSize: "9px",
              color: "#4b5563",
            }}
          >
            {filters.search && (
              <span>
                البحث:{" "}
                <strong style={{ color: "#111827" }}>{filters.search}</strong>
              </span>
            )}

            {filters.fiscalYearName && (
              <span>
                السنة المالية:{" "}
                <strong style={{ color: "#111827" }}>
                  {filters.fiscalYearName}
                </strong>
              </span>
            )}

            {filters.entryType && (
              <span>
                نوع القيد:{" "}
                <strong style={{ color: "#111827" }}>
                  {getEntryTypeLabel(filters.entryType)}
                </strong>
              </span>
            )}

            {filters.status && (
              <span>
                الحالة:{" "}
                <strong style={{ color: "#111827" }}>
                  {getStatusLabel(filters.status)}
                </strong>
              </span>
            )}

            {filters.fromDate && (
              <span>
                من:{" "}
                <strong style={{ color: "#111827" }}>{filters.fromDate}</strong>
              </span>
            )}

            {filters.toDate && (
              <span>
                إلى:{" "}
                <strong style={{ color: "#111827" }}>{filters.toDate}</strong>
              </span>
            )}

            {!filters.search &&
              !filters.fiscalYearName &&
              !filters.entryType &&
              !filters.status &&
              !filters.fromDate &&
              !filters.toDate && <span>بدون فلاتر</span>}
          </div>
        )}

        {/* =================================================
            Main Table
        ================================================= */}

        <table
          className="journal-print-table"
          style={{
            width: "100%",
            maxWidth: "100%",
            tableLayout: "fixed",
            borderCollapse: "collapse",
            borderSpacing: 0,
            fontSize: "9.5px",
          }}
        >
          {/* Explicit column widths */}

          <colgroup>
            <col style={{ width: "5%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "33%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>

          {/* Table Header */}

          <thead>
            <tr
              style={{
                background: "#f3f4f6",
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
                    border: "1px solid #d1d5db",
                    padding: "5px 4px",
                    textAlign: "center",
                    verticalAlign: "middle",
                    fontWeight: 700,
                    color: "#374151",
                    whiteSpace: "nowrap",
                    boxSizing: "border-box",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}

          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={entry.id ?? index}
                style={{
                  breakInside: "avoid",
                  pageBreakInside: "avoid",
                }}
              >
                {/* # */}

                <td style={cellCenter}>{index + 1}</td>

                {/* Entry Number */}

                <td
                  style={{
                    ...cellCenter,
                    direction: "ltr",
                    fontSize: "9px",
                  }}
                >
                  {entry.entryNumber ||
                    entry.journalEntryNumber ||
                    entry.number ||
                    "—"}
                </td>

                {/* Date */}

                <td
                  style={{
                    ...cellCenter,
                    whiteSpace: "nowrap",
                    fontSize: "9px",
                  }}
                >
                  {entry.entryDate || "—"}
                </td>

                {/* Description */}

                <td
                  className="journal-print-description"
                  style={{
                    ...cellRight,
                    whiteSpace: "normal",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                    lineHeight: 1.5,
                  }}
                >
                  {entry.description || "—"}
                </td>

                {/* Type */}

                <td
                  style={{
                    ...cellCenter,
                    whiteSpace: "nowrap",
                  }}
                >
                  {getEntryTypeLabel(entry.entryType)}
                </td>

                {/* Status */}

                <td
                  style={{
                    ...cellCenter,
                    whiteSpace: "nowrap",
                  }}
                >
                  {getStatusLabel(entry.status)}
                </td>

                {/* Debit */}

                <td
                  style={{
                    ...cellNumber,
                    whiteSpace: "nowrap",
                    direction: "ltr",
                  }}
                >
                  {fmt(entry.totalDebit)}
                </td>

                {/* Credit */}

                <td
                  style={{
                    ...cellNumber,
                    whiteSpace: "nowrap",
                    direction: "ltr",
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
                    padding: "20px",
                    textAlign: "center",
                    color: "#9ca3af",
                  }}
                >
                  لا توجد قيود لعرضها
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* =================================================
            Summary
        ================================================= */}

        {summary && (
          <div
            className="journal-print-summary"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
              marginTop: "12px",
              boxSizing: "border-box",
            }}
          >
            <table
              style={{
                width: "280px",
                maxWidth: "100%",
                borderCollapse: "collapse",
                fontSize: "9.5px",
              }}
            >
              <tbody>
                <tr>
                  <td style={summaryTitle}>إجمالي المدين</td>

                  <td style={summaryValue}>{fmt(summary.totalDebit)}</td>
                </tr>

                <tr>
                  <td style={summaryTitle}>إجمالي الدائن</td>

                  <td style={summaryValue}>{fmt(summary.totalCredit)}</td>
                </tr>

                <tr>
                  <td
                    style={{
                      ...summaryTitle,
                      fontWeight: 700,
                    }}
                  >
                    الفرق
                  </td>

                  <td
                    style={{
                      ...summaryValue,
                      fontWeight: 700,
                      color:
                        Number(summary.difference) === 0
                          ? "#16a34a"
                          : "#dc2626",
                    }}
                  >
                    {fmt(summary.difference)}
                  </td>
                </tr>

                <tr>
                  <td style={summaryTitle}>عدد القيود</td>

                  <td style={summaryValue}>
                    {Number(summary.count ?? 0).toLocaleString("ar-EG")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* =================================================
            Signature
        ================================================= */}

        <div
          className="journal-print-signature"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
            marginTop: "20px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "150px",
              textAlign: "center",
              fontSize: "9.5px",
            }}
          >
            <div
              style={{
                borderTop: "1px solid #111827",
                paddingTop: "5px",
              }}
            >
              توقيع المسؤول
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// =========================================================
// Table Cell Styles
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
  padding: "6px 8px",
  textAlign: "right",
  fontWeight: 700,
  width: "60%",
  boxSizing: "border-box",
};

const summaryValue = {
  border: "1px solid #e5e7eb",
  padding: "6px 8px",
  textAlign: "center",
  fontWeight: 600,
  width: "40%",
  boxSizing: "border-box",
};
