import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useGetPartyByIdQuery, useDeletePartyMutation } from "../partiesApi";
import QuickAddPartyModal from "../components/QuickAddPartyModal";
import Button from "../../../shared/components/ui/Button";

export default function PartnerDetailPage() {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const [showFormModal, setShowFormModal] = useState(false);

  const { data: party, isLoading, isError } = useGetPartyByIdQuery(partnerId);
  const [deleteParty] = useDeletePartyMutation();

  const handleDelete = () => {
    if (!party) return;
    toast(`حذف "${party.name}"؟`, {
      description: "الإجراء ده لا يمكن التراجع عنه",
      action: {
        label: "تأكيد الحذف",
        onClick: async () => {
          try {
            await deleteParty(party.id).unwrap();
            toast.success("تم الحذف بنجاح");
            navigate("/dashboard/partners");
          } catch {
            toast.error("حصل خطأ أثناء الحذف، حاول تاني");
          }
        },
      },
      cancel: { label: "إلغاء" },
      duration: 6000,
    });
  };

  if (isLoading) {
    return <div className="p-6 text-ink-400">جاري التحميل...</div>;
  }

  if (isError || !party) {
    return (
      <div className="p-6 text-red-500">تعذر تحميل بيانات العميل/المورد</div>
    );
  }

  return (
    <div className="animate-fadeUp space-y-6">
      <button
        onClick={() => navigate("/dashboard/partners")}
        className="flex items-center gap-1.5 text-sm text-emerald-700 hover:underline"
      >
        <ArrowRight size={14} />
        رجوع للقائمة
      </button>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="font-mono text-xs text-ink-400">{party.code}</span>
            <h2 className="text-xl font-bold text-ink-900 mt-1">
              {party.name}
            </h2>
            <span
              className={
                party.isActive
                  ? "inline-block mt-2 text-emerald-700 text-xs font-semibold bg-emerald-700/10 px-2 py-0.5 rounded-full"
                  : "inline-block mt-2 text-red-500 text-xs font-semibold bg-red-500/10 px-2 py-0.5 rounded-full"
              }
            >
              {party.isActive ? "نشط" : "غير نشط"}
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
          <Field label="رقم الهاتف" value={party.phoneNumber} />
          <Field label="الإيميل" value={party.email} />
          <Field label="العنوان" value={party.address} />
          <Field label="الرقم الضريبي" value={party.taxNumber} />
          <Field label="العملة" value={party.currency} />
          <Field
            label="حد الائتمان"
            value={
              party.creditLimit != null
                ? party.creditLimit.toLocaleString("ar-EG")
                : null
            }
          />
        </div>
      </div>

      {party.containerStore && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-ink-900 mb-3">مخزن الحاويات</h3>
          <p className="text-sm text-ink-700">{party.containerStore.name}</p>
          <p className="text-xs text-ink-400 mt-1">
            {party.containerStore.address}
          </p>
        </div>
      )}

      {party.containers?.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <h3 className="text-sm font-bold text-ink-900 p-4 border-b border-gray-100">
            الحاويات المخصصة ({party.containers.length})
          </h3>
          <table className="w-full text-right">
            <thead>
              <tr className="bg-ink-400/5 text-xs text-ink-400">
                <th className="py-2 px-4 font-medium">الكود</th>
                <th className="py-2 px-4 font-medium">الاسم</th>
                <th className="py-2 px-4 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {party.containers.map((c) => (
                <tr key={c.id} className="border-t border-ink-400/10">
                  <td className="py-2 px-4 font-mono text-xs text-ink-400">
                    {c.code}
                  </td>
                  <td className="py-2 px-4 text-ink-700">{c.name}</td>
                  <td className="py-2 px-4">
                    <span
                      className={
                        c.isActive
                          ? "text-emerald-700 text-xs font-semibold"
                          : "text-red-500 text-xs font-semibold"
                      }
                    >
                      {c.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <QuickAddPartyModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        party={party}
      />
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-ink-400 mb-1">{label}</p>
      <p className="text-sm text-ink-900">{value || "—"}</p>
    </div>
  );
}
