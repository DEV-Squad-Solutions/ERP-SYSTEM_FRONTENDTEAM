import { useEffect, useState } from "react";
import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import { useCreateStoreMutation, useUpdateStoreMutation } from "../storesApi";

const emptyForm = {
  name: "",
  address: "",
  isActive: true,
};

export default function StoreFormModal({ isOpen, onClose, store, onSaved }) {
  const isEdit = Boolean(store);
  const [form, setForm] = useState(emptyForm);

  const [createStore, { isLoading: isCreating }] = useCreateStoreMutation();
  const [updateStore, { isLoading: isUpdating }] = useUpdateStoreMutation();
  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name ?? "",
        address: store.address ?? "",
        isActive: store.isActive ?? true,
      });
    } else {
      setForm(emptyForm);
    }
  }, [store, isOpen]);

  const handleChange = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = isEdit
        ? await updateStore({ id: store.id, ...form }).unwrap()
        : await createStore(form).unwrap();
      onSaved?.(result);
      onClose();
    } catch (err) {
      console.error("فشل حفظ المخزن", err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "تعديل المخزن" : "مخزن جديد"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-ink-400 mb-1.5">
            اسم المخزن
          </label>
          <input
            required
            value={form.name}
            onChange={handleChange("name")}
            className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
          />
        </div>

        <div>
          <label className="block text-xs text-ink-400 mb-1.5">العنوان</label>
          <input
            value={form.address}
            onChange={handleChange("address")}
            className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={handleChange("isActive")}
            className="rounded border-ink-400/30"
          />
          مخزن نشط
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving
              ? "جاري الحفظ..."
              : isEdit
                ? "حفظ التعديلات"
                : "إنشاء المخزن"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
