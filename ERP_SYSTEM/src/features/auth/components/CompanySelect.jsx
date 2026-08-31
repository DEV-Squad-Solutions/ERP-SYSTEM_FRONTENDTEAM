import { useSelector, useDispatch } from "react-redux";
import {
  Building2,
  Check,
  ChevronLeft,
  Loader2,
  LogOut,
  Search,
  X,
} from "lucide-react";
import { useSelectCompanyMutation } from "../authApi";
import { logout } from "../authSlice";
import { useMemo, useState } from "react";

export default function CompanySelect() {
  const dispatch = useDispatch();

  const { companies, fullName, selectionToken } = useSelector(
    (state) => state.auth,
  );

  const [selectCompany, { isLoading, error }] = useSelectCompanyMutation();
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");

  const filteredCompanies = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return companies;

    return companies.filter((company) =>
      String(company.name || "")
        .toLowerCase()
        .includes(value),
    );
  }, [companies, search]);

  const handleSelect = async (companyId) => {
    if (isLoading) return;

    setSelectedId(companyId);

    try {
      await selectCompany({
        selectionToken,
        companyId,
      }).unwrap();
    } catch {
      setSelectedId(null);
    }
  };

  const getErrorMessage = () => {
    if (!error) return null;

    if (typeof error.data === "string") {
      return error.data;
    }

    if (error.data?.message) {
      return error.data.message;
    }

    if (error.data?.detail) {
      return error.data.detail;
    }

    return "حدث خطأ أثناء اختيار الشركة، حاول مرة أخرى";
  };

  return (
    <div dir="rtl" className="animate-fadeUp">
      <div className="text-center mb-7">
        <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center">
          <Building2 size={26} className="text-primary-500" strokeWidth={1.8} />
        </div>

        <h2 className="font-display text-xl font-bold text-ink-500">
          مرحباً {fullName || "بك"}
        </h2>

        <p className="text-sm text-ink-400 mt-2 font-body leading-relaxed">
          اختر الشركة التي تريد الدخول إليها
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 mb-4 animate-fadeUp">
          <span className="text-sm leading-relaxed">{getErrorMessage()}</span>
        </div>
      )}

      {companies.length > 4 && (
        <div className="relative mb-4">
          <Search
            size={18}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400/50 pointer-events-none"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن شركة..."
            disabled={isLoading}
            className="
              w-full
              h-11
              pr-10
              pl-10
              rounded-xl
              border border-ink-400/15
              bg-ink-400/[0.025]
              text-sm text-ink-500
              placeholder:text-ink-400/50
              outline-none
              transition-all duration-200
              focus:border-primary-500
              focus:bg-white
              focus:ring-2
              focus:ring-primary-500/10
              disabled:opacity-60
            "
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              disabled={isLoading}
              className="
                absolute left-3
                top-1/2
                -translate-y-1/2
                w-6
                h-6
                rounded-md
                flex
                items-center
                justify-center
                text-ink-400
                hover:text-ink-500
                hover:bg-ink-400/10
                transition
              "
              aria-label="مسح البحث"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {filteredCompanies.length > 0 ? (
        <div className="relative">
          <div
            className="
              space-y-3
              max-h-[45vh]
              sm:max-h-[50vh]
              overflow-y-auto
              custom-scroll
              pr-1
              pl-1
              pb-1
              overscroll-contain
            "
          >
            {filteredCompanies.map((company) => {
              const isSelected = selectedId === company.id;

              return (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => handleSelect(company.id)}
                  disabled={isLoading}
                  className={`
                    group relative w-full flex items-center gap-3
                    rounded-2xl border px-4 py-3.5
                    text-right overflow-hidden
                    transition-all duration-200
                    active:scale-[0.985]
                    ${
                      isSelected
                        ? "border-primary-500 bg-primary-500/[0.06] shadow-sm"
                        : "border-ink-400/15 bg-white hover:border-primary-500/50 hover:bg-primary-500/[0.025] hover:-translate-y-0.5 hover:shadow-sm"
                    }
                    disabled:cursor-not-allowed
                    disabled:opacity-70
                  `}
                >
                  <span
                    className={`
                      relative shrink-0 w-11 h-11 rounded-xl
                      flex items-center justify-center
                      transition-all duration-200
                      ${
                        isSelected
                          ? "bg-primary-500 text-white"
                          : "bg-primary-500/10 text-primary-500 group-hover:bg-primary-500 group-hover:text-white"
                      }
                    `}
                  >
                    {isSelected && isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Building2 size={20} strokeWidth={1.8} />
                    )}
                  </span>

                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-ink-500 truncate">
                      {company.name}
                    </span>

                    <span className="block text-xs text-ink-400 mt-1">
                      الدخول إلى الشركة
                    </span>
                  </span>

                  <span
                    className={`
                      shrink-0 w-8 h-8 rounded-lg
                      flex items-center justify-center
                      transition-all duration-200
                      ${
                        isSelected
                          ? "bg-primary-500/10 text-primary-500"
                          : "text-ink-400/40 group-hover:text-primary-500 group-hover:bg-primary-500/10"
                      }
                    `}
                  >
                    {isSelected && !isLoading ? (
                      <Check size={17} strokeWidth={2.5} />
                    ) : (
                      <ChevronLeft size={18} />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredCompanies.length > 4 && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent rounded-b-2xl" />
          )}
        </div>
      ) : (
        <div className="text-center py-10 rounded-2xl border border-dashed border-ink-400/20 bg-ink-400/[0.02] animate-fadeUp">
          <Search size={28} className="mx-auto text-ink-400/40 mb-3" />

          <p className="text-sm font-medium text-ink-500">لا توجد نتائج</p>

          <p className="text-xs text-ink-400 mt-1">
            لم نجد شركة تطابق "{search}"
          </p>

          <button
            type="button"
            onClick={() => setSearch("")}
            className="
              mt-4
              text-xs
              font-medium
              text-primary-500
              hover:text-primary-600
              transition
            "
          >
            عرض جميع الشركات
          </button>
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-ink-400/10">
        <button
          type="button"
          onClick={() => dispatch(logout())}
          disabled={isLoading}
          className="
            w-full flex items-center justify-center gap-2
            py-2.5 rounded-xl
            text-sm font-medium text-ink-400
            hover:text-red-500 hover:bg-red-50
            transition-all duration-200
            disabled:opacity-50
          "
        >
          <LogOut size={16} />
          العودة لتسجيل الدخول
        </button>
      </div>
    </div>
  );
}
