import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import CompanySelect from "../components/CompanySelect";
import LoginForm from "../components/LoginForm";
import logo from "../assets/logos/logo.png";

const features = [
  {
    icon: Building2,
    text: "إدارة عدد غير محدود من الشركات من حساب واحد",
  },
  {
    icon: TrendingUp,
    text: "تقارير مالية دقيقة ولحظية لكل شركة",
  },
  {
    icon: Shield,
    text: "بياناتك محمية ومعزولة بالكامل بين الشركات",
  },
];

export default function LoginPage() {
  const navigate = useNavigate();

  const { requiresCompanySelection, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-paper text-ink-900"
    >
      <div className="flex min-h-screen flex-col lg:flex-row">
        <section className="relative hidden min-h-screen overflow-hidden bg-primary-500 lg:flex lg:w-[43%]">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.065]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "28px 28px",
              }}
            />

            <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full border border-white/[0.08]" />

            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full border border-dashed border-white/[0.08] animate-[spin_45s_linear_infinite]" />

            <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full border-[2px] border-white/[0.07]" />

            <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full border border-dashed border-white/[0.08] animate-[spin_55s_linear_infinite_reverse]" />

            <div className="absolute right-[18%] top-[34%] h-2 w-2 rounded-full bg-white/30 animate-pulse" />

            <div className="absolute right-[32%] top-[62%] h-1.5 w-1.5 rounded-full bg-white/20 animate-pulse [animation-delay:700ms]" />

            <div className="absolute left-[22%] top-[22%] h-1.5 w-1.5 rounded-full bg-white/20 animate-pulse [animation-delay:1200ms]" />

            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-black/[0.08]" />
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between px-8 py-8 xl:px-12 xl:py-10">
            <div className="animate-[fadeDown_0.7s_ease-out]">
              <span className="font-display text-lg font-bold text-white">
                نظام الدفتر
              </span>

              <p className="mt-1 text-[10px] font-medium text-white/40">
                الإدارة المالية الذكية
              </p>
            </div>

            <div className="my-auto max-w-xl py-16">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-medium text-white/70 backdrop-blur-sm animate-[fadeUp_0.7s_ease-out]">
                <Sparkles size={12} className="text-gold-400" strokeWidth={2} />
                <span>منصة محاسبية متكاملة</span>
              </div>

              <h1 className="font-display text-3xl font-bold leading-[1.7] tracking-tight text-white xl:text-4xl animate-[fadeUp_0.8s_ease-out]">
                حساباتك،
                <br />
                <span className="text-white/90">كل شركاتك،</span>
                <br />
                <span className="text-gold-400">في مكان واحد.</span>
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-white/55 animate-[fadeUp_0.9s_ease-out]">
                إدارة محاسبية متكاملة تساعدك على متابعة أعمالك، شركاتك، وتقاريرك
                المالية من مكان واحد بكل وضوح وثقة.
              </p>

              <div className="mt-9 space-y-3.5">
                {features.map(({ icon: Icon, text }, index) => (
                  <div
                    key={text}
                    className="group flex items-center gap-3.5 rounded-xl border border-white/[0.06] bg-white/[0.035] px-3.5 py-3 backdrop-blur-sm transition-all duration-300 hover:translate-x-1 hover:border-white/10 hover:bg-white/[0.07] animate-[fadeUp_0.8s_ease-out]"
                    style={{
                      animationDelay: `${index * 120 + 250}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 transition-all duration-300 group-hover:scale-105 group-hover:bg-white/15">
                      <Icon
                        size={17}
                        className="text-gold-400"
                        strokeWidth={1.8}
                      />
                    </span>

                    <span className="text-xs leading-6 text-white/75">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-5">
              <div className="flex items-center gap-2 text-[10px] text-white/40">
                <CheckCircle2 size={13} className="shrink-0 text-gold-400" />
                <span>متوافق مع المعايير المحاسبية المصرية</span>
              </div>

              <div className="flex items-center gap-2 text-white/35">
                <img
                  src={logo}
                  alt="DEV Squad Solutions"
                  className="h-8 w-8 rounded-lg object-contain opacity-75 transition-all duration-300 hover:scale-105 hover:opacity-100"
                />

                <div className="flex flex-col leading-tight">
                  <span className="text-[9px]">Developed by</span>
                  <span className="text-[10px] font-medium text-white/55">
                    DEV Squad Solutions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-paper px-4 py-8 sm:px-6 lg:px-10">
          <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-primary-500/[0.035] blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-primary-500/[0.035] blur-3xl" />

          <div className="relative z-10 w-full ">
            <div className="mb-7 flex flex-col items-center text-center lg:hidden animate-[fadeDown_0.6s_ease-out]">
              <h1 className="font-display text-2xl font-bold text-primary-500">
                نظام الدفتر
              </h1>

              <p className="mt-1 text-[10px] text-ink-400">
                الإدارة المالية الذكية
              </p>
            </div>

            <div className="animate-[cardIn_0.65s_ease-out] rounded-2xl border border-ink-200/70 bg-white p-5 shadow-card sm:p-7">
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />

                  <span className="text-[10px] font-medium text-ink-400">
                    {requiresCompanySelection
                      ? "اختيار الشركة"
                      : "تسجيل الدخول"}
                  </span>
                </div>

                <h2 className="font-display text-xl font-bold tracking-tight text-ink-900">
                  {requiresCompanySelection
                    ? "اختر الشركة"
                    : "مرحبًا بك مجددًا"}
                </h2>

                <p className="mt-1.5 text-[11px] leading-5 text-ink-400">
                  {requiresCompanySelection
                    ? "اختر الشركة التي تريد العمل عليها"
                    : "سجّل دخولك للوصول إلى لوحة التحكم"}
                </p>
              </div>

              {requiresCompanySelection ? <CompanySelect /> : <LoginForm />}

              <div className="mt-6 flex items-center justify-center gap-1.5 text-[9px] text-ink-300">
                <Shield size={11} />
                <span>بياناتك محمية وآمنة</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-1 text-[9px] text-ink-300">
              <span>© {new Date().getFullYear()}</span>
              <span>نظام الدفتر</span>
              <span>•</span>
              <span>DEV Squad Solutions</span>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
