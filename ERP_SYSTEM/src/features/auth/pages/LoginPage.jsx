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
  { icon: Building2, text: "إدارة عدد غير محدود من الشركات من حساب واحد" },
  { icon: TrendingUp, text: "تقارير مالية دقيقة ولحظية لكل شركة" },
  { icon: Shield, text: "بياناتك محمية ومعزولة بالكامل بين الشركات" },
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
      className=" relative isolate h-[100dvh] w-full overflow-hidden bg-paper text-ink-900 "
    >
      {" "}
      <div className="flex h-full w-full overflow-hidden lg:flex-row">
        {" "}
        {/* ================= LEFT ================= */}{" "}
        <section className=" relative hidden h-full min-w-0 overflow-hidden bg-primary-500 lg:flex lg:w-[43%] lg:shrink-0 ">
          {" "}
          <div
            aria-hidden="true"
            className=" pointer-events-none absolute inset-0 overflow-hidden "
          >
            {" "}
            <div
              className="absolute inset-0 opacity-[0.065]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "28px 28px",
              }}
            />{" "}
            <div className=" absolute -right-32 -top-32 h-72 w-72 rounded-full border border-white/[0.08] " />{" "}
            <div className=" absolute -right-20 -top-20 h-48 w-48 rounded-full border border-dashed border-white/[0.08] motion-safe:animate-[spin_45s_linear_infinite] " />{" "}
            <div className=" absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full border-2 border-white/[0.07] " />{" "}
            <div className=" absolute -bottom-24 -left-24 h-80 w-80 rounded-full border border-dashed border-white/[0.08] motion-safe:animate-[spin_55s_linear_infinite_reverse] " />{" "}
            <span className=" absolute right-[18%] top-[34%] h-2 w-2 rounded-full bg-white/30 motion-safe:animate-pulse " />{" "}
            <span className=" absolute right-[32%] top-[62%] h-1.5 w-1.5 rounded-full bg-white/20 motion-safe:animate-pulse [animation-delay:700ms] " />{" "}
            <span className=" absolute left-[22%] top-[22%] h-1.5 w-1.5 rounded-full bg-white/20 motion-safe:animate-pulse [animation-delay:1200ms] " />{" "}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-black/[0.08]" />{" "}
          </div>{" "}
          <div className=" relative z-10 flex h-full w-full flex-col justify-between overflow-hidden px-8 py-6 xl:px-12 xl:py-8 ">
            {" "}
            {/* Brand */}{" "}
            <div className="motion-safe:animate-[fadeDown_0.6s_ease-out_both]">
              {" "}
              <span className="font-display text-lg font-bold text-white">
                {" "}
                نظام الدفتر{" "}
              </span>{" "}
              <p className="mt-1 text-[10px] font-medium text-white/40">
                {" "}
                الإدارة المالية الذكية{" "}
              </p>{" "}
            </div>{" "}
            {/* Content */}{" "}
            <div className=" my-auto min-h-0 max-w-xl py-5 xl:py-7 ">
              {" "}
              <div className=" mb-3.5 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-medium text-white/70 backdrop-blur-sm motion-safe:animate-[fadeUp_0.55s_ease-out_100ms_both] ">
                {" "}
                <Sparkles
                  size={12}
                  className="text-gold-400"
                  strokeWidth={2}
                />{" "}
                <span>منصة محاسبية متكاملة</span>{" "}
              </div>{" "}
              <h1 className=" font-display text-3xl font-bold leading-[1.55] tracking-tight text-white motion-safe:animate-[fadeUp_0.65s_ease-out_160ms_both] xl:text-4xl ">
                {" "}
                حساباتك، <br />{" "}
                <span className="text-white/90"> كل شركاتك، </span> <br />{" "}
                <span className="text-gold-400"> في مكان واحد. </span>{" "}
              </h1>{" "}
              <p className=" mt-3.5 max-w-lg text-sm leading-6 text-white/55 motion-safe:animate-[fadeUp_0.7s_ease-out_220ms_both] ">
                {" "}
                إدارة محاسبية متكاملة تساعدك على متابعة أعمالك، شركاتك، وتقاريرك
                المالية من مكان واحد بكل وضوح وثقة.{" "}
              </p>{" "}
              <div className="mt-6 space-y-2">
                {" "}
                {features.map(({ icon: Icon, text }, index) => (
                  <div
                    key={text}
                    style={{ animationDelay: `${index * 90 + 300}ms` }}
                    className=" group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.035] px-3 py-2.5 backdrop-blur-sm transition-[transform,background-color,border-color] duration-300 hover:translate-x-1 hover:border-white/10 hover:bg-white/[0.07] motion-safe:animate-[fadeUp_0.55s_ease-out_both] "
                  >
                    {" "}
                    <span className=" flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 transition-transform duration-300 group-hover:scale-105 ">
                      {" "}
                      <Icon
                        size={16}
                        className="text-gold-400"
                        strokeWidth={1.8}
                      />{" "}
                    </span>{" "}
                    <span className="min-w-0 text-xs leading-5 text-white/75">
                      {" "}
                      {text}{" "}
                    </span>{" "}
                  </div>
                ))}{" "}
              </div>{" "}
            </div>{" "}
            {/* Footer */}{" "}
            <div className=" flex shrink-0 items-center justify-between gap-4 border-t border-white/10 pt-3.5 ">
              {" "}
              <div className="flex min-w-0 items-center gap-2 text-[10px] text-white/40">
                {" "}
                <CheckCircle2
                  size={13}
                  className="shrink-0 text-gold-400"
                />{" "}
                <span className="truncate">
                  {" "}
                  متوافق مع المعايير المحاسبية المصرية{" "}
                </span>{" "}
              </div>{" "}
              <div className="flex shrink-0 items-center gap-2 text-white/35">
                {" "}
                <img
                  src={logo}
                  alt="DEV Squad Solutions"
                  className=" h-8 w-8 rounded-lg object-contain opacity-75 transition-[transform,opacity] duration-300 hover:scale-105 hover:opacity-100 "
                />{" "}
                <div className="hidden flex-col leading-tight xl:flex">
                  {" "}
                  <span className="text-[9px]"> Developed by </span>{" "}
                  <span className="text-[10px] font-medium text-white/55">
                    {" "}
                    DEV Squad Solutions{" "}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </section>{" "}
        {/* ================= RIGHT ================= */}{" "}
        <section className=" relative flex h-full min-w-0 flex-1 items-center justify-center overflow-hidden bg-paper px-4 py-4 sm:px-6 lg:px-10 ">
          {" "}
          <div
            aria-hidden="true"
            className=" pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-primary-500/[0.035] blur-3xl "
          />{" "}
          <div
            aria-hidden="true"
            className=" pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-primary-500/[0.035] blur-3xl "
          />{" "}
          <div className=" relative z-10 flex max-h-full w-full min-w-0 max-w-[500px] flex-col justify-center ">
            {" "}
            {/* Mobile Brand */}{" "}
            <div className=" mb-4 shrink-0 text-center motion-safe:animate-[fadeDown_0.5s_ease-out_both] lg:hidden ">
              {" "}
              <h1 className="font-display text-2xl font-bold text-primary-500">
                {" "}
                نظام الدفتر{" "}
              </h1>{" "}
              <p className="mt-1 text-[10px] text-ink-400">
                {" "}
                الإدارة المالية الذكية{" "}
              </p>{" "}
            </div>{" "}
            {/* Card */}{" "}
            <div className=" min-w-0 overflow-hidden rounded-2xl border border-ink-200/70 bg-white p-5 shadow-card motion-safe:animate-[cardIn_0.55s_cubic-bezier(0.22,1,0.36,1)_both] sm:p-6 ">
              {" "}
              <div className="mb-4">
                {" "}
                <div className="mb-1.5 flex items-center gap-2">
                  {" "}
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />{" "}
                  <span className="text-[10px] font-medium text-ink-400">
                    {" "}
                    {requiresCompanySelection
                      ? "اختيار الشركة"
                      : "تسجيل الدخول"}{" "}
                  </span>{" "}
                </div>{" "}
                <h2 className="font-display text-lg font-bold tracking-tight text-ink-900">
                  {" "}
                  {requiresCompanySelection
                    ? "اختر الشركة"
                    : "مرحبًا بك مجددًا"}{" "}
                </h2>{" "}
                <p className="mt-1 text-[10px] leading-5 text-ink-400">
                  {" "}
                  {requiresCompanySelection
                    ? "اختر الشركة التي تريد العمل عليها"
                    : "سجّل دخولك للوصول إلى لوحة التحكم"}{" "}
                </p>{" "}
              </div>{" "}
              <div className="min-w-0">
                {" "}
                {requiresCompanySelection ? (
                  <CompanySelect />
                ) : (
                  <LoginForm />
                )}{" "}
              </div>{" "}
              <div className=" mt-4 flex items-center justify-center gap-1.5 text-[9px] text-ink-300 ">
                {" "}
                <Shield size={11} className="shrink-0" />{" "}
                <span>بياناتك محمية وآمنة</span>{" "}
              </div>{" "}
            </div>{" "}
            {/* Copyright */}{" "}
            <div className=" mt-3 flex shrink-0 items-center justify-center gap-1 text-[9px] text-ink-300 motion-safe:animate-[fadeUp_0.5s_ease-out_300ms_both] ">
              {" "}
              <span>© {new Date().getFullYear()}</span> <span>نظام الدفتر</span>{" "}
              <span>•</span> <span>DEV Squad Solutions</span>{" "}
            </div>{" "}
          </div>{" "}
        </section>{" "}
      </div>{" "}
      <style>{` @keyframes fadeUp { from { opacity: 0; transform: translate3d(0, 10px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } @keyframes fadeDown { from { opacity: 0; transform: translate3d(0, -8px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } @keyframes cardIn { from { opacity: 0; transform: translate3d(0, 10px, 0) scale(0.99); } to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); } } @media (max-height: 680px) { .login-page-content { transform: scale(0.96); transform-origin: center; } } @media (max-width: 1023px) and (max-height: 700px) { main { overflow-y: auto; } } @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-delay: 0ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; } } `}</style>{" "}
    </main>
  );
}
