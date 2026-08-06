export default function DriverListPrintTemplate({
  drivers = [],
  filters = {},
}) {
  const printedAt = new Date().toLocaleString("ar-EG");
  const hasActiveFilters = Object.values(filters || {}).some((v) => v);

  return (
    <div className="p-8 text-ink-900" dir="rtl">
      <div className="flex items-center justify-between border-b border-ink-900/20 pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">تقرير السائقين</h1>
          <p className="text-xs text-ink-400 mt-1">
            تاريخ الطباعة: {printedAt}
          </p>
        </div>
        <div className="text-sm text-ink-400">
          إجمالي السائقين: {drivers.length}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mb-4 text-xs text-ink-400 space-x-3 space-x-reverse">
          {filters.search && <span>بحث: {filters.search}</span>}
          {filters.code && <span> | كود: {filters.code}</span>}
          {filters.licenseNumber && (
            <span> | رقم رخصة: {filters.licenseNumber}</span>
          )}
          {filters.isActive !== "" && (
            <span>
              {" "}
              | الحالة: {filters.isActive === "true" ? "نشط" : "غير نشط"}
            </span>
          )}
        </div>
      )}

      <table className="w-full text-right text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-ink-900">
            <th className="py-2 px-2">الكود</th>
            <th className="py-2 px-2">الاسم</th>
            <th className="py-2 px-2">التليفون</th>
            <th className="py-2 px-2">رقم الرخصة</th>
            <th className="py-2 px-2">انتهاء الرخصة</th>
            <th className="py-2 px-2">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver) => (
            <tr key={driver.id} className="border-b border-ink-900/10">
              <td className="py-2 px-2 font-mono text-xs">{driver.code}</td>
              <td className="py-2 px-2 font-semibold">{driver.name}</td>
              <td className="py-2 px-2">{driver.phoneNumber || "—"}</td>
              <td className="py-2 px-2 font-mono text-xs">
                {driver.licenseNumber || "—"}
              </td>
              <td className="py-2 px-2">{driver.licenseExpiryDate || "—"}</td>
              <td className="py-2 px-2">
                {driver.isActive ? "نشط" : "غير نشط"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {drivers.length === 0 && (
        <p className="text-center text-ink-400 py-10">لا توجد بيانات للطباعة</p>
      )}
    </div>
  );
}
