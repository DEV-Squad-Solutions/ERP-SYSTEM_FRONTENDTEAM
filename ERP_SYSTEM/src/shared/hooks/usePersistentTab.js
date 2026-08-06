import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Hook عام لإدارة أي نظام Tabs بالاعتماد الكامل على الـ URL (?tab=xxx)
 * بدل useState. قابل لإعادة الاستخدام في أي صفحة تفاصيل في النظام
 * (مخازن، عملاء، موردين، فواتير، شركات...) بنفس السلوك.
 *
 * السلوك:
 * - لو مفيش `tab` في الـ URL، أو قيمته مش موجودة في `availableTabs`،
 *   بيرجع `defaultTab` تلقائيًا (وبيظبط الـ URL عليه بدون ما يزوّد الـ history).
 * - أي Query Params تانية في الرابط بتفضل زي ما هي عند تغيير التاب.
 * - تغيير التاب بيحصل بـ `replace` افتراضيًا (مفيش history entry جديد لكل
 *   ضغطة تاب)، عشان زرار Back في المتصفح يرجع للصفحة اللي قبل الصفحة دي
 *   مباشرة (زي ما هو موضح في المثال: مخزن -> تفاصيل صنف -> Back -> نفس
 *   المخزن بنفس التاب اللي كان مفتوح)، مش يمشي خطوة خطوة بين التابات.
 *
 * @param {string} defaultTab - التاب الافتراضي.
 * @param {string[]} availableTabs - قائمة قيم التابات المسموح بيها (مفاتيح نصية بس).
 * @param {{ paramName?: string, replace?: boolean }} [options]
 * @returns {[string, (tab: string) => void]} [activeTab, setActiveTab]
 *
 * @example
 * const TABS = [
 *   { key: "overview", label: "نظرة عامة" },
 *   { key: "inventory", label: "الأصناف" },
 * ];
 * const [activeTab, setActiveTab] = usePersistentTab(
 *   "overview",
 *   TABS.map((t) => t.key)
 * );
 */
export function usePersistentTab(defaultTab, availableTabs, options = {}) {
  const { paramName = "tab", replace = true } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTab = searchParams.get(paramName);
  const activeTab =
    rawTab && availableTabs.includes(rawTab) ? rawTab : defaultTab;

  // لو الـ URL مفهوش tab أصلًا أو فيه قيمة مش صحيحة، نظبطه على القيمة
  // الافتراضية عشان الرابط دايمًا يعكس التاب الحالي فعليًا (متطلب الاستمرارية).
  useEffect(() => {
    if (rawTab !== activeTab) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(paramName, activeTab);
          return next;
        },
        { replace: true },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawTab, activeTab, paramName]);

  const setActiveTab = useCallback(
    (tab) => {
      if (!availableTabs.includes(tab)) return;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(paramName, tab);
          return next;
        },
        { replace },
      );
    },
    // availableTabs مقصود مش داخل الـ deps عشان معظم الاستخدامات بتبعت
    // array جديد كل render؛ التحقق بيتم وقت النداء نفسه مش وقت الـ render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setSearchParams, paramName, replace],
  );

  return [activeTab, setActiveTab];
}
