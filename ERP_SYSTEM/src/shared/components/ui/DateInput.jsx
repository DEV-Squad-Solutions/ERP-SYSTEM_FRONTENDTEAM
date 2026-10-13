import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { formatDate, parseDisplayDate } from "../../../lib/date";
/**
 * خانة إدخال تاريخ موحّدة على مستوى النظام.
 *
 * - بتعرض القيمة دايمًا **يوم/شهر/سنة** بأرقام إنجليزية (13/10/2026).
 * - الكتابة اليدوية تتنسّق تلقائيًا (الشُرَط لوحدها).
 * - زر الكالندر بيفتح منتقي التاريخ الأصلي للمتصفح (بدون تغيير في شكل الخانة).
 *
 * القيمة (`value`) والـ onChange بيفضلوا بصيغة ISO (YYYY-MM-DD) زي
 * أي input="date" عادي — فمفيش تغيير مطلوب في صفحات الاستخدام.
 *
 * كمان متوافقة مع react-hook-form (`{...register("x")}`): الـ ref بيتمسك
 * على خانة التاريخ الأصلية المخفية (اللي شايلة القيمة ISO)، والعرض
 * المرئي بيفضل يوم/شهر/سنة حتى لو RHF كتبت القيمة مباشرة في الـ DOM.
 */
const ISO_RE = /^\d{4}-\d{2}-\d{2}/;

export default function DateInput({
  value,
  onChange,
  name,
  id,
  className = "",
  placeholder = "يوم/شهر/سنة",
  disabled = false,
  required = false,
  readOnly = false,
  min,
  max,
  autoFocus = false,
  onFocus,
  onBlur,
  onClick,
  dark = false,
  // ref من react-hook-form (React 19 بتمرّره كـ prop عادي)
  ref,
  // بنتجاهل type لأننا بنعرضه كخانة نصية دائمًا
  type: _type,
  ...rest
}) {
  const isControlled = value !== undefined;
  const [text, setText] = useState(() => formatDate(value));
  const [focused, setFocused] = useState(false);
  const nativeRef = useRef(null);

  // مزامنة النص مع القيمة الجاية من الـ parent (طول ما المستخدم مش بيكتب)
  useEffect(() => {
    if (isControlled && !focused) setText(formatDate(value));
  }, [value, focused, isControlled]);

  // دمج الـ ref بتاعنا مع الـ ref الجاي من react-hook-form على الخانة الأصلية
  const setNativeRef = (node) => {
    nativeRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  // التقاط الكتابة المباشرة على الـ DOM (defaultValues / reset / setValue)
  // وتحويلها لعرض يوم/شهر/سنة.
  useLayoutEffect(() => {
    const node = nativeRef.current;
    if (!node || isControlled) return;

    // القيمة اللي RHF كتبها قبل ما الـ effect يشتغل
    setText(formatDate(node.value));

    const ownDesc = Object.getOwnPropertyDescriptor(node, "value");
    const protoDesc = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(node),
      "value",
    );
    const desc = ownDesc || protoDesc;
    if (!desc) return;

    Object.defineProperty(node, "value", {
      configurable: true,
      get() {
        return desc.get.call(this);
      },
      set(next) {
        // الخانة الأصلية تفضل محتفظة بالقيمة ISO (لأنها input=date حقيقي)
        desc.set.call(this, next);
        // العرض المرئي بس هو اللي بيتحوّل ليوم/شهر/سنة
        setText(ISO_RE.test(String(next)) ? formatDate(next) : String(next));
      },
    });

    return () => {
      try {
        delete node.value;
      } catch {
        // نتجاهل
      }
    };
  }, [isControlled]);

  const emit = (iso) => {
    onChange?.({ target: { name, id, value: iso } });
  };

  const handleTextChange = (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 8);

    let formatted = digits;
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(
        4,
      )}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    setText(formatted);

    if (digits.length === 8) {
      const iso = parseDisplayDate(formatted);
      if (iso) {
        emit(iso);
        if (nativeRef.current) nativeRef.current.value = iso;
      }
    } else if (digits.length === 0) {
      emit("");
      if (nativeRef.current) nativeRef.current.value = "";
    }
  };

  const handleNativeChange = (event) => {
    const iso = event.target.value;
    setText(formatDate(iso));
    emit(iso);
  };

  const handleFocus = (event) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event) => {
    setFocused(false);
    // رجّع العرض للقيمة الفعلية المحفوظة (لو المستخدم ساب النص ناقص)
    if (isControlled) setText(formatDate(value));
    else if (nativeRef.current) setText(formatDate(nativeRef.current.value));
    onBlur?.(event);
  };

  const openPicker = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    const input = nativeRef.current;
    if (!input || disabled || readOnly) return;

    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        // بعض المتصفحات بترفض showPicker خارج تفاعل مباشر — نكمّل بالطريقة البديلة
      }
    }

    input.focus();
    input.click();
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        id={id}
        value={text}
        onChange={handleTextChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={onClick}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        autoFocus={autoFocus}
        className={`${className} pe-9 num`}
        {...rest}
      />

      {/* زر فتح الكالندر */}
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled || readOnly}
        onClick={openPicker}
        aria-label="اختيار التاريخ"
        className={`
          absolute
          inset-y-0
          end-0
          flex
          w-9
          items-center
          justify-center
          opacity-60
          transition
          hover:opacity-100
          disabled:cursor-not-allowed
          ${dark ? "text-white" : "text-ink-500"}
        `}
      >
        <CalendarDays className="h-4 w-4" />
      </button>

      {/* منتقي التاريخ الأصلي (مخفي) — هو العنصر المسجّل مع react-hook-form */}
      <input
        ref={setNativeRef}
        type="date"
        name={name}
        min={min}
        max={max}
        disabled={disabled}
        readOnly={readOnly}
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleNativeChange}
        {...(isControlled ? { value: value || "" } : {})}
        className="
          absolute
          inset-y-0
          end-0
          h-full
          w-9
          opacity-0
          pointer-events-none
        "
      />
    </div>
  );
}
