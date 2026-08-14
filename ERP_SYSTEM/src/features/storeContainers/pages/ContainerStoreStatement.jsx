import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Boxes } from "lucide-react";

import { useGetContainerStoreStatementQuery } from "../containerStoreStatementApi";
import { useGetPartyByIdQuery } from "../../partners/partiesApi"; // عدّل المسار حسب مكان partiesApi عندك

import ContainerStoreFilters from "../components/ContainerStoreFilters";

const emptyFilters = {
  Search: "",
  FromDate: "",
  ToDate: "",
  ContainerId: "",
  InvoiceType: "",
  InvoiceNumber: "",
  Direction: "",
};

const INVOICE_TYPE_LABELS = {
  Sales: "بيع",
  Purchase: "شراء",
  SalesReturn: "مرتجع بيع",
  PurchaseReturn: "مرتجع شراء",
};

const INVOICE_TYPE_BADGE = {
  Sales: "bg-primary-500/10 text-primary-500",
  Purchase: "bg-amber-500/10 text-amber-600",
  SalesReturn: "bg-rose-500/10 text-rose-600",
  PurchaseReturn: "bg-sky-500/10 text-sky-600",
};

function fmt(n) {
  return new Intl.NumberFormat("ar-EG").format(n ?? 0);
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function SummaryCard({ label, value, accent }) {
  return (
    <div className="rounded-xl bg-ink-400/5 px-4 py-3">
      <div className="text-xs font-medium text-ink-400">{label}</div>
      <div className={`mt-1 text-lg font-bold ${accent || "text-ink-900"}`}>
        {value}
      </div>
    </div>
  );
}

export default function ContainerStoreStatementPage() {
  const { partnerId } = useParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    draft: emptyFilters,
    applied: emptyFilters,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: partner } = useGetPartyByIdQuery(partnerId, {
    skip: !partnerId,
  });

  const { data, isLoading, isFetching, isError, refetch } =
    useGetContainerStoreStatementQuery(
      {
        BusinessPartnerId: partnerId,
        PageNumber: page,
        PageSize: pageSize,
        ...filters.applied,
      },
      { skip: !partnerId },
    );

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, applied: prev.draft }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters({ draft: emptyFilters, applied: emptyFilters });
    setPage(1);
  };

  return (
    <div className="animate-fadeUp">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-400/15 text-ink-400 hover:text-ink-900"
          title="رجوع"
        >
          <ArrowRight size={16} />
        </button>
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">
            <Boxes size={20} className="text-gold-600" />
            مخزن عبوات {partner?.name ?? ""}
          </h2>
          <p className="mt-1 text-sm text-ink-400">
            العبوات القائمة لدى العميل وحركات خروجها وعودتها
          </p>
        </div>
      </div>

      <ContainerStoreFilters
        draft={filters.draft}
        containers={data?.containers ?? []}
        onChange={(value) => setFilters((prev) => ({ ...prev, draft: value }))}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {isLoading && (
        <div className="rounded-2xl border border-dashed border-ink-400/20 py-16 text-center text-ink-400">
          جاري تحميل كشف مخزن العبوات...
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          <span>
            لا يوجد مخزن عبوات نشط لهذا العميل، أو حدث خطأ أثناء التحميل.
          </span>
          <button
            onClick={refetch}
            className="rounded-lg border border-rose-200 bg-white px-3 py-1 text-xs font-medium hover:bg-rose-100"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {data && (
        <>
          <div className="mb-4 rounded-2xl border border-ink-400/10 bg-white p-4 shadow-card">
            <div className="mb-3 flex items-center gap-2 text-ink-900">
              <Boxes size={16} className="text-primary-500" />
              <h3 className="font-display font-bold">
                {data.containerStore.name}
              </h3>
              <span className="text-xs text-ink-400">
                ({data.containerStore.code})
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              <SummaryCard
                label="رصيد افتتاحي"
                value={fmt(data.summary.openingUnits)}
              />
              <SummaryCard
                label="إجمالي الصادر"
                value={fmt(data.summary.totalOutgoingUnits)}
                accent="text-rose-600"
              />
              <SummaryCard
                label="إجمالي الوارد"
                value={fmt(data.summary.totalIncomingUnits)}
                accent="text-primary-500"
              />
              <SummaryCard
                label="صافي الحركة"
                value={fmt(data.summary.netUnits)}
              />
              <SummaryCard
                label="الرصيد الختامي"
                value={fmt(data.summary.closingUnits)}
                accent="text-primary-500"
              />
              <SummaryCard
                label="عدد الحركات"
                value={fmt(data.summary.movementCount)}
              />
            </div>
          </div>

          <div className="mb-4 overflow-x-auto rounded-2xl border border-ink-400/10 bg-white shadow-card">
            <h3 className="border-b border-ink-400/10 px-4 py-2 font-display text-sm font-bold text-ink-900">
              ملخص العبوات
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-400/5 text-ink-400">
                  <th className="px-3 py-2 text-right font-medium">العبوة</th>
                  <th className="px-3 py-2 text-right font-medium">افتتاحي</th>
                  <th className="px-3 py-2 text-right font-medium">صادر</th>
                  <th className="px-3 py-2 text-right font-medium">وارد</th>
                  <th className="px-3 py-2 text-right font-medium">صافي</th>
                  <th className="px-3 py-2 text-right font-medium">ختامي</th>
                  <th className="px-3 py-2 text-right font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {data.containers.map((c) => (
                  <tr
                    key={c.containerId}
                    className="border-t border-ink-400/10"
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium text-ink-900">
                        {c.containerName}
                      </div>
                      <div className="text-xs text-ink-400">
                        {c.containerCode}
                      </div>
                    </td>
                    <td className="px-3 py-2">{fmt(c.openingUnits)}</td>
                    <td className="px-3 py-2 text-rose-600">
                      {fmt(c.periodOutgoingUnits)}
                    </td>
                    <td className="px-3 py-2 text-primary-500">
                      {fmt(c.periodIncomingUnits)}
                    </td>
                    <td className="px-3 py-2">{fmt(c.periodNetUnits)}</td>
                    <td className="px-3 py-2 font-bold text-ink-900">
                      {fmt(c.closingUnits)}
                    </td>
                    <td className="px-3 py-2">
                      {c.isCurrentlyAssignedToStore ? (
                        <span className="rounded bg-primary-500/10 px-2 py-0.5 text-xs text-primary-500">
                          معينة بالمخزن
                        </span>
                      ) : (
                        <span className="rounded bg-ink-400/10 px-2 py-0.5 text-xs text-ink-400">
                          غير معينة حاليًا
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-ink-400/10 bg-white shadow-card">
            <h3 className="border-b border-ink-400/10 px-4 py-2 font-display text-sm font-bold text-ink-900">
              حركات العبوات ({fmt(data.totalCount)})
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-400/5 text-ink-400">
                  <th className="px-3 py-2 text-right font-medium">التاريخ</th>
                  <th className="px-3 py-2 text-right font-medium">الفاتورة</th>
                  <th className="px-3 py-2 text-right font-medium">النوع</th>
                  <th className="px-3 py-2 text-right font-medium">العبوة</th>
                  <th className="px-3 py-2 text-right font-medium">صادر</th>
                  <th className="px-3 py-2 text-right font-medium">وارد</th>
                  <th className="px-3 py-2 text-right font-medium">
                    الرصيد الجاري
                  </th>
                  <th className="px-3 py-2 text-right font-medium">الوصف</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-10 text-center text-ink-400"
                    >
                      لا توجد حركات مطابقة للفلاتر
                    </td>
                  </tr>
                ) : (
                  data.items.map((it) => (
                    <tr
                      key={it.movementId}
                      className="border-t border-ink-400/10"
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        {fmtDate(it.movementDate)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-ink-900">
                          {it.invoiceNumber}
                        </div>
                        {it.partnerInvoiceNumber && (
                          <div className="text-xs text-ink-400">
                            فاتورة العميل: {it.partnerInvoiceNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded px-2 py-0.5 text-xs ${INVOICE_TYPE_BADGE[it.invoiceType]}`}
                        >
                          {INVOICE_TYPE_LABELS[it.invoiceType]}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-ink-900">
                          {it.containerName}
                        </div>
                        <div className="text-xs text-ink-400">
                          {it.containerCode}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-rose-600">
                        {it.outgoingUnits ? fmt(it.outgoingUnits) : "—"}
                      </td>
                      <td className="px-3 py-2 text-primary-500">
                        {it.incomingUnits ? fmt(it.incomingUnits) : "—"}
                      </td>
                      <td className="px-3 py-2 font-bold text-ink-900">
                        {fmt(it.runningBalanceUnits)}
                      </td>
                      <td className="px-3 py-2 text-ink-400">
                        {it.movementDescription}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-ink-400/10 px-4 py-2 text-xs text-ink-400">
              <span>
                صفحة {data.pageNumber} من {data.totalPages} — إجمالي{" "}
                {fmt(data.totalCount)} حركة
                {isFetching && " · جاري التحديث..."}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-ink-400/20 px-2 py-1 disabled:opacity-40"
                >
                  السابق
                </button>
                <button
                  disabled={data.pageNumber >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-ink-400/20 px-2 py-1 disabled:opacity-40"
                >
                  التالي
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
