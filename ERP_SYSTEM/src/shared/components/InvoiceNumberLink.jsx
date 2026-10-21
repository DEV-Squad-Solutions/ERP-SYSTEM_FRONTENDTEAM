import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { selectRoles } from "../../features/auth/authSlice";

// الأدوار اللي مسموح لها تفتح صفحة الفاتورة (نفس INVOICE_ROLES في router.jsx).
// لو المستخدم مش من الأدوار دي بنسيب الرقم نص عادي من غير لينك.
const INVOICE_ROLES = ["admin", "accountant", "user", "cashier"];

// أنواع الفواتير اللي بترجع من الـAPI (رقم أو نص) وبتحدد راوت العرض.
// البيع والمرتجع البيعي بيتفتحوا على /dashboard/sales،
// والشراء والمرتجع الشرائي على /dashboard/purchases.
function isPurchaseType(invoiceType) {
  if (invoiceType === undefined || invoiceType === null) {
    return false;
  }

  const value = String(invoiceType).trim().toLowerCase();

  return (
    value === "2" ||
    value === "4" ||
    value === "purchase" ||
    value === "purchasereturn" ||
    value === "purchase_return"
  );
}

/**
 * رقم الفاتورة كـ لينك لصفحة تفاصيل الفاتورة.
 *
 * بيوجّه لراوت البيع أو الشراء حسب نوع الفاتورة، ولو المستخدم مش عنده
 * صلاحية عرض الفواتير بيرجع الرقم كنص عادي (من غير لينك).
 *
 * @param {object} props
 * @param {number|string} props.invoiceId معرّف الفاتورة (لازم عشان يبقى فيه لينك).
 * @param {number|string} [props.invoiceType] نوع الفاتورة (1 بيع / 2 شراء / 3 مرتجع بيع / 4 مرتجع شراء).
 * @param {string} [props.number] الرقم المعروض (افتراضيًا invoiceNumber).
 * @param {string} [props.invoiceNumber] الرقم المعروض.
 * @param {string} [props.className] كلاسات إضافية للينك.
 * @param {string} [props.title] tooltip مخصص.
 */
export default function InvoiceNumberLink({
  invoiceId,
  invoiceType,
  number,
  invoiceNumber,
  className = "",
  title,
}) {
  const navigate = useNavigate();
  const roles = useSelector(selectRoles);

  const label = number ?? invoiceNumber;

  const canOpen = roles.some((role) =>
    INVOICE_ROLES.includes(String(role).trim().toLowerCase()),
  );

  if (!invoiceId || !canOpen) {
    return <span className={className}>{label ?? "—"}</span>;
  }

  const basePath = isPurchaseType(invoiceType)
    ? "/dashboard/purchases"
    : "/dashboard/sales";

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        navigate(`${basePath}/${invoiceId}`);
      }}
      title={title ?? "عرض تفاصيل الفاتورة"}
      className={`cursor-pointer text-primary-600 transition-colors hover:text-primary-700 hover:underline underline-offset-2 ${className}`}
    >
      {label ?? "—"}
    </button>
  );
}
