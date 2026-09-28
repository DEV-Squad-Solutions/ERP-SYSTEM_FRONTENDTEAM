import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, Check } from "lucide-react";
import { toast } from "sonner";

import Modal from "../../components/ui/Modal";

import { useSwitchCompanyMutation } from "../../../features/auth/authApi";
import {
  selectCompanies,
  selectSelectedCompany,
  selectRefreshToken,
} from "../../../features/auth/authSlice";
import { getApiErrors } from "../../../utils/getApiErrors";

/**
 * زر تبديل الشركة في الـ Navbar. بيظهر بس لو المستخدم عنده أكتر
 * من شركة واحدة (companies.length > 1) — مطابق لما هو موضّح في
 * قسم "Endpoints الشركات وتسجيل الدخول" بالدليل: POST /Auth/switch-company
 * بدون الحاجة لـ logout.
 */
export default function CompanySwitcher() {
  const dispatch = useDispatch();

  const companies = useSelector(selectCompanies);
  const selectedCompany = useSelector(selectSelectedCompany);
  const refreshToken = useSelector(selectRefreshToken);

  const [switchCompany, { isLoading }] = useSwitchCompanyMutation();
  const [isOpen, setIsOpen] = useState(false);

  if (!companies || companies.length < 2) return null;

  const handleSelect = async (companyId) => {
    if (companyId === selectedCompany?.id) {
      setIsOpen(false);
      return;
    }

    try {
      await switchCompany({ companyId, refreshToken }).unwrap();
      setIsOpen(false);
      toast.success("تم التبديل للشركة بنجاح");
    } catch (error) {
      getApiErrors(error).forEach((message) => toast.error(message));
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="تغيير الشركة"
        className={[
          "flex items-center gap-1.5",
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
        <Building2 size={14} strokeWidth={2} className="text-ink-400" />
        <span className="max-w-[120px] truncate">
          {selectedCompany?.name || "—"}
        </span>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="الشركة">
        <div className="space-y-2">
          {companies.map((company) => {
            const isSelected = company.id === selectedCompany?.id;

            return (
              <button
                key={company.id}
                type="button"
                disabled={isLoading}
                onClick={() => handleSelect(company.id)}
                className={[
                  "flex w-full items-center justify-between",
                  "rounded-xl border px-3.5 py-2.5 text-right",
                  "transition-all duration-150",
                  isSelected
                    ? "border-primary-300 bg-primary-50 dark:border-primary-500/30 dark:bg-primary-500/10"
                    : "border-ink-100 bg-white hover:border-ink-200 hover:bg-ink-50 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:bg-white/[0.05]",
                  "disabled:opacity-50",
                ].join(" ")}
              >
                <span className="text-[13px] font-bold text-ink-800 dark:text-white">
                  {company.name}
                </span>

                {isSelected && (
                  <Check size={16} strokeWidth={2.5} className="text-primary-600" />
                )}
              </button>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
