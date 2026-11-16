import { useState } from "react";
import { Plus, RotateCcw, Search } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";
import DeleteConfirmModal from "../../../shared/components/ui/DeleteConfirmModal";
import ReadOnlyFiscalYearBanner from "../../../shared/components/ui/ReadOnlyFiscalYearBanner";
import { useFiscalYearGuard } from "../../../lib/useFiscalYearGuard";
import { useOnFiscalYearChange } from "../../../lib/useOnFiscalYearChange";
import { selectIsAdmin } from "../../auth/authSlice";
import { selectSelectedFiscalYearId } from "../../fiscalYears/fiscalYearSlice";

import { useGetDriversSelectQuery } from "../driversApi";
import {
  useGetDriverOpeningBalancesQuery,
  useDeleteDriverOpeningBalanceMutation,
} from "../driverOpeningBalancesApi";

import DriverOpeningBalancesTable from "../components/DriverOpeningBalancesTable";
import DriverOpeningBalanceModal from "../components/DriverOpeningBalanceModal";

const EMPTY_FILTERS = {
  driverId: "",
};

export default function DriverOpeningBalancesPage() {
  const { isReadOnly: isFiscalYearReadOnly, fiscalYear } = useFiscalYearGuard();
  const selectedFiscalYearId = useSelector(selectSelectedFiscalYearId);
  const isAdmin = useSelector(selectIsAdmin);

  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  useOnFiscalYearChange(() => {
    setPage(1);
  });

  const { data: drivers } = useGetDriversSelectQuery();

  const [deleteBalance, { isLoading: isDeleting }] =
    useDeleteDriverOpeningBalanceMutation();

  const { data, isLoading, isFetching, isError, refetch } =
    useGetDriverOpeningBalancesQuery(
      {
        pageNumber: page,
        pageSize,
        fiscalYearId: selectedFiscalYearId,
        driverId: applied.driverId || undefined,
      },
      { skip: !selectedFiscalYearId },
    );

  const canManage = isAdmin && !isFiscalYearReadOnly;

  const setField = (key, value) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const handleSearch = () => {
    setApplied(draft);
    setPage(1);
  };

  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
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

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteBalance({
        id: itemToDelete.id,
        rowVersion: itemToDelete.rowVersion,
      }).unwrap();

      toast.success("تم حذف الرصيد الافتتاحي");
      setItemToDelete(null);
    } catch (error) {
      const code = error?.data?.errorCode ?? error?.data?.code;

      if (code === "DriverOpeningBalances.Concurrency") {
        toast.error(
          "تغيّر الرصيد الافتتاحي من مكان آخر. أعد تحميل البيانات ثم حاول مرة أخرى.",
        );
        setItemToDelete(null);
        refetch?.();
        return;
      }

      if (code === "DriverOpeningBalances.ReadOnly") {
        toast.error("الرصيد المرحّل للقراءة فقط ولا يمكن حذفه من هنا.");
        setItemToDelete(null);
        refetch?.();
        return;
      }

      toast.error(
        error?.data?.detail ||
          error?.data?.message ||
          error?.data?.title ||
          "تعذر حذف الرصيد الافتتاحي",
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink-900">
            الأرصدة الافتتاحية للسائقين
          </h2>
          <p className="mt-1 text-sm text-ink-400">
            تسجيل وإدارة الأرصدة الافتتاحية المدينة والدائنة لكل سائق
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={openCreateModal}
            className="h-9"
            disabled={isFiscalYearReadOnly || !selectedFiscalYearId}
          >
            <Plus size={14} />
            إضافة رصيد افتتاحي
          </Button>
        )}
      </div>

      {isFiscalYearReadOnly && (
        <ReadOnlyFiscalYearBanner fiscalYear={fiscalYear} />
      )}

      {!isAdmin && (
        <div className="rounded-2xl border border-ink-400/10 bg-ink-400/5 px-4 py-3 text-xs leading-6 text-ink-500">
          إضافة وتعديل وحذف أرصدة السائقين متاحة للمدير فقط. تقدر تشوف
          الأرصدة وكشف الحساب من هنا.
        </div>
      )}

      <div className="rounded-2xl border border-ink-400/10 bg-white p-3 shadow-card">
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">
              السائق
            </label>
            <CompactSelect
              options={
                drivers?.map((driver) => ({
                  value: driver.id,
                  label: driver.name,
                })) || []
              }
              value={draft.driverId}
              onChange={(value) => setField("driverId", value)}
              placeholder="كل السائقين"
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

      <DriverOpeningBalancesTable
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        refetch={refetch}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        onEdit={openEditModal}
        onDelete={setItemToDelete}
        deletingId={isDeleting ? itemToDelete?.id : null}
        canManage={canManage}
      />

      <DriverOpeningBalanceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingItem={editingItem}
      />

      <DeleteConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="حذف رصيد افتتاحي"
        itemName={itemToDelete?.documentNumber}
        description="سيتم حذف الرصيد الافتتاحي وقيده المرتبط. لا يمكن التراجع عن هذا الإجراء."
        isDeleting={isDeleting}
      />
    </div>
  );
}
