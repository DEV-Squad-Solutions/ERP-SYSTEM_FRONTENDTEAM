import { useState, useRef, useMemo } from "react";

import {
  FileSearch,
  AlertCircle,
  RefreshCw,
  Plus,
  Check,
  X,
  Loader2,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { toast } from "sonner";

import CashVoucherEditModal from "./CashVoucherEditModal";
import Pagination from "../../../shared/components/ui/Pagination";

const fmt = (n) =>
  Number(n ?? 0).toLocaleString("ar-EG", { maximumFractionDigits: 2 });

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

function emptyDraft() {
  return {
    voucherDate: new Date().toISOString().slice(0, 10),
    description: "",
    receiptAmount: "",
    paymentAmount: "",
    notes: "",
  };
}

export default function CashboxLedgerTable({
  data,
  isLoading,
  isFetching,
  isError,
  refetch,

  cashboxId,
  cashboxCurrency,
  cashboxBaseCurrency,

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

  // ترتيب العرض — Client-side لحد ما الباك يدعم SortBy/SortDirection
  const [sortKey, setSortKey] = useState("date"); // 'date' | 'number'
  const [sortDir, setSortDir] = useState("asc"); // 'asc' | 'desc'

  const dateInputRef = useRef(null);

  const vouchers = data?.items || [];

  const currency = cashboxCurrency || vouchers[0]?.currency || "EGP";
  const baseCurrency =
    cashboxBaseCurrency || vouchers[0]?.baseCurrency || "EGP";
  const isForeign = currency !== baseCurrency;

  const openingBalance = Number(
    data?.summary?.openingBalance ??
      data?.summary?.openingCashboxBalance ??
      data?.summary?.previousBalance ??
      data?.openingBalance ??
      0,
  );

  const openingBaseBalance = Number(
    data?.summary?.openingBaseBalance ??
      data?.summary?.openingBaseCashboxBalance ??
      data?.summary?.previousBaseBalance ??
      data?.openingBaseBalance ??
      0,
  );

  /* ---------------- Add (POST Draft) ---------------- */

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

    if (receipt <= 0 && payment <= 0) {
      toast.error("أدخل قيمة وارد أو قيمة صادر");
      return;
    }

    if (receipt > 0 && payment > 0) {
      toast.error("لا يمكن إدخال وارد وصادر في نفس الحركة");
      return;
    }

    const amount = receipt > 0 ? receipt : payment;

    setSaving(true);

    try {
      await onAddVoucher({
        cashboxId,
        voucherDate: draft.voucherDate,
        direction: receipt > 0 ? "Receipt" : "Payment",
        amount,
        description: draft.description || undefined,
      });

      toast.success("تم تسجيل الحركة (مسودة) — دوس على البيان لإكمال التوصيف");

      setDraft(emptyDraft());
      setTimeout(() => dateInputRef.current?.focus(), 0);
    } catch (err) {
      toast.error(err?.data?.detail || "حدث خطأ أثناء حفظ الحركة");
    } finally {
      setSaving(false);
    }
  }

  function handleRowKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!saving) handleSave();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      if (!saving) closeAddRow();
    }
  }

  /* ---------------- Full edit ---------------- */

  async function handleFullEdit(payload) {
    if (!editingRow) return;

    setUpdatingRowId(editingRow.id);

    try {
      await onUpdateVoucher({
        id: editingRow.id,
        cashboxId,
        rowVersion: editingRow.rowVersion,
        ...payload,
      });

      toast.success("تم تحديث السند");
    } finally {
      setUpdatingRowId(null);
    }
  }

  /* ---------------- Sort toggle ---------------- */

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortIcon({ active, dir }) {
    if (!active) return <ArrowUpDown size={12} className="text-ink-300" />;
    return dir === "asc" ? (
      <ChevronUp size={12} className="text-primary-600" />
    ) : (
      <ChevronDown size={12} className="text-primary-600" />
    );
  }

  /* ---------------- Loading / Error ---------------- */

  if (isLoading) {
    return (
      <div className="space-y-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-ink-400/5" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-dashed border-negative/25 bg-negative/[0.02] py-14 text-center">
        <AlertCircle
          size={34}
          className="mx-auto mb-3 text-negative/70"
          strokeWidth={1.6}
        />
        <p className="mb-1 font-medium text-ink-900">
          حدث خطأ في تحميل حركة الخزنة
        </p>
        <button
          onClick={refetch}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-500 transition-colors hover:bg-primary-100 hover:text-primary-600"
        >
          <RefreshCw size={15} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  /* ---------------- Chronological order (ثابت لحساب الرصيد التراكمي) ---------------- */

  const chronological = [...vouchers].sort((a, b) => {
    const dateCompare = String(a.voucherDate || "").localeCompare(
      String(b.voucherDate || ""),
    );
    if (dateCompare !== 0) return dateCompare;
    return String(a.voucherNumber || "").localeCompare(
      String(b.voucherNumber || ""),
      undefined,
      {
        numeric: true,
      },
    );
  });

  let running = openingBalance;
  let baseRunning = openingBaseBalance;

  const rows = chronological.map((v) => {
    const amount = Number(v.amount) || 0;
    const exchangeRate = Number(v.exchangeRate ?? v.rate ?? 1) || 1;
    const baseAmount = Number(v.baseAmount ?? amount * exchangeRate);

    const debit = v.direction === "Receipt" ? amount : 0;
    const credit = v.direction === "Payment" ? amount : 0;
    const baseDebit = v.direction === "Receipt" ? baseAmount : 0;
    const baseCredit = v.direction === "Payment" ? baseAmount : 0;

    running += debit - credit;
    baseRunning += baseDebit - baseCredit;

    const isDescribed = Boolean(v.cashMovementTypeId);
    const isDraft = typeof v.isDraft === "boolean" ? v.isDraft : !isDescribed;

    return {
      ...v,
      amount,
      exchangeRate,
      baseAmount,
      debit,
      credit,
      baseDebit,
      baseCredit,
      balance: running,
      baseBalance: baseRunning,
      isDescribed,
      isDraft,
      descriptionDisplay: buildDescriptionDisplay(v),
    };
  });

  const totalDebit = rows.reduce((sum, row) => sum + row.debit, 0);
  const totalCredit = rows.reduce((sum, row) => sum + row.credit, 0);
  const totalBaseDebit = rows.reduce((sum, row) => sum + row.baseDebit, 0);
  const totalBaseCredit = rows.reduce((sum, row) => sum + row.baseCredit, 0);

  // ترتيب العرض بس — الرصيد المحسوب لكل صف بيفضل زي ما هو (Snapshot زمني صحيح)
  // حتى لو اتغيّر ترتيب العرض بالسند/التاريخ تنازليًا
  const displayRows = [...rows].sort((a, b) => {
    const cmp =
      sortKey === "number"
        ? String(a.voucherNumber || "").localeCompare(
            String(b.voucherNumber || ""),
            undefined,
            {
              numeric: true,
            },
          )
        : String(a.voucherDate || "").localeCompare(
            String(b.voucherDate || ""),
          );

    return sortDir === "asc" ? cmp : -cmp;
  });

  const showEmptyState = !isFetching && rows.length === 0 && !isAdding;

  return (
    <div>
      <style>{`
        @keyframes cashRowIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .cash-row-anim { animation: cashRowIn 0.18s ease-out; }
      `}</style>

      {isForeign && (
        <div className="mb-3 rounded-xl border border-primary-100 bg-primary-50/50 px-3 py-2 text-xs font-medium text-primary-600">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              خزنة بعملة <strong>{currency}</strong>
            </span>
            <span>كل مبلغ له مقابل بالمصري وسعر صرف مستقل</span>
            <span>
              العملة الأساسية: <strong>{baseCurrency}</strong>
            </span>
          </div>
        </div>
      )}

      {!isAdding && (
        <button
          onClick={openAddRow}
          className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink-400/15 py-2.5 text-xs text-ink-400 transition-colors hover:bg-primary-50/40 hover:text-primary-500"
        >
          <Plus size={14} />
          إضافة حركة جديدة
        </button>
      )}

      <div
        className={`rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${
          isFetching ? "opacity-60" : ""
        }`}
      >
        <table
          className="w-full table-fixed border-collapse text-right"
          dir="rtl"
        >
          <colgroup>
            <col className="w-[13%]" /> {/* الرصيد — أقصى اليمين */}
            <col className="w-[12%]" /> {/* صادر */}
            <col className="w-[12%]" /> {/* وارد */}
            {isForeign && <col className="w-[9%]" />} {/* سعر الصرف */}
            <col /> {/* البيان / التوصيف — الباقي */}
            <col className="w-[10%]" /> {/* التاريخ */}
            <col className="w-[10%]" /> {/* السند — أقصى الشمال */}
          </colgroup>

          <thead>
            <tr className="bg-ink-900/[0.03] text-xs text-ink-400">
              <th className="border-l border-ink-400/5 p-2.5 font-medium">
                الرصيد
              </th>

              <th className="border-l border-ink-400/5 p-2.5 font-medium text-negative">
                صادر{" "}
                {isForeign && (
                  <span className="text-[10px] text-ink-400">({currency})</span>
                )}
              </th>

              <th className="border-l border-ink-400/5 p-2.5 font-medium text-positive">
                وارد{" "}
                {isForeign && (
                  <span className="text-[10px] text-ink-400">({currency})</span>
                )}
              </th>

              {isForeign && (
                <th className="border-l border-ink-400/5 p-2.5 font-medium">
                  سعر الصرف
                </th>
              )}

              <th className="border-l border-ink-400/5 p-2.5 font-medium">
                البيان / التوصيف
              </th>

              <th className="border-l border-ink-400/5 p-2.5 font-medium">
                <button
                  type="button"
                  onClick={() => toggleSort("date")}
                  className="inline-flex items-center gap-1 hover:text-ink-700"
                >
                  التاريخ
                  <SortIcon active={sortKey === "date"} dir={sortDir} />
                </button>
              </th>

              <th className="p-2.5 font-medium">
                <button
                  type="button"
                  onClick={() => toggleSort("number")}
                  className="inline-flex items-center gap-1 hover:text-ink-700"
                >
                  السند
                  <SortIcon active={sortKey === "number"} dir={sortDir} />
                </button>
              </th>
            </tr>
          </thead>

          <tbody>
            {showEmptyState && (
              <tr>
                <td colSpan={isForeign ? 7 : 6} className="py-16">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-ink-400/5">
                      <FileSearch
                        size={26}
                        className="text-ink-400/50"
                        strokeWidth={1.6}
                      />
                    </div>
                    <p className="mb-1 font-medium text-ink-900">
                      لا توجد حركات مسجلة
                    </p>
                    <p className="text-sm text-ink-400">ابدأ بتسجيل أول سند</p>
                  </div>
                </td>
              </tr>
            )}

            {isAdding && (
              <tr className="cash-row-anim border-b border-ink-400/10 bg-primary-50/30 align-top">
                <td className="p-1.5 pt-2.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-positive/15 text-positive transition-colors hover:bg-positive/25 disabled:opacity-50"
                      title="حفظ"
                    >
                      {saving ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Check size={13} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={closeAddRow}
                      disabled={saving}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-ink-900/[0.05] text-ink-400 transition-colors hover:bg-ink-900/10 disabled:opacity-50"
                      title="إلغاء"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </td>

                <td className="border-l border-ink-400/5 p-1.5">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
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
                    className="num w-full rounded-lg border border-ink-400/15 bg-white px-2 py-1.5 text-xs"
                  />
                </td>

                <td className="border-l border-ink-400/5 p-1.5">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
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
                    className="num w-full rounded-lg border border-ink-400/15 bg-white px-2 py-1.5 text-xs"
                  />
                </td>

                {isForeign && (
                  <td className="border-l border-ink-400/5 p-1.5 pt-3 text-center text-[11px] text-ink-300">
                    عند التعديل
                  </td>
                )}

                <td className="border-l border-ink-400/5 p-1.5">
                  <input
                    type="text"
                    placeholder="البيان (اختياري) — التوصيف بعد الحفظ"
                    value={draft.description}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, description: e.target.value }))
                    }
                    onKeyDown={handleRowKeyDown}
                    className="w-full rounded-lg border border-ink-400/15 bg-white px-2 py-1.5 text-xs"
                  />
                </td>

                <td className="border-l border-ink-400/5 p-1.5">
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={draft.voucherDate}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, voucherDate: e.target.value }))
                    }
                    onKeyDown={handleRowKeyDown}
                    className="num w-full rounded-lg border border-ink-400/15 bg-white px-2 py-1.5 text-xs"
                  />
                </td>

                <td className="p-1.5 pt-3 text-center text-[11px] text-gold-700">
                  مسودة
                </td>
              </tr>
            )}

            {displayRows.map((row) => {
              const isUpdating = updatingRowId === row.id;

              return (
                <tr
                  key={row.id}
                  className="border-b border-ink-400/5 align-top transition-colors last:border-0 hover:bg-ink-900/[0.01]"
                >
                  {/* الرصيد */}
                  <td
                    className={`num border-l border-ink-400/5 p-2.5 font-semibold ${
                      row.balance >= 0 ? "text-ink-900" : "text-negative"
                    }`}
                  >
                    {fmt(row.balance)}
                    {isForeign && (
                      <div className="mt-0.5 text-[11px] font-normal text-ink-400">
                        {fmt(row.baseBalance)} {baseCurrency}
                      </div>
                    )}
                  </td>

                  {/* صادر */}
                  <td className="num border-l border-ink-400/5 p-2.5 text-negative">
                    {row.credit > 0 ? fmt(row.credit) : "—"}
                    {isForeign && row.credit > 0 && (
                      <div className="mt-0.5 text-[11px] text-ink-400">
                        {fmt(row.baseCredit)} {baseCurrency}
                      </div>
                    )}
                  </td>

                  {/* وارد */}
                  <td className="num border-l border-ink-400/5 p-2.5 text-positive">
                    {row.debit > 0 ? fmt(row.debit) : "—"}
                    {isForeign && row.debit > 0 && (
                      <div className="mt-0.5 text-[11px] text-ink-400">
                        {fmt(row.baseDebit)} {baseCurrency}
                      </div>
                    )}
                  </td>

                  {/* سعر الصرف — عمود مستقل */}
                  {isForeign && (
                    <td className="num border-l border-ink-400/5 p-2.5 text-xs text-ink-600">
                      {row.debit > 0 || row.credit > 0
                        ? fmt(row.exchangeRate)
                        : "—"}
                    </td>
                  )}

                  {/* البيان + التوصيف */}
                  <td className="border-l border-ink-400/5 p-2.5">
                    <button
                      type="button"
                      onClick={() => setEditingRow(row)}
                      disabled={isUpdating}
                      className={`inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-0.5 text-xs transition-colors ${
                        row.isDescribed
                          ? "bg-ink-900/[0.04] text-ink-700 hover:bg-ink-900/[0.08]"
                          : "bg-gold-50 text-gold-700 hover:bg-gold-100"
                      } disabled:opacity-50`}
                      title="دوس لتعديل السند بالكامل"
                    >
                      {isUpdating ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : null}
                      <span className="truncate">
                        {row.descriptionDisplay || "بدون توصيف — دوس للتعديل"}
                      </span>
                    </button>

                    {row.description && (
                      <button
                        type="button"
                        onClick={() => setEditingRow(row)}
                        className="mt-1 block w-full break-words text-right text-[11px] text-ink-400 hover:text-ink-600"
                      >
                        {row.description}
                      </button>
                    )}
                  </td>

                  {/* التاريخ */}
                  <td className="num border-l border-ink-400/5 p-2.5 text-ink-600">
                    {row.voucherDate}
                  </td>

                  {/* السند + الحالة */}
                  <td className="p-2.5">
                    <div className="num font-medium text-ink-900">
                      {row.voucherNumber}
                    </div>
                    <span
                      className={`mt-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                        row.isDraft
                          ? "bg-gold-50 text-gold-700"
                          : "bg-positive/10 text-positive"
                      }`}
                    >
                      {row.isDraft ? "مسودة" : "مرحّل"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-primary-100 bg-primary-50/50 font-semibold text-ink-900">
                <td className="num p-2.5">
                  {fmt(running)}
                  {isForeign && (
                    <div className="mt-0.5 text-[11px] font-normal text-ink-400">
                      {fmt(baseRunning)} {baseCurrency}
                    </div>
                  )}
                </td>

                <td className="num p-2.5 text-negative">
                  {fmt(totalCredit)}
                  {isForeign && (
                    <div className="mt-0.5 text-[11px] font-normal text-ink-400">
                      {fmt(totalBaseCredit)} {baseCurrency}
                    </div>
                  )}
                </td>

                <td className="num p-2.5 text-positive">
                  {fmt(totalDebit)}
                  {isForeign && (
                    <div className="mt-0.5 text-[11px] font-normal text-ink-400">
                      {fmt(totalBaseDebit)} {baseCurrency}
                    </div>
                  )}
                </td>

                {isForeign && <td className="p-2.5"></td>}

                <td className="p-2.5" colSpan={3}>
                  الإجمالي
                </td>
              </tr>
            </tfoot>
          )}
        </table>

        <CashVoucherEditModal
          isOpen={editingRow !== null}
          onClose={() => setEditingRow(null)}
          onSave={handleFullEdit}
          voucher={editingRow}
          isForeign={isForeign}
          currency={currency}
          baseCurrency={baseCurrency}
          partyOptions={partyOptions}
          driverOptions={driverOptions}
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
