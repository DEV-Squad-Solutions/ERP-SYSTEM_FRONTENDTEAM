// features/payroll/pages/AttendancePage.jsx

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  RotateCcw,
  Plus,
  Pencil,
  Trash2,
  Eye,
  AlertCircle,
  RefreshCw,
  CalendarClock,
  CheckSquare,
  X,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  useGetEmployeeAttendancesQuery,
  useGetEmployeeAttendancesSelectQuery,
  useDeleteEmployeeAttendanceMutation,
  useBulkDeleteEmployeeAttendancesMutation,
} from "../payrollApi";

import {
  attendanceStatusOptions,
  attendanceStatusBadge,
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_VALUE,
} from "../payroll.constants";

import AttendanceFormModal from "../components/AttendanceFormModal";
import AttendanceDetailsModal from "../components/AttendanceDetailsModal";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";

const emptyFilters = {
  employeeId: "",
  fromDate: "",
  toDate: "",
  status: "",
};

export default function AttendancePage() {
  const navigate = useNavigate();

  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);

  const { data: employeesData = [], isLoading: employeesLoading } =
    useGetEmployeeAttendancesSelectQuery();

  const { data, isLoading, isFetching, isError, refetch } =
    useGetEmployeeAttendancesQuery({
      PageNumber: page,
      PageSize: pageSize,
      EmployeeId: applied.employeeId || undefined,
      WorkDateFrom: applied.fromDate || undefined,
      WorkDateTo: applied.toDate || undefined,
      Status: applied.status || undefined,
    });

  const [deleteAttendance] = useDeleteEmployeeAttendanceMutation();

  const [bulkDeleteAttendances, { isLoading: isBulkDeleting }] =
    useBulkDeleteEmployeeAttendancesMutation();

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

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: String(employee.id),
        label: employee.name,
      })),
    [employees],
  );

  const setField = (key, value) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    setApplied(draft);
    setPage(1);
    setSelectedIds([]);
  };

  const handleReset = () => {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setPage(1);
    setSelectedIds([]);
  };

  const openDetails = (row) => {
    setSelectedAttendance(row);
    setShowDetailsModal(true);
  };

  const closeDetails = () => {
    setShowDetailsModal(false);
    setSelectedAttendance(null);
  };

  const openEmployeeDetails = (row) => {
    if (row?.employeeId === null || row?.employeeId === undefined) {
      return;
    }

    navigate(`/dashboard/payroll/employees/${row.employeeId}`);
  };

  const openEdit = (row) => {
    setEditingAttendance(row);
    setShowFormModal(true);
  };

  const closeEdit = () => {
    setShowFormModal(false);
    setEditingAttendance(null);
  };

  const handleFormSaved = async () => {
    closeEdit();

    try {
      await refetch();
    } catch (error) {
      console.error("Attendance refetch error:", error);
    }
  };

  const handleDelete = (row) => {
    toast(`حذف سجل حضور "${row.employeeName}"؟`, {
      description: "الإجراء ده لا يمكن التراجع عنه",
      action: {
        label: "تأكيد الحذف",
        onClick: async () => {
          try {
            await deleteAttendance(row.id).unwrap();

            toast.success("تم حذف سجل الحضور بنجاح");

            await refetch();
          } catch (error) {
            console.error("Delete attendance error:", error);

            toast.error("حصل خطأ أثناء الحذف، حاول تاني");
          }
        },
      },
      cancel: {
        label: "إلغاء",
      },
      duration: 6000,
    });
  };

  const handleBulkDelete = () => {
    if (!selectedIds.length) {
      return;
    }

    toast(`حذف ${selectedIds.length} سجل حضور؟`, {
      description: "الإجراء ده لا يمكن التراجع عنه",
      action: {
        label: "تأكيد الحذف",
        onClick: async () => {
          try {
            await bulkDeleteAttendances(selectedIds).unwrap();

            toast.success(`تم حذف ${selectedIds.length} سجل حضور بنجاح`);

            setSelectedIds([]);

            await refetch();
          } catch (error) {
            console.error("Bulk delete attendance error:", error);

            toast.error("حصل خطأ أثناء الحذف الجماعي، حاول تاني");
          }
        },
      },
      cancel: {
        label: "إلغاء",
      },
      duration: 6000,
    });
  };

  const toggleRow = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const rows = data?.items || [];

  const toggleAllOnPage = () => {
    const pageIds = rows.map((row) => row.id);

    const allSelected =
      pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !pageIds.includes(id)),
      );
    } else {
      setSelectedIds((current) =>
        Array.from(new Set([...current, ...pageIds])),
      );
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const allOnPageSelected =
    rows.length > 0 && rows.every((row) => selectedIds.includes(row.id));

  const summary = useMemo(() => {
    const workDays = rows.length;

    const present = rows.filter(
      (row) =>
        row.status === "Present" ||
        row.status === ATTENDANCE_STATUS_VALUE.Present,
    ).length;

    const absent = rows.filter(
      (row) =>
        row.status === "Absent" ||
        row.status === ATTENDANCE_STATUS_VALUE.Absent,
    ).length;

    return {
      workDays,
      present,
      absent,
    };
  }, [rows]);

  const normalizeRowStatus = (status) => {
    if (
      status === "Present" ||
      status === ATTENDANCE_STATUS_VALUE.Present ||
      status === 1 ||
      status === "1"
    ) {
      return "Present";
    }

    if (
      status === "Absent" ||
      status === ATTENDANCE_STATUS_VALUE.Absent ||
      status === 0 ||
      status === "0"
    ) {
      return "Absent";
    }

    return status;
  };

  const getStatusLabel = (status) => {
    const normalizedStatus = normalizeRowStatus(status);

    return (
      ATTENDANCE_STATUS[normalizedStatus] || normalizedStatus || "غير محدد"
    );
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = normalizeRowStatus(status);

    return (
      attendanceStatusBadge[normalizedStatus] || "text-ink-400 bg-ink-400/10"
    );
  };

  return (
    <div className="animate-fadeUp space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            الحضور والانصراف
          </h2>

          <p className="mt-1 text-sm text-ink-400">
            متابعة حضور وانصراف الموظفين
          </p>
        </div>

        <Button onClick={() => navigate("/dashboard/payroll/attendance")}>
          <Plus size={16} />
          تسجيل حضور
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SummaryCard label="أيام العمل" value={summary.workDays} />

        <SummaryCard
          label="أيام الحضور"
          value={summary.present}
          tone="positive"
        />

        <SummaryCard
          label="أيام الغياب"
          value={summary.absent}
          tone="negative"
        />
      </div>

      <div className="rounded-2xl border border-ink-400/10 bg-white p-4 shadow-card">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">
              الموظف
            </label>

            <CompactSelect
              options={employeeOptions}
              value={draft.employeeId}
              onChange={(value) => setField("employeeId", value)}
              placeholder={
                employeesLoading ? "جاري تحميل الموظفين..." : "كل الموظفين"
              }
              isDisabled={employeesLoading}
            />
          </div>

          <Input
            label="من تاريخ"
            type="date"
            value={draft.fromDate}
            onChange={(event) => setField("fromDate", event.target.value)}
          />

          <Input
            label="إلى تاريخ"
            type="date"
            value={draft.toDate}
            onChange={(event) => setField("toDate", event.target.value)}
          />

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">
              الحالة
            </label>

            <CompactSelect
              options={attendanceStatusOptions}
              value={draft.status}
              onChange={(value) => setField("status", value)}
              placeholder="الكل"
            />
          </div>
        </div>

        <div className="mt-3 flex justify-end gap-2">
          <Button onClick={handleSearch} className="h-9">
            <Search size={14} />
            بحث
          </Button>

          <Button variant="outline" onClick={handleReset} className="h-9">
            <RotateCcw size={14} />
            تصفير
          </Button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-primary-500/15 bg-primary-50/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <CheckSquare size={16} className="text-primary-600" />

            <p className="text-sm text-ink-900">
              تم تحديد{" "}
              <strong className="text-primary-600">{selectedIds.length}</strong>{" "}
              سجل
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-8"
              onClick={clearSelection}
              disabled={isBulkDeleting}
            >
              <X size={13} />
              إلغاء التحديد
            </Button>

            <Button
              variant="danger"
              className="h-8"
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
            >
              <Trash2 size={13} />

              {isBulkDeleting ? "جارِ الحذف..." : "حذف المحدد"}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card">
          <div className="h-10 border-b border-ink-400/10 bg-ink-900/[0.03]" />

          <div className="divide-y divide-ink-400/5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-3 py-3">
                <div className="h-3.5 w-28 animate-pulse rounded bg-ink-400/10" />
                <div className="h-3.5 w-20 animate-pulse rounded bg-ink-400/10" />
                <div className="h-3.5 w-16 animate-pulse rounded bg-ink-400/10" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-dashed border-negative/25 bg-negative/[0.02] py-14 text-center">
          <AlertCircle
            size={32}
            className="mx-auto mb-3 text-negative/70"
            strokeWidth={1.6}
          />

          <p className="mb-1 text-sm font-medium text-ink-900">
            حدث خطأ في تحميل بيانات الحضور
          </p>

          <button
            onClick={refetch}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-2 text-xs font-medium text-primary-500 transition-colors hover:bg-primary-100 hover:text-primary-600"
          >
            <RefreshCw size={13} />
            إعادة المحاولة
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-400/20 py-16 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-ink-400/5">
            <CalendarClock
              size={24}
              className="text-ink-400/50"
              strokeWidth={1.6}
            />
          </div>

          <p className="mb-1 text-sm font-medium text-ink-900">
            لا توجد سجلات حضور
          </p>

          <p className="text-xs text-ink-400">
            جرّب تعديل الفلاتر أو سجّل حضور اليوم
          </p>
        </div>
      ) : (
        <>
          <div
            className={`overflow-x-auto rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity duration-200 ${
              isFetching ? "opacity-60" : ""
            }`}
          >
            <table className="w-full min-w-[1120px] border-collapse text-right">
              <thead>
                <tr className="border-b border-ink-400/10 bg-ink-900/[0.03] text-[11px] text-ink-400">
                  <th className="w-10 border-l border-ink-400/5 p-2.5">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={toggleAllOnPage}
                      className="accent-primary-500"
                    />
                  </th>

                  <th className="border-l border-ink-400/5 p-2.5 font-medium">
                    الموظف
                  </th>

                  <th className="border-l border-ink-400/5 p-2.5 font-medium">
                    التاريخ
                  </th>

                  <th className="border-l border-ink-400/5 p-2.5 font-medium">
                    مكان العمل
                  </th>

                  <th className="border-l border-ink-400/5 p-2.5 font-medium">
                    وقت الحضور
                  </th>

                  <th className="border-l border-ink-400/5 p-2.5 font-medium">
                    وقت الانصراف
                  </th>

                  <th className="border-l border-ink-400/5 p-2.5 font-medium">
                    عدد الساعات
                  </th>

                  <th className="border-l border-ink-400/5 p-2.5 font-medium">
                    الحالة
                  </th>

                  <th className="border-l border-ink-400/5 p-2.5 font-medium">
                    ملاحظات
                  </th>

                  <th className="p-2.5 font-medium">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => {
                  const selected = selectedIds.includes(row.id);

                  const normalizedStatus = normalizeRowStatus(row.status);

                  return (
                    <tr
                      key={row.id}
                      className={`animate-fadeUp border-b border-ink-400/5 transition-colors last:border-0 ${
                        selected ? "bg-primary-50/40" : "hover:bg-primary-50/30"
                      }`}
                      style={{
                        animationDelay: `${Math.min(index, 12) * 25}ms`,
                      }}
                    >
                      <td className="border-l border-ink-400/5 p-2.5">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleRow(row.id)}
                          className="accent-primary-500"
                        />
                      </td>

                      <td className="border-l border-ink-400/5 p-2.5">
                        <button
                          type="button"
                          onClick={() => openEmployeeDetails(row)}
                          className="text-right text-sm font-medium text-primary-600 underline-offset-2 transition-colors hover:text-primary-700 hover:underline"
                          title="عرض تفاصيل الموظف"
                        >
                          {row.employeeName || `موظف #${row.employeeId}`}
                        </button>

                        <p className="num mt-0.5 text-[10px] text-ink-400">
                          #{row.employeeId}
                        </p>
                      </td>

                      <td className="num border-l border-ink-400/5 p-2.5 text-[13px]">
                        {row.workDate || "—"}
                      </td>

                      <td className="border-l border-ink-400/5 p-2.5">
                        {row.workLocation ? (
                          <div className="inline-flex items-center gap-1.5 rounded-lg bg-ink-400/5 px-2 py-1">
                            <MapPin
                              size={13}
                              className="shrink-0 text-primary-500"
                            />

                            <span className="whitespace-nowrap text-xs font-medium text-ink-700">
                              {row.workLocation}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-ink-400">غير محدد</span>
                        )}
                      </td>

                      <td className="num border-l border-ink-400/5 p-2.5 text-[13px]">
                        {row.checkIn || "—"}
                      </td>

                      <td className="num border-l border-ink-400/5 p-2.5 text-[13px]">
                        {row.checkOut || "—"}
                      </td>

                      <td className="num border-l border-ink-400/5 p-2.5 text-[13px]">
                        {row.workHours || "—"}
                      </td>

                      <td className="border-l border-ink-400/5 p-2.5">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadge(
                            normalizedStatus,
                          )}`}
                        >
                          {getStatusLabel(normalizedStatus)}
                        </span>
                      </td>

                      <td className="max-w-[160px] truncate border-l border-ink-400/5 p-2.5 text-xs text-ink-600">
                        {row.notes || "—"}
                      </td>

                      <td className="p-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openDetails(row)}
                            className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                            title="تفاصيل السجل"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                            title="تعديل"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(row)}
                            className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-negative/10 hover:text-negative"
                            title="حذف"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data?.totalCount > 0 && (
            <Pagination
              page={page}
              pageSize={pageSize}
              totalCount={data.totalCount}
              onPageChange={(nextPage) => {
                setPage(nextPage);
                setSelectedIds([]);
              }}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
                setSelectedIds([]);
              }}
            />
          )}
        </>
      )}

      <AttendanceDetailsModal
        isOpen={showDetailsModal}
        onClose={closeDetails}
        attendance={selectedAttendance}
      />

      <AttendanceFormModal
        isOpen={showFormModal}
        onClose={closeEdit}
        attendance={editingAttendance}
        onSaved={handleFormSaved}
      />
    </div>
  );
}

function SummaryCard({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-ink-400/10 bg-white p-3.5 shadow-card">
      <p className="mb-1 text-xs text-ink-400">{label}</p>

      <p
        className={`num text-lg font-bold ${
          tone === "positive"
            ? "text-positive"
            : tone === "negative"
              ? "text-negative"
              : "text-ink-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
