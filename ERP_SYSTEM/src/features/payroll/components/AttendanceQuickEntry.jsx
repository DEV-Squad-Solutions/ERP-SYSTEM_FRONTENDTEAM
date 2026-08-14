// features/payroll/components/AttendanceQuickEntry.jsx
//
// تسجيل حضور سريع بنمط "Excel-style row entry" (نفس فكرة CashboxDetailPage
// عندك) — تختار يوم واحد، وتظبط حالة كل الموظفين مرة واحدة في جدول، بدل ما
// تفتح Modal لكل موظف لوحده.

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { X, Check, Save } from "lucide-react";
import {
  useGetEmployeesSelectQuery,
  useGetEmployeeAttendancesQuery,
  useCreateEmployeeAttendanceMutation,
  useUpdateEmployeeAttendanceMutation,
} from "../payrollApi";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

const STATUS_PILLS = [
  {
    value: "Present",
    label: "حاضر",
    cls: "text-emerald-700 bg-emerald-700/10 border-emerald-700/20",
  },
  {
    value: "Absent",
    label: "غائب",
    cls: "text-negative bg-negative/10 border-negative/20",
  },
  {
    value: "Late",
    label: "متأخر",
    cls: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    value: "Vacation",
    label: "إجازة",
    cls: "text-ink-400 bg-ink-400/10 border-ink-400/20",
  },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function AttendanceQuickEntry({ onClose, onSaved }) {
  const [date, setDate] = useState(todayStr());
  const [rows, setRows] = useState({}); // employeeId -> { status, checkIn, checkOut, existingId }
  const [isSaving, setIsSaving] = useState(false);

  const { data: employees, isLoading: isLoadingEmployees } =
    useGetEmployeesSelectQuery();
  const { data: existingData, isFetching: isLoadingExisting } =
    useGetEmployeeAttendancesQuery({
      FromDate: date,
      ToDate: date,
      PageSize: 500,
    });

  const [createAttendance] = useCreateEmployeeAttendanceMutation();
  const [updateAttendance] = useUpdateEmployeeAttendanceMutation();

  // كل ما التاريخ يتغيّر، اقرأ السجلات الموجودة بالفعل لليوم ده واعمل prefill
  useEffect(() => {
    if (!existingData) return;
    const map = {};
    for (const rec of existingData.items) {
      map[rec.employeeId] = {
        status: rec.status,
        checkIn: rec.checkIn || "09:00",
        checkOut: rec.checkOut || "17:00",
        existingId: rec.id,
      };
    }
    setRows(map);
  }, [existingData, date]);

  const setRowStatus = (employeeId, status) => {
    setRows((r) => ({
      ...r,
      [employeeId]: {
        ...(r[employeeId] || { checkIn: "09:00", checkOut: "17:00" }),
        status,
      },
    }));
  };

  const setRowTime = (employeeId, field, value) => {
    setRows((r) => ({
      ...r,
      [employeeId]: { ...(r[employeeId] || {}), [field]: value },
    }));
  };

  const markAllPresent = () => {
    if (!employees) return;
    const map = {};
    for (const e of employees) {
      map[e.id] = {
        ...(rows[e.id] || {}),
        status: "Present",
        checkIn: rows[e.id]?.checkIn || "09:00",
        checkOut: rows[e.id]?.checkOut || "17:00",
      };
    }
    setRows(map);
  };

  const filledCount = useMemo(
    () => Object.values(rows).filter((r) => r.status).length,
    [rows],
  );

  const handleSaveAll = async () => {
    const entries = Object.entries(rows).filter(([, v]) => v.status);
    if (entries.length === 0) {
      toast.error("حدد حالة موظف واحد على الأقل");
      return;
    }
    setIsSaving(true);
    try {
      await Promise.all(
        entries.map(([employeeId, row]) => {
          const needsTimes = row.status === "Present" || row.status === "Late";
          const payload = {
            employeeId,
            workDate: date,
            status: row.status,
            checkIn: needsTimes ? row.checkIn : null,
            checkOut: needsTimes ? row.checkOut : null,
          };
          return row.existingId
            ? updateAttendance({ id: row.existingId, ...payload }).unwrap()
            : createAttendance(payload).unwrap();
        }),
      );
      toast.success(`تم حفظ حضور ${entries.length} موظف بنجاح`);
      onSaved?.();
    } catch {
      toast.error("حصل خطأ أثناء الحفظ، حاول تاني");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary-200 bg-white shadow-card overflow-hidden animate-fadeUp">
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-400/10 bg-primary-50/40">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-ink-900">
            تسجيل حضور سريع
          </h3>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-900/[0.05] transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink-400/10">
        <button
          onClick={markAllPresent}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-700/10 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <Check size={13} />
          تحديد الكل حاضر
        </button>
        <span className="text-[11px] text-ink-400">
          {filledCount} من {employees?.length || 0} تم تحديدهم
        </span>
      </div>

      {isLoadingEmployees || isLoadingExisting ? (
        <div className="p-6 text-center text-sm text-ink-400">
          جارِ التحميل...
        </div>
      ) : (
        <div className="max-h-[420px] overflow-y-auto custom-scroll divide-y divide-ink-400/5">
          {employees?.map((emp) => {
            const row = rows[emp.id] || {};
            const needsTimes =
              row.status === "Present" || row.status === "Late";
            return (
              <div
                key={emp.id}
                className="flex flex-wrap items-center gap-3 px-4 py-2.5 hover:bg-ink-900/[0.01] transition-colors"
              >
                <span className="text-sm text-ink-900 min-w-[140px]">
                  {emp.name}
                </span>

                <div className="flex items-center gap-1.5">
                  {STATUS_PILLS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setRowStatus(emp.id, p.value)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                        row.status === p.value
                          ? p.cls
                          : "text-ink-400 bg-transparent border-ink-400/15 hover:border-ink-400/30"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {needsTimes && (
                  <div className="flex items-center gap-2 ms-auto">
                    <input
                      type="time"
                      value={row.checkIn || "09:00"}
                      onChange={(e) =>
                        setRowTime(emp.id, "checkIn", e.target.value)
                      }
                      className="h-7 text-xs border border-ink-400/15 rounded-lg px-2"
                    />
                    <span className="text-ink-400 text-xs">إلى</span>
                    <input
                      type="time"
                      value={row.checkOut || "17:00"}
                      onChange={(e) =>
                        setRowTime(emp.id, "checkOut", e.target.value)
                      }
                      className="h-7 text-xs border border-ink-400/15 rounded-lg px-2"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end gap-2 px-4 py-3 border-t border-ink-400/10 bg-ink-900/[0.01]">
        <Button variant="outline" onClick={onClose}>
          إلغاء
        </Button>
        <Button onClick={handleSaveAll} disabled={isSaving}>
          <Save size={14} />
          {isSaving ? "جارِ الحفظ..." : `حفظ (${filledCount})`}
        </Button>
      </div>
    </div>
  );
}
