import { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import NumericInput from "../../../shared/components/ui/NumericInput";
import { useGetPartiesSelectQuery } from "../partiesApi";
import {
  useCreatePartnerOpeningBalanceMutation,
  useUpdatePartnerOpeningBalanceMutation,
} from "../partnerOpeningBalancesApi";
import { useLazyResolveExchangeRateQuery } from "../../exchange-rates/exchangeRatesApi";

const currencyOptions = [
  { value: "EGP", label: "جنيه مصري" },
  { value: "USD", label: "دولار أمريكي" },
  { value: "EUR", label: "يورو" },
  { value: "GBP", label: "جنيه إسترليني" },
  { value: "SAR", label: "ريال سعودي" },
  { value: "AED", label: "درهم إماراتي" },
  { value: "KWD", label: "دينار كويتي" },
];

const balanceTypeOptions = [
  { value: "Receivable", label: "مدين (مستحق للشركة)" },
  { value: "Payable", label: "دائن (مستحق على الشركة)" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm() {
  return {
    businessPartnerId: "",
    documentDate: todayISO(),
    currency: "EGP",
    balanceType: "Receivable",
    amount: "",
    notes: "",
    exchangeRate: "",
  };
}

export default function PartnerOpeningBalanceModal({
  isOpen,
  onClose,
  editingItem,
}) {
  const { data: parties } = useGetPartiesSelectQuery(undefined, {
    skip: !isOpen,
  });

  const [createBalance, { isLoading: isCreating }] =
    useCreatePartnerOpeningBalanceMutation();

  const [updateBalance, { isLoading: isUpdating }] =
    useUpdatePartnerOpeningBalanceMutation();

  const [resolveExchangeRate, { isFetching: isExchangeRateLoading }] =
    useLazyResolveExchangeRateQuery();

  const [form, setForm] = useState(emptyForm());

  const isEditing = Boolean(editingItem);
  const isSaving = isCreating || isUpdating;

  /*
   * Tracks whether the user manually changed the exchange rate.
   *
   * This is only a UI state.
   * The actual value saved is always form.exchangeRate.
   */
  const [rateManuallyEdited, setRateManuallyEdited] = useState(false);

  /* =========================================================
     Initialize Form
  ========================================================= */

  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      setForm({
        businessPartnerId: editingItem.businessPartnerId ?? "",
        documentDate: editingItem.documentDate ?? todayISO(),
        currency: editingItem.currency ?? "EGP",
        balanceType: editingItem.balanceType ?? "Receivable",
        amount: editingItem.amount ?? "",
        notes: editingItem.notes ?? "",
        exchangeRate: editingItem.exchangeRate ?? "",
      });

      /*
       * Existing exchange rate belongs to the saved transaction,
       * so consider it manually/customized for editing purposes.
       */
      setRateManuallyEdited(
        editingItem.exchangeRate !== null &&
          editingItem.exchangeRate !== undefined &&
          editingItem.exchangeRate !== "",
      );
    } else {
      setForm(emptyForm());
      setRateManuallyEdited(false);
    }
  }, [isOpen, editingItem]);

  /* =========================================================
     Resolve Exchange Rate Automatically
  ========================================================= */

  const loadExchangeRate = async (currency, date) => {
    if (!currency || !date) return;

    /*
     * Base currency
     */
    if (currency === "EGP") {
      setForm((current) => ({
        ...current,
        exchangeRate: 1,
      }));

      setRateManuallyEdited(false);
      return;
    }

    try {
      const result = await resolveExchangeRate({
        currency,
        date,
      }).unwrap();

      /*
       * Depending on the API response shape, support the
       * common possible property names.
       */
      const rate = Number(
        result?.rate ?? result?.exchangeRate ?? result?.value ?? 0,
      );

      if (!rate || rate <= 0) {
        setForm((current) => ({
          ...current,
          exchangeRate: "",
        }));

        setRateManuallyEdited(false);

        toast.warning("لم يتم العثور على سعر صرف لهذا التاريخ");
        return;
      }

      setForm((current) => ({
        ...current,
        exchangeRate: rate,
      }));

      setRateManuallyEdited(false);
    } catch (error) {
      console.error("Failed to resolve exchange rate:", error);

      /*
       * Do not block the user.
       * The exchange rate remains editable manually.
       */
      setForm((current) => ({
        ...current,
        exchangeRate: "",
      }));

      setRateManuallyEdited(false);
    }
  };

  /* =========================================================
     Field Change
  ========================================================= */

  const setField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  /* =========================================================
     Currency Change
  ========================================================= */

  const handleCurrencyChange = async (currency) => {
    setForm((current) => ({
      ...current,
      currency,
      exchangeRate: currency === "EGP" ? 1 : "",
    }));

    setRateManuallyEdited(false);

    /*
     * Immediately resolve the new currency using
     * the current document date.
     */
    if (currency && form.documentDate) {
      await loadExchangeRate(currency, form.documentDate);
    }
  };

  /* =========================================================
     Date Change
  ========================================================= */

  const handleDocumentDateChange = async (date) => {
    setForm((current) => ({
      ...current,
      documentDate: date,
    }));

    /*
     * If the transaction is in EGP, exchange rate is always 1.
     */
    if (form.currency === "EGP") {
      setField("exchangeRate", 1);
      return;
    }

    /*
     * When date changes, reload the exchange rate for the
     * selected currency and the new date.
     */
    if (form.currency && date) {
      await loadExchangeRate(form.currency, date);
    }
  };

  /* =========================================================
     Exchange Rate Manual Change
  ========================================================= */

  const handleExchangeRateChange = (value) => {
    setRateManuallyEdited(true);

    setForm((current) => ({
      ...current,
      exchangeRate: value,
    }));
  };

  if (!isOpen) return null;

  /* =========================================================
     Submit
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      businessPartnerId: Number(form.businessPartnerId),
      documentDate: form.documentDate,
      currency: form.currency,
      balanceType: form.balanceType,
      amount: Number(form.amount),
      notes: form.notes.trim() || undefined,
    };

    /*
     * EGP always uses rate 1.
     *
     * Other currencies use the final value currently
     * displayed in the input — whether it was loaded
     * automatically or edited manually.
     */
    if (form.currency === "EGP") {
      payload.exchangeRate = 1;
    } else if (form.exchangeRate !== "" && Number(form.exchangeRate) > 0) {
      payload.exchangeRate = Number(form.exchangeRate);
    }

    try {
      if (isEditing) {
        await updateBalance({
          id: editingItem.id,
          ...payload,
          rowVersion: editingItem.rowVersion,
        }).unwrap();

        toast.success("تم تعديل الرصيد الافتتاحي بنجاح");
      } else {
        await createBalance(payload).unwrap();

        toast.success("تم إضافة الرصيد الافتتاحي بنجاح");
      }

      onClose();
    } catch (err) {
      const serverMessage =
        err?.data?.detail ||
        err?.data?.message ||
        err?.data?.title ||
        "تعذر حفظ الرصيد الافتتاحي";

      toast.error(serverMessage);
    }
  };

  /* =========================================================
     Render
  ========================================================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-card">
        {/* =====================================================
            Header
        ===================================================== */}

        <div className="flex items-center justify-between border-b border-ink-400/10 px-5 py-4">
          <h3 className="text-sm font-semibold text-ink-900">
            {isEditing ? "تعديل رصيد افتتاحي" : "إضافة رصيد افتتاحي"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="text-ink-400 transition-colors hover:text-ink-700 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* =====================================================
            Form
        ===================================================== */}

        <form onSubmit={handleSubmit} className="space-y-3 p-5">
          {/* =================================================
              Partner
          ================================================= */}

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">
              العميل / المورد
            </label>

            <CompactSelect
              options={
                parties?.map((party) => ({
                  value: party.id,
                  label: party.name,
                })) || []
              }
              value={form.businessPartnerId}
              onChange={(value) => setField("businessPartnerId", value)}
              placeholder="اختر العميل أو المورد"
            />
          </div>

          {/* =================================================
              Date
          ================================================= */}

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">
              التاريخ
            </label>

            <input
              type="date"
              value={form.documentDate}
              onChange={(e) => handleDocumentDateChange(e.target.value)}
              className="w-full rounded-lg border border-ink-400/15 px-3 py-2 text-sm outline-none focus:border-primary-500"
            />
          </div>

          {/* =================================================
              Balance Type + Currency
          ================================================= */}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-400">
                نوع الرصيد
              </label>

              <CompactSelect
                options={balanceTypeOptions}
                value={form.balanceType}
                onChange={(value) => setField("balanceType", value)}
                placeholder="اختر النوع"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-400">
                العملة
              </label>

              <CompactSelect
                options={currencyOptions}
                value={form.currency}
                onChange={handleCurrencyChange}
                placeholder="اختر العملة"
              />
            </div>
          </div>

          {/* =================================================
              Amount + Exchange Rate
          ================================================= */}

          <div
            className={form.currency !== "EGP" ? "grid grid-cols-2 gap-3" : ""}
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-400">
                المبلغ
              </label>

              <NumericInput
                value={form.amount}
                decimals
                onChange={(value) => setField("amount", value)}
              />
            </div>

            {form.currency !== "EGP" && (
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-ink-400">
                  <span>سعر الصرف</span>

                  {isExchangeRateLoading && (
                    <Loader2
                      size={12}
                      className="animate-spin text-primary-500"
                    />
                  )}
                </label>

                <NumericInput
                  value={form.exchangeRate}
                  decimals
                  onChange={handleExchangeRateChange}
                  disabled={isExchangeRateLoading}
                />

                <div className="mt-1 text-[10px]">
                  {isExchangeRateLoading ? (
                    <span className="text-primary-500">
                      جاري تحميل سعر الصرف...
                    </span>
                  ) : rateManuallyEdited ? (
                    <span className="text-amber-600">
                      تم تعديل السعر يدويًا
                    </span>
                  ) : form.exchangeRate ? (
                    <span className="text-emerald-600">
                      تم تحميل السعر تلقائيًا
                    </span>
                  ) : (
                    <span className="text-ink-300">
                      يمكنك إدخال السعر يدويًا
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              Notes
          ================================================= */}

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">
              ملاحظات
            </label>

            <textarea
              rows={2}
              maxLength={1000}
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              className="w-full resize-none rounded-lg border border-ink-400/15 px-3 py-2 text-sm outline-none focus:border-primary-500"
            />
          </div>

          {/* =================================================
              Actions
          ================================================= */}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary-500 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}

              {isSaving ? "جاري الحفظ..." : "حفظ"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-10 flex-1 rounded-lg border border-ink-400/15 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-900/[0.03] disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
