import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import {
  Plus,
  Warehouse,
  Printer,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";
import { useGetPartiesSelectQuery } from "../partiesApi";
import QuickAddPartyModal from "../components/QuickaddPartyModal";
import {
  useGetPartyStatementQuery,
  useUpdateStatementEntryMutation,
  useDeleteStatementEntryMutation,
} from "../partyStatementApi";

const DIRECTION_OPTIONS = [
  { value: "all", label: "الكل" },
  { value: "in", label: "وارد" },
  { value: "out", label: "صادر" },
];

export default function PartyStatementPage() {
  const navigate = useNavigate();

  const [partySearch, setPartySearch] = useState("");
  const [selectedParty, setSelectedParty] = useState(null); // { value, label, raw }
  const [showAddParty, setShowAddParty] = useState(false);

  // فلاتر الكشف
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [direction, setDirection] = useState("all");
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  /* ---------------- اختيار العميل/المورد ---------------- */
  const { data: parties = [], isFetching: isLoadingParties } =
    useGetPartiesSelectQuery({
      search: partySearch,
    });

  const partyOptions = useMemo(
    () =>
      parties.map((p) => ({
        value: p.id,
        label: p.name,
        raw: p,
      })),
    [parties],
  );

  const handlePartyCreated = (newParty) => {
    setSelectedParty({
      value: newParty.id,
      label: `${newParty.code} - ${newParty.name}`,
      raw: newParty,
    });
  };

  /* ---------------- كشف الحساب ---------------- */
  const { data: entries = [], isFetching: isLoadingStatement } =
    useGetPartyStatementQuery(
      selectedParty
        ? {
            partyId: selectedParty.value,
            from: dateFrom,
            to: dateTo,
            direction,
            search,
          }
        : undefined,
      { skip: !selectedParty },
    );

  const [updateEntry, { isLoading: isSaving }] =
    useUpdateStatementEntryMutation();
  const [deleteEntry] = useDeleteStatementEntryMutation();

  const totals = useMemo(() => {
    const debit = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const credit = entries.reduce((sum, e) => sum + (e.credit || 0), 0);
    const balance = entries.length ? entries[entries.length - 1].balance : 0;
    return { debit, credit, balance };
  }, [entries]);

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditValues({
      description: entry.description,
      quantity: entry.quantity,
      price: entry.price,
      notes: entry.notes ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = async (entry) => {
    try {
      await updateEntry({
        id: entry.id,
        partyId: selectedParty.value,
        ...editValues,
        quantity: Number(editValues.quantity),
        price: Number(editValues.price),
      }).unwrap();
      toast.success("تم حفظ التعديل بنجاح");
      cancelEdit();
    } catch {
      toast.error("تعذر حفظ التعديل، حاول مرة أخرى");
    }
  };

  const handleDelete = async (entry) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا البند؟")) return;
    try {
      await deleteEntry({
        id: entry.id,
        partyId: selectedParty.value,
      }).unwrap();
      toast.success("تم الحذف بنجاح");
    } catch {
      toast.error("تعذر الحذف، حاول مرة أخرى");
    }
  };

  const openContainerStore = () => {
    if (!selectedParty) return;
    navigate(`/dashboard/stores/containers/${selectedParty.value}`);
  };

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold text-ink-900">
          كشف حساب عملاء / موردين
        </h1>
        <Button type="button" onClick={() => setShowAddParty(true)}>
          <Plus className="w-4 h-4 me-1.5" />
          إضافة عميل / مورد جديد
        </Button>
      </div>

      {/* اختيار العميل / المورد */}
      <div className="flex items-end gap-3 print:hidden">
        <div className="flex-1 max-w-md">
          <label className="block mb-1.5 text-sm font-medium text-ink-900">
            اختر عميل أو مورد
          </label>
          <Select
            value={selectedParty}
            onChange={setSelectedParty}
            onInputChange={(value) => {
              setPartySearch(value);
              return value;
            }}
            options={partyOptions}
            isLoading={isLoadingParties}
            placeholder="ابحث بالكود أو الاسم..."
            noOptionsMessage={() => "لا توجد نتائج"}
            loadingMessage={() => "جاري البحث..."}
            isClearable
            dir="rtl"
          />
        </div>

        {selectedParty && (
          <Button
            type="button"
            variant="secondary"
            onClick={openContainerStore}
            title="مخزن العبوات التابع لهذا العميل"
          >
            <Warehouse className="w-4 h-4 me-1.5" />
            مخزن العبوات
          </Button>
        )}
      </div>

      {!selectedParty && (
        <p className="text-sm text-ink-500 print:hidden">
          اختر عميلًا أو موردًا من القائمة أعلاه لعرض كشف الحساب الخاص به.
        </p>
      )}

      {selectedParty && (
        <>
          {/* الفلاتر + زرار الطباعة الكلي */}
          <div className="flex flex-wrap items-end gap-3 print:hidden">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-ink-900">
                من تاريخ
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-xl border border-ink-400/15 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-ink-900">
                إلى تاريخ
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-xl border border-ink-400/15 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-ink-900">
                نوع الحركة
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="rounded-xl border border-ink-400/15 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-500"
              >
                {DIRECTION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <Input
                label="بحث في البيان"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث في البيان..."
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={handlePrintAll}
              className="ms-auto"
            >
              <Printer className="w-4 h-4 me-1.5" />
              طباعة الكل
            </Button>
          </div>

          {/* عنوان قابل للطباعة فقط */}
          <div className="hidden print:block">
            <h2 className="text-lg font-bold">
              كشف حساب: {selectedParty.raw?.code} - {selectedParty.raw?.name}
            </h2>
          </div>

          {/* الجدول */}
          <div className="border rounded-xl overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-ink-50 text-ink-600">
                <tr>
                  <th className="px-3 py-2.5 font-medium">التاريخ</th>
                  <th className="px-3 py-2.5 font-medium">البيان</th>
                  <th className="px-3 py-2.5 font-medium">الكمية</th>
                  <th className="px-3 py-2.5 font-medium">النوع</th>
                  <th className="px-3 py-2.5 font-medium">السعر</th>
                  <th className="px-3 py-2.5 font-medium">مدين</th>
                  <th className="px-3 py-2.5 font-medium">دائن</th>
                  <th className="px-3 py-2.5 font-medium">الرصيد</th>
                  <th className="px-3 py-2.5 font-medium">ملاحظات</th>
                  <th className="px-3 py-2.5 font-medium print:hidden">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoadingStatement ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-3 py-6 text-center text-ink-500"
                    >
                      جاري تحميل كشف الحساب...
                    </td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-3 py-6 text-center text-ink-500"
                    >
                      لا توجد حركات مطابقة للفلاتر الحالية
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => {
                    const isEditing = editingId === entry.id;
                    return (
                      <tr key={entry.id} className="align-middle">
                        <td className="px-3 py-2 whitespace-nowrap">
                          {entry.date}
                        </td>

                        <td className="px-3 py-2 min-w-[160px]">
                          {isEditing ? (
                            <input
                              value={editValues.description}
                              onChange={(e) =>
                                setEditValues((v) => ({
                                  ...v,
                                  description: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-ink-400/15 px-2 py-1 text-sm"
                            />
                          ) : (
                            entry.description
                          )}
                        </td>

                        <td className="px-3 py-2 w-24">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editValues.quantity}
                              onChange={(e) =>
                                setEditValues((v) => ({
                                  ...v,
                                  quantity: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-ink-400/15 px-2 py-1 text-sm"
                            />
                          ) : (
                            entry.quantity
                          )}
                        </td>

                        <td className="px-3 py-2 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              entry.direction === "in"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {entry.direction === "in" ? "وارد" : "صادر"}
                          </span>
                        </td>

                        <td className="px-3 py-2 w-28">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editValues.price}
                              onChange={(e) =>
                                setEditValues((v) => ({
                                  ...v,
                                  price: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-ink-400/15 px-2 py-1 text-sm"
                            />
                          ) : (
                            entry.price
                          )}
                        </td>

                        <td className="px-3 py-2 whitespace-nowrap">
                          {entry.debit
                            ? entry.debit.toLocaleString("ar-EG")
                            : "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {entry.credit
                            ? entry.credit.toLocaleString("ar-EG")
                            : "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap font-medium">
                          {entry.balance.toLocaleString("ar-EG")}
                        </td>

                        <td className="px-3 py-2 min-w-[140px]">
                          {isEditing ? (
                            <input
                              value={editValues.notes}
                              onChange={(e) =>
                                setEditValues((v) => ({
                                  ...v,
                                  notes: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-ink-400/15 px-2 py-1 text-sm"
                            />
                          ) : (
                            entry.notes || "-"
                          )}
                        </td>

                        <td className="px-3 py-2 print:hidden">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => saveEdit(entry)}
                                disabled={isSaving}
                                className="text-green-600 hover:text-green-700"
                                title="حفظ"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="text-ink-400 hover:text-ink-600"
                                title="إلغاء"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(entry)}
                                className="text-primary-600 hover:text-primary-700"
                                title="تعديل"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(entry)}
                                className="text-red-500 hover:text-red-600"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {entries.length > 0 && (
                <tfoot className="bg-ink-50 font-medium">
                  <tr>
                    <td colSpan={5} className="px-3 py-2.5 text-left">
                      الإجمالي
                    </td>
                    <td className="px-3 py-2.5">
                      {totals.debit.toLocaleString("ar-EG")}
                    </td>
                    <td className="px-3 py-2.5">
                      {totals.credit.toLocaleString("ar-EG")}
                    </td>
                    <td className="px-3 py-2.5">
                      {totals.balance.toLocaleString("ar-EG")}
                    </td>
                    <td colSpan={2} className="print:hidden" />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </>
      )}

      <QuickAddPartyModal
        isOpen={showAddParty}
        onClose={() => setShowAddParty(false)}
        onCreated={handlePartyCreated}
      />
    </div>
  );
}
