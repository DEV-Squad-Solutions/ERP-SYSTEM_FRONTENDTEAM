function Field({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-xs text-ink-500">{label}</p>
      <p className="text-sm font-medium text-ink-900">
        {(value ?? value === 0) ? value : "—"}
      </p>
    </div>
  );
}

export default function StoreOverviewTab({ store }) {
  if (!store) return null;

  return (
    <div dir="rtl" className="rounded-2xl bg-white p-6 shadow-card">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="اسم المخزن" value={store.name} />

        <Field label="كود المخزن" value={store.code} />

        <Field
          label="نوع المخزن"
          value={store.isContainerStore ? "مخزن عبوات" : "مخزن اصناف"}
        />

        <Field label="العنوان" value={store.address} />

        <Field label="الحالة" value={store.isActive ? "نشط" : "غير نشط"} />

        {store.isContainerStore && (
          <Field label="العميل / المورد" value={store.businessPartnerName} />
        )}
      </div>
    </div>
  );
}
