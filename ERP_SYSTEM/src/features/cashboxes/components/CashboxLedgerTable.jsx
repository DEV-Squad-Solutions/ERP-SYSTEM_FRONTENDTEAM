import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FileSearch,
  AlertCircle,
  RefreshCw,
  Plus,
  Check,
  X,
  Loader2,
  Trash2,
  Landmark,
  ArrowLeftRight,
} from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { useFiscalYearGuard } from "../../../lib/useFiscalYearGuard";
import { todayInCairo } from "../../../lib/date";
import { round2 } from "../../../lib/number";
import CashVoucherEditModal from "./CashVoucherEditModal";
import DescriptionCascadeSelect from "./DescriptionCascadeSelect";
import Pagination from "../../../shared/components/ui/Pagination";
import { useGetCashVoucherPartySelectQuery } from "../cashVouchersApi";
import { useLazyResolveExchangeRateQuery } from "../../exchange-rates/exchangeRatesApi";
import { selectIsAdmin, selectIsAdminOrAccountant } from "../../auth/authSlice";
import {
  buildDescriptionGroups,
  getCurrentDescriptionValue,
  buildPostingTargetPayload,
} from "../utils/descriptionGroups";

const fmt = (value) =>
  Number(value ?? 0).toLocaleString("ar-EG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

function getToday() {
  return todayInCairo();
}

function emptyDraft() {
  return {
    voucherDate: getToday(),
    description: "",
    receiptAmount: "",
    paymentAmount: "",
    exchangeRate: "",
  };
}

function normalizeVoucherDate(value) {
  if (!value) {
    return getToday();
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  return value;
}

// صفوف مالهاش توصيف/حساب أصلاً وميتعدلش/يتمسحش من هنا:
// الرصيد الافتتاحي (isOpeningBalance) والتحويل بين الخزائن
// (cashboxTransferId). دول مش سندات عادية - الرصيد الافتتاحي حتى
// مالوش rowVersion حقيقي من الباك. وكمان أي صف السيرفر باعته
// isReadOnly (زي صف الرصيد الافتتاحي في الكشوف) بيتقفل.
function isNonDescribableRow(row) {
  return (
    Boolean(row?.isOpeningBalance) ||
    Boolean(row?.isReadOnly) ||
    Boolean(row?.cashboxTransferId)
  );
}

function isNonEditableRow(row) {
  return Boolean(row?.isOpeningBalance) || Boolean(row?.isReadOnly);
}

// Posting target fields, in priority order. The API requires exactly ONE
// of these to be sent (non-null); everything else must be explicitly null.
const POSTING_TARGET_KEYS = [
  "employeeId",
  "businessPartnerId",
  "driverId",
  "externalPartyName",
  "accountId",
];

function pickPostingTarget(source) {
  if (!source) {
    return null;
  }

  for (const key of POSTING_TARGET_KEYS) {
    const value = source[key];

    if (key === "externalPartyName") {
      if (typeof value === "string" && value.trim()) {
        return { key, value: value.trim() };
      }
      continue;
    }

    if (value === undefined || value === null || value === "") {
      continue;
    }

    const numeric = toNumber(value);

    if (numeric > 0) {
      return { key, value: numeric };
    }
  }

  return null;
}

// هل جسم السند ده فيه هدف ترحيل فعلي (حساب/شريك/موظف/سائق/طرف خارجي)؟
function hasPostingTarget(source) {
  if (!source) {
    return false;
  }

  return POSTING_TARGET_KEYS.some((key) => {
    const value = source[key];

    if (key === "externalPartyName") {
      return typeof value === "string" && value.trim().length > 0;
    }

    return value !== undefined && value !== null && value !== "";
  });
}

function buildUpdateVoucherPayload({
  row,
  cashboxId,
  payload = {},
  isForeign = false,
}) {
  const amount = toNumber(payload.amount ?? row.amount);

  const direction = payload.direction ?? row.direction;

  const voucherDate = normalizeVoucherDate(
    payload.voucherDate ?? row.voucherDate,
  );

  // If the caller is explicitly setting a posting target (any of the
  // target keys present in payload), that target fully replaces the
  // row's existing one — we never merge an old target with a new one.
  const payloadHasTarget = POSTING_TARGET_KEYS.some(
    (key) => payload[key] !== undefined,
  );

  const picked = payloadHasTarget
    ? pickPostingTarget(payload)
    : pickPostingTarget(row);

  const target = {
    employeeId: null,
    businessPartnerId: null,
    driverId: null,
    externalPartyName: null,
    accountId: null,
  };

  if (picked) {
    target[picked.key] = picked.value;
  }

  const result = {
    voucherDate,
    direction,
    cashboxId: toNumber(payload.cashboxId ?? cashboxId),

    cashMovementTypeId:
      payload.cashMovementTypeId ?? row.cashMovementTypeId ?? null,

    ...target,

    // driverTripId is only valid alongside a driverId target.
    driverTripId:
      target.driverId != null
        ? toNumber(payload.driverTripId ?? row.driverTripId) || null
        : null,

    amount,

    referenceNumber: payload.referenceNumber ?? row.referenceNumber ?? null,

    description: payload.description ?? row.description ?? null,

    notes: payload.notes ?? row.notes ?? null,

    rowVersion: row.rowVersion,
  };

  if (isForeign) {
    const exchangeRate = toNumber(
      payload.exchangeRate ?? row.exchangeRate ?? row.rate ?? 1,
    );

    result.exchangeRate = exchangeRate > 0 ? exchangeRate : 1;
  } else if (
    payload.exchangeRate !== undefined &&
    payload.exchangeRate !== null
  ) {
    result.exchangeRate = toNumber(payload.exchangeRate);
  } else {
    result.exchangeRate = null;
  }

  return result;
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
  onUpdateDraftVoucher,
  onDeleteVoucher,
  // حذف الرصيد الافتتاحي اليدوي للخزنة (تصفير الرصيد الافتتاحي).
  onDeleteOpeningBalance,
  // صلاحية التنفيذ (عرض/إضافة/تعديل/حذف حركات) على الخزنة دي.
  // true افتراضيًا لحد ما يتحدد النطاق من useCashboxScope. السيرفر
  // برضه بيتحقق وقت التنفيذ.
  canExecute = true,
  page = 1,
  pageSize = 20,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
}) {
  const isAdmin = useSelector(selectIsAdmin);
  const isAdminOrAccountant = useSelector(selectIsAdminOrAccountant);
  const { isReadOnly: isFiscalYearReadOnly, fiscalYear } = useFiscalYearGuard();

  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());
  const [editingRow, setEditingRow] = useState(null);
  const [updatingRowId, setUpdatingRowId] = useState(null);
  const [deletingRowId, setDeletingRowId] = useState(null);
  const [descriptionUpdatingId, setDescriptionUpdatingId] = useState(null);

  const { data: partySelect, isFetching: loadingPartySelect } =
    useGetCashVoucherPartySelectQuery();

  const vouchers = data?.items ?? [];

  const currency = cashboxCurrency || vouchers[0]?.currency || "EGP";

  const baseCurrency =
    cashboxBaseCurrency || vouchers[0]?.baseCurrency || "EGP";

  const isForeign = currency !== baseCurrency;

  // تحميل سعر الصرف تلقائيًا من أسعار الصرف (GET /ExchangeRates/resolve)
  // لصف الإضافة السريعة، نفس سلوك مودال «سند جديد». القيمة اليدوية
  // لنفس العملة والتاريخ بتتفضل زي ما هي.
  const [resolveExchangeRate, { isFetching: isResolvingRate }] =
    useLazyResolveExchangeRateQuery();

  const lastResolvedDraftKeyRef = useRef(null);

  useEffect(() => {
    if (!isAdding || !isForeign || !currency || !draft.voucherDate) return;

    const key = `${currency}|${draft.voucherDate}`;
    if (lastResolvedDraftKeyRef.current === key) return;

    resolveExchangeRate({ currency, date: draft.voucherDate })
      .unwrap()
      .then((res) => {
        lastResolvedDraftKeyRef.current = key;
        if (res?.rate != null) {
          setDraft((current) => ({
            ...current,
            exchangeRate: String(round2(res.rate)),
          }));
        }
      })
      .catch(() => {
        lastResolvedDraftKeyRef.current = key;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdding, isForeign, currency, draft.voucherDate]);

  const getDescriptionGroups = useCallback(
    (direction) =>
      buildDescriptionGroups(partySelect, {
        direction,
      }),
    [partySelect],
  );

  const handleDescriptionChange = useCallback(
    async (row, selectedValue) => {
      if (!selectedValue || !onUpdateVoucher || isNonDescribableRow(row)) {
        return;
      }

      // التوصيف نفسه مقصور على الأدمن أو المحاسب. المستخدم العادي
      // يقدر يعدّل بيانات الحركة (قبل التوصيف) بس مش يوصّفها.
      if (!isAdminOrAccountant) {
        toast.error("التوصيف متاح للأدمن أو المحاسب فقط");
        return;
      }

      const groups = getDescriptionGroups(row.direction);

      const selectedOption = groups
        .flatMap((group) => group.options)
        .find((option) => String(option.value) === String(selectedValue));

      if (!selectedOption) {
        return;
      }

      const meta = selectedOption.meta || {};

      const postingTargetPayload = buildPostingTargetPayload(meta, row) || {};

      const payload = buildUpdateVoucherPayload({
        row,
        cashboxId,
        isForeign,
        payload: {
          voucherDate: row.voucherDate,
          direction: row.direction,
          amount: toNumber(row.amount),

          ...postingTargetPayload,

          cashMovementTypeId:
            postingTargetPayload.cashMovementTypeId ??
            meta.cashMovementTypeId ??
            row.cashMovementTypeId,

          description: row.description || undefined,
          notes: row.notes || undefined,
          referenceNumber: row.referenceNumber || undefined,

          exchangeRate: row.exchangeRate ?? row.rate ?? 1,
        },
      });

      setDescriptionUpdatingId(row.id);

      try {
        await onUpdateVoucher({
          id: row.id,
          ...payload,
        });

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
    },
    [cashboxId, getDescriptionGroups, isAdminOrAccountant, isForeign, onUpdateVoucher],
  );

  const openAddRow = useCallback(() => {
    lastResolvedDraftKeyRef.current = null;
    setDraft(emptyDraft());
    setIsAdding(true);
  }, []);

  const closeAddRow = useCallback(() => {
    if (saving) {
      return;
    }

    setIsAdding(false);
    setDraft(emptyDraft());
  }, [saving]);

  const handlePaymentChange = useCallback((event) => {
    const value = event.target.value;

    setDraft((current) => ({
      ...current,
      paymentAmount: value,
      receiptAmount: "",
    }));
  }, []);

  const handleReceiptChange = useCallback((event) => {
    const value = event.target.value;

    setDraft((current) => ({
      ...current,
      receiptAmount: value,
      paymentAmount: "",
    }));
  }, []);

  const handleDraftDescriptionChange = useCallback((event) => {
    setDraft((current) => ({
      ...current,
      description: event.target.value,
    }));
  }, []);

  const handleDraftDateChange = useCallback((event) => {
    setDraft((current) => ({
      ...current,
      voucherDate: event.target.value,
    }));
  }, []);

  // سعر الصرف بيُلتقط مع المسودة (POST) من غير ما يحتاج توصيف
  // (عميل/حساب). الخانة تظهر بس للخزائن بعملة أجنبية.
  const handleDraftExchangeRateChange = useCallback((event) => {
    setDraft((current) => ({
      ...current,
      exchangeRate: event.target.value,
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (saving || !onAddVoucher) {
      return;
    }

    const receipt = toNumber(draft.receiptAmount);
    const payment = toNumber(draft.paymentAmount);
    const description = draft.description.trim();

    if (receipt <= 0 && payment <= 0) {
      toast.error("أدخل قيمة الوارد أو الصادر");
      return;
    }

    const amount = receipt > 0 ? receipt : payment;
    const direction = receipt > 0 ? "Receipt" : "Payment";

    setSaving(true);

    try {
      await onAddVoucher({
        cashboxId,
        voucherDate: draft.voucherDate,
        direction,
        amount,
        // البيان اختياري — الضروري بس قيمة الحركة، والتوصيف (عميل/حساب)
        // واختياري كذلك ويتم لاحقًا من الكشف.
        description: description || undefined,
        // سعر الصرف يُرسل فقط للخزائن الأجنبية وعند وجود قيمة.
        exchangeRate:
          isForeign && draft.exchangeRate !== ""
            ? Number(draft.exchangeRate)
            : undefined,
      });

      toast.success("تم تسجيل الحركة بنجاح");

      setDraft({
        ...emptyDraft(),
        voucherDate: draft.voucherDate,
      });
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
  }, [cashboxId, draft, isForeign, onAddVoucher, saving]);

  const handleAddKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSave();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeAddRow();
      }
    },
    [closeAddRow, handleSave],
  );

  const handleFullEdit = useCallback(
    async (payload) => {
      if (!editingRow || (!onUpdateVoucher && !onUpdateDraftVoucher)) {
        return;
      }

      setUpdatingRowId(editingRow.id);

      try {
        const updatePayload = buildUpdateVoucherPayload({
          row: editingRow,
          cashboxId,
          isForeign,
          payload,
        });

        // تعديل مسودة بدون توصيف = تحديث بيانات المسودة فقط (تاريخ/مبلغ/سعر
        // صرف/بيان) من غير ترحيل، فبنستخدم PUT /CashVouchers/{id}/draft.
        // لو المستخدم اختار توصيف (لإكمال وترحيل المسودة) أو السند مرحّل،
        // بنستخدم PUT العادي.
        const isDraftOnlyEdit =
          Boolean(editingRow.isDraft) &&
          !hasPostingTarget(updatePayload) &&
          Boolean(onUpdateDraftVoucher);

        if (isDraftOnlyEdit) {
          await onUpdateDraftVoucher({
            id: editingRow.id,
            voucherDate: updatePayload.voucherDate,
            direction: updatePayload.direction,
            cashboxId: updatePayload.cashboxId,
            amount: updatePayload.amount,
            rowVersion: updatePayload.rowVersion,
            description: updatePayload.description,
            notes: updatePayload.notes,
            referenceNumber: updatePayload.referenceNumber,
            exchangeRate: updatePayload.exchangeRate ?? undefined,
          });
        } else {
          await onUpdateVoucher({
            id: editingRow.id,
            ...updatePayload,
          });
        }

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
    },
    [cashboxId, editingRow, isForeign, onUpdateVoucher, onUpdateDraftVoucher],
  );

  const executeDeleteVoucher = useCallback(
    async (row) => {
      if (!row || deletingRowId || !onDeleteVoucher) {
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
    },
    [deletingRowId, editingRow, onDeleteVoucher, refetch],
  );

  const handleDeleteVoucher = useCallback(
    (row) => {
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

      if (isNonEditableRow(row)) {
        toast.error("الرصيد الافتتاحي لا يمكن حذفه من هنا.");
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
    },
    [executeDeleteVoucher, isAdmin, onDeleteVoucher],
  );

  // حذف الرصيد الافتتاحي اليدوي للخزنة. الرصيد الافتتاحي مملوك للخزنة
  // نفسها (مش سند)، فالحذف بيتعمل بتصفير الرصيد الافتتاحي على الخزنة.
  // الباك بيرفض لو فيه سندات مسجلة على الخزنة.
  const executeDeleteOpeningBalance = useCallback(
    async (row) => {
      if (!row || deletingRowId || !onDeleteOpeningBalance) {
        return;
      }

      setDeletingRowId(row.id);

      try {
        await onDeleteOpeningBalance();

        toast.success("تم حذف الرصيد الافتتاحي بنجاح");

        refetch?.();
      } catch (error) {
        const code = error?.data?.errorCode ?? error?.data?.code;

        if (code === "Cashboxes.OpeningOrCurrencyChangeNotAllowed") {
          toast.error(
            "لا يمكن حذف الرصيد الافتتاحي بعد إنشاء سندات على الخزنة.",
          );
        } else {
          toast.error(
            error?.data?.detail ||
              error?.data?.title ||
              error?.data?.message ||
              error?.error ||
              "تعذر حذف الرصيد الافتتاحي",
          );
        }
      } finally {
        setDeletingRowId(null);
      }
    },
    [deletingRowId, onDeleteOpeningBalance, refetch],
  );

  const handleDeleteOpeningBalance = useCallback(
    (row) => {
      if (!isAdmin) {
        toast.error("ليس لديك صلاحية حذف الرصيد الافتتاحي");
        return;
      }

      if (!onDeleteOpeningBalance) {
        toast.error("خدمة حذف الرصيد الافتتاحي غير متاحة");
        return;
      }

      toast.warning(
        "هل أنت متأكد من حذف الرصيد الافتتاحي اليدوي للخزنة؟ لا يمكن التراجع.",
        {
          duration: 8000,
          action: {
            label: "حذف",
            onClick: () => executeDeleteOpeningBalance(row),
          },
          cancel: {
            label: "إلغاء",
          },
        },
      );
    },
    [executeDeleteOpeningBalance, isAdmin, onDeleteOpeningBalance],
  );

  // الرصيد بقى بييجي جاهز من الباك (cashboxBalance) — سواء كان الترتيب
  // زمني أو صفحة معينة، الباك هو اللي بيحسب التراكم مش الفرونت.
  // برضو baseAmount بقى راجع من الـ API مباشرة بدل ما يتحسب هنا بضرب
  // amount * exchangeRate.
  const rows = useMemo(
    () =>
      vouchers.map((voucher) => {
        const amount = toNumber(voucher.amount);

        const exchangeRate =
          toNumber(voucher.exchangeRate ?? voucher.rate ?? 1) || 1;

        const baseAmount = toNumber(
          voucher.baseAmount ?? amount * exchangeRate,
        );

        const debit = voucher.direction === "Receipt" ? amount : 0;
        const credit = voucher.direction === "Payment" ? amount : 0;
        const baseDebit = voucher.direction === "Receipt" ? baseAmount : 0;
        const baseCredit = voucher.direction === "Payment" ? baseAmount : 0;

        const isDescribed = Boolean(
          voucher.cashMovementTypeId ||
          voucher.accountId ||
          voucher.employeeId ||
          voucher.businessPartnerId ||
          voucher.driverId ||
          voucher.externalPartyName,
        );

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
          // مفيش تراكم بيتحسب في الفرونت خالص، الرقم ده جاي زي ما هو من الباك
          balance: toNumber(voucher.cashboxBalance),
          isDescribed,
          isDraft,
        };
      }),
    [vouchers],
  );

  // إجمالي وارد/صادر الصفحة المعروضة فقط (مش رصيد افتتاحي/ختامي —
  // ده بقى مسؤولية الباك بالكامل).
  const totals = useMemo(
    () =>
      rows.reduce(
        (result, row) => {
          result.debit += row.debit;
          result.credit += row.credit;
          result.baseDebit += row.baseDebit;
          result.baseCredit += row.baseCredit;

          return result;
        },
        {
          debit: 0,
          credit: 0,
          baseDebit: 0,
          baseCredit: 0,
        },
      ),
    [rows],
  );

  const showEmptyState = !isFetching && rows.length === 0 && !isAdding;

  if (isLoading) {
    return (
      <div className="space-y-1.5">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="h-9 animate-pulse rounded-lg bg-ink-400/5"
          />
        ))}
      </div>
    );
  }

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
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-500 transition-all hover:bg-primary-100 active:scale-95"
        >
          <RefreshCw size={13} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div>
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

      {!isAdding && !isFiscalYearReadOnly && canExecute && (
        <div className="mb-2">
          <button
            type="button"
            onClick={openAddRow}
            className="group flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink-400/15 py-2 text-[11px] text-ink-400 transition-all duration-200 hover:border-primary-300/40 hover:bg-primary-50/40 hover:text-primary-500 active:scale-[0.99]"
          >
            <Plus
              size={13}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
            إضافة حركة جديدة
          </button>
        </div>
      )}

      {isFiscalYearReadOnly && (
        <div className="mb-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-700">
          السنة المالية "{fiscalYear?.name}" مغلقة أو ليست السنة الحالية — الشاشة للعرض فقط ولا
          يمكن إضافة أو تعديل حركات عليها.
        </div>
      )}

      {!isFiscalYearReadOnly && !canExecute && (
        <div className="mb-2 rounded-xl border border-ink-400/15 bg-ink-400/[0.04] px-3 py-2 text-[11px] font-medium text-ink-500">
          عندك صلاحية عرض بس على الخزنة دي — إضافة وتعديل وحذف الحركات غير متاحة.
        </div>
      )}

      <div
        className={`overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity duration-200 ${
          isFetching ? "opacity-60" : "opacity-100"
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

                <th className="border-l border-ink-400/5 px-2 py-2 font-medium text-positive">
                  صادر
                  {isForeign && ` (${currency})`}
                </th>

                <th className="border-l border-ink-400/5 px-2 py-2 font-medium text-negative">
                  وارد
                  {isForeign && ` (${currency})`}
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
                  التاريخ
                </th>

                <th className="px-2 py-2 font-medium">السند</th>
              </tr>
            </thead>

            <tbody>
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
                        ابدأ بتسجيل أول حركة
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {isAdding && (
                <tr className="animate-in fade-in slide-in-from-top-1 border-b border-primary-100 bg-primary-50/30 align-top duration-200">
                  <td className="p-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        title="حفظ الحركة - Enter"
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-positive/15 text-positive transition-all hover:bg-positive/25 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
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
                        title="إلغاء - Escape"
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-ink-900/[0.05] text-ink-400 transition-all hover:bg-ink-900/10 active:scale-90 disabled:opacity-50"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    <div className="mt-1 text-[8px] text-ink-300">
                      Enter حفظ
                    </div>
                  </td>

                  <td className="border-l border-ink-400/5 p-1.5">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="صادر"
                      value={draft.paymentAmount}
                      onChange={handlePaymentChange}
                      onKeyDown={handleAddKeyDown}
                      disabled={saving}
                      autoComplete="off"
                      className="num w-full rounded-md border border-positive/20 bg-white px-2 py-1.5 text-[11px] text-positive outline-none transition-all placeholder:text-ink-300 focus:border-positive/50 focus:ring-2 focus:ring-positive/10 disabled:cursor-not-allowed disabled:bg-ink-50"
                    />
                  </td>

                  <td className="border-l border-ink-400/5 p-1.5">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="وارد"
                      value={draft.receiptAmount}
                      onChange={handleReceiptChange}
                      onKeyDown={handleAddKeyDown}
                      disabled={saving}
                      autoComplete="off"
                      className="num w-full rounded-md border border-negative/20 bg-white px-2 py-1.5 text-[11px] text-negative outline-none transition-all placeholder:text-ink-300 focus:border-negative/50 focus:ring-2 focus:ring-negative/10 disabled:cursor-not-allowed disabled:bg-ink-50"
                    />
                  </td>

                  {isForeign && (
                    <td className="border-l border-ink-400/5 p-1.5">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={
                          isResolvingRate ? "جاري تحميل السعر..." : "سعر الصرف"
                        }
                        value={draft.exchangeRate}
                        onChange={handleDraftExchangeRateChange}
                        onKeyDown={handleAddKeyDown}
                        disabled={saving}
                        autoComplete="off"
                        title={
                          isResolvingRate
                            ? "جاري جلب السعر من أسعار الصرف..."
                            : "يُحمَّل تلقائيًا من أسعار الصرف حسب تاريخ السند"
                        }
                        className="num w-full rounded-md border border-ink-400/15 bg-white px-2 py-1.5 text-[11px] outline-none transition-all placeholder:text-ink-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-ink-50"
                      />
                    </td>
                  )}

                  <td className="border-l border-ink-400/5 p-1.5">
                    <input
                      type="text"
                      placeholder="بيان الحركة (اختياري)"
                      value={draft.description}
                      onChange={handleDraftDescriptionChange}
                      onKeyDown={handleAddKeyDown}
                      disabled={saving}
                      autoComplete="off"
                      className="w-full truncate rounded-md border border-ink-400/15 bg-white px-2 py-1.5 text-[11px] outline-none transition-all placeholder:text-ink-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-ink-50"
                    />

                    <div className="mt-1 text-[8px] text-ink-300">Enter للحفظ</div>
                  </td>

                  <td className="border-l border-ink-400/5 p-1.5">
                    <input
                      type="date"
                      value={draft.voucherDate}
                      onChange={handleDraftDateChange}
                      onKeyDown={handleAddKeyDown}
                      disabled={saving}
                      className="num w-full rounded-md border border-ink-400/15 bg-white px-2 py-1.5 text-[11px] outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-ink-50"
                    />
                  </td>

                  <td className="p-1.5 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2 py-1 text-[9px] font-medium text-gold-700">
                      {saving && <Loader2 size={9} className="animate-spin" />}
                      مسودة جديدة
                    </span>
                  </td>
                </tr>
              )}

              {rows.map((row) => {
                const isUpdating = updatingRowId === row.id;

                const isDeleting = deletingRowId === row.id;

                const isDescriptionUpdating = descriptionUpdatingId === row.id;

                const isInvoiceGenerated = Boolean(row.invoiceId);

                const isOpeningBalanceRow = Boolean(row.isOpeningBalance);

                const isCashboxTransferRow = Boolean(row.cashboxTransferId);

                const isDescriptionLocked = isNonDescribableRow(row);

                // بمجرد ما الحركة تتوصّف (يتحدد لها حساب/طرف)، تعديل
                // بياناتها مقصور على الأدمن أو المحاسب. أي دور تاني للعرض.
                const isDescribeLocked =
                  hasPostingTarget(row) && !isAdminOrAccountant;

                const isRowEditable =
                  canExecute &&
                  !isFiscalYearReadOnly &&
                  !isInvoiceGenerated &&
                  !isNonEditableRow(row) &&
                  !isDescribeLocked;

                const isRowDeletable =
                  canExecute &&
                  !isFiscalYearReadOnly &&
                  isAdmin &&
                  !isInvoiceGenerated &&
                  !isNonEditableRow(row);

                // الرصيد الافتتاحي اليدوي (اللي مش مرحّل من سنة سابقة)
                // بيظهر في كشف الخزنة كصف مملوك للخزنة — بنسمح للأدمن
                // بحذفه (بيتصفّر الرصيد الافتتاحي).
                const isOpeningBalanceDeletable =
                  isOpeningBalanceRow &&
                  canExecute &&
                  !isFiscalYearReadOnly &&
                  isAdmin &&
                  Boolean(onDeleteOpeningBalance);

                const descriptionGroups = getDescriptionGroups(row.direction);

                const selectedDescription = getCurrentDescriptionValue(row);

                return (
                  <tr
                    key={row.id}
                    className={`group border-b border-ink-400/5 align-middle transition-all duration-200 last:border-0 hover:bg-ink-900/[0.015] ${
                      isUpdating || isDescriptionUpdating
                        ? "bg-primary-50/20"
                        : ""
                    }`}
                  >
                    <td
                      className={`num border-l border-ink-400/5 px-2 py-2 text-sm font-semibold ${
                        row.balance >= 0 ? "text-ink-900" : "text-negative"
                      }`}
                    >
                      {fmt(row.balance)}
                    </td>

                    <td className="num border-l border-ink-400/5 px-2 py-2 text-sm text-positive">
                      {row.credit > 0 ? (
                        <>
                          <div className="font-medium">{fmt(row.credit)}</div>

                          {isForeign && (
                            <div className="mt-0.5 truncate text-[9px] text-ink-400">
                              {fmt(row.baseCredit)} {baseCurrency}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-ink-200">—</span>
                      )}
                    </td>

                    <td className="num border-l border-ink-400/5 px-2 py-2 text-sm text-negative">
                      {row.debit > 0 ? (
                        <>
                          <div className="font-medium">{fmt(row.debit)}</div>

                          {isForeign && (
                            <div className="mt-0.5 truncate text-[9px] text-ink-400">
                              {fmt(row.baseDebit)} {baseCurrency}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-ink-200">—</span>
                      )}
                    </td>

                    {isForeign && (
                      <td className="num border-l border-ink-400/5 px-2 py-2 text-[10px] text-ink-600">
                        {row.debit > 0 || row.credit > 0
                          ? fmt(row.exchangeRate)
                          : "—"}
                      </td>
                    )}

                    <td className="min-w-0 border-l border-ink-400/5 px-2 py-2">
                      <div className="min-w-[240px]">
                        {isDescriptionLocked ? (
                          <div className="flex items-center gap-1.5 rounded-lg border border-ink-400/10 bg-ink-400/5 px-2.5 py-2 text-[11px] text-ink-500">
                            {isOpeningBalanceRow ? (
                              <Landmark
                                size={13}
                                className="shrink-0 text-ink-400"
                              />
                            ) : (
                              <ArrowLeftRight
                                size={13}
                                className="shrink-0 text-ink-400"
                              />
                            )}

                            <span className="truncate">
                              {isOpeningBalanceRow
                                ? "رصيد افتتاحي — لا يحتاج توصيف"
                                : "تحويل بين الخزائن — لا يحتاج توصيف"}
                            </span>
                          </div>
                        ) : (
                          <DescriptionCascadeSelect
                            groups={descriptionGroups}
                            value={selectedDescription}
                            onChange={(value) =>
                              handleDescriptionChange(row, value)
                            }
                            isLoading={
                              loadingPartySelect || isDescriptionUpdating
                            }
                            isDisabled={
                              isDescriptionUpdating ||
                              isInvoiceGenerated ||
                              !isAdminOrAccountant
                            }
                            placeholder={
                              row.isDescribed
                                ? "تغيير الحساب / التوصيف"
                                : "اختر الحساب أو التوصيف"
                            }
                          />
                        )}

                        {!isAdminOrAccountant && (
                          <div className="mt-1 text-right text-[9px] text-ink-300">
                            {isDescribeLocked
                              ? "الحركة موصّفة — التعديل للأدمن أو المحاسب فقط"
                              : "التوصيف متاح للأدمن أو المحاسب فقط"}
                          </div>
                        )}

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

                        {row.accountName && (
                          <div className="mt-0.5 truncate text-right text-[9px] text-primary-500">
                            الحساب:{" "}
                            {row.accountCode ? `${row.accountCode} - ` : ""}
                            {row.accountName}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="num border-l border-ink-400/5 px-2 py-2 text-[10px] text-ink-600">
                      <span className="whitespace-nowrap">
                        {row.voucherDate}
                      </span>
                    </td>

                    <td className="px-2 py-2">
                      <div className="flex min-w-0 items-start justify-between gap-1">
                        <div className="min-w-0">
                          <div className="num truncate text-[10px] font-medium text-ink-900">
                            {row.voucherNumber}
                          </div>

                          <span
                            className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                              row.isDraft
                                ? "bg-gold-50 text-gold-700"
                                : "bg-positive/10 text-positive"
                            }`}
                          >
                            {row.isDraft ? "مسودة" : "مرحّل"}
                          </span>
                        </div>

                        {(isRowDeletable || isOpeningBalanceDeletable) && (
                          <button
                            type="button"
                            title={
                              isOpeningBalanceRow
                                ? "حذف الرصيد الافتتاحي اليدوي"
                                : "حذف السند"
                            }
                            disabled={isDeleting || isUpdating}
                            onClick={(event) => {
                              event.stopPropagation();

                              if (isOpeningBalanceRow) {
                                handleDeleteOpeningBalance(row);
                              } else {
                                handleDeleteVoucher(row);
                              }
                            }}
                            className="shrink-0 rounded-md p-1 text-ink-300 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {isDeleting ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Trash2 size={12} />
                            )}
                          </button>
                        )}
                      </div>

                      {isRowEditable && (
                        <button
                          type="button"
                          disabled={isUpdating || isDeleting}
                          onClick={() => setEditingRow(row)}
                          className="mt-1 text-[9px] text-primary-500 transition-colors hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          تعديل كامل
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <CashVoucherEditModal
          isOpen={editingRow !== null}
          onClose={() => setEditingRow(null)}
          onSave={handleFullEdit}
          voucher={editingRow}
          isForeign={isForeign}
          currency={currency}
          baseCurrency={baseCurrency}
          canDescribe={isAdminOrAccountant}
          partyOptions={partyOptions}
          driverOptions={driverOptions}
          employeeOptions={employeeOptions}
        />

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
