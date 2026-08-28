import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  RotateCcw,
  Check,
  X,
  Clock3,
  Users,
  UserCheck,
  UserX,
  Save,
  CalendarDays,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import {
  useBulkCreateEmployeeAttendancesMutation,
  useGetEmployeeAttendancesQuery,
  useGetEmployeesSelectQuery,
} from "../payrollApi";

import { attendanceStatusBadge, ATTENDANCE_STATUS } from "../payroll.constants";

import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";

const DEFAULT_CHECK_IN = "09:00";
const DEFAULT_CHECK_OUT = "17:00";

const STATUS = {
  PRESENT: "Present",
  ABSENT: "Absent",
  NOT_RECORDED: "NotRecorded",
};

const RATIO = {
  FULL_DAY: 1,
  THREE_QUARTER_DAY: 2,
  HALF_DAY: 3,
  THIRD_DAY: 4,
  QUARTER_DAY: 5,
};

const ratioOptions = [
  {
    value: RATIO.FULL_DAY,
    label: "يوم كامل",
  },
  {
    value: RATIO.THREE_QUARTER_DAY,
    label: "ثلاثة أرباع يوم",
  },
  {
    value: RATIO.HALF_DAY,
    label: "نصف يوم",
  },
  {
    value: RATIO.THIRD_DAY,
    label: "ثلث يوم",
  },
  {
    value: RATIO.QUARTER_DAY,
    label: "ربع يوم",
  },
];

function getToday() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeValue(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return String(value);
}

function normalizeRatio(value, fallback = RATIO.FULL_DAY) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "number") {
    return value >= 1 && value <= 5 ? value : fallback;
  }

  const numericValue = Number(value);

  if (
    Number.isInteger(numericValue) &&
    numericValue >= 1 &&
    numericValue <= 5
  ) {
    return numericValue;
  }

  const normalized = String(value).toLowerCase();

  const map = {
    fullday: RATIO.FULL_DAY,
    "full day": RATIO.FULL_DAY,
    threequarterday: RATIO.THREE_QUARTER_DAY,
    "three quarter day": RATIO.THREE_QUARTER_DAY,
    halfday: RATIO.HALF_DAY,
    "half day": RATIO.HALF_DAY,
    thirdday: RATIO.THIRD_DAY,
    "third day": RATIO.THIRD_DAY,
    quarterday: RATIO.QUARTER_DAY,
    "quarter day": RATIO.QUARTER_DAY,
  };

  return map[normalized] ?? fallback;
}

function toApiTime(value) {
  if (!value) {
    return null;
  }

  return value.length === 5 ? `${value}:00` : value;
}

export default function AttendanceTakingPage() {
  const [workDate, setWorkDate] = useState(getToday());

  const [defaultCheckIn, setDefaultCheckIn] = useState(DEFAULT_CHECK_IN);

  const [defaultCheckOut, setDefaultCheckOut] = useState(DEFAULT_CHECK_OUT);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});

  const { data: employees, isLoading: employeesLoading } =
    useGetEmployeesSelectQuery();

  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    isFetching: attendanceFetching,
    isError,
    refetch,
  } = useGetEmployeeAttendancesQuery({
    PageNumber: 1,
    PageSize: 100,
    WorkDateFrom: workDate,
    WorkDateTo: workDate,
  });

  const [createAttendancesBulk, { isLoading: isSaving }] =
    useBulkCreateEmployeeAttendancesMutation();

  const existingAttendance = useMemo(() => {
    const map = {};
    const rows = attendanceData?.items || [];

    rows.forEach((row) => {
      if (!row?.employeeId) {
        return;
      }

      map[String(row.employeeId)] = row;
    });

    return map;
  }, [attendanceData]);

  const employeeRows = useMemo(() => {
    const list = employees || [];

    return list.map((employee) => {
      const id = String(employee.id);
      const existing = existingAttendance[id];
      const local = attendanceMap[id];

      return {
        employee,
        id,
        existing,

        status: local?.status ?? existing?.status ?? STATUS.NOT_RECORDED,

        checkIn:
          local?.checkIn ??
          (normalizeValue(existing?.checkIn) ||
            (existing ? "" : defaultCheckIn)),

        checkOut:
          local?.checkOut ??
          (normalizeValue(existing?.checkOut) ||
            (existing ? "" : defaultCheckOut)),

        workDayRatio: normalizeRatio(
          local?.workDayRatio ?? existing?.workDayRatio ?? RATIO.FULL_DAY,
        ),

        workOverTimeRatio:
          local?.workOverTimeRatio !== undefined
            ? normalizeRatio(local.workOverTimeRatio, null)
            : normalizeRatio(existing?.workOverTimeRatio, null),

        workDaysDeductionRatio:
          local?.workDaysDeductionRatio !== undefined
            ? normalizeRatio(local.workDaysDeductionRatio, null)
            : normalizeRatio(existing?.workDaysDeductionRatio, null),

        workLocation: local?.workLocation ?? existing?.workLocation ?? null,

        notes: local?.notes ?? existing?.notes ?? "",
      };
    });
  }, [
    employees,
    existingAttendance,
    attendanceMap,
    defaultCheckIn,
    defaultCheckOut,
  ]);

  const filteredRows = useMemo(() => {
    const value = search.trim().toLowerCase();

    return employeeRows.filter((row) => {
      const name = String(row.employee?.name || "").toLowerCase();
      const id = String(row.employee?.id || "").toLowerCase();

      const matchesSearch =
        !value || name.includes(value) || id.includes(value);

      const matchesStatus = !statusFilter || row.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [employeeRows, search, statusFilter]);

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let notRecorded = 0;

    employeeRows.forEach((row) => {
      if (row.status === STATUS.PRESENT) {
        present++;
      } else if (row.status === STATUS.ABSENT) {
        absent++;
      } else {
        notRecorded++;
      }
    });

    return {
      total: employeeRows.length,
      present,
      absent,
      notRecorded,
    };
  }, [employeeRows]);

  const toggleEmployee = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const selectAllFiltered = () => {
    const ids = filteredRows.map((row) => row.id);

    setSelectedIds((current) => Array.from(new Set([...current, ...ids])));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const isSelected = (id) => selectedIds.includes(id);

  const updateRow = (id, field, value) => {
    setAttendanceMap((current) => ({
      ...current,
      [id]: {
        ...(current[id] || {}),
        [field]: value,
      },
    }));
  };

  const setEmployeeStatus = (id, status) => {
    setAttendanceMap((current) => ({
      ...current,
      [id]: {
        ...(current[id] || {}),
        status,

        ...(status === STATUS.ABSENT
          ? {
              checkIn: "",
              checkOut: "",
            }
          : {
              checkIn: current[id]?.checkIn || defaultCheckIn,
              checkOut: current[id]?.checkOut || defaultCheckOut,
              workDayRatio: current[id]?.workDayRatio ?? RATIO.FULL_DAY,
            }),
      },
    }));
  };

  const bulkSetStatus = (status) => {
    if (!selectedIds.length) {
      toast.error("اختر الموظفين أولاً");
      return;
    }

    setAttendanceMap((current) => {
      const next = { ...current };

      selectedIds.forEach((id) => {
        next[id] = {
          ...(next[id] || {}),
          status,

          ...(status === STATUS.ABSENT
            ? {
                checkIn: "",
                checkOut: "",
              }
            : {
                checkIn: next[id]?.checkIn || defaultCheckIn,
                checkOut: next[id]?.checkOut || defaultCheckOut,
                workDayRatio: next[id]?.workDayRatio ?? RATIO.FULL_DAY,
              }),
        };
      });

      return next;
    });

    toast.success(
      status === STATUS.PRESENT
        ? `تم تحديد ${selectedIds.length} موظف كحاضر`
        : `تم تحديد ${selectedIds.length} موظف كغائب`,
    );
  };

  const markAllPresent = () => {
    if (!filteredRows.length) {
      return;
    }

    setAttendanceMap((current) => {
      const next = { ...current };

      filteredRows.forEach((row) => {
        next[row.id] = {
          ...(next[row.id] || {}),
          status: STATUS.PRESENT,
          checkIn: next[row.id]?.checkIn || defaultCheckIn,
          checkOut: next[row.id]?.checkOut || defaultCheckOut,
          workDayRatio: next[row.id]?.workDayRatio ?? RATIO.FULL_DAY,
        };
      });

      return next;
    });

    toast.success(`تم تحديد ${filteredRows.length} موظف كحاضر`);
  };

  const markAllAbsent = () => {
    if (!filteredRows.length) {
      return;
    }

    setAttendanceMap((current) => {
      const next = { ...current };

      filteredRows.forEach((row) => {
        next[row.id] = {
          ...(next[row.id] || {}),
          status: STATUS.ABSENT,
          checkIn: "",
          checkOut: "",
        };
      });

      return next;
    });

    toast.success(`تم تحديد ${filteredRows.length} موظف كغائب`);
  };

  const applyDefaultTimes = () => {
    const targetIds = selectedIds.length
      ? selectedIds
      : filteredRows.map((row) => row.id);

    if (!targetIds.length) {
      toast.error(
        "اختر موظفًا واحدًا على الأقل أو استخدم قائمة الموظفين الظاهرة",
      );
      return;
    }

    setAttendanceMap((current) => {
      const next = { ...current };

      targetIds.forEach((id) => {
        const row = employeeRows.find((item) => item.id === id);

        if (!row || row.status === STATUS.ABSENT) {
          return;
        }

        next[id] = {
          ...(next[id] || {}),
          status: STATUS.PRESENT,
          checkIn: defaultCheckIn,
          checkOut: defaultCheckOut,
          workDayRatio: next[id]?.workDayRatio ?? RATIO.FULL_DAY,
        };
      });

      return next;
    });

    toast.success(
      `تم تطبيق ${defaultCheckIn} - ${defaultCheckOut} على ${targetIds.length} موظف`,
    );
  };

  const handleReset = () => {
    setAttendanceMap({});
    setSelectedIds([]);
  };

  const handleSave = async () => {
    if (!employeeRows.length) {
      toast.error("لا يوجد موظفون للتسجيل");
      return;
    }

    const rowsToSave = employeeRows.filter(
      (row) => row.status !== STATUS.NOT_RECORDED,
    );

    if (!rowsToSave.length) {
      toast.error("حدد حالة موظف واحد على الأقل");
      return;
    }

    const invalidPresent = rowsToSave.find(
      (row) => row.status === STATUS.PRESENT && !row.checkIn,
    );

    if (invalidPresent) {
      toast.error(
        `يجب تحديد وقت الحضور للموظف ${invalidPresent.employee.name}`,
      );
      return;
    }

    const newRows = rowsToSave.filter((row) => !row.existing);

    if (!newRows.length) {
      toast.info("لا توجد سجلات جديدة للحفظ");
      return;
    }

    const payload = {
      attendances: newRows.map((row) => ({
        employeeId: Number(row.employee.id),

        status: row.status === STATUS.PRESENT ? 0 : 1,

        workDate,

        checkIn: row.status === STATUS.PRESENT ? toApiTime(row.checkIn) : null,

        checkOut:
          row.status === STATUS.PRESENT ? toApiTime(row.checkOut) : null,

        workDayRatio:
          row.status === STATUS.PRESENT
            ? normalizeRatio(row.workDayRatio, RATIO.FULL_DAY)
            : null,

        workOverTimeRatio:
          row.status === STATUS.PRESENT && row.workOverTimeRatio
            ? normalizeRatio(row.workOverTimeRatio, null)
            : null,

        workDaysDeductionRatio: row.workDaysDeductionRatio
          ? normalizeRatio(row.workDaysDeductionRatio, null)
          : null,

        workLocation: row.workLocation || null,

        notes: row.notes?.trim() || null,
      })),
    };

    try {
      await createAttendancesBulk(payload).unwrap();

      toast.success(`تم تسجيل حضور ${newRows.length} موظف بنجاح`);

      setAttendanceMap({});
      setSelectedIds([]);

      await refetch();
    } catch (error) {
      console.error("Bulk attendance save error:", error);

      const validationError =
        error?.data?.errors?.["$.attendances[0].workDayRatio"]?.[0];

      toast.error(
        validationError ||
          error?.data?.message ||
          error?.data?.title ||
          "حدث خطأ أثناء حفظ الحضور",
      );
    }
  };

  const isLoading = employeesLoading || attendanceLoading;

  return (
    <div className="animate-fadeUp space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            تسجيل الحضور والانصراف
          </h2>

          <p className="text-sm text-ink-400 mt-1">
            تسجيل حضور وغياب الموظفين بشكل فردي أو جماعي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            <RotateCcw size={15} />
            إعادة ضبط
          </Button>

          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}

            {isSaving ? "جارِ الحفظ..." : "حفظ الحضور"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="col-span-2 md:col-span-1 rounded-2xl border border-ink-400/10 bg-white shadow-card p-3">
          <label className="block text-xs font-medium text-ink-400 mb-1.5">
            تاريخ الحضور
          </label>

          <div className="relative">
            <CalendarDays
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
            />

            <input
              type="date"
              value={workDate}
              onChange={(event) => {
                setWorkDate(event.target.value);
                setAttendanceMap({});
                setSelectedIds([]);
              }}
              className="w-full h-9 rounded-lg border border-ink-400/15 bg-white pr-9 pl-3 text-sm outline-none focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        <SummaryCard
          icon={Users}
          label="إجمالي الموظفين"
          value={summary.total}
        />

        <SummaryCard
          icon={UserCheck}
          label="حاضر"
          value={summary.present}
          tone="positive"
        />

        <SummaryCard
          icon={UserX}
          label="غائب"
          value={summary.absent}
          tone="negative"
        />

        <SummaryCard
          icon={Clock3}
          label="لم يسجل"
          value={summary.notRecorded}
        />
      </div>

      <div className="rounded-2xl border border-primary-500/15 bg-primary-50/30 p-4">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink-900">
              أوقات الحضور والانصراف الافتراضية
            </p>

            <p className="text-[11px] text-ink-400 mt-1">
              تستخدم تلقائيًا عند تحديد الموظف كحاضر
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
            <div>
              <label className="block text-xs font-medium text-ink-400 mb-1.5">
                وقت الدخول الافتراضي
              </label>

              <input
                type="time"
                value={defaultCheckIn}
                onChange={(event) => setDefaultCheckIn(event.target.value)}
                className="h-9 w-full sm:w-[130px] rounded-lg border border-ink-400/15 bg-white px-2 text-sm num outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-400 mb-1.5">
                وقت الانصراف الافتراضي
              </label>

              <input
                type="time"
                value={defaultCheckOut}
                onChange={(event) => setDefaultCheckOut(event.target.value)}
                className="h-9 w-full sm:w-[130px] rounded-lg border border-ink-400/15 bg-white px-2 text-sm num outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <Button
              variant="outline"
              className="h-9"
              onClick={applyDefaultTimes}
              disabled={
                !defaultCheckIn || !defaultCheckOut || !filteredRows.length
              }
            >
              <Clock3 size={14} />
              تطبيق على {selectedIds.length ? "المحدد" : "الظاهر"}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-ink-400 mb-1">
              البحث عن موظف
            </label>

            <div className="relative">
              <Search
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث باسم الموظف أو الرقم..."
                className="w-full h-9 rounded-lg border border-ink-400/15 bg-white pr-9 pl-3 text-sm outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              حالة التسجيل
            </label>

            <CompactSelect
              options={[
                {
                  value: STATUS.PRESENT,
                  label: "الحاضر",
                },
                {
                  value: STATUS.ABSENT,
                  label: "الغائب",
                },
                {
                  value: STATUS.NOT_RECORDED,
                  label: "لم يسجل",
                },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="كل الحالات"
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full h-9"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
              }}
            >
              <RotateCcw size={14} />
              تصفير الفلاتر
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-primary-500/15 bg-primary-50/40 p-3">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-600 flex items-center justify-center">
              <Users size={17} />
            </div>

            <div>
              <p className="text-sm font-semibold text-ink-900">
                التسجيل الجماعي
              </p>

              <p className="text-[11px] text-ink-400">
                المحدد حاليًا:{" "}
                <span className="font-semibold text-primary-600">
                  {selectedIds.length}
                </span>{" "}
                موظف
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="h-9"
              onClick={selectAllFiltered}
              disabled={!filteredRows.length}
            >
              <CheckCircle2 size={14} />
              تحديد الظاهر
            </Button>

            <Button
              variant="outline"
              className="h-9"
              onClick={clearSelection}
              disabled={!selectedIds.length}
            >
              إلغاء التحديد
            </Button>

            <Button
              className="h-9"
              onClick={() => bulkSetStatus(STATUS.PRESENT)}
              disabled={!selectedIds.length}
            >
              <UserCheck size={14} />
              المحدد حاضر
            </Button>

            <Button
              variant="outline"
              className="h-9 text-negative"
              onClick={() => bulkSetStatus(STATUS.ABSENT)}
              disabled={!selectedIds.length}
            >
              <UserX size={14} />
              المحدد غائب
            </Button>

            <Button
              variant="outline"
              className="h-9"
              onClick={markAllPresent}
              disabled={!filteredRows.length}
            >
              <Check size={14} />
              الكل حاضر
            </Button>

            <Button
              variant="outline"
              className="h-9 text-negative"
              onClick={markAllAbsent}
              disabled={!filteredRows.length}
            >
              <X size={14} />
              الكل غائب
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <AttendanceTableSkeleton />
      ) : isError ? (
        <div className="text-center py-14 border border-dashed border-negative/25 bg-negative/[0.02] rounded-2xl">
          <AlertCircle size={32} className="mx-auto text-negative/70 mb-3" />

          <p className="text-ink-900 font-medium text-sm">
            حدث خطأ في تحميل بيانات الموظفين
          </p>

          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 text-xs font-medium text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors mt-3"
          >
            <RotateCcw size={13} />
            إعادة المحاولة
          </button>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-ink-400/20 rounded-2xl">
          <Users size={30} className="mx-auto text-ink-400/50 mb-3" />

          <p className="text-ink-900 font-medium text-sm">لا توجد نتائج</p>

          <p className="text-xs text-ink-400 mt-1">
            جرّب تغيير البحث أو الفلتر
          </p>
        </div>
      ) : (
        <>
          <div
            className={`
              overflow-x-auto
              custom-scroll
              rounded-2xl
              border
              border-ink-400/10
              bg-white
              shadow-card
              transition-opacity
              duration-200
              ${attendanceFetching ? "opacity-60" : ""}
            `}
          >
            <table className="w-full text-right border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
                  <th className="p-2.5 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredRows.length > 0 &&
                        filteredRows.every((row) =>
                          selectedIds.includes(row.id),
                        )
                      }
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectAllFiltered();
                        } else {
                          const ids = new Set(
                            filteredRows.map((row) => row.id),
                          );

                          setSelectedIds((current) =>
                            current.filter((id) => !ids.has(id)),
                          );
                        }
                      }}
                      className="accent-primary-500"
                    />
                  </th>

                  <th className="p-2.5 font-medium">الموظف</th>

                  <th className="p-2.5 font-medium">الحالة</th>

                  <th className="p-2.5 font-medium">وقت الحضور</th>

                  <th className="p-2.5 font-medium">وقت الانصراف</th>

                  <th className="p-2.5 font-medium">نسبة اليوم</th>

                  <th className="p-2.5 font-medium">الإضافي</th>

                  <th className="p-2.5 font-medium">الخصم</th>

                  <th className="p-2.5 font-medium">ملاحظات</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row, index) => {
                  const present = row.status === STATUS.PRESENT;

                  const absent = row.status === STATUS.ABSENT;

                  const recorded = row.status !== STATUS.NOT_RECORDED;

                  return (
                    <tr
                      key={row.id}
                      className={`
                        border-b
                        border-ink-400/5
                        last:border-0
                        transition-colors
                        ${
                          isSelected(row.id)
                            ? "bg-primary-50/50"
                            : "hover:bg-primary-50/20"
                        }
                        animate-fadeUp
                      `}
                      style={{
                        animationDelay: `${Math.min(index, 12) * 20}ms`,
                      }}
                    >
                      <td className="p-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected(row.id)}
                          onChange={() => toggleEmployee(row.id)}
                          className="accent-primary-500"
                        />
                      </td>

                      <td className="p-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                            <Users size={15} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-medium text-ink-900 truncate max-w-[220px]">
                              {row.employee.name}
                            </p>

                            <p className="text-[10px] text-ink-400 num">
                              #{row.employee.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-2.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setEmployeeStatus(row.id, STATUS.PRESENT)
                            }
                            className={`
                              inline-flex items-center gap-1
                              px-2.5 py-1
                              rounded-lg
                              text-[11px]
                              font-semibold
                              transition-colors
                              ${
                                present
                                  ? "bg-positive/10 text-positive"
                                  : "bg-ink-400/5 text-ink-400 hover:bg-positive/10 hover:text-positive"
                              }
                            `}
                          >
                            <Check size={12} />
                            حاضر
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setEmployeeStatus(row.id, STATUS.ABSENT)
                            }
                            className={`
                              inline-flex items-center gap-1
                              px-2.5 py-1
                              rounded-lg
                              text-[11px]
                              font-semibold
                              transition-colors
                              ${
                                absent
                                  ? "bg-negative/10 text-negative"
                                  : "bg-ink-400/5 text-ink-400 hover:bg-negative/10 hover:text-negative"
                              }
                            `}
                          >
                            <X size={12} />
                            غائب
                          </button>

                          {recorded && (
                            <span
                              className={`
                                text-[10px]
                                px-1.5
                                py-0.5
                                rounded-full
                                ${
                                  attendanceStatusBadge[row.status] ||
                                  "text-ink-400 bg-ink-400/10"
                                }
                              `}
                            >
                              {ATTENDANCE_STATUS[row.status] || row.status}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-2.5">
                        <input
                          type="time"
                          value={present ? row.checkIn : ""}
                          disabled={!present}
                          onChange={(event) =>
                            updateRow(row.id, "checkIn", event.target.value)
                          }
                          className="h-8 rounded-lg border border-ink-400/15 px-2 text-xs num outline-none focus:border-primary-500 disabled:bg-ink-400/5 disabled:text-ink-400/50"
                        />
                      </td>

                      <td className="p-2.5">
                        <input
                          type="time"
                          value={present ? row.checkOut : ""}
                          disabled={!present}
                          onChange={(event) =>
                            updateRow(row.id, "checkOut", event.target.value)
                          }
                          className="h-8 rounded-lg border border-ink-400/15 px-2 text-xs num outline-none focus:border-primary-500 disabled:bg-ink-400/5 disabled:text-ink-400/50"
                        />
                      </td>

                      <td className="p-2.5 min-w-[150px]">
                        <CompactSelect
                          options={ratioOptions}
                          value={present ? row.workDayRatio : ""}
                          onChange={(value) =>
                            updateRow(
                              row.id,
                              "workDayRatio",
                              normalizeRatio(value, RATIO.FULL_DAY),
                            )
                          }
                          placeholder="نسبة اليوم"
                          isDisabled={!present}
                        />
                      </td>

                      <td className="p-2.5 min-w-[140px]">
                        <CompactSelect
                          options={ratioOptions}
                          value={present ? row.workOverTimeRatio || "" : ""}
                          onChange={(value) =>
                            updateRow(
                              row.id,
                              "workOverTimeRatio",
                              value ? normalizeRatio(value, null) : null,
                            )
                          }
                          placeholder="بدون إضافي"
                          isDisabled={!present}
                        />
                      </td>

                      <td className="p-2.5 min-w-[140px]">
                        <CompactSelect
                          options={ratioOptions}
                          value={row.workDaysDeductionRatio || ""}
                          onChange={(value) =>
                            updateRow(
                              row.id,
                              "workDaysDeductionRatio",
                              value ? normalizeRatio(value, null) : null,
                            )
                          }
                          placeholder="بدون خصم"
                        />
                      </td>

                      <td className="p-2.5">
                        <input
                          value={row.notes}
                          onChange={(event) =>
                            updateRow(row.id, "notes", event.target.value)
                          }
                          placeholder="ملاحظة..."
                          className="h-8 w-[180px] rounded-lg border border-ink-400/15 px-2 text-xs outline-none focus:border-primary-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="sticky bottom-3 z-10">
            <div className="rounded-2xl border border-ink-400/10 bg-white/95 backdrop-blur shadow-lg p-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-xs text-ink-400">
                  <span className="font-semibold text-ink-900">{workDate}</span>
                  <span className="mx-2">•</span>
                  تم تحديد{" "}
                  <span className="font-semibold text-primary-600">
                    {selectedIds.length}
                  </span>{" "}
                  موظف
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isSaving}
                  >
                    <RotateCcw size={14} />
                    إعادة ضبط
                  </Button>

                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    حفظ تسجيلات اليوم
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl border border-ink-400/10 bg-white p-3 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-400 mb-1">{label}</p>

          <p
            className={`
              text-lg
              font-bold
              num
              ${
                tone === "positive"
                  ? "text-positive"
                  : tone === "negative"
                    ? "text-negative"
                    : "text-ink-900"
              }
            `}
          >
            {value}
          </p>
        </div>

        <div
          className={`
            w-8
            h-8
            rounded-lg
            flex
            items-center
            justify-center
            ${
              tone === "positive"
                ? "bg-positive/10 text-positive"
                : tone === "negative"
                  ? "bg-negative/10 text-negative"
                  : "bg-ink-400/10 text-ink-400"
            }
          `}
        >
          <Icon size={16} />
        </div>
      </div>
    </div>
  );
}

function AttendanceTableSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card overflow-hidden">
      <div className="h-11 bg-ink-900/[0.03] border-b border-ink-400/10" />

      <div className="divide-y divide-ink-400/5">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-3 py-3">
            <div className="h-4 w-4 rounded bg-ink-400/10 animate-pulse" />

            <div className="h-8 w-8 rounded-lg bg-ink-400/10 animate-pulse" />

            <div className="h-3.5 w-32 rounded bg-ink-400/10 animate-pulse" />

            <div className="h-7 w-20 rounded-lg bg-ink-400/10 animate-pulse" />

            <div className="h-7 w-20 rounded-lg bg-ink-400/10 animate-pulse" />

            <div className="h-7 w-24 rounded-lg bg-ink-400/10 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
