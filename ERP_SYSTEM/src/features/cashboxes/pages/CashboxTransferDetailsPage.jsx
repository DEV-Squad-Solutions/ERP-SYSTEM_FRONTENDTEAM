import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowRight, ArrowLeftRight, Receipt } from "lucide-react";

import { useGetCashboxTransferByIdQuery } from "../cashboxTransfersApi";

function fmtAmount(n, currency) {
  return `${new Intl.NumberFormat("ar-EG").format(n ?? 0)} ${currency ?? ""}`;
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b py-2 text-sm last:border-b-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value ?? "—"}</span>
    </div>
  );
}

export default function CashboxTransferDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: t,
    isLoading,
    isError,
    refetch,
  } = useGetCashboxTransferByIdQuery(id, {
    skip: !id,
  });

  return (
    <div className="animate-fadeUp">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border text-gray-400 hover:text-gray-900"
          title="رجوع"
        >
          <ArrowRight size={16} />
        </button>
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <ArrowLeftRight size={20} className="text-primary-500" />
            تفاصيل التحويل {t?.transferNumber ?? ""}
          </h2>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-dashed py-16 text-center text-gray-400">
          جاري تحميل بيانات التحويل...
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <span>لم يتم العثور على التحويل، أو حدث خطأ أثناء التحميل.</span>
          <button
            onClick={refetch}
            className="rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-medium hover:bg-red-100"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {t && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-bold text-gray-900">
              بيانات التحويل
            </h3>
            <Row label="رقم التحويل" value={t.transferNumber} />
            <Row label="التاريخ" value={fmtDate(t.transferDate)} />
            <Row label="من خزينة" value={t.sourceCashboxName} />
            <Row label="إلى خزينة" value={t.destinationCashboxName} />
            <Row label="المبلغ" value={fmtAmount(t.amount, t.currency)} />
            {t.baseCurrency && t.baseCurrency !== t.currency && (
              <>
                <Row label="سعر الصرف" value={t.exchangeRate} />
                <Row
                  label="المبلغ بعملة الأساس"
                  value={fmtAmount(t.baseAmount, t.baseCurrency)}
                />
              </>
            )}
            <Row label="الوصف" value={t.description} />
            <Row label="ملاحظات" value={t.notes} />
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-900">
              <Receipt size={14} className="text-primary-500" />
              السندات المرتبطة
            </h3>
            <Row
              label="سند الصرف (من خزينة المصدر)"
              value={t.paymentVoucherNumber}
            />
            <Row
              label="سند القبض (لخزينة الوجهة)"
              value={t.receiptVoucherNumber}
            />
            <p className="mt-3 text-xs text-gray-400">
              السندات دي بتتولد تلقائيًا مع التحويل ومش قابلة للتعديل بشكل
              مستقل.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
