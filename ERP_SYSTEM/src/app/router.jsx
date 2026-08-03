import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import DashboardLayout from "../shared/components/layout/DashboardLayout";
import DashboardHome from "../features/dashboard/pages/DashboardHome";
import InventoryPage from "../features/inventory/pages/InventoryPage";
import SalesPage from "../features/sales/pages/SalesPage";
import Error404 from "../shared/components/Error404";
import InvoiceCreatePage from "../features/sales/pages/InvoiceCreatePage";
import InvoiceDetailsPage from "../features/sales/pages/InvoiceDetailsPage";
import InvoiceEditPage from "../features/sales/pages/InvoiceEditPage";
import StoreContainersPage from "../features/storeContainers/pages/StoreContainersPage";
import BankPage from "../features/bank/Pages/BankPage";
import PartnerAccountPage from "../features/statements/pages/PartnerAccountPage";
import CashboxesListPage from "../features/cashboxes/pages/CashboxesListPage";
import CashboxDetailPage from "../features/cashboxes/pages/CashboxDetailPage";
import DriverTripCostEntryPage from "../features/drivers/pages/DriverTripCostEntryPage";
import DriverStatementPage from "../features/drivers/pages/DriverStatementPage";
import PartnerOpeningBalancesPage from "../features/partners/pages/PartnerOpeningBalancesPage";
import StockOpeningBalancesPage from "../features/inventory/pages/StockOpeningBalancesPage";
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
      { path: "sales/new", element: <InvoiceCreatePage /> },
      { path: "sales/:id", element: <InvoiceDetailsPage /> },
      { path: "sales/:id/edit", element: <InvoiceEditPage /> },
      { path: "purchases/new", element: <InvoiceCreatePage /> },
      { path: "purchases/:id", element: <InvoiceDetailsPage /> },
      { path: "purchases/:id/edit", element: <InvoiceEditPage /> },
      { path: "stores/containers/:partyId", element: <StoreContainersPage /> },
      { path: "partners", element: <PartnerAccountPage /> },
      {
        path: "partners/opening-balances",
        element: <PartnerOpeningBalancesPage />,
      },
      { path: "drivers/trip-costs", element: <DriverTripCostEntryPage /> },
      { path: "drivers/statement", element: <DriverStatementPage /> },
      { path: "treasury", element: <CashboxesListPage /> },
      { path: "treasury/:cashboxId", element: <CashboxDetailPage /> },
      { path: "inventory", element: <InventoryPage /> },
      {
        path: "inventory/opening-balances",
        element: <StockOpeningBalancesPage />,
      },
      {
        path: "inventory/invoices",
        element: <ComingSoon title="فواتير المخزون" />,
      },
      {
        path: "inventory/adjustments",
        element: <ComingSoon title="تسويات المخزون" />,
      },
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
