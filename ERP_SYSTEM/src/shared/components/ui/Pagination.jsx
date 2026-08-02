import {
  ChevronsRight,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
} from "lucide-react";

const pageSizeOptions = [25, 50, 100];

/**
 * @param {{
 * page: number,
 * pageSize: number,
 * totalCount: number,
 * onPageChange: (page: number) => void,
 * onPageSizeChange: (size: number) => void,
 * label?: string
 * }} props
 */
export default function Pagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  label = "عنصر",
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  const getPageNumbers = () => {
    const pages = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
  };

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 p-1 text-sm sm:flex-row">
      <div className="flex items-center gap-3 text-ink-500">
        <span>
          عرض {from} - {to} من أصل {totalCount.toLocaleString("ar-EG")} {label}
        </span>

        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="rounded-lg border border-ink-400/15 bg-white px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} / صفحة
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-400/5 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronsRight size={16} />
        </button>

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-400/5 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>

        {getPageNumbers().map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-ink-400">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`num h-8 w-8 rounded-lg text-sm transition-colors ${
                p === page
                  ? "bg-primary-500 font-medium text-white"
                  : "text-ink-600 hover:bg-ink-400/5"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-400/5 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-400/5 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronsLeft size={16} />
        </button>
      </div>
    </div>
  );
}
