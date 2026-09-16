import { useEffect, useMemo } from "react";
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
  useGetEmployeeAttendancesSelectQuery,
} from "../payrollApi";

import { attendanceStatusOptions, dayRatioOptions } from "../payroll.constants";

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
    if (data.status === "Present" && !data.checkIn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "وقت الحضور مطلوب للحاضر",
        path: ["checkIn"],
      });
    }

    if (data.checkOut && !data.checkIn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "يجب تحديد وقت الحضور أولاً",
        path: ["checkIn"],
      });
    }
  });

const defaultValues = {
  employeeId: "",
  workDate: "",
  status: "Present",
  checkIn: "",
  checkOut: "",
  workDayRatio: "1",
  workOverTimeRatio: "",
  workDaysDeductionRatio: "",
  workLocation: "",
  notes: "",
};

function normalizeValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function normalizeStatus(status) {
  if (status === "Present" || status === 1 || status === "1") {
    return "Present";
  }

  if (status === "Absent" || status === 0 || status === "0") {
    return "Absent";
  }

  return "Present";
}

function normalizeRatio(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const map = {
    OneDay: "1",
    FullDay: "1",
    TwoDays: "2",
    ThreeDays: "3",
    FourDays: "4",
    FiveDays: "5",
    ThreeQuarterDay: "6",
    TwoThirdsDay: "7",
    HalfDay: "8",
    ThirdDay: "9",
    QuarterDay: "10",
  };

  if (map[value]) {
    return map[value];
  }

  return String(value);
}

function normalizeTime(value) {
  if (!value) return "";

  const stringValue = String(value);

  if (stringValue.includes("T")) {
    const timePart = stringValue.split("T")[1];

    return timePart?.slice(0, 5) || "";
  }

  return stringValue.slice(0, 5);
}

function toApiTime(value) {
  if (!value) return null;

  return value.length === 5 ? `${value}:00` : value;
}

export default function AttendanceFormModal({ isOpen, onClose, attendance }) {
  const isEdit = Boolean(attendance);

  const { data: employeesData = [], isLoading: employeesLoading } =
    useGetEmployeeAttendancesSelectQuery();

  const [createAttendance, { isLoading: isCreating }] =
    useCreateEmployeeAttendanceMutation();

  const [updateAttendance, { isLoading: isUpdating }] =
    useUpdateEmployeeAttendanceMutation();

  const isSubmitting = isCreating || isUpdating;

  const employees = useMemo(() => {
    if (!Array.isArray(employeesData)) {
      return [];
    }

    return employeesData
      .filter((employee) => employee?.id != null)
      .map((employee) => ({
        id: Number(employee.id),
        name: employee.name || `موظف #${employee.id}`,
      }));
  }, [employeesData]);

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: String(employee.id),
        label: employee.name,
      })),
    [employees],
  );

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

  const status = watch("status");
  const needsTimes = status === "Present";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (attendance) {
      reset({
        employeeId: normalizeValue(attendance.employeeId),

        workDate: attendance.workDate
          ? String(attendance.workDate).split("T")[0]
          : "",

        status: normalizeStatus(attendance.status),

        checkIn: normalizeTime(attendance.checkIn),

        checkOut: normalizeTime(attendance.checkOut),

        workDayRatio: normalizeRatio(attendance.workDayRatio) || "1",

        workOverTimeRatio: normalizeRatio(attendance.workOverTimeRatio),

        workDaysDeductionRatio: normalizeRatio(
          attendance.workDaysDeductionRatio,
        ),

        workLocation: attendance.workLocation || "",

        notes: attendance.notes || "",
      });

      return;
    }

    reset(defaultValues);
  }, [isOpen, attendance, reset]);

  const onSubmit = async (data) => {
    const payload = {
      employeeId: Number(data.employeeId),

      workDate: data.workDate,

      status: data.status,

      checkIn:
        data.status === "Present" && data.checkIn
          ? toApiTime(data.checkIn)
          : null,

      checkOut:
        data.status === "Present" && data.checkOut
          ? toApiTime(data.checkOut)
          : null,

      workDayRatio:
        data.status === "Present" ? Number(data.workDayRatio || 1) : null,

      workOverTimeRatio: data.workOverTimeRatio
        ? Number(data.workOverTimeRatio)
        : null,

      workDaysDeductionRatio: data.workDaysDeductionRatio
        ? Number(data.workDaysDeductionRatio)
        : null,

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

      const validationErrors = error?.data?.errors;

      const firstValidationError = validationErrors
        ? Object.values(validationErrors).flat().find(Boolean)
        : null;

      toast.error(
        firstValidationError ||
          error?.data?.message ||
          error?.data?.title ||
          "حصل خطأ أثناء حفظ سجل الحضور، حاول تاني",
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "تعديل سجل حضور" : "تسجيل حضور / غياب"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-ink-400 mb-1">
            الموظف
          </label>

          <Controller
            name="employeeId"
            control={control}
            render={({ field }) => (
              <CompactSelect
                options={employeeOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder={
                  employeesLoading ? "جاري تحميل الموظفين..." : "اختر الموظف"
                }
                isDisabled={isEdit || employeesLoading}
              />
            )}
          />

          {errors.employeeId && (
            <p className="text-xs text-negative mt-1">
              {errors.employeeId.message}
            </p>
          )}
        </div>

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
            <div>
              <label className="block text-xs font-medium text-ink-400 mb-1">
                نسبة اليوم
              </label>

              <Controller
                name="workDayRatio"
                control={control}
                render={({ field }) => (
                  <CompactSelect
                    options={dayRatioOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="نسبة اليوم"
                    isDisabled={status === "Absent"}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-400 mb-1">
                الإضافي
              </label>

              <Controller
                name="workOverTimeRatio"
                control={control}
                render={({ field }) => (
                  <CompactSelect
                    options={dayRatioOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="بدون إضافي"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-400 mb-1">
                الخصم
              </label>

              <Controller
                name="workDaysDeductionRatio"
                control={control}
                render={({ field }) => (
                  <CompactSelect
                    options={dayRatioOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="بدون خصم"
                  />
                )}
              />
            </div>
          </div>
        </div>

        <Input
          label="مكان العمل"
          placeholder="مثال: المكتب الرئيسي"
          {...register("workLocation")}
          error={errors.workLocation?.message}
        />

        <Input
          label="ملاحظات"
          placeholder="أضف ملاحظات على سجل الحضور..."
          {...register("notes")}
          error={errors.notes?.message}
        />

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
