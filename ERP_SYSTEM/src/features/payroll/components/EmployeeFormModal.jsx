// features/payroll/components/EmployeeFormModal.jsx
//
// TODO INTEGRATION: بيفترض وجود Modal.jsx في shared/components/ui/Modal
// بنفس نمط Button/Input/CompactSelect (مش متأكد من الـprops بتاعته بالظبط،
// اتبنى على افتراض isOpen/onClose/title/children - عدّل الاستيراد والـprops
// لو مختلفة عندك).

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
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
} from "../payrollApi";
import { employeeTypeOptions } from "../payroll.constants";

const schema = z.object({
  code: z.string().min(1, "رقم الموظف مطلوب"),
  name: z.string().min(1, "اسم الموظف مطلوب"),
  jobTitle: z.string().min(1, "الوظيفة مطلوبة"),
  phoneNumber: z.string().optional(),
  email: z
    .string()
    .email("بريد إلكتروني غير صحيح")
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
  employeeType: z.string().min(1, "نوع الأجر مطلوب"),
  salary: z.coerce.number().min(0, "لازم تكون قيمة موجبة"),
  requiredWorkingDaysPerMonth: z.coerce.number().min(0).optional(),
  lastDayOfReceivingSalary: z.string().optional(),
  isActive: z.boolean().default(true),
});

const defaultValues = {
  code: "",
  name: "",
  jobTitle: "",
  phoneNumber: "",
  email: "",
  address: "",
  employeeType: "Daily",
  salary: 0,
  requiredWorkingDaysPerMonth: 0,
  lastDayOfReceivingSalary: "",
  isActive: true,
};

export default function EmployeeFormModal({
  isOpen,
  onClose,
  employee,
  onSaved,
}) {
  const isEdit = Boolean(employee);
  const [createEmployee, { isLoading: isCreating }] =
    useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // reset فقط عند closed -> open (نفس pattern الحفاظ على تعديلات المستخدم أثناء SignalR refetch)
  const wasOpenRef = { current: false };
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      reset(employee ? { ...defaultValues, ...employee } : defaultValues);
    }
    wasOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateEmployee({ id: employee.code, ...data }).unwrap();
        toast.success("تم تحديث بيانات الموظف بنجاح");
      } else {
        await createEmployee(data).unwrap();
        toast.success("تم إضافة الموظف بنجاح");
      }
      onSaved?.();
      onClose();
    } catch {
      toast.error("حصل خطأ أثناء الحفظ، حاول تاني");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="رقم الموظف"
            {...register("code")}
            error={errors.code?.message}
            disabled={isEdit}
          />
          <Input
            label="اسم الموظف"
            {...register("name")}
            error={errors.name?.message}
          />
          <Input
            label="الوظيفة"
            {...register("jobTitle")}
            error={errors.jobTitle?.message}
          />
          <Input
            label="رقم الهاتف"
            {...register("phoneNumber")}
            error={errors.phoneNumber?.message}
          />
          <Input
            label="البريد الإلكتروني"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="العنوان"
            {...register("address")}
            error={errors.address?.message}
          />

          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              نوع الأجر
            </label>
            <Controller
              name="employeeType"
              control={control}
              render={({ field }) => (
                <CompactSelect
                  options={employeeTypeOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.employeeType && (
              <p className="text-xs text-negative mt-1">
                {errors.employeeType.message}
              </p>
            )}
          </div>

          <Input
            label="الراتب الأساسي"
            type="number"
            step="0.01"
            {...register("salary")}
            error={errors.salary?.message}
          />
          <Input
            label="أيام العمل المطلوبة بالشهر"
            type="number"
            {...register("requiredWorkingDaysPerMonth")}
            error={errors.requiredWorkingDaysPerMonth?.message}
          />
          <Input
            label="آخر يوم استحقاق مرتب"
            type="date"
            {...register("lastDayOfReceivingSalary")}
            error={errors.lastDayOfReceivingSalary?.message}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register("isActive")}
            className="rounded border-ink-400/30 accent-primary-500"
          />
          موظف نشط
        </label>

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
