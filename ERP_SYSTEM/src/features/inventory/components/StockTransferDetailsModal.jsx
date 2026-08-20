import { useEffect } from "react";
import {
  ArrowLeftRight,
  CalendarDays,
  Package,
  Warehouse,
  X,
} from "lucide-react";

import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";

import { useGetStockTransferByIdQuery } from "../stockTransfersApi";
import { formatMoney, formatQuantity } from "../stockTransfers.constants";

export default function StockTransferDetailsModal({
  isOpen,
  onClose,
  transferId,
}) {
  const {
    data: transfer,
    isLoading,
    isError,
  } = useGetStockTransferByIdQuery(transferId, {
    skip: !isOpen || !transferId,
  });

  useEffect(() => {
    if (!isOpen) return;
  }, [isOpen]);

  return (
    <Modal
      wide
      isOpen={isOpen}
      onClose={onClose}
      title="تفاصيل التحويل المخزني"
    >
      {isLoading ? (
        <DetailsSkeleton />
      ) : isError || !transfer ? (
        <div className="py-12 text-center">
          <p className="text-sm text-negative">تعذر تحميل تفاصيل التحويل</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Header */}

          <div className="rounded-2xl border border-ink-400/10 bg-ink-900/[0.02] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-ink-400 mb-1">رقم المستند</p>

                <h3 className="text-lg font-bold text-ink-900 num">
                  {transfer.documentNumber}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-ink-400">
                <CalendarDays size={14} />
                <span className="num">{transfer.transferDate}</span>
              </div>
            </div>

            {/* Stores */}

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 mt-5">
              <StoreBox label="المخزن المصدر" name={transfer.sourceStoreName} />

              <div className="hidden sm:flex w-9 h-9 rounded-full bg-primary-50 text-primary-600 items-center justify-center">
                <ArrowLeftRight size={17} />
              </div>

              <StoreBox
                label="المخزن المستلم"
                name={transfer.destinationStoreName}
              />
            </div>

            {transfer.notes && (
              <div className="mt-4 pt-4 border-t border-ink-400/10">
                <p className="text-xs text-ink-400 mb-1">ملاحظات</p>

                <p className="text-sm text-ink-700">{transfer.notes}</p>
              </div>
            )}
          </div>

          {/* Lines */}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm text-ink-900">
                أصناف التحويل
              </h4>

              <span className="text-xs text-ink-400">
                {transfer.lines?.length || 0} صنف
              </span>
            </div>

            <div className="overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10">
              <table className="w-full min-w-[1100px] text-right border-collapse">
                <thead>
                  <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
                    <th className="p-2.5 font-medium border-l border-ink-400/5">
                      الصنف
                    </th>

                    <th className="p-2.5 font-medium border-l border-ink-400/5">
                      الوحدة
                    </th>

                    <th className="p-2.5 font-medium border-l border-ink-400/5">
                      الكمية
                    </th>

                    <th className="p-2.5 font-medium border-l border-ink-400/5">
                      تكلفة الوحدة
                    </th>

                    <th className="p-2.5 font-medium border-l border-ink-400/5">
                      إجمالي التكلفة
                    </th>

                    <th className="p-2.5 font-medium border-l border-ink-400/5">
                      رصيد المصدر
                    </th>

                    <th className="p-2.5 font-medium border-l border-ink-400/5">
                      متوسط المصدر
                    </th>

                    <th className="p-2.5 font-medium border-l border-ink-400/5">
                      رصيد الوجهة
                    </th>

                    <th className="p-2.5 font-medium">متوسط الوجهة</th>
                  </tr>
                </thead>

                <tbody>
                  {(transfer.lines || []).map((line) => (
                    <tr
                      key={line.id}
                      className="border-b border-ink-400/5 last:border-0 hover:bg-primary-50/20 transition-colors"
                    >
                      <td className="p-2.5 border-l border-ink-400/5">
                        <div>
                          <p className="text-sm font-medium text-ink-900">
                            {line.itemName}
                          </p>

                          {line.itemCode && (
                            <p className="text-[11px] text-ink-400 mt-0.5">
                              {line.itemCode}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="p-2.5 text-xs text-ink-500 border-l border-ink-400/5">
                        {line.itemUnitName || "—"}
                      </td>

                      <td className="p-2.5 num text-sm border-l border-ink-400/5">
                        {formatQuantity(line.quantity)}
                      </td>

                      <td className="p-2.5 num text-sm border-l border-ink-400/5">
                        {formatMoney(line.sourceUnitCost)}
                      </td>

                      <td className="p-2.5 num text-sm font-medium border-l border-ink-400/5">
                        {formatMoney(line.sourceTotalCost)}
                      </td>

                      <td className="p-2.5 num text-sm border-l border-ink-400/5">
                        {formatQuantity(line.sourceQuantityAfter)}
                      </td>

                      <td className="p-2.5 num text-sm border-l border-ink-400/5">
                        {formatMoney(line.sourceAverageCostAfter)}
                      </td>

                      <td className="p-2.5 num text-sm border-l border-ink-400/5">
                        {formatQuantity(line.destinationQuantityAfter)}
                      </td>

                      <td className="p-2.5 num text-sm">
                        {formatMoney(line.destinationAverageCostAfter)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard
              label="عدد الأصناف"
              value={transfer.lines?.length || 0}
            />

            <SummaryCard
              label="إجمالي الكميات"
              value={(transfer.lines || []).reduce(
                (sum, line) => sum + Number(line.quantity || 0),
                0,
              )}
              quantity
            />

            <SummaryCard
              label="إجمالي التكلفة"
              value={(transfer.lines || []).reduce(
                (sum, line) => sum + Number(line.sourceTotalCost || 0),
                0,
              )}
              money
            />

            <SummaryCard label="الحالة" value="تم التحويل" positive />
          </div>

          <div className="flex justify-end pt-2 border-t border-ink-400/10">
            <Button variant="outline" onClick={onClose}>
              إغلاق
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function StoreBox({ label, name }) {
  return (
    <div className="rounded-xl bg-white border border-ink-400/10 p-3">
      <div className="flex items-center gap-2 mb-1">
        <Warehouse size={14} className="text-primary-500" />

        <span className="text-[11px] text-ink-400">{label}</span>
      </div>

      <p className="text-sm font-semibold text-ink-900">{name || "—"}</p>
    </div>
  );
}

function SummaryCard({ label, value, money, quantity, positive }) {
  return (
    <div className="rounded-xl border border-ink-400/10 bg-white p-3">
      <p className="text-[11px] text-ink-400 mb-1">{label}</p>

      <p
        className={`text-sm font-bold ${
          positive ? "text-positive" : "text-ink-900"
        }`}
      >
        {money || quantity ? (
          <span className="num">
            {Number(value || 0).toLocaleString("ar-EG", {
              maximumFractionDigits: 3,
            })}
          </span>
        ) : (
          value
        )}
      </p>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-24 rounded-2xl bg-ink-400/10" />

      <div className="h-64 rounded-2xl bg-ink-400/10" />

      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-20 rounded-xl bg-ink-400/10" />
        ))}
      </div>
    </div>
  );
}
