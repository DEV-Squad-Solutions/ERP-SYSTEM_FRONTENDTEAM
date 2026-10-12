/**
 * تقريب رقم لخانتين عشريتين بحد أقصى (بيشيل الأصفار الزائدة).
 *
 * بنستخدمها لأسعار الصرف / أسعار التحويل عشان القيمة اللي بتتعبّى
 * تلقائيًا من أسعار الصرف متطلعش بكسر طويل (زي 0.0206185567).
 */
export function round2(value) {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return value;
  }

  return Number(n.toFixed(2));
}
