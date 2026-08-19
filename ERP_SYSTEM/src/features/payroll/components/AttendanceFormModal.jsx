// features/payroll/components/AttendanceFormModal.jsx

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";

import {
  useCreateEmployeeAttendanceMutation,
  useUpdateEmployeeAttendanceMutation,
  useGetEmployeesSelectQuery,
} from "../payrollApi";

import { attendanceStatusOptions } from "../payroll.constants";

// =========================================================
// Schema
// =========================================================

const schema = z
  .object({
    employeeId: z.string().min(1, "الموظف مطلوب"),

    workDate: z.string().min(1, "التاريخ مطلوب"),

    status: z.enum(["Present", "Absent"], {
      errorMap: () => ({
        message: "الحالة غير صحيحة",
      }),
    }),

    checkIn: z.string().optional(),

    checkOut: z.string().optional(),

    workDayRatio: z.string().optional(),

    workOverTimeRatio: z.string().optional(),

    workDaysDeductionRatio: z.string().optional(),

    workLocation: z.string().optional(),

    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // الحضور يحتاج وقت حضور
    if (data.status === "Present" && !data.checkIn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "وقت الحضور مطلوب للحاضر",
        path: ["checkIn"],
      });
    }

    // لو تم إدخال انصراف، يجب أن يكون هناك حضور
    if (data.checkOut && !data.checkIn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "يجب تحديد وقت الحضور أولاً",
        path: ["checkIn"],
      });
    }
  });

// =========================================================
// Default Values
// =========================================================

const defaultValues = {
  employeeId: "",
  workDate: "",
  status: "Present",
  checkIn: "",
  checkOut: "",
  workDayRatio: "FullDay",
  workOverTimeRatio: "",
  workDaysDeductionRatio: "",
  workLocation: "",
  notes: "",
};

// =========================================================
// Ratio Options
// =========================================================

const ratioOptions = [
  {
    value: "FullDay",
    label: "يوم كامل",
  },
  {
    value: "ThreeQuarterDay",
    label: "ثلاثة أرباع يوم",
  },
  {
    value: "HalfDay",
    label: "نصف يوم",
  },
  {
    value: "QuarterDay",
    label: "ربع يوم",
  },
  {
    value: "None",
    label: "بدون",
  },
];

// =========================================================
// Helpers
// =========================================================

function normalizeValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

// =========================================================
// Component
// =========================================================

export default function AttendanceFormModal({ isOpen, onClose, attendance }) {
  const isEdit = Boolean(attendance);

  // =======================================================
  // Employees
  // =======================================================

  const { data: employees } = useGetEmployeesSelectQuery();

  // =======================================================
  // Mutations
  // =======================================================

  const [createAttendance, { isLoading: isCreating }] =
    useCreateEmployeeAttendanceMutation();

  const [updateAttendance, { isLoading: isUpdating }] =
    useUpdateEmployeeAttendanceMutation();

  const isSubmitting = isCreating || isUpdating;

  // =======================================================
  // Form
  // =======================================================

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // =======================================================
  // Watch
  // =======================================================

  const status = watch("status");

  const needsTimes = status === "Present";

  // =======================================================
  // Reset
  // =======================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (attendance) {
      reset({
        employeeId: normalizeValue(attendance.employeeId),

        workDate: attendance.workDate || "",

        status: attendance.status === "Absent" ? "Absent" : "Present",

        checkIn: normalizeValue(attendance.checkIn),

        checkOut: normalizeValue(attendance.checkOut),

        workDayRatio: attendance.workDayRatio || "FullDay",

        workOverTimeRatio: attendance.workOverTimeRatio || "",

        workDaysDeductionRatio: attendance.workDaysDeductionRatio || "",

        workLocation: attendance.workLocation || "",

        notes: attendance.notes || "",
      });

      return;
    }

    reset(defaultValues);
  }, [isOpen, attendance, reset]);

  // =======================================================
  // Submit
  // =======================================================

  const onSubmit = async (data) => {
    const payload = {
      employeeId: Number(data.employeeId),

      workDate: data.workDate,

      status: data.status,

      checkIn: data.status === "Present" && data.checkIn ? data.checkIn : null,

      checkOut:
        data.status === "Present" && data.checkOut ? data.checkOut : null,

      workDayRatio:
        data.status === "Present" ? data.workDayRatio || "FullDay" : null,

      workOverTimeRatio: data.workOverTimeRatio || null,

      workDaysDeductionRatio: data.workDaysDeductionRatio || null,

      workLocation: data.workLocation?.trim() || null,

      notes: data.notes?.trim() || null,
    };

    try {
      if (isEdit) {
        await updateAttendance({
          id: attendance.id,
          ...payload,
        }).unwrap();

        toast.success("تم تحديث سجل الحضور بنجاح");
      } else {
        await createAttendance(payload).unwrap();

        toast.success("تم تسجيل الحضور بنجاح");
      }

      onClose();
    } catch (error) {
      console.error("Attendance save error:", error);

      toast.error(
        error?.data?.message ||
          error?.data?.title ||
          "حصل خطأ أثناء حفظ سجل الحضور، حاول تاني",
      );
    }
  };

  // =======================================================
  // Render
  // =======================================================

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "تعديل سجل حضور" : "تسجيل حضور / غياب"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* =================================================
            Employee
        ================================================== */}

        <div>
          <label className="block text-xs font-medium text-ink-400 mb-1">
            الموظف
          </label>

          <Controller
            name="employeeId"
            control={control}
            render={({ field }) => (
              <CompactSelect
                options={
                  employees?.map((employee) => ({
                    value: String(employee.id),
                    label: employee.name,
                  })) || []
                }
                value={field.value}
                onChange={field.onChange}
                placeholder="اختر الموظف"
                isDisabled={isEdit}
              />
            )}
          />

          {errors.employeeId && (
            <p className="text-xs text-negative mt-1">
              {errors.employeeId.message}
            </p>
          )}
        </div>

        {/* =================================================
            Date + Status
        ================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="التاريخ"
            type="date"
            {...register("workDate")}
            error={errors.workDate?.message}
          />

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              الحالة
            </label>

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <CompactSelect
                  options={attendanceStatusOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="اختر الحالة"
                />
              )}
            />

            {errors.status && (
              <p className="text-xs text-negative mt-1">
                {errors.status.message}
              </p>
            )}
          </div>
        </div>

        {/* =================================================
            Times
        ================================================== */}

        {needsTimes && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="وقت الحضور"
              type="time"
              {...register("checkIn")}
              error={errors.checkIn?.message}
            />

            <Input
              label="وقت الانصراف"
              type="time"
              {...register("checkOut")}
              error={errors.checkOut?.message}
            />
          </div>
        )}

        {/* =================================================
            Work Ratios
        ================================================== */}

        <div className="rounded-xl border border-ink-400/10 bg-ink-900/[0.02] p-3">
          <div className="mb-3">
            <p className="text-sm font-semibold text-ink-900">
              احتساب يوم العمل
            </p>

            <p className="text-[11px] text-ink-400 mt-0.5">
              تحديد نسبة اليوم والإضافي والخصم
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Work Day */}

            <div>
              <label className="block text-xs font-medium text-ink-400 mb-1">
                نسبة اليوم
              </label>

              <Controller
                name="workDayRatio"
                control={control}
                render={({ field }) => (
                  <CompactSelect
                    options={ratioOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="نسبة اليوم"
                    isDisabled={status === "Absent"}
                  />
                )}
              />
            </div>

            {/* Overtime */}

            <div>
              <label className="block text-xs font-medium text-ink-400 mb-1">
                الإضافي
              </label>

              <Controller
                name="workOverTimeRatio"
                control={control}
                render={({ field }) => (
                  <CompactSelect
                    options={ratioOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="بدون إضافي"
                  />
                )}
              />
            </div>

            {/* Deduction */}

            <div>
              <label className="block text-xs font-medium text-ink-400 mb-1">
                الخصم
              </label>

              <Controller
                name="workDaysDeductionRatio"
                control={control}
                render={({ field }) => (
                  <CompactSelect
                    options={ratioOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="بدون خصم"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* =================================================
            Work Location
        ================================================== */}

        <Input
          label="مكان العمل"
          placeholder="مثال: المكتب الرئيسي"
          {...register("workLocation")}
          error={errors.workLocation?.message}
        />

        {/* =================================================
            Notes
        ================================================== */}

        <Input
          label="ملاحظات"
          placeholder="أضف ملاحظات على سجل الحضور..."
          {...register("notes")}
          error={errors.notes?.message}
        />

        {/* =================================================
            Footer
        ================================================== */}

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
            {isSubmitting
              ? "جارِ الحفظ..."
              : isEdit
                ? "حفظ التعديلات"
                : "تسجيل الحضور"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
