import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "../../../shared/components/ui/Modal";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import {
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useGetAccountsQuery,
} from "../accountsApi";
import { getAccountErrorMessage } from "../utils/getAccountErrorMessage";

const ACCOUNT_TYPES = [
  { value: "Asset", label: "أصول" },
  { value: "Liability", label: "التزامات" },
  { value: "Equity", label: "حقوق ملكية" },
  { value: "Revenue", label: "إيرادات" },
  { value: "Expense", label: "مصروفات" },
];

const NORMAL_BALANCES = [
  { value: "Debit", label: "مدين" },
  { value: "Credit", label: "دائن" },
];

const schema = z.object({
  name: z.string().trim().min(1, "الاسم مطلوب"),
  parentAccountId: z.union([z.number(), z.null()]).optional(),
  accountType: z.enum(["Asset", "Liability", "Equity", "Revenue", "Expense"], {
    errorMap: () => ({ message: "نوع الحساب مطلوب" }),
  }),
  normalBalance: z.enum(["Debit", "Credit"], {
    errorMap: () => ({ message: "طبيعة الرصيد مطلوبة" }),
  }),
  isPosting: z.boolean(),
  isActive: z.boolean(),
});

/**
 * props:
 * - open: boolean
 * - onClose: () => void
 * - account: الحساب المطلوب تعديله (null = إضافة)
 * - defaultParentId: parentAccountId مبدئي لو بنضيف حساب فرعي من الشجرة مباشرة
 * - excludedIds: Set من الـ ids المفروض متتاحش كأب (نفس الحساب + أحفاده عند التعديل)
 */
export default function AccountFormModal({
  open,
  onClose,
  account = null,
  defaultParentId = null,
  excludedIds,
}) {
  const isEdit = Boolean(account);

  // الأب لازم يكون غير قابل للتسجيل + فعال فقط
  const { data: parentCandidates, isFetching: isLoadingParents } =
    useGetAccountsQuery(
      { IsPosting: false, IsActive: true, PageSize: 100, PageNumber: 1 },
      { skip: !open },
    );

  const [createAccount, { isLoading: isCreating }] = useCreateAccountMutation();
  const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation();
  const isSubmitting = isCreating || isUpdating;

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      parentAccountId: defaultParentId,
      accountType: "Asset",
      normalBalance: "Debit",
      isPosting: true,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: account?.name ?? "",
      parentAccountId: account?.parentAccountId ?? defaultParentId ?? null,
      accountType: account?.accountType ?? "Asset",
      normalBalance: account?.normalBalance ?? "Debit",
      isPosting: account?.isPosting ?? true,
      isActive: account?.isActive ?? true,
    });
  }, [open, account, defaultParentId, reset]);

  const parentAccountId = watch("parentAccountId");
  const isPostingValue = watch("isPosting");

  const parentOptions = useMemo(() => {
    const items = parentCandidates?.items ?? [];
    return items
      .filter((a) => !excludedIds?.has(a.id))
      .slice()
      .sort((a, b) => a.code.localeCompare(b.code))
      .map((a) => ({ value: a.id, label: `${a.code} - ${a.name}` }));
  }, [parentCandidates, excludedIds]);

  const selectedParentRaw = useMemo(() => {
    const items = parentCandidates?.items ?? [];
    return items.find((a) => a.id === parentAccountId) ?? null;
  }, [parentCandidates, parentAccountId]);

  // النوع وطبيعة الرصيد بيتورثوا من الأب تلقائيًا - مطابق لسلوك الباك إند
  useEffect(() => {
    if (selectedParentRaw) {
      setValue("accountType", selectedParentRaw.accountType, {
        shouldValidate: true,
      });
      if (selectedParentRaw.normalBalance) {
        setValue("normalBalance", selectedParentRaw.normalBalance, {
          shouldValidate: true,
        });
      }
    }
  }, [selectedParentRaw, setValue]);

  const onSubmit = async (values) => {
    const payload = {
      name: values.name.trim(),
      parentAccountId: values.parentAccountId || null,
      accountType: values.accountType,
      normalBalance: values.normalBalance,
      isPosting: values.isPosting,
      isActive: values.isActive,
    };

    try {
      if (isEdit) {
        await updateAccount({
          id: account.id,
          ...payload,
          rowVersion: account.rowVersion,
        }).unwrap();
      } else {
        await createAccount(payload).unwrap();
      }
      onClose();
    } catch (err) {
      setError("root", { message: getAccountErrorMessage(err) });
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={isEdit ? `تعديل حساب: ${account.name}` : "إضافة حساب جديد"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">الاسم</label>
            <input
              {...register("name")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="مثال: بنك الأهلي"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600">
            الحساب الأب
          </label>
          <Controller
            control={control}
            name="parentAccountId"
            render={({ field }) => (
              <CompactSelect
                options={parentOptions}
                value={field.value ?? ""}
                onChange={(value) =>
                  field.onChange(value === "" ? null : value)
                }
                isLoading={isLoadingParents}
                placeholder="— بدون أب (حساب رئيسي) —"
              />
            )}
          />
          <p className="mt-1 text-xs text-gray-400">
            الأب لازم يكون حساب غير قابل للتسجيل. اختيار الأب بيحدد النوع وطبيعة
            الرصيد تلقائيًا.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-gray-600">
              نوع الحساب
            </label>
            <Controller
              control={control}
              name="accountType"
              render={({ field }) => (
                <CompactSelect
                  options={ACCOUNT_TYPES}
                  value={field.value}
                  onChange={field.onChange}
                  isDisabled={Boolean(selectedParentRaw)}
                  placeholder="اختر نوع الحساب"
                />
              )}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600">
              طبيعة الرصيد
            </label>
            <Controller
              control={control}
              name="normalBalance"
              render={({ field }) => (
                <CompactSelect
                  options={NORMAL_BALANCES}
                  value={field.value}
                  onChange={field.onChange}
                  isDisabled={Boolean(selectedParentRaw)}
                  placeholder="اختر طبيعة الرصيد"
                />
              )}
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              {...register("isPosting")}
              className="h-4 w-4"
            />
            قابل للتسجيل عليه (حساب فرعي نهائي)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              {...register("isActive")}
              className="h-4 w-4"
            />
            فعال
          </label>
        </div>

        {isPostingValue && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            تنبيه: الحساب القابل للتسجيل لا يمكن أن يكون أبًا لحسابات أخرى
            لاحقًا.
          </p>
        )}

        {errors.root && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {errors.root.message}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting
              ? "جارِ الحفظ..."
              : isEdit
                ? "حفظ التعديلات"
                : "إضافة الحساب"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
