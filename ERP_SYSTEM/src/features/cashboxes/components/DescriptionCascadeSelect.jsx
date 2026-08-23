import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ChevronLeft, Loader2, Search } from "lucide-react";

/**
 * Select متداخل (Nested / Accordion) لتوصيف حركة الخزنة.
 *
 * بياخد groups من buildDescriptionGroups (utils/descriptionGroups.js)
 * وبيعرضها كقائمة فئات مقفولة أول ما تفتح. الضغط على فئة بيفردها
 * ويورّي العناصر اللي تحتها (accordion — فئة واحدة مفتوحة في نفس
 * الوقت)، من غير ما يعرض كل حاجة flat من الأول.
 *
 * عند الاختيار بيرجّع الـ value بتاع الـ option المختار عبر
 * onChange(value)؛ المستهلك (caller) بيستخرج meta من الـ groups زي
 * ما هو مستخدم بالظبط في CashVoucherEditModal و CashboxLedgerTable:
 *
 *   groups.flatMap(g => g.options).find(o => o.value === value)
 */
export default function DescriptionCascadeSelect({
  groups = [],
  value,
  onChange,
  isLoading = false,
  isDisabled = false,
  placeholder = "اختر الحساب أو التوصيف",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedKey, setExpandedKey] = useState(null);
  const containerRef = useRef(null);

  const selectedOption = useMemo(() => {
    return groups.flatMap((g) => g.options).find((o) => o.value === value);
  }, [groups, value]);

  const selectedGroup = useMemo(() => {
    return groups.find((g) =>
      g.options.some((option) => option.value === value),
    );
  }, [groups, value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearch("");
        setExpandedKey(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // فتح القائمة يبدأ بفئة السند المختار مفرودة (لو موجود)
  function toggleOpen() {
    if (isDisabled || isLoading) return;

    setIsOpen((current) => {
      const next = !current;
      setExpandedKey(next ? (selectedGroup?.key ?? null) : null);
      setSearch("");
      return next;
    });
  }

  const term = search.trim().toLowerCase();

  // في وضع البحث بنفرد كل الفئات اللي فيها نتيجة مطابقة تلقائيًا
  const visibleGroups = useMemo(() => {
    if (!term) return groups;

    return groups
      .map((group) => ({
        ...group,
        options: group.options.filter((option) =>
          option.label?.toLowerCase().includes(term),
        ),
      }))
      .filter((group) => group.options.length > 0);
  }, [groups, term]);

  function handleSelect(option) {
    onChange?.(option.value);
    setIsOpen(false);
    setSearch("");
    setExpandedKey(null);
  }

  function toggleGroup(groupKey) {
    setExpandedKey((current) => (current === groupKey ? null : groupKey));
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        disabled={isDisabled || isLoading}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-right text-[11px] transition ${
          isDisabled
            ? "cursor-not-allowed border-ink-400/10 bg-ink-900/[0.02] text-ink-300"
            : "border-ink-400/15 bg-white text-ink-900 hover:border-primary-300"
        }`}
      >
        <span className="min-w-0 truncate">
          {selectedOption ? (
            <>
              <span className="text-ink-300">{selectedGroup?.label}</span>
              <span className="mx-1 text-ink-300">›</span>
              {selectedOption.label}
            </>
          ) : (
            placeholder
          )}
        </span>

        {isLoading ? (
          <Loader2 size={12} className="shrink-0 animate-spin text-ink-300" />
        ) : (
          <ChevronDown size={12} className="shrink-0 text-ink-300" />
        )}
      </button>

      {isOpen && !isDisabled && (
        <div className="absolute z-50 mt-1 max-h-80 w-full min-w-[240px] overflow-hidden rounded-xl border border-ink-400/10 bg-white shadow-2xl">
          <div className="border-b border-ink-400/10 p-1.5">
            <div className="flex items-center gap-1.5 rounded-lg bg-ink-900/[0.03] px-2 py-1.5">
              <Search size={12} className="shrink-0 text-ink-300" />

              <input
                autoFocus
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="بحث..."
                className="w-full bg-transparent text-[11px] outline-none placeholder:text-ink-300"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {visibleGroups.length === 0 && (
              <p className="px-3 py-4 text-center text-[11px] text-ink-300">
                لا توجد نتائج
              </p>
            )}

            {visibleGroups.map((group) => {
              // في وضع البحث كل فئة ظاهرة تبقى مفرودة تلقائيًا
              const isExpanded = term ? true : expandedKey === group.key;

              return (
                <div
                  key={group.key}
                  className="border-b border-ink-400/5 last:border-0"
                >
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key)}
                    className="flex w-full items-center justify-between gap-2 px-2.5 py-2 text-right text-[11px] font-semibold text-ink-700 transition hover:bg-ink-900/[0.03]"
                  >
                    <span className="flex items-center gap-1.5">
                      {group.label}
                      <span className="text-[9px] font-normal text-ink-300">
                        ({group.options.length})
                      </span>
                    </span>

                    <ChevronLeft
                      size={12}
                      className={`shrink-0 text-ink-300 transition-transform ${
                        isExpanded ? "-rotate-90" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="pb-1">
                      {group.options.map((option) => {
                        const isSelected = option.value === value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option)}
                            className={`flex w-full items-center justify-between gap-2 py-1.5 pl-2.5 pr-6 text-right text-[11px] transition hover:bg-primary-50 ${
                              isSelected
                                ? "bg-primary-50 text-primary-600"
                                : "text-ink-900"
                            }`}
                          >
                            <span className="truncate">{option.label}</span>

                            {isSelected && (
                              <Check size={12} className="shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
