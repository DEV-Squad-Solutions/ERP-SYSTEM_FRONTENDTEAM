// features/fiscalYears/pages/FiscalYearsListPage.jsx

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  RotateCcw,
  Plus,
  Pencil,
  Trash2,
  Lock,
  LockOpen,
  AlertCircle,
  FileSearch,
  Star,
  CalendarRange,
  Loader2,
} from "lucide-react";

import {
  useGetFiscalYearsQuery,
  useDeleteFiscalYearMutation,
  useCloseFiscalYearMutation,
  useReopenFiscalYearMutation,
} from "../fiscalYearsApi";
import {
  FISCAL_YEAR_STATUS_LABELS,
  fiscalYearStatusBadge,
  fiscalYearStatusDot,
  fiscalYearStatusOptions,
} from "../fiscalYears.constants";
import FiscalYearFormModal from "../components/FiscalYearFormModal";

import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";
import Pagination from "../../../shared/components/ui/Pagination";

export default function FiscalYearsListPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFiscalYear, setEditingFiscalYear] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [closeTarget, setCloseTarget] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  const [reopenTarget, setReopenTarget] = useState(null);
  const [isReopening, setIsReopening] = useState(false);

  const queryParams = useMemo(
    () => ({
      PageNumber: page,
      PageSize: pageSize,
      ...(search && { Search: search }),
      ...(status && { Status: status }),
    }),
    [page, pageSize, search, status],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetFiscalYearsQuery(queryParams);

  const [deleteFiscalYear] = useDeleteFiscalYearMutation();
  const [closeFiscalYear] = useCloseFiscalYearMutation();
  const [reopenFiscalYear] = useReopenFiscalYearMutation();

  const items = data?.items || [];
  const hasActiveFilters = Boolean(search || status);

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setPage(1);
  };

  const openCreateForm = () => {
    setEditingFiscalYear(null);
    setIsFormOpen(true);
  };

  const openEditForm = (fy) => {
    setEditingFiscalYear(fy);
    setIsFormOpen(true);
  };

  const handleDelete = (fy) => {
    setDeleteTarget(fy);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      await deleteFiscalYear(deleteTarget.id).unwrap();
      toast.success("تم الحذف بنجاح");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        error?.data?.detail ||
          error?.data?.title ||
          "حصل خطأ أثناء الحذف، حاول تاني",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = (fy) => {
    setCloseTarget(fy);
  };

  const confirmClose = async () => {
    if (!closeTarget) return;

    setIsClosing(true);

    try {
      await closeFiscalYear(closeTarget.id).unwrap();
      toast.success("تم إغلاق السنة المالية بنجاح");
      setCloseTarget(null);
    } catch (error) {
      toast.error(
        error?.data?.detail ||
          error?.data?.title ||
          "حدث خطأ أثناء إغلاق السنة المالية",
      );
    } finally {
      setIsClosing(false);
    }
  };

  const handleReopen = (fy) => {
    setReopenTarget(fy);
  };

  const confirmReopen = async () => {
    if (!reopenTarget) return;

    setIsReopening(true);

    try {
      await reopenFiscalYear(reopenTarget.id).unwrap();
      toast.success("تم إعادة فتح السنة المالية بنجاح");
      setReopenTarget(null);
    } catch (error) {
      toast.error(
        error?.data?.detail ||
          error?.data?.title ||
          "حدث خطأ أثناء إعادة فتح السنة المالية",
      );
    } finally {
      setIsReopening(false);
    }
  };

  return (
    <div className="animate-fadeUp space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600">
            <CalendarRange size={20} />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-ink-900">
              السنوات المالية
            </h2>
            <p className="text-sm text-ink-400 mt-0.5">
              إدارة الفترات المالية المفتوحة والمغلقة للشركة
            </p>
          </div>
        </div>

        <Button
          onClick={openCreateForm}
          className="transition-transform active:scale-[0.98]"
        >
          <Plus size={15} />
          سنة مالية جديدة
        </Button>
      </div>

      <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card p-4 transition-shadow hover:shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-ink-400 mb-1">
              بحث
            </label>
            <div className="relative">
              <Search
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="ابحث باسم السنة المالية..."
                className="w-full h-9 rounded-lg border border-ink-400/15 bg-white pr-9 pl-3 text-sm outline-none transition-colors focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              الحالة
            </label>
            <CompactSelect
              options={fiscalYearStatusOptions}
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              placeholder="كل الحالات"
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full h-9"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              <RotateCcw size={14} />
              تصفير الفلاتر
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <FiscalYearsSkeleton />
      ) : isError ? (
        <div className="rounded-2xl border border-negative/25 bg-negative/[0.02] py-14 text-center animate-fadeUp">
          <AlertCircle
            size={34}
            className="mx-auto mb-3 text-negative/70"
            strokeWidth={1.6}
          />
          <p className="mb-1 font-medium text-ink-900">
            حدث خطأ في تحميل السنوات المالية
          </p>
          <button
            onClick={refetch}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-500 transition-colors hover:bg-primary-100 hover:text-primary-600"
          >
            <RotateCcw size={15} />
            إعادة المحاولة
          </button>
        </div>
      ) : !isFetching && items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-400/20 py-16 text-center animate-fadeUp">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-ink-400/5">
            <FileSearch
              size={26}
              className="text-ink-400/50"
              strokeWidth={1.6}
            />
          </div>
          <p className="font-medium text-ink-900">لا توجد سنوات مالية مطابقة</p>
          {hasActiveFilters && (
            <p className="text-xs text-ink-400 mt-1">
              جرّب تغيير البحث أو الفلتر
            </p>
          )}
        </div>
      ) : (
        <div
          className={`overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity duration-200 ${
            isFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          <div className="overflow-x-auto custom-scroll">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-ink-400/10 text-xs font-semibold text-ink-600">
                  <th className="px-4 py-3 text-right">الاسم</th>
                  <th className="px-4 py-3 text-center">تاريخ البداية</th>
                  <th className="px-4 py-3 text-center">تاريخ النهاية</th>
                  <th className="px-4 py-3 text-center">الحالة</th>
                  <th className="px-4 py-3 text-center">الحالية</th>
                  <th className="px-4 py-3 text-center">تاريخ الإغلاق</th>
                  <th className="px-4 py-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((fy, index) => {
                  const isBusy =
                    (closeTarget?.id === fy.id && isClosing) ||
                    (reopenTarget?.id === fy.id && isReopening);
                  return (
                    <tr
                      key={fy.id}
                      className="border-b border-ink-400/5 transition-colors last:border-0 hover:bg-slate-50 animate-fadeUp"
                      style={{
                        animationDelay: `${Math.min(index, 12) * 25}ms`,
                      }}
                    >
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                              fiscalYearStatusDot[fy.status] || "bg-ink-400"
                            }`}
                          />
                          <span className="font-medium text-ink-900">
                            {fy.name}
                          </span>
                        </div>
                      </td>

                      <td className="num whitespace-nowrap px-4 py-3 text-center text-ink-600">
                        {fy.startDate}
                      </td>

                      <td className="num whitespace-nowrap px-4 py-3 text-center text-ink-600">
                        {fy.endDate}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                            fiscalYearStatusBadge[fy.status] ||
                            "bg-ink-400/10 text-ink-400"
                          }`}
                        >
                          {FISCAL_YEAR_STATUS_LABELS[fy.status] || fy.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        {fy.isCurrent && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-600">
                            <Star
                              size={11}
                              className="fill-primary-500 text-primary-500"
                            />
                            الحالية
                          </span>
                        )}
                      </td>

                      <td className="num whitespace-nowrap px-4 py-3 text-center text-ink-500">
                        {fy.closedOn || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditForm(fy)}
                            disabled={isBusy}
                            className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-400/5 hover:text-ink-700 disabled:opacity-40"
                            title="تعديل"
                          >
                            <Pencil size={14} />
                          </button>

                          {fy.status === "Open" ? (
                            <button
                              onClick={() => handleClose(fy)}
                              disabled={isBusy}
                              className="rounded-lg p-1.5 text-amber-600 transition-colors hover:bg-amber-50 disabled:opacity-40"
                              title="إغلاق السنة المالية"
                            >
                              {isBusy ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Lock size={14} />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReopen(fy)}
                              disabled={isBusy}
                              className="rounded-lg p-1.5 text-positive transition-colors hover:bg-positive/10 disabled:opacity-40"
                              title="إعادة فتح السنة المالية"
                            >
                              {isBusy ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <LockOpen size={14} />
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(fy)}
                            disabled={isBusy}
                            className="rounded-lg p-1.5 text-negative transition-colors hover:bg-negative/10 disabled:opacity-40"
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
          </div>

          {data?.totalPages > 0 && (
            <div className="border-t border-ink-400/10 bg-white px-5 py-4">
              <Pagination
                page={page}
                pageSize={pageSize}
                totalCount={data?.totalCount || 0}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
                label="سنة مالية"
              />
            </div>
          )}
        </div>
      )}

      <FiscalYearFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        fiscalYear={editingFiscalYear}
        onSaved={refetch}
      />

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="تأكيد الحذف"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-negative/20 bg-negative/[0.03] px-4 py-3">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-negative"
              strokeWidth={1.8}
            />
            <p className="text-sm leading-relaxed text-ink-700">
              هل أنت متأكد من حذف السنة المالية{" "}
              <span className="font-semibold text-ink-900">
                "{deleteTarget?.name}"
              </span>
              ؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-ink-400/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-negative hover:bg-negative/90"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  جارِ الحذف...
                </span>
              ) : (
                "تأكيد الحذف"
              )}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={Boolean(closeTarget)}
        onClose={() => setCloseTarget(null)}
        title="تأكيد إغلاق السنة المالية"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3">
            <Lock
              size={18}
              className="mt-0.5 shrink-0 text-amber-600"
              strokeWidth={1.8}
            />
            <p className="text-sm leading-relaxed text-ink-700">
              هل أنت متأكد من إغلاق السنة المالية{" "}
              <span className="font-semibold text-ink-900">
                "{closeTarget?.name}"
              </span>
              ؟ لن يمكن إضافة أو تعديل حركات في هذه السنة بعد الإغلاق.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-ink-400/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCloseTarget(null)}
              disabled={isClosing}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={confirmClose}
              disabled={isClosing}
              className="bg-amber-600 hover:bg-amber-600/90"
            >
              {isClosing ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  جارِ الإغلاق...
                </span>
              ) : (
                "تأكيد الإغلاق"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(reopenTarget)}
        onClose={() => setReopenTarget(null)}
        title="تأكيد إعادة فتح السنة المالية"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-positive/20 bg-positive/[0.04] px-4 py-3">
            <LockOpen
              size={18}
              className="mt-0.5 shrink-0 text-positive"
              strokeWidth={1.8}
            />
            <p className="text-sm leading-relaxed text-ink-700">
              هل أنت متأكد من إعادة فتح السنة المالية{" "}
              <span className="font-semibold text-ink-900">
                "{reopenTarget?.name}"
              </span>
              ؟ سيصبح بإمكان إضافة وتعديل حركات في هذه السنة مرة أخرى.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-ink-400/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReopenTarget(null)}
              disabled={isReopening}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={confirmReopen}
              disabled={isReopening}
            >
              {isReopening ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  جارِ إعادة الفتح...
                </span>
              ) : (
                "تأكيد إعادة الفتح"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FiscalYearsSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card overflow-hidden animate-fadeUp">
      <div className="h-11 bg-ink-900/[0.03] border-b border-ink-400/10" />

      <div className="divide-y divide-ink-400/5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 px-4 py-3.5"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="h-3.5 w-28 rounded bg-ink-400/10 animate-pulse" />
            <div className="h-3.5 w-20 rounded bg-ink-400/10 animate-pulse" />
            <div className="h-3.5 w-20 rounded bg-ink-400/10 animate-pulse" />
            <div className="h-5 w-16 rounded-full bg-ink-400/10 animate-pulse" />
            <div className="h-5 w-14 rounded-full bg-ink-400/10 animate-pulse" />
            <div className="h-3.5 w-20 rounded bg-ink-400/10 animate-pulse" />
            <div className="mr-auto flex gap-1.5">
              <div className="h-7 w-7 rounded-lg bg-ink-400/10 animate-pulse" />
              <div className="h-7 w-7 rounded-lg bg-ink-400/10 animate-pulse" />
              <div className="h-7 w-7 rounded-lg bg-ink-400/10 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
