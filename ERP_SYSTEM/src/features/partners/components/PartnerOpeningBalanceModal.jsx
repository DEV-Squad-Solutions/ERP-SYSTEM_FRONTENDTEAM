import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import CompactSelect from "../../../shared/components/ui/CompactSelect";
import NumericInput from "../../../shared/components/ui/NumericInput";
import Modal from "../../../shared/components/ui/Modal";

import { useGetPartiesSelectQuery } from "../partiesApi";

import {
  useCreatePartnerOpeningBalanceMutation,
  useUpdatePartnerOpeningBalanceMutation,
} from "../partnerOpeningBalancesApi";

import { useLazyResolveExchangeRateQuery } from "../../exchange-rates/exchangeRatesApi";

/* =========================================================
   OPTIONS
========================================================= */

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
  {
    value: "Receivable",
    label: "مدين (مستحق للشركة)",
  },
  {
    value: "Payable",
    label: "دائن (مستحق على الشركة)",
  },
];

/* =========================================================
   HELPERS
========================================================= */

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

/* =========================================================
   COMPONENT
========================================================= */

export default function PartnerOpeningBalanceModal({
  isOpen,
  onClose,
  editingItem,
}) {
  /* =======================================================
     QUERIES
  ======================================================= */

  const { data: parties } = useGetPartiesSelectQuery(undefined, {
    skip: !isOpen,
  });

  /* =======================================================
     MUTATIONS
  ======================================================= */

  const [createBalance, { isLoading: isCreating }] =
    useCreatePartnerOpeningBalanceMutation();

  const [updateBalance, { isLoading: isUpdating }] =
    useUpdatePartnerOpeningBalanceMutation();

  const [resolveExchangeRate, { isFetching: isExchangeRateLoading }] =
    useLazyResolveExchangeRateQuery();

  /* =======================================================
     STATE
  ======================================================= */

  const [form, setForm] = useState(emptyForm());

  const [rateManuallyEdited, setRateManuallyEdited] = useState(false);

  const isEditing = Boolean(editingItem);

  const isSaving = isCreating || isUpdating;

  /* =======================================================
     INITIALIZE FORM
  ======================================================= */

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

  /* =======================================================
     EXCHANGE RATE
  ======================================================= */

  const loadExchangeRate = async (currency, date) => {
    if (!currency || !date) return;

    /* -----------------------------------------------------
       EGP
    ----------------------------------------------------- */

    if (currency === "EGP") {
      setForm((current) => ({
        ...current,
        exchangeRate: 1,
      }));

      setRateManuallyEdited(false);

      return;
    }

    /* -----------------------------------------------------
       Resolve
    ----------------------------------------------------- */

    try {
      const result = await resolveExchangeRate({
        currency,
        date,
      }).unwrap();

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

      setForm((current) => ({
        ...current,
        exchangeRate: "",
      }));

      setRateManuallyEdited(false);
    }
  };

  /* =======================================================
     FIELD CHANGE
  ======================================================= */

  const setField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  /* =======================================================
     CURRENCY CHANGE
  ======================================================= */

  const handleCurrencyChange = async (currency) => {
    setForm((current) => ({
      ...current,
      currency,
      exchangeRate: currency === "EGP" ? 1 : "",
    }));

    setRateManuallyEdited(false);

    if (currency && form.documentDate) {
      await loadExchangeRate(currency, form.documentDate);
    }
  };

  /* =======================================================
     DATE CHANGE
  ======================================================= */

  const handleDocumentDateChange = async (date) => {
    setForm((current) => ({
      ...current,
      documentDate: date,
    }));

    if (form.currency === "EGP") {
      setField("exchangeRate", 1);
      return;
    }

    if (form.currency && date) {
      await loadExchangeRate(form.currency, date);
    }
  };

  /* =======================================================
     MANUAL EXCHANGE RATE
  ======================================================= */

  const handleExchangeRateChange = (value) => {
    setRateManuallyEdited(true);

    setForm((current) => ({
      ...current,
      exchangeRate: value,
    }));
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

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

    /* -----------------------------------------------------
       Exchange Rate
    ----------------------------------------------------- */

    if (form.currency === "EGP") {
      payload.exchangeRate = 1;
    } else if (form.exchangeRate !== "" && Number(form.exchangeRate) > 0) {
      payload.exchangeRate = Number(form.exchangeRate);
    }

    /* -----------------------------------------------------
       Save
    ----------------------------------------------------- */

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

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSaving ? () => {} : onClose}
      title={isEditing ? "تعديل رصيد افتتاحي" : "إضافة رصيد افتتاحي"}
      wide={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* =================================================
            PARTNER
        ================================================= */}

        <div>
          <label
            className={[
              "mb-1.5 block",
              "text-xs font-semibold",
              "text-ink-700",
              "dark:text-ink-200",
            ].join(" ")}
          >
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
            DATE
        ================================================= */}

        <div>
          <label
            className={[
              "mb-1.5 block",
              "text-xs font-semibold",
              "text-ink-700",
              "dark:text-ink-200",
            ].join(" ")}
          >
            التاريخ
          </label>

          <input
            type="date"
            value={form.documentDate}
            onChange={(e) => handleDocumentDateChange(e.target.value)}
            className={[
              "w-full",
              "rounded-lg",
              "border",
              "border-ink-200",
              "bg-white",
              "px-3 py-2",
              "text-sm",
              "font-medium",
              "text-ink-800",
              "outline-none",
              "transition-all duration-200",
              "hover:border-ink-300",
              "focus:border-primary-500",
              "focus:ring-2",
              "focus:ring-primary-500/10",
              "dark:border-white/[0.08]",
              "dark:bg-white/[0.03]",
              "dark:text-white",
              "dark:hover:border-white/[0.15]",
            ].join(" ")}
          />
        </div>

        {/* =================================================
            BALANCE TYPE + CURRENCY
        ================================================= */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* BALANCE TYPE */}

          <div>
            <label
              className={[
                "mb-1.5 block",
                "text-xs font-semibold",
                "text-ink-700",
                "dark:text-ink-200",
              ].join(" ")}
            >
              نوع الرصيد
            </label>

            <CompactSelect
              options={balanceTypeOptions}
              value={form.balanceType}
              onChange={(value) => setField("balanceType", value)}
              placeholder="اختر النوع"
            />
          </div>

          {/* CURRENCY */}

          <div>
            <label
              className={[
                "mb-1.5 block",
                "text-xs font-semibold",
                "text-ink-700",
                "dark:text-ink-200",
              ].join(" ")}
            >
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
            AMOUNT + EXCHANGE RATE
        ================================================= */}

        <div
          className={
            form.currency !== "EGP"
              ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
              : ""
          }
        >
          {/* AMOUNT */}

          <div>
            <label
              className={[
                "mb-1.5 block",
                "text-xs font-semibold",
                "text-ink-700",
                "dark:text-ink-200",
              ].join(" ")}
            >
              المبلغ
            </label>

            <NumericInput
              value={form.amount}
              decimals
              onChange={(value) => setField("amount", value)}
            />
          </div>

          {/* EXCHANGE RATE */}

          {form.currency !== "EGP" && (
            <div>
              <label
                className={[
                  "mb-1.5 flex items-center gap-1",
                  "text-xs font-semibold",
                  "text-ink-700",
                  "dark:text-ink-200",
                ].join(" ")}
              >
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

              {/* RATE STATUS */}

              <div className="mt-1.5 min-h-4 text-[10px] font-medium">
                {isExchangeRateLoading ? (
                  <span className="text-primary-600 dark:text-primary-400">
                    جاري تحميل سعر الصرف...
                  </span>
                ) : rateManuallyEdited ? (
                  <span className="text-amber-600 dark:text-amber-400">
                    تم تعديل السعر يدويًا
                  </span>
                ) : form.exchangeRate ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    تم تحميل السعر تلقائيًا
                  </span>
                ) : (
                  <span className="text-ink-500 dark:text-ink-300">
                    يمكنك إدخال السعر يدويًا
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            NOTES
        ================================================= */}

        <div>
          <label
            className={[
              "mb-1.5 block",
              "text-xs font-semibold",
              "text-ink-700",
              "dark:text-ink-200",
            ].join(" ")}
          >
            ملاحظات
          </label>

          <textarea
            rows={3}
            maxLength={1000}
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            placeholder="أضف ملاحظات اختيارية..."
            className={[
              "w-full",
              "resize-none",
              "rounded-lg",
              "border",
              "border-ink-200",
              "bg-white",
              "px-3 py-2",
              "text-sm",
              "font-medium",
              "text-ink-800",
              "placeholder:text-ink-400",
              "outline-none",
              "transition-all duration-200",
              "hover:border-ink-300",
              "focus:border-primary-500",
              "focus:ring-2",
              "focus:ring-primary-500/10",
              "dark:border-white/[0.08]",
              "dark:bg-white/[0.03]",
              "dark:text-white",
              "dark:placeholder:text-ink-400",
              "dark:hover:border-white/[0.15]",
            ].join(" ")}
          />
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div
          className={[
            "flex flex-col-reverse",
            "gap-2 pt-2",
            "sm:flex-row",
          ].join(" ")}
        >
          {/* CANCEL */}

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className={[
              "h-10 flex-1",
              "rounded-lg",
              "border",
              "border-ink-200",
              "bg-white",
              "text-sm font-semibold",
              "text-ink-700",
              "transition-all duration-200",
              "hover:border-ink-300",
              "hover:bg-ink-50",
              "active:scale-[0.98]",
              "disabled:cursor-not-allowed",
              "disabled:opacity-50",
              "dark:border-white/[0.08]",
              "dark:bg-white/[0.025]",
              "dark:text-ink-200",
              "dark:hover:bg-white/[0.05]",
            ].join(" ")}
          >
            إلغاء
          </button>

          {/* SAVE */}

          <button
            type="submit"
            disabled={isSaving}
            className={[
              "flex h-10 flex-1",
              "items-center justify-center gap-2",
              "rounded-lg",
              "bg-primary-500",
              "text-sm font-bold",
              "text-white",
              "shadow-sm",
              "transition-all duration-200",
              "hover:bg-primary-600",
              "hover:shadow-md",
              "active:scale-[0.98]",
              "disabled:cursor-not-allowed",
              "disabled:opacity-60",
              "disabled:hover:bg-primary-500",
            ].join(" ")}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save size={16} strokeWidth={2} />
                حفظ
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
