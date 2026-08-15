import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  ArrowLeftRight,
  Search,
  RotateCcw,
} from "lucide-react";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";

import { useGetCashboxesQuery } from "../cashboxesApi";

import {
  useGetCashboxTransfersQuery,
  useDeleteCashboxTransferMutation,
} from "../cashboxTransfersApi";

import CashboxTransferFormModal from "../components/CashboxTransferFormModal";

const emptyFilters = {
  Search: "",
  SourceCashboxId: "",
  DestinationCashboxId: "",
  FromDate: "",
  ToDate: "",
};

function fmtAmount(value, currency) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${Number(value).toLocaleString("ar-EG", {
    maximumFractionDigits: 2,
  })} ${currency ?? ""}`;
}

function fmtDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function CashboxTransfersPage() {
  const navigate = useNavigate();

  // =========================
  // Filters
  // =========================
  const [filters, setFilters] = useState({
    draft: emptyFilters,
    applied: emptyFilters,
  });

  // =========================
  // Pagination
  // =========================
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // =========================
  // Modal
  // =========================
  const [modalState, setModalState] = useState({
    open: false,
    transfer: null,
  });

  const [pendingDelete, setPendingDelete] = useState(null);

  // =========================
  // Cashboxes
  // =========================
  const { data: cashboxesData } = useGetCashboxesQuery({
    pageNumber: 1,
    pageSize: 100,
  });

  const cashboxes = cashboxesData?.items ?? [];

  // =========================
  // Transfers
  // =========================
  const { data, isLoading, isFetching, isError, refetch } =
    useGetCashboxTransfersQuery({
      PageNumber: page,
      PageSize: pageSize,
      ...filters.applied,
    });

  const [deleteTransfer, { isLoading: isDeleting }] =
    useDeleteCashboxTransferMutation();

  // =========================
  // Draft filters
  // =========================
  const setDraft = (key) => (event) => {
    setFilters((prev) => ({
      ...prev,
      draft: {
        ...prev.draft,
        [key]: event.target.value,
      },
    }));
  };

  // =========================
  // Search
  // =========================
  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      applied: {
        ...prev.draft,
      },
    }));

    setPage(1);
  };

  // =========================
  // Reset
  // =========================
  const handleReset = () => {
    setFilters({
      draft: emptyFilters,
      applied: emptyFilters,
    });

    setPage(1);
  };

  // =========================
  // Delete
  // =========================
  const handleDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteTransfer(pendingDelete.id).unwrap();

      toast.success("تم حذف التحويل بنجاح");

      setPendingDelete(null);

      // لو حذفنا آخر عنصر في الصفحة
      // والصفحة الحالية أصبحت أكبر من الموجود
      if (data?.items?.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        refetch();
      }
    } catch (err) {
      toast.error(
        err?.data?.message ?? err?.data?.detail ?? "تعذر حذف التحويل",
      );
    }
  };

  const hasFilters =
    filters.applied.Search ||
    filters.applied.SourceCashboxId ||
    filters.applied.DestinationCashboxId ||
    filters.applied.FromDate ||
    filters.applied.ToDate;

  return (
    <div dir="rtl" className="animate-fadeUp">
      {/* =========================
          Header
      ========================== */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-ink-900">
            <ArrowLeftRight size={20} className="text-primary-500" />
            التحويلات بين الخزائن
          </h2>

          <p className="mt-1 text-sm text-ink-400">
            سجل التحويلات المالية بين خزائن الشركة
          </p>
        </div>

        <Button
          onClick={() =>
            setModalState({
              open: true,
              transfer: null,
            })
          }
        >
          <Plus size={16} />
          تحويل جديد
        </Button>
      </div>

      {/* =========================
          Filters
      ========================== */}
      <div className="mb-4 rounded-2xl border border-ink-400/10 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <Input
            label="بحث"
            placeholder="رقم التحويل"
            value={filters.draft.Search}
            onChange={setDraft("Search")}
          />

          {/* Source */}
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              من خزينة
            </label>

            <select
              className="w-full rounded-lg border border-ink-400/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
              value={filters.draft.SourceCashboxId}
              onChange={setDraft("SourceCashboxId")}
            >
              <option value="">كل الخزائن</option>

              {cashboxes.map((cashbox) => (
                <option key={cashbox.id} value={cashbox.id}>
                  {cashbox.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              إلى خزينة
            </label>

            <select
              className="w-full rounded-lg border border-ink-400/15 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
              value={filters.draft.DestinationCashboxId}
              onChange={setDraft("DestinationCashboxId")}
            >
              <option value="">كل الخزائن</option>

              {cashboxes.map((cashbox) => (
                <option key={cashbox.id} value={cashbox.id}>
                  {cashbox.name}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <Input
            label="من تاريخ"
            type="date"
            value={filters.draft.FromDate}
            onChange={setDraft("FromDate")}
          />

          {/* To Date */}
          <Input
            label="إلى تاريخ"
            type="date"
            value={filters.draft.ToDate}
            onChange={setDraft("ToDate")}
          />
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-end gap-2">
          {hasFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-ink-500 hover:bg-ink-400/5 hover:text-ink-900"
            >
              <RotateCcw size={14} />
              إعادة تعيين
            </button>
          )}

          <Button onClick={handleSearch}>
            <Search size={15} />
            بحث
          </Button>
        </div>
      </div>

      {/* =========================
          Loading
      ========================== */}
      {isLoading && (
        <div className="rounded-2xl border border-dashed border-ink-400/20 py-16 text-center text-ink-400">
          جاري تحميل التحويلات...
        </div>
      )}

      {/* =========================
          Error
      ========================== */}
      {isError && !isLoading && (
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <span>حدث خطأ أثناء تحميل التحويلات.</span>

          <Button variant="outline" onClick={refetch}>
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* =========================
          Table
      ========================== */}
      {!isLoading && !isError && data && (
        <div
          className={`overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-sm transition-opacity ${
            isFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-900/[0.025] text-ink-500">
                  <th className="px-4 py-3 text-right font-medium">
                    رقم التحويل
                  </th>

                  <th className="px-4 py-3 text-right font-medium">التاريخ</th>

                  <th className="px-4 py-3 text-right font-medium">من خزينة</th>

                  <th className="px-4 py-3 text-right font-medium">
                    إلى خزينة
                  </th>

                  <th className="px-4 py-3 text-right font-medium">المبلغ</th>

                  <th className="px-4 py-3 text-right font-medium">الوصف</th>

                  <th className="px-4 py-3 text-right font-medium">إجراءات</th>
                </tr>
              </thead>

              <tbody>
                {data.items?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-14 text-center text-ink-400"
                    >
                      {hasFilters
                        ? "لا توجد تحويلات مطابقة للفلاتر"
                        : "لا توجد تحويلات بعد"}
                    </td>
                  </tr>
                ) : (
                  data.items.map((transfer) => (
                    <tr
                      key={transfer.id}
                      className="border-t border-ink-400/10 hover:bg-ink-900/[0.015] transition-colors"
                    >
                      {/* Number */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`${transfer.id}`)}
                          className="font-medium text-primary-600 hover:underline"
                        >
                          {transfer.transferNumber}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="whitespace-nowrap px-4 py-3 text-ink-600">
                        {fmtDate(transfer.transferDate)}
                      </td>

                      {/* Source */}
                      <td className="px-4 py-3 font-medium text-ink-800">
                        {transfer.sourceCashboxName}
                      </td>

                      {/* Destination */}
                      <td className="px-4 py-3 font-medium text-ink-800">
                        {transfer.destinationCashboxName}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 font-bold text-ink-900">
                        {fmtAmount(transfer.amount, transfer.currency)}
                      </td>

                      {/* Description */}
                      <td className="max-w-56 px-4 py-3 text-ink-400">
                        <span className="block truncate">
                          {transfer.description || "—"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {/* View */}
                          <button
                            onClick={() => navigate(`${transfer.id}`)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                            title="عرض"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() =>
                              setModalState({
                                open: true,
                                transfer,
                              })
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                            title="تعديل"
                          >
                            <Pencil size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setPendingDelete(transfer)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="حذف"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* =========================
                Pagination
            ========================== */}
          {data.totalCount > 0 && (
            <div className="border-t border-ink-400/10">
              <Pagination
                page={page}
                pageSize={pageSize}
                totalCount={data.totalCount}
                totalPages={data.totalPages ?? 1}
                isFetching={isFetching}
                onPageChange={(newPage) => {
                  setPage(newPage);
                }}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
                label="تحويل"
              />
            </div>
          )}
        </div>
      )}

      {/* =========================
          Transfer Modal
      ========================== */}
      <CashboxTransferFormModal
        isOpen={modalState.open}
        onClose={() =>
          setModalState({
            open: false,
            transfer: null,
          })
        }
        cashboxes={cashboxes}
        transfer={modalState.transfer}
      />

      {/* =========================
          Delete Modal
      ========================== */}
      <Modal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="تأكيد الحذف"
      >
        <p className="mb-4 text-sm text-ink-500">
          هل أنت متأكد من حذف التحويل{" "}
          <span className="font-medium text-ink-900">
            {pendingDelete?.transferNumber}
          </span>
          ؟
          <br />
          هذا الإجراء لا يمكن التراجع عنه.
        </p>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setPendingDelete(null)}>
            إلغاء
          </Button>

          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "جاري الحذف..." : "حذف"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
