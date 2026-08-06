import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Plus,
  SlidersHorizontal,
  RotateCcw,
  Printer,
  Pencil,
  Trash2,
} from "lucide-react";
import { useGetDriversQuery, useDeleteDriverMutation } from "../driversApi";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";
import { useInvoiceListPrint } from "../../../shared/hooks/useInvoiceListPrint";
import DriverListPrintTemplate from "../../../shared/components/print/DriverListPrintTemplate";
import QuickAddDriverModal from "../components/QuickAddDriverModal";

export default function DriversListPage() {
  const navigate = useNavigate();
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [filters, setFilters] = useState({
    search: "",
    code: "",
    licenseNumber: "",
    isActive: "",
    hasExpiredLicense: "",
  });

  const { data, isLoading, isFetching, isError, refetch } = useGetDriversQuery({
    PageNumber: page,
    PageSize: pageSize,
    Search: filters.search || undefined,
    Code: filters.code || undefined,
    LicenseNumber: filters.licenseNumber || undefined,
    IsActive: filters.isActive === "" ? undefined : filters.isActive === "true",
    HasExpiredLicense:
      filters.hasExpiredLicense === ""
        ? undefined
        : filters.hasExpiredLicense === "true",
  });

  const drivers = data?.items ?? [];
  const [deleteDriver] = useDeleteDriverMutation();

  const handleChange = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      code: "",
      licenseNumber: "",
      isActive: "",
      hasExpiredLicense: "",
    });
    setPage(1);
  };

  const hasActiveFilters =
    filters.search ||
    filters.code ||
    filters.licenseNumber ||
    filters.isActive ||
    filters.hasExpiredLicense;

  const openCreate = () => {
    setEditingDriver(null);
    setShowFormModal(true);
  };

  const handleDelete = (driver) => {
    toast(`حذف "${driver.name}"؟`, {
      description: "الإجراء ده لا يمكن التراجع عنه",
      action: {
        label: "تأكيد الحذف",
        onClick: async () => {
          try {
            await deleteDriver(driver.id).unwrap();
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

  const isLicenseExpired = (date) => date && new Date(date) < new Date();

  const { printList, printRef } = useInvoiceListPrint({
    title: "تقرير السائقين",
  });

  return (
    <div className="animate-fadeUp space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900">السائقين</h2>
          <p className="mt-1 text-sm text-gray-500">
            إجمالي السائقين: {data?.totalCount ?? 0}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Button variant="outline" onClick={() => setShowFilters((s) => !s)}>
              <SlidersHorizontal size={16} />
              فلاتر
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mr-1" />
              )}
            </Button>

            {showFilters && (
              <div className="absolute left-0 mt-2 w-80 bg-white border border-ink-400/10 rounded-2xl shadow-lg p-4 z-20 space-y-3">
                <div>
                  <label className="block text-xs text-ink-400 mb-1.5">
                    بحث
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={handleChange("search")}
                    placeholder="ابحث بالاسم..."
                    className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink-400 mb-1.5">
                    الكود
                  </label>
                  <input
                    type="text"
                    value={filters.code}
                    onChange={handleChange("code")}
                    className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink-400 mb-1.5">
                    رقم الرخصة
                  </label>
                  <input
                    type="text"
                    value={filters.licenseNumber}
                    onChange={handleChange("licenseNumber")}
                    className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink-400 mb-1.5">
                    حالة الرخصة
                  </label>
                  <select
                    value={filters.hasExpiredLicense}
                    onChange={handleChange("hasExpiredLicense")}
                    className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
                  >
                    <option value="">الكل</option>
                    <option value="true">منتهية</option>
                    <option value="false">سارية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-ink-400 mb-1.5">
                    الحالة
                  </label>
                  <select
                    value={filters.isActive}
                    onChange={handleChange("isActive")}
                    className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
                  >
                    <option value="">الكل</option>
                    <option value="true">نشط</option>
                    <option value="false">غير نشط</option>
                  </select>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-emerald-700 pt-1"
                  >
                    <RotateCcw size={12} />
                    إعادة تعيين الفلاتر
                  </button>
                )}
              </div>
            )}
          </div>

          <Button variant="outline" onClick={printList}>
            <Printer size={16} />
            طباعة القائمة
          </Button>

          <Button onClick={openCreate}>
            <Plus size={16} />
            سائق جديد
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading && (
          <div className="p-4 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-10 rounded-lg bg-ink-400/5 animate-pulse"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-16">
            <p className="text-red-500 mb-3">حدث خطأ أثناء تحميل البيانات</p>
            <Button variant="outline" onClick={refetch}>
              إعادة المحاولة
            </Button>
          </div>
        )}

        {!isLoading && !isError && drivers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-ink-400 mb-3">لا يوجد سائقين</p>
            <Button onClick={openCreate}>
              <Plus size={16} />
              إضافة أول سائق
            </Button>
          </div>
        )}

        {!isLoading && !isError && drivers.length > 0 && (
          <>
            <table className="w-full text-right">
              <thead>
                <tr className="bg-ink-400/5 text-xs text-ink-400">
                  <th className="py-3 px-4 font-medium">الكود</th>
                  <th className="py-3 px-4 font-medium">الاسم</th>
                  <th className="py-3 px-4 font-medium">التليفون</th>
                  <th className="py-3 px-4 font-medium">رقم الرخصة</th>
                  <th className="py-3 px-4 font-medium">انتهاء الرخصة</th>
                  <th className="py-3 px-4 font-medium">الحالة</th>
                  <th className="py-3 px-4 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => {
                  const expired = isLicenseExpired(driver.licenseExpiryDate);
                  return (
                    <tr
                      key={driver.id}
                      onClick={() =>
                        navigate(`/dashboard/drivers/${driver.id}`)
                      }
                      className="border-t border-ink-400/10 hover:bg-ink-400/5 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-ink-400 whitespace-nowrap">
                        {driver.code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-ink-900 max-w-[200px] truncate">
                        {driver.name}
                      </td>
                      <td className="py-3 px-4 text-ink-700 whitespace-nowrap">
                        {driver.phoneNumber || "—"}
                      </td>
                      <td className="py-3 px-4 text-ink-700 font-mono text-xs whitespace-nowrap">
                        {driver.licenseNumber || "—"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={
                            expired
                              ? "text-red-600 font-semibold"
                              : "text-ink-700"
                          }
                        >
                          {driver.licenseExpiryDate || "—"}
                          {expired && " (منتهية)"}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={
                            driver.isActive
                              ? "text-emerald-700 text-xs font-semibold bg-emerald-700/10 px-2 py-0.5 rounded-full"
                              : "text-red-500 text-xs font-semibold bg-red-500/10 px-2 py-0.5 rounded-full"
                          }
                        >
                          {driver.isActive ? "نشط" : "غير نشط"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingDriver(driver);
                              setShowFormModal(true);
                            }}
                            className="text-ink-400 hover:text-emerald-700 p-1"
                            title="تعديل"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(driver);
                            }}
                            className="text-ink-400 hover:text-red-600 p-1"
                            title="حذف"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <Pagination
              page={page}
              pageSize={pageSize}
              totalCount={data?.totalCount ?? 0}
              totalPages={data?.totalPages ?? 1}
              isFetching={isFetching}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </>
        )}
      </div>

      <div className="hidden">
        <div ref={printRef}>
          <DriverListPrintTemplate drivers={drivers} filters={filters} />
        </div>
      </div>

      <QuickAddDriverModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        driver={editingDriver}
      />
    </div>
  );
}
