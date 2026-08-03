import { useState } from "react";
import { Search, RotateCcw, Plus } from "lucide-react";
import { toast } from "sonner";

import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";
import { useGetPartiesSelectQuery } from "../partiesApi";
import {
  useGetPartnerOpeningBalancesQuery,
  useDeletePartnerOpeningBalanceMutation,
} from "../partnerOpeningBalancesApi";

import PartnerOpeningBalancesTable from "../components/Partneropeningbalancestable";
import PartnerOpeningBalanceModal from "../components/PartnerOpeningBalanceModal";

const currencyOptions = [
  { value: "EGP", label: "جنيه مصري" },
  { value: "USD", label: "دولار أمريكي" },
  { value: "EUR", label: "يورو" },
  { value: "GBP", label: "جنيه إسترليني" },
  { value: "SAR", label: "ريال سعودي" },
  { value: "AED", label: "درهم إماراتي" },
  { value: "KWD", label: "دينار كويتي" },
];

const balanceTypeOptions = [
  { value: "Receivable", label: "مدين" },
  { value: "Payable", label: "دائن" },
];

const emptyFilters = {
  documentNumber: "",
  businessPartnerId: "",
  currency: "",
  balanceType: "",
  fromDate: "",
  toDate: "",
};

export default function PartnerOpeningBalancesPage() {
  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data: parties } = useGetPartiesSelectQuery();
  const [deleteBalance] = useDeletePartnerOpeningBalanceMutation();

  const { data, isLoading, isFetching, isError, refetch } =
    useGetPartnerOpeningBalancesQuery({
      pageNumber: page,
      pageSize,
      documentNumber: applied.documentNumber || undefined,
      businessPartnerId: applied.businessPartnerId || undefined,
      currency: applied.currency || undefined,
      balanceType: applied.balanceType || undefined,
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

  const openCreateModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    setDeletingId(item.id);
    try {
      await deleteBalance(item.id).unwrap();
      toast.success("تم حذف الرصيد الافتتاحي");
    } catch (err) {
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (newPage) => setPage(newPage);
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink-900">
            الأرصدة الافتتاحية للعملاء والموردين
          </h2>
          <p className="mt-1 text-sm text-ink-400">
            تسجيل وإدارة الأرصدة الافتتاحية المدينة والدائنة
          </p>
        </div>

        <Button onClick={openCreateModal} className="h-9">
          <Plus size={14} />
          إضافة رصيد افتتاحي
        </Button>
      </div>

      {/* الفلاتر */}
      <div className="rounded-2xl border border-ink-400/10 bg-white p-3 shadow-card">
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-6">
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
              العميل / المورد
            </label>
            <CompactSelect
              options={
                parties?.map((p) => ({ value: p.id, label: p.name })) || []
              }
              value={draft.businessPartnerId}
              onChange={(value) => setField("businessPartnerId", value)}
              placeholder="الكل"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">
              العملة
            </label>
            <CompactSelect
              options={currencyOptions}
              value={draft.currency}
              onChange={(value) => setField("currency", value)}
              placeholder="الكل"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">
              نوع الرصيد
            </label>
            <CompactSelect
              options={balanceTypeOptions}
              value={draft.balanceType}
              onChange={(value) => setField("balanceType", value)}
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

      <PartnerOpeningBalancesTable
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        refetch={refetch}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onEdit={openEditModal}
        onDelete={handleDelete}
        deletingId={deletingId}
      />

      <PartnerOpeningBalanceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingItem={editingItem}
      />
    </div>
  );
}
