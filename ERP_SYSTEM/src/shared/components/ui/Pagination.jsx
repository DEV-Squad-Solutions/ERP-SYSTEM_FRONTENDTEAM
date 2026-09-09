import { useMemo } from "react";
import {
  ChevronsRight,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
} from "lucide-react";

const pageSizeOptions = [25, 50, 75, 100];

/**
 * @param {{
 *   page: number,
 *   pageSize: number,
 *   totalCount: number,
 *   onPageChange: (page: number) => void,
 *   onPageSizeChange: (size: number) => void,
 *   label?: string
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
  const safePageSize = Math.max(1, Number(pageSize) || 25);
  const safeTotalCount = Math.max(0, Number(totalCount) || 0);

  const totalPages = Math.max(1, Math.ceil(safeTotalCount / safePageSize));

  const currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);

  const from = safeTotalCount === 0 ? 0 : (currentPage - 1) * safePageSize + 1;

  const to = Math.min(currentPage * safePageSize, safeTotalCount);

  const pageNumbers = useMemo(() => {
    const pages = [];

    // عدد الصفحات التي تظهر حول الصفحة الحالية
    const delta = 1;

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);

    if (start > 2) {
      pages.push("left-dots");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("right-dots");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  const goToPage = (nextPage) => {
    const targetPage = Math.min(Math.max(1, nextPage), totalPages);

    if (targetPage !== currentPage) {
      onPageChange(targetPage);
    }
  };

  const handlePageSizeChange = (event) => {
    const newSize = Number(event.target.value);

    if (!Number.isFinite(newSize) || newSize <= 0) return;

    onPageSizeChange(newSize);

    if (currentPage !== 1) {
      onPageChange(1);
    }
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav
      aria-label="التنقل بين الصفحات"
      dir="rtl"
      className="
        mt-4
        rounded-2xl
        border
        border-ink-400/10
        bg-white
        p-3
        shadow-sm
        sm:p-4
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        {/* Results info */}
        <div
          className="
            flex
            flex-wrap
            items-center
            justify-center
            gap-x-3
            gap-y-2
            text-xs
            text-ink-500
            sm:justify-start
          "
        >
          <span className="whitespace-nowrap">
            عرض{" "}
            <strong className="font-semibold text-ink-800">
              {from.toLocaleString("ar-EG")}
            </strong>{" "}
            -{" "}
            <strong className="font-semibold text-ink-800">
              {to.toLocaleString("ar-EG")}
            </strong>{" "}
            من أصل{" "}
            <strong className="font-semibold text-ink-800">
              {safeTotalCount.toLocaleString("ar-EG")}
            </strong>{" "}
            {label}
          </span>

          <span className="hidden h-4 w-px bg-ink-400/15 sm:block" />

          {/* Page size */}
          <label
            className="
              flex
              items-center
              gap-2
              whitespace-nowrap
              text-ink-500
            "
          >
            <span>عرض</span>

            <span className="relative">
              <select
                value={safePageSize}
                onChange={handlePageSizeChange}
                aria-label="عدد العناصر في الصفحة"
                className="
                  h-9
                  cursor-pointer
                  appearance-none
                  rounded-xl
                  border
                  border-ink-400/15
                  bg-ink-400/[0.025]
                  px-3
                  pe-8
                  text-xs
                  font-semibold
                  text-ink-800
                  outline-none
                  transition-all
                  duration-200

                  hover:border-ink-400/25
                  hover:bg-ink-400/[0.05]

                  focus:border-primary-500
                  focus:bg-white
                  focus:ring-4
                  focus:ring-primary-500/10
                "
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              <ChevronLeft
                size={14}
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  end-2
                  top-1/2
                  -translate-y-1/2
                  text-ink-400
                "
              />
            </span>

            <span>لكل صفحة</span>
          </label>
        </div>

        {/* Pagination controls */}
        <div
          className="
            flex
            items-center
            justify-center
            gap-1
          "
        >
          {/* First page */}
          <PaginationButton
            label="الصفحة الأولى"
            disabled={isFirstPage}
            onClick={() => goToPage(1)}
          >
            <ChevronsRight size={17} strokeWidth={1.8} />
          </PaginationButton>

          {/* Previous */}
          <PaginationButton
            label="الصفحة السابقة"
            disabled={isFirstPage}
            onClick={() => goToPage(currentPage - 1)}
          >
            <ChevronRight size={17} strokeWidth={1.8} />
          </PaginationButton>

          {/* Pages */}
          <div className="mx-1 flex items-center gap-1">
            {pageNumbers.map((item, index) => {
              if (typeof item !== "number") {
                return (
                  <span
                    key={`${item}-${index}`}
                    aria-hidden="true"
                    className="
                      flex
                      h-9
                      w-6
                      items-center
                      justify-center
                      text-xs
                      font-semibold
                      text-ink-400
                    "
                  >
                    •••
                  </span>
                );
              }

              const active = item === currentPage;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => goToPage(item)}
                  aria-label={`الانتقال إلى الصفحة ${item}`}
                  aria-current={active ? "page" : undefined}
                  className={`
                    flex
                    h-9
                    min-w-9
                    items-center
                    justify-center
                    rounded-xl
                    px-2
                    text-xs
                    font-semibold
                    transition-all
                    duration-200
                    active:scale-95
                    focus:outline-none
                    focus-visible:ring-4
                    focus-visible:ring-primary-500/15

                    ${
                      active
                        ? `
                          bg-primary-500
                          text-white
                          shadow-sm
                          shadow-primary-500/20
                        `
                        : `
                          text-ink-600
                          hover:bg-ink-400/[0.06]
                          hover:text-ink-900
                        `
                    }
                  `}
                >
                  {item.toLocaleString("ar-EG")}
                </button>
              );
            })}
          </div>

          {/* Next */}
          <PaginationButton
            label="الصفحة التالية"
            disabled={isLastPage}
            onClick={() => goToPage(currentPage + 1)}
          >
            <ChevronLeft size={17} strokeWidth={1.8} />
          </PaginationButton>

          {/* Last page */}
          <PaginationButton
            label="الصفحة الأخيرة"
            disabled={isLastPage}
            onClick={() => goToPage(totalPages)}
          >
            <ChevronsLeft size={17} strokeWidth={1.8} />
          </PaginationButton>
        </div>
      </div>

      {/* Current page indicator */}
      {totalPages > 1 && (
        <div
          className="
            mt-3
            flex
            items-center
            justify-center
            border-t
            border-ink-400/10
            pt-3
            text-[11px]
            text-ink-400
            sm:hidden
          "
        >
          صفحة{" "}
          <strong className="mx-1 font-bold text-ink-700">
            {currentPage.toLocaleString("ar-EG")}
          </strong>{" "}
          من{" "}
          <strong className="mx-1 font-bold text-ink-700">
            {totalPages.toLocaleString("ar-EG")}
          </strong>
        </div>
      )}
    </nav>
  );
}

/**
 * Pagination navigation button
 */
function PaginationButton({ children, disabled, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-xl
        border
        border-ink-400/10
        bg-white
        text-ink-500

        transition-all
        duration-200

        hover:border-ink-400/20
        hover:bg-ink-400/[0.05]
        hover:text-ink-900

        active:scale-95

        focus:outline-none
        focus-visible:ring-4
        focus-visible:ring-primary-500/10

        disabled:pointer-events-none
        disabled:cursor-not-allowed
        disabled:opacity-30
      "
    >
      {children}
    </button>
  );
}
