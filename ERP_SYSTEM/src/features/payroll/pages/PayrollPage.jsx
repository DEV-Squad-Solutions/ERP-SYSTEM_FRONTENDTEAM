import { useState } from "react";
import { Printer, Save } from "lucide-react";
import PayrollFilters from "../components/PayrollFilters";
import PayrollTable from "../components/PayrollTable";

export default function PayrollPage() {
  const initialFilters = {
    search: "",
    fromDate: "",
    toDate: "",
  };

  const [filters, setFilters] = useState(initialFilters);
  const [isSaving, setIsSaving] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("تم حفظ السجلات بنجاح!");
    }, 600);
  };

  return (
    <div className="p-6 space-y-4 print:p-0 print:space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">سجل الأجور والمرتبات الشامل</h1>
          <p className="text-xs text-slate-500 mt-1 print:hidden">
            متابعة استحقاقات الموظفين والاستقطاعات وصافي المرتبات
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-sm transition-colors"
          >
            <Save size={15} />
            <span>{isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium shadow-sm transition-colors"
          >
            <Printer size={15} />
            <span>طباعة سجل المرتبات</span>
          </button>
        </div>
      </div>

      <PayrollFilters filters={filters} onChange={setFilters} />
      <PayrollTable filters={filters} />
    </div>
  );
}