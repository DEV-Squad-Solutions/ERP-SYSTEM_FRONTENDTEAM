// features/payroll/components/AttendanceFormModal.jsx
//
// فورم تصحيح/تعديل سجل حضور فردي واحد. الاستخدام الأساسي للتسجيل اليومي
// بقى عن طريق AttendanceQuickEntry (بانل Excel-style)، والـModal ده مخصص
// للتصحيح الفردي بعد كده (زرار تعديل في جدول AttendancePage).

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

const schema = z
  .object({
    employeeId: z.string().min(1, "الموظف مطلوب"),
    workDate: z.string().min(1, "التاريخ مطلوب"),
    status: z.string().min(1, "الحالة مطلوبة"),
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) =>
      data.status === "Present" || data.status === "Late"
        ? Boolean(data.checkIn)
        : true,
    { message: "وقت الحضور مطلوب للحالة دي", path: ["checkIn"] },
  );

const defaultValues = {
  employeeId: "",
  workDate: "",
  status: "Present",
  checkIn: "",
  checkOut: "",
  notes: "",
};

export default function AttendanceFormModal({ isOpen, onClose, attendance }) {
  const isEdit = Boolean(attendance);
  const { data: employees } = useGetEmployeesSelectQuery();
  const [createAttendance, { isLoading: isCreating }] =
    useCreateEmployeeAttendanceMutation();
  const [updateAttendance, { isLoading: isUpdating }] =
    useUpdateEmployeeAttendanceMutation();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues });

  const status = watch("status");
  const needsTimes = status === "Present" || status === "Late";

  // reset فقط عند closed -> open (نفس pattern الحفاظ على تعديلات المستخدم)
  const wasOpenRef = { current: false };
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      reset(
        attendance
          ? {
              employeeId: attendance.employeeId,
              workDate: attendance.workDate,
              status: attendance.status,
              checkIn: attendance.checkIn || "",
              checkOut: attendance.checkOut || "",
              notes: attendance.notes || "",
            }
          : defaultValues,
      );
    }
    wasOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const onSubmit = async (data) => {
    const payload = {
      employeeId: data.employeeId,
      workDate: data.workDate,
      status: data.status,
      checkIn: needsTimes ? data.checkIn : null,
      checkOut: needsTimes ? data.checkOut : null,
      notes: data.notes,
    };
    try {
      if (isEdit) {
        await updateAttendance({ id: attendance.id, ...payload }).unwrap();
        toast.success("تم تحديث السجل بنجاح");
      } else {
        await createAttendance(payload).unwrap();
        toast.success("تم تسجيل الحضور بنجاح");
      }
      onClose();
    } catch {
      toast.error("حصل خطأ أثناء الحفظ، حاول تاني");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "تعديل سجل حضور" : "تسجيل حضور/غياب"}
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
                options={
                  employees?.map((e) => ({ value: e.id, label: e.name })) || []
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

        <div className="grid grid-cols-2 gap-4">
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
                />
              )}
            />
          </div>
        </div>

        {needsTimes && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="وقت الحضور"
              type="time"
              {...register("checkIn")}
              error={errors.checkIn?.message}
            />
            <Input label="وقت الانصراف" type="time" {...register("checkOut")} />
          </div>
        )}

        <Input label="ملاحظات" {...register("notes")} />

        <div className="flex justify-end gap-2 pt-2 border-t border-ink-400/10">
          <Button type="button" variant="outline" onClick={onClose}>
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
