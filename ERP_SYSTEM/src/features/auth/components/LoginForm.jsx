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
import { useDispatch } from "react-redux";
import { baseApi } from "../../../lib/baseApi";
export default function LoginForm() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userName.trim() || !password) return;

    dispatch(baseApi.util.resetApiState());

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
    <div dir="rtl" className="w-full min-w-0">
      {/* Header */}
      <div className="mb-5 text-center">
        <div
          className="
            mx-auto mb-3
            flex h-10 w-10
            items-center justify-center
            rounded-xl
            bg-primary-500/10
            text-primary-500
            transition-transform duration-300
            hover:scale-105
          "
        >
          <LogIn size={18} strokeWidth={1.8} />
        </div>

        <h2 className="font-display text-lg font-bold tracking-tight text-ink-800">
          تسجيل الدخول
        </h2>

        <p className="mt-1.5 text-[11px] leading-5 text-ink-400">
          أدخل بياناتك للوصول إلى حسابك
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="
              mb-1.5
              block
              text-[11px]
              font-semibold
              text-ink-600
            "
          >
            اسم المستخدم
          </label>

          <div className="group relative">
            <Mail
              size={16}
              strokeWidth={1.8}
              className="
                pointer-events-none
                absolute right-3.5 top-1/2
                -translate-y-1/2
                text-ink-400/55
                transition-colors duration-200
                group-focus-within:text-primary-500
              "
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
              className="
                h-11
                w-full
                rounded-xl
                border border-ink-200
                bg-white
                pr-10
                pl-4
                text-left
                text-sm
                text-ink-800
                outline-none

                transition-[border-color,box-shadow,background-color]
                duration-200

                placeholder:text-ink-300

                hover:border-ink-300

                focus:border-primary-500
                focus:ring-4
                focus:ring-primary-500/10

                disabled:cursor-not-allowed
                disabled:bg-ink-50
              "
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="
              mb-1.5
              block
              text-[11px]
              font-semibold
              text-ink-600
            "
          >
            كلمة المرور
          </label>

          <div className="group relative">
            <Lock
              size={16}
              strokeWidth={1.8}
              className="
                pointer-events-none
                absolute right-3.5 top-1/2
                -translate-y-1/2
                text-ink-400/55
                transition-colors duration-200
                group-focus-within:text-primary-500
              "
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
              className="
                h-11
                w-full
                rounded-xl
                border border-ink-200
                bg-white
                px-11
                text-left
                text-sm
                tracking-wider
                text-ink-800
                outline-none

                transition-[border-color,box-shadow,background-color]
                duration-200

                placeholder:text-ink-300

                hover:border-ink-300

                focus:border-primary-500
                focus:ring-4
                focus:ring-primary-500/10

                disabled:cursor-not-allowed
                disabled:bg-ink-50
              "
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              disabled={isLoading}
              aria-label={
                showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
              }
              className="
                absolute left-2 top-1/2
                flex h-8 w-8
                -translate-y-1/2
                items-center justify-center
                rounded-lg
                text-ink-400

                transition-[background-color,color,transform]
                duration-200

                hover:bg-ink-50
                hover:text-primary-500

                active:scale-90

                disabled:pointer-events-none
              "
            >
              {showPassword ? (
                <EyeOff size={17} strokeWidth={1.8} />
              ) : (
                <Eye size={17} strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="
              flex
              items-start
              gap-2.5
              rounded-xl
              border border-red-100
              bg-red-50
              px-3
              py-2.5
              text-[10px]
              leading-5
              text-red-600
              motion-safe:animate-[errorIn_0.25s_ease-out_both]
            "
          >
            <AlertCircle
              size={15}
              className="mt-0.5 shrink-0"
              strokeWidth={1.8}
            />

            <span className="min-w-0">{getErrorMessage()}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !userName.trim() || !password}
          className="
            group
            relative
            flex
            h-11
            w-full
            items-center
            justify-center
            gap-2
            overflow-hidden
            rounded-xl
            bg-primary-500
            text-sm
            font-semibold
            text-white

            shadow-sm
            shadow-primary-500/20

            transition-[background-color,box-shadow,transform]
            duration-300

            hover:bg-primary-600
            hover:shadow-md
            hover:shadow-primary-500/20

            active:scale-[0.985]

            disabled:cursor-not-allowed
            disabled:opacity-50
            disabled:shadow-none
          "
        >
          {/* Shine */}
          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute inset-0
              -translate-x-full
              bg-gradient-to-r
              from-transparent
              via-white/10
              to-transparent
              transition-transform
              duration-700
              group-hover:translate-x-full
            "
          />

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
                className="
                  transition-transform
                  duration-300
                  group-hover:-translate-x-0.5
                "
              />
            </>
          )}
        </button>
      </form>

      <style>{`
        @keyframes errorIn {
          from {
            opacity: 0;
            transform: translate3d(0, -4px, 0);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-delay: 0ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
