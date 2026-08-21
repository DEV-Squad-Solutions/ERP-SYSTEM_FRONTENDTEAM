import { useMemo, useState } from "react";
import {
  FileSearch,
  AlertCircle,
  RefreshCw,
  Plus,
  Receipt,
  Check,
  X,
  Loader2,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import CashVoucherEditModal from "./CashVoucherEditModal";
import ExpenseQuickEntryModal from "./ExpenseQuickEntryModal";
import Pagination from "../../../shared/components/ui/Pagination";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import { useGetCashMovementTypeOptionsQuery } from "../cashMovementTypesApi";
import { selectIsAdmin } from "../../auth/authSlice";

const fmt = (number) =>
  Number(number ?? 0).toLocaleString("ar-EG", {
    maximumFractionDigits: 2,
  });

function emptyDraft() {
  return {
    voucherDate: new Date().toISOString().slice(0, 10),
    description: "",
    receiptAmount: "",
    paymentAmount: "",
    notes: "",
  };
}

/**
 * يبني مجموعات التوصيف.
 *
 * Partner:
 *   العملاء والموردين
 *
 * Revenue:
 *   أنواع الإيرادات
 *
 * Expense:
 *   أنواع المصروفات
 *
 * Driver:
 *   السائقين
 *
 * Employee:
 *   الموظفين
 *
 * كل option يحمل metadata داخليًا.
 */
function buildDescriptionGroups({
  partyOptions,
  driverOptions,
  employeeOptions,
  revenueTypes,
  expenseTypes,
  currentVoucher,
}) {
  const currentMovementTypeId = currentVoucher?.cashMovementTypeId
    ? String(currentVoucher.cashMovementTypeId)
    : "";

  const currentPartyType = currentVoucher?.partyType || "None";

  const groups = [];

  // =========================================================
  // Customers / Suppliers
  // =========================================================

  if (partyOptions.length) {
    groups.push({
      label: "عملاء وموردين",
      options: partyOptions.map((party) => ({
        value: `partner:${party.id}`,
        label: party.name,
        meta: {
          type: "Partner",
          businessPartnerId: String(party.id),
          movementTypeId:
            currentPartyType === "Partner" ? currentMovementTypeId : "",
          classification: "PartnerSettlement",
          partyType: "Partner",
        },
      })),
    });
  }

  // =========================================================
  // Revenue
  // =========================================================

  if (revenueTypes.length) {
    groups.push({
      label: "إيرادات",
      options: revenueTypes.map((type) => ({
        value: `revenue:${type.id}`,
        label: type.name,
        meta: {
          type: "MovementType",
          movementTypeId: String(type.id),
          classification: "Revenue",
          partyType: "None",
          businessPartnerId: null,
          driverId: null,
          employeeId: null,
        },
      })),
    });
  }

  // =========================================================
  // Expenses
  // =========================================================

  if (expenseTypes.length) {
    groups.push({
      label: "مصاريف",
      options: expenseTypes.map((type) => ({
        value: `expense:${type.id}`,
        label: type.name,
        meta: {
          type: "MovementType",
          movementTypeId: String(type.id),
          classification: "Expense",
          partyType: "None",
          businessPartnerId: null,
          driverId: null,
          employeeId: null,
        },
      })),
    });
  }

  // =========================================================
  // Drivers
  // =========================================================

  if (driverOptions.length) {
    groups.push({
      label: "سائقين",
      options: driverOptions.map((driver) => ({
        value: `driver:${driver.id}`,
        label: driver.name,
        meta: {
          type: "Driver",
          driverId: String(driver.id),
          movementTypeId:
            currentPartyType === "Driver" ? currentMovementTypeId : "",
          classification: "Other",
          partyType: "Driver",
        },
      })),
    });
  }

  // =========================================================
  // Salaries
  // =========================================================

  if (employeeOptions.length) {
    groups.push({
      label: "رواتب وأجور",
      options: employeeOptions.map((employee) => ({
        value: `salary:${employee.id}`,
        label: employee.name,
        meta: {
          type: "Employee",
          employeeId: String(employee.id),
          movementTypeId:
            currentPartyType === "Employee" ? currentMovementTypeId : "",
          classification: "Other",
          partyType: "Employee",
        },
      })),
    });
  }

  // =========================================================
  // Advances
  // =========================================================

  if (employeeOptions.length) {
    groups.push({
      label: "سلف",
      options: employeeOptions.map((employee) => ({
        value: `advance:${employee.id}`,
        label: employee.name,
        meta: {
          type: "Employee",
          employeeId: String(employee.id),
          movementTypeId:
            currentPartyType === "Employee" ? currentMovementTypeId : "",
          classification: "Other",
          partyType: "Employee",
        },
      })),
    });
  }

  return groups;
}

function getCurrentDescriptionValue(row) {
  if (!row) {
    return "";
  }

  if (row.partyType === "Partner" && row.businessPartnerId) {
    return `partner:${row.businessPartnerId}`;
  }

  if (row.partyType === "Driver" && row.driverId) {
    return `driver:${row.driverId}`;
  }

  if (row.partyType === "Employee" && row.employeeId) {
    return `salary:${row.employeeId}`;
  }

  if (row.cashMovementTypeId) {
    if (row.cashMovementTypeClassification === "Revenue") {
      return `revenue:${row.cashMovementTypeId}`;
    }

    if (row.cashMovementTypeClassification === "Expense") {
      return `expense:${row.cashMovementTypeId}`;
    }
  }

  return "";
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
  employeeOptions = [],
  onAddVoucher,
  onUpdateVoucher,
  onDeleteVoucher,
  page = 1,
  pageSize = 20,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
}) {
  const isAdmin = useSelector(selectIsAdmin);

  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());

  const [editingRow, setEditingRow] = useState(null);
  const [updatingRowId, setUpdatingRowId] = useState(null);
  const [deletingRowId, setDeletingRowId] = useState(null);
  const [descriptionUpdatingId, setDescriptionUpdatingId] = useState(null);

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("asc");

  const vouchers = data?.items || [];

  // =========================================================
  // Movement Types
  // =========================================================

  const { data: revenueTypes = [], isFetching: loadingRevenue } =
    useGetCashMovementTypeOptionsQuery({
      direction: undefined,
      classification: "Revenue",
      forPartner: false,
    });

  const { data: expenseTypes = [], isFetching: loadingExpense } =
    useGetCashMovementTypeOptionsQuery({
      direction: undefined,
      classification: "Expense",
      forPartner: false,
    });

  // =========================================================
  // Currency
  // =========================================================

  const currency = cashboxCurrency || vouchers[0]?.currency || "EGP";

  const baseCurrency =
    cashboxBaseCurrency || vouchers[0]?.baseCurrency || "EGP";

  const isForeign = currency !== baseCurrency;

  // =========================================================
  // Opening balances
  // =========================================================

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

  // =========================================================
  // Description Groups
  // =========================================================

  const getDescriptionGroups = (row) =>
    buildDescriptionGroups({
      partyOptions,
      driverOptions,
      employeeOptions,
      revenueTypes,
      expenseTypes,
      currentVoucher: row,
    });

  // =========================================================
  // Inline description change
  //
  // لا يوجد أي تأكيد أو Business Validation هنا.
  // نرسل مباشرة للـ backend وننتظر النتيجة.
  // =========================================================

  async function handleDescriptionChange(row, selectedValue) {
    if (!selectedValue) {
      return;
    }

    const groups = getDescriptionGroups(row);

    const selectedOption = groups
      .flatMap((group) => group.options)
      .find((option) => option.value === selectedValue);

    if (!selectedOption) {
      return;
    }

    const meta = selectedOption.meta || {};

    const payload = {
      id: row.id,
      cashboxId,
      rowVersion: row.rowVersion,

      voucherDate: row.voucherDate,
      direction: row.direction,
      amount: Number(row.amount),

      cashMovementTypeId: meta.movementTypeId || row.cashMovementTypeId || null,

      partyType: meta.partyType || "None",

      businessPartnerId: meta.businessPartnerId || null,

      driverId: meta.driverId || null,

      driverTripId: meta.type === "Driver" ? row.driverTripId || null : null,

      employeeId: meta.employeeId || null,

      externalPartyName: row.externalPartyName || null,

      description: row.description || undefined,

      notes: row.notes || undefined,

      referenceNumber: row.referenceNumber || undefined,
    };

    if (isForeign) {
      payload.exchangeRate = Number(row.exchangeRate ?? row.rate ?? 1);
    }

    setDescriptionUpdatingId(row.id);

    try {
      await onUpdateVoucher(payload);

      toast.success("تم تحديث توصيف الحركة بنجاح");
    } catch (error) {
      const code = error?.data?.errorCode;

      if (code === "CashVouchers.Concurrency") {
        toast.error("السند تم تعديله من مستخدم آخر. أعد تحميل البيانات.");
      } else if (code === "CashVouchers.InvoiceGeneratedReadOnly") {
        toast.error("هذا السند مولد من فاتورة ولا يمكن تعديله من هنا.");
      } else {
        toast.error(
          error?.data?.detail ||
            error?.data?.title ||
            error?.error ||
            "تعذر تحديث توصيف الحركة",
        );
      }
    } finally {
      setDescriptionUpdatingId(null);
    }
  }

  // =========================================================
  // Add
  // =========================================================

  function openAddRow() {
    setDraft(emptyDraft());
    setIsAdding(true);
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

      toast.success("تم تسجيل الحركة كمسودة");

      setDraft(emptyDraft());
    } catch (error) {
      toast.error(
        error?.data?.detail ||
          error?.data?.title ||
          error?.error ||
          "حدث خطأ أثناء حفظ الحركة",
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // Full Edit
  //
  // لا يوجد confirm.
  // لا يوجد validation business من الفرونت.
  // onUpdateVoucher هو المسؤول عن تنفيذ الطلب.
  // =========================================================

  async function handleFullEdit(payload) {
    if (!editingRow) {
      return;
    }

    setUpdatingRowId(editingRow.id);

    try {
      await onUpdateVoucher({
        id: editingRow.id,
        cashboxId,
        rowVersion: editingRow.rowVersion,
        ...payload,
      });

      toast.success("تم تحديث السند بنجاح");

      setEditingRow(null);
    } catch (error) {
      const code = error?.data?.errorCode;

      if (code === "CashVouchers.Concurrency") {
        toast.error(
          "السند تم تعديله من مستخدم آخر. أعد تحميل البيانات ثم حاول مرة أخرى.",
        );
      } else if (code === "CashVouchers.InvoiceGeneratedReadOnly") {
        toast.error("هذا السند مولد من فاتورة ولا يمكن تعديله من هنا.");
      } else {
        toast.error(
          error?.data?.detail ||
            error?.data?.title ||
            error?.error ||
            "تعذر تحديث السند",
        );
      }
    } finally {
      setUpdatingRowId(null);
    }
  }

  // =========================================================
  // Delete
  // =========================================================

  function handleDeleteVoucher(row) {
    if (!isAdmin) {
      toast.error("ليس لديك صلاحية حذف السند");
      return;
    }

    if (!onDeleteVoucher) {
      toast.error("خدمة حذف السند غير متاحة");
      return;
    }

    if (row.invoiceId) {
      toast.error("السند المولد من فاتورة لا يمكن حذفه من هنا.");
      return;
    }

    toast.warning(`هل أنت متأكد من حذف السند رقم ${row.voucherNumber}؟`, {
      duration: 8000,

      action: {
        label: "حذف",
        onClick: () => executeDeleteVoucher(row),
      },

      cancel: {
        label: "إلغاء",
      },
    });
  }

  async function executeDeleteVoucher(row) {
    if (!row || deletingRowId) {
      return;
    }

    setDeletingRowId(row.id);

    try {
      await onDeleteVoucher({
        id: row.id,
        rowVersion: row.rowVersion,
      });

      toast.success("تم حذف السند بنجاح");

      if (editingRow && String(editingRow.id) === String(row.id)) {
        setEditingRow(null);
      }

      refetch?.();
    } catch (error) {
      toast.error(
        error?.data?.detail ||
          error?.data?.title ||
          error?.error ||
          "تعذر حذف السند",
      );
    } finally {
      setDeletingRowId(null);
    }
  }

  // =========================================================
  // Sorting
  // =========================================================

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortIcon({ active, dir }) {
    if (!active) {
      return <ArrowUpDown size={11} className="text-ink-300" />;
    }

    return dir === "asc" ? (
      <ChevronUp size={11} className="text-primary-600" />
    ) : (
      <ChevronDown size={11} className="text-primary-600" />
    );
  }

  // =========================================================
  // Loading
  // =========================================================

  if (isLoading) {
    return (
      <div className="space-y-1">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="h-9 animate-pulse rounded-lg bg-ink-400/5"
          />
        ))}
      </div>
    );
  }

  // =========================================================
  // Error
  // =========================================================

  if (isError) {
    return (
      <div className="rounded-2xl border border-dashed border-negative/25 bg-negative/[0.02] py-12 text-center">
        <AlertCircle
          size={30}
          className="mx-auto mb-3 text-negative/70"
          strokeWidth={1.6}
        />

        <p className="mb-1 text-sm font-medium text-ink-900">
          حدث خطأ في تحميل حركة الخزنة
        </p>

        <button
          type="button"
          onClick={refetch}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-500 transition-colors hover:bg-primary-100"
        >
          <RefreshCw size={13} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // =========================================================
  // Chronological
  // =========================================================

  const chronological = [...vouchers].sort((a, b) => {
    const dateCompare = String(a.voucherDate || "").localeCompare(
      String(b.voucherDate || ""),
    );

    if (dateCompare !== 0) {
      return dateCompare;
    }

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

  const rows = chronological.map((voucher) => {
    const amount = Number(voucher.amount) || 0;

    const exchangeRate = Number(voucher.exchangeRate ?? voucher.rate ?? 1) || 1;

    const baseAmount = Number(voucher.baseAmount ?? amount * exchangeRate);

    const debit = voucher.direction === "Receipt" ? amount : 0;

    const credit = voucher.direction === "Payment" ? amount : 0;

    const baseDebit = voucher.direction === "Receipt" ? baseAmount : 0;

    const baseCredit = voucher.direction === "Payment" ? baseAmount : 0;

    running += debit - credit;

    baseRunning += baseDebit - baseCredit;

    const isDescribed = Boolean(voucher.cashMovementTypeId);

    const isDraft =
      typeof voucher.isDraft === "boolean" ? voucher.isDraft : !isDescribed;

    return {
      ...voucher,
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
    };
  });

  const totalDebit = rows.reduce((sum, row) => sum + row.debit, 0);

  const totalCredit = rows.reduce((sum, row) => sum + row.credit, 0);

  const totalBaseDebit = rows.reduce((sum, row) => sum + row.baseDebit, 0);

  const totalBaseCredit = rows.reduce((sum, row) => sum + row.baseCredit, 0);

  // =========================================================
  // Display sort
  // =========================================================

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
      {/* ===================================================== */}
      {/* Foreign currency */}
      {/* ===================================================== */}

      {isForeign && (
        <div className="mb-2 rounded-xl border border-primary-100 bg-primary-50/50 px-3 py-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-medium text-primary-600">
            <span>
              خزنة <strong>{currency}</strong>
            </span>

            <span>
              المقابل <strong>{baseCurrency}</strong>
            </span>

            <span>لكل حركة سعر صرف مستقل</span>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* Actions */}
      {/* ===================================================== */}

      {!isAdding && (
        <div className="mb-2 flex gap-2">
          <button
            type="button"
            onClick={openAddRow}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink-400/15 py-2 text-[11px] text-ink-400 transition hover:bg-primary-50/40 hover:text-primary-500"
          >
            <Plus size={13} />
            إضافة حركة
          </button>

          <button
            type="button"
            onClick={() => setExpenseModalOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-red-300/40 px-3 py-2 text-[11px] text-red-500 transition hover:bg-red-50/40"
          >
            <Receipt size={13} />
            تسجيل مصروف
          </button>
        </div>
      )}

      {/* ===================================================== */}
      {/* Table */}
      {/* ===================================================== */}

      <div
        className={`overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${
          isFetching ? "opacity-60" : ""
        }`}
      >
        <div className="overflow-x-auto">
          <table
            className="w-full min-w-[900px] border-collapse text-right"
            dir="rtl"
          >
            <colgroup>
              <col className="w-[13%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />

              {isForeign && <col className="w-[8%]" />}

              <col className="w-[27%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
            </colgroup>

            <thead>
              <tr className="bg-ink-900/[0.03] text-[10px] text-ink-400">
                <th className="border-l border-ink-400/5 px-2 py-2 font-medium">
                  الرصيد
                </th>

                <th className="border-l border-ink-400/5 px-2 py-2 font-medium text-negative">
                  صادر {isForeign && `(${currency})`}
                </th>

                <th className="border-l border-ink-400/5 px-2 py-2 font-medium text-positive">
                  وارد {isForeign && `(${currency})`}
                </th>

                {isForeign && (
                  <th className="border-l border-ink-400/5 px-2 py-2 font-medium">
                    سعر الصرف
                  </th>
                )}

                <th className="border-l border-ink-400/5 px-2 py-2 font-medium">
                  التوصيف
                </th>

                <th className="border-l border-ink-400/5 px-2 py-2 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("date")}
                    className="inline-flex items-center gap-1 hover:text-ink-700"
                  >
                    التاريخ
                    <SortIcon active={sortKey === "date"} dir={sortDir} />
                  </button>
                </th>

                <th className="px-2 py-2 font-medium">
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
              {/* ================================================= */}
              {/* Empty */}
              {/* ================================================= */}

              {showEmptyState && (
                <tr>
                  <td colSpan={isForeign ? 7 : 6} className="py-12">
                    <div className="text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-ink-400/5">
                        <FileSearch size={23} className="text-ink-400/50" />
                      </div>

                      <p className="mb-1 text-sm font-medium text-ink-900">
                        لا توجد حركات
                      </p>

                      <p className="text-[11px] text-ink-400">
                        ابدأ بتسجيل أول سند
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {/* ================================================= */}
              {/* Add row */}
              {/* ================================================= */}

              {isAdding && (
                <tr className="border-b border-ink-400/10 bg-primary-50/30 align-top">
                  <td className="p-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-positive/15 text-positive hover:bg-positive/25 disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Check size={12} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={closeAddRow}
                        disabled={saving}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-ink-900/[0.05] text-ink-400 hover:bg-ink-900/10"
                      >
                        <X size={12} />
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
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          paymentAmount: event.target.value,
                          receiptAmount: "",
                        }))
                      }
                      className="num w-full rounded-md border border-ink-400/15 bg-white px-2 py-1.5 text-[11px]"
                    />
                  </td>

                  <td className="border-l border-ink-400/5 p-1.5">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="وارد"
                      value={draft.receiptAmount}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          receiptAmount: event.target.value,
                          paymentAmount: "",
                        }))
                      }
                      className="num w-full rounded-md border border-ink-400/15 bg-white px-2 py-1.5 text-[11px]"
                    />
                  </td>

                  {isForeign && (
                    <td className="border-l border-ink-400/5 p-1.5 text-center text-[10px] text-ink-300">
                      عند التعديل
                    </td>
                  )}

                  <td className="border-l border-ink-400/5 p-1.5">
                    <input
                      type="text"
                      placeholder="يمكن توصيف الحركة بعد الحفظ"
                      value={draft.description}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      className="w-full truncate rounded-md border border-ink-400/15 bg-white px-2 py-1.5 text-[11px]"
                    />
                  </td>

                  <td className="border-l border-ink-400/5 p-1.5">
                    <input
                      type="date"
                      value={draft.voucherDate}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          voucherDate: event.target.value,
                        }))
                      }
                      className="num w-full rounded-md border border-ink-400/15 bg-white px-2 py-1.5 text-[11px]"
                    />
                  </td>

                  <td className="p-1.5 text-center text-[10px] text-gold-700">
                    مسودة
                  </td>
                </tr>
              )}

              {/* ================================================= */}
              {/* Rows */}
              {/* ================================================= */}

              {displayRows.map((row) => {
                const isUpdating = updatingRowId === row.id;

                const isDeleting = deletingRowId === row.id;

                const isDescriptionUpdating = descriptionUpdatingId === row.id;

                const isInvoiceGenerated = Boolean(row.invoiceId);

                const descriptionGroups = getDescriptionGroups(row);

                const selectedDescription = getCurrentDescriptionValue(row);

                return (
                  <tr
                    key={row.id}
                    className="group border-b border-ink-400/5 align-middle transition hover:bg-ink-900/[0.015] last:border-0"
                  >
                    {/* Balance */}

                    <td
                      className={`num border-l border-ink-400/5 px-2 py-2 text-sm font-semibold ${
                        row.balance >= 0 ? "text-ink-900" : "text-negative"
                      }`}
                    >
                      {fmt(row.balance)}

                      {isForeign && (
                        <div className="mt-0.5 truncate text-[9px] font-normal text-ink-400">
                          {fmt(row.baseBalance)} {baseCurrency}
                        </div>
                      )}
                    </td>

                    {/* Credit */}

                    <td className="num border-l border-ink-400/5 px-2 py-2 text-sm text-negative">
                      {row.credit > 0 ? fmt(row.credit) : "—"}

                      {isForeign && row.credit > 0 && (
                        <div className="mt-0.5 truncate text-[9px] text-ink-400">
                          {fmt(row.baseCredit)} {baseCurrency}
                        </div>
                      )}
                    </td>

                    {/* Debit */}

                    <td className="num border-l border-ink-400/5 px-2 py-2 text-sm text-positive">
                      {row.debit > 0 ? fmt(row.debit) : "—"}

                      {isForeign && row.debit > 0 && (
                        <div className="mt-0.5 truncate text-[9px] text-ink-400">
                          {fmt(row.baseDebit)} {baseCurrency}
                        </div>
                      )}
                    </td>

                    {/* Exchange */}

                    {isForeign && (
                      <td className="num border-l border-ink-400/5 px-2 py-2 text-[10px] text-ink-600">
                        {row.debit > 0 || row.credit > 0
                          ? fmt(row.exchangeRate)
                          : "—"}
                      </td>
                    )}

                    {/* Description */}

                    <td className="min-w-0 border-l border-ink-400/5 px-2 py-2">
                      <div className="min-w-[240px]">
                        <CompactSelect
                          options={descriptionGroups}
                          value={selectedDescription}
                          onChange={(value) =>
                            handleDescriptionChange(row, value)
                          }
                          isLoading={
                            loadingRevenue ||
                            loadingExpense ||
                            isDescriptionUpdating
                          }
                          isDisabled={
                            isDescriptionUpdating || isInvoiceGenerated
                          }
                          placeholder={
                            row.isDescribed
                              ? "تغيير الحساب / التوصيف"
                              : "اختر الحساب أو التوصيف"
                          }
                        />

                        {row.description && (
                          <div
                            className="mt-1 truncate text-right text-[9px] text-ink-400"
                            title={row.description}
                          >
                            {row.description}
                          </div>
                        )}

                        {row.externalPartyName && (
                          <div
                            className="mt-0.5 truncate text-right text-[9px] text-amber-600"
                            title={row.externalPartyName}
                          >
                            المستفيد: {row.externalPartyName}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Date */}

                    <td className="num border-l border-ink-400/5 px-2 py-2 text-[10px] text-ink-600">
                      <span className="whitespace-nowrap">
                        {row.voucherDate}
                      </span>
                    </td>

                    {/* Voucher */}

                    <td className="px-2 py-2">
                      <div className="flex min-w-0 items-start justify-between gap-1">
                        <div className="min-w-0">
                          <div className="num truncate text-[10px] font-medium text-ink-900">
                            {row.voucherNumber}
                          </div>

                          <span
                            className={`mt-0.5 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                              row.isDraft
                                ? "bg-gold-50 text-gold-700"
                                : "bg-positive/10 text-positive"
                            }`}
                          >
                            {row.isDraft ? "مسودة" : "مرحّل"}
                          </span>
                        </div>

                        {isAdmin && !isInvoiceGenerated && (
                          <button
                            type="button"
                            title="حذف السند"
                            disabled={isDeleting || isUpdating}
                            onClick={(event) => {
                              event.stopPropagation();

                              handleDeleteVoucher(row);
                            }}
                            className="shrink-0 rounded-md p-1 text-ink-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {isDeleting ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Trash2 size={12} />
                            )}
                          </button>
                        )}
                      </div>

                      {!isInvoiceGenerated && (
                        <button
                          type="button"
                          onClick={() => setEditingRow(row)}
                          className="mt-1 text-[9px] text-primary-500 hover:text-primary-700"
                        >
                          تعديل كامل
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Footer */}

            {rows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-primary-100 bg-primary-50/50 font-semibold text-ink-900">
                  <td className="num px-2 py-2 text-sm">
                    {fmt(running)}

                    {isForeign && (
                      <div className="mt-0.5 text-[9px] font-normal text-ink-400">
                        {fmt(baseRunning)} {baseCurrency}
                      </div>
                    )}
                  </td>

                  <td className="num px-2 py-2 text-sm text-negative">
                    {fmt(totalCredit)}

                    {isForeign && (
                      <div className="mt-0.5 text-[9px] font-normal text-ink-400">
                        {fmt(totalBaseCredit)} {baseCurrency}
                      </div>
                    )}
                  </td>

                  <td className="num px-2 py-2 text-sm text-positive">
                    {fmt(totalDebit)}

                    {isForeign && (
                      <div className="mt-0.5 text-[9px] font-normal text-ink-400">
                        {fmt(totalBaseDebit)} {baseCurrency}
                      </div>
                    )}
                  </td>

                  {isForeign && <td />}

                  <td className="px-2 py-2 text-[10px]" colSpan={3}>
                    الإجمالي
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* ===================================================== */}
        {/* Full edit */}
        {/* ===================================================== */}

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
          employeeOptions={employeeOptions}
        />

        {/* ===================================================== */}
        {/* Expense */}
        {/* ===================================================== */}

        <ExpenseQuickEntryModal
          isOpen={expenseModalOpen}
          onClose={() => setExpenseModalOpen(false)}
          cashboxId={cashboxId}
        />

        {/* ===================================================== */}
        {/* Pagination */}
        {/* ===================================================== */}

        {totalCount > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            label="حركة"
          />
        )}
      </div>
    </div>
  );
}
