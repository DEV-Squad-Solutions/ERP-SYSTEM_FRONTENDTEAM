// src/features/journalEntries/pages/JournalEntryFormPage.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CompactSelect from "../../../shared/components/ui/CompactSelect";

import { useGetFiscalYearsSelectQuery } from "../../fiscalYears/fiscalYearsApi";
import { useGetAccountJournalSelectQuery } from "../../accounts/accountsApi";

import {
  useGetJournalEntryByIdQuery,
  useCreateJournalEntryMutation,
  useUpdateJournalEntryMutation,
  JournalEntryType,
  MANUAL_ENTRY_TYPES,
} from "../journalEntriesApi";

// =========================================================
// Constants
// =========================================================

const ENTRY_TYPE_LABELS = {
  [JournalEntryType.Manual]: "يدوي",
  [JournalEntryType.Adjustment]: "تسوية",
  [JournalEntryType.Opening]: "افتتاحي",
};

const ENTRY_TYPE_OPTIONS = MANUAL_ENTRY_TYPES.map((value) => ({
  value,
  label: ENTRY_TYPE_LABELS[value] ?? value,
}));

let nextLineId = 1;

// =========================================================
// Helpers
// =========================================================

function emptyLine() {
  return {
    key: `new-${nextLineId++}`,
    accountId: null,
    description: "",
    debit: "",
    credit: "",
  };
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return value;
}

// =========================================================
// Component
// =========================================================

export default function JournalEntryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id && id !== "new");

  // =======================================================
  // Existing Entry
  // =======================================================

  const {
    data: existingEntry,
    isLoading: isLoadingEntry,
    isFetching: isFetchingEntry,
    isError: isEntryError,
    refetch: refetchEntry,
  } = useGetJournalEntryByIdQuery(id, {
    skip: !isEdit,
  });

  // =======================================================
  // Form State
  // =======================================================

  const [fiscalYearId, setFiscalYearId] = useState(null);

  const [entryDate, setEntryDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  const [description, setDescription] = useState("");

  const [entryType, setEntryType] = useState(JournalEntryType.Manual);

  const [lines, setLines] = useState([emptyLine(), emptyLine()]);

  // =======================================================
  // Fiscal Years
  // =======================================================

  const { data: fiscalYears, isLoading: isLoadingFiscalYears } =
    useGetFiscalYearsSelectQuery();

  // =======================================================
  // Accounts
  // =======================================================

  const {
    data: accountOptionsRaw,
    isLoading: isLoadingAccounts,
    isFetching: isFetchingAccounts,
  } = useGetAccountJournalSelectQuery(
    {
      fiscalYearId,
    },
    {
      skip: !fiscalYearId,
    },
  );

  // =======================================================
  // Mutations
  // =======================================================

  const [createEntry, { isLoading: isCreating }] =
    useCreateJournalEntryMutation();

  const [updateEntry, { isLoading: isUpdating }] =
    useUpdateJournalEntryMutation();

  const isSaving = isCreating || isUpdating;

  // =======================================================
  // Initialization Control
  // =======================================================

  const initializedEntryRef = useRef(null);

  const manuallyChangedFiscalYearRef = useRef(false);

  // =======================================================
  // Read Only
  // =======================================================

  const isAutomatic = existingEntry?.entryType === JournalEntryType.Automatic;

  const isReadOnly = isEdit && isAutomatic;

  // =======================================================
  // Load Existing Entry
  // =======================================================

  useEffect(() => {
    if (!existingEntry) return;

    // منع إعادة تهيئة نفس القيد أكثر من مرة
    if (initializedEntryRef.current === existingEntry.id) {
      return;
    }

    initializedEntryRef.current = existingEntry.id;

    manuallyChangedFiscalYearRef.current = false;

    setFiscalYearId(normalizeId(existingEntry.fiscalYearId));

    setEntryDate(existingEntry.entryDate?.slice(0, 10) ?? "");

    setDescription(existingEntry.description ?? "");

    setEntryType(existingEntry.entryType ?? JournalEntryType.Manual);

    const existingLines = existingEntry.lines ?? [];

    setLines(
      existingLines.length
        ? existingLines.map((line) => ({
            key: `existing-${line.id}`,
            accountId: normalizeId(line.accountId),
            description: line.description ?? "",
            debit:
              line.debit !== null && line.debit !== undefined
                ? String(line.debit)
                : "",
            credit:
              line.credit !== null && line.credit !== undefined
                ? String(line.credit)
                : "",
          }))
        : [emptyLine(), emptyLine()],
    );
  }, [existingEntry]);

  // =======================================================
  // Fiscal Year Change
  // =======================================================

  const handleFiscalYearChange = (value) => {
    const nextFiscalYearId = normalizeId(value);

    manuallyChangedFiscalYearRef.current = true;

    setFiscalYearId(nextFiscalYearId);

    // لما المستخدم يغير السنة بنفسه،
    // الحسابات القديمة قد لا تكون موجودة في السنة الجديدة.
    setLines((prev) =>
      prev.map((line) => ({
        ...line,
        accountId: null,
      })),
    );
  };

  // =======================================================
  // Options
  // =======================================================

  const fiscalYearOptions = useMemo(
    () =>
      (fiscalYears ?? []).map((fiscalYear) => ({
        value: fiscalYear.id,
        label: fiscalYear.name,
      })),
    [fiscalYears],
  );

  // =======================================================
  // Existing Account Options
  //
  // الهدف:
  // عند فتح Edit، القيد يحتوي accountId بالفعل.
  // لكن API الحسابات لسه بيجيب options.
  //
  // لذلك نضيف الحسابات الموجودة في القيد كـ fallback.
  // =======================================================

  const existingAccountOptions = useMemo(() => {
    if (!existingEntry?.lines?.length) {
      return [];
    }

    return existingEntry.lines
      .filter((line) => line?.accountId)
      .map((line) => {
        const accountId = normalizeId(line.accountId);

        const accountCode = line.accountCode ?? line.account?.code ?? "";

        const accountName = line.accountName ?? line.account?.name ?? "";

        let label = accountName || String(accountId);

        if (accountCode && accountName) {
          label = `${accountCode} · ${accountName}`;
        } else if (accountCode) {
          label = `${accountCode}`;
        }

        return {
          value: accountId,
          label,
        };
      });
  }, [existingEntry]);

  // =======================================================
  // API Account Options
  // =======================================================

  const apiAccountOptions = useMemo(
    () =>
      (accountOptionsRaw ?? []).map((account) => ({
        value: normalizeId(account.id ?? account.accountId ?? account.value),

        label:
          account.code && account.name
            ? `${account.code} · ${account.name}`
            : (account.name ??
              account.label ??
              account.code ??
              String(account.id ?? account.accountId ?? account.value ?? "")),
      })),
    [accountOptionsRaw],
  );

  // =======================================================
  // Final Account Options
  //
  // API options لها الأولوية.
  // Existing options تستخدم فقط لو الحساب مش موجود
  // في الـ API response لسه.
  // =======================================================

  const accountOptions = useMemo(() => {
    const map = new Map();

    // fallback أولًا
    existingAccountOptions.forEach((option) => {
      if (!option?.value) return;

      map.set(String(option.value), option);
    });

    // API فوقها، وبالتالي الـ API له الأولوية
    apiAccountOptions.forEach((option) => {
      if (!option?.value) return;

      map.set(String(option.value), option);
    });

    return Array.from(map.values());
  }, [existingAccountOptions, apiAccountOptions]);

  // =======================================================
  // Totals
  // =======================================================

  const totalDebit = useMemo(
    () => lines.reduce((sum, line) => sum + toNumber(line.debit), 0),
    [lines],
  );

  const totalCredit = useMemo(
    () => lines.reduce((sum, line) => sum + toNumber(line.credit), 0),
    [lines],
  );

  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  // =======================================================
  // Lines
  // =======================================================

  const updateLine = (key, patch) => {
    setLines((prev) =>
      prev.map((line) =>
        line.key === key
          ? {
              ...line,
              ...patch,
            }
          : line,
      ),
    );
  };

  // -------------------------------------------------------
  // Debit
  // -------------------------------------------------------

  const handleDebitChange = (key, value) => {
    updateLine(key, {
      debit: value,
      credit: value ? "" : undefined,
    });
  };

  // -------------------------------------------------------
  // Credit
  // -------------------------------------------------------

  const handleCreditChange = (key, value) => {
    updateLine(key, {
      credit: value,
      debit: value ? "" : undefined,
    });
  };

  // -------------------------------------------------------
  // Add
  // -------------------------------------------------------

  const addLine = () => {
    setLines((prev) => [...prev, emptyLine()]);
  };

  // -------------------------------------------------------
  // Remove
  // -------------------------------------------------------

  const removeLine = (key) => {
    setLines((prev) =>
      prev.length > 2 ? prev.filter((line) => line.key !== key) : prev,
    );
  };

  // =======================================================
  // Validation
  // =======================================================

  const canSave =
    !isReadOnly &&
    Boolean(fiscalYearId) &&
    Boolean(entryDate) &&
    Boolean(description.trim()) &&
    isBalanced &&
    lines.length >= 2 &&
    lines.every(
      (line) =>
        line.accountId &&
        (toNumber(line.debit) > 0 || toNumber(line.credit) > 0),
    );

  // =======================================================
  // Save
  // =======================================================

  const handleSave = async () => {
    if (!canSave || isSaving) {
      return;
    }

    const payload = {
      fiscalYearId,
      entryDate,
      description: description.trim(),
      entryType,

      lines: lines.map((line) => ({
        accountId: line.accountId,
        description: line.description?.trim() || undefined,
        debit: toNumber(line.debit),
        credit: toNumber(line.credit),
      })),
    };

    try {
      if (isEdit) {
        await updateEntry({
          id,
          rowVersion: existingEntry?.rowVersion,
          ...payload,
        }).unwrap();
      } else {
        await createEntry(payload).unwrap();
      }

      navigate("/dashboard/journal-entries");
    } catch (error) {
      console.error("فشل حفظ القيد", error);
    }
  };

  // =======================================================
  // Initial Loading
  // =======================================================

  if (isEdit && isLoadingEntry) {
    return (
      <div
        dir="rtl"
        className="min-h-screen w-full max-w-full overflow-x-hidden bg-gray-50 px-3 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-6"
      >
        <div className="mx-auto w-full max-w-[1600px]">
          {/* Breadcrumb Skeleton */}

          <div className="mb-4 h-3 w-48 animate-pulse rounded bg-gray-200" />

          {/* Header Skeleton */}

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="h-8 w-52 animate-pulse rounded-lg bg-gray-200" />

            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 sm:w-32" />
          </div>

          {/* Form Skeleton */}

          <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div key={index}>
                  <div className="mb-2 h-3 w-24 animate-pulse rounded bg-gray-200" />

                  <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100" />
                </div>
              ))}
            </div>
          </div>

          {/* Lines Skeleton */}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            </div>

            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-3 border-b border-gray-50 p-4 md:grid-cols-[minmax(220px,1fr)_minmax(180px,1fr)_130px_130px_40px]"
              >
                <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =======================================================
  // Entry Error
  // =======================================================

  if (isEdit && isEntryError) {
    return (
      <div
        dir="rtl"
        className="min-h-screen w-full max-w-full overflow-x-hidden bg-gray-50 px-3 py-6 sm:px-5 lg:px-8"
      >
        <div className="mx-auto flex min-h-[50vh] max-w-[600px] items-center justify-center">
          <div className="w-full rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
            <div className="mb-3 text-3xl">⚠️</div>

            <h2 className="mb-2 text-lg font-bold text-gray-900">
              تعذر تحميل القيد
            </h2>

            <p className="mb-5 text-sm leading-6 text-gray-500">
              حصلت مشكلة أثناء تحميل بيانات القيد. حاول مرة أخرى.
            </p>

            <div className="flex flex-col justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => refetchEntry()}
                className="rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-900"
              >
                إعادة المحاولة
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard/journal-entries")}
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
              >
                العودة للقيود
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =======================================================
  // Render
  // =======================================================

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full max-w-full overflow-x-hidden bg-gray-50 px-3 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-6"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        {/* =================================================
            Header
        ================================================= */}

        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">
              {isEdit ? "تعديل قيد" : "قيد يدوي جديد"}
            </h1>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              إدخال ومراجعة الحسابات المدينة والدائنة للقيد.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/dashboard/journal-entries")}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50 sm:w-auto"
            >
              إلغاء
            </button>

            <button
              type="button"
              disabled={!canSave || isSaving}
              onClick={handleSave}
              className="w-full rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-emerald-800/40 sm:w-auto"
            >
              {isSaving ? "جارِ الحفظ..." : "حفظ القيد"}
            </button>
          </div>
        </div>

        {/* =================================================
            Automatic Entry Warning
        ================================================= */}

        {isReadOnly && (
          <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
            ده قيد تلقائي مولّد من مستند أصلي. تعديله أو حذفه بيتم من المستند
            نفسه مش من هنا.
          </div>
        )}

        {/* =================================================
            Entry Header
        ================================================= */}

        <section className="mb-4 w-full rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Fiscal Year */}

            <div className="min-w-0">
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                السنة المالية
              </label>

              <CompactSelect
                value={fiscalYearId}
                onChange={handleFiscalYearChange}
                options={fiscalYearOptions}
                placeholder={
                  isLoadingFiscalYears
                    ? "جارِ تحميل السنوات..."
                    : "اختر السنة..."
                }
                isDisabled={isReadOnly || isLoadingFiscalYears}
              />
            </div>

            {/* Entry Date */}

            <div className="min-w-0">
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                تاريخ القيد
              </label>

              <input
                type="date"
                value={entryDate}
                onChange={(event) => setEntryDate(event.target.value)}
                disabled={isReadOnly}
                className="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-gray-50"
              />
            </div>

            {/* Entry Type */}

            <div className="min-w-0">
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                نوع القيد
              </label>

              <CompactSelect
                value={entryType}
                onChange={setEntryType}
                options={ENTRY_TYPE_OPTIONS}
                placeholder="اختر نوع القيد..."
                isDisabled={isReadOnly}
              />
            </div>

            {/* Description */}

            <div className="min-w-0 sm:col-span-2 xl:col-span-1">
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                البيان
              </label>

              <input
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={isReadOnly}
                placeholder="وصف القيد..."
                className="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-gray-50"
              />
            </div>
          </div>
        </section>

        {/* =================================================
            Accounts Section
        ================================================= */}

        <section className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {/* Section Header */}

          <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                تفاصيل القيد
              </h2>

              <p className="mt-0.5 text-xs text-gray-400">
                أضف الحسابات والقيم المدينة والدائنة.
              </p>
            </div>

            {/* Account Loading */}

            {fiscalYearId && (isLoadingAccounts || isFetchingAccounts) && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-700" />
                جارِ تحميل الحسابات...
              </div>
            )}
          </div>

          {/* =================================================
              Desktop / Tablet Table
          ================================================= */}

          <div className="w-full overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Table Header */}

              <div className="grid grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_130px_130px_44px] items-center gap-2 border-b border-gray-100 bg-gray-50/70 px-4 py-3 text-xs font-medium text-gray-400 sm:px-6">
                <span>الحساب</span>

                <span>البيان</span>

                <span className="text-left">مدين</span>

                <span className="text-left">دائن</span>

                <span />
              </div>

              {/* =================================================
                  Lines
              ================================================= */}

              {lines.map((line) => (
                <div
                  key={line.key}
                  className="grid grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_130px_130px_44px] items-center gap-2 border-b border-gray-50 px-4 py-2.5 transition-colors last:border-b-0 hover:bg-gray-50/50 sm:px-6"
                >
                  {/* Account */}

                  <div className="min-w-0">
                    <CompactSelect
                      value={line.accountId}
                      onChange={(value) =>
                        updateLine(line.key, {
                          accountId: normalizeId(value),
                        })
                      }
                      options={accountOptions}
                      placeholder={
                        fiscalYearId
                          ? "اختر الحساب..."
                          : "اختر السنة المالية أولاً"
                      }
                      isDisabled={isReadOnly || !fiscalYearId}
                    />
                  </div>

                  {/* Description */}

                  <div className="min-w-0">
                    <input
                      type="text"
                      value={line.description}
                      onChange={(event) =>
                        updateLine(line.key, {
                          description: event.target.value,
                        })
                      }
                      disabled={isReadOnly}
                      placeholder="بيان السطر (اختياري)"
                      className="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-gray-50"
                    />
                  </div>

                  {/* Debit */}

                  <div className="min-w-0">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={line.debit}
                      onChange={(event) =>
                        handleDebitChange(line.key, event.target.value)
                      }
                      disabled={isReadOnly}
                      placeholder="0.00"
                      className="num w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-gray-50"
                    />
                  </div>

                  {/* Credit */}

                  <div className="min-w-0">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={line.credit}
                      onChange={(event) =>
                        handleCreditChange(line.key, event.target.value)
                      }
                      disabled={isReadOnly}
                      placeholder="0.00"
                      className="num w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-gray-50"
                    />
                  </div>

                  {/* Remove */}

                  <div className="flex justify-center">
                    <button
                      type="button"
                      disabled={isReadOnly || lines.length <= 2}
                      onClick={() => removeLine(line.key)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                      title="حذف السطر"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* =================================================
              Add Line
          ================================================= */}

          {!isReadOnly && (
            <div className="border-b border-gray-50 px-4 py-3 sm:px-6">
              <button
                type="button"
                onClick={addLine}
                className="rounded-lg px-2 py-1 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
              >
                + إضافة سطر
              </button>
            </div>
          )}

          {/* =================================================
              Totals
          ================================================= */}

          <div className="grid grid-cols-2 gap-3 bg-gray-50 px-4 py-4 sm:grid-cols-[1fr_180px_180px] sm:px-6">
            <div className="col-span-2 flex items-center text-sm font-semibold text-gray-500 sm:col-span-1">
              الإجمالي
            </div>

            <div
              className={`flex items-center justify-between rounded-lg bg-white px-3 py-2 sm:block sm:text-left ${
                !isBalanced ? "text-red-600" : "text-gray-900"
              }`}
            >
              <span className="mr-2 text-xs text-gray-400 sm:hidden">مدين</span>

              <span className="num text-sm font-semibold">
                {totalDebit.toFixed(2)}
              </span>
            </div>

            <div
              className={`flex items-center justify-between rounded-lg bg-white px-3 py-2 sm:block sm:text-left ${
                !isBalanced ? "text-red-600" : "text-gray-900"
              }`}
            >
              <span className="mr-2 text-xs text-gray-400 sm:hidden">دائن</span>

              <span className="num text-sm font-semibold">
                {totalCredit.toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {/* =================================================
            Balance Warning
        ================================================= */}

        {!isBalanced && (
          <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
            <span>⚠</span>

            <span>مجموع المدين لازم يساوي مجموع الدائن قبل الحفظ.</span>
          </div>
        )}

        {/* =================================================
            Bottom Save Actions
        ================================================= */}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/dashboard/journal-entries")}
            className="w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50 sm:w-auto"
          >
            إلغاء
          </button>

          {!isReadOnly && (
            <button
              type="button"
              disabled={!canSave || isSaving}
              onClick={handleSave}
              className="w-full rounded-lg bg-emerald-800 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-emerald-800/40 sm:w-auto"
            >
              {isSaving
                ? "جارِ الحفظ..."
                : isEdit
                  ? "حفظ التعديلات"
                  : "حفظ القيد"}
            </button>
          )}
        </div>

        {/* =================================================
            Background Fetch Indicator
        ================================================= */}

        {isEdit && isFetchingEntry && !isLoadingEntry && (
          <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs text-gray-500 shadow-lg">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-700" />
              تحديث البيانات...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
