import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Search, PackageX, Plus } from "lucide-react";
import { useGetStoreStockReportQuery } from "../storesApi";
import Pagination from "../../../shared/components/ui/Pagination"; // عدّل المسار حسب مكانك
import QuickAddItemModal from "../../inventory/components/QuickAddItemModal"; // عدّل المسار حسب مكانك

const fmt = (v) => Number(v || 0).toLocaleString("ar-EG");

// TODO: الـ API الحالي (InventoryReports/stock) مبيرجعش تصنيف الصنف (category)،
// فمفيش فلترة حسب التصنيف دلوقتي زي ما كان مطلوب في الـ spec الأصلي.
// أول ما يتضاف الحقل ده في الـ response أو في fetch منفصل، نضيف فلتر Select هنا.
export default function StoreInventoryTab({
  storeId,
  activeTab = "inventory",
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [hasStock, setHasStock] = useState(undefined); // undefined = الكل
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data, isFetching, isError } = useGetStoreStockReportQuery({
    storeId,
    pageNumber,
    pageSize,
    search: search || undefined,
    hasStock,
  });

  const items = data?.items ?? [];

  return (
    <div className="bg-white rounded-2xl shadow-card p-6" dir="rtl">
      {/* أدوات البحث والفلترة */}
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-ink-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageNumber(1);
            }}
            placeholder="ابحث بكود أو اسم الصنف..."
            className="w-full pr-9 pl-3 py-2 text-sm rounded-xl border border-ink-100 focus:outline-none focus:ring-2 focus:ring-ink-200"
          />
        </div>

        <div className="flex items-center gap-1 bg-ink-50 rounded-xl p-1">
          {[
            { label: "الكل", value: undefined },
            { label: "برصيد فقط", value: true },
            { label: "بدون رصيد", value: false },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                setHasStock(opt.value);
                setPageNumber(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                hasStock === opt.value
                  ? "bg-white shadow-sm text-ink-900"
                  : "text-ink-500 hover:text-ink-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-white bg-ink-900 hover:bg-ink-800 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          إضافة صنف جديد
        </button>
      </div>

      {/* ملخص سريع */}
      {data?.summary && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <SummaryChip
            label="إجمالي الأصناف"
            value={fmt(data.summary.totalItemCount)}
          />
          <SummaryChip
            label="أصناف برصيد"
            value={fmt(data.summary.itemsWithStockCount)}
          />
          <SummaryChip
            label="إجمالي قيمة المخزون"
            value={`${fmt(data.summary.totalInventoryValue)} ${data.baseCurrency || ""}`}
          />
        </div>
      )}

      {isFetching && (
        <div className="py-14 text-center text-sm text-ink-400">
          جاري تحميل الأصناف...
        </div>
      )}

      {isError && (
        <div className="py-14 text-center text-sm text-rose-500">
          حدث خطأ أثناء تحميل أصناف المخزن.
        </div>
      )}

      {!isFetching && !isError && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-ink-500 text-xs border-b border-ink-100">
                  <th className="py-2.5 px-3 text-right font-medium">
                    كود الصنف
                  </th>
                  <th className="py-2.5 px-3 text-right font-medium">
                    اسم الصنف
                  </th>
                  <th className="py-2.5 px-3 text-right font-medium">الوحدة</th>
                  <th className="py-2.5 px-3 text-right font-medium">
                    الكمية الحالية
                  </th>
                  <th className="py-2.5 px-3 text-right font-medium">
                    متوسط التكلفة
                  </th>
                  <th className="py-2.5 px-3 text-right font-medium">
                    قيمة المخزون
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length ? (
                  items.map((row) => (
                    <tr
                      key={row.itemId}
                      className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono text-ink-600">
                        {row.itemCode}
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/items/${row.itemId}?fromStore=${storeId}&tab=${activeTab}`,
                            )
                          }
                          className="font-medium text-ink-900 hover:text-primary-600 hover:underline transition-colors"
                        >
                          {row.itemName}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-ink-600">
                        {row.itemUnitName}
                      </td>
                      <td className="py-2.5 px-3 text-ink-900 font-medium">
                        {fmt(row.balance)}
                      </td>
                      <td className="py-2.5 px-3 text-ink-700">
                        {fmt(row.averageCost)}
                      </td>
                      <td className="py-2.5 px-3 text-ink-900 font-medium">
                        {fmt(row.inventoryValue)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-14">
                      <div className="flex flex-col items-center text-center">
                        <PackageX className="w-8 h-8 text-ink-300 mb-2" />
                        <p className="text-ink-400 text-sm">
                          لا توجد أصناف مطابقة داخل هذا المخزن.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data?.totalCount > 0 && (
            <Pagination
              page={pageNumber}
              pageSize={pageSize}
              totalCount={data.totalCount}
              onPageChange={setPageNumber}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPageNumber(1);
              }}
              label="صنف"
            />
          )}
        </>
      )}

      <QuickAddItemModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={() => {
          toast.info(
            "الصنف اتضاف بنجاح. مش هيظهر في رصيد المخزن ده إلا بعد ما تسجّل له رصيد افتتاحي أو أول حركة عليه.",
          );
        }}
      />
    </div>
  );
}

function SummaryChip({ label, value }) {
  return (
    <div className="bg-ink-50 rounded-xl px-3.5 py-2.5">
      <p className="text-[11px] text-ink-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-ink-900">{value ?? "—"}</p>
    </div>
  );
}
