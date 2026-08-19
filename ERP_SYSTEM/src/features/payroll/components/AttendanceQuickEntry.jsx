// features/payroll/components/AttendanceQuickEntry.jsx

import { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import {
  Check,
  Clock3,
  Loader2,
  RotateCcw,
  Save,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import CompactSelect from "../../../shared/components/ui/CompactSelect";

import {
  useBulkCreateEmployeeAttendancesMutation,
  useGetEmployeeAttendancesQuery,
  useGetEmployeesSelectQuery,
} from "../payrollApi";

// =========================================================
// Constants
// =========================================================

const DEFAULT_CHECK_IN = "09:00";
const DEFAULT_CHECK_OUT = "17:00";

const DEFAULT_WORK_DAY_RATIO = "FullDay";
const DEFAULT_OVERTIME_RATIO = "FullDay";
const DEFAULT_DEDUCTION_RATIO = "FullDay";

const STATUS_PILLS = [
  {
    value: "Present",
    label: "حاضر",
    shortLabel: "حاضر",
    icon: UserCheck,
    activeClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    value: "Absent",
    label: "غائب",
    shortLabel: "غائب",
    icon: UserX,
    activeClass: "text-negative bg-negative/10 border-negative/20",
  },
];

const WORK_DAY_RATIOS = [
  {
    value: "QuarterDay",
    label: "ربع يوم",
  },
  {
    value: "ThirdDay",
    label: "ثلث يوم",
  },
  {
    value: "HalfDay",
    label: "نصف يوم",
  },
  {
    value: "ThreeQuarterDay",
    label: "ثلاثة أرباع",
  },
  {
    value: "FullDay",
    label: "يوم كامل",
  },
];

// =========================================================
// Helpers
// =========================================================

const todayStr = () => {
  return new Date().toISOString().slice(0, 10);
};

const createDefaultRow = (status = "Present") => ({
  status,

  checkIn: DEFAULT_CHECK_IN,
  checkOut: DEFAULT_CHECK_OUT,

  workDayRatio: DEFAULT_WORK_DAY_RATIO,
  workOverTimeRatio: DEFAULT_OVERTIME_RATIO,
  workDaysDeductionRatio: DEFAULT_DEDUCTION_RATIO,

  workLocation: "",
  notes: "",
});

const normalizeRecord = (record) => ({
  status: record.status || "Present",

  checkIn: record.checkIn || DEFAULT_CHECK_IN,
  checkOut: record.checkOut || DEFAULT_CHECK_OUT,

  workDayRatio: record.workDayRatio || DEFAULT_WORK_DAY_RATIO,

  workOverTimeRatio: record.workOverTimeRatio || DEFAULT_OVERTIME_RATIO,

  workDaysDeductionRatio:
    record.workDaysDeductionRatio || DEFAULT_DEDUCTION_RATIO,

  workLocation: record.workLocation || "",
  notes: record.notes || "",

  existingId: record.id,
});

// =========================================================
// Main Component
// =========================================================

export default function AttendanceQuickEntry({ onClose, onSaved }) {
  const [date, setDate] = useState(todayStr());
  const [rows, setRows] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // =========================================================
  // Employees
  // =========================================================

  const { data: employees = [], isLoading: isLoadingEmployees } =
    useGetEmployeesSelectQuery();

  // =========================================================
  // Existing Attendance
  // =========================================================

  const {
    data: existingData,
    isLoading: isLoadingExisting,
    isFetching: isFetchingExisting,
  } = useGetEmployeeAttendancesQuery({
    FromDate: date,
    ToDate: date,
    PageSize: 100,
    PageNumber: 1,
  });

  // =========================================================
  // Mutation
  // =========================================================

  const [bulkCreateAttendances] = useBulkCreateEmployeeAttendancesMutation();

  // =========================================================
  // Prepare Existing Records
  // =========================================================

  const existingItems = useMemo(() => {
    return existingData?.items || [];
  }, [existingData]);

  // =========================================================
  // Prepare Rows
  // =========================================================

  useEffect(() => {
    if (!employees?.length || existingData == null) {
      return;
    }

    const map = {};

    // Existing attendance records
    for (const record of existingItems) {
      map[record.employeeId] = normalizeRecord(record);
    }

    // Employees without attendance
    // => Present by default
    for (const employee of employees) {
      if (!map[employee.id]) {
        map[employee.id] = createDefaultRow("Present");
      }
    }

    setRows(map);
  }, [employees, existingData, existingItems, date]);

  // =========================================================
  // Loading
  // =========================================================

  const isLoading =
    isLoadingEmployees || isLoadingExisting || isFetchingExisting;

  // =========================================================
  // Memoized Employee Rows
  // =========================================================

  const employeeRows = useMemo(() => {
    return employees.map((employee, index) => {
      const row = rows[employee.id] || createDefaultRow();

      return {
        employee,
        index,
        employeeId: employee.id,
        row,
        needsTimes: row.status === "Present",
      };
    });
  }, [employees, rows]);

  // =========================================================
  // Statistics
  // =========================================================

  const stats = useMemo(() => {
    const values = Object.values(rows);

    const present = values.filter((row) => row.status === "Present").length;

    const absent = values.filter((row) => row.status === "Absent").length;

    const filled = values.filter((row) => !!row.status).length;

    return {
      total: employees.length,
      filled,
      present,
      absent,
      remaining: Math.max(employees.length - filled, 0),
    };
  }, [rows, employees.length]);

  // =========================================================
  // Status
  // =========================================================

  const setRowStatus = useCallback((employeeId, status) => {
    setRows((current) => {
      const row = current[employeeId] || createDefaultRow();

      const isPresent = status === "Present";

      return {
        ...current,

        [employeeId]: {
          ...row,

          status,

          checkIn: isPresent ? row.checkIn || DEFAULT_CHECK_IN : null,

          checkOut: isPresent ? row.checkOut || DEFAULT_CHECK_OUT : null,

          workDayRatio: row.workDayRatio || DEFAULT_WORK_DAY_RATIO,

          workOverTimeRatio: row.workOverTimeRatio || DEFAULT_OVERTIME_RATIO,

          workDaysDeductionRatio:
            row.workDaysDeductionRatio || DEFAULT_DEDUCTION_RATIO,
        },
      };
    });
  }, []);

  // =========================================================
  // Time
  // =========================================================

  const setRowTime = useCallback((employeeId, field, value) => {
    setRows((current) => ({
      ...current,

      [employeeId]: {
        ...(current[employeeId] || createDefaultRow()),

        [field]: value,
      },
    }));
  }, []);

  // =========================================================
  // Ratio
  // =========================================================

  const setRowRatio = useCallback((employeeId, field, value) => {
    setRows((current) => ({
      ...current,

      [employeeId]: {
        ...(current[employeeId] || createDefaultRow()),

        [field]: value,
      },
    }));
  }, []);

  // =========================================================
  // Mark All Present
  // =========================================================

  const markAllPresent = useCallback(() => {
    if (!employees.length || isSaving) {
      return;
    }

    setRows((current) => {
      const next = {};

      for (const employee of employees) {
        const row = current[employee.id] || createDefaultRow();

        next[employee.id] = {
          ...row,

          status: "Present",

          checkIn: row.checkIn || DEFAULT_CHECK_IN,

          checkOut: row.checkOut || DEFAULT_CHECK_OUT,

          workDayRatio: row.workDayRatio || DEFAULT_WORK_DAY_RATIO,

          workOverTimeRatio: row.workOverTimeRatio || DEFAULT_OVERTIME_RATIO,

          workDaysDeductionRatio:
            row.workDaysDeductionRatio || DEFAULT_DEDUCTION_RATIO,
        };
      }

      return next;
    });

    toast.success("تم تحديد جميع الموظفين كحاضر");
  }, [employees, isSaving]);

  // =========================================================
  // Mark All Absent
  // =========================================================

  const markAllAbsent = useCallback(() => {
    if (!employees.length || isSaving) {
      return;
    }

    setRows((current) => {
      const next = {};

      for (const employee of employees) {
        const row = current[employee.id] || createDefaultRow();

        next[employee.id] = {
          ...row,

          status: "Absent",

          checkIn: null,
          checkOut: null,
        };
      }

      return next;
    });

    toast.success("تم تحديد جميع الموظفين كغائب");
  }, [employees, isSaving]);

  // =========================================================
  // Clear
  // =========================================================

  const clearAll = useCallback(() => {
    if (!employees.length || isSaving) {
      return;
    }

    setRows((current) => {
      const next = {};

      for (const employee of employees) {
        const row = current[employee.id] || createDefaultRow();

        next[employee.id] = {
          ...row,
          status: null,
        };
      }

      return next;
    });

    toast.success("تم مسح حالات الحضور");
  }, [employees, isSaving]);

  // =========================================================
  // Date
  // =========================================================

  const handleDateChange = useCallback((event) => {
    setDate(event.target.value);
    setRows({});
  }, []);

  // =========================================================
  // Save
  // =========================================================

  const handleSaveAll = useCallback(async () => {
    const entries = Object.entries(rows).filter(([, row]) => !!row.status);

    if (!entries.length) {
      toast.error("حدد حالة موظف واحد على الأقل");
      return;
    }

    setIsSaving(true);

    try {
      const attendances = entries.map(([employeeId, row]) => {
        const isPresent = row.status === "Present";

        return {
          employeeId: Number(employeeId),

          status: row.status,

          workDate: date,

          checkIn: isPresent ? row.checkIn || DEFAULT_CHECK_IN : null,

          checkOut: isPresent ? row.checkOut || DEFAULT_CHECK_OUT : null,

          workDayRatio: row.workDayRatio || DEFAULT_WORK_DAY_RATIO,

          workOverTimeRatio: row.workOverTimeRatio || DEFAULT_OVERTIME_RATIO,

          workDaysDeductionRatio:
            row.workDaysDeductionRatio || DEFAULT_DEDUCTION_RATIO,

          workLocation: row.workLocation || "",

          notes: row.notes || "",
        };
      });

      await bulkCreateAttendances({
        attendances,
      }).unwrap();

      toast.success(`تم حفظ حضور ${attendances.length} موظف بنجاح`);

      onSaved?.();
    } catch (error) {
      console.error("Bulk attendance save error:", error);

      toast.error(
        error?.data?.message || error?.message || "حدث خطأ أثناء حفظ الحضور",
      );
    } finally {
      setIsSaving(false);
    }
  }, [rows, date, bulkCreateAttendances, onSaved]);

  // =========================================================
  // Render
  // =========================================================

  return (
    <Modal
      isOpen={true}
      onClose={isSaving ? undefined : onClose}
      wide
      title="تسجيل حضور الموظفين"
    >
      <div
        dir="rtl"
        className="
          w-full
          max-w-[1650px]
          min-w-0
          overflow-hidden
        "
      >
        {/* =====================================================
            Top Description
        ===================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            mb-4
            px-1
          "
        >
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-ink-900">
              تسجيل الحضور اليومي
            </h3>

            <p className="text-xs text-ink-400 mt-1">
              الموظفون الذين لا يملكون سجل حضور يتم اعتبارهم حاضرين تلقائيًا.
            </p>
          </div>

          <div
            className="
              hidden
              sm:flex
              items-center
              gap-2
              shrink-0
              px-3
              py-2
              rounded-lg
              bg-primary-50
              text-primary-700
              text-xs
              font-semibold
            "
          >
            <Clock3 size={14} />

            {date}
          </div>
        </div>

        {/* =====================================================
            Toolbar
        ===================================================== */}

        <div
          className="
            rounded-xl
            border
            border-ink-200/70
            bg-ink-50/40
            p-3
            mb-4
          "
        >
          <div
            className="
              flex
              flex-col
              xl:flex-row
              xl:items-end
              xl:justify-between
              gap-3
            "
          >
            {/* Date */}

            <div className="w-full sm:w-[180px] shrink-0">
              <Input
                label="التاريخ"
                type="date"
                value={date}
                onChange={handleDateChange}
                className="h-[40px]"
              />
            </div>

            {/* Actions */}

            <div
              className="
                flex
                flex-wrap
                gap-2
                xl:justify-end
              "
            >
              {/* All Present */}

              <button
                type="button"
                onClick={markAllPresent}
                disabled={isLoading || isSaving}
                className="
                  group
                  inline-flex
                  items-center
                  justify-center
                  gap-1.5
                  h-10
                  px-3
                  rounded-lg
                  text-xs
                  font-semibold
                  text-emerald-700
                  bg-emerald-50
                  border
                  border-emerald-200
                  hover:bg-emerald-100
                  active:scale-[0.98]
                  transition-all
                  duration-200
                  disabled:opacity-50
                  disabled:pointer-events-none
                "
              >
                <Check
                  size={14}
                  className="
                    transition-transform
                    group-hover:scale-110
                  "
                />
                الكل حاضر
              </button>

              {/* All Absent */}

              <button
                type="button"
                onClick={markAllAbsent}
                disabled={isLoading || isSaving}
                className="
                  group
                  inline-flex
                  items-center
                  justify-center
                  gap-1.5
                  h-10
                  px-3
                  rounded-lg
                  text-xs
                  font-semibold
                  text-negative
                  bg-negative/10
                  border
                  border-negative/20
                  hover:bg-negative/15
                  active:scale-[0.98]
                  transition-all
                  duration-200
                  disabled:opacity-50
                  disabled:pointer-events-none
                "
              >
                <UserX
                  size={14}
                  className="
                    transition-transform
                    group-hover:scale-110
                  "
                />
                الكل غائب
              </button>

              {/* Clear */}

              <button
                type="button"
                onClick={clearAll}
                disabled={isLoading || isSaving}
                className="
                  group
                  inline-flex
                  items-center
                  justify-center
                  gap-1.5
                  h-10
                  px-3
                  rounded-lg
                  text-xs
                  font-medium
                  text-ink-500
                  bg-white
                  border
                  border-ink-200
                  hover:bg-ink-50
                  active:scale-[0.98]
                  transition-all
                  duration-200
                  disabled:opacity-50
                  disabled:pointer-events-none
                "
              >
                <RotateCcw
                  size={13}
                  className="
                    transition-transform
                    duration-300
                    group-hover:rotate-[-90deg]
                  "
                />
                مسح
              </button>
            </div>
          </div>

          {/* ===================================================
              Stats
          =================================================== */}

          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-4
              gap-2
              mt-3
            "
          >
            <Stat
              icon={UserCheck}
              label="حاضر"
              value={stats.present}
              className="
                text-emerald-700
                bg-emerald-50
                border-emerald-100
              "
            />

            <Stat
              icon={UserX}
              label="غائب"
              value={stats.absent}
              className="
                text-negative
                bg-negative/10
                border-negative/10
              "
            />

            <Stat
              icon={Users}
              label="الإجمالي"
              value={stats.total}
              className="
                text-primary-700
                bg-primary-50
                border-primary-100
              "
            />

            <Stat
              icon={Check}
              label="محدد"
              value={stats.filled}
              className="
                text-sky-700
                bg-sky-50
                border-sky-100
              "
            />
          </div>
        </div>

        {/* =====================================================
            Body
        ===================================================== */}

        <div className="relative">
          {isLoading ? (
            <LoadingState />
          ) : !employees.length ? (
            <EmptyState />
          ) : (
            <>
              {/* =================================================
                  Desktop Table
              ================================================= */}

              <div
                className="
                  hidden
                  xl:block
                  rounded-xl
                  border
                  border-ink-200/70
                  bg-white
                  overflow-hidden
                  shadow-sm
                "
              >
                <div
                  className="
                    max-h-[calc(100vh-390px)]
                    min-h-[350px]
                    overflow-auto
                    custom-scroll
                  "
                >
                  <table
                    className="
                      w-full
                      min-w-[1150px]
                      border-collapse
                    "
                  >
                    {/* =================================================
                        Table Header
                    ================================================= */}

                    <thead
                      className="
                        sticky
                        top-0
                        z-20
                        bg-white
                        shadow-[0_1px_0_rgba(0,0,0,0.06)]
                      "
                    >
                      <tr
                        className="
                          bg-ink-50/95
                          backdrop-blur-sm
                        "
                      >
                        <th
                          className="
                            px-4
                            py-3
                            text-right
                            text-[11px]
                            font-bold
                            text-ink-600
                            w-[25%]
                            whitespace-nowrap
                          "
                        >
                          الموظف
                        </th>

                        <th
                          className="
                            px-3
                            py-3
                            text-right
                            text-[11px]
                            font-bold
                            text-ink-600
                            w-[16%]
                            whitespace-nowrap
                          "
                        >
                          الحالة
                        </th>

                        <th
                          className="
                            px-3
                            py-3
                            text-center
                            text-[11px]
                            font-bold
                            text-ink-600
                            w-[22%]
                            whitespace-nowrap
                          "
                        >
                          الحضور والانصراف
                        </th>

                        <th
                          className="
                            px-3
                            py-3
                            text-center
                            text-[11px]
                            font-bold
                            text-ink-600
                            w-[12%]
                            whitespace-nowrap
                          "
                        >
                          يوم العمل
                        </th>

                        <th
                          className="
                            px-3
                            py-3
                            text-center
                            text-[11px]
                            font-bold
                            text-ink-600
                            w-[12%]
                            whitespace-nowrap
                          "
                        >
                          الإضافي
                        </th>

                        <th
                          className="
                            px-3
                            py-3
                            text-center
                            text-[11px]
                            font-bold
                            text-ink-600
                            w-[13%]
                            whitespace-nowrap
                          "
                        >
                          خصم الأيام
                        </th>
                      </tr>
                    </thead>

                    {/* =================================================
                        Table Body
                    ================================================= */}

                    <tbody>
                      {employeeRows.map(
                        ({ employee, index, employeeId, row, needsTimes }) => (
                          <AttendanceTableRow
                            key={employeeId}
                            employee={employee}
                            index={index}
                            employeeId={employeeId}
                            row={row}
                            needsTimes={needsTimes}
                            isSaving={isSaving}
                            onStatusChange={setRowStatus}
                            onTimeChange={setRowTime}
                            onRatioChange={setRowRatio}
                          />
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* =================================================
                  Mobile / Tablet
              ================================================= */}

              <div
                className="
                  xl:hidden
                  space-y-2
                  max-h-[calc(100vh-380px)]
                  overflow-y-auto
                  custom-scroll
                  pr-0.5
                "
              >
                {employeeRows.map(
                  ({ employee, index, employeeId, row, needsTimes }) => (
                    <AttendanceMobileCard
                      key={employeeId}
                      employee={employee}
                      index={index}
                      employeeId={employeeId}
                      row={row}
                      needsTimes={needsTimes}
                      isSaving={isSaving}
                      onStatusChange={setRowStatus}
                      onTimeChange={setRowTime}
                      onRatioChange={setRowRatio}
                    />
                  ),
                )}
              </div>
            </>
          )}
        </div>

        {/* =====================================================
            Footer
        ===================================================== */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-3
            pt-4
            mt-4
            border-t
            border-ink-200/70
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              text-xs
              text-ink-400
            "
          >
            <span>تم تحديد</span>

            <strong
              className="
                px-2
                py-1
                rounded-md
                bg-primary-50
                text-primary-700
              "
            >
              {stats.filled}
            </strong>

            <span>من {stats.total}</span>

            {stats.remaining > 0 && (
              <span className="text-ink-300">({stats.remaining} متبقي)</span>
            )}
          </div>

          <div
            className="
              flex
              items-center
              gap-2
              w-full
              sm:w-auto
            "
          >
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 sm:flex-none"
            >
              إلغاء
            </Button>

            <Button
              onClick={handleSaveAll}
              disabled={isSaving || isLoading || stats.filled === 0}
              className="
                flex-1
                sm:flex-none
                min-w-[120px]
              "
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}

              {isSaving ? "جارِ الحفظ..." : `حفظ (${stats.filled})`}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// =========================================================
// Desktop Table Row
// =========================================================

function AttendanceTableRow({
  employee,
  index,
  employeeId,
  row,
  needsTimes,
  isSaving,
  onStatusChange,
  onTimeChange,
  onRatioChange,
}) {
  return (
    <tr
      className="
        group
        border-b
        border-ink-200/50
        last:border-b-0
        hover:bg-primary-50/[0.16]
        transition-colors
        duration-200
      "
    >
      {/* Employee */}

      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="
              w-9
              h-9
              rounded-full
              shrink-0
              flex
              items-center
              justify-center
              bg-primary-50
              text-primary-700
              text-xs
              font-bold
              transition-transform
              duration-200
              group-hover:scale-105
            "
          >
            {index + 1}
          </div>

          <div className="min-w-0">
            <div
              className="
                text-sm
                font-semibold
                text-ink-900
                truncate
              "
              title={employee.name}
            >
              {employee.name}
            </div>

            <div
              className="
                text-[10px]
                text-ink-400
                mt-0.5
              "
            >
              كود الموظف: {employeeId}
            </div>
          </div>
        </div>
      </td>

      {/* Status */}

      <td className="px-3 py-3 align-middle">
        <StatusButtons
          employeeId={employeeId}
          status={row.status}
          isSaving={isSaving}
          onChange={onStatusChange}
        />
      </td>

      {/* Time */}

      <td className="px-3 py-3 align-middle">
        <TimeControls
          employeeId={employeeId}
          row={row}
          needsTimes={needsTimes}
          isSaving={isSaving}
          onChange={onTimeChange}
        />
      </td>

      {/* Work Day */}

      <td className="px-3 py-3 align-middle">
        <CompactSelect
          options={WORK_DAY_RATIOS}
          value={row.workDayRatio || DEFAULT_WORK_DAY_RATIO}
          onChange={(value) => onRatioChange(employeeId, "workDayRatio", value)}
          isDisabled={isSaving}
          placeholder="يوم العمل"
        />
      </td>

      {/* Overtime */}

      <td className="px-3 py-3 align-middle">
        <CompactSelect
          options={WORK_DAY_RATIOS}
          value={row.workOverTimeRatio || DEFAULT_OVERTIME_RATIO}
          onChange={(value) =>
            onRatioChange(employeeId, "workOverTimeRatio", value)
          }
          isDisabled={isSaving}
          placeholder="الإضافي"
        />
      </td>

      {/* Deduction */}

      <td className="px-3 py-3 align-middle">
        <CompactSelect
          options={WORK_DAY_RATIOS}
          value={row.workDaysDeductionRatio || DEFAULT_DEDUCTION_RATIO}
          onChange={(value) =>
            onRatioChange(employeeId, "workDaysDeductionRatio", value)
          }
          isDisabled={isSaving}
          placeholder="الخصم"
        />
      </td>
    </tr>
  );
}

// =========================================================
// Mobile Card
// =========================================================

function AttendanceMobileCard({
  employee,
  index,
  employeeId,
  row,
  needsTimes,
  isSaving,
  onStatusChange,
  onTimeChange,
  onRatioChange,
}) {
  return (
    <div
      className="
        group
        rounded-xl
        border
        border-ink-200/70
        bg-white
        p-3
        shadow-sm
        hover:border-primary-200
        hover:shadow-md
        transition-all
        duration-200
      "
    >
      {/* Header */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-3
          mb-3
        "
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="
              w-9
              h-9
              rounded-full
              shrink-0
              flex
              items-center
              justify-center
              bg-primary-50
              text-primary-700
              text-xs
              font-bold
            "
          >
            {index + 1}
          </div>

          <div className="min-w-0">
            <div
              className="
                text-sm
                font-semibold
                text-ink-900
                truncate
              "
            >
              {employee.name}
            </div>

            <div
              className="
                text-[10px]
                text-ink-400
                mt-0.5
              "
            >
              كود الموظف: {employeeId}
            </div>
          </div>
        </div>

        <StatusButtons
          employeeId={employeeId}
          status={row.status}
          isSaving={isSaving}
          compact
          onChange={onStatusChange}
        />
      </div>

      {/* Time */}

      <div
        className="
          rounded-lg
          border
          border-ink-200/70
          bg-ink-50/30
          p-3
          mb-3
        "
      >
        <div
          className="
            flex
            items-center
            gap-1.5
            text-[10px]
            font-semibold
            text-ink-500
            mb-2
          "
        >
          <Clock3 size={12} />
          الحضور والانصراف
        </div>

        <TimeControls
          employeeId={employeeId}
          row={row}
          needsTimes={needsTimes}
          isSaving={isSaving}
          mobile
          onChange={onTimeChange}
        />
      </div>

      {/* Ratios */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-3
          gap-2
        "
      >
        <MobileRatio
          label="يوم العمل"
          value={row.workDayRatio || DEFAULT_WORK_DAY_RATIO}
          disabled={isSaving}
          onChange={(value) => onRatioChange(employeeId, "workDayRatio", value)}
        />

        <MobileRatio
          label="العمل الإضافي"
          value={row.workOverTimeRatio || DEFAULT_OVERTIME_RATIO}
          disabled={isSaving}
          onChange={(value) =>
            onRatioChange(employeeId, "workOverTimeRatio", value)
          }
        />

        <MobileRatio
          label="خصم أيام العمل"
          value={row.workDaysDeductionRatio || DEFAULT_DEDUCTION_RATIO}
          disabled={isSaving}
          onChange={(value) =>
            onRatioChange(employeeId, "workDaysDeductionRatio", value)
          }
        />
      </div>
    </div>
  );
}

// =========================================================
// Status Buttons
// =========================================================

function StatusButtons({
  employeeId,
  status,
  isSaving,
  onChange,
  compact = false,
}) {
  return (
    <div
      className={`
        flex
        ${compact ? "gap-1" : "flex-wrap gap-1.5"}
      `}
    >
      {STATUS_PILLS.map((pill) => {
        const Icon = pill.icon;
        const active = status === pill.value;

        return (
          <button
            key={pill.value}
            type="button"
            onClick={() => onChange(employeeId, pill.value)}
            disabled={isSaving}
            aria-pressed={active}
            className={`
              inline-flex
              items-center
              justify-center
              gap-1
              ${compact ? "h-8 px-2" : "h-9 px-2.5"}
              rounded-lg
              border
              text-[10px]
              font-semibold
              transition-all
              duration-200
              active:scale-[0.96]
              disabled:opacity-50
              disabled:pointer-events-none
              ${
                active
                  ? pill.activeClass
                  : "text-ink-400 border-ink-200 bg-white hover:bg-ink-50"
              }
            `}
          >
            <Icon size={compact ? 12 : 13} />

            <span>{compact ? pill.shortLabel : pill.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// =========================================================
// Time Controls
// =========================================================

function TimeControls({
  employeeId,
  row,
  needsTimes,
  isSaving,
  onChange,
  mobile = false,
}) {
  if (!needsTimes) {
    return (
      <div
        className={`
          ${mobile ? "w-full" : "mx-auto w-fit"}
          h-[38px]
          px-3
          rounded-lg
          bg-ink-50
          border
          border-ink-100
          flex
          items-center
          justify-center
          text-xs
          text-ink-400
        `}
      >
        لا يوجد وقت
      </div>
    );
  }

  return (
    <div
      className={`
        flex
        items-center
        justify-center
        gap-2
        ${mobile ? "w-full" : ""}
      `}
    >
      <TimeInput
        label="دخول"
        value={row.checkIn || DEFAULT_CHECK_IN}
        disabled={isSaving}
        onChange={(value) => onChange(employeeId, "checkIn", value)}
      />

      <span className="mt-4 text-xs text-ink-300 shrink-0">→</span>

      <TimeInput
        label="خروج"
        value={row.checkOut || DEFAULT_CHECK_OUT}
        disabled={isSaving}
        onChange={(value) => onChange(employeeId, "checkOut", value)}
      />
    </div>
  );
}

// =========================================================
// Time Input
// =========================================================

function TimeInput({ label, value, disabled, onChange }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span
        className="
          text-[9px]
          text-ink-400
          font-medium
        "
      >
        {label}
      </span>

      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="
          h-[38px]
          w-[88px]
          text-xs
          border
          border-ink-200
          rounded-lg
          px-2
          bg-white
          outline-none
          transition-all
          duration-200
          hover:border-ink-300
          focus:border-primary-400
          focus:ring-2
          focus:ring-primary-500/10
          disabled:opacity-50
        "
      />
    </div>
  );
}

// =========================================================
// Mobile Ratio
// =========================================================

function MobileRatio({ label, value, disabled, onChange }) {
  return (
    <div
      className="
        rounded-lg
        border
        border-ink-200/70
        p-2.5
        bg-white
      "
    >
      <div
        className="
          text-[10px]
          font-semibold
          text-ink-500
          mb-1.5
        "
      >
        {label}
      </div>

      <CompactSelect
        options={WORK_DAY_RATIOS}
        value={value}
        onChange={onChange}
        isDisabled={disabled}
        placeholder={label}
      />
    </div>
  );
}

// =========================================================
// Loading
// =========================================================

function LoadingState() {
  return (
    <div
      className="
        min-h-[350px]
        rounded-xl
        border
        border-ink-200/70
        bg-white
        flex
        flex-col
        items-center
        justify-center
        animate-pulse
      "
    >
      <div
        className="
          w-12
          h-12
          rounded-full
          bg-primary-50
          flex
          items-center
          justify-center
        "
      >
        <Loader2
          size={24}
          className="
            animate-spin
            text-primary-600
          "
        />
      </div>

      <p
        className="
          text-sm
          font-medium
          text-ink-500
          mt-3
        "
      >
        جارِ تحميل بيانات الحضور...
      </p>

      <p
        className="
          text-xs
          text-ink-300
          mt-1
        "
      >
        يرجى الانتظار
      </p>
    </div>
  );
}

// =========================================================
// Empty
// =========================================================

function EmptyState() {
  return (
    <div
      className="
        min-h-[350px]
        rounded-xl
        border
        border-dashed
        border-ink-200
        bg-ink-50/30
        flex
        flex-col
        items-center
        justify-center
        text-center
      "
    >
      <div
        className="
          w-12
          h-12
          rounded-full
          bg-ink-100
          text-ink-400
          flex
          items-center
          justify-center
        "
      >
        <Users size={22} />
      </div>

      <p
        className="
          text-sm
          font-semibold
          text-ink-600
          mt-3
        "
      >
        لا يوجد موظفون
      </p>

      <p
        className="
          text-xs
          text-ink-400
          mt-1
        "
      >
        لا يوجد موظفون متاحون لتسجيل الحضور.
      </p>
    </div>
  );
}

// =========================================================
// Stat
// =========================================================

function Stat({ icon: Icon, label, value, className }) {
  return (
    <div
      className={`
        flex
        items-center
        justify-between
        gap-2
        px-3
        py-2
        rounded-lg
        border
        text-[11px]
        font-medium
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-sm
        ${className}
      `}
    >
      <div className="flex items-center gap-1.5">
        <Icon size={13} />

        <span>{label}</span>
      </div>

      <strong className="text-sm">{value}</strong>
    </div>
  );
}
