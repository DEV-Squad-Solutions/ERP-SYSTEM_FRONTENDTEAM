import {
  FileSearch,
  AlertCircle,
  RefreshCw,
  Pencil,
  Trash2,
} from "lucide-react";
import Pagination from "../../../shared/components/ui/Pagination";

const currencyLabels = {
  EGP: "جنيه مصري",
  USD: "دولار أمريكي",
  EUR: "يورو",
  GBP: "جنيه إسترليني",
  SAR: "ريال سعودي",
  AED: "درهم إماراتي",
  KWD: "دينار كويتي",
};

function BalanceTypeBadge({ type }) {
  const isReceivable = type === "Receivable";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        isReceivable
          ? "text-positive bg-positive/10"
          : "text-negative bg-negative/10"
      }`}
    >
      {isReceivable ? "مدين" : "دائن"}
    </span>
  );
}

export default function PartnerOpeningBalancesTable({
  data,
  isLoading,
  isFetching,
  isError,
  refetch,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  deletingId,
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-ink-400/5" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-negative/25 bg-negative/[0.02] py-14 text-center">
        <AlertCircle
          size={34}
          className="mx-auto mb-3 text-negative/70"
          strokeWidth={1.6}
        />
        <p className="mb-1 font-medium text-ink-900">
          حدث خطأ في تحميل الأرصدة الافتتاحية
        </p>
        <button
          onClick={refetch}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-500 transition-colors hover:bg-primary-100 hover:text-primary-600"
        >
          <RefreshCw size={15} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const items = data?.items || [];

  if (!isFetching && items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-400/20 py-16 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-ink-400/5">
          <FileSearch size={26} className="text-ink-400/50" strokeWidth={1.6} />
        </div>
        <p className="font-medium text-ink-900">
          لا توجد أرصدة افتتاحية مطابقة
        </p>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${
        isFetching ? "opacity-60" : ""
      }`}
    >
      <div className="overflow-x-auto custom-scroll">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-ink-900/[0.03]">
            <tr className="border-b border-ink-400/10 text-xs font-semibold text-ink-400">
              <th className="px-4 py-3 text-right">رقم المستند</th>
              <th className="w-36 px-4 py-3 text-center">التاريخ</th>
              <th className="min-w-[220px] px-4 py-3 text-right">
                العميل / المورد
              </th>
              <th className="w-28 px-4 py-3 text-center">النوع</th>
              <th className="w-32 px-4 py-3 text-center">العملة</th>
              <th className="w-36 px-4 py-3 text-center">المبلغ</th>
              <th className="w-40 px-4 py-3 text-center">
                المبلغ بالعملة الأساسية
              </th>
              <th className="min-w-[180px] px-4 py-3 text-right">ملاحظات</th>
              <th className="w-20 px-4 py-3"></th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-ink-400/5 transition-colors last:border-0 hover:bg-ink-900/[0.012]"
              >
                <td className="px-4 py-3 text-sm font-medium num text-ink-900">
                  {item.documentNumber}
                </td>
                <td className="num px-4 py-3 text-center text-sm text-ink-600">
                  {item.documentDate}
                </td>
                <td className="px-4 py-3 text-sm text-ink-900">
                  {item.businessPartnerName || "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  <BalanceTypeBadge type={item.balanceType} />
                </td>
                <td className="px-4 py-3 text-center text-sm text-ink-600">
                  {currencyLabels[item.currency] || item.currency}
                </td>
                <td className="num px-4 py-3 text-center text-sm font-semibold text-ink-900">
                  {Number(item.amount).toLocaleString("ar-EG")}
                </td>
                <td className="num px-4 py-3 text-center text-sm text-ink-500">
                  {Number(item.baseAmount).toLocaleString("ar-EG")}{" "}
                  <span className="text-xs text-ink-400">
                    {item.baseCurrency}
                  </span>
                </td>
                <td
                  className="max-w-[220px] truncate px-4 py-3 text-sm text-ink-500"
                  title={item.notes}
                >
                  {item.notes || "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit?.(item)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                      title="تعديل"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(item)}
                      disabled={deletingId === item.id}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-negative/10 hover:text-negative disabled:opacity-50"
                      title="حذف"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.totalPages > 0 && (
        <div className="border-t border-ink-400/10 bg-white px-5 py-4">
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={data?.totalCount || 0}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            label="رصيد"
          />
        </div>
      )}
    </div>
  );
}
