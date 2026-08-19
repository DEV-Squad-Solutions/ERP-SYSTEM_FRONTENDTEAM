// features/payroll/pages/SalariesPage.jsx
//
// TODO INTEGRATION: PayrollEntries schema المبعوت مفيهوش حقل "status"
// (مسودة/تحت المراجعة/معتمد/تم الصرف) ولا فصل overtime/allowances عن bonus،
// ولا advances عن deduction. حاليًا: bonus = الإضافي+البدلات+المكافآت مجمّعين،
// deduction = الخصومات+السلف مجمّعين، والحالة mock ثابتة "معتمد" لحد ما تتوفر
// من الباك إند. الأزرار (اعتماد/صرف) موصولة فعليًا بـpayrollApi endpoints
// (approvePayrollEntry/disbursePayrollEntry) وجاهزة تشتغل فور ما الـstatus
// الحقيقي يوصل.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Search,
  RotateCcw,
  Printer,
  Wallet,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  useGetPayrollEntriesQuery,
  useGeneratePayrollEntriesMutation,
} from "../payrollApi";
import { fmtMoney, payrollStatusBadge } from "../payroll.constants";
import Input from "../../../shared/components/ui/Input";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";

const months = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];
const monthOptions = months.map((m, i) => ({ value: String(i + 1), label: m }));
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }).map((_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}));

const emptyFilters = { month: "", year: String(currentYear), search: "" };

export default function SalariesPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetPayrollEntriesQuery({
      PageNumber: page,
      PageSize: pageSize,
      Search: applied.search || undefined,
      Month: applied.month || undefined,
      Year: applied.year || undefined,
    });

  const [generatePayroll, { isLoading: isGenerating }] =
    useGeneratePayrollEntriesMutation();

  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const handleSearch = () => {
    setApplied(draft);
    setPage(1);
  };

  const handleReset = () => {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setPage(1);
  };

  const handleGenerate = () => {
    if (!applied.month || !applied.year) {
      toast.error("اختر الشهر والسنة أولًا");
      return;
    }
    toast(
      `إنشاء مرتبات ${months[Number(applied.month) - 1]} ${applied.year}؟`,
      {
        description: "هيتم إنشاء مرتب لكل الموظفين النشطين للفترة دي",
        action: {
          label: "تأكيد الإنشاء",
          onClick: async () => {
            try {
              await generatePayroll({
                month: applied.month,
                year: applied.year,
              }).unwrap();
              toast.success("تم إنشاء المرتبات بنجاح");
            } catch {
              toast.error("حصل خطأ أثناء الإنشاء، حاول تاني");
            }
          },
        },
        cancel: { label: "إلغاء" },
        duration: 6000,
      },
    );
  };

  const rows = data?.items || [];

  return (
    <div className="animate-fadeUp space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            المرتبات
          </h2>
          <p className="text-sm text-ink-400 mt-1">
            إنشاء واعتماد وصرف مرتبات الموظفين
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={16} />
            طباعة
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            <Wallet size={16} />
            {isGenerating ? "جارِ الإنشاء..." : "إنشاء المرتبات"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-ink-400/10 shadow-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              الشهر
            </label>
            <CompactSelect
              options={monthOptions}
              value={draft.month}
              onChange={(val) => setField("month", val)}
              placeholder="كل الشهور"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-400 mb-1">
              السنة
            </label>
            <CompactSelect
              options={yearOptions}
              value={draft.year}
              onChange={(val) => setField("year", val)}
            />
          </div>
          <Input
            label="بحث"
            value={draft.search}
            onChange={(e) => setField("search", e.target.value)}
            placeholder="اسم الموظف..."
          />
          <div className="flex items-end gap-2">
            <Button onClick={handleSearch} className="h-9 flex-1">
              <Search size={14} />
              بحث
            </Button>
            <Button variant="outline" onClick={handleReset} className="h-9">
              <RotateCcw size={14} />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card overflow-hidden">
          <div className="h-10 bg-ink-900/[0.03] border-b border-ink-400/10" />
          <div className="divide-y divide-ink-400/5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-3 py-3">
                <div className="h-3.5 w-28 rounded bg-ink-400/10 animate-pulse" />
                <div className="h-3.5 w-20 rounded bg-ink-400/10 animate-pulse" />
                <div className="h-3.5 w-16 rounded bg-ink-400/10 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="text-center py-14 border border-dashed border-negative/25 bg-negative/[0.02] rounded-2xl">
          <AlertCircle
            size={32}
            className="mx-auto text-negative/70 mb-3"
            strokeWidth={1.6}
          />
          <p className="text-ink-900 font-medium text-sm mb-1">
            حدث خطأ في تحميل المرتبات
          </p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 text-xs font-medium text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors mt-2"
          >
            <RefreshCw size={13} />
            إعادة المحاولة
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-ink-400/20 rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-ink-400/5 flex items-center justify-center mx-auto mb-3">
            <Wallet size={24} className="text-ink-400/50" strokeWidth={1.6} />
          </div>
          <p className="text-ink-900 font-medium text-sm mb-1">
            لا توجد مرتبات للفترة دي
          </p>
          <p className="text-xs text-ink-400 mb-4">
            جرّب إنشاء مرتبات الشهر الحالي
          </p>
        </div>
      ) : (
        <>
          <div
            className={`overflow-x-auto custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity duration-200 ${isFetching ? "opacity-60" : ""}`}
          >
            <table className="w-full text-right border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الموظف
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الفترة
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الإضافي والبدلات
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الخصومات والسلف
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    إجمالي المرتب
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    صافي المرتب
                  </th>
                  <th className="p-2.5 font-medium border-l border-ink-400/5">
                    الحالة
                  </th>
                  <th className="p-2.5 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="border-b border-ink-400/5 last:border-0 hover:bg-primary-50/30 transition-colors animate-fadeUp cursor-pointer"
                    style={{ animationDelay: `${Math.min(idx, 12) * 25}ms` }}
                    onClick={() =>
                      navigate(`/dashboard/payroll/salaries/${r.id}`)
                    }
                  >
                    <td className="p-2.5 border-l border-ink-400/5">
                      <span className="text-primary-600 hover:underline text-sm font-medium">
                        {r.employeeName}
                      </span>
                    </td>
                    <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                      {r.startDate} - {r.endDate}
                    </td>
                    <td className="p-2.5 num text-positive text-[13px] border-l border-ink-400/5">
                      {fmtMoney(r.bonus)}
                    </td>
                    <td className="p-2.5 num text-negative text-[13px] border-l border-ink-400/5">
                      {fmtMoney(r.deduction)}
                    </td>
                    <td className="p-2.5 num text-[13px] border-l border-ink-400/5">
                      {fmtMoney(r.grossSalary)}
                    </td>
                    <td className="p-2.5 num font-semibold text-[13px] border-l border-ink-400/5">
                      {fmtMoney(r.netSalary)}
                    </td>
                    <td className="p-2.5 border-l border-ink-400/5">
                      {/* MOCK: status ثابت لحد ما يتوفر من الباك إند */}
                      <span
                        className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${payrollStatusBadge.Approved}`}
                      >
                        معتمد
                      </span>
                    </td>
                    <td className="p-2.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() =>
                          navigate(`/dashboard/payroll/salaries/${r.id}`)
                        }
                        className="text-xs text-primary-600 hover:underline"
                      >
                        عرض التفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data?.totalCount > 0 && (
            <Pagination
              page={page}
              pageSize={pageSize}
              totalCount={data.totalCount}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
