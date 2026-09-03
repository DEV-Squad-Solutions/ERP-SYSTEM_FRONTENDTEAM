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
  const {
    companies = [],
    fullName,
    selectionToken,
  } = useSelector((state) => state.auth);
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
      await selectCompany({ selectionToken, companyId }).unwrap();
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
    <div dir="rtl" className="w-full min-w-0">
      {" "}
      {/* Header */}{" "}
      <div className="mb-5 text-center">
        {" "}
        <div className=" mx-auto mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500 transition-transform duration-300 hover:scale-105 ">
          {" "}
          <Building2 size={22} strokeWidth={1.8} />{" "}
        </div>{" "}
        <h2 className="font-display text-lg font-bold text-ink-800">
          {" "}
          مرحباً {fullName || "بك"}{" "}
        </h2>{" "}
        <p className="mt-1.5 text-[11px] leading-5 text-ink-400">
          {" "}
          اختر الشركة التي تريد الدخول إليها{" "}
        </p>{" "}
      </div>{" "}
      {/* Error */}{" "}
      {error && (
        <div
          role="alert"
          className=" mb-3.5 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-[10px] leading-5 text-red-600 motion-safe:animate-[errorIn_0.25s_ease-out_both] "
        >
          {" "}
          <span className="min-w-0"> {getErrorMessage()} </span>{" "}
        </div>
      )}{" "}
      {/* Search */}{" "}
      {companies.length > 4 && (
        <div className="relative mb-3.5">
          {" "}
          <Search
            size={16}
            className=" pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400/50 "
          />{" "}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن شركة..."
            disabled={isLoading}
            className=" h-10.5 w-full rounded-xl border border-ink-200 bg-ink-400/[0.025] pr-10 pl-10 text-sm text-ink-700 outline-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-ink-400/50 hover:border-ink-300 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 disabled:cursor-not-allowed disabled:opacity-60 "
          />{" "}
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              disabled={isLoading}
              aria-label="مسح البحث"
              className=" absolute left-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 transition-all duration-200 hover:bg-ink-400/10 hover:text-ink-600 active:scale-90 disabled:pointer-events-none "
            >
              {" "}
              <X size={14} />{" "}
            </button>
          )}{" "}
        </div>
      )}{" "}
      {/* Companies */}{" "}
      {filteredCompanies.length > 0 ? (
        <div className="relative min-w-0">
          {" "}
          <div className=" max-h-[38vh] space-y-2 overflow-y-auto overflow-x-hidden overscroll-contain px-0.5 pb-0.5 custom-scroll sm:max-h-[42vh] ">
            {" "}
            {filteredCompanies.map((company, index) => {
              const isSelected = selectedId === company.id;
              return (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => handleSelect(company.id)}
                  disabled={isLoading}
                  style={{ animationDelay: `${index * 45}ms` }}
                  className={` group relative flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-xl border px-3 py-3 text-right transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out motion-safe:animate-[companyIn_0.35s_ease-out_both] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-65 ${isSelected ? "border-primary-500 bg-primary-500/[0.06] shadow-sm shadow-primary-500/5" : "border-ink-200 bg-white hover:-translate-y-0.5 hover:border-primary-500/40 hover:bg-primary-500/[0.025] hover:shadow-sm"} `}
                >
                  {" "}
                  {/* Icon */}{" "}
                  <span
                    className={` flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-[background-color,color,transform] duration-200 ${isSelected ? "bg-primary-500 text-white" : "bg-primary-500/10 text-primary-500 group-hover:scale-105 group-hover:bg-primary-500 group-hover:text-white"} `}
                  >
                    {" "}
                    {isSelected && isLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Building2 size={18} strokeWidth={1.8} />
                    )}{" "}
                  </span>{" "}
                  {/* Text */}{" "}
                  <span className="min-w-0 flex-1">
                    {" "}
                    <span className="block truncate text-sm font-bold text-ink-700">
                      {" "}
                      {company.name}{" "}
                    </span>{" "}
                    <span className="mt-0.5 block truncate text-[10px] text-ink-400">
                      {" "}
                      الدخول إلى الشركة{" "}
                    </span>{" "}
                  </span>{" "}
                  {/* Action */}{" "}
                  <span
                    className={` flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-[background-color,color,transform] duration-200 ${isSelected ? "bg-primary-500/10 text-primary-500" : "text-ink-400/40 group-hover:bg-primary-500/10 group-hover:text-primary-500"} `}
                  >
                    {" "}
                    {isSelected && !isLoading ? (
                      <Check size={16} strokeWidth={2.5} />
                    ) : (
                      <ChevronLeft size={17} />
                    )}{" "}
                  </span>{" "}
                </button>
              );
            })}{" "}
          </div>{" "}
          {filteredCompanies.length > 4 && (
            <div
              aria-hidden="true"
              className=" pointer-events-none absolute bottom-0 left-0 right-0 h-6 rounded-b-xl bg-gradient-to-t from-white to-transparent "
            />
          )}{" "}
        </div>
      ) : (
        <div className=" rounded-xl border border-dashed border-ink-200 bg-ink-400/[0.02] px-4 py-8 text-center motion-safe:animate-[errorIn_0.25s_ease-out_both] ">
          {" "}
          <Search size={25} className="mx-auto mb-2.5 text-ink-400/35" />{" "}
          <p className="text-xs font-semibold text-ink-600"> لا توجد نتائج </p>{" "}
          <p className="mt-1 text-[10px] text-ink-400">
            {" "}
            لم نجد شركة تطابق "{search}"{" "}
          </p>{" "}
          <button
            type="button"
            onClick={() => setSearch("")}
            className=" mt-3 text-[10px] font-semibold text-primary-500 transition-colors hover:text-primary-600 "
          >
            {" "}
            عرض جميع الشركات{" "}
          </button>{" "}
        </div>
      )}{" "}
      {/* Logout */}{" "}
      <div className="mt-4 border-t border-ink-200/70 pt-3">
        {" "}
        <button
          type="button"
          onClick={() => dispatch(logout())}
          disabled={isLoading}
          className=" flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium text-ink-400 transition-[background-color,color,transform] duration-200 hover:bg-red-50 hover:text-red-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 "
        >
          {" "}
          <LogOut size={15} /> <span>العودة لتسجيل الدخول</span>{" "}
        </button>{" "}
      </div>{" "}
      <style>{` @keyframes companyIn { from { opacity: 0; transform: translate3d(0, 6px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } @keyframes errorIn { from { opacity: 0; transform: translate3d(0, -4px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-delay: 0ms !important; transition-duration: 0.01ms !important; } } `}</style>{" "}
    </div>
  );
}
