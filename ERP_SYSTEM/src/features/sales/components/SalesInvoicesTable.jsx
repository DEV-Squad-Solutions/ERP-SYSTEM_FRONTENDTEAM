import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import {
  Eye,
  Pencil,
  Printer,
  Boxes,
  Trash2,
  MoreVertical,
  FileSearch,
  AlertCircle,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  CircleCheck,
  CircleDashed,
} from "lucide-react";
import { useDeleteInvoiceMutation } from "../../invoices/invoicesApi";
import PackagingDrawer from "./PackagingDrawer";
import Pagination from "../../../shared/components/ui/Pagination";
import { useInvoicePrint } from "../../../shared/hooks/useInvoicePrint";
import InvoicePrintTemplate from "../../../shared/components/print/InvoicePrintTemplate";

const typeLabels = {
  Sales: "بيع",
  Purchase: "شراء",
  SalesReturn: "مرتجع بيع",
  PurchaseReturn: "مرتجع شراء",
};

const paymentLabels = {
  Cash: "نقدي",
  Credit: "آجل",
};

const fmt = (v) => Number(v || 0).toLocaleString("ar-EG");

// نص قابل للقص مع إظهار الكامل عند المرور بالماوس (title)
function TruncatedText({
  text,
  className = "",
  maxWidthClass = "max-w-[160px]",
}) {
  const value = text || "—";
  return (
    <span
      title={value !== "—" ? value : undefined}
      className={`block truncate ${maxWidthClass} ${className}`}
    >
      {value}
    </span>
  );
}

// حالة التسعير: مسعّرة / غير مسعّرة
// الباك مش بيرجع حقل priceStatus، فبنستنتجها من total
// (الفاتورة بتتعمل الأول بالكمية بس total=0، وبعدين التسعير بيحدّث total)
function PricingStatusBadge({ invoice }) {
  const isPriced = Number(invoice.total ?? 0) > 0;
  return isPriced ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-positive bg-positive/10 rounded-full px-2 py-0.5">
      <CircleCheck size={11} />
      مسعّرة
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-400 bg-ink-400/10 rounded-full px-2 py-0.5">
      <CircleDashed size={11} />
      غير مسعّرة
    </span>
  );
}

const columnHelper = createColumnHelper();

/**
 * @param {{
 *   data: Object,
 *   isLoading: boolean,
 *   isFetching: boolean,
 *   isError: boolean,
 *   refetch: () => void,
 *   page: number,
 *   pageSize: number,
 *   onPageChange: (page: number) => void,
 *   onPageSizeChange: (size: number) => void,
 * }} props
 */
export default function SalesInvoicesTable({
  data,
  isLoading,
  isFetching,
  isError,
  refetch,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  const navigate = useNavigate();
  const [deleteInvoice] = useDeleteInvoiceMutation();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [packagingFor, setPackagingFor] = useState(null);
  const [sorting, setSorting] = useState([]);

  const handleDelete = (id) => {
    setOpenMenuId(null);
    deleteInvoice(id);
    toast.success("تم حذف الفاتورة");
  };
  const { printInvoice, printRef, invoiceToPrint } = useInvoicePrint();

  const columns = useMemo(
    () => [
      columnHelper.accessor("invoiceNumber", {
        header: "رقم الفاتورة",
        cell: (info) => (
          <span className="num font-medium text-ink-900 text-[13px]">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("invoiceDate", {
        header: "التاريخ",
        cell: (info) => (
          <span className="num text-ink-600 text-[13px] whitespace-nowrap">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("invoiceType", {
        header: "النوع",
        enableSorting: false,
        cell: (info) => (
          <span className="text-ink-600 text-xs">
            {typeLabels[info.getValue()] || info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("businessPartnerName", {
        header: "العميل",
        cell: (info) => (
          <TruncatedText
            text={info.getValue()}
            className="text-ink-900 text-[13px]"
            maxWidthClass="max-w-[150px]"
          />
        ),
      }),
      columnHelper.accessor("storeName", {
        header: "المخزن",
        enableSorting: false,
        cell: (info) => (
          <TruncatedText
            text={info.getValue()}
            className="text-ink-600 text-xs"
            maxWidthClass="max-w-[110px]"
          />
        ),
      }),
      columnHelper.accessor("paymentTerm", {
        header: "الدفع",
        enableSorting: false,
        cell: (info) => (
          <span className="text-ink-600 text-xs">
            {paymentLabels[info.getValue()] || "—"}
          </span>
        ),
      }),
      columnHelper.accessor("total", {
        header: "الإجمالي",
        cell: (info) => (
          <span className="num font-medium text-ink-900 text-[13px] whitespace-nowrap">
            {fmt(info.getValue())} {info.row.original.currency}
          </span>
        ),
      }),
      columnHelper.accessor("paidAmount", {
        header: "المدفوع",
        cell: (info) => (
          <span className="num text-positive text-[13px] whitespace-nowrap">
            {fmt(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("remainingAmount", {
        header: "المتبقي",
        cell: (info) => (
          <span
            className={`num font-medium text-[13px] whitespace-nowrap ${
              (info.getValue() || 0) > 0 ? "text-negative" : "text-positive"
            }`}
          >
            {fmt(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("total", {
        id: "pricingStatus",
        header: "الحالة",
        enableSorting: false,
        cell: (info) => <PricingStatusBadge invoice={info.row.original} />,
      }),
      columnHelper.display({
        id: "actions",
        header: "إجراءات",
        cell: (info) => {
          const inv = info.row.original;
          return (
            <div className="flex items-center gap-0.5 relative">
              <button
                onClick={() => navigate(`/dashboard/sales/${inv.id}`)}
                className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50"
                title="عرض"
              >
                <Eye size={14} />
              </button>
              <button
                onClick={() => navigate(`/dashboard/sales/${inv.id}/edit`)}
                className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50"
                title="تعديل"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => printInvoice(inv)}
                className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-400/5"
                title="طباعة"
              >
                <Printer size={14} />
              </button>
              {inv.invoiceType === "Sales" && inv.containerLineCount > 0 && (
                <button
                  onClick={() => setPackagingFor(inv)}
                  className="p-1.5 rounded-lg text-gold-600 hover:bg-gold-50"
                  title="مخزن العبوات"
                >
                  <Boxes size={14} />
                </button>
              )}
              <button
                onClick={() =>
                  setOpenMenuId(openMenuId === inv.id ? null : inv.id)
                }
                className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-400/5"
                title="المزيد"
              >
                <MoreVertical size={14} />
              </button>

              {openMenuId === inv.id && (
                <>
                  <div
                    onClick={() => setOpenMenuId(null)}
                    className="fixed inset-0 z-10"
                  />
                  <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-xl shadow-card border border-ink-400/10 py-1 z-20 animate-fadeUp">
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-negative hover:bg-negative/5 text-right"
                    >
                      <Trash2 size={13} />
                      حذف الفاتورة
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        },
      }),
    ],
    [openMenuId],
  );

  const table = useReactTable({
    data: data?.items || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  // ==================== حالة التحميل ====================
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card overflow-hidden">
        <div className="h-10 bg-ink-900/[0.03] border-b border-ink-400/10" />
        <div className="divide-y divide-ink-400/5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-3 py-3">
              <div className="h-3.5 w-16 rounded bg-ink-400/10 animate-pulse" />
              <div className="h-3.5 w-20 rounded bg-ink-400/10 animate-pulse" />
              <div className="h-3.5 w-14 rounded bg-ink-400/10 animate-pulse" />
              <div className="h-3.5 flex-1 max-w-[150px] rounded bg-ink-400/10 animate-pulse" />
              <div className="h-3.5 w-24 rounded bg-ink-400/10 animate-pulse" />
              <div className="h-3.5 w-16 rounded bg-ink-400/10 animate-pulse" />
              <div className="h-3.5 w-20 rounded bg-ink-400/10 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==================== حالة الخطأ ====================
  if (isError) {
    return (
      <div className="text-center py-14 border border-dashed border-negative/25 bg-negative/[0.02] rounded-2xl">
        <AlertCircle
          size={32}
          className="mx-auto text-negative/70 mb-3"
          strokeWidth={1.6}
        />
        <p className="text-ink-900 font-medium text-sm mb-1">
          حدث خطأ في تحميل الفواتير
        </p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 text-xs font-medium text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors mt-2"
        >
          <RefreshCw size={13} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const invoices = data?.items || [];

  // ==================== حالة عدم وجود بيانات ====================
  if (!isFetching && invoices.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-ink-400/20 rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-ink-400/5 flex items-center justify-center mx-auto mb-3">
          <FileSearch size={22} className="text-ink-400/50" strokeWidth={1.6} />
        </div>
        <p className="text-ink-900 font-medium text-sm mb-1">
          لا توجد فواتير مطابقة
        </p>
        <p className="text-xs text-ink-400">جرّب تعديل الفلاتر</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={`overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity duration-200 ${
          isFetching ? "opacity-60" : ""
        }`}
      >
        <table className="w-full text-right border-collapse min-w-[1150px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-ink-900/[0.03] text-ink-400 text-[11px]"
              >
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      className={`p-2.5 font-medium border-b border-ink-400/10 select-none whitespace-nowrap ${
                        canSort ? "cursor-pointer hover:text-ink-900" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {canSort && (
                          <span className="text-ink-400/50">
                            {sortDir === "asc" ? (
                              <ChevronUp size={12} />
                            ) : sortDir === "desc" ? (
                              <ChevronDown size={12} />
                            ) : (
                              <ChevronsUpDown size={12} />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-ink-400/5 last:border-0 hover:bg-primary-50/30 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.totalCount > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={data.totalCount}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}

      <PackagingDrawer
        partyId={packagingFor?.businessPartnerId}
        partyName={packagingFor?.businessPartnerName}
        isOpen={!!packagingFor}
        onClose={() => setPackagingFor(null)}
        initialItems={
          packagingFor?.containerLines?.map((c) => ({
            containerId: c.containerId,
            issuedQuantity: c.outgoingUnits,
            receivedQuantity: c.incomingUnits,
          })) || []
        }
        onSave={() => {}}
      />
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <InvoicePrintTemplate invoice={invoiceToPrint} />
        </div>
      </div>
    </>
  );
}
