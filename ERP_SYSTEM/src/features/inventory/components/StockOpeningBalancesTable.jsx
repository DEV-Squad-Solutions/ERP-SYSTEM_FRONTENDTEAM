import { useState } from "react";
import {
  FileSearch,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Pencil,
  Trash2,
} from "lucide-react";
import Pagination from "../../../shared/components/ui/Pagination";

function lineTotal(line) {
  return Number(line.total ?? line.quantity * line.price ?? 0);
}

function StockOpeningBalanceRow({ item, onEdit, onDelete, deletingId }) {
  const [expanded, setExpanded] = useState(false);

  const documentTotal = (item.lines || []).reduce(
    (sum, line) => sum + lineTotal(line),
    0,
  );

  return (
    <>
      <tr
        className="cursor-pointer border-b border-ink-400/5 transition-colors hover:bg-ink-900/[0.012]"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <td className="px-4 py-3">
          <ChevronDown
            size={15}
            className={`text-ink-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </td>
        <td className="px-4 py-3 text-sm font-medium num text-ink-900">
          {item.documentNumber}
        </td>
        <td className="num px-4 py-3 text-center text-sm text-ink-600">
          {item.documentDate}
        </td>
        <td className="px-4 py-3 text-sm text-ink-900">
          {item.storeName || "—"}
        </td>
        <td className="num px-4 py-3 text-center text-sm text-ink-600">
          {item.lineCount ?? item.lines?.length ?? 0}
        </td>
        <td className="num px-4 py-3 text-center text-sm font-semibold text-ink-900">
          {documentTotal.toLocaleString("ar-EG")}
        </td>
        <td
          className="max-w-[200px] truncate px-4 py-3 text-sm text-ink-500"
          title={item.notes}
        >
          {item.notes || "—"}
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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

      {expanded && (
        <tr className="border-b border-ink-400/5 bg-ink-900/[0.015]">
          <td colSpan={8} className="px-4 py-3">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="text-ink-400">
                  <th className="p-2 text-right font-medium">الصنف</th>
                  <th className="p-2 text-center font-medium">الوحدة</th>
                  <th className="p-2 text-center font-medium">العدد</th>
                  <th className="p-2 text-center font-medium">الوزن</th>
                  <th className="p-2 text-center font-medium">الكمية</th>
                  <th className="p-2 text-center font-medium">السعر</th>
                  <th className="p-2 text-center font-medium">الإجمالي</th>
                  <th className="p-2 text-right font-medium">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {(item.lines || []).map((line) => (
                  <tr key={line.id} className="border-t border-ink-400/5">
                    <td className="p-2 text-ink-900">
                      {line.itemName}{" "}
                      <span className="text-ink-400">({line.itemCode})</span>
                    </td>
                    <td className="num p-2 text-center text-ink-600">
                      {line.itemUnitName || "—"}
                    </td>
                    <td className="num p-2 text-center text-ink-600">
                      {line.count}
                    </td>
                    <td className="num p-2 text-center text-ink-600">
                      {line.weight}
                    </td>
                    <td className="num p-2 text-center text-ink-600">
                      {line.quantity}
                    </td>
                    <td className="num p-2 text-center text-ink-600">
                      {Number(line.price).toLocaleString("ar-EG")}
                    </td>
                    <td className="num p-2 text-center font-medium text-ink-900">
                      {lineTotal(line).toLocaleString("ar-EG")}
                    </td>
                    <td className="p-2 text-ink-500">{line.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

export default function StockOpeningBalancesTable({
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
          حدث خطأ في تحميل الأرصدة الافتتاحية المخزنية
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
              <th className="w-8 px-4 py-3"></th>
              <th className="px-4 py-3 text-right">رقم المستند</th>
              <th className="w-36 px-4 py-3 text-center">التاريخ</th>
              <th className="min-w-[180px] px-4 py-3 text-right">المخزن</th>
              <th className="w-28 px-4 py-3 text-center">عدد الأصناف</th>
              <th className="w-36 px-4 py-3 text-center">الإجمالي</th>
              <th className="min-w-[180px] px-4 py-3 text-right">ملاحظات</th>
              <th className="w-20 px-4 py-3"></th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <StockOpeningBalanceRow
                key={item.id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
                deletingId={deletingId}
              />
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
            label="سند"
          />
        </div>
      )}
    </div>
  );
}
