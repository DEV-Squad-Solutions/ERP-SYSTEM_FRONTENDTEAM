// features/cashboxes/components/CashboxLedgerTable.jsx
import { useState, useRef } from "react";
import {
  FileSearch,
  AlertCircle,
  RefreshCw,
  Plus,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import DescriptionPickerModal, {
  categories as descriptionCategories,
} from "./DescriptionPickerModal";
import Pagination from "../../../shared/components/ui/Pagination";

/**
 * @param {{
 *   data: Object,
 *   isLoading: boolean,
 *   isFetching: boolean,
 *   isError: boolean,
 *   refetch: () => void,
 *   partyOptions: Array<{ id: number, name: string }>,
 *   onAddVoucher: (payload: Object) => Promise<void>,
 *   onUpdateVoucherDescription: (voucherId: number|string, payload: Object) => Promise<void>,
 *   page: number,
 *   pageSize: number,
 *   totalCount: number,
 *   onPageChange: (page: number) => void,
 *   onPageSizeChange: (size: number) => void,
 * }} props
 */
export default function CashboxLedgerTable({
  data,
  isLoading,
  isFetching,
  isError,
  refetch,
  partyOptions = [],
  onAddVoucher,
  onUpdateVoucherDescription,
  page = 1,
  pageSize = 20,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());
  const [showPicker, setShowPicker] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null); // id السطر اللي بيتعدل توصيفه
  const [updatingRowId, setUpdatingRowId] = useState(null); // id السطر اللي بيتحفظ حاليًا
  const dateInputRef = useRef(null);

  function emptyDraft() {
    return {
      voucherDate: new Date().toISOString().slice(0, 10),
      voucherNumber: "",
      description: "",
      category: null,
      partnerId: null,
      receiptAmount: "",
      paymentAmount: "",
      notes: "",
    };
  }

  function openAddRow() {
    setDraft(emptyDraft());
    setIsAdding(true);
    setTimeout(() => dateInputRef.current?.focus(), 0);
  }

  function closeAddRow() {
    setIsAdding(false);
    setDraft(emptyDraft());
  }

  async function handleSave() {
    const receipt = Number(draft.receiptAmount) || 0;
    const payment = Number(draft.paymentAmount) || 0;
    setSaving(true);
    try {
      await onAddVoucher({
        voucherDate: draft.voucherDate,
        voucherNumber: draft.voucherNumber || undefined,
        direction: receipt > 0 ? "Receipt" : "Payment",
        amount: receipt > 0 ? receipt : payment,
        descriptionCategory: draft.category.value,
        businessPartnerId:
          draft.category.value === "customers_suppliers"
            ? draft.partnerId?.value
            : undefined,
        description: draft.description,
        notes: draft.notes,
      });
      setDraft(emptyDraft());
      setTimeout(() => dateInputRef.current?.focus(), 0);
    } catch (err) {
    } finally {
      setSaving(false);
    }
  }

  // ==== تعديل توصيف سطر موجود بالفعل، سواء كان له توصيف قبل كده أو لأ ====
  async function handleUpdateRowDescription(voucherId, { category, party }) {
    if (!onUpdateVoucherDescription) return;

    setUpdatingRowId(voucherId);
    try {
      await onUpdateVoucherDescription(voucherId, {
        descriptionCategory: category.value,
        businessPartnerId:
          category.value === "customers_suppliers" ? party?.value : null,
      });
      toast.success("تم تحديث التوصيف");
    } catch (err) {
    } finally {
      setUpdatingRowId(null);
      setEditingRowId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 rounded-lg bg-ink-400/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-14 border border-dashed border-negative/25 bg-negative/[0.02] rounded-2xl">
        <AlertCircle
          size={34}
          className="mx-auto text-negative/70 mb-3"
          strokeWidth={1.6}
        />
        <p className="text-ink-900 font-medium mb-1">
          حدث خطأ في تحميل حركة الخزنة
        </p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors mt-2"
        >
          <RefreshCw size={15} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const vouchers = data?.items || [];

  const sorted = [...vouchers].sort((a, b) =>
    a.voucherDate.localeCompare(b.voucherDate),
  );
  let running = 0;
  const rows = sorted.map((v) => {
    const debit = v.direction === "Receipt" ? v.amount : 0;
    const credit = v.direction === "Payment" ? v.amount : 0;
    running += debit - credit;

    const categoryLabel =
      descriptionCategories.find((c) => c.value === v.descriptionCategory)
        ?.label || null;
    const descriptionDisplay =
      v.descriptionCategory === "customers_suppliers" && v.businessPartnerName
        ? `${categoryLabel} - ${v.businessPartnerName}`
        : categoryLabel;

    return { ...v, debit, credit, balance: running, descriptionDisplay };
  });

  const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0);
  const showEmptyState = !isFetching && rows.length === 0 && !isAdding;

  return (
    <div
      className={`overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${isFetching ? "opacity-60" : ""}`}
    >
      <table className="w-full text-right border-collapse min-w-[1150px]">
        <thead>
          <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              رقم السند
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              التاريخ
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              التوصيف
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5 text-positive">
              وارد
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5 text-negative">
              صادر
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              الرصيد
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              البيان
            </th>
            <th className="p-2.5 font-medium border-l border-ink-400/5">
              ملاحظات
            </th>
            <th className="p-2.5 font-medium w-10"></th>
          </tr>
        </thead>
        <tbody>
          {showEmptyState && (
            <tr>
              <td colSpan={9} className="py-16">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-ink-400/5 flex items-center justify-center mx-auto mb-3">
                    <FileSearch
                      size={26}
                      className="text-ink-400/50"
                      strokeWidth={1.6}
                    />
                  </div>
                  <p className="text-ink-900 font-medium mb-1">
                    لا توجد حركات مسجلة
                  </p>
                  <p className="text-sm text-ink-400">ابدأ بتسجيل أول سند</p>
                </div>
              </td>
            </tr>
          )}

          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-ink-400/5 last:border-0 hover:bg-ink-900/[0.01] transition-colors"
            >
              <td className="p-2.5 num font-medium text-ink-900 border-l border-ink-400/5">
                {row.voucherNumber}
              </td>
              <td className="p-2.5 num text-ink-600 border-l border-ink-400/5">
                {row.voucherDate}
              </td>

              {/* التوصيف - قابل للتعديل في أي وقت، اتوصف قبل كده أو لأ */}
              <td className="p-2.5 border-l border-ink-400/5">
                <button
                  type="button"
                  onClick={() => setEditingRowId(row.id)}
                  disabled={updatingRowId === row.id}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs transition-colors ${
                    row.descriptionDisplay
                      ? "bg-ink-900/[0.04] text-ink-700 hover:bg-ink-900/[0.08]"
                      : "bg-gold-50 text-gold-700 hover:bg-gold-100"
                  } disabled:opacity-50`}
                >
                  {updatingRowId === row.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : null}
                  {row.descriptionDisplay || "بدون توصيف — دوس للإضافة"}
                </button>
              </td>

              <td className="p-2.5 num text-positive border-l border-ink-400/5">
                {row.debit > 0 ? row.debit.toLocaleString("ar-EG") : "—"}
              </td>
              <td className="p-2.5 num text-negative border-l border-ink-400/5">
                {row.credit > 0 ? row.credit.toLocaleString("ar-EG") : "—"}
              </td>
              <td
                className={`p-2.5 num font-semibold border-l border-ink-400/5 ${row.balance >= 0 ? "text-ink-900" : "text-negative"}`}
              >
                {row.balance.toLocaleString("ar-EG")}
              </td>
              <td
                className="p-2.5 text-ink-700 border-l border-ink-400/5 max-w-[200px] truncate"
                title={row.description}
              >
                {row.description}
              </td>
              <td
                className="p-2.5 text-ink-400 text-xs max-w-[160px] truncate border-l border-ink-400/5"
                title={row.notes}
              >
                {row.notes || "—"}
              </td>
              <td className="p-2.5"></td>
            </tr>
          ))}

          {isAdding && (
            <tr className="bg-primary-50/30 border-b border-ink-400/10">
              <td className="p-1.5 border-l border-ink-400/5">
                <input
                  type="text"
                  placeholder="تلقائي"
                  value={draft.voucherNumber}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, voucherNumber: e.target.value }))
                  }
                  className="w-full text-xs bg-white border border-ink-400/15 rounded-lg px-2 py-1.5 num"
                />
              </td>
              <td className="p-1.5 border-l border-ink-400/5">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={draft.voucherDate}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, voucherDate: e.target.value }))
                  }
                  className="w-full text-xs bg-white border border-ink-400/15 rounded-lg px-2 py-1.5 num"
                />
              </td>
              <td className="p-1.5 border-l border-ink-400/5 min-w-[170px]">
                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="w-full text-right text-xs border border-ink-400/15 rounded-lg px-2.5 py-1.5 bg-white text-ink-900 hover:border-primary-300 transition-colors"
                >
                  {draft.category
                    ? draft.category.value === "customers_suppliers"
                      ? draft.partnerId
                        ? `${draft.category.label} - ${draft.partnerId.label}`
                        : draft.category.label
                      : draft.category.label
                    : "اختر التوصيف"}
                </button>
              </td>
              <td className="p-1.5 border-l border-ink-400/5">
                <input
                  type="number"
                  placeholder="وارد"
                  value={draft.receiptAmount}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      receiptAmount: e.target.value,
                      paymentAmount: "",
                    }))
                  }
                  className="w-full text-xs bg-white border border-ink-400/15 rounded-lg px-2 py-1.5 num"
                />
              </td>
              <td className="p-1.5 border-l border-ink-400/5">
                <input
                  type="number"
                  placeholder="صادر"
                  value={draft.paymentAmount}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      paymentAmount: e.target.value,
                      receiptAmount: "",
                    }))
                  }
                  className="w-full text-xs bg-white border border-ink-400/15 rounded-lg px-2 py-1.5 num"
                />
              </td>
              <td className="p-1.5 border-l border-ink-400/5 text-ink-300 text-xs text-center">
                —
              </td>
              <td className="p-1.5 border-l border-ink-400/5">
                <input
                  type="text"
                  placeholder="البيان"
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, description: e.target.value }))
                  }
                  className="w-full text-xs bg-white border border-ink-400/15 rounded-lg px-2 py-1.5"
                />
              </td>
              <td className="p-1.5 border-l border-ink-400/5">
                <input
                  type="text"
                  placeholder="ملاحظات"
                  value={draft.notes}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, notes: e.target.value }))
                  }
                  className="w-full text-xs bg-white border border-ink-400/15 rounded-lg px-2 py-1.5"
                />
              </td>
              <td className="p-1.5">
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-positive/15 text-positive hover:bg-positive/25 transition-colors disabled:opacity-50"
                    title="حفظ"
                  >
                    {saving ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Check size={13} />
                    )}
                  </button>
                  <button
                    onClick={closeAddRow}
                    disabled={saving}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-ink-900/[0.05] text-ink-400 hover:bg-ink-900/10 transition-colors disabled:opacity-50"
                    title="إلغاء"
                  >
                    <X size={13} />
                  </button>
                </div>
              </td>
            </tr>
          )}

          {!isAdding && (
            <tr>
              <td colSpan={9} className="p-0">
                <button
                  onClick={openAddRow}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-ink-400 hover:text-primary-500 hover:bg-primary-50/40 transition-colors border-t border-dashed border-ink-400/10"
                >
                  <Plus size={14} />
                  إضافة حركة جديدة
                </button>
              </td>
            </tr>
          )}
        </tbody>

        {rows.length > 0 && (
          <tfoot>
            <tr className="bg-primary-50/50 border-t-2 border-primary-100 font-semibold text-ink-900">
              <td className="p-2.5" colSpan={3}>
                الإجمالي
              </td>
              <td className="p-2.5 num text-positive">
                {totalDebit.toLocaleString("ar-EG")}
              </td>
              <td className="p-2.5 num text-negative">
                {totalCredit.toLocaleString("ar-EG")}
              </td>
              <td className="p-2.5 num">{running.toLocaleString("ar-EG")}</td>
              <td className="p-2.5" colSpan={3}></td>
            </tr>
          </tfoot>
        )}
      </table>

      {/* الماودال بتاع اختيار توصيف السطر الجديد (isAdding) */}
      <DescriptionPickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onConfirm={({ category, party }) =>
          setDraft((d) => ({ ...d, category, partnerId: party }))
        }
        partyOptions={partyOptions}
      />

      {/* الماودال بتاع تعديل توصيف سطر موجود - أي سطر، في أي وقت */}
      <DescriptionPickerModal
        isOpen={editingRowId !== null}
        onClose={() => setEditingRowId(null)}
        onConfirm={({ category, party }) =>
          handleUpdateRowDescription(editingRowId, { category, party })
        }
        partyOptions={partyOptions}
      />

      {totalCount > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
