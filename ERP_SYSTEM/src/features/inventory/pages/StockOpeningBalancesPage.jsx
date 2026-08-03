import { useState } from "react";
import { Search, RotateCcw, Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";
import { useGetStoresSelectQuery } from "../../stores/storesApi";
import {
  useGetStockOpeningBalancesQuery,
  useDeleteStockOpeningBalanceMutation,
} from "../stockOpeningBalancesApi";

import StockOpeningBalancesTable from "../components/StockOpeningBalancesTable";
import StockOpeningBalanceForm from "../components/StockOpeningBalanceForm";

const emptyFilters = {
  documentNumber: "",
  storeId: "",
  fromDate: "",
  toDate: "",
};

export default function StockOpeningBalancesPage() {
  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [view, setView] = useState("list"); // "list" | "form"
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data: stores } = useGetStoresSelectQuery();
  const [deleteBalance] = useDeleteStockOpeningBalanceMutation();

  const { data, isLoading, isFetching, isError, refetch } =
    useGetStockOpeningBalancesQuery({
      pageNumber: page,
      pageSize,
      documentNumber: applied.documentNumber || undefined,
      storeId: applied.storeId || undefined,
      fromDate: applied.fromDate || undefined,
      toDate: applied.toDate || undefined,
    });

  const setField = (key, value) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSearch = () => {
    setApplied(draft);
    setPage(1);
  };

  const handleReset = () => {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setPage(1);
  };

  const openCreateForm = () => {
    setEditingItem(null);
    setView("form");
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setView("form");
  };

  const backToList = () => {
    setView("list");
    setEditingItem(null);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`متأكد من حذف السند "${item.documentNumber}"؟`)) return;
    setDeletingId(item.id);
    try {
      await deleteBalance(item.id).unwrap();
      toast.success("تم حذف الرصيد الافتتاحي المخزني");
    } catch (err) {
      toast.error("تعذر حذف الرصيد الافتتاحي");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (newPage) => setPage(newPage);
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  if (view === "form") {
    return (
      <div className="space-y-4">
        <button
          onClick={backToList}
          className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-primary-600 transition"
        >
          <ArrowRight size={16} />
          العودة للأرصدة الافتتاحية
        </button>

        <StockOpeningBalanceForm
          editingItem={editingItem}
          onSuccess={backToList}
          onCancel={backToList}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink-900">
            الأرصدة الافتتاحية المخزنية
          </h2>
          <p className="mt-1 text-sm text-ink-400">
            تسجيل الأرصدة الافتتاحية للأصناف بكل مخزن
          </p>
        </div>

        <Button onClick={openCreateForm} className="h-9">
          <Plus size={14} />
          إضافة رصيد افتتاحي
        </Button>
      </div>

      <div className="rounded-2xl border border-ink-400/10 bg-white p-3 shadow-card">
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">
              رقم المستند
            </label>
            <input
              type="text"
              value={draft.documentNumber}
              onChange={(e) => setField("documentNumber", e.target.value)}
              className="w-full rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">
              المخزن
            </label>
            <CompactSelect
              options={
                stores?.map((s) => ({ value: s.id, label: s.name })) || []
              }
              value={draft.storeId}
              onChange={(value) => setField("storeId", value)}
              placeholder="الكل"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">
              من تاريخ
            </label>
            <input
              type="date"
              value={draft.fromDate}
              onChange={(e) => setField("fromDate", e.target.value)}
              className="w-full rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={draft.toDate}
              onChange={(e) => setField("toDate", e.target.value)}
              className="w-full rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <div className="mt-3 flex justify-end gap-2">
          <Button variant="outline" onClick={handleReset} className="h-9">
            <RotateCcw size={14} />
            إعادة تعيين
          </Button>
          <Button onClick={handleSearch} disabled={isFetching} className="h-9">
            <Search size={14} />
            بحث
          </Button>
        </div>
      </div>

      <StockOpeningBalancesTable
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        refetch={refetch}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onEdit={openEditForm}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
    </div>
  );
}
