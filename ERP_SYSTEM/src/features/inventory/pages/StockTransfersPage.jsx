import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  RotateCcw,
  Plus,
  Pencil,
  Trash2,
  Eye,
  ArrowLeftRight,
  RefreshCw,
  AlertCircle,
  Package,
  Warehouse,
} from "lucide-react";

import {
  useGetStockTransfersQuery,
  useDeleteStockTransferMutation,
} from "../stockTransfersApi";

import StockTransferFormModal from "../components/StockTransferFormModal";
import StockTransferDetailsModal from "../components/StockTransferDetailsModal";

import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";

// عدّل المسار إذا كانت hooks عندك في ملف مختلف
import { useGetStoresSelectQuery } from "../../stores/storesApi";

const emptyFilters = {
  search: "",
  sourceStoreId: "",
  destinationStoreId: "",
  fromDate: "",
  toDate: "",
};

export default function StockTransfersPage() {
  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [showForm, setShowForm] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);

  const [showDetails, setShowDetails] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState(null);

  const { data: stores = [] } = useGetStoresSelectQuery();

  const { data, isLoading, isFetching, isError, refetch } =
    useGetStockTransfersQuery({
      PageNumber: page,
      PageSize: pageSize,

      Search: applied.search || undefined,

      SourceStoreId: applied.sourceStoreId || undefined,

      DestinationStoreId: applied.destinationStoreId || undefined,

      FromDate: applied.fromDate || undefined,

      ToDate: applied.toDate || undefined,
    });

  const [deleteTransfer] = useDeleteStockTransferMutation();

  const rows = data?.items || [];

  const storeOptions = useMemo(
    () =>
      stores.map((store) => ({
        value: String(store.id),
        label: store.name,
      })),
    [stores],
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
  };

  const handleReset = () => {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setPage(1);
  };

  const openCreate = () => {
    setEditingTransfer(null);
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditingTransfer(row);
    setShowForm(true);
  };

  const openDetails = (id) => {
    setSelectedTransferId(id);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedTransferId(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTransfer(null);
  };

  const handleDelete = (row) => {
    toast(`حذف التحويل "${row.documentNumber}"؟`, {
      description: "سيتم حذف التحويل وحركات المخزون المرتبطة به.",

      action: {
        label: "تأكيد الحذف",

        onClick: async () => {
          try {
            await deleteTransfer(row.id).unwrap();

            toast.success("تم حذف التحويل المخزني بنجاح");

            refetch();
          } catch (error) {
            console.error("Delete stock transfer error:", error);

            toast.error(error?.data?.message || "تعذر حذف التحويل المخزني");
          }
        },
      },

      cancel: {
        label: "إلغاء",
      },

      duration: 6000,
    });
  };

  const totalQuantity = rows.reduce(
    (sum, row) => sum + Number(row.totalQuantity || 0),
    0,
  );

  return (
    <div className="animate-fadeUp space-y-4">
      {/* Header */}

      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <ArrowLeftRight size={19} />
            </div>

            <h2 className="font-display text-2xl font-bold text-ink-900">
              التحويلات المخزنية
            </h2>
          </div>

          <p className="text-sm text-ink-400 mt-1">
            تحويل الأصناف بين مخازن الشركة ومتابعة حركات التحويل
          </p>
        </div>

        <Button onClick={openCreate}>
          <Plus size={16} />
          تحويل مخزني
        </Button>
      </div>

      {/* Summary */}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <SummaryCard
          icon={<ArrowLeftRight size={16} />}
          label="عدد التحويلات"
          value={data?.totalCount || 0}
        />

        <SummaryCard
          icon={<Package size={16} />}
          label="عدد الأصناف في الصفحة"
          value={rows.reduce((sum, row) => sum + Number(row.lineCount || 0), 0)}
        />

        <SummaryCard
          icon={<Warehouse size={16} />}
          label="إجمالي الكميات في الصفحة"
          value={totalQuantity}
        />
      </div>

      {/* Filters */}

      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input
            label="بحث"
            placeholder="رقم المستند أو اسم المخزن..."
            value={draft.search}
            onChange={(event) => setField("search", event.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              المخزن المصدر
            </label>

            <CompactSelect
              options={storeOptions}
              value={draft.sourceStoreId}
              onChange={(value) => setField("sourceStoreId", value)}
              placeholder="كل المخازن"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              المخزن المستلم
            </label>

            <CompactSelect
              options={storeOptions}
              value={draft.destinationStoreId}
              onChange={(value) => setField("destinationStoreId", value)}
              placeholder="كل المخازن"
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

      {/* Loading */}

      {isLoading ? (
        <TransfersSkeleton />
      ) : isError ? (
        <div className="text-center py-14 border border-dashed border-negative/25 bg-negative/[0.02] rounded-2xl">
          <AlertCircle
            size={32}
            className="mx-auto text-negative/70 mb-3"
            strokeWidth={1.6}
          />

          <p className="text-ink-900 font-medium text-sm mb-1">
            حدث خطأ في تحميل التحويلات
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
            <ArrowLeftRight
              size={24}
              className="text-ink-400/50"
              strokeWidth={1.6}
            />
          </div>

          <p className="text-ink-900 font-medium text-sm mb-1">
            لا توجد تحويلات مخزنية
          </p>

          <p className="text-xs text-ink-400">
            جرّب تعديل الفلاتر أو أنشئ تحويلًا جديدًا
          </p>
        </div>
      ) : (
        <>
          {/* Table */}

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
            <table className="w-full min-w-[1000px] text-right border-collapse">
              <thead>
                <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    المستند
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    التاريخ
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    من مخزن
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    إلى مخزن
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الأصناف
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الكمية
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    ملاحظات
                  </th>

                  <th className="p-2.5 font-medium">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="border-b border-ink-400/5 last:border-0 hover:bg-primary-50/30 transition-colors animate-fadeUp"
                    style={{
                      animationDelay: `${Math.min(index, 12) * 25}ms`,
                    }}
                  >
                    <td className="p-2.5 border-l border-ink-400/5">
                      <button
                        type="button"
                        onClick={() => openDetails(row.id)}
                        className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors num"
                      >
                        {row.documentNumber}
                      </button>
                    </td>

                    <td className="p-2.5 text-[13px] num border-l border-ink-400/5">
                      {row.transferDate}
                    </td>

                    <td className="p-2.5 text-sm text-ink-900 border-l border-ink-400/5">
                      {row.sourceStoreName}
                    </td>

                    <td className="p-2.5 text-sm text-ink-900 border-l border-ink-400/5">
                      <div className="flex items-center gap-1.5">
                        <ArrowLeftRight
                          size={13}
                          className="text-primary-500"
                        />

                        {row.destinationStoreName}
                      </div>
                    </td>

                    <td className="p-2.5 text-sm num border-l border-ink-400/5">
                      {row.lineCount}
                    </td>

                    <td className="p-2.5 text-sm num border-l border-ink-400/5">
                      {Number(row.totalQuantity || 0).toLocaleString("ar-EG", {
                        maximumFractionDigits: 3,
                      })}
                    </td>

                    <td className="p-2.5 text-xs text-ink-500 max-w-[180px] truncate border-l border-ink-400/5">
                      {row.notes || "—"}
                    </td>

                    <td className="p-2.5">
                      <div className="flex items-center gap-1">
                        <ActionButton
                          title="عرض التفاصيل"
                          onClick={() => openDetails(row.id)}
                        >
                          <Eye size={15} />
                        </ActionButton>

                        <ActionButton
                          title="تعديل"
                          onClick={() => openEdit(row)}
                        >
                          <Pencil size={15} />
                        </ActionButton>

                        <ActionButton
                          danger
                          title="حذف"
                          onClick={() => handleDelete(row)}
                        >
                          <Trash2 size={15} />
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}

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

      {/* Create / Edit */}

      <StockTransferFormModal
        isOpen={showForm}
        onClose={closeForm}
        transfer={editingTransfer}
      />

      {/* Details */}

      <StockTransferDetailsModal
        isOpen={showDetails}
        onClose={closeDetails}
        transferId={selectedTransferId}
      />
    </div>
  );
}

// =========================================================
// Helpers
// =========================================================

function SummaryCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-ink-400/10 bg-white p-3.5 shadow-card">
      <div className="flex items-center gap-2 text-ink-400 mb-1">
        {icon}

        <p className="text-xs">{label}</p>
      </div>

      <p className="text-lg font-bold num text-ink-900">
        {Number(value || 0).toLocaleString("ar-EG", {
          maximumFractionDigits: 3,
        })}
      </p>
    </div>
  );
}

function ActionButton({ children, onClick, title, danger }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors ${
        danger
          ? "text-ink-400 hover:text-negative hover:bg-negative/10"
          : "text-ink-400 hover:text-primary-600 hover:bg-primary-50"
      }`}
    >
      {children}
    </button>
  );
}

function TransfersSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card overflow-hidden animate-pulse">
      <div className="h-10 bg-ink-900/[0.03] border-b border-ink-400/10" />

      <div className="divide-y divide-ink-400/5">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="flex items-center gap-5 px-3 py-3">
            <div className="h-3.5 w-24 rounded bg-ink-400/10" />
            <div className="h-3.5 w-20 rounded bg-ink-400/10" />
            <div className="h-3.5 w-32 rounded bg-ink-400/10" />
            <div className="h-3.5 w-32 rounded bg-ink-400/10" />
            <div className="h-3.5 w-12 rounded bg-ink-400/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
