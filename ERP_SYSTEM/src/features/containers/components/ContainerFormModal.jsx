import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import {
  useCreateContainerMutation,
  useUpdateContainerMutation,
} from "../containersApi";

const containerSchema = z.object({
  name: z.string().min(1, "اسم العبوة مطلوب"),
  code: z.string().min(1, "الكود مطلوب"),
  description: z.string().optional(),
  isActive: z.preprocess((v) => v === "true" || v === true, z.boolean()),
});

/**
 * @param {{ isOpen: boolean, onClose: () => void, container?: object|null }} props
 */
export default function ContainerFormModal({ isOpen, onClose, container }) {
  const isEditing = Boolean(container);

  const [createContainer, { isLoading: isCreating }] =
    useCreateContainerMutation();
  const [updateContainer, { isLoading: isUpdating }] =
    useUpdateContainerMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(containerSchema),
    defaultValues: { name: "", code: "", description: "", isActive: true },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      container
        ? {
            name: container.name,
            code: container.code,
            description: container.description ?? "",
            isActive: container.isActive,
          }
        : { name: "", code: "", description: "", isActive: true },
    );
  }, [isOpen, container, reset]);

  async function onSubmit(values) {
    try {
      if (isEditing) {
        await updateContainer({ id: container.id, ...values }).unwrap();
        toast.success("تم تحديث العبوة بنجاح");
      } else {
        await createContainer(values).unwrap();
        toast.success("تم إضافة العبوة بنجاح");
      }
      onClose();
    } catch (err) {
      toast.error("حصل خطأ، حاول تاني");
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "تعديل عبوة" : "عبوة جديدة"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs text-ink-400 mb-1.5">
            اسم العبوة
          </label>
          <input
            type="text"
            placeholder="مثال: برميل 200 لتر"
            className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs text-ink-400 mb-1.5">الكود</label>
          <input
            type="text"
            placeholder="مثال: BRL-200"
            className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
            {...register("code")}
          />
          {errors.code && (
            <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs text-ink-400 mb-1.5">
            الوصف (اختياري)
          </label>
          <textarea
            rows={2}
            placeholder="أي تفاصيل إضافية عن العبوة"
            className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
            {...register("description")}
          />
        </div>

        <div>
          <label className="block text-xs text-ink-400 mb-1.5">الحالة</label>
          <select
            className="w-full border border-ink-400/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-700/50 focus:ring-2 focus:ring-emerald-700/10"
            {...register("isActive")}
          >
            <option value="true">نشطة</option>
            <option value="false">غير نشطة</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isEditing ? "حفظ التعديلات" : "إضافة"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
