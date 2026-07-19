import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useGetSaleLinesQuery } from "../salesApi";
import Modal from "../../../shared/components/ui/Modal";
import LedgerPanel from "../../../shared/components/ui/LedgerPanel";

/**
 * @param {{ invoiceId: string|null, isOpen: boolean, onClose: () => void }} props
 */
export default function InvoiceDetailsModal({ invoiceId, isOpen, onClose }) {
  const {
    data: invoice,
    isLoading,
    isError,
  } = useGetSaleLinesQuery(invoiceId, {
    skip: !isOpen || !invoiceId,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        invoice ? `تفاصيل الفاتورة ${invoice.invoiceNumber}` : "تفاصيل الفاتورة"
      }
      wide
    >
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-11 rounded-lg bg-ink-400/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-center text-negative text-sm py-4">
          تعذر تحميل تفاصيل الفاتورة
        </p>
      )}

      {invoice && (
        <div className="space-y-4">
          {/* بيانات رأس الفاتورة */}
          <div className="flex items-center justify-between">
            {invoice.movementType === "purchase" ? (
              <span className="inline-flex items-center gap-1.5 bg-positive/10 text-positive text-xs font-medium px-2.5 py-1 rounded-full">
                <ArrowDownCircle size={13} />
                مشتريات
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-negative/10 text-negative text-xs font-medium px-2.5 py-1 rounded-full">
                <ArrowUpCircle size={13} />
                مبيعات
              </span>
            )}
            <span className="text-sm text-ink-400 num">{invoice.date}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex justify-between text-ink-600">
              <span>عميل / مورد</span>
              <span className="text-ink-900 font-medium">
                {invoice.partyName}
              </span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>البلد</span>
              <span className="text-ink-900">{invoice.country}</span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>السائق</span>
              <span className="text-ink-900">{invoice.driverName}</span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>رقم السيارة</span>
              <span className="text-ink-900 num">{invoice.carNumber}</span>
            </div>
          </div>

          {/* جدول الأصناف */}
          <div className="overflow-x-auto rounded-xl border border-ink-400/10 custom-scroll">
            <table className="w-full text-right border-collapse text-sm min-w-[600px]">
              <thead>
                <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
                  <th className="p-2 font-medium">الصنف</th>
                  <th className="p-2 font-medium">العبوة</th>
                  <th className="p-2 font-medium">وارد/صادر</th>
                  <th className="p-2 font-medium">الوزن</th>
                  <th className="p-2 font-medium">الكمية</th>
                  <th className="p-2 font-medium">السعر</th>
                  <th className="p-2 font-medium">القيمة</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} className="border-t border-ink-400/5">
                    <td className="p-2 font-medium text-ink-900">
                      {item.itemName}
                    </td>
                    <td className="p-2 text-ink-600">
                      {item.packagingUnitName}
                    </td>
                    <td className="p-2 num text-center">
                      {item.packagingIn > 0 ? (
                        <span className="text-positive">
                          +{item.packagingIn}
                        </span>
                      ) : (
                        <span className="text-negative">
                          -{item.packagingOut}
                        </span>
                      )}
                    </td>
                    <td className="p-2 num text-ink-600">
                      {(item.weight || 0).toLocaleString("ar-EG")}
                    </td>
                    <td className="p-2 num text-ink-600">
                      {(item.quantity || 0).toLocaleString("ar-EG")}
                    </td>
                    <td className="p-2 num text-ink-600">
                      {(item.price || 0).toLocaleString("ar-EG")}
                    </td>
                    <td className="p-2 num font-medium">
                      {(item.value || 0).toLocaleString("ar-EG")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* الإجماليات - بتتحسب هنا من الأصناف والحقول الموجودة في الفاتورة */}
          <LedgerPanel title="الإجماليات">
            {(() => {
              const total = invoice.items.reduce(
                (s, it) => s + (it.value || 0),
                0,
              );
              const discount = invoice.discount || 0;
              const tax = invoice.tax || 0;
              const paid = invoice.paid || 0;
              const remaining = total - discount + tax - paid;

              const rows = [
                { label: "الإجمالي", value: total, tone: "text-ink-900" },
                { label: "الخصم", value: discount, tone: "text-negative" },
                { label: "الضريبة", value: tax, tone: "text-ink-600" },
                { label: "المدفوع", value: paid, tone: "text-positive" },
                {
                  label: "الباقي",
                  value: remaining,
                  tone: remaining > 0 ? "text-negative" : "text-positive",
                },
              ];

              return rows.map((row) => (
                <div key={row.label} className="flex items-stretch">
                  <div className="w-28 shrink-0 bg-ink-900/[0.03] px-3 py-2 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
                    {row.label}
                  </div>
                  <div
                    className={`flex-1 px-3 py-2 text-sm num font-medium flex items-center ${row.tone}`}
                  >
                    {row.value.toLocaleString("ar-EG")} ج.م
                  </div>
                </div>
              ));
            })()}
          </LedgerPanel>
        </div>
      )}
    </Modal>
  );
}
