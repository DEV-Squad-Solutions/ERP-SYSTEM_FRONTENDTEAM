// CashHandoverReportModal.jsx
import { useState } from "react";
import { Printer, AlertTriangle } from "lucide-react";
import { useGetCashHandoverReportQuery } from "../cashVouchersApi";
import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";

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
  Number(n ?? 0).toLocaleString("ar-EG", { maximumFractionDigits: 2 });

export default function CashHandoverReportModal({
  isOpen,
  onClose,
  cashboxId,
  cashboxName,
}) {
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { data, isLoading, isFetching, isError } =
    useGetCashHandoverReportQuery(
      { cashboxId, pageNumber: page, pageSize },
      { skip: !isOpen },
    );

  const items = data?.items || [];
  const summaries = data?.summaries || [];

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

      <div className="mt-4 flex justify-end">
        <Button variant="outline" onClick={() => window.print()}>
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
            لا يوجد سندات مسودة معلقة على الخزنة دي حاليًا
          </p>
        ) : (
          <>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
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

            <div className="overflow-hidden rounded-xl border border-slate-200">
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

            {data?.totalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => p - 1)}
                >
                  السابق
                </Button>
                <span className="self-center text-xs text-ink-400">
                  صفحة {page} من {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= data.totalPages || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
