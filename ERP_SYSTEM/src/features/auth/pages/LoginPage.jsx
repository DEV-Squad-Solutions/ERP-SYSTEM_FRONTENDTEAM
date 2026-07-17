import { useState } from "react";
import { CheckCircle2, Building2, Shield, TrendingUp } from "lucide-react";
import CompanySelect from "../components/CompanySelect";
import LoginForm from "../components/LoginForm";

const features = [
  { icon: Building2, text: "إدارة عدد غير محدود من الشركات من حساب واحد" },
  { icon: TrendingUp, text: "تقارير مالية دقيقة ولحظية لكل شركة" },
  { icon: Shield, text: "بياناتك محمية ومعزولة بالكامل بين الشركات" },
];

export default function LoginPage() {
  const [step, setStep] = useState("select-company");

  return (
    <div dir="rtl" className="min-h-screen flex">
      {/* الجانب البصري - يختفي على الموبايل */}
      <div className="hidden lg:flex lg:w-2/5 bg-primary-500 relative overflow-hidden flex-col justify-between p-10">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full border-[3px] border-white/[0.08] flex items-center justify-center">
          <div className="w-56 h-56 rounded-full border border-white/[0.08]" />
        </div>
        <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-dashed border-white/[0.06] animate-[spin_60s_linear_infinite]" />

        <div className="relative z-10">
          <span className="font-display text-white text-xl font-bold">
            نظام الدفتر
          </span>
        </div>

        <div className="relative z-10 font-display">
          <p className="text-3xl font-bold leading-relaxed mb-3 text-white">
            حساباتك، كل شركاتك،
            <br />
            في مكان واحد موثوق
          </p>
          <p className="text-white/60 text-sm font-body mb-8">
            إدارة محاسبية متكاملة لكل شركات مصر
          </p>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="w-8 h-8 shrink-0 rounded-lg bg-white/10 flex items-center justify-center mt-0.5">
                  <Icon size={16} className="text-gold-400" strokeWidth={1.8} />
                </span>
                <span className="text-sm text-white/80 font-body leading-relaxed pt-1">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5">
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <CheckCircle2 size={14} className="text-gold-400" />
            متوافق مع المعايير المحاسبية المصرية
          </div>

          <div className="flex items-center gap-2 text-white/40 text-xs">
            <img
              src="src/assets/logos/nexbyte-logo-dark.svg"
              alt="Nexbyte"
              className="w-24 h-24 opacity-70"
            />
            <span>© {new Date().getFullYear()} جميع الحقوق محفوظة</span>
          </div>
        </div>
      </div>

      {/* الفورم */}
      <div className="flex-1 flex items-center justify-center bg-paper px-4 py-10">
        <div className="w-full max-w-md animate-fadeUp">
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-primary-500">
              نظام الدفتر
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-ink-400/10 p-8">
            {step === "select-company" && (
              <CompanySelect onNext={() => setStep("login")} />
            )}
            {step === "login" && (
              <LoginForm onBack={() => setStep("select-company")} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
