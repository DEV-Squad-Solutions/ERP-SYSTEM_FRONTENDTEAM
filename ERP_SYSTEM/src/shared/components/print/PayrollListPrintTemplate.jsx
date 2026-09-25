import { useSelector } from "react-redux";
import { EMPLOYEE_TYPE } from "../../../features/payroll/payroll.constants";

const fmt = (v) => Number(v || 0).toLocaleString("ar-EG");

// بعض السجلات لسه calculatedSalary فيها صفر لو اتحسبت لاحقًا
const netOf = (row) => Number(row.netSalary || row.calculatedSalary || 0);

const isRowMoved = (row) =>
  Boolean(
    row?.isSalaryMoveToEmployeeAccount ?? row?.isSalaryMovedToEmployeeAccount,
  );

const COLUMNS = [
  "الموظف",
  "الكود",
  "النوع",
  "مكان العمل",
  "الفترة",
  "الإضافات",
  "الخصومات",
  "الإجمالي",
  "الصافي",
  "حالة الترحيل",
];

/**
 * @param {{ rows: Array, filters: Object }} props
 * تصميم A4 لطباعة قائمة قيود المرتبات كتقرير
 */
export default function PayrollListPrintTemplate({ rows, filters }) {
  const company = useSelector((state) => state.auth.selectedCompany);

  if (!rows) return null;

  const today = new Date().toLocaleDateString("ar-EG");

  const totals = rows.reduce(
    (acc, r) => ({
      bonus: acc.bonus + Number(r.bonus || 0),
      deduction: acc.deduction + Number(r.deduction || 0),
      gross: acc.gross + Number(r.grossSalary || 0),
      net: acc.net + netOf(r),
    }),
    { bonus: 0, deduction: 0, gross: 0, net: 0 },
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
          <h1 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
            {company?.name || "—"}
          </h1>

          <p style={{ fontSize: "10px", color: "#6b7280", margin: "4px 0 0" }}>
            تقرير قيود المرتبات
          </p>
        </div>

        <div style={{ textAlign: "left", fontSize: "10px" }}>
          <p style={{ margin: "2px 0" }}>تاريخ الطباعة: {today}</p>
          <p style={{ margin: "2px 0" }}>عدد السجلات: {rows.length}</p>
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
          {filters.startDate && <span>من: {filters.startDate}</span>}
          {filters.endDate && <span>إلى: {filters.endDate}</span>}
          {filters.employeeType && (
            <span>
              النوع:{" "}
              {EMPLOYEE_TYPE[filters.employeeType] || filters.employeeType}
            </span>
          )}
          {filters.search && <span>بحث: {filters.search}</span>}
        </div>
      )}

      {/* الجدول */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "10px",
        }}
      >
        <thead>
          <tr style={{ background: "#0F6E5E" }}>
            {COLUMNS.map((h) => (
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
          {rows.map((row, i) => {
            const moved = isRowMoved(row);

            return (
              <tr key={row.id ?? i} style={{ breakInside: "avoid" }}>
                <td style={cellRight}>{row.employeeName || "—"}</td>
                <td style={cellCenter}>{row.employeeCode || "—"}</td>
                <td style={cellCenter}>
                  {EMPLOYEE_TYPE[row.employeeType] || row.employeeType || "—"}
                </td>
                <td style={cellCenter}>
                  {row.workPlaceStatus === "OutCompany"
                    ? "خارج الشركة"
                    : "داخل الشركة"}
                </td>
                <td style={cellCenter}>
                  {row.startDate} → {row.endDate}
                </td>
                <td style={{ ...cellCenter, color: "#16a34a" }}>
                  {fmt(row.bonus)}
                </td>
                <td style={{ ...cellCenter, color: "#dc2626" }}>
                  {fmt(row.deduction)}
                </td>
                <td style={{ ...cellCenter, fontWeight: 600 }}>
                  {fmt(row.grossSalary)}
                </td>
                <td style={{ ...cellCenter, fontWeight: 700 }}>
                  {fmt(netOf(row))}
                </td>
                <td style={cellCenter}>{moved ? "مُرحّل" : "لم يُرحّل"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ملخص التقرير */}
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
              <td style={summaryTitle}>إجمالي الإضافات</td>
              <td
                style={{ ...summaryValue, color: "#16a34a", fontWeight: 700 }}
              >
                {fmt(totals.bonus)}
              </td>
            </tr>

            <tr>
              <td style={summaryTitle}>إجمالي الخصومات</td>
              <td
                style={{ ...summaryValue, color: "#dc2626", fontWeight: 700 }}
              >
                {fmt(totals.deduction)}
              </td>
            </tr>

            <tr>
              <td style={summaryTitle}>إجمالي الأساسي</td>
              <td style={{ ...summaryValue, fontWeight: 700 }}>
                {fmt(totals.gross)}
              </td>
            </tr>

            <tr>
              <td style={summaryTitle}>إجمالي الصافي</td>
              <td style={{ ...summaryValue, fontWeight: 700 }}>
                {fmt(totals.net)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* التوقيع */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "32px",
          fontSize: "11px",
        }}
      >
        <div style={{ textAlign: "center", width: "180px" }}>
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
