import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import NumericInput from "../../../shared/components/ui/NumericInput";
import { selectSelectedFiscalYear } from "../../fiscalYears/fiscalYearSlice";

import { useGetDriversSelectQuery } from "../driversApi";
import {
  useCreateDriverOpeningBalanceMutation,
  useUpdateDriverOpeningBalanceMutation,
} from "../driverOpeningBalancesApi";

const balanceTypeOptions = [
  { value: "Receivable", label: "مدين (مستحق للشركة)" },
  { value: "Payable", label: "دائن (مستحق على الشركة)" },
];

function emptyForm() {
  return {
    driverId: "",
    amount: "",
    balanceType: "Receivable",
    notes: "",
  };
}

const ERROR_MESSAGES = {
  "DriverOpeningBalances.Duplicate":
    "يوجد رصيد افتتاحي لهذا السائق في السنة المالية المحددة بالفعل.",
  "DriverOpeningBalances.CarriedForwardExists":
    "يوجد رصيد مرحّل لهذا السائق في السنة المالية المحددة.",
  "DriverOpeningBalances.LegacyOpeningExists":
    "يوجد قيد افتتاحي سابق لهذا السائق في السنة المالية المحددة.",
  "DriverOpeningBalances.InactiveDriver":
    "لازم السائق يكون نشطًا لإضافة رصيد افتتاحي.",
  "DriverOpeningBalances.FiscalYearClosed": "السنة المالية مغلقة.",
  "DriverOpeningBalances.ReadOnly": "الرصيد المرحّل للقراءة فقط.",
  "DriverOpeningBalances.ScopeImmutable":
    "لا يمكن تغيير السائق أو السنة المالية لمستند رصيد افتتاحي.",
  "DriverOpeningBalances.Concurrency":
    "تغيّر الرصيد الافتتاحي من مكان آخر. أعد تحميل البيانات ثم حاول مرة أخرى.",
  "DriverOpeningBalances.RowVersionRequired":
    "تعذر إرسال إصدار المستند الحالي. أعد تحميل الصفحة وحاول مرة أخرى.",
  "DriverOpeningBalances.InvalidAmount":
    "أدخل مبلغًا موجبًا بحد أقصى 15 خانة صحيحة ومنزلتين عشريتين.",
  "DriverOpeningBalances.NotesTooLong":
    "الملاحظات لازم تكون 1000 حرف أو أقل.",
};

export default function DriverOpeningBalanceModal({
  isOpen,
  onClose,
  editingItem,
}) {
  const { data: drivers } = useGetDriversSelectQuery(undefined, {
    skip: !isOpen,
  });

  const [createBalance, { isLoading: isCreating }] =
    useCreateDriverOpeningBalanceMutation();
  const [updateBalance, { isLoading: isUpdating }] =
    useUpdateDriverOpeningBalanceMutation();

  const selectedFiscalYear = useSelector(selectSelectedFiscalYear);

  const [form, setForm] = useState(emptyForm());

  const isEditing = Boolean(editingItem);
  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      setForm({
        driverId: editingItem.driverId ?? "",
        amount: editingItem.amountText ?? editingItem.amount ?? "",
        balanceType: editingItem.balanceType ?? "Receivable",
        notes: editingItem.notes ?? "",
      });
    } else {
      setForm(emptyForm());
    }
  }, [isOpen, editingItem]);

  const setField = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.driverId) {
      toast.error("اختر السائق");
      return;
    }

    if (!selectedFiscalYear?.id) {
      toast.error("اختر السنة المالية أولًا");
      return;
    }

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("أدخل مبلغًا أكبر من صفر");
      return;
    }

    const payload = {
      driverId: Number(form.driverId),
      // في التعديل بنبعت سنة المستند نفسه، مش السنة المختارة حاليًا،
      // التزامًا بقاعدة ثبات النطاق (ScopeImmutable).
      fiscalYearId: editingItem?.fiscalYearId ?? selectedFiscalYear.id,
      amount,
      balanceType: form.balanceType,
      notes: form.notes.trim() || undefined,
    };

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
    } catch (error) {
      const code = error?.data?.errorCode ?? error?.data?.code;

      toast.error(
        ERROR_MESSAGES[code] ||
          error?.data?.detail ||
          error?.data?.message ||
          error?.data?.title ||
          "تعذر حفظ الرصيد الافتتاحي",
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSaving ? () => {} : onClose}
      title={isEditing ? "تعديل رصيد افتتاحي للسائق" : "إضافة رصيد افتتاحي للسائق"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-ink-400/10 bg-ink-400/5 px-4 py-3 text-xs leading-6 text-ink-500">
          السنة المالية:{" "}
          <strong className="text-ink-700">
            {selectedFiscalYear?.name || "—"}
          </strong>
          . رقم المستند وتاريخه وعملته بيتحددوا تلقائيًا من السنة المالية
          وإعدادات الشركة.
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-700">
            السائق
          </label>

          <CompactSelect
            options={
              drivers?.map((driver) => ({
                value: driver.id,
                label: driver.name,
              })) || []
            }
            value={form.driverId}
            onChange={(value) => setField("driverId", value)}
            placeholder="اختر السائق"
            isDisabled={isEditing || isSaving}
          />

          {isEditing && (
            <p className="mt-1 text-[11px] text-ink-400">
              لا يمكن تغيير السائق أو السنة المالية بعد الإنشاء.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">
              نوع الرصيد
            </label>

            <CompactSelect
              options={balanceTypeOptions}
              value={form.balanceType}
              onChange={(value) => setField("balanceType", value)}
              placeholder="اختر النوع"
              isDisabled={isSaving}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">
              المبلغ
            </label>

            <NumericInput
              value={form.amount}
              decimals
              onChange={(value) => setField("amount", value)}
              disabled={isSaving}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-700">
            ملاحظات
          </label>

          <textarea
            rows={3}
            maxLength={1000}
            value={form.notes}
            onChange={(event) => setField("notes", event.target.value)}
            placeholder="أضف ملاحظات اختيارية..."
            className="w-full resize-none rounded-lg border border-ink-400/15 bg-white px-3 py-2 text-sm font-medium text-ink-800 outline-none transition-all duration-200 placeholder:text-ink-400 hover:border-ink-400/25 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
            disabled={isSaving}
          />
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1"
          >
            إلغاء
          </Button>

          <Button type="submit" disabled={isSaving} className="flex-1">
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save size={16} />
                حفظ
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
