import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  Eye,
  Loader2,
  Package,
  Warehouse,
} from "lucide-react";
import Pagination from "../../../shared/components/ui/Pagination";
import { useGetStockTransfersQuery } from "../../inventory/stockTransfersApi";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatNumber = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) return "—";

  return number.toLocaleString("ar-EG", {
    maximumFractionDigits: 2,
  });
};

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
    <div
      className="bg-white rounded-2xl shadow-card border border-ink-100 overflow-hidden"
      dir="rtl"
    >
      <div className="px-6 py-5 border-b border-ink-100">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <Warehouse size={19} />
              </div>

              <div>
                <h3 className="text-base font-semibold text-ink-900">
                  تحويلات المخزن
                </h3>

                <p className="text-xs text-ink-400 mt-0.5">
                  سجل التحويلات الواردة والصادرة من وإلى هذا المخزن
                </p>
              </div>
            </div>
          </div>

          {data?.totalCount > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-ink-50 text-ink-600 text-xs font-medium">
              <Boxes size={15} />
              <span>{formatNumber(data.totalCount)} تحويل</span>
            </div>
          )}
        </div>
      </div>

      {isFetching && (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-ink-400">
          <Loader2 size={28} className="animate-spin text-primary-500" />

          <span className="text-sm">جاري تحميل التحويلات...</span>
        </div>
      )}

      {isError && !isFetching && (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
            <Package size={22} />
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-ink-800">
              تعذر تحميل التحويلات
            </p>

            <p className="text-xs text-ink-400 mt-1">
              حدث خطأ أثناء جلب بيانات تحويلات المخزن.
            </p>
          </div>
        </div>
      )}

      {!isFetching && !isError && (
        <>
          {transfers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-ink-50/70 border-b border-ink-100 text-xs text-ink-500">
                    <th className="px-5 py-3.5 text-right font-semibold">
                      رقم التحويل
                    </th>

                    <th className="px-5 py-3.5 text-right font-semibold">
                      التاريخ
                    </th>

                    <th className="px-5 py-3.5 text-right font-semibold">
                      من مخزن
                    </th>

                    <th className="px-5 py-3.5 text-right font-semibold">
                      إلى مخزن
                    </th>

                    <th className="px-5 py-3.5 text-center font-semibold">
                      الأصناف
                    </th>

                    <th className="px-5 py-3.5 text-center font-semibold">
                      الكمية
                    </th>

                    <th className="px-5 py-3.5 text-center font-semibold">
                      الاتجاه
                    </th>

                    <th className="px-5 py-3.5 text-center font-semibold">
                      إجراء
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-ink-50">
                  {transfers.map((transfer) => {
                    const isOut =
                      Number(transfer.sourceStoreId) === Number(storeId);

                    const isIn =
                      Number(transfer.destinationStoreId) === Number(storeId);

                    return (
                      <tr
                        key={transfer.id}
                        className="group hover:bg-ink-50/40 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                          >
                            <span>
                              {transfer.documentNumber ?? `#${transfer.id}`}
                            </span>
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-ink-600">
                            <CalendarDays size={15} className="text-ink-400" />

                            <span>{formatDate(transfer.transferDate)}</span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                              <Warehouse size={15} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-ink-800 font-medium truncate">
                                {transfer.sourceStoreName ?? "—"}
                              </p>

                              {transfer.sourceStoreId && (
                                <p className="text-[11px] text-ink-400">
                                  مخزن #{transfer.sourceStoreId}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                              <Warehouse size={15} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-ink-800 font-medium truncate">
                                {transfer.destinationStoreName ?? "—"}
                              </p>

                              {transfer.destinationStoreId && (
                                <p className="text-[11px] text-ink-400">
                                  مخزن #{transfer.destinationStoreId}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-lg bg-ink-50 text-ink-700 font-semibold">
                            {formatNumber(transfer.lineCount)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className="font-semibold text-ink-800">
                            {formatNumber(transfer.totalQuantity?.parsedValue)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold">
                              <ArrowUpRight size={14} />
                              صادر
                            </span>
                          ) : isIn ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                              <ArrowDownLeft size={14} />
                              وارد
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-ink-50 text-ink-500 text-xs font-semibold">
                              غير محدد
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-ink-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                            title="عرض التحويل"
                          >
                            <Eye size={17} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-ink-50 text-ink-400 flex items-center justify-center mb-4">
                <Boxes size={26} />
              </div>

              <h4 className="text-sm font-semibold text-ink-800">
                لا توجد تحويلات
              </h4>

              <p className="text-xs text-ink-400 mt-1 text-center">
                لا يوجد سجل تحويلات مرتبط بهذا المخزن حتى الآن.
              </p>
            </div>
          )}

          {data?.totalCount > 0 && (
            <div className="border-t border-ink-100 px-5">
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
