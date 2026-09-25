import { useSelector } from "react-redux";
import { EMPLOYEE_TYPE } from "../../../features/payroll/payroll.constants";

const fmt = (v) => Number(v || 0).toLocaleString("ar-EG");

const netOf = (entry) =>
  Number(entry?.netSalary || entry?.calculatedSalary || 0);

const isMoved = (entry) =>
  Boolean(
    entry?.isSalaryMoveToEmployeeAccount ??
    entry?.isSalaryMovedToEmployeeAccount,
  );

/**
 * @param {{ entry: Object }} props
 * تصميم A4 (بورتريه) لطباعة إيصال مرتب موظف واحد (Payslip)
 */
export default function PayrollDetailPrintTemplate({ entry }) {
  const company = useSelector((state) => state.auth.selectedCompany);

  if (!entry) return null;

  const today = new Date().toLocaleDateString("ar-EG");
  const attendance = entry.attendanceSummary || {};

  return (
    <div
      dir="rtl"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "16mm",
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
        color: "#111827",
        fontSize: "12px",
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
          paddingBottom: "12px",
          marginBottom: "16px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
            {company?.name || "—"}
          </h1>

          <p style={{ fontSize: "11px", color: "#6b7280", margin: "4px 0 0" }}>
            إيصال صرف مرتب
          </p>
        </div>

        <div style={{ textAlign: "left", fontSize: "11px" }}>
          <p style={{ margin: "2px 0" }}>تاريخ الطباعة: {today}</p>
          <p style={{ margin: "2px 0" }}>
            حالة الترحيل: {isMoved(entry) ? "مُرحّل" : "لم يُرحّل"}
          </p>
          {entry.salaryMovedOn && (
            <p style={{ margin: "2px 0" }}>
              تاريخ الصرف: {entry.salaryMovedOn}
            </p>
          )}
        </div>
      </div>

      {/* بيانات الموظف */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          background: "#f3f4f6",
          borderRadius: "8px",
          padding: "14px 16px",
          marginBottom: "18px",
          fontSize: "12px",
        }}
      >
        <InfoRow label="اسم الموظف" value={entry.employeeName} />
        <InfoRow label="كود الموظف" value={entry.employeeCode} />
        <InfoRow
          label="نوع الموظف"
          value={EMPLOYEE_TYPE[entry.employeeType] || entry.employeeType}
        />
        <InfoRow
          label="مكان العمل"
          value={
            entry.workPlaceStatus === "OutCompany"
              ? "خارج الشركة"
              : "داخل الشركة"
          }
        />
        <InfoRow label="من تاريخ" value={entry.startDate} />
        <InfoRow label="إلى تاريخ" value={entry.endDate} />
      </div>

      {/* ملخص الحضور */}
      <div style={{ marginBottom: "18px" }}>
        <h2
          style={{
            fontSize: "13px",
            fontWeight: 700,
            marginBottom: "8px",
            color: "#0F6E5E",
          }}
        >
          ملخص الحضور
        </h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "11px",
          }}
        >
          <thead>
            <tr style={{ background: "#0F6E5E" }}>
              {[
                "أيام الحضور",
                "أيام الغياب",
                "إجمالي أيام الحضور",
                "أيام الإضافي",
                "أيام الخصم",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    border: "1px solid #0b5546",
                    padding: "6px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style={cellCenter}>{Number(attendance.presentDays || 0)}</td>
              <td style={{ ...cellCenter, color: "#dc2626" }}>
                {Number(attendance.absentDays || 0)}
              </td>
              <td style={cellCenter}>
                {Number(attendance.totalPresentDays || 0)}
              </td>
              <td style={cellCenter}>
                {Number(attendance.totalOvertimeDays || 0)}
              </td>
              <td style={{ ...cellCenter, color: "#dc2626" }}>
                {Number(attendance.totalDeductionDays || 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ملخص حساب المرتب */}
      <div>
        <h2
          style={{
            fontSize: "13px",
            fontWeight: 700,
            marginBottom: "8px",
            color: "#0F6E5E",
          }}
        >
          ملخص حساب المرتب
        </h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
          }}
        >
          <tbody>
            <tr>
              <td style={summaryTitle}>إجمالي المرتب</td>
              <td style={summaryValue}>{fmt(entry.grossSalary)}</td>
            </tr>

            <tr>
              <td style={summaryTitle}>الإضافات والمكافآت</td>
              <td
                style={{ ...summaryValue, color: "#16a34a", fontWeight: 700 }}
              >
                {fmt(entry.bonus)}
              </td>
            </tr>

            <tr>
              <td style={summaryTitle}>الخصومات</td>
              <td
                style={{ ...summaryValue, color: "#dc2626", fontWeight: 700 }}
              >
                {fmt(entry.deduction)}
              </td>
            </tr>

            <tr>
              <td
                style={{
                  ...summaryTitle,
                  background: "#0F6E5E",
                  color: "#fff",
                }}
              >
                صافي المرتب
              </td>
              <td
                style={{
                  ...summaryValue,
                  background: "#0F6E5E",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                {fmt(netOf(entry))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* التوقيعات */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "50px",
          fontSize: "12px",
        }}
      >
        <div style={{ textAlign: "center", width: "180px" }}>
          <div style={{ borderTop: "1px solid #111827", paddingTop: "6px" }}>
            توقيع الموظف
          </div>
        </div>

        <div style={{ textAlign: "center", width: "180px" }}>
          <div style={{ borderTop: "1px solid #111827", paddingTop: "6px" }}>
            توقيع المسؤول
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

const cellCenter = {
  border: "1px solid #e5e7eb",
  padding: "6px",
  textAlign: "center",
};

const summaryTitle = {
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
  padding: "10px 12px",
  textAlign: "right",
  fontWeight: 700,
  width: "60%",
};

const summaryValue = {
  border: "1px solid #e5e7eb",
  padding: "10px 12px",
  textAlign: "center",
  fontWeight: 600,
  width: "40%",
};
