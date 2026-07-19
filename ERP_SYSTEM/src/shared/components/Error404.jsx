import { Home, ArrowLeft, SearchX } from "lucide-react";
import { Link } from "react-router-dom";

export default function Error404() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-6 font-body">
      {/* Background Decorations */}
      <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-primary-50 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gold-50 blur-3xl" />

      <div className="relative w-full max-w-xl animate-fadeUp rounded-3xl border border-primary-100 bg-white p-10 text-center shadow-card">
        {/* Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary-50 shadow-stamp">
          <SearchX className="h-12 w-12 text-primary-500" />
        </div>

        {/* 404 */}
        <h1 className="mt-8 font-display text-8xl font-extrabold text-primary-500">
          404
        </h1>

        <h2 className="mt-4 font-display text-3xl font-bold text-ink-900">
          الصفحة غير موجودة
        </h2>

        <p className="mt-4 leading-8 text-ink-400">
          يبدو أن الصفحة التي تبحث عنها قد تم نقلها أو حذفها أو أن الرابط غير
          صحيح.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white transition hover:bg-primary-600"
          >
            <Home size={18} />
            الصفحة الرئيسية
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold-400 px-6 py-3 font-semibold text-gold-600 transition hover:bg-gold-50"
          >
            <ArrowLeft size={18} />
            رجوع
          </button>
        </div>

        {/* Stamp */}
        <div className="absolute right-6 top-6 rotate-12 rounded-full border-2 border-gold-400 px-4 py-2 font-display text-xs font-bold tracking-[0.3em] text-gold-500 animate-stampIn">
          NOT FOUND
        </div>
      </div>
    </main>
  );
}
