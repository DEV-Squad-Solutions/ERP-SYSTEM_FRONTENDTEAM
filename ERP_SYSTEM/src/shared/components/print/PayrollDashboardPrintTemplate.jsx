import { fmtMoney } from "../../../features/payroll/payroll.constants";

function formatDate(date) {
  if (!date) return "—";

  try {
    return new Intl.DateTimeFormat("ar-EG").format(
      new Date(`${date}T00:00:00`),
    );
  } catch {
    return date;
  }
}

function StatBox({ title, value }) {
  return (
    <div style={styles.statBox}>
      <div style={styles.statTitle}>{title}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

export default function PayrollDashboardPrintTemplate({
  data,
  fromDate,
  toDate,
  employeeId,
  employeeType,
  employeeName,
}) {
  const pendingPayrolls = Array.isArray(data?.pendingPayrolls)
    ? data.pendingPayrolls
    : [];

  const recentOperations = Array.isArray(data?.recentOperations)
    ? data.recentOperations
    : [];

  const employeeTypeLabel =
    employeeType === "Daily"
      ? "يومي"
      : employeeType === "Monthly"
        ? "شهري"
        : "كل الأنواع";

  return (
    <div dir="rtl" style={styles.page}>
      <style>
        {`
          @page {
            size: A4;
            margin: 12mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 0;
            font-family: "Tajawal", "Cairo", Arial, sans-serif;
            color: #0f172a;
            background: #fff;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          tr {
            page-break-inside: avoid;
          }

          .print-section {
            page-break-inside: avoid;
          }
        `}
      </style>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>تقرير الأجور والمرتبات</h1>

          <p style={styles.subtitle}>
            تقرير ملخص لحالة الرواتب والمدفوعات والاستحقاقات
          </p>
        </div>

        <div style={styles.reportDate}>
          <div>تاريخ الطباعة</div>

          <strong>{new Intl.DateTimeFormat("ar-EG").format(new Date())}</strong>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterBox}>
        <div style={styles.filterItem}>
          <span style={styles.filterLabel}>من تاريخ</span>
          <strong>{formatDate(fromDate)}</strong>
        </div>

        <div style={styles.filterItem}>
          <span style={styles.filterLabel}>إلى تاريخ</span>
          <strong>{formatDate(toDate)}</strong>
        </div>

        <div style={styles.filterItem}>
          <span style={styles.filterLabel}>الموظف</span>
          <strong>{employeeId ? employeeName || "—" : "كل الموظفين"}</strong>
        </div>

        <div style={styles.filterItem}>
          <span style={styles.filterLabel}>نوع الموظف</span>
          <strong>{employeeTypeLabel}</strong>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <StatBox title="إجمالي كشوف الرواتب" value={data?.totalPayrolls ?? 0} />

        <StatBox title="صافي المستحق" value={fmtMoney(data?.netPayable ?? 0)} />

        <StatBox
          title="إجمالي المدفوع"
          value={fmtMoney(data?.totalPaid ?? 0)}
        />

        <StatBox
          title="إجمالي الخصومات"
          value={fmtMoney(data?.totalDeductions ?? 0)}
        />

        <StatBox
          title="إجمالي السلف"
          value={fmtMoney(data?.totalAdvances ?? 0)}
        />

        <StatBox title="عدد الموظفين" value={data?.employeeCount ?? 0} />
      </div>

      {/* Pending Payrolls */}
      <section className="print-section" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>كشوف الرواتب المعلقة</h2>

          <span style={styles.sectionCount}>{pendingPayrolls.length}</span>
        </div>

        {pendingPayrolls.length === 0 ? (
          <div style={styles.empty}>لا توجد كشوف رواتب معلقة.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={styles.th}>الكود</th>
                <th style={styles.th}>الموظف</th>
                <th style={styles.th}>النوع</th>
                <th style={styles.th}>من</th>
                <th style={styles.th}>إلى</th>
                <th style={styles.th}>الإجمالي</th>
                <th style={styles.th}>الخصم</th>
                <th style={styles.th}>الصافي</th>
              </tr>
            </thead>

            <tbody>
              {pendingPayrolls.map((item) => (
                <tr key={item.id}>
                  <td style={styles.td}>{item.employeeCode || "—"}</td>

                  <td style={styles.td}>{item.employeeName || "—"}</td>

                  <td style={styles.td}>
                    {item.employeeType === "Daily" ? "يومي" : "شهري"}
                  </td>

                  <td style={styles.td}>{formatDate(item.startDate)}</td>

                  <td style={styles.td}>{formatDate(item.endDate)}</td>

                  <td style={styles.td}>{fmtMoney(item.grossSalary ?? 0)}</td>

                  <td style={styles.td}>{fmtMoney(item.deduction ?? 0)}</td>

                  <td style={styles.tdStrong}>
                    {fmtMoney(item.netSalary ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Recent Operations */}
      <section className="print-section" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>آخر العمليات</h2>

          <span style={styles.sectionCount}>{recentOperations.length}</span>
        </div>

        {recentOperations.length === 0 ? (
          <div style={styles.empty}>لا توجد عمليات حديثة.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={styles.th}>التاريخ</th>
                <th style={styles.th}>العملية</th>
                <th style={styles.th}>الموظف</th>
                <th style={styles.th}>المرجع</th>
                <th style={styles.th}>المبلغ</th>
                <th style={styles.th}>العملة</th>
                <th style={styles.th}>ملاحظات</th>
              </tr>
            </thead>

            <tbody>
              {recentOperations.map((operation, index) => (
                <tr key={`${operation.sourceId}-${index}`}>
                  <td style={styles.td}>{formatDate(operation.date)}</td>

                  <td style={styles.td}>
                    {operation.operationName || operation.operationType || "—"}
                  </td>

                  <td style={styles.td}>{operation.employeeName || "—"}</td>

                  <td style={styles.td}>{operation.referenceNumber || "—"}</td>

                  <td style={styles.tdStrong}>
                    {fmtMoney(operation.amount ?? 0)}
                  </td>

                  <td style={styles.td}>{operation.currency || "EGP"}</td>

                  <td style={styles.td}>{operation.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Footer */}
      <div style={styles.footer}>
        <span>تقرير الأجور والمرتبات</span>

        <span>
          الفترة: {formatDate(fromDate)} — {formatDate(toDate)}
        </span>
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100%",
    background: "#fff",
    color: "#0f172a",
    fontFamily: '"Tajawal", "Cairo", Arial, sans-serif',
    fontSize: "12px",
    padding: "4px",
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    paddingBottom: "14px",
    borderBottom: "2px solid #0f172a",
  },

  title: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 800,
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "11px",
  },

  reportDate: {
    textAlign: "left",
    color: "#64748b",
    fontSize: "10px",
    lineHeight: 1.7,
  },

  filterBox: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
    marginTop: "14px",
    padding: "10px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    background: "#f8fafc",
  },

  filterItem: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },

  filterLabel: {
    color: "#64748b",
    fontSize: "9px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
    marginTop: "12px",
  },

  statBox: {
    padding: "10px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    background: "#fff",
  },

  statTitle: {
    color: "#64748b",
    fontSize: "9px",
  },

  statValue: {
    marginTop: "4px",
    fontSize: "15px",
    fontWeight: 800,
  },

  section: {
    marginTop: "18px",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 800,
  },

  sectionCount: {
    minWidth: "24px",
    padding: "3px 7px",
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "#475569",
    textAlign: "center",
    fontSize: "9px",
    fontWeight: 700,
  },

  th: {
    padding: "7px 6px",
    border: "1px solid #cbd5e1",
    background: "#f1f5f9",
    fontSize: "9px",
    fontWeight: 800,
    textAlign: "right",
  },

  td: {
    padding: "7px 6px",
    border: "1px solid #e2e8f0",
    fontSize: "9px",
    textAlign: "right",
    verticalAlign: "middle",
  },

  tdStrong: {
    padding: "7px 6px",
    border: "1px solid #e2e8f0",
    fontSize: "9px",
    fontWeight: 800,
    textAlign: "right",
    verticalAlign: "middle",
  },

  empty: {
    padding: "20px",
    border: "1px dashed #cbd5e1",
    borderRadius: "8px",
    color: "#64748b",
    textAlign: "center",
    background: "#f8fafc",
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "24px",
    paddingTop: "10px",
    borderTop: "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: "9px",
  },
};
