import { useState, useMemo } from "react";
import { Search, RotateCcw, AlertCircle } from "lucide-react";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";
import { useGetCountriesSelectQuery } from "../../countries/countriesApi";
import { useGetItemsSelectQuery } from "../../inventory/inventoryApi";
import { useGetPartnerItemInvoicesQuery } from "../statementsApi";

const emptyItemFilters = {
  fromDate: "",
  toDate: "",
  countryId: "",
  itemId: "",
};

export default function PartnerItemsTab({ partnerId }) {
  const [draft, setDraft] = useState(emptyItemFilters);
  const [applied, setApplied] = useState(emptyItemFilters);

  const { data: countries } = useGetCountriesSelectQuery();
  const { data: items } = useGetItemsSelectQuery();

  const { data, isLoading, isFetching, isError, refetch } =
    useGetPartnerItemInvoicesQuery(
      {
        businessPartnerId: partnerId,
        fromDate: applied.fromDate,
        toDate: applied.toDate,
        countryId: applied.countryId,
        itemId: applied.itemId,
      },
      { skip: !partnerId || !applied.itemId },
    );

  const rows = data?.items || [];

  const totalQuantity = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0),
    [rows],
  );

  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const handleSearch = () => setApplied(draft);
  const handleReset = () => {
    setDraft(emptyItemFilters);
    setApplied(emptyItemFilters);
  };

  return (
    <div className="space-y-4">
      {/* الفلاتر */}
      <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
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
            <label className="block text-xs font-medium text-ink-400 mb-1">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={draft.toDate}
              onChange={(e) => setField("toDate", e.target.value)}
              className="w-full rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              البلد
            </label>
            <CompactSelect
              options={
                countries?.map((c) => ({ value: c.id, label: c.name })) || []
              }
              value={draft.countryId}
              onChange={(val) => setField("countryId", val)}
              placeholder="اختر البلد"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              الصنف <span className="text-negative">*</span>
            </label>
            <CompactSelect
              options={
                items?.map((i) => ({ value: i.id, label: i.name })) || []
              }
              value={draft.itemId}
              onChange={(val) => setField("itemId", val)}
              placeholder="اختر الصنف"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="h-9 flex-1">
              <Search size={14} />
              بحث
            </Button>
            <Button variant="outline" onClick={handleReset} className="h-9">
              <RotateCcw size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* النتائج */}
      {!applied.itemId ? (
        <div className="text-center py-16 border border-dashed border-ink-400/20 rounded-2xl">
          <p className="text-ink-400 text-sm">اختر صنف وابحث لعرض الفواتير</p>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center gap-2 py-16 text-negative text-sm">
          <AlertCircle size={16} />
          حصل خطأ أثناء تحميل البيانات
          <button onClick={refetch} className="underline">
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-400/10 bg-white shadow-card">
          <table className="w-full text-right border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
                <th className="p-2.5 font-medium">رقم الفاتورة</th>
                <th className="p-2.5 font-medium">الصنف</th>
                <th className="p-2.5 font-medium">التاريخ</th>
                <th className="p-2.5 font-medium">العدد</th>
                <th className="p-2.5 font-medium">الكمية</th>
                <th className="p-2.5 font-medium">السعر</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-ink-400 text-sm"
                  >
                    جارِ التحميل...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-ink-400 text-sm"
                  >
                    لا توجد فواتير لهذا الصنف بالفلاتر المحددة
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr
                    key={row.invoiceId ?? idx}
                    className="border-b border-ink-400/5 last:border-0 hover:bg-ink-900/[0.012] transition-colors"
                  >
                    <td className="p-2.5 text-sm num">{row.invoiceNumber}</td>
                    <td className="p-2.5 text-sm">{row.itemName}</td>
                    <td className="p-2.5 text-sm num">{row.invoiceDate}</td>
                    <td className="p-2.5 text-sm num text-center">
                      {Number(row.count ?? 0).toLocaleString("ar-EG")}
                    </td>
                    <td className="p-2.5 text-sm num text-center">
                      {Number(row.quantity ?? 0).toLocaleString("ar-EG")}
                    </td>
                    <td className="p-2.5 text-sm num text-center">
                      {Number(row.price ?? 0).toLocaleString("ar-EG")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="bg-ink-900/[0.03] font-semibold">
                  <td className="p-2.5 text-sm" colSpan={4}>
                    الإجمالي
                  </td>
                  <td className="p-2.5 text-sm num text-center">
                    {totalQuantity.toLocaleString("ar-EG")}
                  </td>
                  <td className="p-2.5"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}
