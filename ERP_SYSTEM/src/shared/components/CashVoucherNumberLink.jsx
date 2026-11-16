import { Link } from "react-router-dom";

import { useCashboxScope } from "../../features/cashboxes/hooks/useCashboxScope";

// اتجاه السند بييجي من الـAPI كنص ("Receipt"/"Payment") أو رقم (1/2)
// حسب إعدادات السيريالايزر.
function normalizeDirection(direction) {
  const value = String(direction ?? "").trim().toLowerCase();

  if (value === "receipt" || value === "1") {
    return "Receipt";
  }

  if (value === "payment" || value === "2") {
    return "Payment";
  }

  return null;
}

function directionLabel(direction) {
  if (direction === "Receipt") {
    return "إلى خزنة";
  }

  if (direction === "Payment") {
    return "من خزنة";
  }

  return null;
}

/**
 * رقم سند خزنة كـ لينك لكشف الخزنة مع إبراز السند نفسه.
 *
 * اللينك بيشتغل فقط لما السيرفر يرجّع كل حقول الربط ويكون عند المستخدم
 * صلاحية عرض الخزنة (View). غير كذا بنعرض رقم المستند كنص عادي — بدون
 * اسم خزنة أو لينك — مع الحفاظ على باقي بيانات الصف.
 *
 * @param {object} props
 * @param {number|string} [props.cashVoucherId]
 * @param {number|string} [props.cashboxId]
 * @param {string} [props.cashboxName]
 * @param {string} [props.cashDirection]
 * @param {number|string} [props.fiscalYearId]
 * @param {string} [props.documentNumber]
 * @param {string} [props.className]
 */
export default function CashVoucherNumberLink({
  cashVoucherId,
  cashboxId,
  cashboxName,
  cashDirection,
  fiscalYearId,
  documentNumber,
  className = "",
}) {
  const { canView } = useCashboxScope();

  const number = documentNumber || "—";

  const direction = normalizeDirection(cashDirection);
  const label = directionLabel(direction);

  const isComplete = Boolean(
    cashVoucherId &&
      cashboxId &&
      cashboxName &&
      direction &&
      fiscalYearId,
  );

  const canOpen = isComplete && canView(cashboxId);

  if (!canOpen) {
    return <span className={className}>{number}</span>;
  }

  const href = `/dashboard/treasury/${cashboxId}?voucherId=${encodeURIComponent(
    cashVoucherId,
  )}&fiscalYearId=${encodeURIComponent(fiscalYearId)}`;

  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <Link
        to={href}
        title={`عرض السند ${number} في كشف الخزنة`}
        className={`num font-medium text-primary-600 underline-offset-2 transition-colors hover:text-primary-700 hover:underline ${className}`}
      >
        {number}
      </Link>

      <span className="text-[11px] text-ink-400">
        {label} {cashboxName}
      </span>
    </span>
  );
}
