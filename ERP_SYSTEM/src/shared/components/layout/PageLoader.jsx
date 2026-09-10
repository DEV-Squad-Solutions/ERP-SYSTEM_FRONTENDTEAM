export default function PageLoader() {
  return (
    <div
      className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
    >
      <span
        className="
          h-10
          w-10
          animate-spin
          rounded-full
          border-4
          border-teal-500/25
          border-t-teal-500
          dark:border-teal-400/20
          dark:border-t-teal-400
        "
        aria-hidden="true"
      />

      <span className="text-sm text-gray-400 dark:text-gray-500">
        جاري تحميل الصفحة...
      </span>
    </div>
  );
}
