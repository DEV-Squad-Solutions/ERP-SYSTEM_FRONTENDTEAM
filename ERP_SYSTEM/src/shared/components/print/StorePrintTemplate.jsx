export default function StorePrintTemplate({ store, stats }) {
  if (!store) return null;

  const printedAt = new Date().toLocaleString("ar-EG");

  return (
    <div
      dir="rtl"
      className="p-8 font-sans text-ink-900"
      style={{ width: "210mm" }}
    >
      <div className="flex items-center justify-between border-b border-ink-200 pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">{store.name}</h1>
          <p className="text-sm text-ink-500 font-mono mt-1">{store.code}</p>
        </div>
        <div className="text-left text-xs text-ink-400">
          <p>تاريخ الطباعة</p>
          <p>{printedAt}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <PrintField label="نوع المخزن" value={store.type ?? store.storeType} />
        <PrintField
          label="الحالة"
          value={
            (store.isActive ?? store.status === "Active") ? "نشط" : "غير نشط"
          }
        />
        <PrintField label="العنوان" value={store.address} />
        <PrintField
          label="تاريخ الإنشاء"
          value={
            store.createdOn
              ? new Date(store.createdOn).toLocaleDateString("ar-EG")
              : "—"
          }
        />
      </div>

      {store.description && (
        <div className="mb-6 text-sm">
          <p className="text-ink-500 mb-1">الوصف</p>
          <p>{store.description}</p>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-3 gap-4 border-t border-ink-200 pt-4">
          <PrintField label="عدد الأصناف" value={stats.itemsCount} />
          <PrintField label="إجمالي قيمة المخزون" value={stats.totalValue} />
          <PrintField label="آخر تحديث" value={printedAt} />
        </div>
      )}
    </div>
  );
}

function PrintField({ label, value }) {
  return (
    <div>
      <p className="text-ink-500 text-xs mb-0.5">{label}</p>
      <p className="font-medium">{value ?? "—"}</p>
    </div>
  );
}
