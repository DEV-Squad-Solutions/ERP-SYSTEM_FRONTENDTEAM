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
  useGetEmployeesSelectQuery,
  useDeleteEmployeeAttendanceMutation,
  useBulkDeleteEmployeeAttendancesMutation,
} from "../payrollApi";

import {
  attendanceStatusOptions,
  attendanceStatusBadge,
  ATTENDANCE_STATUS,
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

  // =========================================================
  // Filters
  // =========================================================

  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // =========================================================
  // Modals
  // =========================================================

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  // =========================================================
  // Selection
  // =========================================================

  const [selectedIds, setSelectedIds] = useState([]);

  // =========================================================
  // Employees
  // =========================================================

  const { data: employees } = useGetEmployeesSelectQuery();

  // =========================================================
  // Attendance
  // =========================================================

  const { data, isLoading, isFetching, isError, refetch } =
    useGetEmployeeAttendancesQuery({
      PageNumber: page,
      PageSize: pageSize,
      EmployeeId: applied.employeeId || undefined,
      WorkDateFrom: applied.fromDate || undefined,
      WorkDateTo: applied.toDate || undefined,
      Status: applied.status || undefined,
    });

  // =========================================================
  // Delete
  // =========================================================

  const [deleteAttendance] = useDeleteEmployeeAttendanceMutation();

  const [bulkDeleteAttendances, { isLoading: isBulkDeleting }] =
    useBulkDeleteEmployeeAttendancesMutation();

  // =========================================================
  // Filters
  // =========================================================

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

  // =========================================================
  // Details Modal
  // =========================================================

  const openDetails = (row) => {
    setSelectedAttendance(row);
    setShowDetailsModal(true);
  };

  const closeDetails = () => {
    setShowDetailsModal(false);
    setSelectedAttendance(null);
  };

  // =========================================================
  // Employee Details
  // =========================================================

  const openEmployeeDetails = (row) => {
    if (!row?.employeeId) return;

    navigate(`/dashboard/payroll/employees/${row.employeeId}`);
  };

  // =========================================================
  // Edit
  // =========================================================

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

  // =========================================================
  // Delete Single
  // =========================================================

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

  // =========================================================
  // Delete Bulk
  // =========================================================

  const handleBulkDelete = () => {
    if (!selectedIds.length) return;

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

  // =========================================================
  // Selection Helpers
  // =========================================================

  const toggleRow = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const toggleAllOnPage = () => {
    const pageIds = rows.map((row) => row.id);

    const allSelected = pageIds.every((id) => selectedIds.includes(id));

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

  // =========================================================
  // Rows
  // =========================================================

  const rows = data?.items || [];

  const allOnPageSelected =
    rows.length > 0 && rows.every((row) => selectedIds.includes(row.id));

  // =========================================================
  // Summary
  // =========================================================

  const summary = useMemo(() => {
    const workDays = rows.length;

    const present = rows.filter((row) => row.status === "Present").length;

    const absent = rows.filter((row) => row.status === "Absent").length;

    return {
      workDays,
      present,
      absent,
    };
  }, [rows]);

  // =========================================================
  // Render
  // =========================================================

  return (
    <div className="animate-fadeUp space-y-4">
      {/* =====================================================
          Header
      ====================================================== */}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            الحضور والانصراف
          </h2>

          <p className="text-sm text-ink-400 mt-1">
            متابعة حضور وانصراف الموظفين
          </p>
        </div>

        <Button onClick={() => navigate("/dashboard/payroll/attendance")}>
          <Plus size={16} />
          تسجيل حضور
        </Button>
      </div>

      {/* =====================================================
          Summary
      ====================================================== */}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

      {/* =====================================================
          Filters
      ====================================================== */}

      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Employee */}

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              الموظف
            </label>

            <CompactSelect
              options={
                employees?.map((employee) => ({
                  value: String(employee.id),
                  label: employee.name,
                })) || []
              }
              value={draft.employeeId}
              onChange={(value) => setField("employeeId", value)}
              placeholder="كل الموظفين"
            />
          </div>

          {/* From */}

          <Input
            label="من تاريخ"
            type="date"
            value={draft.fromDate}
            onChange={(event) => setField("fromDate", event.target.value)}
          />

          {/* To */}

          <Input
            label="إلى تاريخ"
            type="date"
            value={draft.toDate}
            onChange={(event) => setField("toDate", event.target.value)}
          />

          {/* Status */}

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
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

        <div className="flex justify-end gap-2 mt-3">
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

      {/* =====================================================
          Bulk Selection Bar
      ====================================================== */}

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

      {/* =====================================================
          Loading
      ====================================================== */}

      {isLoading ? (
        <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card overflow-hidden">
          <div className="h-10 bg-ink-900/[0.03] border-b border-ink-400/10" />

          <div className="divide-y divide-ink-400/5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-3 py-3">
                <div className="h-3.5 w-28 rounded bg-ink-400/10 animate-pulse" />
                <div className="h-3.5 w-20 rounded bg-ink-400/10 animate-pulse" />
                <div className="h-3.5 w-16 rounded bg-ink-400/10 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        /* =====================================================
            Error
        ====================================================== */

        <div className="text-center py-14 border border-dashed border-negative/25 bg-negative/[0.02] rounded-2xl">
          <AlertCircle
            size={32}
            className="mx-auto text-negative/70 mb-3"
            strokeWidth={1.6}
          />

          <p className="text-ink-900 font-medium text-sm mb-1">
            حدث خطأ في تحميل بيانات الحضور
          </p>

          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 text-xs font-medium text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors mt-2"
          >
            <RefreshCw size={13} />
            إعادة المحاولة
          </button>
        </div>
      ) : rows.length === 0 ? (
        /* =====================================================
            Empty
        ====================================================== */

        <div className="text-center py-16 border border-dashed border-ink-400/20 rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-ink-400/5 flex items-center justify-center mx-auto mb-3">
            <CalendarClock
              size={24}
              className="text-ink-400/50"
              strokeWidth={1.6}
            />
          </div>

          <p className="text-ink-900 font-medium text-sm mb-1">
            لا توجد سجلات حضور
          </p>

          <p className="text-xs text-ink-400">
            جرّب تعديل الفلاتر أو سجّل حضور اليوم
          </p>
        </div>
      ) : (
        <>
          {/* =================================================
              Table
          ================================================== */}

          <div
            className={`
              overflow-x-auto
              custom-scroll
              rounded-2xl
              border border-ink-400/10
              bg-white
              shadow-card
              transition-opacity
              duration-200
              ${isFetching ? "opacity-60" : ""}
            `}
          >
            <table className="w-full text-right border-collapse min-w-[1120px]">
              <thead>
                <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
                  {/* Checkbox */}

                  <th className="p-2.5 w-10 border-l border-ink-400/5">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={toggleAllOnPage}
                      className="accent-primary-500"
                    />
                  </th>

                  {/* Employee */}

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الموظف
                  </th>

                  {/* Date */}

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    التاريخ
                  </th>

                  {/* Work Location */}

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    مكان العمل
                  </th>

                  {/* Check In */}

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    وقت الحضور
                  </th>

                  {/* Check Out */}

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    وقت الانصراف
                  </th>

                  {/* Work Hours */}

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    عدد الساعات
                  </th>

                  {/* Status */}

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الحالة
                  </th>

                  {/* Notes */}

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    ملاحظات
                  </th>

                  {/* Actions */}

                  <th className="p-2.5 font-medium">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => {
                  const selected = selectedIds.includes(row.id);

                  return (
                    <tr
                      key={row.id}
                      className={`
                        border-b
                        border-ink-400/5
                        last:border-0
                        transition-colors
                        animate-fadeUp
                        ${
                          selected
                            ? "bg-primary-50/40"
                            : "hover:bg-primary-50/30"
                        }
                      `}
                      style={{
                        animationDelay: `${Math.min(index, 12) * 25}ms`,
                      }}
                    >
                      {/* Checkbox */}

                      <td className="p-2.5 border-l border-ink-400/5">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleRow(row.id)}
                          className="accent-primary-500"
                        />
                      </td>

                      {/* Employee */}

                      <td className="p-2.5 border-l border-ink-400/5">
                        <button
                          type="button"
                          onClick={() => openEmployeeDetails(row)}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline underline-offset-2 transition-colors text-right"
                          title="عرض تفاصيل الموظف"
                        >
                          {row.employeeName}
                        </button>

                        <p className="text-[10px] text-ink-400 num mt-0.5">
                          #{row.employeeId}
                        </p>
                      </td>

                      {/* Date */}

                      <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                        {row.workDate}
                      </td>

                      {/* Work Location */}

                      <td className="p-2.5 border-l border-ink-400/5">
                        {row.workLocation ? (
                          <div className="inline-flex items-center gap-1.5 rounded-lg bg-ink-400/5 px-2 py-1">
                            <MapPin
                              size={13}
                              className="text-primary-500 shrink-0"
                            />

                            <span className="text-xs font-medium text-ink-700 whitespace-nowrap">
                              {row.workLocation}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-ink-400">غير محدد</span>
                        )}
                      </td>

                      {/* Check In */}

                      <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                        {row.checkIn || "—"}
                      </td>

                      {/* Check Out */}

                      <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                        {row.checkOut || "—"}
                      </td>

                      {/* Work Hours */}

                      <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                        {row.workHours || "—"}
                      </td>

                      {/* Status */}

                      <td className="p-2.5 border-l border-ink-400/5">
                        <span
                          className={`
                            inline-block
                            text-xs
                            font-semibold
                            px-2
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
                      </td>

                      {/* Notes */}

                      <td className="p-2.5 text-xs text-ink-600 max-w-[160px] truncate border-l border-ink-400/5">
                        {row.notes || "—"}
                      </td>

                      {/* Actions */}

                      <td className="p-2.5">
                        <div className="flex items-center gap-1">
                          {/* Details */}

                          <button
                            type="button"
                            onClick={() => openDetails(row)}
                            className="p-1.5 rounded-lg text-ink-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            title="تفاصيل السجل"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Edit */}

                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="p-1.5 rounded-lg text-ink-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            title="تعديل"
                          >
                            <Pencil size={15} />
                          </button>

                          {/* Delete */}

                          <button
                            type="button"
                            onClick={() => handleDelete(row)}
                            className="p-1.5 rounded-lg text-ink-400 hover:text-negative hover:bg-negative/10 transition-colors"
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

          {/* =================================================
              Pagination
          ================================================== */}

          {data?.totalCount > 0 && (
            <Pagination
              page={page}
              pageSize={pageSize}
              totalCount={data.totalCount}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
                setSelectedIds([]);
              }}
            />
          )}
        </>
      )}

      {/* =====================================================
          Attendance Details Modal
      ====================================================== */}

      <AttendanceDetailsModal
        isOpen={showDetailsModal}
        onClose={closeDetails}
        attendance={selectedAttendance}
      />

      {/* =====================================================
          Edit Attendance Modal
      ====================================================== */}

      <AttendanceFormModal
        isOpen={showFormModal}
        onClose={closeEdit}
        attendance={editingAttendance}
        onSaved={handleFormSaved}
      />
    </div>
  );
}

// =========================================================
// Summary Card
// =========================================================

function SummaryCard({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-ink-400/10 bg-white p-3.5 shadow-card">
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
  );
}
