// features/payroll/pages/SalaryDetailPage.jsx

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  Wallet,
  Printer,
  CalendarDays,
  User,
  Clock3,
  CheckCircle2,
  X,
  PlusCircle,
  MinusCircle,
} from "lucide-react";

import {
  useGetPayrollEntryByIdQuery,
  usePayPayrollEntryMutation,
} from "../payrollApi";

import { EMPLOYEE_TYPE, fmtMoney } from "../payroll.constants";

import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";

export default function SalaryDetailPage() {
  const { salaryId } = useParams();
  const navigate = useNavigate();

  const {
    data: entry,
    isLoading,
    isError,
    refetch,
  } = useGetPayrollEntryByIdQuery(salaryId);

  const [payPayroll, { isLoading: isPaying }] = usePayPayrollEntryMutation();

  const [showPayModal, setShowPayModal] = useState(false);
  const [postingDate, setPostingDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState("");

  const handlePay = async () => {
    if (!postingDate) {
      toast.error("تاريخ الصرف مطلوب");
      return;
    }

    try {
      await payPayroll({
        id: salaryId,
        postingDate,
        notes,
      }).unwrap();

      toast.success("تم صرف المرتب بنجاح");
      setShowPayModal(false);
      setNotes("");
      refetch();
    } catch (error) {
      toast.error(
        error?.data?.message || "حصل خطأ أثناء صرف المرتب، حاول تاني",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-ink-400" dir="rtl">
        جاري تحميل بيانات المرتب...
      </div>
    );
  }

  if (isError || !entry) {
    return (
      <div className="p-6 text-center" dir="rtl">
        <p className="text-sm text-negative mb-3">تعذر تحميل بيانات المرتب</p>

        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/payroll/salaries")}
        >
          العودة للمرتبات
        </Button>
      </div>
    );
  }

  const attendance = entry.attendanceSummary || {};

  return (
    <div className="animate-fadeUp space-y-5" dir="rtl">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("/dashboard/payroll/salaries")}
        className="
          flex
          items-center
          gap-1.5
          text-sm
          text-emerald-700
          hover:underline
        "
      >
        <ArrowRight size={14} />
        رجوع لقائمة المرتبات
      </button>

      {/* Header */}
      <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <User size={19} className="text-primary-600" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-ink-900">
                  {entry.employeeName}
                </h1>

                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-ink-400">
                  {entry.employeeCode && <span>كود: {entry.employeeCode}</span>}

                  <span>•</span>

                  <span>
                    {EMPLOYEE_TYPE[entry.employeeType] || entry.employeeType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer size={14} />
              طباعة
            </Button>

            <Button onClick={() => setShowPayModal(true)} disabled={isPaying}>
              <Wallet size={14} />
              صرف المرتب
            </Button>
          </div>
        </div>

        {/* Period */}
        <div className="mt-5 pt-4 border-t border-ink-400/10">
          <div className="flex items-center gap-2 text-sm text-ink-700">
            <CalendarDays size={15} className="text-ink-400" />

            <span>الفترة:</span>

            <strong>{entry.startDate}</strong>

            <span className="text-ink-400">إلى</span>

            <strong>{entry.endDate}</strong>
          </div>
        </div>
      </div>

      {/* Salary Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <SummaryCard label="إجمالي المرتب" value={entry.grossSalary} />

        <SummaryCard
          label="الإضافات والمكافآت"
          value={entry.bonus}
          positive
          icon={<PlusCircle size={15} />}
        />

        <SummaryCard
          label="الخصومات"
          value={entry.deduction}
          negative
          icon={<MinusCircle size={15} />}
        />

        <SummaryCard label="صافي المرتب" value={entry.netSalary} primary />
      </div>

      {/* Attendance Summary */}
      <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock3 size={17} className="text-primary-600" />

          <h2 className="text-sm font-bold text-ink-900">ملخص الحضور</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <AttendanceCard label="أيام الحضور" value={attendance.presentDays} />

          <AttendanceCard
            label="أيام الغياب"
            value={attendance.absentDays}
            negative
          />

          <AttendanceCard
            label="إجمالي أيام الحضور"
            value={attendance.totalPresentDays}
          />

          <AttendanceCard
            label="أيام الإضافي"
            value={attendance.totalOvertimeDays}
          />

          <AttendanceCard
            label="أيام الخصم"
            value={attendance.totalDeductionDays}
            negative
          />
        </div>
      </div>

      {/* Salary Calculation */}
      <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-400/10">
          <h2 className="text-sm font-bold text-ink-900">ملخص حساب المرتب</h2>
        </div>

        <div className="divide-y divide-ink-400/5">
          <SalaryRow label="إجمالي المرتب" value={entry.grossSalary} />

          <SalaryRow label="الإضافات والمكافآت" value={entry.bonus} positive />

          <SalaryRow label="الخصومات" value={entry.deduction} negative />

          <div className="flex items-center justify-between px-5 py-4 bg-primary-500/[0.04]">
            <span className="text-sm font-bold text-ink-900">صافي المرتب</span>

            <span className="num text-xl font-bold text-primary-600">
              {fmtMoney(entry.netSalary)}
            </span>
          </div>
        </div>
      </div>

      {/* Pay Modal */}
      <Modal
        isOpen={showPayModal}
        onClose={() => !isPaying && setShowPayModal(false)}
        title="صرف المرتب"
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-primary-50 border border-primary-100 p-4">
            <p className="text-xs text-ink-400 mb-1">الموظف</p>

            <p className="text-sm font-bold text-ink-900">
              {entry.employeeName}
            </p>

            <p className="text-xs text-ink-400 mt-3">صافي المرتب</p>

            <p className="text-xl font-bold num text-primary-600">
              {fmtMoney(entry.netSalary)}
            </p>
          </div>

          <Input
            label="تاريخ الصرف"
            type="date"
            value={postingDate}
            onChange={(e) => setPostingDate(e.target.value)}
          />

          <Input
            label="ملاحظات"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ملاحظات الصرف..."
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-ink-400/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPayModal(false)}
              disabled={isPaying}
            >
              إلغاء
            </Button>

            <Button type="button" onClick={handlePay} disabled={isPaying}>
              <Wallet size={14} />

              {isPaying ? "جارِ الصرف..." : "تأكيد صرف المرتب"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SummaryCard({ label, value, positive, negative, primary, icon }) {
  let valueClass = "text-ink-900";

  if (positive) {
    valueClass = "text-positive";
  }

  if (negative) {
    valueClass = "text-negative";
  }

  if (primary) {
    valueClass = "text-primary-600";
  }

  return (
    <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card p-4">
      <div className="flex items-center gap-2 text-xs text-ink-400 mb-2">
        {icon}
        {label}
      </div>

      <p className={`num text-xl font-bold ${valueClass}`}>{fmtMoney(value)}</p>
    </div>
  );
}

function AttendanceCard({ label, value, negative }) {
  return (
    <div className="rounded-xl bg-ink-900/[0.025] border border-ink-400/5 p-3">
      <p className="text-[11px] text-ink-400 mb-1">{label}</p>

      <p
        className={`num text-lg font-bold ${
          negative ? "text-negative" : "text-ink-900"
        }`}
      >
        {Number(value || 0)}
      </p>
    </div>
  );
}

function SalaryRow({ label, value, positive, negative }) {
  let valueClass = "text-ink-900";

  if (positive) {
    valueClass = "text-positive";
  }

  if (negative) {
    valueClass = "text-negative";
  }

  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-sm text-ink-600">{label}</span>

      <span className={`num text-sm font-semibold ${valueClass}`}>
        {fmtMoney(value)}
      </span>
    </div>
  );
}
