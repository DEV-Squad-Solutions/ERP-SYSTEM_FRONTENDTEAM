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

const ENTRY_TYPE_LABELS = {
  [JournalEntryType.Manual]: "يدوي",
  [JournalEntryType.Adjustment]: "تسوية",
  [JournalEntryType.Opening]: "افتتاحي",
  Automatic: "تلقائي",
};

const ENTRY_TYPE_OPTIONS = MANUAL_ENTRY_TYPES.map((value) => ({
  value,
  label: ENTRY_TYPE_LABELS[value] ?? value,
}));

const STATUS_LABELS = {
  Posted: "مرحّل",
  Reversed: "معكوس",
  1: "مرحّل",
  2: "معكوس",
};

const CURRENCY_OPTIONS = [
  { value: "EGP", label: "جنيه مصري (EGP)" },
  { value: "USD", label: "دولار أمريكي (USD)" },
  { value: "EUR", label: "يورو (EUR)" },
  { value: "GBP", label: "جنيه إسترليني (GBP)" },
  { value: "SAR", label: "ريال سعودي (SAR)" },
  { value: "AED", label: "درهم إماراتي (AED)" },
  { value: "KWD", label: "دينار كويتي (KWD)" },
];

let nextLineId = 1;

function emptyLine() {
  return {
    key: `new-${nextLineId++}`,
    accountId: null,
    partyType: null,
    partyId: null,
    description: "",
    debit: "",
    credit: "",
    useForeignCurrency: false,
    currency: "USD",
    exchangeRate: "",
    transactionDebit: "",
    transactionCredit: "",
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

  const number = Number(value);

  return Number.isFinite(number) ? number : value;
}

function buildAccountOptionValue(accountId, partyType = null, partyId = null) {
  if (
    partyType &&
    partyId !== null &&
    partyId !== undefined &&
    partyId !== ""
  ) {
    return `party:${accountId}:${partyType}:${partyId}`;
  }

  return `account:${accountId}`;
}

function parseAccountOptionValue(value) {
  if (!value) {
    return {
      accountId: null,
      partyType: null,
      partyId: null,
    };
  }

  const stringValue = String(value);

  if (stringValue.startsWith("party:")) {
    const [, accountId, partyType, partyId] = stringValue.split(":");

    return {
      accountId: normalizeId(accountId),
      partyType: partyType || null,
      partyId: normalizeId(partyId),
    };
  }

  if (stringValue.startsWith("account:")) {
    const [, accountId] = stringValue.split(":");

    return {
      accountId: normalizeId(accountId),
      partyType: null,
      partyId: null,
    };
  }

  return {
    accountId: normalizeId(value),
    partyType: null,
    partyId: null,
  };
}

// المبلغ الأساسي (Debit/Credit) بيتحسب تلقائيًا من قيمة العملة الأجنبية × سعر الصرف
function computeBaseAmounts(line) {
  const rate = toNumber(line.exchangeRate);

  if (!rate) {
    return { debit: "", credit: "" };
  }

  const txDebit = toNumber(line.transactionDebit);
  const txCredit = toNumber(line.transactionCredit);

  if (txDebit > 0) {
    return { debit: (txDebit * rate).toFixed(2), credit: "" };
  }

  if (txCredit > 0) {
    return { debit: "", credit: (txCredit * rate).toFixed(2) };
  }

  return { debit: "", credit: "" };
}

export default function JournalEntryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id && id !== "new");

  const {
    data: existingEntry,
    isLoading: isLoadingEntry,
    isFetching: isFetchingEntry,
    isError: isEntryError,
    refetch: refetchEntry,
  } = useGetJournalEntryByIdQuery(id, {
    skip: !isEdit,
  });

  const [fiscalYearId, setFiscalYearId] = useState(null);

  const [entryDate, setEntryDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  const [description, setDescription] = useState("");

  const [entryType, setEntryType] = useState(JournalEntryType.Manual);

  const [lines, setLines] = useState([emptyLine(), emptyLine()]);

  const [animatingLine, setAnimatingLine] = useState(null);

  const [formError, setFormError] = useState(null);

  const { data: fiscalYears, isLoading: isLoadingFiscalYears } =
    useGetFiscalYearsSelectQuery();

  const {
    data: accountOptionsRaw,
    isLoading: isLoadingAccounts,
    isFetching: isFetchingAccounts,
  } = useGetAccountJournalSelectQuery(
    { fiscalYearId },
    {
      skip: !fiscalYearId,
    },
  );

  const [createEntry, { isLoading: isCreating }] =
    useCreateJournalEntryMutation();

  const [updateEntry, { isLoading: isUpdating }] =
    useUpdateJournalEntryMutation();

  const isSaving = isCreating || isUpdating;

  const initializedEntryRef = useRef(null);

  // القيود التلقائية بتتحدث من الحركة المصدر بس، والقيود المعكوسة قفلت خلاص
  const isAutomaticEntry =
    isEdit &&
    (existingEntry?.entryType === "Automatic" ||
      existingEntry?.entryType === 4);

  const isReversedEntry =
    isEdit &&
    (existingEntry?.status === "Reversed" || existingEntry?.status === 2);

  const isReadOnly = isAutomaticEntry || isReversedEntry;

  useEffect(() => {
    if (!existingEntry) return;

    if (initializedEntryRef.current === existingEntry.id) {
      return;
    }

    initializedEntryRef.current = existingEntry.id;

    setFiscalYearId(normalizeId(existingEntry.fiscalYearId));

    setEntryDate(existingEntry.entryDate?.slice(0, 10) ?? "");

    setDescription(existingEntry.description ?? "");

    setEntryType(existingEntry.entryType ?? JournalEntryType.Manual);

    const existingLines = existingEntry.lines ?? [];

    setLines(
      existingLines.length
        ? existingLines.map((line) => {
            const hasForeignCurrency = Boolean(
              line.currency &&
              line.currency !== existingEntry.baseCurrency &&
              (line.transactionDebit || line.transactionCredit),
            );

            return {
              key: `existing-${line.id}`,
              accountId: normalizeId(line.accountId),
              partyType: line.partyType ?? line.party?.partyType ?? null,
              partyId: normalizeId(line.partyId ?? line.party?.id),
              description: line.description ?? "",
              debit:
                line.debit !== null && line.debit !== undefined
                  ? String(line.debit)
                  : "",
              credit:
                line.credit !== null && line.credit !== undefined
                  ? String(line.credit)
                  : "",
              useForeignCurrency: hasForeignCurrency,
              currency: line.currency ?? "USD",
              exchangeRate:
                line.exchangeRate !== null && line.exchangeRate !== undefined
                  ? String(line.exchangeRate)
                  : "",
              transactionDebit:
                line.transactionDebit !== null &&
                line.transactionDebit !== undefined
                  ? String(line.transactionDebit)
                  : "",
              transactionCredit:
                line.transactionCredit !== null &&
                line.transactionCredit !== undefined
                  ? String(line.transactionCredit)
                  : "",
            };
          })
        : [emptyLine(), emptyLine()],
    );
  }, [existingEntry]);

  useEffect(() => {
    if (isEdit) return;
    if (fiscalYearId) return;
    if (!Array.isArray(fiscalYears) || !fiscalYears.length) {
      return;
    }

    const today = new Date();
    const currentYear = today.getFullYear();

    const flaggedCurrentYear = fiscalYears.find(
      (year) =>
        year?.isCurrent === true ||
        year?.current === true ||
        year?.isCurrentYear === true,
    );

    if (flaggedCurrentYear?.id) {
      setFiscalYearId(normalizeId(flaggedCurrentYear.id));
      return;
    }

    const dateMatchedYear = fiscalYears.find((year) => {
      const startDate = year?.startDate ?? year?.fromDate ?? year?.dateFrom;

      const endDate = year?.endDate ?? year?.toDate ?? year?.dateTo;

      if (!startDate || !endDate) {
        return false;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      return today >= start && today <= end;
    });

    if (dateMatchedYear?.id) {
      setFiscalYearId(normalizeId(dateMatchedYear.id));
      return;
    }

    const currentYearMatch = fiscalYears.find((year) => {
      const possibleValues = [year?.year, year?.name, year?.label, year?.code];

      return possibleValues.some((value) =>
        String(value ?? "").includes(String(currentYear)),
      );
    });

    if (currentYearMatch?.id) {
      setFiscalYearId(normalizeId(currentYearMatch.id));
      return;
    }

    const latestYear = [...fiscalYears].sort((a, b) => {
      const aValue = Number(a?.year ?? a?.name ?? a?.id ?? 0);

      const bValue = Number(b?.year ?? b?.name ?? b?.id ?? 0);

      return bValue - aValue;
    })[0];

    if (latestYear?.id) {
      setFiscalYearId(normalizeId(latestYear.id));
    }
  }, [fiscalYears, fiscalYearId, isEdit]);

  const handleFiscalYearChange = (value) => {
    const nextFiscalYearId = normalizeId(value);

    setFiscalYearId(nextFiscalYearId);

    setLines((prev) =>
      prev.map((line) => ({
        ...line,
        accountId: null,
        partyType: null,
        partyId: null,
      })),
    );
  };

  const fiscalYearOptions = useMemo(
    () =>
      (fiscalYears ?? []).map((fiscalYear) => ({
        value: fiscalYear.id,
        label:
          fiscalYear.name ??
          fiscalYear.label ??
          fiscalYear.year ??
          fiscalYear.id,
      })),
    [fiscalYears],
  );

  const existingAccountOptions = useMemo(() => {
    if (!existingEntry?.lines?.length) {
      return [];
    }

    const options = [];

    existingEntry.lines
      .filter((line) => line?.accountId)
      .forEach((line) => {
        const accountId = normalizeId(line.accountId);

        const accountName =
          line.accountName ?? line.account?.name ?? String(accountId);

        const partyId = normalizeId(line.partyId ?? line.party?.id);

        const partyType = line.partyType ?? line.party?.partyType ?? null;

        if (partyType && partyId !== null && partyId !== undefined) {
          const partyName =
            line.partyName ?? line.party?.name ?? String(partyId);

          options.push({
            value: buildAccountOptionValue(accountId, partyType, partyId),
            label: partyName,
            accountId,
            partyType,
            partyId,
          });

          return;
        }

        options.push({
          value: buildAccountOptionValue(accountId),
          label: accountName,
          accountId,
          partyType: null,
          partyId: null,
        });
      });

    return options;
  }, [existingEntry]);

  const apiAccountOptions = useMemo(() => {
    const result = [];

    const accounts = Array.isArray(accountOptionsRaw)
      ? accountOptionsRaw
      : (accountOptionsRaw?.data ?? []);

    accounts.forEach((account) => {
      const accountId = normalizeId(
        account.id ?? account.accountId ?? account.value,
      );

      if (!accountId) return;

      const accountName = account.name ?? account.label ?? String(accountId);

      const partyGroups = Array.isArray(account.partyGroups)
        ? account.partyGroups
        : [];

      if (partyGroups.length > 0) {
        const partyOptions = [];

        partyGroups.forEach((group) => {
          const partyType = group?.partyType;

          if (!partyType) return;

          const parties = Array.isArray(group?.parties) ? group.parties : [];

          parties.forEach((party) => {
            const partyId = normalizeId(party?.id);

            if (!partyId) return;

            const partyName = party?.name ?? String(partyId);

            partyOptions.push({
              value: buildAccountOptionValue(accountId, partyType, partyId),
              label: partyName,
              accountId,
              partyType,
              partyId,
            });
          });
        });

        if (partyOptions.length > 0) {
          result.push({
            label: accountName,
            options: partyOptions,
          });

          return;
        }
      }

      result.push({
        value: buildAccountOptionValue(accountId),
        label: accountName,
        accountId,
        partyType: null,
        partyId: null,
      });
    });

    return result;
  }, [accountOptionsRaw]);

  const accountOptions = useMemo(() => {
    const normalOptions = [];
    const groupedOptions = [];

    existingAccountOptions.forEach((option) => {
      if (!option?.value) return;

      normalOptions.push(option);
    });

    apiAccountOptions.forEach((option) => {
      if (Array.isArray(option?.options)) {
        groupedOptions.push(option);
      } else if (option?.value) {
        normalOptions.push(option);
      }
    });

    const normalMap = new Map();

    normalOptions.forEach((option) => {
      const key = String(option.value);

      normalMap.set(key, option);
    });

    const groupedMap = new Map();

    groupedOptions.forEach((group) => {
      const groupOptions = [];
      const seen = new Set();

      (group.options ?? []).forEach((option) => {
        const key = String(option.value);

        if (seen.has(key)) return;

        seen.add(key);
        groupOptions.push(option);
      });

      if (groupOptions.length > 0) {
        groupedMap.set(group.label, {
          ...group,
          options: groupOptions,
        });
      }
    });

    return [
      ...Array.from(groupedMap.values()),
      ...Array.from(normalMap.values()),
    ];
  }, [existingAccountOptions, apiAccountOptions]);

  const getLineSelectValue = (line) => {
    if (!line?.accountId) {
      return null;
    }

    return buildAccountOptionValue(
      line.accountId,
      line.partyType,
      line.partyId,
    );
  };

  const totalDebit = useMemo(
    () => lines.reduce((sum, line) => sum + toNumber(line.debit), 0),
    [lines],
  );

  const totalCredit = useMemo(
    () => lines.reduce((sum, line) => sum + toNumber(line.credit), 0),
    [lines],
  );

  const difference = Number((totalDebit - totalCredit).toFixed(2));

  const isBalanced = difference === 0 && totalDebit > 0;

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

  const handleAccountChange = (key, value) => {
    const parsed = parseAccountOptionValue(value);

    updateLine(key, {
      accountId: parsed.accountId,
      partyType: parsed.partyType,
      partyId: parsed.partyId,
    });
  };

  const handleDebitChange = (key, value) => {
    updateLine(key, {
      debit: value,
      credit: "",
    });
  };

  const handleCreditChange = (key, value) => {
    updateLine(key, {
      credit: value,
      debit: "",
    });
  };

  const handleToggleForeignCurrency = (key, checked) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.key !== key) return line;

        if (!checked) {
          return {
            ...line,
            useForeignCurrency: false,
            exchangeRate: "",
            transactionDebit: "",
            transactionCredit: "",
          };
        }

        return {
          ...line,
          useForeignCurrency: true,
          currency: line.currency || "USD",
          transactionDebit: line.debit || "",
          transactionCredit: line.credit || "",
        };
      }),
    );
  };

  const handleForeignFieldChange = (key, field, value) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.key !== key) return line;

        const merged = { ...line, [field]: value };

        const base = computeBaseAmounts(merged);

        return { ...merged, ...base };
      }),
    );
  };

  const addLine = () => {
    const newLine = emptyLine();

    setLines((prev) => [...prev, newLine]);

    setAnimatingLine(newLine.key);

    window.setTimeout(() => {
      setAnimatingLine(null);
    }, 450);
  };

  const removeLine = (key) => {
    if (lines.length <= 2) {
      return;
    }

    setAnimatingLine(`remove-${key}`);

    window.setTimeout(() => {
      setLines((prev) => prev.filter((line) => line.key !== key));

      setAnimatingLine(null);
    }, 180);
  };

  const buildValidationErrors = () => {
    const errors = [];

    if (!fiscalYearId) {
      errors.push("اختر السنة المالية.");
    }

    if (!entryDate) {
      errors.push("أدخل تاريخ القيد.");
    }

    const activeLines = lines.filter(
      (line) => toNumber(line.debit) > 0 || toNumber(line.credit) > 0,
    );

    if (activeLines.length < 2) {
      errors.push("أضف سطرين على الأقل بقيمة مدينة أو دائنة.");
    }

    const lineWithoutAccount = activeLines.some((line) => !line.accountId);

    if (lineWithoutAccount) {
      errors.push("اختر الحساب أو الطرف لكل سطر أدخلت له قيمة.");
    }

    const invalidForeignLine = lines.some(
      (line) =>
        line.useForeignCurrency &&
        (toNumber(line.debit) > 0 || toNumber(line.credit) > 0) &&
        (!line.currency || toNumber(line.exchangeRate) <= 0),
    );

    if (invalidForeignLine) {
      errors.push("أدخل سعر الصرف لكل سطر بعملة أجنبية.");
    }

    if (totalDebit === 0 && totalCredit === 0) {
      errors.push("أدخل قيم القيد أولًا.");
    } else if (difference !== 0) {
      errors.push(
        `إجمالي المدين لازم يساوي إجمالي الدائن (الفرق حاليًا ${Math.abs(difference).toFixed(2)}).`,
      );
    }

    return errors;
  };

  const handleSave = async () => {
    if (isSaving || isReadOnly) {
      return;
    }

    const errors = buildValidationErrors();

    if (errors.length > 0) {
      setFormError(errors[0]);
      return;
    }

    setFormError(null);

    const basePayload = {
      fiscalYearId,

      entryDate,

      description: description.trim() || undefined,

      lines: lines
        .filter((line) => toNumber(line.debit) > 0 || toNumber(line.credit) > 0)
        .map((line) => {
          const payloadLine = {
            accountId: line.accountId,

            description: line.description?.trim() || undefined,

            debit: toNumber(line.debit),

            credit: toNumber(line.credit),
          };

          if (
            line.partyType &&
            line.partyId !== null &&
            line.partyId !== undefined
          ) {
            payloadLine.partyType = line.partyType;

            payloadLine.partyId = line.partyId;
          }

          if (
            line.useForeignCurrency &&
            line.currency &&
            toNumber(line.exchangeRate) > 0
          ) {
            payloadLine.currency = line.currency;
            payloadLine.exchangeRate = toNumber(line.exchangeRate);
            payloadLine.transactionDebit = toNumber(line.transactionDebit);
            payloadLine.transactionCredit = toNumber(line.transactionCredit);
          }

          return payloadLine;
        }),
    };

    try {
      if (isEdit) {
        // ملحوظة: PUT مش بيقبل entryType — النوع بيتحدد وقت الإنشاء بس
        await updateEntry({
          id,
          rowVersion: existingEntry?.rowVersion,
          ...basePayload,
        }).unwrap();
      } else {
        await createEntry({
          ...basePayload,
          entryType,
        }).unwrap();
      }

      navigate("/dashboard/journal-entries");
    } catch (error) {
      console.error("فشل حفظ القيد", error);

      setFormError(
        error?.data?.message ||
          error?.data?.title ||
          "حصلت مشكلة أثناء حفظ القيد. تأكد من البيانات وحاول مرة أخرى.",
      );
    }
  };

  if (isEdit && isLoadingEntry) {
    return (
      <div
        dir="rtl"
        className="min-h-screen w-full overflow-x-hidden bg-slate-50 px-3 py-5 sm:px-5 lg:px-8 lg:py-7"
      >
        <div className="mx-auto w-full max-w-[1600px] animate-pulse">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="mb-3 h-7 w-52 rounded-lg bg-slate-200" />
              <div className="h-4 w-80 rounded bg-slate-100" />
            </div>

            <div className="h-10 w-32 rounded-xl bg-slate-200" />
          </div>

          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div key={index}>
                  <div className="mb-2 h-3 w-24 rounded bg-slate-200" />
                  <div className="h-10 rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <div className="h-4 w-36 rounded bg-slate-200" />
            </div>

            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-3 border-b border-slate-50 p-4 md:grid-cols-[minmax(220px,1fr)_minmax(180px,1fr)_130px_130px_44px]"
              >
                {Array.from({
                  length: 5,
                }).map((__, childIndex) => (
                  <div
                    key={childIndex}
                    className="h-10 rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isEdit && isEntryError) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4"
      >
        <div className="w-full max-w-lg animate-[fadeIn_.35s_ease-out] rounded-3xl border border-red-100 bg-white p-7 text-center shadow-xl shadow-red-100/40">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
            ⚠️
          </div>

          <h2 className="mb-2 text-xl font-bold text-slate-900">
            تعذر تحميل القيد
          </h2>

          <p className="mb-6 text-sm leading-6 text-slate-500">
            حصلت مشكلة أثناء تحميل بيانات القيد. حاول مرة أخرى.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => refetchEntry()}
              className="rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0"
            >
              إعادة المحاولة
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard/journal-entries")}
              className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
            >
              العودة للقيود
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-7"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

              <span className="text-xs font-semibold text-emerald-700">
                المحاسبة
              </span>

              {isEdit && existingEntry?.entryNumber && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                  #{existingEntry.entryNumber}
                </span>
              )}

              {isEdit && existingEntry?.status && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    isReversedEntry
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {STATUS_LABELS[existingEntry.status] ?? existingEntry.status}
                </span>
              )}

              {isAutomaticEntry && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                  تلقائي
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              {isEdit ? "تعديل القيد" : "قيد يدوي جديد"}
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              أدخل تفاصيل القيد والحسابات المرتبطة به بطريقة سريعة وواضحة.
            </p>
          </div>

          {!isReadOnly && (
            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <button
                type="button"
                onClick={() => navigate("/dashboard/journal-entries")}
                className="group w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md sm:w-auto"
              >
                إلغاء
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="group relative w-full overflow-hidden rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-xl hover:shadow-emerald-700/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSaving && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}

                  {isSaving
                    ? "جارِ الحفظ..."
                    : isEdit
                      ? "حفظ التعديلات"
                      : "حفظ القيد"}
                </span>

                {!isSaving && (
                  <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0" />
                )}
              </button>
            </div>
          )}

          {isReadOnly && (
            <button
              type="button"
              onClick={() => navigate("/dashboard/journal-entries")}
              className="w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all duration-200 hover:bg-slate-50 sm:w-auto"
            >
              العودة للقيود
            </button>
          )}
        </div>

        {isReadOnly && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-800">
            <span className="text-lg leading-none">🔒</span>

            <div>
              <p className="font-bold">
                {isAutomaticEntry ? "قيد تلقائي" : "قيد معكوس"}
              </p>

              <p className="mt-0.5 text-xs leading-5 text-amber-700">
                {isAutomaticEntry
                  ? "هذا القيد اتولّد من مستند مصدره (فاتورة، سند، إلخ) وبيتحدث تلقائيًا من هناك، مينفعش يتعدل من هنا."
                  : "هذا القيد معكوس بالفعل ومقفول، مينفعش يتعدل."}
              </p>

              {existingEntry?.sourceType && (
                <p className="mt-1 text-xs text-amber-700">
                  المصدر: {existingEntry.sourceType}
                  {existingEntry.sourceNumber
                    ? ` #${existingEntry.sourceNumber}`
                    : ""}
                </p>
              )}
            </div>
          </div>
        )}

        {existingEntry?.reversalOfEntryNumber && (
          <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            هذا القيد ناتج عن عكس القيد رقم{" "}
            <span className="font-bold">
              #{existingEntry.reversalOfEntryNumber}
            </span>
          </div>
        )}

        {existingEntry?.reversedByEntryNumber && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
            تم عكس هذا القيد بواسطة القيد رقم{" "}
            <span className="font-bold">
              #{existingEntry.reversedByEntryNumber}
            </span>
          </div>
        )}

        {formError && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
            <span className="text-lg leading-none">⚠️</span>
            <p className="font-medium">{formError}</p>
          </div>
        )}

        <section className="mb-5 overflow-visible rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-md sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <span className="text-sm font-black">01</span>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">بيانات القيد</h2>

              <p className="text-xs text-slate-400">
                البيانات الأساسية للقيد المحاسبي
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="group min-w-0">
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                السنة المالية
              </label>

              <div className="transition-transform duration-200 group-focus-within:-translate-y-0.5">
                <CompactSelect
                  value={fiscalYearId}
                  onChange={handleFiscalYearChange}
                  options={fiscalYearOptions}
                  placeholder={
                    isLoadingFiscalYears
                      ? "جارِ تحميل السنوات..."
                      : "اختر السنة..."
                  }
                  isDisabled={isLoadingFiscalYears || isReadOnly}
                />
              </div>
            </div>

            <div className="group min-w-0">
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                تاريخ القيد
              </label>

              <input
                type="date"
                value={entryDate}
                disabled={isReadOnly}
                onChange={(event) => setEntryDate(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 hover:border-slate-300 focus:-translate-y-0.5 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <div className="group min-w-0">
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                نوع القيد
              </label>

              {isEdit ? (
                // النوع بيتحدد وقت الإنشاء بس، الـ API مش بيقبل تغييره عند التعديل
                <div className="flex h-[42px] items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-500">
                  {ENTRY_TYPE_LABELS[entryType] ?? entryType}
                </div>
              ) : (
                <div className="transition-transform duration-200 group-focus-within:-translate-y-0.5">
                  <CompactSelect
                    value={entryType}
                    onChange={setEntryType}
                    options={ENTRY_TYPE_OPTIONS}
                    placeholder="اختر نوع القيد..."
                  />
                </div>
              )}
            </div>

            <div className="group min-w-0 sm:col-span-2 xl:col-span-1">
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                البيان
              </label>

              <input
                type="text"
                value={description}
                disabled={isReadOnly}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="وصف القيد..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-300 hover:border-slate-300 focus:-translate-y-0.5 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
          </div>
        </section>

        <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <span className="text-sm font-black">02</span>
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  تفاصيل القيد
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  اختر الحساب أو الطرف ثم أدخل القيمة المدينة أو الدائنة.
                </p>
              </div>
            </div>

            {fiscalYearId && (isLoadingAccounts || isFetchingAccounts) && (
              <div className="flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 animate-[fadeIn_.25s_ease-out]">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" />
                جارِ تحميل الحسابات...
              </div>
            )}
          </div>

          <div className="w-full overflow-x-auto">
            <div className="min-w-[960px]">
              <div className="grid grid-cols-[minmax(220px,1fr)_minmax(200px,1fr)_130px_130px_84px] items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-[11px] font-bold text-slate-400 sm:px-6">
                <span>الحساب / الطرف</span>

                <span>البيان</span>

                <span className="text-left">مدين</span>

                <span className="text-left">دائن</span>

                <span />
              </div>

              {lines.map((line) => {
                const selectedValue = getLineSelectValue(line);

                const isAdding = animatingLine === line.key;

                const isRemoving = animatingLine === `remove-${line.key}`;

                return (
                  <div key={line.key}>
                    <div
                      className={[
                        "group grid grid-cols-[minmax(220px,1fr)_minmax(200px,1fr)_130px_130px_84px] items-center gap-2 border-b border-slate-50 px-4 py-3 transition-all duration-200 sm:px-6",
                        line.useForeignCurrency ? "" : "last:border-b-0",
                        "hover:bg-emerald-50/30",
                        isAdding ? "animate-[slideIn_.35s_ease-out]" : "",
                        isRemoving ? "scale-[0.98] opacity-0" : "",
                      ].join(" ")}
                    >
                      <div className="min-w-0">
                        <CompactSelect
                          value={selectedValue}
                          onChange={(value) =>
                            handleAccountChange(line.key, value)
                          }
                          options={accountOptions}
                          placeholder={
                            fiscalYearId
                              ? "اختر الحساب أو الطرف..."
                              : "اختر السنة المالية أولاً"
                          }
                          isDisabled={
                            isReadOnly ||
                            !fiscalYearId ||
                            isLoadingAccounts ||
                            isFetchingAccounts
                          }
                        />
                      </div>

                      <div className="min-w-0">
                        <input
                          type="text"
                          value={line.description}
                          disabled={isReadOnly}
                          onChange={(event) =>
                            updateLine(line.key, {
                              description: event.target.value,
                            })
                          }
                          placeholder="بيان السطر (اختياري)"
                          className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-300 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                        />
                      </div>

                      <div className="min-w-0">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={line.debit}
                          disabled={isReadOnly || line.useForeignCurrency}
                          onChange={(event) =>
                            handleDebitChange(line.key, event.target.value)
                          }
                          placeholder="0.00"
                          className="num w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-300 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                        />
                      </div>

                      <div className="min-w-0">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={line.credit}
                          disabled={isReadOnly || line.useForeignCurrency}
                          onChange={(event) =>
                            handleCreditChange(line.key, event.target.value)
                          }
                          placeholder="0.00"
                          className="num w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-300 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                        />
                      </div>

                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          disabled={isReadOnly}
                          onClick={() =>
                            handleToggleForeignCurrency(
                              line.key,
                              !line.useForeignCurrency,
                            )
                          }
                          title="عملة أجنبية"
                          className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm transition-all duration-200 disabled:pointer-events-none disabled:opacity-30 ${
                            line.useForeignCurrency
                              ? "bg-emerald-100 text-emerald-700"
                              : "text-slate-300 opacity-0 hover:bg-slate-100 hover:text-slate-500 group-hover:opacity-100"
                          }`}
                        >
                          🌐
                        </button>

                        <button
                          type="button"
                          disabled={lines.length <= 2 || isReadOnly}
                          onClick={() => removeLine(line.key)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-lg font-light text-slate-300 opacity-0 transition-all duration-200 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0"
                          title="حذف السطر"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    {line.useForeignCurrency && (
                      <div className="grid grid-cols-2 gap-2 border-b border-slate-50 bg-slate-50/60 px-4 py-3 sm:grid-cols-4 sm:px-6">
                        <div className="min-w-0">
                          <label className="mb-1 block text-[10px] font-semibold text-slate-400">
                            العملة
                          </label>

                          <select
                            value={line.currency ?? "USD"}
                            disabled={isReadOnly}
                            onChange={(event) =>
                              handleForeignFieldChange(
                                line.key,
                                "currency",
                                event.target.value,
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700 outline-none focus:border-emerald-500"
                          >
                            {CURRENCY_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="min-w-0">
                          <label className="mb-1 block text-[10px] font-semibold text-slate-400">
                            سعر الصرف
                          </label>

                          <input
                            type="text"
                            inputMode="decimal"
                            value={line.exchangeRate}
                            disabled={isReadOnly}
                            onChange={(event) =>
                              handleForeignFieldChange(
                                line.key,
                                "exchangeRate",
                                event.target.value,
                              )
                            }
                            placeholder="0.00"
                            className="num w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700 outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="min-w-0">
                          <label className="mb-1 block text-[10px] font-semibold text-slate-400">
                            مدين بالعملة
                          </label>

                          <input
                            type="text"
                            inputMode="decimal"
                            value={line.transactionDebit}
                            disabled={isReadOnly}
                            onChange={(event) => {
                              handleForeignFieldChange(
                                line.key,
                                "transactionDebit",
                                event.target.value,
                              );
                              handleForeignFieldChange(
                                line.key,
                                "transactionCredit",
                                "",
                              );
                            }}
                            placeholder="0.00"
                            className="num w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700 outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="min-w-0">
                          <label className="mb-1 block text-[10px] font-semibold text-slate-400">
                            دائن بالعملة
                          </label>

                          <input
                            type="text"
                            inputMode="decimal"
                            value={line.transactionCredit}
                            disabled={isReadOnly}
                            onChange={(event) => {
                              handleForeignFieldChange(
                                line.key,
                                "transactionCredit",
                                event.target.value,
                              );
                              handleForeignFieldChange(
                                line.key,
                                "transactionDebit",
                                "",
                              );
                            }}
                            placeholder="0.00"
                            className="num w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700 outline-none focus:border-emerald-500"
                          />
                        </div>

                        <p className="col-span-2 text-[10px] text-slate-400 sm:col-span-4">
                          المبلغ بعملة الشركة الأساسية بيتحسب تلقائيًا = القيمة
                          بالعملة × سعر الصرف.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {!isReadOnly && (
            <div className="border-b border-slate-100 px-4 py-3 sm:px-6">
              <button
                type="button"
                onClick={addLine}
                className="group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-emerald-700 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-base transition-transform duration-200 group-hover:rotate-90 group-hover:bg-emerald-100">
                  +
                </span>
                إضافة سطر
              </button>
            </div>
          )}

          <div className="bg-gradient-to-l from-slate-50 to-white px-4 py-4 sm:px-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black ${
                    isBalanced
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  Σ
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    إجمالي القيد
                  </p>

                  <p
                    className={`text-sm font-bold ${
                      isBalanced ? "text-emerald-700" : "text-slate-700"
                    }`}
                  >
                    {isBalanced
                      ? "القيد متزن ✓"
                      : difference === 0
                        ? "أدخل قيم القيد"
                        : `غير متزن — الفرق ${Math.abs(difference).toFixed(2)}`}
                  </p>
                </div>
              </div>

              <div className="group rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">
                    مدين
                  </span>

                  <span className="h-2 w-2 rounded-full bg-emerald-500 transition-transform duration-200 group-hover:scale-125" />
                </div>

                <span className="num block text-lg font-black text-slate-900">
                  {totalDebit.toFixed(2)}
                </span>
              </div>

              <div className="group rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">
                    دائن
                  </span>

                  <span className="h-2 w-2 rounded-full bg-blue-500 transition-transform duration-200 group-hover:scale-125" />
                </div>

                <span className="num block text-lg font-black text-slate-900">
                  {totalCredit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {!isReadOnly && (
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/dashboard/journal-entries")}
              className="w-full rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md sm:w-auto"
            >
              إلغاء
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="group relative w-full overflow-hidden rounded-xl bg-emerald-700 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSaving && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}

                {isSaving
                  ? "جارِ الحفظ..."
                  : isEdit
                    ? "حفظ التعديلات"
                    : "حفظ القيد"}
              </span>

              {!isSaving && (
                <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0" />
              )}
            </button>
          </div>
        )}

        {isEdit && isFetchingEntry && !isLoadingEntry && (
          <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2 animate-[slideUp_.25s_ease-out]">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-500 shadow-xl shadow-slate-900/10">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-700" />
              تحديث البيانات...
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}
