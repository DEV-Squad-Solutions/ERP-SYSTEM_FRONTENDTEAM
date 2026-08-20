import { useEffect, useRef, useCallback } from "react";

/**
 * readDraft(key)
 * --------------
 * قراءة مزامنة (sync) لمسودة محفوظة في localStorage، بترجع null لو
 * مفيش حاجة أو لو حصل خطأ في القراءة/الـ parsing. استخدمها جوه
 * الـ initializer بتاع useState عشان تبدأ الفورم بالقيم المحفوظة:
 *
 *   const draft = readDraft("invoiceFormDraft");
 *   const [header, setHeader] = useState(() => ({
 *     ...defaults,
 *     ...draft?.header,
 *   }));
 */
export function readDraft(key) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

/**
 * useAutosaveDraft(key, getSnapshot, deps, options?)
 * ----------------------------------------------------
 * بيحفظ state الفورم في localStorage تلقائيًا (debounced) مع أي تغيير
 * حقيقي في القيم.
 *
 * ليه getSnapshot دالة مش object مباشرة؟ عشان الأداء: لو مررنا
 * `{ header, lines, ... }` مباشرة، هيتعمل object جديد كل render
 * والـ effect هيحتاج يقارن بالقيمة (JSON.stringify) مش بالمرجع، وده
 * تكلفة إضافية على كل ضغطة مفتاح حتى لو الفورم مش هيتحفظ فعليًا دلوقتي.
 * بتمرير deps بشكل منفصل، الـ effect بيشتغل بس لما القيم فعلاً تتغير
 * (زي أي useEffect عادي)، والـ JSON.stringify بيحصل مرة واحدة بس جوه
 * الـ debounce timeout وقت الحفظ الفعلي.
 *
 *   const clearDraft = useAutosaveDraft(
 *     "invoiceFormDraft",
 *     () => ({ header, lines, containersMovement, isTemporaryDriver }),
 *     [header, lines, containersMovement, isTemporaryDriver],
 *   );
 *
 *   // امسح المسودة وقت ما تحب (بعد حفظ ناجح، أو دوس إلغاء، أو زرار مسح):
 *   clearDraft();
 */
export function useAutosaveDraft(
  key,
  getSnapshot,
  deps,
  { debounceMs = 400 } = {},
) {
  // بنحتفظ بأحدث نسخة من getSnapshot في ref عشان الـ effect نفسه ميحتاجش
  // يتكرر لو الدالة اتعاد إنشاؤها (اللي بيحصل كل render عادي)، من غير ما
  // نفقد أحدث قيمة وقت التنفيذ الفعلي جوه الـ timeout.
  const getSnapshotRef = useRef(getSnapshot);
  getSnapshotRef.current = getSnapshot;

  const isFirstRun = useRef(true);

  useEffect(() => {
    // من غير الشرط ده، أول render هيكتب فوق المسودة اللي هنقراها في
    // readDraft قبل ما تتحمل فعليًا في state الكومبوننت.
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(getSnapshotRef.current()));
      } catch {
        // تجاهل أخطاء التخزين (كوتا ممتلئة، وضع خاص في المتصفح...)
        // من غير ما نعطل الفورم
      }
    }, debounceMs);

    return () => clearTimeout(timer);
    // deps بتوصل من بره، فالـ effect بيتفعل بس لما إحدى القيم الفعلية
    // تتغير - مش كل render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {}
  }, [key]);
}
