import {
  ChevronsRight,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
} from "lucide-react";

const pageSizeOptions = [25, 50, 100, 250];

/**
 * @param {{ page: number, pageSize: number, totalCount: number, onPageChange: (page: number) => void, onPageSizeChange: (size: number) => void }} props
 */
export default function Pagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm">
      <div className="flex items-center gap-3 text-ink-500">
        <span>
          عرض {from} - {to} من أصل {totalCount.toLocaleString("ar-EG")} فاتورة
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-ink-400/15 px-2 py-1 text-sm bg-white focus:outline-none focus:border-primary-500"
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
          className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-400/5 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronsRight size={16} />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-400/5 disabled:opacity-30 disabled:pointer-events-none"
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
              className={`w-8 h-8 rounded-lg text-sm num transition-colors ${
                p === page
                  ? "bg-primary-500 text-white font-medium"
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
          className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-400/5 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-400/5 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronsLeft size={16} />
        </button>
      </div>
    </div>
  );
}
