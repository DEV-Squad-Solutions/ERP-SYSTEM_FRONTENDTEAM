import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CalendarRange, Check, Lock } from "lucide-react";

import Modal from "../../components/ui/Modal";

import { useGetFiscalYearsSelectQuery } from "../../../features/fiscalYears/fiscalYearsApi";
import {
  setFiscalYears,
  setSelectedFiscalYearId,
  selectSelectedFiscalYear,
  selectSelectedFiscalYearId,
} from "../../../features/fiscalYears/fiscalYearSlice";
import {
  FISCAL_YEAR_STATUS_LABELS,
  fiscalYearStatusDot,
} from "../../../features/fiscalYears/fiscalYears.constants";
import { selectIsAuthenticated } from "../../../features/auth/authSlice";

/**
 * زر السنة المالية في الـ Navbar. يحمّل قائمة سنوات الشركة الحالية،
 * يخزّنها في fiscalYearSlice، ويسمح للمستخدم بتغيير السنة المعروضة
 * (لأغراض العرض فقط — بدون التأثير على السنة الحالية الفعلية للشركة).
 */
export default function FiscalYearSwitcher() {
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(selectIsAuthenticated);

  const { data: fiscalYears } = useGetFiscalYearsSelectQuery(undefined, {
    skip: !isAuthenticated,
  });

  const selectedFiscalYear = useSelector(selectSelectedFiscalYear);
  const selectedFiscalYearId = useSelector(selectSelectedFiscalYearId);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (fiscalYears) {
      dispatch(setFiscalYears(fiscalYears));
    }
  }, [fiscalYears, dispatch]);

  if (!isAuthenticated || !fiscalYears?.length) return null;

  const handleSelect = (yearId) => {
    if (yearId !== selectedFiscalYearId) {
      dispatch(setSelectedFiscalYearId(yearId));
    }

    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="تغيير السنة المالية"
        className={[
          "group flex items-center gap-1.5",
          "rounded-lg",
          "border border-ink-200",
          "bg-white",
          "px-2.5 py-1.5",
          "text-[11px] font-bold",
          "text-ink-700",
          "transition-all duration-200",
          "hover:border-primary-300",
          "hover:bg-primary-50",
          "hover:text-primary-700",
          "active:scale-[0.97]",
          "dark:border-white/[0.08]",
          "dark:bg-white/[0.04]",
          "dark:text-ink-200",
          "dark:hover:bg-primary-500/10",
          "dark:hover:text-primary-300",
          "focus:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-primary-500/30",
        ].join(" ")}
      >
        <CalendarRange
          size={14}
          strokeWidth={2}
          className="text-ink-400 group-hover:text-primary-600 dark:text-ink-400"
        />

        <span>{selectedFiscalYear?.name || "—"}</span>

        {selectedFiscalYear?.status === "Closed" && (
          <Lock size={11} strokeWidth={2.2} className="text-ink-400" />
        )}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="السنة المالية"
      >
        <div className="space-y-2">
          {fiscalYears.map((year) => {
            const isSelected = year.id === selectedFiscalYearId;

            return (
              <button
                key={year.id}
                type="button"
                onClick={() => handleSelect(year.id)}
                className={[
                  "flex w-full items-center justify-between",
                  "rounded-xl",
                  "border",
                  isSelected
                    ? "border-primary-300 bg-primary-50 dark:border-primary-500/30 dark:bg-primary-500/10"
                    : "border-ink-100 bg-white hover:border-ink-200 hover:bg-ink-50 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:bg-white/[0.05]",
                  "px-3.5 py-2.5",
                  "text-right",
                  "transition-all duration-150",
                ].join(" ")}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={[
                      "h-2 w-2 rounded-full",
                      fiscalYearStatusDot[year.status] || "bg-ink-400",
                    ].join(" ")}
                  />

                  <div className="flex flex-col items-start">
                    <span className="text-[13px] font-bold text-ink-800 dark:text-white">
                      {year.name}
                    </span>

                    <span className="text-[11px] text-ink-400 dark:text-ink-400">
                      {year.startDate} — {year.endDate}
                    </span>
                  </div>

                  {year.isCurrent && (
                    <span className="rounded-md bg-primary-500/10 px-1.5 py-0.5 text-[10px] font-bold text-primary-600 dark:text-primary-400">
                      الحالية
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-ink-500 dark:text-ink-300">
                    {FISCAL_YEAR_STATUS_LABELS[year.status] || year.status}
                  </span>

                  {isSelected && (
                    <Check size={16} strokeWidth={2.5} className="text-primary-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
