// features/payroll/payroll.mocks.js
//
// طبقة Mock كاملة للموديول. لما USE_MOCKS = true، كل الـendpoints في
// payrollApi.js بترجع من هنا بدل ما تنادي الـbackend فعليًا (بما فيها
// create/update/delete اللي بتعدّل الـin-memory store مباشرة عشان تحس
// إن الداتا بتتغير فعليًا وانت بتجرب الواجهة).
//
// عشان تشغّل/توقف الـmocks: غيّر القيمة تحت في السطر الأول بس.

export const USE_MOCKS = true;

const mockDelay = (ms = 350) => new Promise((res) => setTimeout(res, ms));

// ============================================================
// In-memory store
// ============================================================

let _employees = [
  {
    code: "EMP-001",
    name: "أحمد محمد السيد",
    jobTitle: "محاسب",
    phoneNumber: "01012345678",
    email: "ahmed@example.com",
    address: "القاهرة",
    employeeType: "Monthly",
    salary: 8000,
    requiredWorkingDaysPerMonth: 26,
    lastDayOfReceivingSalary: "2026-07-31",
    isActive: true,
  },
  {
    code: "EMP-002",
    name: "منى عبد الرحمن",
    jobTitle: "مسؤولة مبيعات",
    phoneNumber: "01023456789",
    email: "mona@example.com",
    address: "الجيزة",
    employeeType: "Monthly",
    salary: 6500,
    requiredWorkingDaysPerMonth: 26,
    lastDayOfReceivingSalary: "2026-07-31",
    isActive: true,
  },
  {
    code: "EMP-003",
    name: "كريم إبراهيم",
    jobTitle: "عامل مخزن",
    phoneNumber: "01034567890",
    email: "",
    address: "بنها",
    employeeType: "Daily",
    salary: 250,
    requiredWorkingDaysPerMonth: 24,
    lastDayOfReceivingSalary: "2026-07-31",
    isActive: true,
  },
  {
    code: "EMP-004",
    name: "سارة حسن",
    jobTitle: "سكرتيرة",
    phoneNumber: "01045678901",
    email: "sara@example.com",
    address: "القاهرة",
    employeeType: "Monthly",
    salary: 5500,
    requiredWorkingDaysPerMonth: 26,
    lastDayOfReceivingSalary: "2026-07-31",
    isActive: false,
  },
  {
    code: "EMP-005",
    name: "محمود عادل",
    jobTitle: "سائق توصيل",
    phoneNumber: "01056789012",
    email: "",
    address: "القليوبية",
    employeeType: "Daily",
    salary: 300,
    requiredWorkingDaysPerMonth: 24,
    lastDayOfReceivingSalary: "2026-07-31",
    isActive: true,
  },
];

let _attendances = (() => {
  const statuses = ["Present", "Present", "Present", "Late", "Absent"];
  const rows = [];
  let id = 1;
  for (const emp of _employees) {
    for (let d = 1; d <= 8; d++) {
      const status = statuses[(d + emp.code.length) % statuses.length];
      rows.push({
        id: id++,
        companyId: 1,
        employeeId: emp.code,
        employeeName: emp.name,
        status,
        workDate: `2026-08-${String(d).padStart(2, "0")}`,
        checkIn:
          status === "Absent" ? null : status === "Late" ? "09:45" : "09:00",
        checkOut: status === "Absent" ? null : "17:00",
        workHours:
          status === "Absent" ? "00:00" : status === "Late" ? "07:15" : "08:00",
        workDayRatio: "FullDay",
        workOverTimeRatio: "QuarterDay",
        workDaysDeductionRatio: status === "Absent" ? "FullDay" : "QuarterDay",
        workLocation: "المقر الرئيسي",
        notes: status === "Late" ? "تأخير 45 دقيقة" : "",
      });
    }
  }
  return rows;
})();

let _transactions = [
  {
    id: 1,
    companyId: 1,
    employeeId: "EMP-001",
    employeeName: "أحمد محمد السيد",
    type: "Credit",
    amount: 500,
    transactionDate: "2026-08-05",
    notes: "[Overtime] ساعتين إضافي يوم الجرد",
    isProcessed: true,
  },
  {
    id: 2,
    companyId: 1,
    employeeId: "EMP-002",
    employeeName: "منى عبد الرحمن",
    type: "Credit",
    amount: 300,
    transactionDate: "2026-08-03",
    notes: "[TransportAllowance] بدل انتقال شهر أغسطس",
    isProcessed: true,
  },
  {
    id: 3,
    companyId: 1,
    employeeId: "EMP-003",
    employeeName: "كريم إبراهيم",
    type: "Debit",
    amount: 150,
    transactionDate: "2026-08-04",
    notes: "[AbsenceDeduction] خصم يوم غياب",
    isProcessed: true,
  },
  {
    id: 4,
    companyId: 1,
    employeeId: "EMP-005",
    employeeName: "محمود عادل",
    type: "Debit",
    amount: 2000,
    transactionDate: "2026-08-01",
    notes: "[Advance] سلفة على المرتب",
    isProcessed: false,
  },
  {
    id: 5,
    companyId: 1,
    employeeId: "EMP-001",
    employeeName: "أحمد محمد السيد",
    type: "Debit",
    amount: 100,
    transactionDate: "2026-08-06",
    notes: "[LatenessDeduction] خصم تأخير",
    isProcessed: false,
  },
  {
    id: 6,
    companyId: 1,
    employeeId: "EMP-002",
    employeeName: "منى عبد الرحمن",
    type: "Credit",
    amount: 1000,
    transactionDate: "2026-08-02",
    notes: "[Bonus] مكافأة تحقيق هدف المبيعات",
    isProcessed: true,
  },
];

let _payrollEntries = [
  {
    id: 101,
    companyId: 1,
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    employeeId: "EMP-001",
    employeeCode: "EMP-001",
    employeeName: "أحمد محمد السيد",
    employeeType: "Monthly",
    bonus: 500,
    deduction: 100,
    grossSalary: 8500,
    netSalary: 8400,
  },
  {
    id: 102,
    companyId: 1,
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    employeeId: "EMP-002",
    employeeCode: "EMP-002",
    employeeName: "منى عبد الرحمن",
    employeeType: "Monthly",
    bonus: 1300,
    deduction: 0,
    grossSalary: 7800,
    netSalary: 7800,
  },
  {
    id: 103,
    companyId: 1,
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    employeeId: "EMP-003",
    employeeCode: "EMP-003",
    employeeName: "كريم إبراهيم",
    employeeType: "Daily",
    bonus: 0,
    deduction: 150,
    grossSalary: 6000,
    netSalary: 5850,
  },
  {
    id: 104,
    companyId: 1,
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    employeeId: "EMP-005",
    employeeCode: "EMP-005",
    employeeName: "محمود عادل",
    employeeType: "Daily",
    bonus: 0,
    deduction: 2000,
    grossSalary: 7200,
    netSalary: 5200,
  },
];

let _nextAttendanceId = 100;
let _nextTransactionId = 100;
let _nextPayrollId = 200;

// ============================================================
// Helpers
// ============================================================

function paginate(items, params = {}) {
  const pageNumber = Number(params.PageNumber || params.pageNumber || 1);
  const pageSize = Number(params.PageSize || params.pageSize || 20);
  const start = (pageNumber - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);
  return {
    items: paged,
    pageNumber,
    pageSize,
    totalCount: items.length,
    totalPages: Math.ceil(items.length / pageSize) || 1,
  };
}

function textMatch(haystack, needle) {
  if (!needle) return true;
  return (haystack || "")
    .toString()
    .toLowerCase()
    .includes(needle.toLowerCase());
}

// ============================================================
// Employees
// ============================================================

export function mockGetEmployees(params = {}) {
  let items = [..._employees];
  if (params.Search)
    items = items.filter(
      (e) =>
        textMatch(e.name, params.Search) || textMatch(e.code, params.Search),
    );
  if (params.EmployeeType)
    items = items.filter((e) => e.employeeType === params.EmployeeType);
  if (params.IsActive !== undefined && params.IsActive !== "") {
    const active = params.IsActive === true || params.IsActive === "true";
    items = items.filter((e) => e.isActive === active);
  }
  const paged = paginate(items, params);
  return {
    employees: paged.items,
    pageNumber: paged.pageNumber,
    pageSize: paged.pageSize,
    totalCount: paged.totalCount,
    totalPages: paged.totalPages,
    summary: {
      totalMonthlyEmployees: _employees.filter(
        (e) => e.employeeType === "Monthly",
      ).length,
      totalDailyEmployees: _employees.filter((e) => e.employeeType === "Daily")
        .length,
    },
  };
}

export function mockGetEmployeeById(code) {
  const emp = _employees.find((e) => e.code === code);
  if (!emp) throw new Error("الموظف غير موجود");
  return emp;
}

export function mockGetEmployeesSelect() {
  return _employees.map((e) => ({ id: e.code, name: e.name }));
}

export function mockCreateEmployee(data) {
  if (_employees.some((e) => e.code === data.code)) {
    throw new Error("رقم الموظف مستخدم بالفعل");
  }
  _employees = [..._employees, { ...data }];
  return data;
}

export function mockUpdateEmployee(code, data) {
  const idx = _employees.findIndex((e) => e.code === code);
  if (idx === -1) throw new Error("الموظف غير موجود");
  _employees = _employees.map((e) => (e.code === code ? { ...e, ...data } : e));
  return _employees[idx];
}

export function mockDeleteEmployee(code) {
  _employees = _employees.filter((e) => e.code !== code);
  return { success: true };
}

// ============================================================
// Attendance
// ============================================================

export function mockGetEmployeeAttendances(params = {}) {
  let items = [..._attendances];
  if (params.EmployeeId)
    items = items.filter((a) => a.employeeId === params.EmployeeId);
  if (params.Status) items = items.filter((a) => a.status === params.Status);
  if (params.FromDate)
    items = items.filter((a) => a.workDate >= params.FromDate);
  if (params.ToDate) items = items.filter((a) => a.workDate <= params.ToDate);
  return paginate(items, params);
}

export function mockCreateEmployeeAttendance(data) {
  const emp = _employees.find((e) => e.code === data.employeeId);
  const record = {
    id: _nextAttendanceId++,
    companyId: 1,
    employeeName: emp?.name || "",
    ...data,
  };
  _attendances = [record, ..._attendances];
  return record;
}

export function mockUpdateEmployeeAttendance(id, data) {
  _attendances = _attendances.map((a) => (a.id === id ? { ...a, ...data } : a));
  return _attendances.find((a) => a.id === id);
}

export function mockDeleteEmployeeAttendance(id) {
  _attendances = _attendances.filter((a) => a.id !== id);
  return { success: true };
}

// ============================================================
// Transactions
// ============================================================

export function mockGetEmployeeTransactions(params = {}) {
  let items = [..._transactions];
  if (params.EmployeeId)
    items = items.filter((t) => t.employeeId === params.EmployeeId);
  if (params.Search)
    items = items.filter((t) => textMatch(t.employeeName, params.Search));
  if (params.FromDate)
    items = items.filter((t) => t.transactionDate >= params.FromDate);
  if (params.ToDate)
    items = items.filter((t) => t.transactionDate <= params.ToDate);
  return paginate(items, params);
}

export function mockCreateEmployeeTransaction(data) {
  const emp = _employees.find((e) => e.code === data.employeeId);
  const record = {
    id: _nextTransactionId++,
    companyId: 1,
    employeeName: emp?.name || "",
    isProcessed: false,
    ...data,
  };
  _transactions = [record, ..._transactions];
  return record;
}

export function mockUpdateEmployeeTransaction(id, data) {
  _transactions = _transactions.map((t) =>
    t.id === id ? { ...t, ...data } : t,
  );
  return _transactions.find((t) => t.id === id);
}

export function mockDeleteEmployeeTransaction(id) {
  _transactions = _transactions.filter((t) => t.id !== id);
  return { success: true };
}

// ============================================================
// Payroll Entries
// ============================================================

export function mockGetPayrollEntries(params = {}) {
  let items = [..._payrollEntries];
  if (params.EmployeeId)
    items = items.filter((p) => p.employeeId === params.EmployeeId);
  if (params.Search)
    items = items.filter((p) => textMatch(p.employeeName, params.Search));
  if (params.Month) {
    items = items.filter(
      (p) => new Date(p.startDate).getMonth() + 1 === Number(params.Month),
    );
  }
  if (params.Year) {
    items = items.filter(
      (p) => new Date(p.startDate).getFullYear() === Number(params.Year),
    );
  }
  if (params.FromDate)
    items = items.filter((p) => p.startDate >= params.FromDate);
  if (params.ToDate) items = items.filter((p) => p.endDate <= params.ToDate);
  return paginate(items, params);
}

export function mockGetPayrollEntryById(id) {
  const entry = _payrollEntries.find((p) => String(p.id) === String(id));
  if (!entry) throw new Error("المرتب غير موجود");
  return entry;
}

export function mockGeneratePayrollEntries({ month, year }) {
  const activeEmployees = _employees.filter((e) => e.isActive);
  const created = activeEmployees.map((emp) => {
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const end = `${year}-${String(month).padStart(2, "0")}-28`;
    return {
      id: _nextPayrollId++,
      companyId: 1,
      startDate: start,
      endDate: end,
      employeeId: emp.code,
      employeeCode: emp.code,
      employeeName: emp.name,
      employeeType: emp.employeeType,
      bonus: 0,
      deduction: 0,
      grossSalary: emp.salary,
      netSalary: emp.salary,
    };
  });
  _payrollEntries = [...created, ..._payrollEntries];
  return created;
}

export function mockApprovePayrollEntry(id) {
  const entry = _payrollEntries.find((p) => String(p.id) === String(id));
  if (!entry) throw new Error("المرتب غير موجود");
  return { ...entry, status: "Approved" };
}

export function mockDisbursePayrollEntry(id) {
  const entry = _payrollEntries.find((p) => String(p.id) === String(id));
  if (!entry) throw new Error("المرتب غير موجود");
  return { ...entry, status: "Disbursed" };
}

export { mockDelay };
