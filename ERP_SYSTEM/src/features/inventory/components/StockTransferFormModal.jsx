// features/stockTransfers/components/StockTransferFormModal.jsx

import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  Loader2,
  Package,
  AlertCircle,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";

import {
  useCreateStockTransferMutation,
  useUpdateStockTransferMutation,
} from "../stockTransfersApi";

import {
  useGetStoresSelectQuery,
  useGetStoreStockReportQuery,
} from "../../stores/storesApi";

import { useGetItemsSelectQuery } from "../inventoryApi";

// ============================================================
// Schema
// ============================================================

const lineSchema = z.object({
  itemId: z
    .union([z.string(), z.number()])
    .refine((value) => String(value || "").trim() !== "", {
      message: "الصنف مطلوب",
    }),

  quantity: z
    .union([z.string(), z.number()])
    .transform((value) => Number(value))
    .refine((value) => Number.isFinite(value) && value > 0, {
      message: "الكمية يجب أن تكون أكبر من صفر",
    }),

  notes: z.string().optional(),
});

const schema = z
  .object({
    transferDate: z.string().min(1, "تاريخ التحويل مطلوب"),

    sourceStoreId: z
      .union([z.string(), z.number()])
      .refine((value) => String(value || "").trim() !== "", {
        message: "المخزن المصدر مطلوب",
      }),

    destinationStoreId: z
      .union([z.string(), z.number()])
      .refine((value) => String(value || "").trim() !== "", {
        message: "المخزن الوجهة مطلوب",
      }),

    notes: z.string().optional(),

    lines: z
      .array(lineSchema)
      .min(1, "يجب إضافة صنف واحد على الأقل")
      .max(100, "لا يمكن إضافة أكثر من 100 صنف"),
  })
  .superRefine((data, ctx) => {
    // ========================================================
    // Same store
    // ========================================================

    if (
      data.sourceStoreId &&
      data.destinationStoreId &&
      String(data.sourceStoreId) === String(data.destinationStoreId)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["destinationStoreId"],
        message: "المخزن الوجهة يجب أن يكون مختلفًا عن المخزن المصدر",
      });
    }

    // ========================================================
    // Duplicate items
    // ========================================================

    const ids = data.lines
      .map((line) => String(line.itemId || ""))
      .filter(Boolean);

    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

    if (duplicates.length > 0) {
      data.lines.forEach((line, index) => {
        if (duplicates.includes(String(line.itemId))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["lines", index, "itemId"],
            message: "هذا الصنف مضاف بالفعل",
          });
        }
      });
    }
  });

// ============================================================
// Default values
// ============================================================

const emptyLine = {
  itemId: "",
  quantity: "",
  notes: "",
};

const getDefaultValues = () => ({
  transferDate: new Date().toISOString().slice(0, 10),

  sourceStoreId: "",
  destinationStoreId: "",
  notes: "",

  lines: [
    {
      ...emptyLine,
    },
  ],
});

// ============================================================
// Main Modal
// ============================================================

export default function StockTransferFormModal({
  isOpen,
  onClose,
  transfer = null,
  onSaved,
}) {
  const isEdit = Boolean(transfer);

  // ==========================================================
  // Stores
  // ==========================================================

  const { data: storesData, isLoading: isStoresLoading } =
    useGetStoresSelectQuery();

  // ==========================================================
  // Items
  // ==========================================================

  const { data: itemsData, isLoading: isItemsLoading } =
    useGetItemsSelectQuery();

  // ==========================================================
  // Mutations
  // ==========================================================

  const [createStockTransfer, { isLoading: isCreating }] =
    useCreateStockTransferMutation();

  const [updateStockTransfer, { isLoading: isUpdating }] =
    useUpdateStockTransferMutation();

  const isSubmitting = isCreating || isUpdating;

  // ==========================================================
  // Form
  // ==========================================================

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  // ==========================================================
  // Watched values
  // ==========================================================

  const sourceStoreId = useWatch({
    control,
    name: "sourceStoreId",
  });

  const destinationStoreId = useWatch({
    control,
    name: "destinationStoreId",
  });

  const lines = useWatch({
    control,
    name: "lines",
  });

  // ==========================================================
  // Normalize stores
  // ==========================================================

  const storeOptions = useMemo(() => {
    const source = storesData?.items || storesData?.stores || storesData || [];

    if (!Array.isArray(source)) {
      return [];
    }

    return source.map((store) => ({
      value: String(store.id),

      label: store.name || store.storeName || store.code || `مخزن ${store.id}`,
    }));
  }, [storesData]);

  // ==========================================================
  // Normalize items
  // ==========================================================

  const itemOptions = useMemo(() => {
    const source = itemsData?.items || itemsData || [];

    if (!Array.isArray(source)) {
      return [];
    }

    return source.map((item) => ({
      value: String(item.id),

      label: item.code
        ? `${item.code} - ${item.name}`
        : item.name || `صنف ${item.id}`,
    }));
  }, [itemsData]);

  // ==========================================================
  // Reset form
  // ==========================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (transfer) {
      reset({
        transferDate: transfer.transferDate || "",

        sourceStoreId: String(transfer.sourceStoreId ?? ""),

        destinationStoreId: String(transfer.destinationStoreId ?? ""),

        notes: transfer.notes || "",

        lines:
          transfer.lines?.length > 0
            ? transfer.lines.map((line) => ({
                itemId: String(line.itemId ?? ""),

                quantity: String(line.quantity ?? ""),

                notes: line.notes || "",
              }))
            : [
                {
                  ...emptyLine,
                },
              ],
      });
    } else {
      reset(getDefaultValues());
    }
  }, [isOpen, transfer, reset]);

  // ==========================================================
  // Add line
  // ==========================================================

  const handleAddLine = () => {
    if (fields.length >= 100) {
      toast.error("لا يمكن إضافة أكثر من 100 صنف");

      return;
    }

    append({
      ...emptyLine,
    });
  };

  // ==========================================================
  // Remove line
  // ==========================================================

  const handleRemoveLine = (index) => {
    if (fields.length === 1) {
      setValue(`lines.${index}`, {
        ...emptyLine,
      });

      return;
    }

    remove(index);
  };

  // ==========================================================
  // Submit
  // ==========================================================

  const onSubmit = async (data) => {
    const payload = {
      transferDate: data.transferDate,

      sourceStoreId: Number(data.sourceStoreId),

      destinationStoreId: Number(data.destinationStoreId),

      notes: data.notes?.trim() || null,

      lines: data.lines.map((line) => ({
        itemId: Number(line.itemId),

        quantity: Number(line.quantity),

        notes: line.notes?.trim() || null,
      })),
    };

    try {
      if (isEdit) {
        await updateStockTransfer({
          id: transfer.id,

          ...payload,

          rowVersion: transfer.rowVersion,
        }).unwrap();

        toast.success("تم تحديث التحويل المخزني بنجاح");
      } else {
        await createStockTransfer(payload).unwrap();

        toast.success("تم إنشاء التحويل المخزني بنجاح");
      }

      onSaved?.();
      onClose?.();
    } catch (error) {
      console.error("Stock transfer save error:", error);

      const message =
        error?.data?.detail ||
        error?.data?.title ||
        "حدث خطأ أثناء حفظ التحويل المخزني";

      toast.error(message);
    }
  };

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <Modal
      wide
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "تعديل تحويل مخزني" : "تحويل مخزني جديد"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* ====================================================
            Header
        ===================================================== */}

        <div className="grid grid-cols-1 gap-4">
          <Input
            label="تاريخ التحويل"
            type="date"
            {...register("transferDate")}
            error={errors.transferDate?.message}
          />

          {/* Source Store */}

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              المخزن المصدر
            </label>

            <Controller
              name="sourceStoreId"
              control={control}
              render={({ field }) => (
                <CompactSelect
                  options={storeOptions}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  placeholder={
                    isStoresLoading
                      ? "جاري تحميل المخازن..."
                      : "اختر المخزن المصدر"
                  }
                  isDisabled={isStoresLoading}
                />
              )}
            />

            {errors.sourceStoreId && (
              <p className="mt-1 text-xs text-negative">
                {errors.sourceStoreId.message}
              </p>
            )}
          </div>

          {/* Destination Store */}

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              المخزن الوجهة
            </label>

            <Controller
              name="destinationStoreId"
              control={control}
              render={({ field }) => (
                <CompactSelect
                  options={storeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={
                    isStoresLoading
                      ? "جاري تحميل المخازن..."
                      : "اختر المخزن الوجهة"
                  }
                  isDisabled={isStoresLoading}
                />
              )}
            />

            {errors.destinationStoreId && (
              <p className="mt-1 text-xs text-negative">
                {errors.destinationStoreId.message}
              </p>
            )}
          </div>
        </div>

        {/* ====================================================
            Same Store Warning
        ===================================================== */}

        {sourceStoreId &&
          destinationStoreId &&
          String(sourceStoreId) === String(destinationStoreId) && (
            <div className="flex items-start gap-2 rounded-xl border border-negative/15 bg-negative/5 px-3 py-2.5">
              <AlertCircle
                size={16}
                className="text-negative shrink-0 mt-0.5"
              />

              <p className="text-xs text-negative">
                لا يمكن التحويل من المخزن إلى نفس المخزن.
              </p>
            </div>
          )}

        {/* ====================================================
            Lines Header
        ===================================================== */}

        <div className="flex items-center justify-between gap-3 pt-2">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">
              أصناف التحويل
            </h3>

            <p className="text-[11px] text-ink-400 mt-0.5">
              اختر الصنف ليظهر رصيده الحالي في المخزن المصدر
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleAddLine}
            disabled={fields.length >= 100}
            className="h-9"
          >
            <Plus size={14} />
            إضافة صنف
          </Button>
        </div>

        {/* ====================================================
            Source Store Notice
        ===================================================== */}

        {!sourceStoreId && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-700">
            <AlertCircle size={15} />

            <span>اختر المخزن المصدر أولاً حتى يتم عرض رصيد الأصناف.</span>
          </div>
        )}

        {/* ====================================================
            Lines
        ===================================================== */}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <StockTransferLine
              key={field.id}
              index={index}
              control={control}
              register={register}
              errors={errors}
              remove={() => handleRemoveLine(index)}
              itemOptions={itemOptions}
              sourceStoreId={sourceStoreId}
              lines={lines}
              isItemsLoading={isItemsLoading}
            />
          ))}
        </div>

        {/* ====================================================
            Notes
        ===================================================== */}

        <Input
          label="ملاحظات"
          placeholder="ملاحظات التحويل..."
          {...register("notes")}
        />

        {/* ====================================================
            Footer
        ===================================================== */}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-ink-400/10">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !sourceStoreId ||
              !destinationStoreId ||
              String(sourceStoreId) === String(destinationStoreId)
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save size={15} />

                {isEdit ? "حفظ التعديلات" : "إنشاء التحويل"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ============================================================
// Stock Transfer Line
// ============================================================

function StockTransferLine({
  index,
  control,
  register,
  errors,
  remove,
  itemOptions,
  sourceStoreId,
  lines,
  isItemsLoading,
}) {
  // ==========================================================
  // Watched values
  // ==========================================================

  const itemId = useWatch({
    control,
    name: `lines.${index}.itemId`,
  });

  const quantity = useWatch({
    control,
    name: `lines.${index}.quantity`,
  });

  // ==========================================================
  // Normalize IDs
  // ==========================================================

  const normalizedStoreId = Number(sourceStoreId);

  const normalizedItemId = Number(itemId);

  const hasValidStore =
    Number.isFinite(normalizedStoreId) && normalizedStoreId > 0;

  const hasValidItem =
    Number.isFinite(normalizedItemId) && normalizedItemId > 0;

  // ==========================================================
  // Get current stock
  //
  // IMPORTANT:
  //
  // storesApi expects camelCase:
  //
  // storeId
  // itemId
  // pageNumber
  // pageSize
  //
  // It converts them internally to:
  //
  // StoreId
  // ItemId
  // PageNumber
  // PageSize
  //
  // We intentionally don't send hasStock=true
  // so zero balance can still be detected.
  // ==========================================================

  const {
    data: stockData,
    isLoading: isStockLoading,
    isFetching: isStockFetching,
    isError: isStockError,
    error: stockError,
  } = useGetStoreStockReportQuery(
    {
      storeId: normalizedStoreId,

      itemId: normalizedItemId,

      pageNumber: 1,

      pageSize: 1,
    },
    {
      skip: !hasValidStore || !hasValidItem,

      refetchOnMountOrArgChange: true,
    },
  );

  // ==========================================================
  // Extract stock item
  // ==========================================================

  const stockItem = useMemo(() => {
    if (!stockData) {
      return null;
    }

    const items =
      stockData?.items ??
      stockData?.data?.items ??
      stockData?.results ??
      stockData?.data ??
      [];

    if (!Array.isArray(items) || items.length === 0) {
      return null;
    }

    return items[0];
  }, [stockData]);

  // ==========================================================
  // Current balance
  // ==========================================================

  const balance = useMemo(() => {
    if (!hasValidStore || !hasValidItem) {
      return null;
    }

    if (!stockItem) {
      return 0;
    }

    const rawBalance =
      stockItem.balance ??
      stockItem.currentBalance ??
      stockItem.availableBalance ??
      stockItem.quantity ??
      stockItem.stockBalance ??
      stockItem.currentStock ??
      0;

    const parsedBalance = Number(rawBalance);

    return Number.isFinite(parsedBalance) ? parsedBalance : 0;
  }, [hasValidStore, hasValidItem, stockItem]);

  // ==========================================================
  // Loading
  // ==========================================================

  const isStockLoadingState =
    hasValidStore && hasValidItem && (isStockLoading || isStockFetching);

  // ==========================================================
  // Duplicate item
  // ==========================================================

  const isDuplicate = useMemo(() => {
    if (!itemId || !lines) {
      return false;
    }

    return lines.some(
      (line, lineIndex) =>
        lineIndex !== index &&
        line?.itemId &&
        String(line.itemId) === String(itemId),
    );
  }, [lines, index, itemId]);

  // ==========================================================
  // Quantity
  // ==========================================================

  const numericQuantity = Number(quantity || 0);

  const quantityExceedsBalance =
    balance !== null && !isStockLoadingState && numericQuantity > balance;

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div
      className={`
        rounded-2xl
        border
        bg-white
        p-3
        transition-all
        ${
          quantityExceedsBalance || isDuplicate
            ? "border-negative/30 bg-negative/[0.015]"
            : "border-ink-400/10"
        }
      `}
    >
      {/* ======================================================
          Line Header
      ======================================================= */}

      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <Package size={15} />
          </div>

          <div>
            <p className="text-xs font-semibold text-ink-900">
              الصنف {index + 1}
            </p>

            {hasValidItem && hasValidStore && (
              <p className="text-[10px] text-ink-400 mt-0.5">
                الرصيد الحالي في المخزن المصدر:{" "}
                {isStockLoadingState ? (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" />
                    جاري القراءة...
                  </span>
                ) : (
                  <strong
                    className={
                      balance > 0 ? "text-positive num" : "text-negative num"
                    }
                  >
                    {balance}
                  </strong>
                )}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={remove}
          className="
            w-8
            h-8
            rounded-lg
            flex
            items-center
            justify-center
            text-ink-400
            hover:text-negative
            hover:bg-negative/10
            transition-colors
          "
          title="حذف الصنف"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* ======================================================
          Main Line
      ======================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_150px] gap-3">
        {/* ====================================================
            Item
        ===================================================== */}

        <div>
          <label className="block text-xs font-medium text-ink-400 mb-1">
            الصنف
          </label>

          <Controller
            name={`lines.${index}.itemId`}
            control={control}
            render={({ field }) => (
              <CompactSelect
                options={itemOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder={
                  isItemsLoading ? "جاري تحميل الأصناف..." : "اختر الصنف"
                }
                isDisabled={isItemsLoading}
              />
            )}
          />

          {/* ==================================================
              No Source Store
          =================================================== */}

          {hasValidItem && !hasValidStore && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <AlertCircle size={13} className="text-amber-600" />

              <span className="text-[11px] text-amber-700">
                اختر المخزن المصدر أولاً لمعرفة الرصيد.
              </span>
            </div>
          )}

          {/* ==================================================
              Stock Information
          =================================================== */}

          {hasValidItem && hasValidStore && (
            <div className="mt-2">
              {isStockLoadingState ? (
                <div className="flex items-center gap-2 rounded-lg bg-ink-400/5 px-3 py-2">
                  <Loader2 size={13} className="animate-spin text-ink-400" />

                  <span className="text-[11px] text-ink-400">
                    جاري جلب رصيد الصنف من المخزن...
                  </span>
                </div>
              ) : isStockError ? (
                <div className="flex items-start gap-2 rounded-lg bg-negative/5 border border-negative/10 px-3 py-2">
                  <AlertCircle
                    size={13}
                    className="text-negative mt-0.5 shrink-0"
                  />

                  <div>
                    <span className="text-[11px] text-negative">
                      تعذر جلب رصيد الصنف من المخزن المصدر.
                    </span>

                    {stockError?.data?.detail && (
                      <p className="text-[10px] text-negative/70 mt-0.5">
                        {stockError.data.detail}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={`
                      flex
                      items-center
                      justify-between
                      gap-3
                      rounded-lg
                      px-3
                      py-2
                      border
                      ${
                        balance > 0
                          ? "bg-positive/5 border-positive/10"
                          : "bg-negative/5 border-negative/10"
                      }
                    `}
                >
                  <div className="flex items-center gap-2">
                    <Package
                      size={13}
                      className={
                        balance > 0 ? "text-positive" : "text-negative"
                      }
                    />

                    <span className="text-[11px] text-ink-500">
                      الرصيد المتاح بالمخزن
                    </span>
                  </div>

                  <strong
                    className={`
                        num
                        text-sm
                        ${balance > 0 ? "text-positive" : "text-negative"}
                      `}
                  >
                    {balance}
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* Duplicate */}

          {isDuplicate && (
            <p className="text-[11px] text-negative mt-1.5">
              هذا الصنف مضاف بالفعل في التحويل.
            </p>
          )}

          {/* Error */}

          {errors?.lines?.[index]?.itemId && (
            <p className="text-xs text-negative mt-1">
              {errors.lines[index].itemId.message}
            </p>
          )}
        </div>

        {/* ====================================================
            Quantity
        ===================================================== */}

        <div>
          <Input
            label="الكمية"
            type="number"
            min="0"
            step="any"
            placeholder="0"
            {...register(`lines.${index}.quantity`, {
              valueAsNumber: true,

              validate: (value) => {
                const numericValue = Number(value);

                if (!Number.isFinite(numericValue)) {
                  return "أدخل كمية صحيحة";
                }

                if (numericValue <= 0) {
                  return "الكمية يجب أن تكون أكبر من صفر";
                }

                if (
                  balance !== null &&
                  !isStockLoadingState &&
                  numericValue > balance
                ) {
                  return `الرصيد المتاح ${balance}`;
                }

                return true;
              },
            })}
            error={errors?.lines?.[index]?.quantity?.message}
          />

          {hasValidItem &&
            hasValidStore &&
            !isStockLoadingState &&
            balance !== null && (
              <div className="mt-1 flex justify-between text-[10px]">
                <span className="text-ink-400">المتاح</span>

                <span
                  className={
                    quantityExceedsBalance
                      ? "text-negative font-semibold num"
                      : "text-positive font-semibold num"
                  }
                >
                  {balance}
                </span>
              </div>
            )}
        </div>
      </div>

      {/* ======================================================
          Quantity Warning
      ======================================================= */}

      {quantityExceedsBalance && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-negative/15 bg-negative/5 px-3 py-2.5">
          <AlertCircle size={15} className="text-negative shrink-0 mt-0.5" />

          <div className="text-xs text-negative">
            <p className="font-semibold">الكمية المطلوبة أكبر من الرصيد</p>

            <p className="mt-0.5">
              الرصيد المتاح في المخزن المصدر:{" "}
              <strong className="num">{balance}</strong>
            </p>
          </div>
        </div>
      )}

      {/* ======================================================
          Zero Stock
      ======================================================= */}

      {hasValidItem &&
        hasValidStore &&
        !isStockLoadingState &&
        !isStockError &&
        balance === 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
            <AlertCircle size={14} className="text-amber-600" />

            <span className="text-xs text-amber-700">
              لا يوجد رصيد متاح لهذا الصنف في المخزن المصدر.
            </span>
          </div>
        )}

      {/* ======================================================
          Notes
      ======================================================= */}

      <div className="mt-3">
        <Input
          label="ملاحظات الصنف"
          placeholder="ملاحظات اختيارية..."
          {...register(`lines.${index}.notes`)}
        />
      </div>
    </div>
  );
}
