import { useEffect } from "react";
import { CalendarDays } from "lucide-react";

/**
 * تاريخ اليوم بتوقيت القاهرة بصيغة YYYY-MM-DD
 */
const getCairoDate = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

/**
 * تحويل YYYY-MM-DD إلى DD/MM/YYYY للعرض
 */
const formatDateForDisplay = (value) => {
  if (!value) return "";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) return "";

  return `${day}/${month}/${year}`;
};

/**
 * تحويل DD/MM/YYYY إلى YYYY-MM-DD
 */
const formatDateForValue = (value) => {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) return "";

  const [, day, month, year] = match;

  return `${year}-${month}-${day}`;
};

/**
 * صف حقل بشكل "خانة الدفتر"
 */
export default function LedgerField({
  label,
  error,
  className = "",
  type = "text",
  value,
  onChange,
  ...inputProps
}) {
  const isNumber = type === "number";
  const isDate = type === "date";

  /**
   * لو حقل تاريخ والقيمة فاضية،
   * يتم وضع تاريخ اليوم بتوقيت القاهرة تلقائيًا.
   */
  useEffect(() => {
    if (!isDate || value) return;

    const today = getCairoDate();

    onChange?.({
      target: {
        name: inputProps.name,
        value: today,
      },
    });
  }, [isDate, value]);

  const handleChange = (e) => {
    // =========================
    // DATE
    // =========================
    if (isDate) {
      onChange?.(e);
      return;
    }

    // =========================
    // NUMBER
    // =========================
    if (isNumber) {
      const val = e.target.value;

      // يسمح بالفراغ
      if (val === "") {
        onChange?.({
          ...e,
          target: {
            ...e.target,
            value: "",
          },
        });

        return;
      }

      // يسمح بالأرقام الصحيحة والعشرية
      if (!/^\d*\.?\d*$/.test(val)) return;

      onChange?.({
        ...e,
        target: {
          ...e.target,
          value: val,
        },
      });

      return;
    }

    // =========================
    // OTHER TYPES
    // =========================
    onChange?.(e);
  };

  /**
   * إدخال التاريخ يدويًا
   */
  const handleDateTextChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");

    // أقصى شيء DDMMYYYY
    if (val.length > 8) {
      val = val.slice(0, 8);
    }

    let formatted = val;

    if (val.length > 4) {
      formatted =
        `${val.slice(0, 2)}/` + `${val.slice(2, 4)}/` + `${val.slice(4)}`;
    } else if (val.length > 2) {
      formatted = `${val.slice(0, 2)}/` + `${val.slice(2)}`;
    }

    // لسه المستخدم بيكتب
    if (val.length < 8) {
      return;
    }

    const normalized = formatDateForValue(formatted);

    if (!normalized) return;

    onChange?.({
      ...e,
      target: {
        ...e.target,
        value: normalized,
      },
    });
  };

  /**
   * تغيير التاريخ من الـ native picker
   */
  const handleDatePickerChange = (e) => {
    onChange?.(e);
  };

  /**
   * فتح الـ native date picker
   */
  const openDatePicker = (e) => {
    const dateInput =
      e.currentTarget.parentElement?.querySelector('input[type="date"]');

    if (!dateInput) return;

    if (typeof dateInput.showPicker === "function") {
      dateInput.showPicker();
    } else {
      dateInput.focus();
      dateInput.click();
    }
  };

  return (
    <div>
      <div className="flex items-stretch rounded-lg overflow-hidden border border-ink-400/10">
        {/* Label */}
        <div
          className="
            w-36
            shrink-0
            bg-ink-900/[0.03]
            px-3
            py-2.5
            text-sm
            font-medium
            text-ink-900
            flex
            items-center
            border-l
            border-ink-400/10
          "
        >
          {label}
        </div>

        {/* DATE FIELD */}
        {isDate ? (
          <div className="relative flex-1 min-w-0">
            {/* Display / Manual Input */}
            <input
              type="text"
              value={formatDateForDisplay(value)}
              onChange={handleDateTextChange}
              placeholder="يوم/شهر/سنة"
              inputMode="numeric"
              maxLength={10}
              className={`
                w-full
                px-3
                py-2.5
                pr-10
                text-sm
                bg-white
                num
                outline-none
                transition
                focus:bg-primary-50/30
                focus:ring-2
                focus:ring-primary-500/10
                ${className}
              `}
              {...inputProps}
            />

            {/* Calendar Button */}
            <button
              type="button"
              onClick={openDatePicker}
              className="
                absolute
                right-0
                top-0
                h-full
                w-10
                flex
                items-center
                justify-center
                text-ink-500
                hover:text-primary-600
                hover:bg-primary-50
                transition
              "
              aria-label="اختيار التاريخ"
            >
              <CalendarDays className="w-4 h-4" />
            </button>

            {/* Native Date Picker */}
            <input
              type="date"
              value={value || getCairoDate()}
              onChange={handleDatePickerChange}
              className="
                absolute
                opacity-0
                pointer-events-none
                w-0
                h-0
              "
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
        ) : (
          /* NORMAL FIELD */
          <input
            type={isNumber ? "text" : type}
            inputMode={isNumber ? "decimal" : undefined}
            value={value ?? ""}
            onChange={handleChange}
            className={`
              flex-1
              min-w-0
              px-3
              py-2.5
              text-sm
              bg-white
              num
              outline-none
              transition
              focus:bg-primary-50/30
              focus:ring-2
              focus:ring-primary-500/10
              ${className}
            `}
            {...inputProps}
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="px-3 py-1 text-xs text-negative bg-negative/5">{error}</p>
      )}
    </div>
  );
}
