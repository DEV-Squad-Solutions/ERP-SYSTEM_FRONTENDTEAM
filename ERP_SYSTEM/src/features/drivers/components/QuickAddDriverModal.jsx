import { useEffect, useState } from "react";
import { toast } from "sonner";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import {
  useCreateDriverMutation,
  useUpdateDriverMutation,
} from "../driversApi";

const emptyForm = {
  code: "",
  name: "",
  phoneNumber: "",
  nationalId: "",
  licenseNumber: "",
  licenseExpiryDate: "",
  isActive: true,
};

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onSaved?: (driver: Object) => void,
 *   driver?: Object | null
 * }} props
 */
export default function QuickAddDriverModal({
  isOpen,
  onClose,
  onSaved,
  driver = null,
}) {
  const isEdit = Boolean(driver);
  const [form, setForm] = useState(emptyForm);
  const [createDriver, { isLoading: isCreating }] = useCreateDriverMutation();
  const [updateDriver, { isLoading: isUpdating }] = useUpdateDriverMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      driver
        ? {
            code: driver.code ?? "",
            name: driver.name ?? "",
            phoneNumber: driver.phoneNumber ?? "",
            nationalId: driver.nationalId ?? "",
            licenseNumber: driver.licenseNumber ?? "",
            licenseExpiryDate: driver.licenseExpiryDate ?? "",
            isActive: driver.isActive ?? true,
          }
        : emptyForm,
    );
  }, [driver, isOpen]);

  const handleChange = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const saved = isEdit
        ? await updateDriver({ id: driver.id, ...form }).unwrap()
        : await createDriver(form).unwrap();

      toast.success(
        isEdit ? "تم تحديث بيانات السائق" : "تم إضافة السائق بنجاح",
      );
      onSaved?.(saved);
      onClose();
    } catch {
      toast.error(isEdit ? "فشل تحديث السائق" : "فشل إضافة السائق");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "تعديل بيانات السائق" : "إضافة سائق جديد"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="الكود"
          value={form.code}
          onChange={handleChange("code")}
        />
        <Input
          label="اسم السائق"
          value={form.name}
          onChange={handleChange("name")}
        />
        <Input
          label="رقم الهاتف"
          value={form.phoneNumber}
          onChange={handleChange("phoneNumber")}
        />
        <Input
          label="الرقم القومي"
          value={form.nationalId}
          onChange={handleChange("nationalId")}
        />
        <Input
          label="رقم الرخصة"
          value={form.licenseNumber}
          onChange={handleChange("licenseNumber")}
        />
        <Input
          label="تاريخ انتهاء الرخصة"
          type="date"
          value={form.licenseExpiryDate}
          onChange={handleChange("licenseExpiryDate")}
        />

        {isEdit && (
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={handleChange("isActive")}
              className="rounded border-ink-400/30"
            />
            نشط
          </label>
        )}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة"}
        </Button>
      </form>
    </Modal>
  );
}
