// features/payroll/components/AttendanceDetailsModal.jsx

import { Clock3, MapPin, CalendarDays, UserRound } from "lucide-react";

import Modal from "../../../shared/components/ui/Modal";

import {
  ATTENDANCE_STATUS,
  attendanceStatusBadge,
  DAY_RATIO,
} from "../payroll.constants";

export default function AttendanceDetailsModal({
  isOpen,
  onClose,
  attendance,
}) {
  if (!attendance) return null;

  const status = attendance.status;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تفاصيل سجل الحضور">
      <div className="space-y-5">
        {/* =====================================================
            Employee Header
        ====================================================== */}

        <div className="flex items-center gap-3 p-4 rounded-xl bg-ink-900/[0.03] border border-ink-400/10">
          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
            <UserRound
              size={21}
              className="text-primary-600"
              strokeWidth={1.7}
            />
          </div>

          <div className="min-w-0">
            <p className="text-xs text-ink-400 mb-0.5">الموظف</p>

            <h3 className="text-base font-bold text-ink-900 truncate">
              {attendance.employeeName || "—"}
            </h3>

            <p className="text-xs text-ink-400 mt-0.5 num">
              رقم الموظف: {attendance.employeeId ?? "—"}
            </p>
          </div>

          <span
            className={`mr-auto shrink-0 inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
              attendanceStatusBadge[status] || "text-ink-400 bg-ink-400/10"
            }`}
          >
            {ATTENDANCE_STATUS[status] || status || "—"}
          </span>
        </div>

        {/* =====================================================
            Basic Information
        ====================================================== */}

        <SectionTitle title="بيانات الحضور" />

        <div className="grid grid-cols-2 gap-3">
          <InfoCard
            icon={<CalendarDays size={15} />}
            label="تاريخ العمل"
            value={formatDate(attendance.workDate)}
          />

          <InfoCard
            icon={<Clock3 size={15} />}
            label="عدد ساعات العمل"
            value={attendance.workHours || "—"}
            numeric
          />

          <InfoCard
            label="وقت الحضور"
            value={attendance.checkIn || "—"}
            numeric
          />

          <InfoCard
            label="وقت الانصراف"
            value={attendance.checkOut || "—"}
            numeric
          />
        </div>

        {/* =====================================================
            Ratios
        ====================================================== */}

        <SectionTitle title="نسب العمل" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <RatioCard label="نسبة يوم العمل" value={attendance.workDayRatio} />

          <RatioCard label="الإضافي" value={attendance.workOverTimeRatio} />

          <RatioCard
            label="خصم أيام العمل"
            value={attendance.workDaysDeductionRatio}
          />
        </div>

        {/* =====================================================
            Location
        ====================================================== */}

        <div>
          <SectionTitle title="مكان العمل" />

          <div className="flex items-center gap-2 rounded-xl border border-ink-400/10 bg-white px-3 py-3">
            <MapPin size={16} className="text-ink-400 shrink-0" />

            <span className="text-sm text-ink-900">
              {attendance.workLocation || "غير محدد"}
            </span>
          </div>
        </div>

        {/* =====================================================
            Notes
        ====================================================== */}

        <div>
          <SectionTitle title="الملاحظات" />

          <div className="rounded-xl border border-ink-400/10 bg-ink-900/[0.02] px-3 py-3 min-h-[70px]">
            <p className="text-sm text-ink-700 whitespace-pre-wrap">
              {attendance.notes || "لا توجد ملاحظات"}
            </p>
          </div>
        </div>

        {/* =====================================================
            Record ID
        ====================================================== */}

        <div className="pt-3 border-t border-ink-400/10 flex items-center justify-between">
          <span className="text-xs text-ink-400">رقم السجل</span>

          <span className="text-xs font-semibold text-ink-700 num">
            #{attendance.id}
          </span>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// Section Title
// ============================================================

function SectionTitle({ title }) {
  return <h4 className="text-xs font-semibold text-ink-900 mb-2">{title}</h4>;
}

// ============================================================
// Info Card
// ============================================================

function InfoCard({ icon, label, value, numeric = false }) {
  return (
    <div className="rounded-xl border border-ink-400/10 bg-white p-3">
      <div className="flex items-center gap-1.5 text-ink-400 mb-1">
        {icon}
        <span className="text-[11px]">{label}</span>
      </div>

      <p
        className={`text-sm font-semibold text-ink-900 ${numeric ? "num" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================================
// Ratio Card
// ============================================================

function RatioCard({ label, value }) {
  return (
    <div className="rounded-xl border border-ink-400/10 bg-white p-3">
      <p className="text-[11px] text-ink-400 mb-1">{label}</p>

      <p className="text-sm font-semibold text-ink-900">
        {DAY_RATIO[value] || value || "—"}
      </p>
    </div>
  );
}

// ============================================================
// Date Formatter
// ============================================================

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
