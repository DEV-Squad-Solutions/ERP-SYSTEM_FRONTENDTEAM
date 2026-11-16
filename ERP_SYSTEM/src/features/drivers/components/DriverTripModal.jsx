// features/drivers/components/DriverTripModal.jsx
import { useEffect, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import NumericInput from "../../../shared/components/ui/NumericInput";
import Input from "../../../shared/components/ui/Input";
import { selectSelectedFiscalYear } from "../../fiscalYears/fiscalYearSlice";
import { getFiscalYearDateWarning } from "../../../lib/fiscalYearDateRange";

import { useGetDriversSelectQuery } from "../driversApi";
import { useGetPartiesSelectQuery } from "../../partners/partiesApi";
import {
  useCreateDriverTripMutation,
  useUpdateDriverTripMutation,
} from "../driversApi";

function todayISO() {
  return new Date().toLocaleDateString("en-CA");
}

function emptyForm() {
  return {
    driverId: "",
    tripDate: todayISO(),
    businessPartnerId: "",
    actualDriverName: "",
    cost: "",
    notes: "",
  };
}

const ERROR_MESSAGES = {
  "DriverTrips.LinkedVoucher":
    "توجد سندات حالية أو تاريخية مرتبطة بالرحلة؛ لا يمكن حذفها أو تغيير السائق أو الطرف أو التاريخ.",
  "DriverTrips.Concurrency":
    "تم تعديل الرحلة من مكان آخر. أعد تحميل البيانات ثم حاول مرة أخرى.",
  "DriverTrips.FiscalYearImmutable": "لا يمكن تغيير السنة المالية للرحلة.",
  "DriverTrips.DriverUnavailable":
    "يجب اختيار سائق نشط داخل الشركة الحالية.",
  "DriverTrips.PartnerUnavailable":
    "يجب اختيار طرف نشط داخل الشركة الحالية.",
  "DriverTrips.InvoiceOwned":
    "رحلة الفاتورة تدار من خلال الفاتورة أو شاشة تكاليف الرحلات.",
  "DriverTrips.RowVersionRequired":
    "تعذر إرسال إصدار الرحلة الحالي. أعد تحميل الصفحة وحاول مرة أخرى.",
  "DriverTrips.InvalidRequest": "بيانات رحلة السائق غير صالحة.",
  "FiscalYears.QueryDateOutsideRange":
    "تاريخ الرحلة خارج حدود السنة المالية المحددة.",
  "FiscalYears.Closed": "السنة المالية مغلقة.",
};

export default function DriverTripModal({ isOpen, onClose, editingItem }) {
  const { data: drivers } = useGetDriversSelectQuery(undefined, {
    skip: !isOpen,
  });
  const { data: parties } = useGetPartiesSelectQuery(undefined, {
    skip: !isOpen,
  });

  const [createTrip, { isLoading: isCreating }] = useCreateDriverTripMutation();
  const [updateTrip, { isLoading: isUpdating }] = useUpdateDriverTripMutation();

  const selectedFiscalYear = useSelector(selectSelectedFiscalYear);

  const [form, setForm] = useState(emptyForm());

  const isEditing = Boolean(editingItem);
  const isSaving = isCreating || isUpdating;

  // الرحلة بتفضل في سنتها الأصلية لو بنعدّل، وإلا بنستخدم السنة المختارة.
  const tripFiscalYearId =
    editingItem?.fiscalYearId ?? selectedFiscalYear?.id ?? null;

  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      setForm({
        driverId: editingItem.driverId ?? "",
        tripDate: editingItem.tripDate ?? todayISO(),
        businessPartnerId: editingItem.businessPartnerId ?? "",
        actualDriverName: editingItem.actualDriverName ?? "",
        cost: editingItem.costText ?? editingItem.cost ?? "",
        notes: editingItem.costNotes ?? "",
      });
    } else {
      setForm(emptyForm());
    }
  }, [isOpen, editingItem]);

  const driverOptions = useMemo(
    () => drivers?.map((driver) => ({ value: driver.id, label: driver.name })) || [],
    [drivers],
  );

  const partnerOptions = useMemo(
    () =>
      parties?.map((partner) => ({
        value: partner.id,
        label: partner.name,
      })) || [],
    [parties],
  );

  const dateWarning = getFiscalYearDateWarning(
    form.tripDate,
    selectedFiscalYear,
  );

  const setField = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.driverId) {
      toast.error("اختر السائق");
      return;
    }

    if (!form.tripDate) {
      toast.error("حدد تاريخ الرحلة");
      return;
    }

    if (!tripFiscalYearId) {
      toast.error("اختر السنة المالية أولًا");
      return;
    }

    if (dateWarning) {
      toast.error(dateWarning);
      return;
    }

    if (form.cost !== "" && Number(form.cost) < 0) {
      toast.error("تكلفة الرحلة لا يمكن أن تكون سالبة");
      return;
    }

    const payload = {
      driverId: Number(form.driverId),
      fiscalYearId: tripFiscalYearId,
      tripDate: form.tripDate,
      businessPartnerId: form.businessPartnerId
        ? Number(form.businessPartnerId)
        : null,
      actualDriverName: form.actualDriverName.trim() || null,
      cost: form.cost === "" ? null : Number(form.cost),
      notes: form.notes.trim() || null,
    };

    try {
      if (isEditing) {
        await updateTrip({
          id: editingItem.driverTripId,
          ...payload,
          rowVersion: editingItem.rowVersion,
        }).unwrap();

        toast.success("تم تعديل الرحلة بنجاح");
      } else {
        await createTrip(payload).unwrap();
        toast.success("تم إنشاء الرحلة بنجاح");
      }

      onClose();
    } catch (error) {
      const code = error?.data?.errorCode ?? error?.data?.code;

      toast.error(
        ERROR_MESSAGES[code] ||
          error?.data?.detail ||
          error?.data?.message ||
          error?.data?.title ||
          "تعذر حفظ الرحلة",
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSaving ? () => {} : onClose}
      title={isEditing ? "تعديل رحلة مستقلة" : "إضافة رحلة مستقلة"}
      wide
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-ink-400/10 bg-ink-400/5 px-4 py-3 text-xs leading-6 text-ink-500">
          الرحلة المستقلة بدون فاتورة. السنة المالية:{" "}
          <strong className="text-ink-700">
            {editingItem?.fiscalYearName || selectedFiscalYear?.name || "—"}
          </strong>
          {isEditing && (
            <>
              {" "}
              — رقم الرحلة:{" "}
              <strong className="num text-ink-700">
                {editingItem?.tripNumber}
              </strong>
            </>
          )}
          . التكلفة والعملة بيتحددوا تلقائيًا حسب إعدادات الشركة.
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">
              السائق
            </label>

            <CompactSelect
              options={driverOptions}
              value={form.driverId}
              onChange={(value) => setField("driverId", value)}
              placeholder="اختر السائق"
              isDisabled={isSaving}
            />
          </div>

          <Input
            label="تاريخ الرحلة"
            type="date"
            value={form.tripDate}
            min={selectedFiscalYear?.startDate}
            max={selectedFiscalYear?.endDate}
            onChange={(event) => setField("tripDate", event.target.value)}
            disabled={isSaving}
            error={dateWarning || undefined}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700">
              العميل / المورد <span className="text-ink-400">(اختياري)</span>
            </label>

            <CompactSelect
              options={partnerOptions}
              value={form.businessPartnerId}
              onChange={(value) => setField("businessPartnerId", value)}
              placeholder="بدون طرف"
              isDisabled={isSaving}
            />
          </div>

          <Input
            label="اسم السائق الفعلي (اختياري)"
            value={form.actualDriverName}
            maxLength={200}
            onChange={(event) =>
              setField("actualDriverName", event.target.value)
            }
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-700">
            تكلفة الرحلة <span className="text-ink-400">(اختياري)</span>
          </label>

          <NumericInput
            value={form.cost}
            decimals
            onChange={(value) => setField("cost", value)}
            placeholder="0.00"
            disabled={isSaving}
          />

          <p className="mt-1 text-[11px] text-ink-400">
            القيمة الفارغة أو صفر تعني عدم وجود تكلفة على الرحلة.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-700">
            ملاحظات
          </label>

          <textarea
            rows={3}
            maxLength={1000}
            value={form.notes}
            onChange={(event) => setField("notes", event.target.value)}
            placeholder="أضف ملاحظات اختيارية..."
            className="w-full resize-none rounded-lg border border-ink-400/15 bg-white px-3 py-2 text-sm font-medium text-ink-800 outline-none transition-all duration-200 placeholder:text-ink-400 hover:border-ink-400/25 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
            disabled={isSaving}
          />
        </div>

        {isEditing && (
          <div className="rounded-xl border border-gold-200 bg-gold-50/50 px-4 py-3 text-[11px] leading-5 text-gold-700">
            لو الرحلة مرتبطة بسند قبض أو صرف (حالي أو محذوف)، مش هينفع تغيير
            السائق أو الطرف أو التاريخ — لكن التكلفة والملاحظات ممكن يتعدلوا.
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1"
          >
            إلغاء
          </Button>

          <Button type="submit" disabled={isSaving} className="flex-1">
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save size={16} />
                حفظ
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
