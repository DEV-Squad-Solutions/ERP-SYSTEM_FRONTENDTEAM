// features/payroll/components/PayrollEntryFormModal.jsx

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";

import {
  useCreatePayrollEntryMutation,
  useGetEmployeesSelectQuery,
} from "../payrollApi";

const defaultValues = {
  startDate: "",
  endDate: "",
  employeeId: "",
  bonus: "0",
  deduction: "0",
  overtimebydayunit: "0",
  cashboxId: "",
  cashMovementTypeId: "",
};

export default function PayrollEntryFormModal({ isOpen, onClose }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const { data: employees } = useGetEmployeesSelectQuery();

  const [createPayroll, { isLoading }] = useCreatePayrollEntryMutation();

  useEffect(() => {
    if (isOpen) {
      reset({
        ...defaultValues,
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    if (!data.employeeId) {
      toast.error("الموظف مطلوب");
      return;
    }

    try {
      await createPayroll({
        startDate: data.startDate,
        endDate: data.endDate,

        employeeId: Number(data.employeeId),

        bonus: Number(data.bonus || 0),
        deduction: Number(data.deduction || 0),

        overtimebydayunit: Number(data.overtimebydayunit || 0),

        cashboxId: Number(data.cashboxId),
        cashMovementTypeId: Number(data.cashMovementTypeId),
      }).unwrap();

      toast.success("تم إنشاء قيد المرتب بنجاح");

      onClose();
    } catch (error) {
      toast.error(error?.data?.message || "حصل خطأ أثناء إنشاء المرتب");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إنشاء مرتب">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
        <Controller
          name="employeeId"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-xs font-medium text-ink-400 mb-1">
                الموظف
              </label>

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
              />

              {errors.employeeId && (
                <p className="text-xs text-negative mt-1">الموظف مطلوب</p>
              )}
            </div>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="من تاريخ"
            type="date"
            {...register("startDate", {
              required: "التاريخ مطلوب",
            })}
            error={errors.startDate?.message}
          />

          <Input
            label="إلى تاريخ"
            type="date"
            {...register("endDate", {
              required: "التاريخ مطلوب",
            })}
            error={errors.endDate?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="الإضافات"
            type="number"
            min="0"
            step="0.01"
            {...register("bonus")}
          />

          <Input
            label="الخصومات"
            type="number"
            min="0"
            step="0.01"
            {...register("deduction")}
          />
        </div>

        <Input
          label="وحدة الإضافي باليوم"
          type="number"
          min="0"
          step="0.01"
          {...register("overtimebydayunit")}
        />

        <Input
          label="رقم الخزنة"
          type="number"
          min="1"
          {...register("cashboxId", {
            required: "الخزنة مطلوبة",
          })}
        />

        <Input
          label="نوع حركة الخزنة"
          type="number"
          min="1"
          {...register("cashMovementTypeId", {
            required: "نوع حركة الخزنة مطلوب",
          })}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-ink-400/10">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "جارِ الإنشاء..." : "إنشاء المرتب"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
