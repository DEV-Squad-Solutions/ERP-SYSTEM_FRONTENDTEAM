import { memo, useCallback, useMemo, useState } from "react";
import { Boxes, RefreshCw, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import { useGetPartiesSelectQuery } from "../../../features/partners/partiesApi";
import PartnerSetupWizard from "../../../features/partners/components/PartnerSetupWizard";
import { Printer } from "lucide-react";
import Button from "../../../shared/components/ui/Button";
const CURRENCY_LABELS = {
  EGP: "جنيه مصري",
  USD: "دولار أمريكي",
  EUR: "يورو",
  GBP: "جنيه إسترليني",
  SAR: "ريال سعودي",
  AED: "درهم إماراتي",
  KWD: "دينار كويتي",
};

function PartnerSelectHeader({
  partnerId,
  onChange,
  onPrint,
  printDisabled = false,
}) {
  const [showAdd, setShowAdd] = useState(false);

  const {
    data: parties = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetPartiesSelectQuery();

  const normalizedId = useMemo(
    () => (partnerId ? String(partnerId) : ""),
    [partnerId],
  );

  const options = useMemo(() => {
    return parties
      .filter(
        (party) =>
          party?.id !== undefined &&
          party?.id !== null &&
          String(party?.name || "").trim(),
      )
      .map((party) => {
        const name = String(party.name).trim();
        const currency = String(party?.currency || "EGP").toUpperCase();
        const currencyLabel = CURRENCY_LABELS[currency] || currency;
        const typeLabel = party?.special ? "خاص" : "عام";

        return {
          value: String(party.id),
          label: `${name}  •  ${currencyLabel}  •  ${typeLabel}`,
        };
      });
  }, [parties]);

  const handleChange = useCallback(
    (value) => {
      const nextId = value === undefined || value === null ? "" : String(value);

      onChange(nextId);
    },
    [onChange],
  );

  const handleCreated = useCallback(
    (newParty) => {
      if (!newParty?.id) {
        return;
      }

      onChange(String(newParty.id));
      setShowAdd(false);
    },
    [onChange],
  );

  const isBusy = isLoading || isFetching;

  return (
    <>
      <div
        dir="rtl"
        className="overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card"
      >
        <div className="flex items-center justify-between border-b border-ink-400/[0.07] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/5">
              <UserPlus
                size={17}
                className="text-primary-500"
                strokeWidth={1.8}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-ink-900">
                العميل / المورد
              </p>

              <p className="mt-0.5 text-[11px] text-ink-400">
                اختر الطرف لعرض حسابه
              </p>
            </div>
          </div>

          {isError && (
            <button
              type="button"
              onClick={refetch}
              disabled={isFetching}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                className={isFetching ? "animate-spin" : ""}
              />
              إعادة المحاولة
            </button>
          )}
        </div>

        <div className="p-4">
          {isError ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/70 px-3.5 py-3">
              <div>
                <p className="text-sm font-medium text-red-600">
                  تعذر تحميل العملاء والموردين
                </p>

                <p className="mt-0.5 text-xs text-red-500/80">
                  تحقق من الاتصال وحاول مرة أخرى
                </p>
              </div>

              <button
                type="button"
                onClick={refetch}
                disabled={isFetching}
                className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-medium text-red-600 shadow-sm transition hover:bg-red-100 disabled:opacity-50"
              >
                {isFetching ? "جاري المحاولة..." : "إعادة المحاولة"}
              </button>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <CompactSelect
                  options={options}
                  value={normalizedId}
                  onChange={handleChange}
                  isLoading={isBusy}
                  isSearchable
                  placeholder={
                    isLoading
                      ? "جاري تحميل العملاء والموردين..."
                      : options.length > 0
                        ? "ابحث باسم العميل أو المورد"
                        : "لا توجد أطراف متاحة"
                  }
                  searchPlaceholder="ابحث باسم العميل أو المورد..."
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={onPrint}
                disabled={printDisabled}
                className="h-10 shrink-0"
                title="طباعة كشف الحساب"
              >
                <Printer size={16} />
                <span className="hidden sm:inline">طباعة</span>
              </Button>
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                disabled={isBusy}
                className="flex h-[38px] w-[40px] shrink-0 items-center justify-center rounded-lg border border-ink-400/15 text-primary-500 transition-all duration-200 hover:border-primary-500/30 hover:bg-primary-500/5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                title="إضافة عميل أو مورد"
                aria-label="إضافة عميل أو مورد"
              >
                <UserPlus size={18} strokeWidth={1.8} />
              </button>

              <Link
                to={
                  normalizedId
                    ? `/dashboard/stores/containers/${normalizedId}`
                    : "#"
                }
                onClick={(event) => {
                  if (!normalizedId) {
                    event.preventDefault();
                  }
                }}
                className={[
                  "flex h-[38px] w-[40px] shrink-0",
                  "items-center justify-center",
                  "rounded-lg border",
                  "transition-all duration-200",
                  normalizedId
                    ? "border-gold-500/20 text-gold-600 hover:bg-gold-500/5 active:scale-95"
                    : "pointer-events-none border-ink-400/10 text-ink-300 opacity-50",
                ].join(" ")}
                title={
                  normalizedId ? "فتح مخزن العبوات" : "اختر عميل أو مورد أولاً"
                }
                aria-label="مخزن العبوات"
              >
                <Boxes size={18} strokeWidth={1.8} />
              </Link>
            </div>
          )}
        </div>

        {!isError && options.length > 0 && (
          <div className="flex items-center justify-between border-t border-ink-400/[0.07] bg-ink-400/[0.015] px-4 py-2">
            <span className="text-[11px] text-ink-400">
              {options.length} طرف متاح
            </span>

            <span className="text-[11px] text-ink-400">اكتب للبحث السريع</span>
          </div>
        )}
      </div>

      <PartnerSetupWizard
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={handleCreated}
      />
    </>
  );
}

export default memo(PartnerSelectHeader);
