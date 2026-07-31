// features/drivers/pages/DriverTripCostEntryPage.jsx
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Save, RefreshCw, AlertCircle, Loader2, RotateCcw } from "lucide-react";
import {
  useGetDriverTripsCostEntryQuery,
  useBulkUpdateDriverTripCostsMutation,
  useGetDriversSelectQuery,
} from "../driversApi";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";

const hasCostOptions = [
  { value: "", label: "الكل" },
  { value: "true", label: "بها تكلفة" },
  { value: "false", label: "بدون تكلفة" },
];

const emptyFilters = {
  fromDate: "",
  toDate: "",
  driverId: "",
  invoiceNumber: "",
  tripNumber: "",
  hasCost: "",
};

export default function DriverTripCostEntryPage() {
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

  const { data: drivers } = useGetDriversSelectQuery();

  const { data, isLoading, isFetching, isError, refetch } =
    useGetDriverTripsCostEntryQuery({
      PageNumber: page,
      PageSize: pageSize,
      DriverId: applied.driverId || undefined,
      FromDate: applied.fromDate || undefined,
      ToDate: applied.toDate || undefined,
      InvoiceNumber: applied.invoiceNumber || undefined,
      TripNumber: applied.tripNumber || undefined,
      HasCost: applied.hasCost === "" ? undefined : applied.hasCost === "true",
    });

  const [bulkUpdate] = useBulkUpdateDriverTripCostsMutation();

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
    } catch (err) {
      toast.error("تعذر حفظ التعديلات — تأكد من عدم وجود صف قديم أو غير صحيح");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fadeUp space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            تكلفة رحلات السائقين
          </h2>
          <p className="text-sm text-ink-400 mt-1">
            عدّل تكلفة أكتر من رحلة واحفظهم مرة واحدة
          </p>
        </div>
        <Button onClick={handleSaveAll} disabled={!hasEdits || saving}>
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          حفظ التعديلات ({Object.keys(edits).length})
        </Button>
      </div>

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
            className={`overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${isFetching ? "opacity-60" : ""}`}
          >
            <table className="w-full text-right border-collapse min-w-[900px]">
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
                    رقم الفاتورة
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    التكلفة
                  </th>
                  <th className="p-2.5 font-medium">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const edited = edits[row.driverTripId];
                  return (
                    <tr
                      key={row.driverTripId}
                      className={`border-b border-ink-400/5 last:border-0 transition-colors ${
                        edited ? "bg-gold-50/40" : "hover:bg-ink-900/[0.01]"
                      }`}
                    >
                      <td className="p-2.5 num text-ink-900 text-[13px] border-l border-ink-400/5">
                        {row.tripNumber}
                      </td>
                      <td className="p-2.5 num text-ink-600 text-[13px] border-l border-ink-400/5">
                        {row.tripDate}
                      </td>
                      <td className="p-2.5 text-ink-700 text-[13px] border-l border-ink-400/5">
                        {row.driverName}
                      </td>
                      <td className="p-2.5 num text-ink-600 text-[13px] border-l border-ink-400/5">
                        {row.invoiceNumber || "—"}
                      </td>
                      <td className="p-1.5 border-l border-ink-400/5 w-[120px]">
                        <input
                          type="number"
                          value={edited?.cost ?? row.cost ?? ""}
                          onChange={(e) => setEdit(row, "cost", e.target.value)}
                          className="w-full text-xs bg-white border border-ink-400/15 rounded-lg px-2 py-1.5 num"
                        />
                      </td>
                      <td className="p-1.5 w-[220px]">
                        <input
                          type="text"
                          value={edited?.notes ?? row.costNotes ?? ""}
                          onChange={(e) =>
                            setEdit(row, "notes", e.target.value)
                          }
                          className="w-full text-xs bg-white border border-ink-400/15 rounded-lg px-2 py-1.5"
                        />
                      </td>
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
    </div>
  );
}
