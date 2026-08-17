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

function emptyForm() {
  return {
    businessPartnerId: "",
    documentDate: new Date().toISOString().slice(0, 10),
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

  const [form, setForm] = useState(emptyForm());

  const isEditing = Boolean(editingItem);
  const isSaving = isCreating || isUpdating;

  /* =========================================================
     Initialize Form
  ========================================================= */

  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      setForm({
        businessPartnerId: editingItem.businessPartnerId ?? "",
        documentDate:
          editingItem.documentDate ?? new Date().toISOString().slice(0, 10),
        currency: editingItem.currency ?? "EGP",
        balanceType: editingItem.balanceType ?? "Receivable",
        amount: editingItem.amount ?? "",
        notes: editingItem.notes ?? "",
        exchangeRate: editingItem.exchangeRate ?? "",
      });
    } else {
      setForm(emptyForm());
    }
  }, [isOpen, editingItem]);

  /* =========================================================
     Field Change
  ========================================================= */

  const setField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
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

    if (form.exchangeRate !== "" && Number(form.exchangeRate) > 0) {
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
              onChange={(e) => setField("documentDate", e.target.value)}
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
                onChange={(value) => setField("currency", value)}
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
                <label className="mb-1 block text-xs font-medium text-ink-400">
                  سعر الصرف
                  <span className="mr-1 text-[11px] text-ink-300">
                    (اختياري - تلقائي لو فاضي)
                  </span>
                </label>

                <NumericInput
                  value={form.exchangeRate}
                  decimals
                  onChange={(value) => setField("exchangeRate", value)}
                />
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
