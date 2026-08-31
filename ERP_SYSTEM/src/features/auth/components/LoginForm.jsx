import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Loader2,
  Mail,
  AlertCircle,
  LogIn,
} from "lucide-react";
import { useLoginMutation } from "../authApi";

export default function LoginForm() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading, error }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userName.trim() || !password) return;

    await login({
      userName: userName.trim(),
      password,
    });
  };

  const getErrorMessage = () => {
    if (!error) return "";

    if (error?.data?.detail) return error.data.detail;
    if (error?.data?.message) return error.data.message;
    if (error?.data?.title) return error.data.title;

    return "تعذر تسجيل الدخول، يرجى التأكد من البيانات والمحاولة مرة أخرى.";
  };

  return (
    <div dir="rtl">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-500/10 dark:text-primary-400">
          <LogIn size={19} strokeWidth={1.8} />
        </div>

        <h2 className="font-display text-xl font-bold tracking-tight text-ink-800 dark:text-white">
          تسجيل الدخول
        </h2>

        <p className="mt-1.5 text-[11px] leading-5 text-ink-400 dark:text-ink-500">
          أدخل بياناتك للوصول إلى حسابك
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="mb-1.5 block text-[11px] font-semibold text-ink-600 dark:text-ink-300"
          >
            اسم المستخدم
          </label>

          <div className="group relative">
            <Mail
              size={17}
              strokeWidth={1.8}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400/60 transition-colors duration-200 group-focus-within:text-primary-500"
            />

            <input
              id="username"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="mohamedAlaa"
              autoComplete="username"
              dir="ltr"
              disabled={isLoading}
              className="h-11 w-full rounded-xl border border-ink-200 bg-white pr-10 pl-4 text-left text-sm text-ink-800 outline-none transition-all duration-200 placeholder:text-ink-300 hover:border-ink-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 disabled:cursor-not-allowed disabled:bg-ink-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-ink-600 dark:hover:border-white/15 dark:focus:border-primary-400 dark:focus:ring-primary-400/10 dark:disabled:bg-white/[0.02]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-[11px] font-semibold text-ink-600 dark:text-ink-300"
          >
            كلمة المرور
          </label>

          <div className="group relative">
            <Lock
              size={17}
              strokeWidth={1.8}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400/60 transition-colors duration-200 group-focus-within:text-primary-500"
            />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              dir="ltr"
              disabled={isLoading}
              className="h-11 w-full rounded-xl border border-ink-200 bg-white px-11 text-left text-sm tracking-wider text-ink-800 outline-none transition-all duration-200 placeholder:text-ink-300 hover:border-ink-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 disabled:cursor-not-allowed disabled:bg-ink-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-ink-600 dark:hover:border-white/15 dark:focus:border-primary-400 dark:focus:ring-primary-400/10 dark:disabled:bg-white/[0.02]"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              disabled={isLoading}
              aria-label={
                showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
              }
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 transition-all duration-200 hover:bg-ink-50 hover:text-primary-500 active:scale-90 disabled:pointer-events-none dark:hover:bg-white/[0.05] dark:hover:text-primary-400"
            >
              {showPassword ? (
                <EyeOff size={17} strokeWidth={1.8} />
              ) : (
                <Eye size={17} strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-[10px] leading-5 text-red-600 animate-[errorIn_0.25s_ease-out] dark:border-red-500/10 dark:bg-red-500/10 dark:text-red-400"
          >
            <AlertCircle
              size={15}
              className="mt-0.5 shrink-0"
              strokeWidth={1.8}
            />

            <span>{getErrorMessage()}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !userName.trim() || !password}
          className="group relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary-500 text-sm font-semibold text-white shadow-sm shadow-primary-500/20 transition-all duration-300 hover:bg-primary-600 hover:shadow-md hover:shadow-primary-500/20 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

          {isLoading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              <span>جاري تسجيل الدخول...</span>
            </>
          ) : (
            <>
              <span>دخول</span>
              <LogIn
                size={16}
                className="transition-transform duration-300 group-hover:-translate-x-0.5"
              />
            </>
          )}
        </button>
      </form>

      <style>{`
        @keyframes errorIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
