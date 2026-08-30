import { ShieldX, ArrowRight, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      {" "}
      <div className="w-full max-w-md text-center">
        {" "}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-negative/10">
          {" "}
          <ShieldX size={38} className="text-negative" strokeWidth={1.7} />{" "}
        </div>
        <div className="mb-2 text-6xl font-bold tracking-tight text-ink-900">
          403
        </div>
        <h1 className="mb-3 text-xl font-semibold text-ink-900">
          غير مصرح لك بالوصول
        </h1>
        <p className="mx-auto max-w-sm text-sm leading-7 text-ink-500">
          ليس لديك الدور المطلوب للوصول إلى هذه الصفحة. إذا كنت تعتقد أن هذا غير
          صحيح، تواصل مع مسؤول النظام.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
          >
            <Home size={16} />
            الرئيسية
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-ink-400/15 bg-white px-5 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-slate-50"
          >
            <ArrowRight size={16} />
            رجوع
          </button>
        </div>
      </div>
    </div>
  );
}
