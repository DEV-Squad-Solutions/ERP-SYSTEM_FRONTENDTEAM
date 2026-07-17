import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Building2, ChevronLeft, PlusCircle } from "lucide-react";
import { useGetCompaniesQuery } from "../authApi";
import { setSelectedCompany } from "../authSlice";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

/**
 * @param {{ onNext: () => void }} props
 */
export default function CompanySelect({ onNext }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: companies, isLoading, isError } = useGetCompaniesQuery();
  const [search, setSearch] = useState("");

  const filtered = companies?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (company) => {
    dispatch(setSelectedCompany({ id: company.id, name: company.name }));
    onNext();
  };

  const noCompaniesAtAll = !isLoading && !isError && companies?.length === 0;
  const noSearchResults =
    !isLoading && companies?.length > 0 && filtered?.length === 0;

  return (
    <div className="w-full max-w-md mx-auto animate-fadeUp">
      <h2 className="font-display text-xl font-bold text-ink-900 mb-1">
        اختر الشركة
      </h2>
      <p className="text-sm text-ink-400 mb-5">
        حدد الشركة اللي عايز تسجل دخول عليها
      </p>

      {!noCompaniesAtAll && (
        <Input
          type="text"
          placeholder="ابحث عن شركة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />
      )}

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-ink-400/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-center text-negative text-sm py-4">
          حدث خطأ في تحميل الشركات
        </p>
      )}

      {noCompaniesAtAll && (
        <div className="text-center border border-dashed border-ink-400/20 rounded-2xl py-8 px-4">
          <div className="w-14 h-14 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center mx-auto mb-3">
            <Building2 size={26} strokeWidth={1.6} />
          </div>
          <p className="text-ink-900 font-medium mb-1">
            مفيش أي شركة مسجلة في النظام حالياً
          </p>
          <p className="text-sm text-ink-400 mb-5">
            سجّل أول شركة عشان تقدر تبدأ تستخدم النظام
          </p>
          <Button
            onClick={() => navigate("/register-company")}
            className="mx-auto"
          >
            <PlusCircle size={18} />
            تسجيل شركة جديدة
          </Button>
        </div>
      )}

      {!noCompaniesAtAll && !isLoading && (
        <div className="space-y-2 max-h-72 overflow-y-scroll custom-scroll">
          {filtered?.map((company, i) => (
            <button
              key={company.id}
              onClick={() => handleSelect(company)}
              style={{ animationDelay: `${i * 40}ms` }}
              className="w-full flex items-center justify-between border border-ink-400/10 rounded-xl px-4 py-3 hover:border-primary-400 hover:bg-primary-50/50 transition-colors animate-fadeUp "
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center">
                  <Building2 size={17} />
                </span>
                <span className="font-medium text-ink-900">{company.name}</span>
              </div>
              <ChevronLeft size={18} className="text-ink-400" />
            </button>
          ))}
        </div>
      )}

      {noSearchResults && (
        <p className="text-center text-ink-400 text-sm mt-4">
          لا توجد شركة بهذا الاسم
        </p>
      )}
    </div>
  );
}
