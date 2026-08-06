import { useState } from "react";
import { useGetStockTransfersQuery } from "../storesApi";
import Pagination from "../../../shared/components/ui/Pagination"; // عدّل المسار حسب مكانك

// ملاحظة: تأكد من الأسماء الفعلية لفلاتر GET /StockTransfers في الـ Swagger
// (مثلاً FromStoreId / ToStoreId / StoreId) وعدّل الـ params تحت لو مختلفة.
export default function StoreTransfersTab({ storeId }) {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, isFetching, isError } = useGetStockTransfersQuery({
    storeId,
    pageNumber,
    pageSize,
  });

  const transfers = data?.items ?? [];

  return (
    <div className="bg-white rounded-2xl shadow-card p-6" dir="rtl">
      {isFetching && (
        <div className="py-14 text-center text-sm text-ink-400">
          جاري تحميل التحويلات...
        </div>
      )}

      {isError && (
        <div className="py-14 text-center text-sm text-rose-500">
          حدث خطأ أثناء تحميل التحويلات.
        </div>
      )}

      {!isFetching && !isError && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-ink-500 text-xs border-b border-ink-100">
                <th className="py-2.5 px-3 text-right font-medium">
                  رقم التحويل
                </th>
                <th className="py-2.5 px-3 text-right font-medium">التاريخ</th>
                <th className="py-2.5 px-3 text-right font-medium">من مخزن</th>
                <th className="py-2.5 px-3 text-right font-medium">إلى مخزن</th>
                <th className="py-2.5 px-3 text-right font-medium">
                  عدد الأصناف
                </th>
                <th className="py-2.5 px-3 text-right font-medium">الاتجاه</th>
                <th className="py-2.5 px-3 text-right font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length ? (
                transfers.map((t) => {
                  const isOut = t.fromStoreId === storeId;
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <button className="text-ink-600 font-medium hover:underline">
                          {t.transferNumber ?? t.code ?? t.id}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-ink-700">
                        {t.date
                          ? new Date(t.date).toLocaleDateString("ar-EG")
                          : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-ink-700">
                        {t.fromStoreName ?? "—"}
                      </td>
                      <td className="py-2.5 px-3 text-ink-700">
                        {t.toStoreName ?? "—"}
                      </td>
                      <td className="py-2.5 px-3 text-ink-700">
                        {t.itemsCount ?? t.linesCount ?? "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            isOut
                              ? "bg-rose-50 text-rose-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {isOut ? "صادر" : "وارد"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-ink-50 text-ink-600">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-ink-400">
                    لا توجد تحويلات لهذا المخزن.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

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
              label="تحويل"
            />
          )}
        </div>
      )}
    </div>
  );
}
