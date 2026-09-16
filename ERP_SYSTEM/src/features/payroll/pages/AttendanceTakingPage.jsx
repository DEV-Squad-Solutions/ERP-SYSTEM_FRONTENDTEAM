import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { toast } from "sonner";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileCheck2,
  Loader2,
  RotateCcw,
  Search,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";

import {
  useBulkCreateEmployeeAttendancesMutation,
  useBulkUpdateEmployeeAttendancesMutation,
  useGetEmployeeAttendancesQuery,
  useGetEmployeeAttendancesSelectQuery,
} from "../payrollApi";

import { ATTENDANCE_STATUS_VALUE, dayRatioOptions } from "../payroll.constants";

import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";

const DEFAULT_CHECK_IN = "09:00";
const DEFAULT_CHECK_OUT = "17:00";

const STATUS = {
  PRESENT: "Present",
  ABSENT: "Absent",
  NOT_RECORDED: "NotRecorded",
};

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeStatus = (status) => {
  if (status === 1 || status === "1" || status === "Present") {
    return STATUS.PRESENT;
  }

  if (status === 0 || status === "0" || status === "Absent") {
    return STATUS.ABSENT;
  }

  return STATUS.NOT_RECORDED;
};

const normalizeValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return String(value);
};

const normalizeRatio = (value, fallback = null) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "number" && value >= 1 && value <= 10) {
    return value;
  }

  const numericValue = Number(value);

  if (
    Number.isFinite(numericValue) &&
    numericValue >= 1 &&
    numericValue <= 10
  ) {
    return numericValue;
  }

  const ratioMap = {
    OneDay: 1,
    FullDay: 1,
    TwoDays: 2,
    ThreeDays: 3,
    FourDays: 4,
    FiveDays: 5,
    ThreeQuarterDay: 6,
    TwoThirdsDay: 7,
    HalfDay: 8,
    ThirdDay: 9,
    QuarterDay: 10,
  };

  return ratioMap[value] ?? fallback;
};

const toApiTime = (value) => {
  if (!value) {
    return null;
  }

  const normalized = String(value).trim();

  if (/^\d{2}:\d{2}$/.test(normalized)) {
    return `${normalized}:00`;
  }

  if (/^\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(normalized)) {
    return normalized;
  }

  return normalized;
};

const getApiErrorMessage = (error) => {
  const errors = error?.data?.errors;

  if (errors && typeof errors === "object") {
    const firstError = Object.values(errors)
      .flat()
      .find((message) => typeof message === "string" && message.trim());

    if (firstError) {
      return firstError;
    }
  }

  return (
    error?.data?.message ||
    error?.data?.title ||
    error?.error ||
    "حدث خطأ أثناء حفظ الحضور والغياب"
  );
};

const createEmptyRow = (employee) => ({
  employee,
  existing: null,
  status: STATUS.NOT_RECORDED,
  checkIn: DEFAULT_CHECK_IN,
  checkOut: DEFAULT_CHECK_OUT,
  workDayRatio: 1,
  workOverTimeRatio: "",
  workDaysDeductionRatio: "",
  workLocation: "",
  notes: "",
});

const AttendanceTakingPage = () => {
  const [workDate, setWorkDate] = useState(getToday);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [localRows, setLocalRows] = useState({});
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [defaultCheckIn, setDefaultCheckIn] = useState(DEFAULT_CHECK_IN);
  const [defaultCheckOut, setDefaultCheckOut] = useState(DEFAULT_CHECK_OUT);

  const parentRef = useRef(null);

  const {
    data: employeesData = [],
    isLoading: employeesLoading,
    isFetching: employeesFetching,
  } = useGetEmployeeAttendancesSelectQuery();

  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    isFetching: attendanceFetching,
    refetch,
  } = useGetEmployeeAttendancesQuery({
    PageNumber: 1,
    PageSize: 100,
    WorkDateFrom: workDate,
    WorkDateTo: workDate,
  });

  const [bulkCreateEmployeeAttendances, { isLoading: creatingAttendance }] =
    useBulkCreateEmployeeAttendancesMutation();

  const [bulkUpdateEmployeeAttendances, { isLoading: updatingAttendance }] =
    useBulkUpdateEmployeeAttendancesMutation();

  const employees = useMemo(() => {
    if (!Array.isArray(employeesData)) {
      return [];
    }

    return employeesData
      .filter((employee) => employee?.id !== null && employee?.id !== undefined)
      .map((employee) => ({
        id: Number(employee.id),
        name: employee.name || `موظف #${employee.id}`,
      }));
  }, [employeesData]);

  const existingAttendance = useMemo(() => {
    const items = Array.isArray(attendanceData?.items)
      ? attendanceData.items
      : Array.isArray(attendanceData)
        ? attendanceData
        : [];

    const map = new Map();

    items.forEach((attendance) => {
      if (
        attendance?.employeeId !== null &&
        attendance?.employeeId !== undefined
      ) {
        map.set(Number(attendance.employeeId), attendance);
      }
    });

    return map;
  }, [attendanceData]);

  const employeeRows = useMemo(() => {
    return employees.map((employee) => {
      const existing = existingAttendance.get(Number(employee.id));

      const serverRow = existing
        ? {
            employee,
            existing,
            status: normalizeStatus(existing.status),
            checkIn: normalizeValue(existing.checkIn)?.slice(0, 5) || "",
            checkOut: normalizeValue(existing.checkOut)?.slice(0, 5) || "",
            workDayRatio: normalizeRatio(existing.workDayRatio, 1),
            workOverTimeRatio: normalizeRatio(existing.workOverTimeRatio, ""),
            workDaysDeductionRatio: normalizeRatio(
              existing.workDaysDeductionRatio,
              "",
            ),
            workLocation: existing.workLocation || "",
            notes: existing.notes || "",
          }
        : createEmptyRow(employee);

      return localRows[employee.id]
        ? {
            ...serverRow,
            ...localRows[employee.id],
          }
        : serverRow;
    });
  }, [employees, existingAttendance, localRows]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return employeeRows.filter((row) => {
      const matchesSearch =
        !normalizedSearch ||
        String(row.employee.id).includes(normalizedSearch) ||
        row.employee.name.toLowerCase().includes(normalizedSearch);

      const matchesStatus = !statusFilter || row.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [employeeRows, search, statusFilter]);

  const summary = useMemo(() => {
    const total = employeeRows.length;

    const present = employeeRows.filter(
      (row) => row.status === STATUS.PRESENT,
    ).length;

    const absent = employeeRows.filter(
      (row) => row.status === STATUS.ABSENT,
    ).length;

    const notRecorded = employeeRows.filter(
      (row) => row.status === STATUS.NOT_RECORDED,
    ).length;

    return {
      total,
      present,
      absent,
      notRecorded,
    };
  }, [employeeRows]);

  const rowVirtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 76,
    overscan: 10,
  });

  useEffect(() => {
    setLocalRows({});
    setSelectedIds(new Set());
  }, [workDate]);

  const updateRow = useCallback((employeeId, updates) => {
    setLocalRows((current) => ({
      ...current,
      [employeeId]: {
        ...(current[employeeId] || {}),
        ...updates,
      },
    }));
  }, []);

  const setEmployeeStatus = useCallback(
    (employeeId, status) => {
      const row = employeeRows.find(
        (item) => Number(item.employee.id) === Number(employeeId),
      );

      if (!row) {
        return;
      }

      if (status === STATUS.PRESENT) {
        updateRow(employeeId, {
          status,
          checkIn: row.checkIn || defaultCheckIn,
          checkOut: row.checkOut || defaultCheckOut,
          workDayRatio: row.workDayRatio || 1,
        });

        return;
      }

      updateRow(employeeId, {
        status,
        checkIn: "",
        checkOut: "",
        workDayRatio: null,
        workOverTimeRatio: "",
        workDaysDeductionRatio: "",
      });
    },
    [employeeRows, defaultCheckIn, defaultCheckOut, updateRow],
  );

  const toggleSelected = useCallback((employeeId) => {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(employeeId)) {
        next.delete(employeeId);
      } else {
        next.add(employeeId);
      }

      return next;
    });
  }, []);

  const selectAllFiltered = useCallback(() => {
    setSelectedIds((current) => {
      const next = new Set(current);

      filteredRows.forEach((row) => {
        next.add(Number(row.employee.id));
      });

      return next;
    });
  }, [filteredRows]);

  const clearSelected = useCallback(() => {
    setSelectedIds((current) => {
      const next = new Set(current);

      filteredRows.forEach((row) => {
        next.delete(Number(row.employee.id));
      });

      return next;
    });
  }, [filteredRows]);

  const markSelectedPresent = useCallback(() => {
    if (!selectedIds.size) {
      toast.error("اختر موظفًا واحدًا على الأقل");
      return;
    }

    selectedIds.forEach((employeeId) => {
      setEmployeeStatus(employeeId, STATUS.PRESENT);
    });
  }, [selectedIds, setEmployeeStatus]);

  const markSelectedAbsent = useCallback(() => {
    if (!selectedIds.size) {
      toast.error("اختر موظفًا واحدًا على الأقل");
      return;
    }

    selectedIds.forEach((employeeId) => {
      setEmployeeStatus(employeeId, STATUS.ABSENT);
    });
  }, [selectedIds, setEmployeeStatus]);

  const markAllPresent = useCallback(() => {
    filteredRows.forEach((row) => {
      setEmployeeStatus(row.employee.id, STATUS.PRESENT);
    });

    toast.success("تم تحديد الموظفين الظاهرين كحاضرين");
  }, [filteredRows, setEmployeeStatus]);

  const markAllAbsent = useCallback(() => {
    filteredRows.forEach((row) => {
      setEmployeeStatus(row.employee.id, STATUS.ABSENT);
    });

    toast.success("تم تحديد الموظفين الظاهرين كغائبين");
  }, [filteredRows, setEmployeeStatus]);

  const applyDefaultTimes = useCallback(() => {
    if (!defaultCheckIn || !defaultCheckOut) {
      toast.error("حدد وقت الحضور والانصراف أولًا");
      return;
    }

    setLocalRows((current) => {
      const next = { ...current };

      filteredRows.forEach((row) => {
        if (row.status === STATUS.PRESENT) {
          next[row.employee.id] = {
            ...(next[row.employee.id] || {}),
            checkIn: defaultCheckIn,
            checkOut: defaultCheckOut,
          };
        }
      });

      return next;
    });

    toast.success("تم تطبيق أوقات الحضور والانصراف");
  }, [defaultCheckIn, defaultCheckOut, filteredRows]);

  const handleReset = useCallback(() => {
    setLocalRows({});
    setSelectedIds(new Set());
    toast.success("تم إلغاء التعديلات المحلية");
  }, []);

  const buildAttendance = useCallback(
    (row, includeId = false) => {
      const payload = {
        employeeId: Number(row.employee.id),
        status:
          row.status === STATUS.PRESENT
            ? ATTENDANCE_STATUS_VALUE.Present
            : ATTENDANCE_STATUS_VALUE.Absent,
        workDate,
        checkIn: row.status === STATUS.PRESENT ? toApiTime(row.checkIn) : null,
        checkOut:
          row.status === STATUS.PRESENT ? toApiTime(row.checkOut) : null,
        workDayRatio:
          row.status === STATUS.PRESENT
            ? normalizeRatio(row.workDayRatio, 1)
            : null,
        workOverTimeRatio:
          row.workOverTimeRatio !== "" &&
          row.workOverTimeRatio !== null &&
          row.workOverTimeRatio !== undefined
            ? normalizeRatio(row.workOverTimeRatio, null)
            : null,
        workDaysDeductionRatio:
          row.workDaysDeductionRatio !== "" &&
          row.workDaysDeductionRatio !== null &&
          row.workDaysDeductionRatio !== undefined
            ? normalizeRatio(row.workDaysDeductionRatio, null)
            : null,
        workLocation: row.workLocation?.trim() || null,
        notes: row.notes?.trim() || null,
      };

      if (includeId && row.existing?.id) {
        payload.id = Number(row.existing.id);
      }

      return payload;
    },
    [workDate],
  );

  const handleSave = async () => {
    if (!employeeRows.length) {
      toast.error("لا يوجد موظفون لتسجيل الحضور");
      return;
    }

    const recordedRows = employeeRows.filter(
      (row) => row.status === STATUS.PRESENT || row.status === STATUS.ABSENT,
    );

    if (!recordedRows.length) {
      toast.error("لم يتم تسجيل حضور أو غياب لأي موظف");
      return;
    }

    const invalidPresentRows = recordedRows.filter(
      (row) => row.status === STATUS.PRESENT && (!row.checkIn || !row.checkOut),
    );

    if (invalidPresentRows.length) {
      toast.error(
        `يوجد ${invalidPresentRows.length} موظف حاضر بدون وقت حضور أو انصراف`,
      );
      return;
    }

    const newRows = recordedRows.filter((row) => !row.existing);
    const updatedRows = recordedRows.filter((row) => row.existing);

    try {
      let created = 0;
      let updated = 0;

      if (newRows.length) {
        await bulkCreateEmployeeAttendances({
          attendances: newRows.map((row) => buildAttendance(row, false)),
        }).unwrap();

        created = newRows.length;
      }

      if (updatedRows.length) {
        await bulkUpdateEmployeeAttendances({
          attendances: updatedRows.map((row) => buildAttendance(row, true)),
        }).unwrap();

        updated = updatedRows.length;
      }

      setLocalRows({});
      setSelectedIds(new Set());

      await refetch();

      toast.success(
        `تم حفظ الحضور والغياب بنجاح — جديد: ${created}، تعديل: ${updated}`,
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const isSaving = creatingAttendance || updatingAttendance;

  const isLoading = employeesLoading || attendanceLoading;

  const isFetching = employeesFetching || attendanceFetching;

  return (
    <div dir="rtl" className="flex h-full min-h-0 flex-col gap-4 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600">
              <CalendarDays size={21} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-ink-900">
                تسجيل الحضور والغياب
              </h1>

              <p className="text-sm text-ink-500">
                تسجيل ومراجعة حضور الموظفين ليوم محدد
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={!Object.keys(localRows).length || isSaving}
          >
            <RotateCcw size={17} />
            إلغاء التعديلات
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading || !employeeRows.length}
          >
            {isSaving ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <FileCheck2 size={17} />
            )}
            حفظ الحضور
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-500">إجمالي الموظفين</span>

            <Users size={19} className="text-primary-600" />
          </div>

          <div className="mt-2 text-2xl font-bold text-ink-900">
            {summary.total}
          </div>
        </div>

        <div className="rounded-2xl border border-positive/10 bg-positive/5 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-500">الحاضرون</span>

            <UserCheck size={19} className="text-positive" />
          </div>

          <div className="mt-2 text-2xl font-bold text-positive">
            {summary.present}
          </div>
        </div>

        <div className="rounded-2xl border border-negative/10 bg-negative/5 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-500">الغائبون</span>

            <UserX size={19} className="text-negative" />
          </div>

          <div className="mt-2 text-2xl font-bold text-negative">
            {summary.absent}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-500">لم يسجل</span>

            <Clock3 size={19} className="text-amber-600" />
          </div>

          <div className="mt-2 text-2xl font-bold text-amber-600">
            {summary.notRecorded}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">
              تاريخ الحضور
            </label>

            <div className="relative">
              <CalendarDays
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
              />

              <input
                type="date"
                value={workDate}
                onChange={(event) => setWorkDate(event.target.value)}
                className="h-10 w-full rounded-xl border border-ink-200 bg-white pr-10 pl-3 text-sm text-ink-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">
              البحث عن موظف
            </label>

            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="اسم الموظف أو الرقم..."
                className="h-10 w-full rounded-xl border border-ink-200 bg-white pr-10 pl-3 text-sm text-ink-800 outline-none transition placeholder:text-ink-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">
              الحالة
            </label>

            <CompactSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "", label: "الكل" },
                { value: STATUS.PRESENT, label: "حاضر" },
                { value: STATUS.ABSENT, label: "غائب" },
                {
                  value: STATUS.NOT_RECORDED,
                  label: "لم يسجل",
                },
              ]}
              placeholder="الحالة"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">
              وقت الحضور الافتراضي
            </label>

            <div className="relative">
              <Clock3
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
              />

              <input
                type="time"
                value={defaultCheckIn}
                onChange={(event) => setDefaultCheckIn(event.target.value)}
                className="h-10 w-full rounded-xl border border-ink-200 bg-white pr-10 pl-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">
              وقت الانصراف الافتراضي
            </label>

            <div className="relative">
              <Clock3
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
              />

              <input
                type="time"
                value={defaultCheckOut}
                onChange={(event) => setDefaultCheckOut(event.target.value)}
                className="h-10 w-full rounded-xl border border-ink-200 bg-white pr-10 pl-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={selectAllFiltered}
            disabled={!filteredRows.length}
          >
            <Check size={15} />
            تحديد الظاهر
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={clearSelected}
            disabled={!selectedIds.size}
          >
            <X size={15} />
            إلغاء التحديد
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={markSelectedPresent}
            disabled={!selectedIds.size}
          >
            <UserCheck size={15} />
            المحدد حاضر
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={markSelectedAbsent}
            disabled={!selectedIds.size}
          >
            <UserX size={15} />
            المحدد غائب
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={markAllPresent}
            disabled={!filteredRows.length}
          >
            الكل حاضر
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={markAllAbsent}
            disabled={!filteredRows.length}
          >
            الكل غائب
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={applyDefaultTimes}
            disabled={!filteredRows.length}
          >
            <Clock3 size={15} />
            تطبيق الأوقات
          </Button>

          <div className="mr-auto text-sm text-ink-500">
            المحدد:{" "}
            <span className="font-semibold text-ink-800">
              {selectedIds.size}
            </span>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
        <div className="overflow-x-auto border-b border-ink-100">
          <div className="min-w-[1250px]">
            <div className="grid grid-cols-[52px_minmax(220px,1.5fr)_140px_130px_130px_180px_170px_180px_minmax(220px,1fr)] items-center gap-0 bg-ink-50 px-3 py-3 text-xs font-semibold text-ink-600">
              <div />

              <div>الموظف</div>

              <div>الحالة</div>

              <div>الحضور</div>

              <div>الانصراف</div>

              <div>نسبة اليوم</div>

              <div>الإضافي</div>

              <div>الخصم</div>

              <div>ملاحظات</div>
            </div>
          </div>
        </div>

        <div ref={parentRef} className="min-h-0 flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 size={28} className="animate-spin text-primary-600" />
            </div>
          ) : !filteredRows.length ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-ink-500">
              <Users size={32} />
              <p className="text-sm">لا توجد بيانات مطابقة</p>
            </div>
          ) : (
            <div
              className="relative min-w-[1250px]"
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = filteredRows[virtualRow.index];

                const employeeId = Number(row.employee.id);

                const present = row.status === STATUS.PRESENT;

                const selected = selectedIds.has(employeeId);

                return (
                  <div
                    key={employeeId}
                    className="absolute right-0 left-0 grid grid-cols-[52px_minmax(220px,1.5fr)_140px_130px_130px_180px_170px_180px_minmax(220px,1fr)] items-center border-b border-ink-100 bg-white px-3 transition hover:bg-ink-50/50"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleSelected(employeeId)}
                        className="h-4 w-4 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>

                    <div className="min-w-0 pl-3">
                      <div className="truncate font-semibold text-ink-800">
                        {row.employee.name}
                      </div>

                      <div className="mt-0.5 text-xs text-ink-400">
                        #{row.employee.id}
                      </div>
                    </div>

                    <div className="pl-3">
                      <CompactSelect
                        value={row.status}
                        onChange={(value) =>
                          setEmployeeStatus(employeeId, value)
                        }
                        options={[
                          {
                            value: STATUS.PRESENT,
                            label: "حاضر",
                          },
                          {
                            value: STATUS.ABSENT,
                            label: "غائب",
                          },
                          {
                            value: STATUS.NOT_RECORDED,
                            label: "لم يسجل",
                          },
                        ]}
                        placeholder="الحالة"
                      />
                    </div>

                    <div className="pl-3">
                      <input
                        type="time"
                        value={present ? row.checkIn || "" : ""}
                        disabled={!present}
                        onChange={(event) =>
                          updateRow(employeeId, {
                            checkIn: event.target.value,
                          })
                        }
                        className="h-9 w-full rounded-lg border border-ink-200 bg-white px-2 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-300 focus:border-primary-500"
                      />
                    </div>

                    <div className="pl-3">
                      <input
                        type="time"
                        value={present ? row.checkOut || "" : ""}
                        disabled={!present}
                        onChange={(event) =>
                          updateRow(employeeId, {
                            checkOut: event.target.value,
                          })
                        }
                        className="h-9 w-full rounded-lg border border-ink-200 bg-white px-2 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-300 focus:border-primary-500"
                      />
                    </div>

                    <div className="pl-3">
                      <CompactSelect
                        value={present ? (row.workDayRatio ?? 1) : ""}
                        onChange={(value) =>
                          updateRow(employeeId, {
                            workDayRatio: normalizeRatio(value, 1),
                          })
                        }
                        options={dayRatioOptions}
                        placeholder="نسبة اليوم"
                        isDisabled={!present}
                      />
                    </div>

                    <div className="pl-3">
                      <CompactSelect
                        value={row.workOverTimeRatio || ""}
                        onChange={(value) =>
                          updateRow(employeeId, {
                            workOverTimeRatio: value,
                          })
                        }
                        options={[
                          {
                            value: "",
                            label: "بدون",
                          },
                          ...dayRatioOptions,
                        ]}
                        placeholder="الإضافي"
                      />
                    </div>

                    <div className="pl-3">
                      <CompactSelect
                        value={row.workDaysDeductionRatio || ""}
                        onChange={(value) =>
                          updateRow(employeeId, {
                            workDaysDeductionRatio: value,
                          })
                        }
                        options={[
                          {
                            value: "",
                            label: "بدون",
                          },
                          ...dayRatioOptions,
                        ]}
                        placeholder="الخصم"
                        isDisabled={!present}
                      />
                    </div>

                    <div className="pl-3">
                      <input
                        type="text"
                        value={row.notes || ""}
                        onChange={(event) =>
                          updateRow(employeeId, {
                            notes: event.target.value,
                          })
                        }
                        placeholder="ملاحظات..."
                        className="h-9 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none transition placeholder:text-ink-400 focus:border-primary-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/50 px-4 py-3 text-xs text-ink-500">
          <div>
            عرض{" "}
            <span className="font-semibold text-ink-800">
              {filteredRows.length}
            </span>{" "}
            من{" "}
            <span className="font-semibold text-ink-800">
              {employeeRows.length}
            </span>{" "}
            موظف
          </div>

          {isFetching && (
            <div className="flex items-center gap-1.5">
              <Loader2 size={14} className="animate-spin" />
              جاري تحديث البيانات...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceTakingPage;
