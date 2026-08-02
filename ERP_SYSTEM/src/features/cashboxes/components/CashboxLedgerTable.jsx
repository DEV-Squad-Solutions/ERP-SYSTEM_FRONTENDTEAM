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
import DescriptionPickerModal from "./DescriptionPickerModal";
import Pagination from "../../../shared/components/ui/Pagination";

function buildDescriptionDisplay(v) {
  if (!v.cashMovementTypeId) return null;
  const partyLabel =
    v.partyType === "Partner"
      ? v.businessPartnerName
      : v.partyType === "Driver"
        ? v.driverName
        : v.partyType === "Other"
          ? v.externalPartyName
          : null;
  return partyLabel
    ? `${v.cashMovementTypeName} - ${partyLabel}`
    : v.cashMovementTypeName;
}

export default function CashboxLedgerTable({
  data,
  isLoading,
  isFetching,
  isError,
  refetch,
  cashboxId, // خزنة الصفحة الحالية - بتتبعت مع كل سند
  partyOptions = [],
  driverOptions = [],
  onAddVoucher,
  onUpdateVoucher,
  page = 1,
  pageSize = 20,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());
  const [editingRow, setEditingRow] = useState(null);
  const [updatingRowId, setUpdatingRowId] = useState(null);
  const dateInputRef = useRef(null);

  // رقم السند تلقائي بالكامل من السيرفر - مفيش حقل ليه في الإضافة السريعة أصلاً
  function emptyDraft() {
    return {
      voucherDate: new Date().toISOString().slice(0, 10),
      description: "",
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

  // إضافة سريعة: مسؤول الخزنة بيكتب المبلغ (وارد أو صادر) والبيان والملاحظات بس
  // من غير توصيف - المحاسب بيوصفها بعدين من زرار "بدون توصيف" على السطر
  async function handleSave() {
    const receipt = Number(draft.receiptAmount) || 0;
    const payment = Number(draft.paymentAmount) || 0;

    if (receipt <= 0 && payment <= 0) {
      toast.error("ادخل مبلغ وارد أو صادر");
      return;
    }
    if (receipt > 0 && payment > 0) {
      toast.error("اكتب المبلغ في وارد أو صادر بس مش الاتنين مع بعض");
      return;
    }

    setSaving(true);
    try {
      await onAddVoucher({
        cashboxId,
        voucherDate: draft.voucherDate,
        direction: receipt > 0 ? "Receipt" : "Payment", // CashDirection enum name
        amount: receipt > 0 ? receipt : payment,
        description: draft.description || undefined,
        notes: draft.notes || undefined,
      });
      setDraft(emptyDraft());
      setTimeout(() => dateInputRef.current?.focus(), 0);
    } catch (err) {
      toast.error("تعذر حفظ الحركة");
    } finally {
      setSaving(false);
    }
  }

  // Enter في أي حقل بصف الإضافة = حفظ. Escape = إلغاء
  function handleRowKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!saving) handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (!saving) closeAddRow();
    }
  }

  // توصيف/تعديل سطر: cashboxId + cashMovementTypeId بيتبعتوا مع بعض عشان الـ API يقفل السند فعليًا
  async function handleUpdateRowDescription(row, c) {
    if (!onUpdateVoucher) return;
    if (!cashboxId) {
      toast.error("لازم تحدد الخزنة الأول عشان تقدر تقفل السند");
      return;
    }

    setUpdatingRowId(row.id);
    try {
      await onUpdateVoucher({
        ...row,
        id: row.id,
        direction: row.direction, // متتغيرش وقت التوصيف
        cashboxId,
        cashMovementTypeId: c.cashMovementType.value,
        partyType: c.partyType, // CashPartyType enum name: None | Partner | Driver | Other
        businessPartnerId:
          c.partyType === "Partner" ? (c.businessPartner?.value ?? null) : null,
        driverId: c.partyType === "Driver" ? (c.driver?.value ?? null) : null,
        externalPartyName:
          c.partyType === "Other" ? c.externalPartyName || null : null,
        rowVersion: row.rowVersion,
      });
      toast.success("تم تحديث التوصيف");
    } catch (err) {
      toast.error("تعذر تحديث التوصيف");
    } finally {
      setUpdatingRowId(null);
      setEditingRow(null);
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
    return {
      ...v,
      debit,
      credit,
      balance: running,
      isDescribed: Boolean(v.cashMovementTypeId),
      descriptionDisplay: buildDescriptionDisplay(v),
    };
  });

  const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0);
  const showEmptyState = !isFetching && rows.length === 0 && !isAdding;

  return (
    <div>
      <style>{`
        @keyframes cashRowIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cash-row-anim { animation: cashRowIn 0.18s ease-out; }
      `}</style>

      {!isAdding && (
        <button
          onClick={openAddRow}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-ink-400 hover:text-primary-500 hover:bg-primary-50/40 transition-colors border border-dashed border-ink-400/15 rounded-xl mb-3"
        >
          <Plus size={14} />
          إضافة حركة جديدة
        </button>
      )}

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
                البيان
              </th>
              <th className="p-2.5 font-medium border-l border-ink-400/5">
                التوصيف
              </th>
              <th className="p-2.5 font-medium border-l border-ink-400/5">
                الرصيد
              </th>
              <th className="p-2.5 font-medium border-l border-ink-400/5 text-negative">
                صادر
              </th>
              <th className="p-2.5 font-medium border-l border-ink-400/5 text-positive">
                وارد
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

            {isAdding && (
              <tr className="cash-row-anim bg-primary-50/30 border-b border-ink-400/10">
                {/* رقم السند - تلقائي، مفيش حقل إدخال */}
                <td className="p-1.5 border-l border-ink-400/5 text-ink-300 text-xs text-center">
                  تلقائي
                </td>

                <td className="p-1.5 border-l border-ink-400/5">
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={draft.voucherDate}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, voucherDate: e.target.value }))
                    }
                    onKeyDown={handleRowKeyDown}
                    className="w-full text-xs bg-white border border-ink-400/15 rounded-lg px-2 py-1.5 num"
                  />
                </td>

                <td className="p-1.5 border-l border-ink-400/5">
                  <input
                    type="text"
                    placeholder="البيان"
                    value={draft.description}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, description: e.target.value }))
                    }
                    onKeyDown={handleRowKeyDown}
                    className="w-full text-xs bg-white border border-ink-400/15 rounded-lg px-2 py-1.5"
                  />
                </td>

                {/* التوصيف مش متاح وقت الإضافة - المحاسب بياخده بعدين */}
                <td className="p-1.5 border-l border-ink-400/5 text-ink-300 text-xs text-center">
                  يتحدد بعدين
                </td>

                <td className="p-1.5 border-l border-ink-400/5 text-ink-300 text-xs text-center">
                  —
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
                    onKeyDown={handleRowKeyDown}
                    className="w-full text-xs bg-white border border-ink-400/15 rounded-lg px-2 py-1.5 num"
                  />
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
                    onKeyDown={handleRowKeyDown}
                    className="w-full text-xs bg-white border border-ink-400/15 rounded-lg px-2 py-1.5 num"
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
                    onKeyDown={handleRowKeyDown}
                    className="w-full text-xs bg-white border border-ink-400/15 rounded-lg px-2 py-1.5"
                  />
                </td>

                <td className="p-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-6 h-6 flex items-center justify-center rounded-md bg-positive/15 text-positive hover:bg-positive/25 transition-colors disabled:opacity-50"
                      title="حفظ (Enter)"
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
                      title="إلغاء (Esc)"
                    >
                      <X size={13} />
                    </button>
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
                <td
                  className="p-2.5 text-ink-700 border-l border-ink-400/5 max-w-[200px] truncate"
                  title={row.description}
                >
                  {row.description}
                </td>

                <td className="p-2.5 border-l border-ink-400/5">
                  <button
                    type="button"
                    onClick={() => setEditingRow(row)}
                    disabled={updatingRowId === row.id}
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs transition-colors ${
                      row.isDescribed
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

                <td
                  className={`p-2.5 num font-semibold border-l border-ink-400/5 ${row.balance >= 0 ? "text-ink-900" : "text-negative"}`}
                >
                  {row.balance.toLocaleString("ar-EG")}
                </td>
                <td className="p-2.5 num text-negative border-l border-ink-400/5">
                  {row.credit > 0 ? row.credit.toLocaleString("ar-EG") : "—"}
                </td>
                <td className="p-2.5 num text-positive border-l border-ink-400/5">
                  {row.debit > 0 ? row.debit.toLocaleString("ar-EG") : "—"}
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
          </tbody>

          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-primary-50/50 border-t-2 border-primary-100 font-semibold text-ink-900">
                <td className="p-2.5" colSpan={4}>
                  الإجمالي
                </td>
                <td className="p-2.5 num">{running.toLocaleString("ar-EG")}</td>
                <td className="p-2.5 num text-negative">
                  {totalCredit.toLocaleString("ar-EG")}
                </td>
                <td className="p-2.5 num text-positive">
                  {totalDebit.toLocaleString("ar-EG")}
                </td>
                <td className="p-2.5" colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>

        {/* التوصيف بقى بس لتعديل سطر موجود بالفعل (سواء متوصف أو لأ) */}
        <DescriptionPickerModal
          isOpen={editingRow !== null}
          onClose={() => setEditingRow(null)}
          onConfirm={(c) => handleUpdateRowDescription(editingRow, c)}
          partyOptions={partyOptions}
          driverOptions={driverOptions}
          initialValue={editingRow || undefined}
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
    </div>
  );
}
