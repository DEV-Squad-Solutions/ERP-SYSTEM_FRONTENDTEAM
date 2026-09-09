import React from "react";

const formatNumber = (value, maximumFractionDigits = 2) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("ar-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(number);
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const formatDateTime = (value = new Date()) => {
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
};

const getMovementLabel = (movementName) => {
  return movementName || "-";
};

function InfoBox({ label, value, highlight = false }) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "7px 10px",
        background: highlight ? "#f8fafc" : "#ffffff",
        minHeight: "47px",
      }}
    >
      <div
        style={{
          fontSize: "8px",
          color: "#64748b",
          marginBottom: "3px",
          fontWeight: 700,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "#0f172a",
          fontWeight: 800,
          lineHeight: 1.25,
          overflowWrap: "anywhere",
        }}
      >
        {value || "-"}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  amount,
  description,
  currency,
  baseAmount,
  baseCurrency,
}) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "9px",
        padding: "9px 11px",
        background: "#ffffff",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: "8px",
          color: "#64748b",
          fontWeight: 800,
          marginBottom: "4px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "16px",
          fontWeight: 900,
          color: "#0f172a",
          lineHeight: 1.15,
        }}
      >
        {formatNumber(amount)}{" "}
        <span
          style={{
            fontSize: "9px",
            color: "#64748b",
            fontWeight: 800,
          }}
        >
          {currency}
        </span>
      </div>

      <div
        style={{
          marginTop: "4px",
          fontSize: "8px",
          color: "#475569",
          fontWeight: 700,
          lineHeight: 1.3,
        }}
      >
        {description || "-"}
      </div>

      {baseCurrency && baseCurrency !== currency && (
        <div
          style={{
            marginTop: "5px",
            paddingTop: "4px",
            borderTop: "1px dashed #e2e8f0",
            fontSize: "7.5px",
            color: "#64748b",
          }}
        >
          العملة الأساسية:{" "}
          <strong style={{ color: "#334155" }}>
            {formatNumber(baseAmount)} {baseCurrency}
          </strong>
        </div>
      )}
    </div>
  );
}

function AmountCell({
  amount,
  currency,
  baseAmount,
  baseCurrency,
  strong = false,
}) {
  const numericAmount = Number(amount || 0);

  return (
    <div
      style={{
        textAlign: "left",
        direction: "ltr",
        fontWeight: strong && numericAmount > 0 ? 800 : 500,
        whiteSpace: "nowrap",
      }}
    >
      {numericAmount > 0 ? (
        <>
          {formatNumber(numericAmount)}{" "}
          <span
            style={{
              fontSize: "7px",
              color: "#64748b",
              fontWeight: 700,
            }}
          >
            {currency}
          </span>
        </>
      ) : (
        "—"
      )}

      {baseCurrency !== currency && Number(baseAmount || 0) > 0 && (
        <div
          style={{
            marginTop: "2px",
            fontSize: "7px",
            color: "#94a3b8",
            fontWeight: 500,
          }}
        >
          {formatNumber(baseAmount)} {baseCurrency}
        </div>
      )}
    </div>
  );
}

export default function PartnerStatementPrintTemplate({
  partner,
  data,
  filters = {},
}) {
  const items = Array.isArray(data?.items) ? data.items : [];

  const summary = data?.summary || {};

  const partnerName =
    data?.businessPartnerName ||
    partner?.name ||
    partner?.Name ||
    partner?.businessPartnerName ||
    "العميل / المورد";

  const currency = data?.currency || partner?.currency || "EGP";

  const baseCurrency = data?.baseCurrency || "EGP";

  const businessPartnerId =
    data?.businessPartnerId || partner?.id || partner?.Id || "-";

  const openingBalance = Number(summary?.openingBalanceAmount || 0);

  const closingBalance = Number(summary?.closingBalanceAmount || 0);

  const baseOpeningBalance = Number(summary?.baseOpeningBalanceAmount || 0);

  const baseClosingBalance = Number(summary?.baseClosingBalanceAmount || 0);

  const totalDebit = items.reduce(
    (sum, item) => sum + Number(item?.debitAmount || 0),
    0,
  );

  const totalCredit = items.reduce(
    (sum, item) => sum + Number(item?.creditAmount || 0),
    0,
  );

  const totalBaseDebit = items.reduce(
    (sum, item) => sum + Number(item?.baseDebitAmount || 0),
    0,
  );

  const totalBaseCredit = items.reduce(
    (sum, item) => sum + Number(item?.baseCreditAmount || 0),
    0,
  );

  const hasDateFilter = Boolean(filters?.FromDate) || Boolean(filters?.ToDate);

  const hasOtherFilters =
    Boolean(filters?.Search) ||
    Boolean(filters?.SourceType) ||
    Boolean(filters?.MovementType) ||
    Boolean(filters?.CashMovementTypeId) ||
    Boolean(filters?.Classification);

  return (
    <div
      className="print-page"
      style={{
        width: "100%",
        minHeight: "100%",
        margin: 0,
        padding: 10,
        background: "#ffffff",
        color: "#0f172a",
        direction: "rtl",
        fontFamily: '"Tajawal", "Cairo", Arial, sans-serif',
        fontSize: "10px",
        lineHeight: 1.35,
      }}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          paddingBottom: "8px",
          marginBottom: "9px",
          borderBottom: "2px solid #0f172a",
        }}
      >
        <div
          style={{
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: "20px",
              lineHeight: 1.1,
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: "-0.3px",
            }}
          >
            كشف حساب
          </div>

          <div
            style={{
              marginTop: "3px",
              fontSize: "9px",
              color: "#64748b",
              fontWeight: 700,
            }}
          >
            كشف حساب تشغيلي للعميل / المورد
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto auto",
            gap: "4px 14px",
            textAlign: "left",
            fontSize: "8px",
            color: "#64748b",
            whiteSpace: "nowrap",
          }}
        >
          <span>تاريخ الطباعة</span>

          <strong style={{ color: "#0f172a" }}>{formatDateTime()}</strong>

          <span>عدد الحركات</span>

          <strong style={{ color: "#0f172a" }}>{items.length}</strong>
        </div>
      </div>

      {/* =====================================================
          PARTNER INFO
      ====================================================== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2.2fr 0.9fr 0.9fr 0.9fr",
          gap: "6px",
          marginBottom: "8px",
        }}
      >
        <InfoBox label="العميل / المورد" value={partnerName} highlight />

        <InfoBox label="عملة الحساب" value={currency} />

        <InfoBox label="العملة الأساسية" value={baseCurrency} />

        <InfoBox label="رقم الحساب" value={businessPartnerId} />
      </div>

      {/* =====================================================
          FILTERS
      ====================================================== */}
      {(hasDateFilter || hasOtherFilters) && (
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "6px 9px",
            marginBottom: "8px",
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              fontSize: "8px",
              fontWeight: 900,
              color: "#334155",
              marginBottom: "4px",
            }}
          >
            معايير الكشف
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "3px 16px",
              fontSize: "8px",
              color: "#64748b",
            }}
          >
            {filters?.FromDate && (
              <span>
                من:{" "}
                <strong style={{ color: "#334155" }}>
                  {formatDate(filters.FromDate)}
                </strong>
              </span>
            )}

            {filters?.ToDate && (
              <span>
                إلى:{" "}
                <strong style={{ color: "#334155" }}>
                  {formatDate(filters.ToDate)}
                </strong>
              </span>
            )}

            {filters?.Search && (
              <span>
                بحث:{" "}
                <strong style={{ color: "#334155" }}>{filters.Search}</strong>
              </span>
            )}

            {filters?.SourceType && (
              <span>
                مصدر الحركة:{" "}
                <strong style={{ color: "#334155" }}>
                  {filters.SourceType}
                </strong>
              </span>
            )}

            {filters?.MovementType && (
              <span>
                نوع الحركة:{" "}
                <strong style={{ color: "#334155" }}>
                  {filters.MovementType}
                </strong>
              </span>
            )}

            {filters?.CashMovementTypeId && (
              <span>
                نوع السند:{" "}
                <strong style={{ color: "#334155" }}>
                  {filters.CashMovementTypeId}
                </strong>
              </span>
            )}

            {filters?.Classification && (
              <span>
                التصنيف:{" "}
                <strong style={{ color: "#334155" }}>
                  {filters.Classification}
                </strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          BALANCE SUMMARY
      ====================================================== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "7px",
          marginBottom: "9px",
        }}
      >
        <SummaryCard
          title="رصيد أول المدة"
          amount={openingBalance}
          description={summary?.openingBalanceDescription}
          currency={currency}
          baseAmount={baseOpeningBalance}
          baseCurrency={baseCurrency}
        />

        <SummaryCard
          title="رصيد آخر المدة"
          amount={closingBalance}
          description={summary?.closingBalanceDescription}
          currency={currency}
          baseAmount={baseClosingBalance}
          baseCurrency={baseCurrency}
        />
      </div>

      {/* =====================================================
          STATEMENT TABLE
      ====================================================== */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
          margin: 0,
        }}
      >
        <thead>
          <tr>
            <th
              style={headerStyle({
                width: "3.5%",
              })}
            >
              #
            </th>

            <th
              style={headerStyle({
                width: "8%",
              })}
            >
              التاريخ
            </th>

            <th
              style={headerStyle({
                width: "10%",
              })}
            >
              المستند
            </th>

            <th
              style={headerStyle({
                width: "17%",
              })}
            >
              الحركة
            </th>

            <th
              style={headerStyle({
                width: "21%",
              })}
            >
              البيان
            </th>

            <th
              style={headerStyle({
                width: "9%",
              })}
            >
              سعر الصرف
            </th>

            <th
              style={headerStyle({
                width: "10.5%",
              })}
            >
              عليه
            </th>

            <th
              style={headerStyle({
                width: "10.5%",
              })}
            >
              له
            </th>

            <th
              style={headerStyle({
                width: "10%",
              })}
            >
              الرصيد
            </th>
          </tr>
        </thead>

        <tbody>
          {/* Opening Balance */}
          <tr
            style={{
              background: "#f8fafc",
              pageBreakInside: "avoid",
            }}
          >
            <td
              style={cellStyle({
                textAlign: "center",
                fontWeight: 700,
              })}
            >
              —
            </td>

            <td style={cellStyle()}>—</td>

            <td style={cellStyle()}>—</td>

            <td
              style={cellStyle({
                fontWeight: 900,
              })}
            >
              رصيد أول المدة
            </td>

            <td style={cellStyle()}>
              {summary?.openingBalanceDescription || "-"}
            </td>

            <td
              style={cellStyle({
                textAlign: "center",
              })}
            >
              —
            </td>

            <td
              style={cellStyle({
                textAlign: "left",
              })}
            >
              —
            </td>

            <td
              style={cellStyle({
                textAlign: "left",
              })}
            >
              —
            </td>

            <td
              style={cellStyle({
                textAlign: "left",
                fontWeight: 900,
              })}
            >
              {formatNumber(openingBalance)}{" "}
              <span
                style={{
                  fontSize: "7px",
                  color: "#64748b",
                }}
              >
                {currency}
              </span>
            </td>
          </tr>

          {/* Movements */}
          {items.map((item, index) => {
            const debit = Number(item?.debitAmount || 0);

            const credit = Number(item?.creditAmount || 0);

            const balance = Number(item?.balanceAmount || 0);

            return (
              <tr
                key={`${item?.documentNumber || "row"}-${index}`}
                style={{
                  pageBreakInside: "avoid",
                }}
              >
                <td
                  style={cellStyle({
                    textAlign: "center",
                    color: "#64748b",
                  })}
                >
                  {index + 1}
                </td>

                <td style={cellStyle()}>{formatDate(item?.date)}</td>

                <td
                  style={cellStyle({
                    fontWeight: 800,
                  })}
                >
                  {item?.documentNumber || "-"}
                </td>

                <td
                  style={cellStyle({
                    fontWeight: 800,
                  })}
                >
                  {getMovementLabel(item?.movementName)}
                </td>

                <td style={cellStyle()}>
                  <div
                    style={{
                      lineHeight: 1.35,
                    }}
                  >
                    {item?.description || "-"}
                  </div>

                  {item?.referenceNumber && (
                    <div
                      style={{
                        marginTop: "2px",
                        fontSize: "7px",
                        color: "#94a3b8",
                      }}
                    >
                      مرجع: {item.referenceNumber}
                    </div>
                  )}
                </td>

                <td
                  style={cellStyle({
                    textAlign: "center",
                  })}
                >
                  {item?.exchangeRate
                    ? formatNumber(item.exchangeRate, 4)
                    : "—"}
                </td>

                <td
                  style={cellStyle({
                    paddingLeft: "7px",
                  })}
                >
                  <AmountCell
                    amount={debit}
                    currency={currency}
                    baseAmount={item?.baseDebitAmount}
                    baseCurrency={baseCurrency}
                    strong
                  />
                </td>

                <td
                  style={cellStyle({
                    paddingLeft: "7px",
                  })}
                >
                  <AmountCell
                    amount={credit}
                    currency={currency}
                    baseAmount={item?.baseCreditAmount}
                    baseCurrency={baseCurrency}
                    strong
                  />
                </td>

                <td
                  style={cellStyle({
                    textAlign: "left",
                    fontWeight: 900,
                  })}
                >
                  <div
                    style={{
                      direction: "ltr",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatNumber(balance)}{" "}
                    <span
                      style={{
                        fontSize: "7px",
                        color: "#64748b",
                      }}
                    >
                      {currency}
                    </span>
                  </div>

                  {item?.balanceDescription && (
                    <div
                      style={{
                        marginTop: "2px",
                        fontSize: "7px",
                        color: "#64748b",
                        fontWeight: 700,
                      }}
                    >
                      {item.balanceDescription}
                    </div>
                  )}

                  {baseCurrency !== currency &&
                    Number(item?.baseBalanceAmount || 0) > 0 && (
                      <div
                        style={{
                          marginTop: "2px",
                          fontSize: "6.5px",
                          color: "#94a3b8",
                          direction: "ltr",
                        }}
                      >
                        {formatNumber(item.baseBalanceAmount)} {baseCurrency}
                      </div>
                    )}
                </td>
              </tr>
            );
          })}

          {/* Empty */}
          {items.length === 0 && (
            <tr>
              <td
                colSpan={9}
                style={{
                  padding: "18px 8px",
                  textAlign: "center",
                  border: "1px solid #e2e8f0",
                  color: "#64748b",
                  fontSize: "9px",
                  background: "#fafafa",
                }}
              >
                لا توجد حركات مطابقة لمعايير البحث
              </td>
            </tr>
          )}
        </tbody>

        <tfoot>
          <tr>
            <td
              colSpan={6}
              style={{
                padding: "7px 6px",
                borderTop: "2px solid #0f172a",
                background: "#f1f5f9",
                fontWeight: 900,
                fontSize: "9px",
              }}
            >
              إجمالي الحركات
            </td>

            <td
              style={{
                padding: "7px 6px",
                borderTop: "2px solid #0f172a",
                background: "#f1f5f9",
                textAlign: "left",
                fontWeight: 900,
                fontSize: "9px",
              }}
            >
              <AmountCell
                amount={totalDebit}
                currency={currency}
                baseAmount={totalBaseDebit}
                baseCurrency={baseCurrency}
                strong
              />
            </td>

            <td
              style={{
                padding: "7px 6px",
                borderTop: "2px solid #0f172a",
                background: "#f1f5f9",
                textAlign: "left",
                fontWeight: 900,
                fontSize: "9px",
              }}
            >
              <AmountCell
                amount={totalCredit}
                currency={currency}
                baseAmount={totalBaseCredit}
                baseCurrency={baseCurrency}
                strong
              />
            </td>

            <td
              style={{
                padding: "7px 6px",
                borderTop: "2px solid #0f172a",
                background: "#f1f5f9",
                textAlign: "left",
                fontWeight: 900,
                fontSize: "9px",
                whiteSpace: "nowrap",
              }}
            >
              {formatNumber(closingBalance)}{" "}
              <span
                style={{
                  fontSize: "7px",
                  color: "#64748b",
                }}
              >
                {currency}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>

      {/* =====================================================
          FINAL SUMMARY
      ====================================================== */}
      <div
        style={{
          marginTop: "9px",
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr",
          gap: "7px",
        }}
      >
        <div
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: "9px",
            padding: "9px 11px",
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              fontSize: "8px",
              color: "#64748b",
              fontWeight: 800,
              marginBottom: "3px",
            }}
          >
            الرصيد النهائي
          </div>

          <div
            style={{
              fontSize: "17px",
              fontWeight: 900,
              color: "#0f172a",
              lineHeight: 1.1,
            }}
          >
            {formatNumber(closingBalance)}{" "}
            <span
              style={{
                fontSize: "9px",
                color: "#64748b",
              }}
            >
              {currency}
            </span>
          </div>

          <div
            style={{
              marginTop: "3px",
              fontSize: "8px",
              color: "#475569",
              fontWeight: 700,
            }}
          >
            {summary?.closingBalanceDescription || "-"}
          </div>

          {baseCurrency !== currency && (
            <div
              style={{
                marginTop: "4px",
                paddingTop: "4px",
                borderTop: "1px dashed #cbd5e1",
                fontSize: "7px",
                color: "#64748b",
              }}
            >
              بالعملة الأساسية:{" "}
              <strong style={{ color: "#334155" }}>
                {formatNumber(baseClosingBalance)} {baseCurrency}
              </strong>
            </div>
          )}
        </div>

        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "9px",
            padding: "9px 11px",
          }}
        >
          <div
            style={{
              fontSize: "8px",
              color: "#64748b",
              fontWeight: 800,
              marginBottom: "3px",
            }}
          >
            إجمالي عليه
          </div>

          <div
            style={{
              fontSize: "15px",
              fontWeight: 900,
              color: "#0f172a",
            }}
          >
            {formatNumber(totalDebit)}{" "}
            <span
              style={{
                fontSize: "8px",
                color: "#64748b",
              }}
            >
              {currency}
            </span>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "9px",
            padding: "9px 11px",
          }}
        >
          <div
            style={{
              fontSize: "8px",
              color: "#64748b",
              fontWeight: 800,
              marginBottom: "3px",
            }}
          >
            إجمالي له
          </div>

          <div
            style={{
              fontSize: "15px",
              fontWeight: 900,
              color: "#0f172a",
            }}
          >
            {formatNumber(totalCredit)}{" "}
            <span
              style={{
                fontSize: "8px",
                color: "#64748b",
              }}
            >
              {currency}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <div
        style={{
          marginTop: "10px",
          paddingTop: "6px",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          fontSize: "7px",
          color: "#94a3b8",
        }}
      >
        <span>كشف حساب تشغيلي — {partnerName}</span>

        <span>
          {currency}
          {baseCurrency !== currency ? ` / ${baseCurrency}` : ""}
        </span>

        <span>إجمالي السجلات: {items.length}</span>
      </div>
    </div>
  );
}

const headerStyle = ({ width }) => ({
  width,
  padding: "6px 5px",
  background: "#0f172a",
  color: "#ffffff",
  border: "1px solid #0f172a",
  fontSize: "8px",
  fontWeight: 900,
  textAlign: "center",
  whiteSpace: "nowrap",
  lineHeight: 1.2,
});

const cellStyle = ({
  textAlign = "right",
  fontWeight = 500,
  color = "#0f172a",
} = {}) => ({
  padding: "5px 5px",
  border: "1px solid #e2e8f0",
  fontSize: "8px",
  lineHeight: 1.35,
  verticalAlign: "middle",
  textAlign,
  fontWeight,
  color,
  wordBreak: "break-word",
  overflowWrap: "anywhere",
});
