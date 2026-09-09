import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   title: string,
 *   children: any,
 *   wide?: boolean
 * }} props
 */

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  wide = false,
}) {
  /* =========================================================
     BODY SCROLL LOCK
  ========================================================= */

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  /* =========================================================
     ESCAPE KEY
  ========================================================= */

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={[
        "fixed inset-0 z-[100]",
        "flex items-start justify-center",
        "overflow-y-auto",
        "px-3 py-5",
        "sm:items-center",
        "sm:px-4 sm:py-6",
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* =====================================================
          BACKDROP
      ===================================================== */}

      <div
        aria-hidden="true"
        onClick={onClose}
        className={[
          "fixed inset-0",
          "bg-ink-950/55",
          "backdrop-blur-[3px]",
          "animate-[modalBackdropIn_0.2s_ease-out]",
          "dark:bg-black/65",
        ].join(" ")}
      />

      {/* =====================================================
          MODAL
      ===================================================== */}

      <div
        className={[
          "relative z-10",
          "my-auto",
          "flex w-full flex-col",
          wide ? "max-w-3xl" : "max-w-md",
          "max-h-[88vh]",
          "overflow-hidden",
          "rounded-2xl",
          "border",
          "border-ink-200/80",
          "bg-paper",
          "shadow-[0_24px_70px_rgba(15,23,42,0.20)]",
          "animate-[modalIn_0.25s_cubic-bezier(0.22,1,0.36,1)]",
          "dark:border-white/[0.08]",
          "dark:bg-ink-900",
          "dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]",
        ].join(" ")}
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          className={[
            "relative z-10",
            "flex shrink-0 items-center",
            "justify-between",
            "border-b",
            "border-ink-200/70",
            "bg-paper/95",
            "px-4 py-3.5",
            "backdrop-blur-xl",
            "dark:border-white/[0.08]",
            "dark:bg-ink-900/95",
          ].join(" ")}
        >
          {/* Accent line */}

          <span
            aria-hidden="true"
            className={[
              "absolute right-0 top-0",
              "h-px w-24",
              "bg-gradient-to-l",
              "from-primary-500/60",
              "to-transparent",
              "dark:from-primary-400/50",
            ].join(" ")}
          />

          {/* TITLE */}

          <div className="min-w-0 flex-1 pr-1">
            <h3
              id="modal-title"
              className={[
                "truncate",
                "font-display",
                "text-sm",
                "font-bold",
                "tracking-tight",
                "text-ink-900",
                "dark:text-white",
              ].join(" ")}
            >
              {title}
            </h3>
          </div>

          {/* CLOSE */}

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className={[
              "group flex h-8 w-8 shrink-0",
              "items-center justify-center",
              "rounded-lg",
              "border",
              "border-transparent",
              "text-ink-500",
              "transition-all duration-200",
              "hover:border-ink-200",
              "hover:bg-ink-100",
              "hover:text-ink-900",
              "active:scale-90",
              "dark:text-ink-300",
              "dark:hover:border-white/[0.08]",
              "dark:hover:bg-white/[0.06]",
              "dark:hover:text-white",
              "focus:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-primary-500/30",
            ].join(" ")}
          >
            <X
              size={17}
              strokeWidth={2}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
          </button>
        </div>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div
          className={[
            "min-h-0",
            "flex-1",
            "overflow-y-auto",
            "overflow-x-hidden",
            "custom-scroll",
            "overscroll-contain",
            "p-4",
            "sm:p-5",
            "text-ink-800",
            "dark:text-ink-100",
          ].join(" ")}
        >
          {children}
        </div>
      </div>

      {/* =====================================================
          ANIMATIONS
      ===================================================== */}

      <style>
        {`
          @keyframes modalBackdropIn {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
          }

          @keyframes modalIn {
            from {
              opacity: 0;
              transform: translateY(10px) scale(0.985);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            [class*="modalBackdropIn"],
            [class*="modalIn"] {
              animation: none !important;
            }
          }
        `}
      </style>
    </div>,
    document.body,
  );
}
