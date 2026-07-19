import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * @param {{ isOpen: boolean, onClose: () => void, title: string, children: any, wide?: boolean }} props
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  wide = false,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-4 py-6 sm:py-4 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-ink-900/50 animate-fadeUp"
      />
      <div
        className={`relative w-full ${wide ? "max-w-3xl" : "max-w-md"} max-h-[85vh] overflow-y-auto custom-scroll bg-paper rounded-2xl shadow-card animate-stampIn my-auto`}
      >
        <div className="sticky top-0 bg-paper flex items-center justify-between px-5 py-4 border-b border-ink-400/10 z-10 rounded-t-2xl">
          <h3 className="font-display font-bold text-ink-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-900 p-1 rounded-lg hover:bg-ink-400/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
