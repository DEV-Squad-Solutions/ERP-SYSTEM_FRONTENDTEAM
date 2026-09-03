import { useEffect, useState } from "react";
import Modal from "../../../shared/components/ui/Modal";
import CompactSelect from "../../../shared/components/ui/CompactSelect";

const initialForm = {
  fiscalYearId: "",
  statementType: "FinancialPosition",
  name: "",
  code: "",
  parentLineId: "",
  displayOrder: 10,
  isAssignable: true,
  isActive: true,
  rowVersion: "",
};

const statementTypes = [
  {
    value: "FinancialPosition",
    label: "قائمة المركز المالي",
  },
  {
    value: "IncomeStatement",
    label: "قائمة الدخل",
  },
  {
    value: "CashFlow",
    label: "قائمة التدفقات النقدية",
  },
];

export default function FinancialStatementLineFormModal({
  isOpen,
  onClose,
  mode = "create",
  line = null,
  parentOptions = [],
  fiscalYears = [],
  isLoading = false,
  onSubmit,
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && line) {
      setForm({
        fiscalYearId: line.fiscalYearId ?? "",
        statementType: line.statementType ?? "FinancialPosition",
        name: line.name ?? "",
        code: line.code ?? "",
        parentLineId: line.parentLineId ?? "",
        displayOrder: line.displayOrder ?? 10,
        isAssignable: line.isAssignable ?? true,
        isActive: line.isActive ?? true,
        rowVersion: line.rowVersion ?? "",
      });
      return;
    }

    setForm({
      ...initialForm,
      fiscalYearId: line?.fiscalYearId ?? "",
      statementType: line?.statementType ?? "FinancialPosition",
      parentLineId: line?.parentLineId ?? "",
      displayOrder:
        line?.displayOrder != null ? Number(line.displayOrder) + 10 : 10,
    });
  }, [isOpen, mode, line]);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await onSubmit({
      fiscalYearId: Number(form.fiscalYearId),
      statementType: form.statementType,
      name: form.name.trim(),
      code: form.code.trim(),
      parentLineId: form.parentLineId ? Number(form.parentLineId) : null,
      displayOrder: Number(form.displayOrder),
      isAssignable: Boolean(form.isAssignable),
      isActive: Boolean(form.isActive),
      ...(mode === "edit" && {
        rowVersion: form.rowVersion,
      }),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "edit" ? "تعديل بند مالي" : "إضافة بند مالي"}
      wide
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              السنة المالية
            </label>

            <CompactSelect
              options={fiscalYears}
              value={form.fiscalYearId}
              onChange={(value) => updateField("fiscalYearId", value)}
              isDisabled={true}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              نوع القائمة
            </label>

            <CompactSelect
              options={statementTypes}
              value={form.statementType}
              onChange={(value) => updateField("statementType", value)}
              isDisabled={mode === "edit"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              اسم البند
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full h-10 rounded-xl border border-ink-400/20 bg-paper px-3 text-sm outline-none focus:border-primary-500"
              placeholder="اسم البند"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              كود البند
            </label>

            <input
              type="text"
              value={form.code}
              onChange={(e) => updateField("code", e.target.value)}
              className="w-full h-10 rounded-xl border border-ink-400/20 bg-paper px-3 text-sm outline-none focus:border-primary-500"
              placeholder="مثال: FP-110"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              الترتيب
            </label>

            <input
              type="number"
              value={form.displayOrder}
              onChange={(e) => updateField("displayOrder", e.target.value)}
              className="w-full h-10 rounded-xl border border-ink-400/20 bg-paper px-3 text-sm outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              البند الأب
            </label>

            <CompactSelect
              options={parentOptions}
              value={form.parentLineId}
              onChange={(value) => updateField("parentLineId", value)}
              placeholder="بدون بند أب"
              isDisabled={mode === "edit"}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isAssignable}
              onChange={(e) => updateField("isAssignable", e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-ink-700">قابل للربط بالحسابات</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => updateField("isActive", e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-ink-700">نشط</span>
          </label>
        </div>

        {mode === "edit" && form.rowVersion && (
          <div className="rounded-xl bg-ink-400/5 px-4 py-3 text-xs text-ink-500">
            سيتم استخدام رقم الإصدار الحالي للبند عند الحفظ.
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink-400/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-10 px-5 rounded-xl border border-ink-400/20 text-ink-700 hover:bg-ink-400/5 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="h-10 px-5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {isLoading
              ? "جاري الحفظ..."
              : mode === "edit"
                ? "حفظ التعديلات"
                : "إضافة البند"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
