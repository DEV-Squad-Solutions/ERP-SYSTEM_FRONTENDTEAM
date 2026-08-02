import { useState } from "react";
import {
  Search,
  RotateCcw,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Package,
} from "lucide-react";

import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";

import { useGetCountriesSelectQuery } from "../../countries/countriesApi";
import { useGetItemsSelectQuery } from "../../inventory/inventoryApi";
import { useGetPartnerItemMovementsQuery } from "../statementsApi";
import { useNavigate } from "react-router-dom";
const emptyItemFilters = {
  fromDate: "",
  toDate: "",
  countryId: "",
  itemId: "",
};

export default function PartnerItemsTab({ partnerId }) {
  const [draft, setDraft] = useState(emptyItemFilters);
  const [applied, setApplied] = useState(emptyItemFilters);
  const navigate = useNavigate();
  const { data: countries } = useGetCountriesSelectQuery();
  const { data: items } = useGetItemsSelectQuery();

  const { data, isLoading, isFetching, isError, refetch } =
    useGetPartnerItemMovementsQuery(
      {
        businessPartnerId: partnerId,
        fromDate: applied.fromDate || undefined,
        toDate: applied.toDate || undefined,
        countryId: applied.countryId || undefined,
        itemId: applied.itemId || undefined,
      },
      {
        skip: !partnerId || !applied.itemId,
      },
    );

  // =========================
  // API Response
  // =========================

  const rows = data?.movements ?? [];

  const summary = data?.summary ?? {
    totalSalesQuantity: 0,
    totalPurchaseQuantity: 0,
    totalSalesWeight: 0,
    totalPurchaseWeight: 0,
  };

  // =========================
  // Helpers
  // =========================

  const setField = (key, value) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    if (!draft.itemId) return;

    setApplied(draft);
  };

  const handleReset = () => {
    setDraft(emptyItemFilters);
    setApplied(emptyItemFilters);
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined) {
      return "-";
    }

    return Number(value).toLocaleString("ar-EG", {
      maximumFractionDigits: 3,
    });
  };

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("ar-EG");
  };

  const getMovementLabel = (type) => {
    switch (type?.toLowerCase()) {
      case "sale":
        return "بيع";

      case "purchase":
        return "شراء";

      case "sale_return":
        return "مرتجع بيع";

      case "purchase_return":
        return "مرتجع شراء";

      default:
        return type || "-";
    }
  };

  const getMovementStyle = (type) => {
    switch (type?.toLowerCase()) {
      case "sale":
        return "bg-blue-50 text-blue-600";

      case "purchase":
        return "bg-green-50 text-green-600";

      case "sale_return":
        return "bg-orange-50 text-orange-600";

      case "purchase_return":
        return "bg-red-50 text-red-600";

      default:
        return "bg-ink-900/5 text-ink-500";
    }
  };

  return (
    <div className="space-y-4">
      {/* =========================
          Filters
      ========================= */}

      <div className="rounded-2xl border border-ink-400/10 bg-white p-3 shadow-card">
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* From Date */}
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">
              من تاريخ
            </label>

            <input
              type="date"
              value={draft.fromDate}
              onChange={(e) => setField("fromDate", e.target.value)}
              className="w-full rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm outline-none focus:border-primary-500"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">
              إلى تاريخ
            </label>

            <input
              type="date"
              value={draft.toDate}
              onChange={(e) => setField("toDate", e.target.value)}
              className="w-full rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm outline-none focus:border-primary-500"
            />
          </div>

          {/* Country */}
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">
              البلد
            </label>

            <CompactSelect
              options={
                countries?.map((country) => ({
                  value: country.id,
                  label: country.name,
                })) ?? []
              }
              value={draft.countryId}
              onChange={(value) => setField("countryId", value)}
              placeholder="اختر البلد"
            />
          </div>

          {/* Item */}
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">
              الصنف <span className="text-negative">*</span>
            </label>

            <CompactSelect
              options={
                items?.map((item) => ({
                  value: item.id,
                  label: item.name,
                })) ?? []
              }
              value={draft.itemId}
              onChange={(value) => setField("itemId", value)}
              placeholder="اختر الصنف"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              disabled={!draft.itemId || isFetching}
              className="h-9 flex-1"
            >
              <Search size={14} />
              بحث
            </Button>

            <Button variant="outline" onClick={handleReset} className="h-9">
              <RotateCcw size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* =========================
          Empty State
      ========================= */}

      {!applied.itemId ? (
        <div className="rounded-2xl border border-dashed border-ink-400/20 py-16 text-center">
          <Package size={32} className="mx-auto mb-3 text-ink-400" />

          <p className="text-sm text-ink-400">اختر صنف وابحث لعرض حركته</p>
        </div>
      ) : isError ? (
        /* =========================
            Error
        ========================= */

        <div className="flex items-center justify-center gap-2 py-16 text-sm text-negative">
          <AlertCircle size={16} />

          <span>حصل خطأ أثناء تحميل البيانات</span>

          <button onClick={refetch} className="underline">
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <>
          {/* =========================
              Item Info
          ========================= */}

          <div className="rounded-2xl border border-ink-400/10 bg-white p-4 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-ink-400">الصنف</p>

                <h3 className="mt-1 text-base font-semibold text-ink-900">
                  {data?.itemName || "-"}
                </h3>
              </div>

              <div className="text-left">
                <p className="text-xs text-ink-400">العميل / المورد</p>

                <p className="mt-1 text-sm font-medium text-ink-700">
                  {data?.businessPartnerName || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* =========================
              Summary
          ========================= */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="إجمالي كمية المبيعات"
              value={summary.totalSalesQuantity}
              icon={<ArrowUp size={16} />}
              iconClass="bg-blue-50 text-blue-600"
            />

            <SummaryCard
              title="إجمالي كمية المشتريات"
              value={summary.totalPurchaseQuantity}
              icon={<ArrowDown size={16} />}
              iconClass="bg-green-50 text-green-600"
            />

            <SummaryCard
              title="إجمالي وزن المبيعات"
              value={summary.totalSalesWeight}
              icon={<ArrowUp size={16} />}
              iconClass="bg-blue-50 text-blue-600"
            />

            <SummaryCard
              title="إجمالي وزن المشتريات"
              value={summary.totalPurchaseWeight}
              icon={<ArrowDown size={16} />}
              iconClass="bg-green-50 text-green-600"
            />
          </div>

          {/* =========================
              Table
          ========================= */}

          <div className="overflow-x-auto rounded-2xl border border-ink-400/10 bg-white shadow-card">
            <table className="w-full min-w-[1100px] border-collapse text-right">
              <thead>
                <tr className="bg-ink-900/[0.03] text-xs text-ink-400">
                  <th className="p-2.5 font-medium">رقم الفاتورة</th>

                  <th className="p-2.5 font-medium">التاريخ</th>

                  <th className="p-2.5 font-medium">الحركة</th>

                  <th className="p-2.5 font-medium">الصنف</th>

                  <th className="p-2.5 font-medium">العدد</th>

                  <th className="p-2.5 font-medium">الوزن</th>

                  <th className="p-2.5 font-medium">الكمية</th>

                  <th className="p-2.5 font-medium">السعر</th>

                  <th className="p-2.5 font-medium">الإجمالي</th>
                </tr>
              </thead>

              <tbody>
                {isLoading || isFetching ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="p-8 text-center text-sm text-ink-400"
                    >
                      جارِ التحميل...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="p-8 text-center text-sm text-ink-400"
                    >
                      لا توجد حركة لهذا الصنف بالفلاتر المحددة
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr
                      key={`${row.invoiceId}-${index}`}
                      className="border-b border-ink-400/5 transition-colors last:border-0 hover:bg-ink-900/[0.012]"
                    >
                      <td className="p-2.5 text-sm font-medium num">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/dashboard/sales/${row.invoiceId}`)
                          }
                          className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                        >
                          {row.invoiceNumber || "-"}
                        </button>
                      </td>
                      {/* Date */}
                      <td className="p-2.5 text-sm num">
                        {formatDate(row.invoiceDate)}
                      </td>

                      {/* Movement */}
                      <td className="p-2.5 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getMovementStyle(
                            row.movementType,
                          )}`}
                        >
                          {getMovementLabel(row.movementType)}
                        </span>
                      </td>

                      {/* Item */}
                      <td className="p-2.5 text-sm">{row.itemName || "-"}</td>

                      {/* Count */}
                      <td className="p-2.5 text-center text-sm num">
                        {formatNumber(row.count)}
                      </td>

                      {/* Weight */}
                      <td className="p-2.5 text-center text-sm num">
                        {formatNumber(row.weight)}
                      </td>

                      {/* Quantity */}
                      <td className="p-2.5 text-center text-sm num">
                        {formatNumber(row.quantity)}
                      </td>

                      {/* Unit Price */}
                      <td className="p-2.5 text-center text-sm num">
                        {formatNumber(row.unitPrice)}
                      </td>

                      {/* Total Amount */}
                      <td className="p-2.5 text-center text-sm font-semibold num">
                        {formatNumber(row.totalAmount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* =========================
                  Footer
              ========================= */}

              {rows.length > 0 && (
                <tfoot>
                  <tr className="bg-ink-900/[0.03] font-semibold">
                    <td colSpan={4} className="p-2.5 text-sm">
                      إجمالي النتائج
                    </td>

                    <td className="p-2.5 text-center text-sm num">
                      {formatNumber(
                        rows.reduce(
                          (sum, row) => sum + (Number(row.count) || 0),
                          0,
                        ),
                      )}
                    </td>

                    <td className="p-2.5 text-center text-sm num">
                      {formatNumber(
                        rows.reduce(
                          (sum, row) => sum + (Number(row.weight) || 0),
                          0,
                        ),
                      )}
                    </td>

                    <td className="p-2.5 text-center text-sm num">
                      {formatNumber(
                        rows.reduce(
                          (sum, row) => sum + (Number(row.quantity) || 0),
                          0,
                        ),
                      )}
                    </td>

                    <td className="p-2.5"></td>

                    <td className="p-2.5 text-center text-sm num">
                      {formatNumber(
                        rows.reduce(
                          (sum, row) => sum + (Number(row.totalAmount) || 0),
                          0,
                        ),
                      )}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-ink-400/10 bg-white p-3 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-400">{title}</p>

          <p className="mt-1 text-lg font-bold text-ink-900 num">
            {Number(value ?? 0).toLocaleString("ar-EG", {
              maximumFractionDigits: 3,
            })}
          </p>
        </div>

        <div className={`rounded-xl p-2 ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}
