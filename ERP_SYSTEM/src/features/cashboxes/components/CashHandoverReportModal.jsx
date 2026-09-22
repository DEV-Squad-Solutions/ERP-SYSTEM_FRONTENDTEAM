// CashHandoverReportModal.jsx

import { useState } from "react";
import { Printer, AlertTriangle, Wallet, X } from "lucide-react";
import { useGetCashHandoverReportQuery } from "../cashVouchersApi";
import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import useCashHandoverReportPrint from "../../../shared/hooks/useCashHandoverReportPrint";
import CashHandoverReportPrintTemplate from "../../../shared/components/print/CashHandoverReportPrintTemplate";

const currencySymbols = {
  EGP: "ج.م",
  USD: "$",
  EUR: "€",
  GBP: "£",
  SAR: "﷼",
  AED: "د.إ",
  KWD: "د.ك",
};

const fmt = (n) =>
  Number(n ?? 0).toLocaleString("ar-EG", {
    maximumFractionDigits: 2,
  });

const directionOptions = [
  { value: "", label: "الكل" },
  { value: "Receipt", label: "وارد" },
  { value: "Payment", label: "صادر" },
];

function emptyFilters() {
  return {
    fromDate: "",
    toDate: "",
    direction: "",
    search: "",
  };
}

export default function CashHandoverReportModal({
  isOpen,
  onClose,
  cashboxId,
  cashboxName,
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState(emptyFilters);

  const hasActiveFilters =
    filters.fromDate || filters.toDate || filters.direction || filters.search;

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));

    setPage(1);
  };

  const clearFilters = () => {
    setFilters(emptyFilters());
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  const { data, isLoading, isFetching, isError } =
    useGetCashHandoverReportQuery(
      {
        cashboxId,
        pageNumber: page,
        pageSize,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        direction: filters.direction || undefined,
        search: filters.search || undefined,
      },
      {
        skip: !isOpen,
      },
    );

  const items = data?.items || [];
  const summaries = data?.summaries || [];
  const cashboxBalances = data?.cashboxBalances || [];

  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 0;
  const { printList, printRef } = useCashHandoverReportPrint({
    title: `تقرير تسليم العهدة - ${cashboxName || "الخزنة"}`,
  });
  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`تسليم العهدة — ${cashboxName}`}
      wide
    >
      <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />

        <p>
          المسودات دي سجلات عهدة تشغيلية فقط، ومش مؤثرة على رصيد الخزنة الفعلي
          ولا كشوف الحسابات ولا القيود المحاسبية لحد ما يتم ترحيلها.
        </p>
      </div>

      {cashboxBalances.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cashboxBalances.map((b) => (
            <div
              key={`${b.cashboxId}-${b.currency}`}
              className="rounded-xl border border-primary-100 bg-primary-50/40 p-4"
            >
              <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-primary-700">
                <Wallet size={13} />
                {currencySymbols[b.currency] || ""} {b.currency}
              </p>

              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <div>
                  <p className="text-ink-400">الرصيد الحالي</p>

                  <p className="num font-bold text-ink-900">
                    {fmt(b.currentBalance)}
                  </p>
                </div>

                <div>
                  <p className="text-ink-400">الرصيد المتوقع بعد الترحيل</p>

                  <p
                    className={`num font-bold ${
                      b.expectedBalance >= b.currentBalance
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {fmt(b.expectedBalance)}
                  </p>
                </div>

                <div>
                  <p className="text-ink-400">مسودات وارد</p>

                  <p className="num text-emerald-600">{fmt(b.draftReceipt)}</p>
                </div>

                <div>
                  <p className="text-ink-400">مسودات صادر</p>

                  <p className="num text-red-600">{fmt(b.draftPayment)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-2">
        <div>
          <label className="mb-1 block text-[11px] text-ink-400">
            من تاريخ
          </label>

          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => updateFilter("fromDate", e.target.value)}
            className="rounded-lg border border-ink-400/15 px-2.5 py-1.5 text-xs outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] text-ink-400">
            إلى تاريخ
          </label>

          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => updateFilter("toDate", e.target.value)}
            className="rounded-lg border border-ink-400/15 px-2.5 py-1.5 text-xs outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] text-ink-400">الاتجاه</label>

          <select
            value={filters.direction}
            onChange={(e) => updateFilter("direction", e.target.value)}
            className="rounded-lg border border-ink-400/15 bg-white px-2.5 py-1.5 text-xs outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          >
            {directionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-[11px] text-ink-400">بحث</label>

          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            placeholder="رقم السند أو البيان"
            className="w-full rounded-lg border border-ink-400/15 px-2.5 py-1.5 text-xs outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-lg border border-ink-400/15 px-2.5 py-1.5 text-xs text-ink-500 transition-colors hover:bg-ink-900/[0.03]"
          >
            <X size={12} />
            مسح الفلاتر
          </button>
        )}

        <Button variant="outline" onClick={printList} className="mr-auto">
          <Printer size={16} />
          طباعة
        </Button>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-ink-400">
            جاري تحميل التقرير...
          </p>
        ) : isError ? (
          <p className="py-10 text-center text-sm text-red-600">
            حصل خطأ أثناء تحميل التقرير
          </p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-400">
            {hasActiveFilters
              ? "لا يوجد سندات مطابقة لهذا الفلتر"
              : "لا يوجد سندات مسودة معلقة على الخزنة دي حاليًا"}
          </p>
        ) : (
          <>
            <div
              className={`mb-5 grid grid-cols-1 gap-3 transition-opacity duration-150 sm:grid-cols-2 ${
                isFetching ? "opacity-60" : "opacity-100"
              }`}
            >
              {summaries.map((s) => (
                <div
                  key={s.currency}
                  className="rounded-xl border border-ink-400/10 bg-cream-50 p-4"
                >
                  <p className="mb-2 text-xs font-semibold text-ink-500">
                    {currencySymbols[s.currency] || ""} {s.currency} — {s.count}{" "}
                    سند
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="text-ink-400">وارد</p>

                      <p className="num font-bold text-emerald-600">
                        {fmt(s.receipt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-ink-400">صادر</p>

                      <p className="num font-bold text-red-600">
                        {fmt(s.payment)}
                      </p>
                    </div>

                    <div>
                      <p className="text-ink-400">الصافي</p>

                      <p className="num font-bold text-ink-900">{fmt(s.net)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`overflow-hidden rounded-xl border border-slate-200 transition-opacity duration-150 ${
                isFetching ? "opacity-60" : "opacity-100"
              }`}
            >
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-ink-400">
                  <tr>
                    <th className="px-3 py-2 text-right">رقم السند</th>

                    <th className="px-3 py-2 text-right">التاريخ</th>

                    <th className="px-3 py-2 text-right">الاتجاه</th>

                    <th className="px-3 py-2 text-right">البيان</th>

                    <th className="px-3 py-2 text-left">المبلغ</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((v) => (
                    <tr key={v.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-medium">
                        {v.voucherNumber}
                      </td>

                      <td className="px-3 py-2 text-ink-400">
                        {v.voucherDate}
                      </td>

                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            v.direction === "Receipt"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {v.direction === "Receipt" ? "وارد" : "صادر"}
                        </span>
                      </td>

                      <td className="px-3 py-2 text-ink-500">
                        {v.description || "-"}
                      </td>

                      <td className="num px-3 py-2 text-left font-semibold">
                        {fmt(v.amount)}{" "}
                        {currencySymbols[v.currency] || v.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-400">
                    عدد السجلات: {totalCount}
                  </span>

                  <select
                    value={pageSize}
                    onChange={(e) =>
                      handlePageSizeChange(Number(e.target.value))
                    }
                    disabled={isFetching}
                    className="rounded-lg border border-ink-400/15 bg-white px-2.5 py-1.5 text-xs outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>

                  <span className="text-xs text-ink-400">سجل في الصفحة</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 1 || isFetching}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    السابق
                  </Button>

                  <span className="self-center text-xs text-ink-400">
                    صفحة {page} من {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    disabled={page >= totalPages || isFetching}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
        <div className="hidden">
          <div ref={printRef}>
            <CashHandoverReportPrintTemplate
              cashboxName={cashboxName}
              items={items}
              summaries={summaries}
              cashboxBalances={cashboxBalances}
              fromDate={filters.fromDate}
              toDate={filters.toDate}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
