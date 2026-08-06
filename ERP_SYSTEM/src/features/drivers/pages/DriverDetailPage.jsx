import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { useGetDriverByIdQuery, useDeleteDriverMutation } from "../driversApi";
import Button from "../../../shared/components/ui/Button";
import QuickAddDriverModal from "../components/QuickAddDriverModal";

export default function DriverDetailPage() {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const [showFormModal, setShowFormModal] = useState(false);

  const { data: driver, isLoading, isError } = useGetDriverByIdQuery(driverId);
  const [deleteDriver] = useDeleteDriverMutation();

  const handleDelete = () => {
    if (!driver) return;
    toast(`حذف "${driver.name}"؟`, {
      description: "الإجراء ده لا يمكن التراجع عنه",
      action: {
        label: "تأكيد الحذف",
        onClick: async () => {
          try {
            await deleteDriver(driver.id).unwrap();
            toast.success("تم الحذف بنجاح");
            navigate("/dashboard/drivers");
          } catch {
            toast.error("حصل خطأ أثناء الحذف، حاول تاني");
          }
        },
      },
      cancel: { label: "إلغاء" },
      duration: 6000,
    });
  };

  if (isLoading) return <div className="p-6 text-ink-400">جاري التحميل...</div>;
  if (isError || !driver)
    return <div className="p-6 text-red-500">تعذر تحميل بيانات السائق</div>;

  const expired =
    driver.licenseExpiryDate && new Date(driver.licenseExpiryDate) < new Date();

  return (
    <div className="animate-fadeUp space-y-6">
      <button
        onClick={() => navigate("/dashboard/drivers")}
        className="flex items-center gap-1.5 text-sm text-emerald-700 hover:underline"
      >
        <ArrowRight size={14} />
        رجوع للقائمة
      </button>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="font-mono text-xs text-ink-400">
              {driver.code}
            </span>
            <h2 className="text-xl font-bold text-ink-900 mt-1">
              {driver.name}
            </h2>
            <span
              className={
                driver.isActive
                  ? "inline-block mt-2 text-emerald-700 text-xs font-semibold bg-emerald-700/10 px-2 py-0.5 rounded-full"
                  : "inline-block mt-2 text-red-500 text-xs font-semibold bg-red-500/10 px-2 py-0.5 rounded-full"
              }
            >
              {driver.isActive ? "نشط" : "غير نشط"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowFormModal(true)}>
              <Pencil size={14} />
              تعديل
            </Button>
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 size={14} className="text-red-600" />
              حذف
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <Field label="رقم الهاتف" value={driver.phoneNumber} />
          <Field label="الرقم القومي" value={driver.nationalId} />
          <Field label="رقم الرخصة" value={driver.licenseNumber} />
          <Field
            label="انتهاء الرخصة"
            value={driver.licenseExpiryDate}
            highlight={expired ? "text-red-600 font-semibold" : ""}
          />
        </div>
      </div>

      <QuickAddDriverModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        driver={driver}
      />
    </div>
  );
}

function Field({ label, value, highlight = "" }) {
  return (
    <div>
      <p className="text-xs text-ink-400 mb-1">{label}</p>
      <p className={`text-sm text-ink-900 ${highlight}`}>{value || "—"}</p>
    </div>
  );
}
