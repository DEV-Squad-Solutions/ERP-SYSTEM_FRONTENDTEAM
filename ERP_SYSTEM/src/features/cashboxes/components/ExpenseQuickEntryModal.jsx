import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Receipt } from "lucide-react";

import {
  useCreateCashVoucherMutation,
  useUpdateCashVoucherMutation,
} from "../cashVouchersApi";

import { useGetCashMovementTypeOptionsQuery } from "../cashMovementTypesApi";

import { useGetCashboxesQuery } from "../cashboxesApi";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import CompactSelect from "../../../shared/components/ui/CompactSelect";

function emptyForm() {
  return {
    voucherDate: new Date().toISOString().slice(0, 10),
    cashboxId: "",
    cashMovementTypeId: "",
    amount: "",
    description: "",
    notes: "",
  };
}

/**
 * تسجيل مصروف سريع
 *
 * الحالات:
 *
 * 1. cashboxId موجود:
 *    الخزنة محددة مسبقًا ولا يظهر Select الخزينة.
 *
 * 2. cashboxId غير موجود:
 *    يظهر Select للخزائن النشطة.
 *
 * المصروف:
 * Direction      = Payment
 * Classification = Expense
 * ForPartner     = false
 * PartyType      = None
 */
export default function ExpenseQuickEntryModal({
  isOpen,
  onClose,
  cashboxId = null,
  onSaved,
}) {
  const [createVoucher] = useCreateCashVoucherMutation();
  const [updateVoucher] = useUpdateCashVoucherMutation();

  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  // =========================================================
  // Cashboxes
  // GET /api/v1/Cashboxes/select
  // =========================================================

  const { data: cashboxesData = [], isFetching: loadingCashboxes } =
    useGetCashboxesQuery(undefined, {
      skip: !isOpen || Boolean(cashboxId),
    });

  const cashboxes = Array.isArray(cashboxesData)
    ? cashboxesData
    : (cashboxesData?.items ?? []);

  const cashboxOptions = cashboxes.map((cashbox) => ({
    value: String(cashbox.id),
    label: `${cashbox.name} — ${cashbox.currency}`,
  }));

  // =========================================================
  // Expense Types
  //
  // GET /api/v1/CashMovementTypes/select
  //
  // Direction      = Payment
  // Classification = Expense
  // ForPartner     = false
  // =========================================================

  const { data: expenseTypes = [], isFetching: loadingTypes } =
    useGetCashMovementTypeOptionsQuery(
      {
        direction: "Payment",
        classification: "Expense",
        forPartner: false,
      },
      {
        skip: !isOpen,
      },
    );

  const expenseTypeOptions = expenseTypes.map((type) => ({
    value: String(type.id),
    label: type.name,
  }));

  // =========================================================
  // Reset / initialize
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    setForm({
      ...emptyForm(),
      cashboxId: cashboxId ? String(cashboxId) : "",
    });
  }, [isOpen, cashboxId]);

  // =========================================================
  // Helpers
  // =========================================================

  const set = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const selectedCashboxId = cashboxId || form.cashboxId;

  const canSave =
    Boolean(selectedCashboxId) &&
    Boolean(form.cashMovementTypeId) &&
    Number(form.amount) > 0;

  // =========================================================
  // Submit
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCashboxId) {
      toast.error("اختر الخزنة أولًا");
      return;
    }

    if (!form.cashMovementTypeId) {
      toast.error("اختر نوع المصروف");
      return;
    }

    if (Number(form.amount) <= 0) {
      toast.error("أدخل مبلغ أكبر من صفر");
      return;
    }

    setSaving(true);

    try {
      // =====================================================
      // 1) إنشاء السند كـ Draft
      // =====================================================

      const created = await createVoucher({
        cashboxId: selectedCashboxId,

        voucherDate: form.voucherDate,

        direction: "Payment",

        amount: Number(form.amount),

        description: form.description || undefined,
      }).unwrap();

      // =====================================================
      // 2) توصيف السند كمصروف
      // =====================================================

      await updateVoucher({
        id: created.id,

        cashboxId: selectedCashboxId,

        rowVersion: created.rowVersion,

        voucherDate: form.voucherDate,

        direction: "Payment",

        amount: Number(form.amount),

        cashMovementTypeId: form.cashMovementTypeId,

        // المصروف المباشر ليس مرتبطًا بطرف
        partyType: "None",

        businessPartnerId: null,

        driverId: null,

        externalPartyName: null,

        description: form.description || undefined,

        notes: form.notes || undefined,
      }).unwrap();

      // =====================================================
      // Success
      // =====================================================

      toast.success("تم تسجيل المصروف بنجاح");

      setForm({
        ...emptyForm(),
        cashboxId: cashboxId ? String(cashboxId) : "",
      });

      onSaved?.();

      onClose();
    } catch (err) {
      const code = err?.data?.errorCode;

      if (code === "CashVouchers.Concurrency") {
        toast.error(
          "السند تم تعديله من مستخدم آخر. أعد تحميل البيانات وحاول مرة أخرى.",
        );
      } else {
        toast.error(
          err?.data?.detail ||
            err?.data?.message ||
            "حدث خطأ أثناء تسجيل المصروف",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تسجيل مصروف">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ===================================================
            Cashbox
        =================================================== */}

        {!cashboxId && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-900">
              الخزنة
            </label>

            <CompactSelect
              options={cashboxOptions}
              value={form.cashboxId}
              onChange={(value) => set("cashboxId", value || "")}
              isLoading={loadingCashboxes}
              isDisabled={loadingCashboxes}
              placeholder={
                loadingCashboxes ? "جاري تحميل الخزائن..." : "اختر الخزنة"
              }
            />

            {!loadingCashboxes && cashboxOptions.length === 0 && (
              <p className="mt-1.5 text-xs text-negative">
                لا توجد خزائن نشطة متاحة.
              </p>
            )}
          </div>
        )}

        {/* ===================================================
            Date
        =================================================== */}

        <Input
          label="التاريخ"
          type="date"
          value={form.voucherDate}
          onChange={(e) => set("voucherDate", e.target.value)}
        />

        {/* ===================================================
            Expense Type
        =================================================== */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900">
            نوع المصروف
          </label>

          <CompactSelect
            options={expenseTypeOptions}
            value={form.cashMovementTypeId}
            onChange={(value) => set("cashMovementTypeId", value || "")}
            isLoading={loadingTypes}
            isDisabled={loadingTypes}
            placeholder={
              loadingTypes
                ? "جاري تحميل أنواع المصروفات..."
                : "اختر نوع المصروف"
            }
          />

          {!loadingTypes && expenseTypeOptions.length === 0 && (
            <p className="mt-1.5 text-xs text-ink-400">
              لا توجد أنواع مصروفات معرفة.
              <br />
              أضف نوع حركة بتصنيف "مصروفات" من شاشة أنواع حركات الخزنة.
            </p>
          )}
        </div>

        {/* ===================================================
            Amount
        =================================================== */}

        <Input
          label="المبلغ"
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(e) => set("amount", e.target.value)}
          placeholder="0.00"
        />

        {/* ===================================================
            Description
        =================================================== */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900">
            البيان
            <span className="mr-1 text-xs font-normal text-ink-400">
              (اختياري)
            </span>
          </label>

          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            placeholder="مثال: شراء أدوات مكتبية"
            className="w-full rounded-xl border border-ink-400/15 bg-white px-3.5 py-2.5 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/10"
          />
        </div>

        {/* ===================================================
            Notes
        =================================================== */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900">
            ملاحظات
            <span className="mr-1 text-xs font-normal text-ink-400">
              (اختياري)
            </span>
          </label>

          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            placeholder="ملاحظات إضافية..."
            className="w-full rounded-xl border border-ink-400/15 bg-white px-3.5 py-2.5 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/10"
          />
        </div>

        {/* ===================================================
            Submit
        =================================================== */}

        <Button type="submit" disabled={!canSave || saving} className="w-full">
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Receipt size={16} />
          )}

          {saving ? "جاري التسجيل..." : "تسجيل المصروف"}
        </Button>
      </form>
    </Modal>
  );
}
