import { useSelector } from "react-redux";

const fmt = (value) => Number(value || 0).toLocaleString("ar-EG", { maximumFractionDigits: 2 });

export default function CashboxLedgerPrintTemplate({
  cashbox,
  items = [],
  fromDate,
  toDate,
}) {
  const company = useSelector((state) => state.auth.selectedCompany);

  let balance = 0;

  const rows = items.map((item) => {
    const debit = item.direction === "Payment" ? item.amount : 0;

    const credit = item.direction === "Receipt" ? item.amount : 0;

    balance += credit - debit;

    return {
      ...item,
      debit,
      credit,
      balance,
    };
  });

  return (
    <div
      dir="rtl"
      style={{
        width: "297mm",
        minHeight: "210mm",
        padding: "12mm",
        boxSizing: "border-box",
        fontFamily: "Cairo, Tajawal, sans-serif",
        color: "#0A2540",
        fontSize: "11px",
      }}
    >
      {/* Header */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "2px solid #0C4A3E",
          paddingBottom: "10px",
          marginBottom: "15px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            {company?.name || "—"}
          </h1>

          <p>كشف حركة خزنة</p>

          <p>الخزنة: {cashbox?.name || "—"}</p>
        </div>

        <div
          style={{
            textAlign: "left",
            fontSize: "10px",
          }}
        >
          <p>تاريخ الطباعة: {new Date().toLocaleDateString("ar-EG")}</p>

          {fromDate && <p>من: {fromDate}</p>}

          {toDate && <p>إلى: {toDate}</p>}
        </div>
      </div>

      {/* Table */}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr
            style={{
              background: "#EFF2F0",
            }}
          >
            {[
              "التاريخ",
              "رقم السند",
              "مدين",
              "دائن",
              "الرصيد",
              "البيان",
              "الملاحظات",
            ].map((h) => (
              <th key={h} style={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <td style={tdCenter}>{item.voucherDate}</td>

              <td style={tdCenter}>{item.voucherNumber || "—"}</td>

              <td
                style={{
                  ...tdCenter,
                  color: "#C0392B",
                }}
              >
                {item.debit > 0 ? fmt(item.debit) : "—"}
              </td>

              <td
                style={{
                  ...tdCenter,
                  color: "#059669",
                }}
              >
                {item.credit > 0 ? fmt(item.credit) : "—"}
              </td>

              <td style={tdCenter}>{fmt(item.balance)}</td>

              <td style={tdRight}>
                <strong>{item.cashMovementTypeName}</strong>

                {item.businessPartnerName && (
                  <div>{item.businessPartnerName}</div>
                )}

                {item.description && <small>{item.description}</small>}
              </td>

              <td style={tdRight}>{item.notes || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}

      <div
        style={{
          marginTop: "25px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            width: "180px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              borderTop: "1px solid #0A2540",
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

const th = {
  border: "1px solid #C9D2CD",
  padding: "6px",
  textAlign: "center",
  fontWeight: 700,
};

const tdCenter = {
  border: "1px solid #E2E7E4",
  padding: "6px",
  textAlign: "center",
};

const tdRight = {
  border: "1px solid #E2E7E4",
  padding: "6px",
  textAlign: "right",
};
