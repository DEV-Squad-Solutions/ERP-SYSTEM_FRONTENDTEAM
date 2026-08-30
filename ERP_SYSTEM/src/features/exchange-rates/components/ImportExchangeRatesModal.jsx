// features/exchange-rates/components/ImportExchangeRatesModal.jsx

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
} from "lucide-react";

import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";

import {
  usePreviewImportExchangeRatesMutation,
  useImportExchangeRatesMutation,
} from "../exchangeRatesApi";
import { useGetCurrenciesSelectQuery } from "../../currencies/currenciesApi";

const STATUS_STYLES = {
  Imported: { label: "تم الاستيراد", cls: "bg-positive/10 text-positive" },
  Updated: { label: "تم التحديث", cls: "bg-primary-500/10 text-primary-600" },
  Skipped: { label: "تم التجاوز", cls: "bg-amber-500/10 text-amber-600" },
  Failed: { label: "فشل", cls: "bg-negative/10 text-negative" },
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function ImportExchangeRatesModal({ isOpen, onClose, onDone }) {
  const [step, setStep] = useState("form"); // form | preview | result
  const [rateDate, setRateDate] = useState(todayISO());
  const [selectedCurrencies, setSelectedCurrencies] = useState([]);
  const [replaceUnreferenced, setReplaceUnreferenced] = useState(false);

  const { data: currencies } = useGetCurrenciesSelectQuery();

  const [previewImport, { data: previewData, isLoading: isPreviewing }] =
    usePreviewImportExchangeRatesMutation();

  const [runImport, { data: importResult, isLoading: isImporting }] =
    useImportExchangeRatesMutation();

  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setRateDate(todayISO());
      setSelectedCurrencies([]);
      setReplaceUnreferenced(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function toggleCurrency(code) {
    setSelectedCurrencies((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  }

  async function handlePreview() {
    try {
      await previewImport({
        rateDate,
        currencies: selectedCurrencies,
        replaceUnreferencedImportedRates: replaceUnreferenced,
      }).unwrap();
      setStep("preview");
    } catch (err) {
      toast.error(
        err?.data?.detail || err?.data?.title || "تعذر جلب معاينة الأسعار",
      );
    }
  }

  async function handleConfirmImport() {
    try {
      await runImport({
        rateDate,
        currencies: selectedCurrencies,
        replaceUnreferencedImportedRates: replaceUnreferenced,
      }).unwrap();
      setStep("result");
      toast.success("تم تنفيذ الاستيراد");
    } catch (err) {
      toast.error(
        err?.data?.detail || err?.data?.title || "تعذر تنفيذ الاستيراد",
      );
    }
  }

  function handleFinish() {
    onDone?.();
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="استيراد أسعار الصرف من مصدر خارجي"
    >
      {/* ==================== Step: Form ==================== */}

      {step === "form" && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-900">
              تاريخ السعر
            </label>
            <input
              type="date"
              value={rateDate}
              onChange={(e) => setRateDate(e.target.value)}
              className="w-full rounded-xl border border-ink-400/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-900">
              العملات
            </label>
            <p className="mb-2 text-xs text-ink-400">
              اتركها فارغة عشان يتم استيراد كل العملات المتاحة (ماعدا عملة
              الشركة الأساسية)
            </p>

            <div className="flex flex-wrap gap-2">
              {(currencies || []).map((c) => {
                const active = selectedCurrencies.includes(c.value);
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => toggleCurrency(c.value)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? "border-primary-500 bg-primary-500/10 text-primary-600"
                        : "border-ink-400/15 text-ink-500 hover:bg-ink-400/5"
                    }`}
                  >
                    {c.value}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-start gap-2 rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={replaceUnreferenced}
              onChange={(e) => setReplaceUnreferenced(e.target.checked)}
              className="mt-0.5 rounded border-ink-400/30"
            />
            <span>
              استبدال الأسعار المستوردة الغير مستخدمة بنفس التاريخ
              <span className="mt-0.5 block text-xs text-amber-600">
                الأسعار اليدوية (Manual) والأسعار المستوردة المرتبطة بحركات
                فعلية أبدًا ما بيتم الكتابة فوقها.
              </span>
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-2 border-t border-ink-400/10">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handlePreview}
              disabled={isPreviewing}
            >
              {isPreviewing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  جاري الجلب...
                </>
              ) : (
                <>
                  <Download size={16} />
                  معاينة
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ==================== Step: Preview ==================== */}

      {step === "preview" && previewData && (
        <div className="space-y-4">
          <div className="rounded-xl bg-ink-400/5 p-3 text-xs text-ink-600">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                المصدر: <strong>{previewData.provider}</strong>
              </span>
              <span>
                التاريخ المطلوب: <strong>{previewData.requestedDate}</strong>
              </span>
              <span>
                العملة الأساسية: <strong>{previewData.baseCurrency}</strong>
              </span>
              <span>
                {previewData.receivedCount} من {previewData.requestedCount}
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-ink-400/10">
            <table className="w-full text-sm" dir="rtl">
              <thead>
                <tr className="bg-ink-400/5 text-xs text-ink-400">
                  <th className="px-3 py-2 text-right font-medium">العملة</th>
                  <th className="px-3 py-2 text-right font-medium">السعر</th>
                  <th className="px-3 py-2 text-right font-medium">
                    تاريخ السعر الفعلي
                  </th>
                  <th className="px-3 py-2 text-right font-medium">ملاحظة</th>
                </tr>
              </thead>
              <tbody>
                {previewData.items.map((item, i) => (
                  <tr key={i} className="border-t border-ink-400/10">
                    <td className="px-3 py-2 font-medium text-ink-800">
                      {item.currency}
                    </td>
                    <td className="px-3 py-2">
                      {item.error ? (
                        <span className="inline-flex items-center gap-1 text-negative">
                          <XCircle size={13} />—
                        </span>
                      ) : (
                        item.rate
                      )}
                    </td>
                    <td className="px-3 py-2 text-ink-600">
                      {item.rateDate || "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-negative">
                      {item.error || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-ink-400/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("form")}
            >
              رجوع
            </Button>
            <Button
              type="button"
              onClick={handleConfirmImport}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  جاري الاستيراد...
                </>
              ) : (
                "تأكيد الاستيراد"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ==================== Step: Result ==================== */}

      {step === "result" && importResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl bg-positive/10 p-3 text-center">
              <div className="text-lg font-bold text-positive">
                {importResult.importedCount}
              </div>
              <div className="text-[11px] text-ink-500">مستورد جديد</div>
            </div>
            <div className="rounded-xl bg-primary-500/10 p-3 text-center">
              <div className="text-lg font-bold text-primary-600">
                {importResult.updatedCount}
              </div>
              <div className="text-[11px] text-ink-500">تم تحديثه</div>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-3 text-center">
              <div className="text-lg font-bold text-amber-600">
                {importResult.skippedCount}
              </div>
              <div className="text-[11px] text-ink-500">تم تجاوزه</div>
            </div>
            <div className="rounded-xl bg-negative/10 p-3 text-center">
              <div className="text-lg font-bold text-negative">
                {importResult.failedCount}
              </div>
              <div className="text-[11px] text-ink-500">فشل</div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-ink-400/10">
            <table className="w-full text-sm" dir="rtl">
              <thead>
                <tr className="bg-ink-400/5 text-xs text-ink-400">
                  <th className="px-3 py-2 text-right font-medium">العملة</th>
                  <th className="px-3 py-2 text-right font-medium">السعر</th>
                  <th className="px-3 py-2 text-right font-medium">الحالة</th>
                  <th className="px-3 py-2 text-right font-medium">السبب</th>
                </tr>
              </thead>
              <tbody>
                {importResult.items.map((item, i) => {
                  const style = STATUS_STYLES[item.status] || {
                    label: item.status,
                    cls: "bg-ink-400/10 text-ink-500",
                  };

                  return (
                    <tr key={i} className="border-t border-ink-400/10">
                      <td className="px-3 py-2 font-medium text-ink-800">
                        {item.currency}
                      </td>
                      <td className="px-3 py-2">{item.rate ?? "—"}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-[11px] ${style.cls}`}
                        >
                          {style.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-ink-500">
                        {item.reason || ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2 border-t border-ink-400/10">
            <Button type="button" onClick={handleFinish}>
              تم
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
