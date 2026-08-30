// features/exchange-rates/pages/CurrenciesPage.jsx

import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Coins,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  RefreshCw,
  Download,
} from "lucide-react";

import {
  useGetExchangeRatesQuery,
  useDeleteExchangeRateMutation,
} from "../exchangeRatesApi";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";
import CurrencyFormModal from "../components/CurrencyFormModal";
import ImportExchangeRatesModal from "../components/ImportExchangeRatesModal";
import { selectIsAdmin } from "../../auth/authSlice";

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function CurrenciesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [importOpen, setImportOpen] = useState(false);

  const isAdmin = useSelector(selectIsAdmin);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetExchangeRatesQuery({ pageNumber: page, pageSize });

  const [deleteExchangeRate, { isLoading: isDeleting }] =
    useDeleteExchangeRateMutation();

  const rows = data?.items || [];

  function handleDelete(r) {
    toast.warning(`هل أنت متأكد من حذف سعر ${r.currency}؟`, {
      duration: 8000,
      action: {
        label: "حذف",
        onClick: async () => {
          try {
            await deleteExchangeRate({
              id: r.id,
              rowVersion: r.rowVersion,
            }).unwrap();
            toast.success("تم حذف السعر بنجاح");
            refetch();
          } catch (err) {
            toast.error(
              err?.data?.detail ||
                err?.data?.title ||
                "لا يمكن حذف السعر — قد يكون مرتبطًا بحركات فعلية",
            );
          }
        },
      },
      cancel: { label: "إلغاء" },
    });
  }

  return (
    <div className="animate-fadeUp space-y-5" dir="rtl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">
            <Coins size={20} className="text-primary-500" />
            العملات وأسعار الصرف
          </h2>
          <p className="mt-1 text-sm text-ink-400">
            إدارة أسعار صرف العملات المستخدمة في السندات والفواتير
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Download size={16} />
              استيراد من مصدر خارجي
            </Button>
          )}

          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} />
            إضافة سعر عملة
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-dashed border-ink-400/20 py-16 text-center text-ink-400">
          جاري تحميل العملات...
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          <span className="flex items-center gap-2">
            <AlertCircle size={16} />
            حدث خطأ أثناء تحميل العملات.
          </span>
          <button
            type="button"
            onClick={refetch}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1 text-xs font-medium transition hover:bg-rose-100"
          >
            <RefreshCw size={12} />
            إعادة المحاولة
          </button>
        </div>
      )}

      {data && (
        <div
          className={`overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${
            isFetching ? "opacity-70" : ""
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm" dir="rtl">
              <thead>
                <tr className="bg-ink-400/5 text-xs text-ink-400">
                  <th className="px-3 py-2.5 text-right font-medium">العملة</th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    السعر (مقابل {rows[0]?.baseCurrency || "EGP"})
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    تاريخ السعر
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    آخر تحديث
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    إجراءات
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-14 text-center text-ink-400"
                    >
                      لا توجد عملات مسجلة
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-ink-400/10 transition-colors hover:bg-ink-900/[0.015]"
                    >
                      <td className="px-3 py-2.5 font-semibold text-ink-800">
                        {r.currency}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-medium text-ink-700">
                        {r.rate}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-ink-600">
                        {fmtDate(r.rateDate)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[11px] text-ink-400">
                        {r.updatedOn ? fmtDate(r.updatedOn) : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingRate(r)}
                            title="تعديل السعر"
                            className="rounded-lg p-1.5 text-ink-400 transition hover:bg-primary-500/10 hover:text-primary-600"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(r)}
                            disabled={isDeleting}
                            title="حذف السعر"
                            className="rounded-lg p-1.5 text-ink-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {data.totalCount > 0 && (
            <Pagination
              page={data.pageNumber || page}
              pageSize={data.pageSize || pageSize}
              totalCount={data.totalCount}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              label="سعر"
            />
          )}
        </div>
      )}

      <CurrencyFormModal
        isOpen={createOpen}
        rate={null}
        onClose={() => setCreateOpen(false)}
        onSaved={() => {
          setCreateOpen(false);
          setPage(1);
          refetch();
        }}
      />

      <ImportExchangeRatesModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onDone={() => {
          setPage(1);
          refetch();
        }}
      />

      <CurrencyFormModal
        isOpen={Boolean(editingRate)}
        rate={editingRate}
        onClose={() => setEditingRate(null)}
        onSaved={() => {
          setEditingRate(null);
          refetch();
        }}
      />
    </div>
  );
}
