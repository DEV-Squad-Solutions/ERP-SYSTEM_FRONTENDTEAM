// features/drivers/pages/DriverTripCostEntryPage.jsx
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Save,
  RefreshCw,
  AlertCircle,
  Loader2,
  RotateCcw,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  useGetDriverTripsCostEntryQuery,
  useBulkUpdateDriverTripCostsMutation,
  useDeleteDriverTripMutation,
  useGetDriversSelectQuery,
} from "../driversApi";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import DeleteConfirmModal from "../../../shared/components/ui/DeleteConfirmModal";
import { useFiscalYearGuard } from "../../../lib/useFiscalYearGuard";
import ReadOnlyFiscalYearBanner from "../../../shared/components/ui/ReadOnlyFiscalYearBanner";
import Pagination from "../../../shared/components/ui/Pagination";
import InvoiceNumberLink from "../../../shared/components/InvoiceNumberLink";
import { formatDate } from "../../../lib/date.js";
import { useOnFiscalYearChange } from "../../../lib/useOnFiscalYearChange";
import { clampFilterDates } from "../../../lib/fiscalYearDateRange";
import { selectIsAdmin } from "../../auth/authSlice";
import { selectSelectedFiscalYearId } from "../../fiscalYears/fiscalYearSlice";
import DriverTripModal from "../components/DriverTripModal";

const hasCostOptions = [
  { value: "", label: "الكل" },
  { value: "true", label: "بها تكلفة" },
  { value: "false", label: "بدون تكلفة" },
];

const standaloneOptions = [
  { value: "", label: "الكل" },
  { value: "true", label: "مستقلة (بدون فاتورة)" },
  { value: "false", label: "مرتبطة بفاتورة" },
];

const emptyFilters = {
  fromDate: "",
  toDate: "",
  driverId: "",
  invoiceNumber: "",
  tripNumber: "",
  hasCost: "",
  isStandalone: "",
};

const DELETE_ERROR_MESSAGES = {
  "DriverTrips.LinkedVoucher":
    "توجد سندات حالية أو تاريخية مرتبطة بالرحلة؛ لا يمكن حذفها.",
  "DriverTrips.Concurrency":
    "تم تعديل الرحلة من مكان آخر. أعد تحميل البيانات ثم حاول مرة أخرى.",
  "DriverTrips.InvoiceOwned":
    "رحلة الفاتورة تدار من خلال الفاتورة أو شاشة تكاليف الرحلات.",
  "DriverTrips.NotFound": "تعذر العثور على الرحلة داخل الشركة الحالية.",
};

export default function DriverTripCostEntryPage() {
  const { isReadOnly: isFiscalYearReadOnly, fiscalYear } = useFiscalYearGuard();
  const selectedFiscalYearId = useSelector(selectSelectedFiscalYearId);
  const isAdmin = useSelector(selectIsAdmin);
  const [searchParams] = useSearchParams();

  const initialFilters = {
    ...emptyFilters,
    driverId: searchParams.get("driverId") || "",
    tripNumber: searchParams.get("tripNumber") || "",
  };

  const [draft, setDraft] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [edits, setEdits] = useState({}); // { [driverTripId]: { cost, notes, rowVersion } }
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  useOnFiscalYearChange((year) => {
    setPage(1);
    setEdits({});
    setDraft((current) => clampFilterDates(current, ["fromDate", "toDate"], year));
    setApplied((current) =>
      clampFilterDates(current, ["fromDate", "toDate"], year),
    );
  });

  const { data: drivers } = useGetDriversSelectQuery();

  const { data, isLoading, isFetching, isError, refetch } =
    useGetDriverTripsCostEntryQuery(
      {
        PageNumber: page,
        PageSize: pageSize,
        FiscalYearId: selectedFiscalYearId || undefined,
        DriverId: applied.driverId || undefined,
        FromDate: applied.fromDate || undefined,
        ToDate: applied.toDate || undefined,
        InvoiceNumber: applied.invoiceNumber || undefined,
        TripNumber: applied.tripNumber || undefined,
        HasCost: applied.hasCost === "" ? undefined : applied.hasCost === "true",
        IsStandalone:
          applied.isStandalone === ""
            ? undefined
            : applied.isStandalone === "true",
      },
      { skip: !selectedFiscalYearId },
    );

  const [bulkUpdate] = useBulkUpdateDriverTripCostsMutation();
  const [deleteTrip, { isLoading: isDeleting }] = useDeleteDriverTripMutation();

  const canManage = isAdmin && !isFiscalYearReadOnly;

  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const handleSearch = () => {
    setApplied(draft);
    setPage(1);
  };

  const handleReset = () => {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setEdits({});
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
      await deleteTrip({
        id: itemToDelete.driverTripId,
        rowVersion: itemToDelete.rowVersion,
      }).unwrap();

      toast.success("تم حذف الرحلة");
      setItemToDelete(null);
    } catch (error) {
      const code = error?.data?.errorCode ?? error?.data?.code;

      toast.error(
        DELETE_ERROR_MESSAGES[code] ||
          error?.data?.detail ||
          error?.data?.message ||
          error?.data?.title ||
          "تعذر حذف الرحلة",
      );

      if (
        code === "DriverTrips.Concurrency" ||
        code === "DriverTrips.LinkedVoucher"
      ) {
        refetch?.();
      }
    }
  };

  const rows = data?.items || [];
  const hasEdits = Object.keys(edits).length > 0;

  const setEdit = (row, key, value) => {
    setEdits((prev) => ({
      ...prev,
      [row.driverTripId]: {
        cost: prev[row.driverTripId]?.cost ?? row.cost ?? "",
        notes: prev[row.driverTripId]?.notes ?? row.costNotes ?? "",
        rowVersion: row.rowVersion,
        [key]: value,
      },
    }));
  };

  const handleSaveAll = async () => {
    const items = Object.entries(edits).map(([driverTripId, e]) => ({
      driverTripId: Number(driverTripId),
      cost: e.cost === "" ? null : Number(e.cost),
      notes: e.notes || "",
      rowVersion: e.rowVersion,
    }));

    if (items.length === 0) return;

    setSaving(true);
    try {
      await bulkUpdate({ items }).unwrap();
      toast.success(`تم تحديث تكلفة ${items.length} رحلة`);
      setEdits({});
    } catch (error) {
      const code = error?.data?.errorCode ?? error?.data?.code;

      toast.error(
        code === "DriverTrips.Concurrency"
          ? "تم تعديل رحلة من مكان آخر. أعد تحميل البيانات ثم حاول مرة أخرى."
          : error?.data?.detail ||
              error?.data?.message ||
              "تعذر حفظ التعديلات — تأكد من عدم وجود صف قديم أو غير صحيح",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fadeUp space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            تكلفة رحلات السائقين
          </h2>
          <p className="text-sm text-ink-400 mt-1">
            أضف رحلات مستقلة بدون فواتير، أو عدّل تكلفة أكتر من رحلة واحفظهم
            مرة واحدة
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <Button
              variant="outline"
              onClick={openCreateModal}
              disabled={!canManage || !selectedFiscalYearId}
            >
              <Plus size={16} />
              إضافة رحلة مستقلة
            </Button>
          )}

          {isAdmin && (
            <Button
              onClick={handleSaveAll}
              disabled={!hasEdits || saving || isFiscalYearReadOnly}
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              حفظ التعديلات ({Object.keys(edits).length})
            </Button>
          )}
        </div>
      </div>

      {isFiscalYearReadOnly && (
        <ReadOnlyFiscalYearBanner fiscalYear={fiscalYear} />
      )}

      {!isAdmin && (
        <div className="rounded-2xl border border-ink-400/10 bg-ink-400/5 px-4 py-3 text-xs leading-6 text-ink-500">
          إنشاء أو تعديل أو حذف رحلات السائقين متاح للمدير فقط. تقدر تشوف
          الرحلات وتكاليفها من هنا.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <CompactSelect
            label="السائق"
            options={
              drivers?.map((d) => ({ value: d.id, label: d.name })) || []
            }
            value={draft.driverId}
            onChange={(val) => setField("driverId", val)}
            placeholder="كل السائقين"
          />
          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              نوع الرحلة
            </label>
            <CompactSelect
              options={standaloneOptions}
              value={draft.isStandalone}
              onChange={(val) => setField("isStandalone", val)}
            />
          </div>
          <Input
            label="من تاريخ"
            type="date"
            min={fiscalYear?.startDate}
            max={fiscalYear?.endDate}
            value={draft.fromDate}
            onChange={(e) => setField("fromDate", e.target.value)}
          />
          <Input
            label="إلى تاريخ"
            type="date"
            min={fiscalYear?.startDate}
            max={fiscalYear?.endDate}
            value={draft.toDate}
            onChange={(e) => setField("toDate", e.target.value)}
          />
          <Input
            label="رقم الرحلة"
            value={draft.tripNumber}
            onChange={(e) => setField("tripNumber", e.target.value)}
          />
          <Input
            label="رقم الفاتورة"
            value={draft.invoiceNumber}
            onChange={(e) => setField("invoiceNumber", e.target.value)}
          />
          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              تكلفة الرحلة
            </label>
            <CompactSelect
              options={hasCostOptions}
              value={draft.hasCost}
              onChange={(val) => setField("hasCost", val)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-ink-400/10">
          <Button onClick={handleSearch} className="h-9">
            بحث
          </Button>
          <Button variant="outline" onClick={handleReset} className="h-9">
            <RotateCcw size={14} />
            تصفير
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 rounded-lg bg-ink-400/5 animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-14 border border-dashed border-negative/25 bg-negative/[0.02] rounded-2xl">
          <AlertCircle
            size={32}
            className="mx-auto text-negative/70 mb-3"
            strokeWidth={1.6}
          />
          <p className="text-ink-900 font-medium text-sm mb-1">
            حدث خطأ في تحميل الرحلات
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
          <p className="text-ink-900 font-medium text-sm mb-1">
            لا توجد رحلات مطابقة
          </p>
          <p className="text-xs text-ink-400">جرّب تعديل الفلاتر</p>
        </div>
      ) : (
        <>
          <div
            className={`overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${
              isFetching ? "opacity-60" : ""
            }`}
          >
            <table className="w-full text-right border-collapse min-w-[1150px]">
              <thead>
                <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    رقم الرحلة
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    التاريخ
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    السائق
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    العميل
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الدولة
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    رقم الفاتورة
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    تكلفة الرحلة
                  </th>

                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    ملاحظات
                  </th>

                  {canManage && (
                    <th className="p-2.5 font-medium w-20">إجراءات</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => {
                  const edited = edits[row.driverTripId];
                  const isStandalone =
                    row.isStandalone ?? row.invoiceId == null;
                  const isRowReadOnly = Boolean(row.isReadOnly);
                  const canEditRow =
                    canManage && isStandalone && !isRowReadOnly;
                  const canEditInline =
                    isAdmin &&
                    !isFiscalYearReadOnly &&
                    !isRowReadOnly &&
                    !isStandalone;

                  const currentCost = edited?.cost ?? row.cost ?? "";

                  const hasCost =
                    currentCost !== "" &&
                    currentCost !== null &&
                    Number(currentCost) >= 0;

                  return (
                    <tr
                      key={row.driverTripId}
                      className={`
              border-b border-ink-400/5 last:border-0
              transition-colors
              ${
                edited
                  ? "bg-gold-50/40"
                  : !hasCost
                    ? "bg-negative/[0.025]"
                    : "hover:bg-ink-900/[0.01]"
              }
            `}
                    >
                      {/* رقم الرحلة */}
                      <td className="p-2.5 border-l border-ink-400/5 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="num text-[13px] font-semibold text-ink-900">
                            {row.tripNumber}
                          </span>

                          <span
                            className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              isStandalone
                                ? "bg-primary-50 text-primary-600"
                                : "bg-ink-400/10 text-ink-500"
                            }`}
                          >
                            {isStandalone ? "مستقلة" : "فاتورة"}
                          </span>
                        </div>
                      </td>

                      {/* التاريخ */}
                      <td className="p-2.5 border-l border-ink-400/5 whitespace-nowrap">
                        <span className="num text-[12px] text-ink-600">
                          {row.tripDate ? formatDate(row.tripDate) : "—"}
                        </span>
                      </td>

                      {/* السائق */}
                      <td className="p-2.5 border-l border-ink-400/5 min-w-[150px]">
                        <div className="flex flex-col min-w-0">
                          <span
                            className="text-[12px] font-medium text-ink-800 truncate"
                            title={row.driverName}
                          >
                            {row.driverName || "—"}
                          </span>

                          {row.actualDriverName && (
                            <span
                              className="text-[10px] text-ink-400 mt-0.5 truncate"
                              title={row.actualDriverName}
                            >
                              الفعلي: {row.actualDriverName}
                            </span>
                          )}

                          {!row.actualDriverName && (
                            <span className="text-[10px] text-ink-400 mt-0.5">
                              ID: {row.driverId ?? "—"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* العميل */}
                      <td className="p-2.5 border-l border-ink-400/5 min-w-[190px]">
                        <span
                          className="block text-[12px] font-medium text-ink-800 truncate"
                          title={row.businessPartnerName}
                        >
                          {row.businessPartnerName || "—"}
                        </span>
                      </td>

                      {/* الدولة */}
                      <td className="p-2.5 border-l border-ink-400/5 whitespace-nowrap">
                        {row.countryName ? (
                          <span className="inline-flex items-center rounded-md bg-primary-50 px-2 py-1 text-[11px] font-medium text-primary-600">
                            {row.countryName}
                          </span>
                        ) : (
                          <span className="text-xs text-ink-300">—</span>
                        )}
                      </td>

                      {/* الفاتورة */}
                      <td className="p-2.5 border-l border-ink-400/5 whitespace-nowrap">
                        {row.invoiceNumber ? (
                          <InvoiceNumberLink
                            invoiceId={row.invoiceId}
                            invoiceType={row.invoiceType}
                            invoiceNumber={row.invoiceNumber}
                            className="num text-[12px] font-medium"
                          />
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-ink-400/10 px-2 py-1 text-[11px] font-medium text-ink-500">
                            بدون فاتورة
                          </span>
                        )}
                      </td>

                      {/* التكلفة */}
                      <td className="p-1.5 border-l border-ink-400/5 w-[150px]">
                        {isStandalone || !canEditInline ? (
                          <div className="flex items-center justify-center gap-1 px-2 py-2">
                            <span className="num text-[12px] font-semibold text-ink-900">
                              {row.costText ??
                                (row.cost == null
                                  ? "—"
                                  : Number(row.cost).toLocaleString("ar-EG", {
                                      maximumFractionDigits: 2,
                                    }))}
                            </span>
                            {row.cost != null && row.baseCurrency && (
                              <span className="text-[10px] text-ink-400">
                                {row.baseCurrency}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={currentCost}
                              onChange={(e) =>
                                setEdit(row, "cost", e.target.value)
                              }
                              placeholder="أدخل التكلفة"
                              className={`
                    w-full text-xs
                    bg-white
                    rounded-lg
                    px-2.5 py-2
                    num
                    focus:outline-none
                    focus:ring-1
                    transition
                    ${
                      !hasCost
                        ? "border border-negative/25 focus:border-negative-400 focus:ring-negative-400/10"
                        : edited
                          ? "border border-gold-400/50 focus:border-gold-500 focus:ring-gold-500/10"
                          : "border border-ink-400/15 focus:border-primary-500 focus:ring-primary-500/10"
                    }
                  `}
                            />
                          </div>
                        )}
                      </td>

                      {/* الملاحظات */}
                      <td className="p-1.5 w-[230px]">
                        {isStandalone || !canEditInline ? (
                          <span
                            className="block max-w-[220px] truncate px-2.5 text-xs text-ink-600"
                            title={row.costNotes}
                          >
                            {row.costNotes || "—"}
                          </span>
                        ) : (
                          <input
                            type="text"
                            value={edited?.notes ?? row.costNotes ?? ""}
                            onChange={(e) =>
                              setEdit(row, "notes", e.target.value)
                            }
                            placeholder="ملاحظة..."
                            className="
                  w-full text-xs
                  bg-white
                  border border-ink-400/15
                  rounded-lg
                  px-2.5 py-2
                  focus:outline-none
                  focus:border-primary-500
                  focus:ring-1
                  focus:ring-primary-500/10
                  transition
                "
                          />
                        )}
                      </td>

                      {canManage && (
                        <td className="p-2.5">
                          {canEditRow ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditModal(row)}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                                title="تعديل الرحلة"
                              >
                                <Pencil size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setItemToDelete(row)}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-negative/10 hover:text-negative"
                                title="حذف الرحلة"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="block text-center text-[10px] text-ink-300">
                              {isRowReadOnly ? "للقراءة فقط" : "—"}
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
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

      <DriverTripModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingItem={editingItem}
      />

      <DeleteConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="حذف رحلة"
        itemName={itemToDelete?.tripNumber}
        description="سيتم حذف الرحلة المستقلة وقيد تكلفتها المرتبط. لا يمكن التراجع عن هذا الإجراء."
        isDeleting={isDeleting}
      />
    </div>
  );
}
