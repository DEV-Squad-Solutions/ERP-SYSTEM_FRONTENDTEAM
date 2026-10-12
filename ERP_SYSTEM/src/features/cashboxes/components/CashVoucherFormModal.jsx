import { useSelector } from "react-redux";
import { selectSelectedFiscalYear } from "../../fiscalYears/fiscalYearSlice";
import { getFiscalYearDateWarning } from "../../../lib/fiscalYearDateRange";
import { todayInCairo } from "../../../lib/date";
import { round2 } from "../../../lib/number";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";

import { useCreateCashVoucherMutation } from "../cashVouchersApi";
import { useGetCashboxByIdQuery } from "../cashboxesApi";
import { useLazyResolveExchangeRateQuery } from "../../exchange-rates/exchangeRatesApi";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

const DEFAULT_BASE_CURRENCY = "EGP";

function emptyForm() {
  return {
    voucherDate: todayInCairo(),
    direction: "Receipt",
    amount: "",
    exchangeRate: "",
    description: "",
  };
}

/**
 * ينشئ سند Draft فقط — بدون رقم سند، بدون توصيف، بدون طرف.
 * التوصيف والطرف بيتحددوا لاحقًا عن طريق تعديل السند (PUT).
 *
 * سعر الصرف:
 * لو عملة الخزنة أجنبية (مختلفة عن عملة الشركة الأساسية)، يمكن
 * إدخاله اختياريًا هنا ليتم «التقاطه» مع المسودة. لو اتساب فارغًا
 * بيتحل تلقائيًا من GET /ExchangeRates/resolve?currency=&date=
 * ويمكن تعديله يدويًا. المسودة لا تؤثر على الأرصدة الفعلية.
 *
 * @param {{ isOpen: boolean, onClose: () => void, cashboxId: string, onCreated?: () => void }} props
 */
export default function CashVoucherFormModal({
  isOpen,
  onClose,
  cashboxId,
  onCreated,
}) {
  const selectedFiscalYear = useSelector(selectSelectedFiscalYear);
  const [createVoucher, { isLoading }] = useCreateCashVoucherMutation();
  const [form, setForm] = useState(emptyForm());

  const { data: cashbox } = useGetCashboxByIdQuery(cashboxId, {
    skip: !isOpen || !cashboxId,
  });

  const [resolveExchangeRate, { isFetching: isResolvingRate }] =
    useLazyResolveExchangeRateQuery();

  const currency = cashbox?.currency;
  const baseCurrency = cashbox?.baseCurrency || DEFAULT_BASE_CURRENCY;
  const isForeign =
    Boolean(currency) && Boolean(baseCurrency) && currency !== baseCurrency;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const lastResolvedKeyRef = useRef(null);

  // حل سعر الصرف تلقائيًا لعملة الخزنة بتاريخ السند (لو أجنبية).
  // لا يستبدل قيمة أدخلها المستخدم يدويًا لنفس العملة والتاريخ.
  useEffect(() => {
    if (!isOpen || !isForeign || !currency || !form.voucherDate) return;

    const key = `${currency}|${form.voucherDate}`;
    if (lastResolvedKeyRef.current === key) return;

    resolveExchangeRate({ currency, date: form.voucherDate })
      .unwrap()
      .then((res) => {
        lastResolvedKeyRef.current = key;
        if (res?.rate != null) {
          setForm((f) => ({ ...f, exchangeRate: String(round2(res.rate)) }));
        }
      })
      .catch(() => {
        lastResolvedKeyRef.current = key;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isForeign, currency, form.voucherDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fiscalYearWarning = [form.voucherDate]
      .map((value) => getFiscalYearDateWarning(value, selectedFiscalYear))
      .find(Boolean);

    if (fiscalYearWarning) {
      toast.error(fiscalYearWarning);
      return;
    }

    if (!Number(form.amount) || Number(form.amount) <= 0) {
      toast.error("أدخل مبلغ أكبر من صفر");
      return;
    }

    try {
      await createVoucher({
        voucherDate: form.voucherDate,
        direction: form.direction,
        cashboxId,
        amount: Number(form.amount),
        // سعر الصرف يُرسل فقط عند العملات الأجنبية وعند وجود قيمة.
        exchangeRate:
          isForeign && form.exchangeRate !== ""
            ? Number(form.exchangeRate)
            : undefined,
        description: form.description || undefined,
      }).unwrap();

      toast.success(
        form.direction === "Receipt"
          ? "تم تسجيل سند القبض (مسودة) — أكمل التوصيف بعدين"
          : "تم تسجيل سند الصرف (مسودة) — أكمل التوصيف بعدين",
      );

      setForm(emptyForm());
      lastResolvedKeyRef.current = null;
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(err?.data?.detail || "حدث خطأ أثناء حفظ السند");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="سند جديد">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="inline-flex w-full rounded-xl bg-ink-400/5 p-1">
          <button
            type="button"
            onClick={() => set("direction", "Receipt")}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors ${
              form.direction === "Receipt"
                ? "bg-white font-medium text-positive shadow-sm"
                : "text-ink-400"
            }`}
          >
            <ArrowDownCircle size={15} />
            استلام (قبض)
          </button>
          <button
            type="button"
            onClick={() => set("direction", "Payment")}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors ${
              form.direction === "Payment"
                ? "bg-white font-medium text-negative shadow-sm"
                : "text-ink-400"
            }`}
          >
            <ArrowUpCircle size={15} />
            صرف (دفع)
          </button>
        </div>

        <Input
          label="التاريخ"
          type="date"
          min={selectedFiscalYear?.startDate}
          max={selectedFiscalYear?.endDate}
          value={form.voucherDate}
          onChange={(e) => set("voucherDate", e.target.value)}
        />

        <div
          className={`grid grid-cols-1 gap-3 ${
            isForeign ? "sm:grid-cols-2" : ""
          }`}
        >
          <Input
            label={currency ? `المبلغ (${currency})` : "المبلغ"}
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
          />

          {isForeign && (
            <div>
              <Input
                label={`سعر الصرف (${baseCurrency})`}
                type="number"
                min="0"
                step="0.01"
                placeholder={
                  isResolvingRate
                    ? "جاري تحميل السعر..."
                    : "سعر يوم السند تلقائيًا إن ترك فارغًا"
                }
                value={form.exchangeRate}
                onChange={(e) => set("exchangeRate", e.target.value)}
              />

              {isResolvingRate && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-400">
                  <Loader2 size={11} className="animate-spin" />
                  جاري جلب سعر {currency} بتاريخ السند...
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900">
            البيان (اختياري)
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            placeholder="مثال: استلام دفعة تحت حساب"
            className="w-full rounded-xl border border-ink-400/15 bg-white px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>

        <p className="text-xs text-ink-400">
          رقم السند بيتولد تلقائيًا من السيرفر. التوصيف (نوع الحركة والطرف)
          بيتحدد لاحقًا من زر التعديل في الكشف. سعر الصرف بيتسجّل مع المسودة
          لو اتحط هنا، وبيتحل تلقائيًا وقت التوصيف لو فاضي.
        </p>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
          حفظ السند
        </Button>
      </form>
    </Modal>
  );
}
