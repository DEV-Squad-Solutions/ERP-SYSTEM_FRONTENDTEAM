import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Boxes } from "lucide-react";
import { toast } from "sonner";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import { todayInCairo } from "../../../lib/date";

import {
  useCreateContainerMovementMutation,
  useUpdateContainerMovementMutation,
} from "../storeContainersApi";

const fieldCls =
  "w-full min-h-10 rounded-xl border border-ink-400/15 bg-white px-3.5 py-2.5 text-sm font-medium text-ink-900 outline-none transition hover:border-ink-400/25 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 disabled:cursor-not-allowed disabled:bg-ink-400/[0.04] disabled:text-ink-400";

const directionOptions = [
  {
    value: "Outgoing",
    label: "صادر",
    hint: "خروج عبوات للعميل",
    icon: ArrowUpRight,
    activeClass: "border-rose-500 bg-rose-500/10 text-rose-700",
  },
  {
    value: "Incoming",
    label: "وارد",
    hint: "عودة عبوات من العميل",
    icon: ArrowDownLeft,
    activeClass:
      "border-emerald-500 bg-emerald-500/10 text-emerald-700",
  },
];

export default function ManualMovementModal({
  open,
  onClose,
  storeId,
  containers = [],
  movement = null,
}) {
  const edit = !!movement;

  const [create, { isLoading: creating }] =
    useCreateContainerMovementMutation();
  const [update, { isLoading: updating }] =
    useUpdateContainerMovementMutation();

  const saving = creating || updating;

  const [containerId, setContainerId] = useState("");
  const [direction, setDirection] = useState("Outgoing");
  const [units, setUnits] = useState("");
  const [movementDate, setMovementDate] = useState(todayInCairo());
  const [description, setDescription] = useState("");

  const containerOptions = useMemo(() => {
    const list = containers.filter(
      (container) =>
        container.isContainerActive &&
        container.isCurrentlyAssignedToStore,
    );

    // الحركة القائمة على عبوة أُلغيت مخصصتها تفضل قابلة للتعديل.
    if (
      movement &&
      !list.some(
        (container) =>
          String(container.containerId) === String(movement.containerId),
      )
    ) {
      const current = containers.find(
        (container) =>
          String(container.containerId) === String(movement.containerId),
      );

      list.push(
        current ?? {
          containerId: movement.containerId,
          containerCode: movement.containerCode,
          containerName: movement.containerName,
          isContainerActive: true,
          isCurrentlyAssignedToStore: false,
        },
      );
    }

    return list;
  }, [containers, movement]);

  useEffect(() => {
    if (!open) return;

    if (movement) {
      setContainerId(String(movement.containerId ?? ""));
      setDirection(
        Number(movement.outgoingUnits) > 0 ? "Outgoing" : "Incoming",
      );
      setUnits(
        String(
          Number(movement.outgoingUnits) > 0
            ? movement.outgoingUnits
            : movement.incomingUnits ?? "",
        ),
      );
      setMovementDate(movement.movementDate ?? todayInCairo());
      setDescription(movement.movementDescription ?? "");
      return;
    }

    setContainerId(
      containerOptions[0] ? String(containerOptions[0].containerId) : "",
    );
    setDirection("Outgoing");
    setUnits("");
    setMovementDate(todayInCairo());
    setDescription("");
    // containerOptions تتغير مع بيانات الجدول، لكن الفورم لا يُعاد ضبطه
    // إلا عند فتح المودال أو تغيير الحركة المطلوب تعديلها.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, movement]);

  const save = async (event) => {
    event.preventDefault();

    const numericUnits = Number(units);

    if (!containerId) {
      toast.error("اختر العبوة أولًا");
      return;
    }

    if (!Number.isInteger(numericUnits) || numericUnits <= 0) {
      toast.error("العدد يجب أن يكون رقمًا صحيحًا أكبر من صفر");
      return;
    }

    if (!movementDate) {
      toast.error("تاريخ الحركة مطلوب");
      return;
    }

    const outgoingUnits = direction === "Outgoing" ? numericUnits : 0;
    const incomingUnits = direction === "Incoming" ? numericUnits : 0;

    try {
      if (edit) {
        await update({
          id: movement.movementId,
          body: {
            containerId: Number(containerId),
            movementDate,
            outgoingUnits,
            incomingUnits,
            description: description.trim(),
            rowVersion: movement.rowVersion,
          },
        }).unwrap();
      } else {
        await create({
          containerStoreId: Number(storeId),
          containerId: Number(containerId),
          movementDate,
          outgoingUnits,
          incomingUnits,
          description: description.trim(),
        }).unwrap();
      }

      toast.success(
        edit
          ? "تم تعديل الحركة اليدوية بنجاح"
          : "تمت إضافة الحركة اليدوية بنجاح",
      );

      onClose();
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.data?.title ||
          "تعذر حفظ الحركة اليدوية",
      );
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={edit ? "تعديل حركة يدوية" : "إضافة حركة يدوية"}
    >
      <form onSubmit={save} className="space-y-4">
        <div className="rounded-xl border border-ink-400/10 bg-ink-400/[0.03] px-3.5 py-2.5 text-xs leading-6 text-ink-500">
          الحركة اليدوية تؤثر على أعداد العبوات فقط، ولا تُنشئ أي قيد محاسبي
          أو حركة خزنة أو رصيد عميل.
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-ink-800">العبوة</span>

          <select
            className={fieldCls}
            value={containerId}
            onChange={(event) => setContainerId(event.target.value)}
          >
            <option value="">اختر العبوة</option>

            {containerOptions.map((container) => (
              <option
                key={container.containerId}
                value={container.containerId}
              >
                {container.containerName}
                {container.containerCode
                  ? ` (${container.containerCode})`
                  : ""}
              </option>
            ))}
          </select>

          {containerOptions.length === 0 && (
            <span className="flex items-center gap-1.5 text-xs text-amber-600">
              <Boxes size={13} />
              لا توجد عبوات مخصصة لهذا المخزن. أضفها من «إدارة الحاويات».
            </span>
          )}
        </label>

        <div className="space-y-1.5">
          <span className="text-sm font-semibold text-ink-800">
            نوع الحركة
          </span>

          <div className="grid grid-cols-2 gap-2">
            {directionOptions.map((option) => {
              const Icon = option.icon;
              const active = direction === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDirection(option.value)}
                  aria-pressed={active}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-right transition ${
                    active
                      ? option.activeClass
                      : "border-ink-400/15 bg-white text-ink-500 hover:border-ink-400/30"
                  }`}
                >
                  <Icon size={16} />

                  <span className="flex flex-col">
                    <span className="text-sm font-bold">{option.label}</span>
                    <span className="text-[11px] font-normal opacity-70">
                      {option.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="العدد"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={units}
            onChange={(event) => setUnits(event.target.value)}
            placeholder="مثال: 50"
          />

          <Input
            label="تاريخ الحركة"
            type="date"
            value={movementDate}
            onChange={(event) => setMovementDate(event.target.value)}
          />
        </div>

        <Input
          label="البيان (اختياري)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="مثال: جرد يدوي أو تسوية عدد"
          maxLength={1000}
        />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            إلغاء
          </Button>

          <Button
            type="submit"
            disabled={saving || containerOptions.length === 0}
            className="flex-1"
          >
            {saving
              ? "جاري الحفظ..."
              : edit
                ? "حفظ التعديلات"
                : "إضافة الحركة"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
