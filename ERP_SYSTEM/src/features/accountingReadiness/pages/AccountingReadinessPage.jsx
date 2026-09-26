// features/accountingReadiness/pages/AccountingReadinessPage.jsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ShieldCheck,
  ShieldAlert,
  Wrench,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileSearch,
  ExternalLink,
} from "lucide-react";

import {
  useGetAccountingReadinessQuery,
  useBackfillAccountingReadinessMutation,
} from "../accountingReadinessApi";
import { useGetFiscalYearsQuery } from "../../fiscalYears/fiscalYearsApi";

import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";

const ISSUE_LABELS = {
  MissingJournal: "قيد ناقص",
  PendingInventoryCost: "تكلفة مخزون معلّقة",
  OrphanAutomaticJournal: "قيد آلي بلا مصدر",
  DuplicateAutomaticJournal: "قيد آلي مكرر",
  UnbalancedAutomaticJournal: "قيد آلي غير متوازن",
  MissingMapping: "ربط محاسبي ناقص",
};

const ISSUE_BADGE = {
  MissingJournal: "bg-negative/10 text-negative",
  PendingInventoryCost: "bg-amber-500/10 text-amber-700",
  OrphanAutomaticJournal: "bg-negative/10 text-negative",
  DuplicateAutomaticJournal: "bg-negative/10 text-negative",
  UnbalancedAutomaticJournal: "bg-negative/10 text-negative",
  MissingMapping: "bg-amber-500/10 text-amber-700",
};

// يبني رابط الانتقال للمصدر نفسه حسب نوعه (لصفحة التفاصيل لو متاحة)
const SOURCE_ROUTE_BUILDERS = {
  Invoice: (id) => `/dashboard/sales/${id}`,
  CashboxTransfer: (id) => `/dashboard/treasury/transfers/${id}`,
  StockAdjustment: (id) => `/dashboard/inventory/adjustments/${id}`,
  DriverTrip: () => `/dashboard/drivers/trip-costs`,
  CashboxOpeningBalance: () => `/dashboard/treasury`,
  StockOpeningBalance: () => `/dashboard/inventory/opening-balances`,
  EmployeeOpeningBalance: () => `/dashboard/payroll/opening-balances`,
  // CashVoucher: لا توجد صفحة تفاصيل مستقلة حالياً بالراوتر
};

// يبني رابط الانتقال لتصحيح الربط المحاسبي حسب نوعه (لو المشكلة ربط ناقص)
const MAPPING_ROUTE_BUILDERS = {
  Cashbox: () => `/dashboard/account-mappings`,
  Store: () => `/dashboard/account-mappings`,
  Expense: () => `/dashboard/account-mappings`,
  Revenue: () => `/dashboard/account-mappings`,
};

function resolveSourceLink(issue) {
  const builder = SOURCE_ROUTE_BUILDERS[issue.sourceType];
  if (!builder || !issue.sourceId) return null;
  return builder(issue.sourceId);
}

function resolveMappingLink(issue) {
  if (!issue.mappingType) return null;
  const builder = MAPPING_ROUTE_BUILDERS[issue.mappingType];
  return builder ? builder() : `/dashboard/account-mappings`;
}

export default function AccountingReadinessPage() {
  const navigate = useNavigate();

  const [fiscalYearId, setFiscalYearId] = useState(null);
  const [isBackfillOpen, setIsBackfillOpen] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);

  const { data: fiscalYearsData } = useGetFiscalYearsQuery({
    PageNumber: 1,
    PageSize: 100,
  });

  const fiscalYearOptions = useMemo(
    () =>
      (fiscalYearsData?.items || []).map((fy) => ({
        value: String(fy.id),
        label: fy.name,
      })),
    [fiscalYearsData],
  );

  const activeFiscalYearId = useMemo(() => {
    if (fiscalYearId) return Number(fiscalYearId);
    const current = fiscalYearsData?.items?.find((fy) => fy.isCurrent);
    return current?.id ?? fiscalYearsData?.items?.[0]?.id ?? null;
  }, [fiscalYearId, fiscalYearsData]);

  const {
    data: readiness,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAccountingReadinessQuery(activeFiscalYearId, {
    skip: !activeFiscalYearId,
  });

  const [backfillAccountingReadiness] =
    useBackfillAccountingReadinessMutation();

  const confirmBackfill = async () => {
    if (!activeFiscalYearId) return;

    setIsBackfilling(true);
    try {
      const result =
        await backfillAccountingReadiness(activeFiscalYearId).unwrap();

      toast.success(
        `تم التنفيذ: ${result.createdJournals} قيد جديد، ${result.updatedJournals} قيد محدّث`,
      );
      setIsBackfillOpen(false);
    } catch (error) {
      toast.error(
        error?.data?.detail ||
          error?.data?.title ||
          "حدث خطأ أثناء تنفيذ عملية الاستكمال",
      );
    } finally {
      setIsBackfilling(false);
    }
  };

  return (
    <div className="animate-fadeUp space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-ink-900">
              مراقبة الجاهزية المحاسبية
            </h2>
            <p className="text-sm text-ink-400 mt-0.5">
              يفحص السنة المالية ويعرض مؤشرات اكتمال دفتر الأستاذ الموحد بدون
              تعديل البيانات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-48">
            <CompactSelect
              options={fiscalYearOptions}
              value={
                fiscalYearId ??
                (activeFiscalYearId ? String(activeFiscalYearId) : "")
              }
              onChange={(v) => setFiscalYearId(v)}
              placeholder="اختر السنة المالية"
            />
          </div>
          <Button variant="outline" className="h-9" onClick={refetch}>
            <RotateCcw size={14} />
            تحديث
          </Button>
          <Button
            className="h-9 bg-amber-600 hover:bg-amber-600/90"
            onClick={() => setIsBackfillOpen(true)}
            disabled={!activeFiscalYearId}
          >
            <Wrench size={14} />
            استكمال القيود
          </Button>
        </div>
      </div>

      {isLoading ? (
        <ReadinessSkeleton />
      ) : isError ? (
        <div className="rounded-2xl border border-negative/25 bg-negative/[0.02] py-14 text-center">
          <AlertCircle
            size={34}
            className="mx-auto mb-3 text-negative/70"
            strokeWidth={1.6}
          />
          <p className="mb-1 font-medium text-ink-900">
            حدث خطأ في تحميل تقرير الجاهزية
          </p>
          <button
            onClick={refetch}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-500 transition-colors hover:bg-primary-100 hover:text-primary-600"
          >
            <RotateCcw size={15} />
            إعادة المحاولة
          </button>
        </div>
      ) : !readiness ? (
        <div className="rounded-2xl border border-dashed border-ink-400/20 py-16 text-center">
          <FileSearch
            size={26}
            className="mx-auto mb-3 text-ink-400/50"
            strokeWidth={1.6}
          />
          <p className="font-medium text-ink-900">
            اختر سنة مالية لعرض تقرير الجاهزية
          </p>
        </div>
      ) : (
        <div
          className={`space-y-4 transition-opacity duration-200 ${
            isFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          {/* Status banner */}
          <div
            className={`flex items-center gap-3 rounded-2xl border px-5 py-4 ${
              readiness.isReady
                ? "border-positive/20 bg-positive/[0.04]"
                : "border-amber-500/20 bg-amber-500/[0.04]"
            }`}
          >
            {readiness.isReady ? (
              <CheckCircle2 size={22} className="shrink-0 text-positive" />
            ) : (
              <ShieldAlert size={22} className="shrink-0 text-amber-600" />
            )}
            <div>
              <p className="font-semibold text-ink-900">
                {readiness.fiscalYearName} — {readiness.startDate} إلى{" "}
                {readiness.endDate}
              </p>
              <p className="text-sm text-ink-600 mt-0.5">
                {readiness.isReady
                  ? "السنة المالية جاهزة، مفيش مشاكل مانعة في المصادر غير المؤجلة"
                  : "فيه مشاكل محتاجة مراجعة قبل اعتبار السنة جاهزة"}
              </p>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <SummaryCard
              label="إجمالي المصادر"
              value={readiness.totalSources}
            />
            <SummaryCard
              label="مُرحّلة"
              value={readiness.postedSources}
              tone="positive"
            />
            <SummaryCard
              label="قيود ناقصة"
              value={readiness.missingJournalSources}
              tone={readiness.missingJournalSources ? "negative" : "positive"}
            />
            <SummaryCard
              label="تكاليف مخزون معلّقة"
              value={readiness.pendingInventoryCosts}
              tone={readiness.pendingInventoryCosts ? "amber" : "positive"}
            />
            <SummaryCard
              label="روابط محاسبية ناقصة"
              value={readiness.missingOrInvalidMappings}
              tone={
                readiness.missingOrInvalidMappings ? "negative" : "positive"
              }
            />
            <SummaryCard
              label="مرتبات مؤجلة"
              value={readiness.deferredPayrollSources}
              tone="neutral"
              icon={<Clock size={13} />}
            />
          </div>

          {/* Sources breakdown */}
          <div className="overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card">
            <div className="border-b border-ink-400/10 px-5 py-3">
              <h3 className="font-semibold text-ink-900 text-sm">
                تفصيل المصادر حسب النوع
              </h3>
            </div>
            <div className="overflow-x-auto custom-scroll">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b border-ink-400/10 text-xs font-semibold text-ink-600">
                    <th className="px-4 py-2.5 text-right">النوع</th>
                    <th className="px-4 py-2.5 text-center">الإجمالي</th>
                    <th className="px-4 py-2.5 text-center">مُرحّل</th>
                    <th className="px-4 py-2.5 text-center">ناقص</th>
                  </tr>
                </thead>
                <tbody>
                  {readiness.sources.map((s) => (
                    <tr
                      key={s.sourceType}
                      className="border-b border-ink-400/5 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-2.5 text-right font-medium text-ink-900">
                        {s.sourceType}
                      </td>
                      <td className="num px-4 py-2.5 text-center text-ink-600">
                        {s.totalSources}
                      </td>
                      <td className="num px-4 py-2.5 text-center text-positive">
                        {s.postedSources}
                      </td>
                      <td
                        className={`num px-4 py-2.5 text-center ${
                          s.missingJournalSources
                            ? "text-negative font-semibold"
                            : "text-ink-400"
                        }`}
                      >
                        {s.missingJournalSources}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Issues */}
          <div className="overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card">
            <div className="border-b border-ink-400/10 px-5 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-ink-900 text-sm">
                المشاكل التفصيلية
              </h3>
              <span className="text-xs text-ink-400">
                {readiness.issues.length} مشكلة
              </span>
            </div>

            {readiness.issues.length === 0 ? (
              <div className="py-10 text-center text-sm text-ink-400">
                لا توجد مشاكل حالياً
              </div>
            ) : (
              <div className="overflow-x-auto custom-scroll">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-ink-400/10 text-xs font-semibold text-ink-600">
                      <th className="px-4 py-2.5 text-right">النوع</th>
                      <th className="px-4 py-2.5 text-right">المصدر</th>
                      <th className="px-4 py-2.5 text-center">الرقم</th>
                      <th className="px-4 py-2.5 text-center">التاريخ</th>
                      <th className="px-4 py-2.5 text-right">التفاصيل</th>
                      <th className="px-4 py-2.5 text-center">إجراء سريع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readiness.issues.map((issue, i) => {
                      const sourceLink = resolveSourceLink(issue);
                      const mappingLink = resolveMappingLink(issue);

                      return (
                        <tr
                          key={`${issue.sourceType}-${issue.sourceId}-${i}`}
                          className="border-b border-ink-400/5 last:border-0 hover:bg-slate-50"
                        >
                          <td className="px-4 py-2.5 text-right">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                ISSUE_BADGE[issue.issueType] ||
                                "bg-ink-400/10 text-ink-400"
                              }`}
                            >
                              {ISSUE_LABELS[issue.issueType] || issue.issueType}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right text-ink-600">
                            {issue.sourceType}
                          </td>
                          <td className="num px-4 py-2.5 text-center">
                            {sourceLink ? (
                              <button
                                type="button"
                                onClick={() => navigate(sourceLink)}
                                className="inline-flex items-center gap-1 font-medium text-primary-600 underline-offset-2 transition-colors hover:text-primary-700 hover:underline"
                                title="فتح المصدر"
                              >
                                {issue.sourceNumber}
                                <ExternalLink size={11} />
                              </button>
                            ) : (
                              <span className="font-medium text-ink-900">
                                {issue.sourceNumber}
                              </span>
                            )}
                          </td>
                          <td className="num px-4 py-2.5 text-center text-ink-500">
                            {issue.sourceDate}
                          </td>
                          <td className="px-4 py-2.5 text-right text-ink-600">
                            {issue.message}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {sourceLink && (
                                <button
                                  type="button"
                                  onClick={() => navigate(sourceLink)}
                                  className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                                  title="فتح المصدر"
                                >
                                  <ExternalLink size={14} />
                                </button>
                              )}
                              {mappingLink && (
                                <button
                                  type="button"
                                  onClick={() => navigate(mappingLink)}
                                  className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
                                  title="تصحيح الربط المحاسبي"
                                >
                                  <Wrench size={14} />
                                </button>
                              )}
                              {!sourceLink && !mappingLink && (
                                <span className="text-xs text-ink-400/60">
                                  —
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={isBackfillOpen}
        onClose={() => setIsBackfillOpen(false)}
        title="تأكيد استكمال القيود"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3">
            <Wrench
              size={18}
              className="mt-0.5 shrink-0 text-amber-600"
              strokeWidth={1.8}
            />
            <p className="text-sm leading-relaxed text-ink-700">
              هيتم استكمال الحسابات والروابط الناقصة، وإعادة حساب تكلفة المخزون،
              وإنشاء أو تحديث القيود التلقائية للمصادر القديمة في هذه السنة
              المالية. العملية آمنة ولن تكرر القيود عند التنفيذ أكتر من مرة،
              لكنها متاحة للمسؤول فقط.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-ink-400/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBackfillOpen(false)}
              disabled={isBackfilling}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={confirmBackfill}
              disabled={isBackfilling}
              className="bg-amber-600 hover:bg-amber-600/90"
            >
              {isBackfilling ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  جارِ التنفيذ...
                </span>
              ) : (
                "تأكيد الاستكمال"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SummaryCard({ label, value, tone = "neutral", icon }) {
  const toneClasses = {
    positive: "text-positive",
    negative: "text-negative",
    amber: "text-amber-600",
    neutral: "text-ink-900",
  };

  return (
    <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card px-4 py-3">
      <p className="text-xs text-ink-400 mb-1 flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className={`num text-xl font-bold ${toneClasses[tone]}`}>{value}</p>
    </div>
  );
}

function ReadinessSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-2xl border border-ink-400/10 bg-ink-900/[0.03] animate-pulse"
          />
        ))}
      </div>
      <div className="h-48 rounded-2xl border border-ink-400/10 bg-ink-900/[0.03] animate-pulse" />
      <div className="h-64 rounded-2xl border border-ink-400/10 bg-ink-900/[0.03] animate-pulse" />
    </div>
  );
}
