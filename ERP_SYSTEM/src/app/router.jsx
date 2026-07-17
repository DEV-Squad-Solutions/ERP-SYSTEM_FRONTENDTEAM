import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import CompanySetupForm from "../features/auth/components/CompanySetupForm";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import DashboardLayout from "../shared/components/layout/DashboardLayout";
import DashboardHome from "../features/dashboard/pages/DashboardHome";
import InventoryPage from "../features/inventory/pages/InventoryPage";
import PurchasesPage from "../features/purchases/pages/PurchasesPage";
import SalesPage from "../features/sales/pages/SalesPage";

// صفحة placeholder مؤقتة لأي موديول لسه ما اتبناش
function ComingSoon({ title }) {
  return (
    <div className="text-center py-20 text-gray-400">
      <p className="text-lg">{title}</p>
      <p className="text-sm mt-1">هذه الصفحة قيد التطوير</p>
    </div>
  );
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register-company", element: <CompanySetupForm /> },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardHome /> },
      { path: "sales", element: <SalesPage /> },
      { path: "purchases", element: <PurchasesPage /> },
      { path: "customers", element: <ComingSoon title="العملاء" /> },
      { path: "suppliers", element: <ComingSoon title="الموردين" /> },
      { path: "treasury", element: <ComingSoon title="الخزينة" /> },
      { path: "bank", element: <ComingSoon title="البنك" /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "expenses", element: <ComingSoon title="المصاريف" /> },
      { path: "assets", element: <ComingSoon title="الأصول - إهلاك" /> },
      {
        path: "reconciliation",
        element: <ComingSoon title="مذكرة المراجعة" />,
      },
      { path: "journal-entries", element: <ComingSoon title="قيود اليومية" /> },
      {
        path: "adjusted-trial-balance",
        element: <ComingSoon title="ميزان بعد التسوية" />,
      },
      { path: "income", element: <ComingSoon title="تقارير الدخل" /> },
      {
        path: "financial-position",
        element: <ComingSoon title="تقارير المركز المالي" />,
      },
      { path: "reports", element: <ComingSoon title="التقارير" /> },
      { path: "permissions", element: <ComingSoon title="الصلاحيات" /> },
    ],
  },
]);
