import React, { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Truck,
  Car,
  MapPin,
  Warehouse,
  Users,
  Package,
  PackageOpen,
  CircleDollarSign,
  Save,
  ShoppingCart,
  PackagePlus,
  Zap,
  FileText,
  CheckCircle2,
} from "lucide-react";

// ---------- Sample reference data (would come from the database) ----------
const CUSTOMERS = [
  { id: "c1", name: "شركة النيل للزيوت", currency: "USD", type: "عميل" },
  { id: "c2", name: "مؤسسة الوادي التجارية", currency: "EGP", type: "عميل" },
  { id: "s1", name: "مزارع الواحات للزيتون", currency: "EGP", type: "مورد" },
];
const WAREHOUSES = [
  "المخزن الرئيسي - القاهرة",
  "مخزن الإسكندرية",
  "مخزن عبوات العملاء",
];
const DRIVERS = ["أحمد جمعة", "سيد عبد الله", "محمود فتحي"];
const COUNTRIES = ["مصر", "السعودية", "الإمارات", "ليبيا", "الأردن"];
const CURRENCIES = ["EGP", "USD", "EUR"];
const CATALOG = [
  { id: "i1", name: "زيتون أسود مخلل", hasPackaging: true },
  { id: "i2", name: "زيت زيتون بكر ممتاز", hasPackaging: false },
  { id: "i3", name: "زيتون أخضر مجروح", hasPackaging: true },
];

const INVOICE_TYPES = [
  { key: "sale", label: "مبيعات", icon: ShoppingCart },
  { key: "purchase", label: "مشتريات", icon: PackagePlus },
  { key: "spot", label: "فورية", icon: Zap },
];

let rowSeq = 1;
const newRow = () => ({
  id: rowSeq++,
  itemMode: "existing", // existing | new
  itemId: "",
  itemName: "",
  count: "",
  weight: "",
  qty: "",
  price: "",
  notes: "",
  track: false,
  packIn: "",
  packOut: "",
});

function money(n, currency) {
  const v = isFinite(n) ? n : 0;
  return (
    v.toLocaleString("ar-EG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) +
    " " +
    currency
  );
}

export default function InvoiceForm() {
  const [invType, setInvType] = useState("purchase");
  const [invNumber, setInvNumber] = useState("SL-2026-0148");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [partyMode, setPartyMode] = useState("existing"); // existing | new
  const [partyId, setPartyId] = useState("c1");
  const [newPartyName, setNewPartyName] = useState("");

  const [currency, setCurrency] = useState("USD");
  const [driver, setDriver] = useState(DRIVERS[0]);
  const [carPlate, setCarPlate] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [warehouse, setWarehouse] = useState(WAREHOUSES[0]);

  const [catalog, setCatalog] = useState(CATALOG);
  const [rows, setRows] = useState([newRow(), newRow()]);
  const [taxPct, setTaxPct] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(0);

  const [savedFlash, setSavedFlash] = useState(false);

  const selectedParty = CUSTOMERS.find((c) => c.id === partyId);

  const updateRow = (id, patch) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeRow = (id) => setRows((rs) => rs.filter((r) => r.id !== id));
  const addRow = () => setRows((rs) => [...rs, newRow()]);

  const pickExistingItem = (id, itemId) => {
    const found = catalog.find((c) => c.id === itemId);
    updateRow(id, {
      itemId,
      itemName: found ? found.name : "",
      track: found ? found.hasPackaging : false,
    });
  };

  const setNewItemName = (id, name) =>
    updateRow(id, { itemName: name, itemId: "" });

  const confirmNewItem = (id) => {
    const row = rows.find((r) => r.id === id);
    if (!row || !row.itemName.trim()) return;
    const exists = catalog.some((c) => c.name === row.itemName.trim());
    if (!exists) {
      const item = {
        id: "i" + Date.now(),
        name: row.itemName.trim(),
        hasPackaging: row.track,
      };
      setCatalog((cs) => [...cs, item]);
      updateRow(id, { itemId: item.id });
    }
  };

  const computedRows = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        value: (parseFloat(r.qty) || 0) * (parseFloat(r.price) || 0),
      })),
    [rows],
  );

  const subtotal = computedRows.reduce((s, r) => s + r.value, 0);
  const taxAmount = (subtotal * (parseFloat(taxPct) || 0)) / 100;
  const net = subtotal + taxAmount - (parseFloat(discount) || 0);
  const remaining = net - (parseFloat(paid) || 0);

  const isPriced = computedRows.some((r) => (parseFloat(r.price) || 0) > 0);
  const status = invType === "spot" ? "priced" : isPriced ? "priced" : "draft";

  const statusMeta = {
    draft: {
      label: "غير مسعّرة — بالكمية فقط",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    priced: {
      label: "مسعّرة",
      cls: "bg-teal-50 text-teal-700 border-teal-200",
    },
  }[status];

  // packaging ledger: aggregate per item name
  const packagingLedger = useMemo(() => {
    const map = {};
    computedRows.forEach((r) => {
      if (!r.track || !r.itemName) return;
      if (!map[r.itemName]) map[r.itemName] = { out: 0, in: 0 };
      map[r.itemName].out += parseFloat(r.packOut) || 0;
      map[r.itemName].in += parseFloat(r.packIn) || 0;
    });
    return map;
  }, [computedRows]);

  const handleSave = () => {
    const payload = {
      invType,
      invNumber,
      date,
      party:
        partyMode === "existing"
          ? { mode: "existing", ...selectedParty }
          : { mode: "new", name: newPartyName },
      currency,
      driver,
      carPlate,
      country,
      warehouse,
      items: computedRows.map(({ itemMode, ...r }) => r),
      packagingLedger,
      totals: {
        subtotal,
        taxPct: parseFloat(taxPct) || 0,
        taxAmount,
        discount: parseFloat(discount) || 0,
        net,
        paid: parseFloat(paid) || 0,
        remaining,
      },
      status,
    };
    // TODO: replace with real API call once backend is ready
    console.log("SAVE INVOICE →", payload);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2200);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen  text-[#1C2733]"
      style={{ fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif" }}
    >
      <div className="max-w-5xl mx-auto p-4 sm:p-8">
        {/* Header bar */}

        {/* Invoice type pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {INVOICE_TYPES.map((t) => {
            const Icon = t.icon;
            const active = invType === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setInvType(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition ${
                  active
                    ? "bg-[#0F6B62] text-white border-[#0F6B62] shadow-sm"
                    : "bg-white text-[#0F6B62] border-[#DCE1EA] hover:border-[#0F6B62]"
                }`}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
          {invType === "spot" && (
            <span className="self-center text-xs text-[#64748B]">
              تُسعَّر لحظة الإنشاء وتُقفل ماليًا مباشرة
            </span>
          )}
        </div>

        {/* Header fields card */}
        <div className="bg-white border border-[#DCE1EA] rounded-2xl p-5 mb-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="رقم الفاتورة">
              <input
                value={invNumber}
                onChange={(e) => setInvNumber(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="التاريخ">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="العملة">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={inputCls}
              >
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Party section */}
          <div className="mt-5 pt-5 border-t border-[#EEF1F6]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-[#0F6B62] flex items-center gap-1.5">
                <Users size={15} /> العميل / المورد
              </span>
              <div className="flex gap-1 text-xs bg-[#EEF1F6] rounded-lg p-1">
                <button
                  onClick={() => setPartyMode("existing")}
                  className={`px-2.5 py-1 rounded-md transition ${partyMode === "existing" ? "bg-white shadow-sm font-bold text-[#0F6B62]" : "text-[#64748B]"}`}
                >
                  مسجّل
                </button>
                <button
                  onClick={() => setPartyMode("new")}
                  className={`px-2.5 py-1 rounded-md transition ${partyMode === "new" ? "bg-white shadow-sm font-bold text-[#0F6B62]" : "text-[#64748B]"}`}
                >
                  + جديد
                </button>
              </div>
            </div>
            {partyMode === "existing" ? (
              <select
                value={partyId}
                onChange={(e) => {
                  setPartyId(e.target.value);
                  const p = CUSTOMERS.find((c) => c.id === e.target.value);
                  if (p) setCurrency(p.currency);
                }}
                className={inputCls}
              >
                {CUSTOMERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.type} ({c.currency})
                  </option>
                ))}
              </select>
            ) : (
              <input
                placeholder="اسم العميل أو المورد الجديد"
                value={newPartyName}
                onChange={(e) => setNewPartyName(e.target.value)}
                className={inputCls}
              />
            )}
          </div>

          {/* Logistics */}
          <div className="mt-5 pt-5 border-t border-[#EEF1F6] grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Field
              label={
                <span className="flex items-center gap-1.5">
                  <Truck size={14} /> السائق
                </span>
              }
            >
              <select
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                className={inputCls}
              >
                {DRIVERS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field
              label={
                <span className="flex items-center gap-1.5">
                  <Car size={14} /> رقم السيارة
                </span>
              }
            >
              <input
                value={carPlate}
                onChange={(e) => setCarPlate(e.target.value)}
                placeholder="مثال: ٣٤٥ ط ب ق"
                className={inputCls}
              />
            </Field>
            <Field
              label={
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} /> البلد
                </span>
              }
            >
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={inputCls}
              >
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field
              label={
                <span className="flex items-center gap-1.5">
                  <Warehouse size={14} /> المخزن
                </span>
              }
            >
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className={inputCls}
              >
                {WAREHOUSES.map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Items table */}
        <div className="bg-white border border-[#DCE1EA] rounded-2xl p-5 mb-5 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[#1C2733] flex items-center gap-1.5">
              <Package size={17} className="text-[#0F6B62]" /> أصناف الفاتورة
            </h2>
            <button
              onClick={addRow}
              className="flex items-center gap-1 text-sm font-bold text-white bg-[#0F6B62] px-3 py-1.5 rounded-lg hover:bg-[#0B4F49] transition"
            >
              <Plus size={16} /> إضافة صنف
            </button>
          </div>

          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-[#64748B] border-b border-[#DCE1EA]">
                <th className="py-2 pr-1 text-right font-bold">الصنف</th>
                <th className="py-2 text-center font-bold">عدد</th>
                <th className="py-2 text-center font-bold">وزن</th>
                <th className="py-2 text-center font-bold">كمية</th>
                <th className="py-2 text-center font-bold">سعر</th>
                <th className="py-2 text-center font-bold">القيمة</th>
                <th className="py-2 text-center font-bold">عبوة صادر</th>
                <th className="py-2 text-center font-bold">عبوة وارد</th>
                <th className="py-2 text-right font-bold">ملاحظات</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {computedRows.map((r) => (
                <tr key={r.id} className="border-b border-[#EEF1F6] align-top">
                  <td className="py-2 pl-2 min-w-[170px]">
                    <div className="flex gap-1 text-[11px] mb-1 bg-[#EEF1F6] rounded-md p-0.5 w-fit">
                      <button
                        type="button"
                        onClick={() =>
                          updateRow(r.id, {
                            itemMode: "existing",
                            itemName: "",
                          })
                        }
                        className={`px-2 py-0.5 rounded ${r.itemMode === "existing" ? "bg-white shadow-sm font-bold text-[#0F6B62]" : "text-[#64748B]"}`}
                      >
                        مسجّل
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateRow(r.id, {
                            itemMode: "new",
                            itemId: "",
                            itemName: "",
                          })
                        }
                        className={`px-2 py-0.5 rounded ${r.itemMode === "new" ? "bg-white shadow-sm font-bold text-[#0F6B62]" : "text-[#64748B]"}`}
                      >
                        + جديد
                      </button>
                    </div>

                    {r.itemMode === "existing" ? (
                      <select
                        value={r.itemId}
                        onChange={(e) => pickExistingItem(r.id, e.target.value)}
                        className={cellCls}
                      >
                        <option value="">اختر صنف...</option>
                        {catalog.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={r.itemName}
                        onChange={(e) => setNewItemName(r.id, e.target.value)}
                        onBlur={() => confirmNewItem(r.id)}
                        placeholder="اسم الصنف الجديد"
                        className={cellCls}
                      />
                    )}

                    {r.itemName && (
                      <label className="flex items-center gap-1 text-[11px] text-[#64748B] mt-1">
                        <input
                          type="checkbox"
                          checked={r.track}
                          onChange={(e) => {
                            updateRow(r.id, { track: e.target.checked });
                            if (r.itemMode === "new") {
                              setCatalog((cs) =>
                                cs.map((c) =>
                                  c.id === r.itemId
                                    ? { ...c, hasPackaging: e.target.checked }
                                    : c,
                                ),
                              );
                            }
                          }}
                        />
                        تتبّع عبوّة
                      </label>
                    )}
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      value={r.count}
                      onChange={(e) =>
                        updateRow(r.id, { count: e.target.value })
                      }
                      className={cellClsNum}
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      value={r.weight}
                      onChange={(e) =>
                        updateRow(r.id, { weight: e.target.value })
                      }
                      className={cellClsNum}
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      value={r.qty}
                      onChange={(e) => updateRow(r.id, { qty: e.target.value })}
                      className={cellClsNum}
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      value={r.price}
                      onChange={(e) =>
                        updateRow(r.id, { price: e.target.value })
                      }
                      className={cellClsNum}
                    />
                  </td>
                  <td className="py-2 text-center font-bold text-[#0F6B62] whitespace-nowrap">
                    {r.value
                      ? r.value.toLocaleString("ar-EG", {
                          maximumFractionDigits: 2,
                        })
                      : "—"}
                  </td>
                  <td className="py-2">
                    {r.track ? (
                      <input
                        type="number"
                        value={r.packOut}
                        onChange={(e) =>
                          updateRow(r.id, { packOut: e.target.value })
                        }
                        className={cellClsNum}
                      />
                    ) : (
                      <span className="text-[#C4CBD6] flex justify-center">
                        —
                      </span>
                    )}
                  </td>
                  <td className="py-2">
                    {r.track ? (
                      <input
                        type="number"
                        value={r.packIn}
                        onChange={(e) =>
                          updateRow(r.id, { packIn: e.target.value })
                        }
                        className={cellClsNum}
                      />
                    ) : (
                      <span className="text-[#C4CBD6] flex justify-center">
                        —
                      </span>
                    )}
                  </td>
                  <td className="py-2">
                    <input
                      value={r.notes}
                      onChange={(e) =>
                        updateRow(r.id, { notes: e.target.value })
                      }
                      className={cellCls}
                    />
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => removeRow(r.id)}
                      className="text-[#B5453B] hover:text-[#8a352d] transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Packaging ledger */}
        {Object.keys(packagingLedger).length > 0 && (
          <div className="bg-white border border-[#DCE1EA] rounded-2xl p-5 mb-5 shadow-sm">
            <h3 className="font-bold text-[#1C2733] mb-3 flex items-center gap-1.5">
              <PackageOpen size={17} className="text-[#0F6B62]" /> مخزن عبوات
              العميل (الفرق صادر − وارد)
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {Object.entries(packagingLedger).map(([name, v]) => {
                const diff = v.out - v.in;
                return (
                  <div
                    key={name}
                    className="bg-[#EEF1F6] rounded-xl p-3 border border-[#DCE1EA]"
                  >
                    <div className="text-xs text-[#64748B] mb-1">{name}</div>
                    <div className="text-sm">
                      صادر: <b>{v.out}</b> — وارد: <b>{v.in}</b>
                    </div>
                    <div
                      className={`text-sm font-bold mt-1 ${diff > 0 ? "text-[#B5453B]" : "text-[#1F8A5F]"}`}
                    >
                      {diff > 0
                        ? `عليه ${diff} عبوة لم ترجع`
                        : diff < 0
                          ? `له ${-diff} عبوة زيادة`
                          : "متزن"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Totals + payment */}
        <div className="bg-white border border-[#DCE1EA] rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="font-bold text-[#1C2733] mb-3 flex items-center gap-1.5">
            <CircleDollarSign size={17} className="text-[#0F6B62]" /> الإجماليات
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <Field label="نسبة الضريبة %">
              <input
                type="number"
                value={taxPct}
                onChange={(e) => setTaxPct(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label={`الخصم (${currency})`}>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label={`المدفوع (${currency})`}>
              <input
                type="number"
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
                className={inputCls}
              />
            </Field>
            <div className="flex flex-col justify-end text-sm text-[#64748B]">
              <div>
                {partyMode === "existing"
                  ? selectedParty?.type
                  : "عميل/مورد جديد"}
                :{" "}
                <b className="text-[#1C2733]">
                  {partyMode === "existing"
                    ? selectedParty?.name
                    : newPartyName || "—"}
                </b>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <Total label="الإجمالي" value={money(subtotal, currency)} />
            <Total label="الضريبة" value={money(taxAmount, currency)} />
            <Total label="الصافي" value={money(net, currency)} strong />
            <Total
              label="المتبقي"
              value={money(remaining, currency)}
              danger={remaining > 0}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 justify-end">
          {savedFlash && (
            <span className="flex items-center gap-1.5 text-sm font-bold text-[#1F8A5F]">
              <CheckCircle2 size={16} /> تم الحفظ مبدئيًا — افتح الكونسول لرؤية
              البيانات
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-white bg-[#0F6B62] hover:bg-[#0B4F49] shadow-sm transition"
          >
            <Save size={16} /> حفظ الفاتورة
          </button>
        </div>
        <p className="text-xs text-[#94A0B2] text-left mt-2">
          مبدئيًا الحفظ بيطبع بيانات الفاتورة كاملة في الـ Console لحد ما يتم
          ربط الـ API.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-[#64748B] mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function Total({ label, value, strong, danger }) {
  return (
    <div
      className={`rounded-xl p-3 border ${danger ? "bg-[#FBEEEC] border-[#F0D3CE]" : "bg-[#EEF1F6] border-[#DCE1EA]"}`}
    >
      <div className="text-xs text-[#94A0B2] mb-1">{label}</div>
      <div
        className={`font-bold ${strong ? "text-lg text-[#1C2733]" : danger ? "text-[#B5453B]" : "text-[#0F6B62]"}`}
      >
        {value}
      </div>
    </div>
  );
}

const inputCls =
  "w-full border border-[#DCE1EA] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F6B62]/40 focus:border-[#0F6B62]";
const cellCls =
  "w-full border border-[#DCE1EA] rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F6B62]";
const cellClsNum = cellCls + " w-20 text-center";
