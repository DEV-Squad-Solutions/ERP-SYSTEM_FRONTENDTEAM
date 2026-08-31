// features/fiscalYears/components/FiscalYearFormModal.jsx
//
// TODO INTEGRATION: نفس نمط EmployeeFormModal - بيفترض Modal.jsx بنفس
// الـprops (isOpen/onClose/title/children).
//
// ملحوظة مهمة: الـPUT بيتطلب rowVersion (concurrency token) - لازم نبعت
// نفس القيمة اللي جاية من fiscalYear.rowVersion في الـGET/list، وإلا
// السيرفر بيرفض بـ400 Validation.Failed. الحقل ده مش ظاهر للمستخدم،
// بيتبعت hidden جوه الفورم.

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarRange } from "lucide-react";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import {
  useCreateFiscalYearMutation,
  useUpdateFiscalYearMutation,
} from "../fiscalYearsApi";

const schema = z
  .object({
    name: z.string().min(1, "اسم السنة المالية مطلوب").max(200),
    startDate: z.string().min(1, "تاريخ البداية مطلوب"),
    endDate: z.string().min(1, "تاريخ النهاية مطلوب"),
    isCurrent: z.boolean().default(true),
    rowVersion: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.startDate &&
      data.endDate &&
      new Date(data.startDate) >= new Date(data.endDate)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "يجب أن يكون تاريخ النهاية بعد تاريخ البداية",
      });
    }
  });

const defaultValues = {
  name: "",
  startDate: "",
  endDate: "",
  isCurrent: true,
  rowVersion: "",
};

export default function FiscalYearFormModal({
  isOpen,
  onClose,
  fiscalYear,
  onSaved,
}) {
  const isEdit = Boolean(fiscalYear);
  const [createFiscalYear, { isLoading: isCreating }] =
    useCreateFiscalYearMutation();
  const [updateFiscalYear, { isLoading: isUpdating }] =
    useUpdateFiscalYearMutation();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const wasOpenRef = { current: false };
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      reset(
        fiscalYear
          ? {
              name: fiscalYear.name,
              startDate: fiscalYear.startDate,
              endDate: fiscalYear.endDate,
              isCurrent: fiscalYear.isCurrent,
              rowVersion: fiscalYear.rowVersion || "",
            }
          : defaultValues,
      );
    }
    wasOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        if (!data.rowVersion) {
          toast.error(
            "تعذر التحقق من إصدار السجل، يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى",
          );
          return;
        }

        await updateFiscalYear({
          id: fiscalYear.id,
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          isCurrent: data.isCurrent,
          rowVersion: data.rowVersion,
        }).unwrap();

        toast.success("تم تحديث السنة المالية بنجاح");
      } else {
        await createFiscalYear({
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          isCurrent: data.isCurrent,
        }).unwrap();

        toast.success("تم إنشاء السنة المالية بنجاح");
      }
      onSaved?.();
      onClose();
    } catch (error) {
      console.error("Save fiscal year error:", error);

      const rowVersionError = error?.data?.errors?.RowVersion?.[0];

      toast.error(
        rowVersionError ||
          error?.data?.detail ||
          error?.data?.title ||
          "حدث خطأ أثناء حفظ السنة المالية",
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "تعديل السنة المالية" : "إضافة سنة مالية جديدة"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register("rowVersion")} />

        <div className="flex items-center gap-3 rounded-xl border border-primary-500/15 bg-primary-50/40 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600">
            <CalendarRange size={17} />
          </div>
          <p className="text-xs leading-relaxed text-ink-600">
            حدد اسم السنة المالية وفترتها الزمنية. لن يمكن تعديل هذه البيانات
            بعد إغلاق السنة.
          </p>
        </div>

        <Input
          label="اسم السنة المالية"
          placeholder="مثال: 2026"
          {...register("name")}
          error={errors.name?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="تاريخ البداية"
            type="date"
            {...register("startDate")}
            error={errors.startDate?.message}
          />
          <Input
            label="تاريخ النهاية"
            type="date"
            {...register("endDate")}
            error={errors.endDate?.message}
          />
        </div>

        <label className="flex items-center gap-2.5 rounded-xl border border-ink-400/10 bg-ink-400/[0.02] px-3.5 py-3 text-sm text-ink-700 cursor-pointer select-none transition-colors hover:bg-ink-400/5">
          <input
            type="checkbox"
            {...register("isCurrent")}
            className="h-4 w-4 rounded border-ink-400/30 accent-primary-500"
          />
          جعلها السنة المالية الحالية
        </label>

        <div className="flex justify-end gap-2 pt-3 border-t border-ink-400/10">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "جارِ الحفظ..." : "حفظ"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
