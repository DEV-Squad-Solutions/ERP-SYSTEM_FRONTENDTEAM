// features/payroll/pages/EmployeesPage.jsx

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Search,
  RotateCcw,
  Plus,
  Eye,
  Pencil,
  Trash2,
  AlertCircle,
  RefreshCw,
  Users,
} from "lucide-react";
import { useGetEmployeesQuery, useDeleteEmployeeMutation } from "../payrollApi";
import { employeeTypeOptions, fmtMoney } from "../payroll.constants";
import EmployeeFormModal from "../components/EmployeeFormModal";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";

const emptyFilters = {
  search: "",
  employeeType: "",
  isActive: "",
};

const activeOptions = [
  { value: "", label: "الكل" },
  { value: "true", label: "نشط" },
  { value: "false", label: "غير نشط" },
];

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetEmployeesQuery({
      PageNumber: page,
      PageSize: pageSize,
      Search: applied.search || undefined,
      EmployeeType: applied.employeeType || undefined,
      IsActive:
        applied.isActive === "" ? undefined : applied.isActive === "true",
    });

  const [deleteEmployee] = useDeleteEmployeeMutation();

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

  const openAddModal = () => {
    setEditingEmployee(null);
    setShowFormModal(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setShowFormModal(true);
  };

  const handleDelete = (employee) => {
    toast(`حذف "${employee.name}"؟`, {
      description: "الإجراء ده لا يمكن التراجع عنه",
      action: {
        label: "تأكيد الحذف",
        onClick: async () => {
          try {
            await deleteEmployee(employee.code).unwrap();
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

  const activeFiltersCount = useMemo(
    () =>
      Object.values(applied).filter((v) => v !== "" && v !== undefined).length,
    [applied],
  );

  const employees = data?.employees || [];

  return (
    <div className="animate-fadeUp space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            الموظفين
          </h2>
          <p className="text-sm text-ink-400 mt-1">
            إدارة بيانات الموظفين والأجور
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus size={16} />
          إضافة موظف
        </Button>
      </div>

      {data?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-ink-400/10 bg-white p-4 shadow-card">
            <p className="text-xs text-ink-400 mb-1">الموظفين الشهريين</p>
            <p className="text-lg font-bold num text-ink-900">
              {data.summary.totalMonthlyEmployees}
            </p>
          </div>
          <div className="rounded-2xl border border-ink-400/10 bg-white p-4 shadow-card">
            <p className="text-xs text-ink-400 mb-1">الموظفين اليوميين</p>
            <p className="text-lg font-bold num text-ink-900">
              {data.summary.totalDailyEmployees}
            </p>
          </div>
        </div>
      )}

      {/* الفلاتر */}
      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            label="بحث"
            value={draft.search}
            onChange={(e) => setField("search", e.target.value)}
            placeholder="اسم الموظف أو الرقم..."
          />
          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              نوع الأجر
            </label>
            <CompactSelect
              options={employeeTypeOptions}
              value={draft.employeeType}
              onChange={(val) => setField("employeeType", val)}
              placeholder="الكل"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              الحالة
            </label>
            <CompactSelect
              options={activeOptions}
              value={draft.isActive}
              onChange={(val) => setField("isActive", val)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={handleSearch} className="h-9 flex-1">
              <Search size={14} />
              بحث
            </Button>
            <Button variant="outline" onClick={handleReset} className="h-9">
              <RotateCcw size={14} />
            </Button>
          </div>
        </div>
        {activeFiltersCount > 0 && (
          <p className="text-[11px] text-ink-400 mt-2">
            {activeFiltersCount} فلتر مفعّل
          </p>
        )}
      </div>

      {/* الجدول */}
      {isLoading ? (
        <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card overflow-hidden">
          <div className="h-10 bg-ink-900/[0.03] border-b border-ink-400/10" />
          <div className="divide-y divide-ink-400/5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-3 py-3">
                <div className="h-3.5 w-16 rounded bg-ink-400/10 animate-pulse" />
                <div className="h-3.5 w-32 rounded bg-ink-400/10 animate-pulse" />
                <div className="h-3.5 w-24 rounded bg-ink-400/10 animate-pulse" />
                <div className="h-3.5 w-20 rounded bg-ink-400/10 animate-pulse" />
                <div className="h-3.5 w-16 rounded bg-ink-400/10 animate-pulse" />
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
            حدث خطأ في تحميل بيانات الموظفين
          </p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 text-xs font-medium text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors mt-2"
          >
            <RefreshCw size={13} />
            إعادة المحاولة
          </button>
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-ink-400/20 rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-ink-400/5 flex items-center justify-center mx-auto mb-3">
            <Users size={24} className="text-ink-400/50" strokeWidth={1.6} />
          </div>
          <p className="text-ink-900 font-medium text-sm mb-1">
            لا يوجد موظفين
          </p>
          <p className="text-xs text-ink-400 mb-4">
            جرّب تعديل الفلاتر أو أضف موظف جديد
          </p>
          <Button onClick={openAddModal} variant="outline">
            <Plus size={14} />
            إضافة موظف
          </Button>
        </div>
      ) : (
        <>
          <div
            className={`overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity duration-200 ${isFetching ? "opacity-60" : ""}`}
          >
            <table className="w-full text-right border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    رقم الموظف
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    اسم الموظف
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الوظيفة
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    نوع الأجر
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الراتب الأساسي
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الحالة
                  </th>
                  <th className="p-2.5 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, idx) => (
                  <tr
                    key={emp.code}
                    className="border-b border-ink-400/5 last:border-0 hover:bg-primary-50/30 transition-colors animate-fadeUp"
                    style={{ animationDelay: `${Math.min(idx, 12) * 25}ms` }}
                  >
                    <td className="p-2.5 num text-ink-600 text-[13px] border-l border-ink-400/5">
                      {emp.code}
                    </td>
                    <td className="p-2.5 border-l border-ink-400/5">
                      <button
                        onClick={() =>
                          navigate(`/payroll/employees/${emp.code}`)
                        }
                        className="text-primary-600 hover:text-primary-700 hover:underline text-sm font-medium transition-colors"
                      >
                        {emp.name}
                      </button>
                    </td>
                    <td className="p-2.5 text-ink-700 text-xs border-l border-ink-400/5">
                      {emp.jobTitle}
                    </td>
                    <td className="p-2.5 text-ink-700 text-xs border-l border-ink-400/5">
                      {emp.employeeType === "Daily" ? "يومي" : "شهري"}
                    </td>
                    <td className="p-2.5 num text-ink-900 text-[13px] border-l border-ink-400/5">
                      {fmtMoney(emp.salary)}
                    </td>
                    <td className="p-2.5 border-l border-ink-400/5">
                      <span
                        className={
                          emp.isActive
                            ? "inline-block text-emerald-700 text-xs font-semibold bg-emerald-700/10 px-2 py-0.5 rounded-full"
                            : "inline-block text-red-500 text-xs font-semibold bg-red-500/10 px-2 py-0.5 rounded-full"
                        }
                      >
                        {emp.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            navigate(`/payroll/employees/${emp.code}`)
                          }
                          className="p-1.5 rounded-lg text-ink-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="عرض"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-1.5 rounded-lg text-ink-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="تعديل"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
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

      <EmployeeFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        employee={editingEmployee}
      />
    </div>
  );
}
