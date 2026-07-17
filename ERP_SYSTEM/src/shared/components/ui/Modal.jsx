import { X } from "lucide-react";

/**
 * @param {{ isOpen: boolean, onClose: () => void, title: string, children: any }} props
 */
export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/50 animate-fadeUp"
      />
      <div className="relative w-full max-w-md bg-paper rounded-2xl shadow-card animate-stampIn">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-400/10">
          <h3 className="font-display font-bold text-ink-900 p-5">{title}</h3>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-900 p-1 rounded-lg hover:bg-ink-400/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
