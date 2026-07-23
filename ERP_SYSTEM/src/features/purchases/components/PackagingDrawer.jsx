import { useState } from "react";
import { toast } from "sonner";
import { X, Boxes, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useGetInvoicesQuery } from "../salesApi";
import { useGetItemUnitsSelectQuery } from "../../units/itemUnitsApi";
import Button from "../../../shared/components/ui/Button";

/**
 * @param {{ partyName: string, invoiceNumber: string, isOpen: boolean, onClose: () => void }} props
 */
export default function PackagingDrawer({
  partyName,
  invoiceNumber,
  isOpen,
  onClose,
}) {
  const { data } = useGetInvoicesQuery(
    { partyId: partyName },
    { skip: !isOpen || !partyName },
  );
  const invoices = data?.items || [];

  const { data: itemUnits } = useGetItemUnitsSelectQuery();

  const [actionMode, setActionMode] = useState(null);
  const [actionUnit, setActionUnit] = useState("");
  const [actionCount, setActionCount] = useState(0);
  const [actionNotes, setActionNotes] = useState("");

  if (!isOpen) return null;

  const balanceByUnit = {};
  invoices.forEach((inv) => {
    (inv.items || []).forEach((item) => {
      if (!item.packagingUnitName || !item.packagingCount) return;
      const key = item.packagingUnitName;
      if (!balanceByUnit[key]) balanceByUnit[key] = { taken: 0, returned: 0 };
      if (inv.movementType === "sale") {
        balanceByUnit[key].taken += item.packagingCount;
      } else {
        balanceByUnit[key].returned += item.packagingCount;
      }
    });
  });

  const rows = Object.entries(balanceByUnit).map(([unit, data]) => ({
    unit,
    taken: data.taken,
    returned: data.returned,
    balance: data.taken - data.returned,
  }));

  const handleSaveAction = () => {
    if (!actionUnit || actionCount <= 0) {
      toast.error("اختر الوحدة وأدخل عدد صحيح");
      return;
    }
    toast.success(
      actionMode === "receive"
        ? "تم تسجيل استلام العبوات"
        : "تم تسجيل تسليم العبوات",
      {
        description: `${actionUnit} × ${actionCount} — مرتبط بفاتورة ${invoiceNumber || "الحالية"}`,
      },
    );
    setActionMode(null);
    setActionUnit("");
    setActionCount(0);
    setActionNotes("");
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-ink-900/50 z-40 animate-fadeUp"
      />
      <div className="fixed top-0 left-0 h-screen w-full sm:w-96 bg-paper z-50 shadow-card overflow-y-auto custom-scroll animate-slideInRight">
        <div className="sticky top-0 bg-primary-500 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes size={18} />
            <h3 className="font-display font-bold">مخزن العبوات</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-sm space-y-1">
            <p className="text-ink-600">
              العميل / المورد:{" "}
              <span className="text-ink-900 font-medium">
                {partyName || "—"}
              </span>
            </p>
            {invoiceNumber && (
              <p className="text-ink-600">
                رقم الفاتورة:{" "}
                <span className="num text-ink-900 font-medium">
                  {invoiceNumber}
                </span>
              </p>
            )}
          </div>

          {rows.length === 0 ? (
            <div className="text-center py-10">
              <Boxes
                size={28}
                className="mx-auto text-ink-400/40 mb-2"
                strokeWidth={1.6}
              />
              <p className="text-sm text-ink-400">
                لا توجد حركة عبوات مسجلة لهذا الحساب
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-ink-400/10">
              <table className="w-full text-sm text-right border-collapse">
                <thead>
                  <tr className="bg-ink-900/[0.03] text-ink-400 text-xs">
                    <th className="p-2.5 font-medium">الوحدة</th>
                    <th className="p-2.5 font-medium text-positive">له</th>
                    <th className="p-2.5 font-medium text-negative">عليه</th>
                    <th className="p-2.5 font-medium">الرصيد</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.unit} className="border-t border-ink-400/5">
                      <td className="p-2.5 font-medium text-ink-900">
                        {row.unit}
                      </td>
                      <td className="p-2.5 num text-positive">{row.taken}</td>
                      <td className="p-2.5 num text-negative">
                        {row.returned}
                      </td>
                      <td className="p-2.5 num font-bold text-gold-600">
                        {row.balance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {actionMode ? (
            <div className="rounded-xl border border-ink-400/10 p-4 space-y-3 bg-white">
              <p className="text-sm font-medium text-ink-900">
                {actionMode === "receive" ? "استلام عبوات" : "تسليم عبوات"}
              </p>
              <div>
                <label className="block mb-1 text-xs text-ink-400">
                  الوحدة
                </label>
                <select
                  value={actionUnit}
                  onChange={(e) => setActionUnit(e.target.value)}
                  className="w-full rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm"
                >
                  <option value="">— اختر —</option>
                  {itemUnits?.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-xs text-ink-400">العدد</label>
                <input
                  type="number"
                  value={actionCount}
                  onChange={(e) => setActionCount(Number(e.target.value))}
                  className="w-full rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm num"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs text-ink-400">
                  ملاحظات
                </label>
                <input
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full rounded-lg border border-ink-400/15 px-2.5 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveAction} className="flex-1">
                  حفظ
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActionMode(null)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={() => setActionMode("receive")}
                className="w-full"
              >
                <ArrowDownCircle size={16} />
                استلام عبوات
              </Button>
              <Button
                variant="outline"
                onClick={() => setActionMode("deliver")}
                className="w-full"
              >
                <ArrowUpCircle size={16} />
                تسليم عبوات
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
