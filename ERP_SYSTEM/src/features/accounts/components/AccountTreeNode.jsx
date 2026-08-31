import { memo, useCallback, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  Plus,
  Pencil,
  Trash2,
  Circle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const TYPE_STYLES = {
  Asset: {
    dot: "bg-emerald-500",
    badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
  },
  Liability: {
    dot: "bg-rose-500",
    badge: "border-rose-100 bg-rose-50 text-rose-700",
  },
  Equity: {
    dot: "bg-violet-500",
    badge: "border-violet-100 bg-violet-50 text-violet-700",
  },
  Revenue: {
    dot: "bg-sky-500",
    badge: "border-sky-100 bg-sky-50 text-sky-700",
  },
  Expense: {
    dot: "bg-orange-500",
    badge: "border-orange-100 bg-orange-50 text-orange-700",
  },
};

const TYPE_LABELS = {
  Asset: "أصول",
  Liability: "التزامات",
  Equity: "حقوق ملكية",
  Revenue: "إيرادات",
  Expense: "مصروفات",
};

const INDENT_WIDTH = 28;

const AccountTreeNode = memo(function AccountTreeNode({
  node,
  depth = 0,
  isLast = true,
  linePrefix = [],
  onAddChild,
  onEdit,
  onDelete,
}) {
  const [expanded, setExpanded] = useState(depth === 0);

  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  const typeStyle = TYPE_STYLES[node.accountType] || {
    dot: "bg-gray-400",
    badge: "border-gray-100 bg-gray-50 text-gray-600",
  };

  const typeLabel =
    TYPE_LABELS[node.accountType] || node.accountType || "غير محدد";

  const toggleExpanded = useCallback(() => {
    if (!hasChildren) return;
    setExpanded((value) => !value);
  }, [hasChildren]);

  const handleAddChild = useCallback(() => {
    onAddChild?.(node);
  }, [node, onAddChild]);

  const handleEdit = useCallback(() => {
    onEdit?.(node);
  }, [node, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete?.(node);
  }, [node, onDelete]);

  return (
    <div className="relative">
      <div className="relative flex min-h-[46px] items-center">
        {linePrefix.map((showLine, index) => (
          <div
            key={index}
            className="relative h-[46px] shrink-0"
            style={{ width: INDENT_WIDTH }}
          >
            {showLine && (
              <span className="absolute bottom-0 right-1/2 top-0 border-r border-slate-200" />
            )}
          </div>
        ))}

        {depth > 0 && (
          <div
            className="relative h-[46px] shrink-0"
            style={{ width: INDENT_WIDTH }}
          >
            <span className="absolute right-1/2 top-0 h-1/2 border-r border-slate-200" />

            <span className="absolute right-1/2 top-1/2 w-1/2 border-t border-slate-200" />

            {!isLast && (
              <span className="absolute bottom-0 right-1/2 top-1/2 border-r border-slate-200" />
            )}
          </div>
        )}

        <motion.div
          layout={false}
          initial={depth > 0 ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.14 }}
          className={`group relative flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-2 py-1.5 transition-colors duration-150 ${
            depth === 0
              ? "border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              : "border-transparent hover:border-slate-200 hover:bg-white hover:shadow-[0_1px_3px_rgba(15,23,42,0.05)]"
          }`}
        >
          <button
            type="button"
            onClick={toggleExpanded}
            disabled={!hasChildren}
            aria-label={
              hasChildren ? (expanded ? "طي الحساب" : "فتح الحساب") : undefined
            }
            className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
              hasChildren
                ? "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                : "pointer-events-none opacity-0"
            }`}
          >
            <motion.span
              animate={{ rotate: expanded ? 0 : 90 }}
              transition={{
                duration: 0.18,
                ease: "easeOut",
              }}
              className="flex"
            >
              <ChevronDown size={15} strokeWidth={2.2} />
            </motion.span>
          </button>

          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
            <span
              className={`absolute h-2.5 w-2.5 rounded-full ${typeStyle.dot}`}
            />

            <span
              className={`absolute h-5 w-5 rounded-full border ${
                hasChildren ? "border-slate-200" : "border-slate-100"
              }`}
            />

            {!hasChildren && (
              <Circle
                size={5}
                fill="currentColor"
                className="relative text-slate-400"
              />
            )}
          </div>

          <div className="w-[72px] shrink-0">
            <span className="font-mono text-[11px] font-medium tracking-wide text-slate-400">
              {node.code}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleExpanded}
            disabled={!hasChildren}
            className="min-w-0 flex-1 text-right"
          >
            <div
              className={`truncate text-sm leading-5 ${
                hasChildren
                  ? "font-semibold text-slate-900"
                  : "font-medium text-slate-700"
              }`}
            >
              {node.name}
            </div>

            {hasChildren && (
              <div className="text-[10px] leading-4 text-slate-400">
                {node.children.length} حساب فرعي
              </div>
            )}
          </button>

          <span
            className={`hidden shrink-0 rounded-full border px-2 py-1 text-[10px] font-medium sm:inline-flex ${typeStyle.badge}`}
          >
            {typeLabel}
          </span>

          {node.isPosting && (
            <span className="hidden shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500 md:inline-flex">
              قابل للتسجيل
            </span>
          )}

          {!node.isActive && (
            <span className="hidden shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500 lg:inline-flex">
              غير فعال
            </span>
          )}

          <div className="mr-1 flex shrink-0 items-center gap-0.5 opacity-0 transition-all duration-150 group-hover:opacity-100">
            {!node.isPosting && (
              <motion.button
                type="button"
                title="إضافة حساب فرعي"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleAddChild}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
              >
                <Plus size={14} />
              </motion.button>
            )}

            <motion.button
              type="button"
              title="تعديل"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleEdit}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <Pencil size={13} />
            </motion.button>

            <motion.button
              type="button"
              title="حذف"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleDelete}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={13} />
            </motion.button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="relative overflow-hidden"
          >
            {node.children.map((child, index) => (
              <AccountTreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                isLast={index === node.children.length - 1}
                linePrefix={[...linePrefix, depth > 0 ? !isLast : false]}
                onAddChild={onAddChild}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default AccountTreeNode;
