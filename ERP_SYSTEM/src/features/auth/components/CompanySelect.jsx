// src/components/CompanySelect.jsx
import { useSelector } from "react-redux";
import { Building2, ChevronLeft, Loader2 } from "lucide-react";
import { useSelectCompanyMutation } from "../authApi";
import { logout } from "../authSlice";
import { useDispatch } from "react-redux";

export default function CompanySelect() {
  const dispatch = useDispatch();
  const { companies, fullName, selectionToken } = useSelector(
    (state) => state.auth,
  );
  const [selectCompany, { isLoading, error }] = useSelectCompanyMutation();

  const handleSelect = (companyId) => {
    selectCompany({ selectionToken, companyId });
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="font-display text-xl font-bold text-ink-500">
          مرحباً {fullName}
        </h2>
        <p className="text-sm text-ink-400 mt-2 font-body">
          اختار الشركة اللي عايز تدخل عليها
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-4">
          {error.data || "حصل خطأ، حاول تاني"}
        </p>
      )}

      <div className="space-y-2.5">
        {companies.map((company) => (
          <button
            key={company.id}
            onClick={() => handleSelect(company.id)}
            disabled={isLoading}
            className="w-full flex items-center gap-3 border border-ink-400/15 hover:border-primary-500 hover:bg-primary-500/5 rounded-xl px-4 py-3 transition disabled:opacity-60 text-right"
          >
            <span className="w-9 h-9 shrink-0 rounded-lg bg-primary-500/10 flex items-center justify-center">
              <Building2 size={16} className="text-primary-500" />
            </span>
            <span className="flex-1 text-sm font-medium text-ink-500">
              {company.name}
            </span>
            {isLoading ? (
              <Loader2 size={16} className="animate-spin text-ink-400" />
            ) : (
              <ChevronLeft size={16} className="text-ink-400/50" />
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => dispatch(logout())}
        className="w-full text-center text-sm text-ink-400 hover:text-ink-500 mt-6 transition"
      >
        رجوع لتسجيل الدخول
      </button>
    </div>
  );
}
