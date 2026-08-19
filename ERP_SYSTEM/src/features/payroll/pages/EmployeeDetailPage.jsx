// features/payroll/pages/EmployeeDetailPage.jsx
//
// TODO INTEGRATION: تبويبات الحضور/الإضافي والبدلات/الخصومات/السلف بتحتاج
// endpoints بفلتر employeeId - مستخدمين هنا getEmployeeAttendances و
// getEmployeeTransactions بفلتر EmployeeId، وسجل المرتبات من getPayrollEntries
// بفلتر EmployeeId. لو الباك إند مختلف، الجزء اللي محتاج تعديل هو الـparams بس.

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import {
  useGetEmployeeByIdQuery,
  useDeleteEmployeeMutation,
  useGetEmployeeAttendancesQuery,
  useGetEmployeeTransactionsQuery,
  useGetPayrollEntriesQuery,
} from "../payrollApi";
import { fmtMoney } from "../payroll.constants";
import Button from "../../../shared/components/ui/Button";
import EmployeeFormModal from "../components/EmployeeFormModal";

const TABS = [
  { key: "basic", label: "البيانات الأساسية" },
  { key: "attendance", label: "الحضور" },
  { key: "transactions", label: "الإضافي والخصومات والسلف" },
  { key: "history", label: "سجل المرتبات" },
];

export default function EmployeeDetailPage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [showFormModal, setShowFormModal] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const {
    data: employee,
    isLoading,
    isError,
  } = useGetEmployeeByIdQuery(employeeId);
  const [deleteEmployee] = useDeleteEmployeeMutation();

  const handleDelete = () => {
    if (!employee) return;
    toast(`حذف "${employee.name}"؟`, {
      description: "الإجراء ده لا يمكن التراجع عنه",
      action: {
        label: "تأكيد الحذف",
        onClick: async () => {
          try {
            await deleteEmployee(employee.id).unwrap();
            toast.success("تم الحذف بنجاح");
            navigate("/dashboard/payroll/employees");
          } catch {
            toast.error("حصل خطأ أثناء الحذف، حاول تاني");
          }
        },
      },
      cancel: { label: "إلغاء" },
      duration: 6000,
    });
  };

  if (isLoading) return <div className="p-6 text-ink-400">جاري التحميل...</div>;
  if (isError || !employee)
    return <div className="p-6 text-red-500">تعذر تحميل بيانات الموظف</div>;

  return (
    <div className="animate-fadeUp space-y-6">
      <button
        onClick={() => navigate("/dashboard/payroll/employees")}
        className="flex items-center gap-1.5 text-sm text-emerald-700 hover:underline"
      >
        <ArrowRight size={14} />
        رجوع لقائمة الموظفين
      </button>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="font-mono text-xs text-ink-400">
              {employee.code}
            </span>
            <h2 className="text-xl font-bold text-ink-900 mt-1">
              {employee.name}
            </h2>
            <span
              className={
                employee.isActive
                  ? "inline-block mt-2 text-emerald-700 text-xs font-semibold bg-emerald-700/10 px-2 py-0.5 rounded-full"
                  : "inline-block mt-2 text-red-500 text-xs font-semibold bg-red-500/10 px-2 py-0.5 rounded-full"
              }
            >
              {employee.isActive ? "نشط" : "غير نشط"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowFormModal(true)}>
              <Pencil size={14} />
              تعديل
            </Button>
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 size={14} className="text-red-600" />
              حذف
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-ink-400/10 mb-5 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-ink-400 hover:text-ink-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "basic" && <BasicInfoTab employee={employee} />}
        {activeTab === "attendance" && (
          <AttendanceTab employeeId={employee.id} />
        )}
        {activeTab === "transactions" && (
          <TransactionsTab employeeId={employee.id} />
        )}
        {activeTab === "history" && (
          <PayrollHistoryTab employeeId={employee.id} />
        )}
      </div>

      <EmployeeFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        employee={employee}
      />
    </div>
  );
}

function Field({ label, value, highlight = "" }) {
  return (
    <div>
      <p className="text-xs text-ink-400 mb-1">{label}</p>
      <p className={`text-sm text-ink-900 ${highlight}`}>{value || "—"}</p>
    </div>
  );
}

function BasicInfoTab({ employee }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-ink-900 mb-3">
          البيانات الأساسية
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <Field label="الوظيفة" value={employee.jobTitle} />
          <Field label="رقم الهاتف" value={employee.phoneNumber} />
          <Field label="البريد الإلكتروني" value={employee.email} />
          <Field label="العنوان" value={employee.address} />
        </div>
      </div>
      <div className="pt-4 border-t border-ink-400/10">
        <h3 className="text-sm font-semibold text-ink-900 mb-3">
          بيانات الراتب
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <Field
            label="نوع الأجر"
            value={employee.employeeType === "Daily" ? "يومي" : "شهري"}
          />
          <Field label="الراتب الأساسي" value={fmtMoney(employee.salary)} />
          <Field
            label="أيام العمل المطلوبة بالشهر"
            value={employee.requiredWorkingDaysPerMonth}
          />
          <Field
            label="آخر يوم استحقاق مرتب"
            value={employee.lastDayOfReceivingSalary}
          />
        </div>
      </div>
    </div>
  );
}

function AttendanceTab({ employeeId }) {
  const { data, isLoading } = useGetEmployeeAttendancesQuery({
    EmployeeId: employeeId,
    PageSize: 50,
  });
  const rows = data?.items || [];

  if (isLoading)
    return <div className="text-ink-400 text-sm py-6">جارِ التحميل...</div>;
  if (rows.length === 0)
    return (
      <p className="text-sm text-ink-400 py-6 text-center">لا يوجد سجل حضور</p>
    );

  return (
    <div className="overflow-x-auto custom-scroll rounded-xl border border-ink-400/10">
      <table className="w-full text-right border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              التاريخ
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              الحضور
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              الانصراف
            </th>
            <th className="p-2.5 font-medium">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-ink-400/5 last:border-0">
              <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                {r.workDate}
              </td>
              <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                {r.checkIn || "—"}
              </td>
              <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                {r.checkOut || "—"}
              </td>
              <td className="p-2.5 text-xs">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TransactionsTab({ employeeId }) {
  const { data, isLoading } = useGetEmployeeTransactionsQuery({
    EmployeeId: employeeId,
    PageSize: 50,
  });
  const rows = data?.items || [];

  if (isLoading)
    return <div className="text-ink-400 text-sm py-6">جارِ التحميل...</div>;
  if (rows.length === 0)
    return (
      <p className="text-sm text-ink-400 py-6 text-center">لا توجد حركات</p>
    );

  return (
    <div className="overflow-x-auto custom-scroll rounded-xl border border-ink-400/10">
      <table className="w-full text-right border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              التاريخ
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              النوع
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              القيمة
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              ملاحظات
            </th>
            <th className="p-2.5 font-medium">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-ink-400/5 last:border-0">
              <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                {r.transactionDate}
              </td>
              <td className="p-2.5 text-xs border-l border-ink-400/5">
                {r.type === "Debit" ? "خصم" : "إضافة"}
              </td>
              <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                {fmtMoney(r.amount)}
              </td>
              <td className="p-2.5 text-xs text-ink-600 border-l border-ink-400/5">
                {r.notes || "—"}
              </td>
              <td className="p-2.5 text-xs">
                {r.isProcessed ? "تم الترحيل" : "معلّق"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PayrollHistoryTab({ employeeId }) {
  const { data, isLoading } = useGetPayrollEntriesQuery({
    EmployeeId: employeeId,
    PageSize: 50,
  });
  const rows = data?.items || [];

  if (isLoading)
    return <div className="text-ink-400 text-sm py-6">جارِ التحميل...</div>;
  if (rows.length === 0)
    return (
      <p className="text-sm text-ink-400 py-6 text-center">
        لا يوجد سجل مرتبات
      </p>
    );

  return (
    <div className="overflow-x-auto custom-scroll rounded-xl border border-ink-400/10">
      <table className="w-full text-right border-collapse min-w-[700px]">
        <thead>
          <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              الفترة
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              المكافآت
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              الخصومات
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              إجمالي المرتب
            </th>
            <th className="p-2.5 font-medium">صافي المرتب</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-ink-400/5 last:border-0">
              <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                {r.startDate} - {r.endDate}
              </td>
              <td className="p-2.5 num text-positive text-[13px] border-l border-ink-400/5">
                {fmtMoney(r.bonus)}
              </td>
              <td className="p-2.5 num text-negative text-[13px] border-l border-ink-400/5">
                {fmtMoney(r.deduction)}
              </td>
              <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                {fmtMoney(r.grossSalary)}
              </td>
              <td className="p-2.5 num font-semibold text-[13px]">
                {fmtMoney(r.netSalary)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
