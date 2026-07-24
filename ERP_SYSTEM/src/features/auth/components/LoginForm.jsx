// src/components/LoginForm.jsx
import { useState } from "react";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useLoginMutation } from "../authApi";
import { getErrorMessage } from "../../../lib/getErrorMessage";

export default function LoginForm() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, error }] = useLoginMutation();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ userName, password });
  };
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="font-display text-xl font-bold text-ink-500">
          تسجيل الدخول
        </h2>
        <p className="text-sm text-ink-400 mt-2 font-body">
          ادخل بياناتك للوصول لحسابك
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink-500 mb-1.5">
            اسم المستخدم
          </label>
          <div className="relative">
            <Mail
              size={18}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400/50"
            />
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}

              placeholder="mohamedAlaa"
              className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-ink-400/20 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 outline-none transition text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-500 mb-1.5">
            كلمة المرور
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400/50"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-ink-400/20 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 outline-none transition text-sm"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
            {getErrorMessage(error)}{" "}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              جاري الدخول...
            </>
          ) : (
            "دخول"
          )}
        </button>
      </form>
    </div>
  );
}
