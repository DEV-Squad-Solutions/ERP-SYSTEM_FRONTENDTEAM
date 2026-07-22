import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import DashboardLayout from "../shared/components/layout/DashboardLayout";
import DashboardHome from "../features/dashboard/pages/DashboardHome";
import InventoryPage from "../features/inventory/pages/InventoryPage";
import PurchasesPage from "../features/purchases/pages/PurchasesPage";
import SalesPage from "../features/sales/pages/SalesPage";
import Error404 from "../shared/components/Error404";
import PartnersPage from "../features/partners/PartnersPage";
import InvoiceCreatePage from "../features/sales/pages/InvoiceCreatePage";
import InvoiceDetailsPage from "../features/sales/pages/InvoiceDetailsPage";
import InvoiceEditPage from "../features/sales/pages/InvoiceEditPage";

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
  { path: "/", element: <LoginPage /> },
  { path: "*", element: <Error404 /> },
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
      { path: "sales", element: <SalesPage /> },
      { path: "sales/new", element: <InvoiceCreatePage /> },
      { path: "sales/:id", element: <InvoiceDetailsPage /> },
      { path: "sales/:id/edit", element: <InvoiceEditPage /> },
      { path: "purchases", element: <PurchasesPage /> },
      { path: "partners", element: <PartnersPage /> },
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
