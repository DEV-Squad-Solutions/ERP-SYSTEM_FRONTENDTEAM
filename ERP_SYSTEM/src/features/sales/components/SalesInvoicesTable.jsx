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
  CircleDollarSign,
  Clock3,
} from "lucide-react";

import { useDeleteInvoiceMutation } from "../../invoices/invoicesApi";
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

const paymentStatusLabels = {
  Paid: "مدفوعة",
  PartiallyPaid: "مدفوعة جزئيًا",
  Unpaid: "غير مدفوعة",
};

const fmt = (v) => Number(v || 0).toLocaleString("ar-EG");

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

// =========================================================
// Pricing Status
// =========================================================

function PricingStatusBadge({ invoice }) {
  const hasMissingPrice = invoice.priceStatus === "HasMissingPrice";
  const allItemsPriced = invoice.priceStatus === "AllItemsPriced";

  const isPriced = allItemsPriced && !hasMissingPrice;

  return isPriced ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-positive/10 px-2 py-0.5 text-[11px] font-medium text-positive">
      <CircleCheck size={11} />
      متسعّرة
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-negative/10 px-2 py-0.5 text-[11px] font-medium text-negative">
      <CircleDashed size={11} />
      غير مسعّرة
    </span>
  );
}

// =========================================================
// Payment Status
// =========================================================

function PaymentStatusBadge({ status }) {
  switch (status) {
    case "Paid":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-positive/10 px-2 py-0.5 text-[11px] font-medium text-positive whitespace-nowrap">
          <CircleCheck size={11} />
          مدفوعة
        </span>
      );

    case "PartiallyPaid":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning whitespace-nowrap">
          <Clock3 size={11} />
          مدفوعة جزئيًا
        </span>
      );

    case "Unpaid":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-negative/10 px-2 py-0.5 text-[11px] font-medium text-negative whitespace-nowrap">
          <CircleDollarSign size={11} />
          غير مدفوعة
        </span>
      );
  }
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

  const [sorting, setSorting] = useState([]);

  const { printInvoice, printRef, invoiceToPrint } = useInvoicePrint();

  // =========================================================
  // Delete
  // =========================================================

  const handleDelete = async (invoice) => {
    setOpenMenuId(null);

    try {
      await deleteInvoice({
        id: invoice.id,
        rowVersion: invoice.rowVersion,
      }).unwrap();

      toast.success("تم حذف الفاتورة");
    } catch (error) {
      console.error("Delete invoice failed:", error);
    }
  };

  // =========================================================
  // Columns
  // =========================================================

  const columns = useMemo(
    () => [
      // =====================================================
      // Invoice Number
      // =====================================================

      columnHelper.accessor("invoiceNumber", {
        header: "رقم الفاتورة",

        cell: (info) => (
          <span className="num text-[13px] font-medium text-ink-900">
            {info.getValue()}
          </span>
        ),
      }),

      // =====================================================
      // Date
      // =====================================================

      columnHelper.accessor("invoiceDate", {
        header: "التاريخ",

        cell: (info) => (
          <span className="num whitespace-nowrap text-[13px] text-ink-600">
            {info.getValue()}
          </span>
        ),
      }),

      // =====================================================
      // Type
      // =====================================================

      columnHelper.accessor("invoiceType", {
        header: "النوع",

        enableSorting: false,

        cell: (info) => (
          <span className="text-xs text-ink-600">
            {typeLabels[info.getValue()] || info.getValue()}
          </span>
        ),
      }),

      // =====================================================
      // Customer
      // =====================================================

      columnHelper.accessor("businessPartnerName", {
        header: "العميل",

        cell: (info) => (
          <TruncatedText
            text={info.getValue()}
            className="text-[13px] text-ink-900"
            maxWidthClass="max-w-[150px]"
          />
        ),
      }),

      // =====================================================
      // Payment Term
      // =====================================================

      columnHelper.accessor("paymentTerm", {
        header: "الدفع",

        enableSorting: false,

        cell: (info) => (
          <span className="text-xs text-ink-600">
            {paymentLabels[info.getValue()] || "—"}
          </span>
        ),
      }),

      // =====================================================
      // Payment Status
      // =====================================================

      columnHelper.accessor("paymentStatus", {
        header: "حالة الدفع",

        enableSorting: false,

        cell: (info) => <PaymentStatusBadge status={info.getValue()} />,
      }),

      // =====================================================
      // Total
      // =====================================================

      columnHelper.accessor("total", {
        header: "الإجمالي",

        cell: (info) => (
          <span className="num whitespace-nowrap text-[13px] font-medium text-ink-900">
            {fmt(info.getValue())} {info.row.original.currency}
          </span>
        ),
      }),

      // =====================================================
      // Paid Amount
      // =====================================================

      columnHelper.accessor("paidAmount", {
        header: "المدفوع",

        cell: (info) => (
          <span className="num whitespace-nowrap text-[13px] text-positive">
            {fmt(info.getValue())}
          </span>
        ),
      }),

      // =====================================================
      // Remaining Amount
      // =====================================================

      columnHelper.accessor("remainingAmount", {
        header: "المتبقي",

        cell: (info) => (
          <span
            className={`num whitespace-nowrap text-[13px] font-medium ${
              (info.getValue() || 0) > 0 ? "text-negative" : "text-positive"
            }`}
          >
            {fmt(info.getValue())}
          </span>
        ),
      }),

      // =====================================================
      // Pricing Status
      // =====================================================

      columnHelper.display({
        id: "pricingStatus",

        header: "حالة التسعير",

        enableSorting: false,

        cell: (info) => <PricingStatusBadge invoice={info.row.original} />,
      }),

      // =====================================================
      // Actions
      // =====================================================

      columnHelper.display({
        id: "actions",

        header: "إجراءات",

        cell: (info) => {
          const inv = info.row.original;

          return (
            <div className="relative flex items-center gap-0.5">
              {/* View */}

              <button
                onClick={() => navigate(`/dashboard/sales/${inv.id}`)}
                className="rounded-lg p-1.5 text-primary-500 hover:bg-primary-50"
                title="عرض"
              >
                <Eye size={14} />
              </button>

              {/* Edit */}

              <button
                onClick={() => navigate(`/dashboard/sales/${inv.id}/edit`)}
                className="rounded-lg p-1.5 text-primary-500 hover:bg-primary-50"
                title="تعديل"
              >
                <Pencil size={14} />
              </button>

              {/* Print */}

              <button
                onClick={() => printInvoice(inv)}
                className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-400/5"
                title="طباعة"
              >
                <Printer size={14} />
              </button>

              {/* More */}

              <button
                onClick={() =>
                  setOpenMenuId(openMenuId === inv.id ? null : inv.id)
                }
                className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-400/5"
                title="المزيد"
              >
                <MoreVertical size={14} />
              </button>

              {openMenuId === inv.id && (
                <>
                  {/* Close menu */}

                  <div
                    onClick={() => setOpenMenuId(null)}
                    className="fixed inset-0 z-10"
                  />

                  {/* Menu */}

                  <div className="absolute left-0 top-full z-20 mt-1 w-40 animate-fadeUp rounded-xl border border-ink-400/10 bg-white py-1 shadow-card">
                    <button
                      onClick={() => handleDelete(inv)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-right text-xs text-negative hover:bg-negative/5"
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
    [openMenuId, navigate, printInvoice],
  );

  // =========================================================
  // Table
  // =========================================================

  const table = useReactTable({
    data: data?.items || [],

    columns,

    state: {
      sorting,
    },

    onSortingChange: setSorting,

    getCoreRowModel: getCoreRowModel(),

    getSortedRowModel: getSortedRowModel(),

    manualPagination: true,
  });

  // =========================================================
  // Loading
  // =========================================================

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card">
        <div className="h-10 border-b border-ink-400/10 bg-ink-900/[0.03]" />

        <div className="divide-y divide-ink-400/5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-3 py-3">
              <div className="h-3.5 w-16 animate-pulse rounded bg-ink-400/10" />

              <div className="h-3.5 w-20 animate-pulse rounded bg-ink-400/10" />

              <div className="h-3.5 w-14 animate-pulse rounded bg-ink-400/10" />

              <div className="h-3.5 max-w-[150px] flex-1 animate-pulse rounded bg-ink-400/10" />

              <div className="h-3.5 w-24 animate-pulse rounded bg-ink-400/10" />

              <div className="h-3.5 w-20 animate-pulse rounded bg-ink-400/10" />

              <div className="h-3.5 w-16 animate-pulse rounded bg-ink-400/10" />

              <div className="h-3.5 w-20 animate-pulse rounded bg-ink-400/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================
  // Error
  // =========================================================

  if (isError) {
    return (
      <div className="rounded-2xl border border-dashed border-negative/25 bg-negative/[0.02] py-14 text-center">
        <AlertCircle
          size={32}
          className="mx-auto mb-3 text-negative/70"
          strokeWidth={1.6}
        />

        <p className="mb-1 text-sm font-medium text-ink-900">
          حدث خطأ في تحميل الفواتير
        </p>

        <button
          onClick={refetch}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-2 text-xs font-medium text-primary-500 transition-colors hover:bg-primary-100 hover:text-primary-600"
        >
          <RefreshCw size={13} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const invoices = data?.items || [];

  // =========================================================
  // Empty
  // =========================================================

  if (!isFetching && invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-400/20 py-16 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-400/5">
          <FileSearch size={22} className="text-ink-400/50" strokeWidth={1.6} />
        </div>

        <p className="mb-1 text-sm font-medium text-ink-900">
          لا توجد فواتير مطابقة
        </p>

        <p className="text-xs text-ink-400">جرّب تعديل الفلاتر</p>
      </div>
    );
  }

  // =========================================================
  // Render
  // =========================================================

  return (
    <>
      <div
        className={`custom-scroll overflow-x-auto rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity duration-200 ${
          isFetching ? "opacity-60" : ""
        }`}
      >
        <table className="w-full min-w-[1100px] border-collapse text-right">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-ink-900/[0.03] text-[11px] text-ink-400"
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
                      className={`whitespace-nowrap border-b border-ink-400/10 p-2.5 font-medium select-none ${
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
                className="border-b border-ink-400/5 transition-colors last:border-0 hover:bg-primary-50/30"
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

      {/* Pagination */}

      {data?.totalCount > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={data.totalCount}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          label="فاتورة"
        />
      )}

      {/* Print */}

      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <InvoicePrintTemplate invoice={invoiceToPrint} />
        </div>
      </div>
    </>
  );
}
