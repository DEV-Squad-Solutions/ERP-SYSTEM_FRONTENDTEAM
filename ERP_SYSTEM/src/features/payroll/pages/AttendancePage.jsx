// features/payroll/pages/AttendancePage.jsx

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Search,
  RotateCcw,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  RefreshCw,
  CalendarClock,
} from "lucide-react";
import {
  useGetEmployeeAttendancesQuery,
  useGetEmployeesSelectQuery,
  useDeleteEmployeeAttendanceMutation,
} from "../payrollApi";
import {
  attendanceStatusOptions,
  attendanceStatusBadge,
  ATTENDANCE_STATUS,
} from "../payroll.constants";
import AttendanceQuickEntry from "../components/AttendanceQuickEntry";
import AttendanceFormModal from "../components/AttendanceFormModal";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";

const emptyFilters = { employeeId: "", fromDate: "", toDate: "", status: "" };

export default function AttendancePage() {
  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);

  const { data: employees } = useGetEmployeesSelectQuery();
  const { data, isLoading, isFetching, isError, refetch } =
    useGetEmployeeAttendancesQuery({
      PageNumber: page,
      PageSize: pageSize,
      EmployeeId: applied.employeeId || undefined,
      FromDate: applied.fromDate || undefined,
      ToDate: applied.toDate || undefined,
      Status: applied.status || undefined,
    });

  const [deleteAttendance] = useDeleteEmployeeAttendanceMutation();

  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const handleSearch = () => {
    setApplied(draft);
    setPage(1);
  };

  const handleReset = () => {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setPage(1);
  };

  const openEdit = (row) => {
    setEditingAttendance(row);
    setShowFormModal(true);
  };

  const handleDelete = (row) => {
    toast(`حذف سجل حضور "${row.employeeName}"؟`, {
      description: "الإجراء ده لا يمكن التراجع عنه",
      action: {
        label: "تأكيد الحذف",
        onClick: async () => {
          try {
            await deleteAttendance(row.id).unwrap();
            toast.success("تم الحذف بنجاح");
          } catch {
            toast.error("حصل خطأ أثناء الحذف، حاول تاني");
          }
        },
      },
      cancel: { label: "إلغاء" },
      duration: 6000,
    });
  };

  const rows = data?.items || [];

  const summary = useMemo(() => {
    const workDays = rows.length;
    const present = rows.filter((r) => r.status === "Present").length;
    const absent = rows.filter((r) => r.status === "Absent").length;
    const late = rows.filter((r) => r.status === "Late").length;
    return { workDays, present, absent, late };
  }, [rows]);

  return (
    <div className="animate-fadeUp space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            الحضور والانصراف
          </h2>
          <p className="text-sm text-ink-400 mt-1">
            متابعة حضور وانصراف الموظفين
          </p>
        </div>
        <Button onClick={() => setShowQuickEntry((v) => !v)}>
          <Plus size={16} />
          {showQuickEntry ? "إخفاء" : "تسجيل حضور"}
        </Button>
      </div>

      {showQuickEntry && (
        <AttendanceQuickEntry
          onClose={() => setShowQuickEntry(false)}
          onSaved={() => setShowQuickEntry(false)}
        />
      )}

      {/* MOCK: الملخص محسوب من نتائج الصفحة الحالية فقط (client-side)، مش
          إجمالي حقيقي للفترة كلها. لو فيه endpoint summary مخصص، استبدل. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
        <SummaryCard label="أيام التأخير" value={summary.late} />
      </div>

      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              الموظف
            </label>
            <CompactSelect
              options={
                employees?.map((e) => ({ value: e.id, label: e.name })) || []
              }
              value={draft.employeeId}
              onChange={(val) => setField("employeeId", val)}
              placeholder="كل الموظفين"
            />
          </div>
          <Input
            label="من تاريخ"
            type="date"
            value={draft.fromDate}
            onChange={(e) => setField("fromDate", e.target.value)}
          />
          <Input
            label="إلى تاريخ"
            type="date"
            value={draft.toDate}
            onChange={(e) => setField("toDate", e.target.value)}
          />
          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              الحالة
            </label>
            <CompactSelect
              options={attendanceStatusOptions}
              value={draft.status}
              onChange={(val) => setField("status", val)}
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

      {isLoading ? (
        <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card overflow-hidden">
          <div className="h-10 bg-ink-900/[0.03] border-b border-ink-400/10" />
          <div className="divide-y divide-ink-400/5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-3 py-3">
                <div className="h-3.5 w-28 rounded bg-ink-400/10 animate-pulse" />
                <div className="h-3.5 w-20 rounded bg-ink-400/10 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
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
          <div
            className={`overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity duration-200 ${isFetching ? "opacity-60" : ""}`}
          >
            <table className="w-full text-right border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الموظف
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    التاريخ
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    وقت الحضور
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    وقت الانصراف
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    عدد الساعات
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الحالة
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    ملاحظات
                  </th>
                  <th className="p-2.5 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="border-b border-ink-400/5 last:border-0 hover:bg-primary-50/30 transition-colors animate-fadeUp"
                    style={{ animationDelay: `${Math.min(idx, 12) * 25}ms` }}
                  >
                    <td className="p-2.5 text-sm text-ink-900 border-l border-ink-400/5">
                      {r.employeeName}
                    </td>
                    <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                      {r.workDate}
                    </td>
                    <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                      {r.checkIn || "—"}
                    </td>
                    <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                      {r.checkOut || "—"}
                    </td>
                    <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                      {r.workHours || "—"}
                    </td>
                    <td className="p-2.5 border-l border-ink-400/5">
                      <span
                        className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                          attendanceStatusBadge[r.status] ||
                          "text-ink-400 bg-ink-400/10"
                        }`}
                      >
                        {ATTENDANCE_STATUS[r.status] || r.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-xs text-ink-600 max-w-[160px] truncate border-l border-ink-400/5">
                      {r.notes || "—"}
                    </td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(r)}
                          className="p-1.5 rounded-lg text-ink-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="تعديل"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          className="p-1.5 rounded-lg text-ink-400 hover:text-negative hover:bg-negative/10 transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data?.totalCount > 0 && (
            <Pagination
              page={page}
              pageSize={pageSize}
              totalCount={data.totalCount}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          )}
        </>
      )}

      <AttendanceFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        attendance={editingAttendance}
      />
    </div>
  );
}

function SummaryCard({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-ink-400/10 bg-white p-3.5 shadow-card">
      <p className="text-xs text-ink-400 mb-1">{label}</p>
      <p
        className={`text-lg font-bold num ${
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
