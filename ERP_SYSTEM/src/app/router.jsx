import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import DashboardLayout from "../shared/components/layout/DashboardLayout";
import DashboardHome from "../features/dashboard/pages/DashboardHome";
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
import PartnersListPage from "../features/partners/pages/PartnersListPage";
import PartnerDetailPage from "../features/partners/pages/PartnerDetailPage";
import DriverDetailPage from "../features/drivers/pages/DriverDetailPage";
import DriversListPage from "../features/drivers/pages/DriversListPage";
import StoreDetailPage from "../features/stores/pages/StoreDetailPage";
import StoresListPage from "../features/stores/pages/StoresListPage";
import StockOpeningBalancesPage from "../features/stores/pages/StockOpeningBalancesPage";
import ItemDetailPage from "../features/inventory/pages/ItemDetailPage";
import StockAdjustmentsListPage from "../features/stock-adjustments/pages/StockAdjustmentsListPage";
import StockAdjustmentCreatePage from "../features/stock-adjustments/pages/StockAdjustmentCreatePage";
import StockAdjustmentEditPage from "../features/stock-adjustments/pages/StockAdjustmentEditPage";
import StockAdjustmentDetailPage from "../features/stock-adjustments/pages/StockAdjustmentDetailPage";
import PermissionsPage from "../features/permissions/pages/PermissionsPage";
import CashMovementTypesListPage from "../features/cashMovementTypes/pages/CashMovementTypesListPage";
import UnitsPage from "../features/units/pages/UnitsPage";
import PackagingUnitsPage from "../features/containers/pages/PackagingUnitsPage";
import CountriesPage from "../features/countries/pages/CountriesPage";
import EmployeeDetailPage from "../features/payroll/pages/EmployeeDetailPage";
import EmployeesPage from "../features/payroll/pages/EmployeesPage";
import PayrollDashboardPage from "../features/payroll/pages/PayrollDashboardPage";

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
      { path: "partners", element: <PartnersListPage /> },
      { path: "partners/:partnerId", element: <PartnerDetailPage /> },
      { path: "partners/statement", element: <PartnerAccountPage /> },
      {
        path: "partners/opening-balances",
        element: <PartnerOpeningBalancesPage />,
      },
      { path: "partners/countries", element: <CountriesPage /> },
      { path: "drivers", element: <DriversListPage /> },
      { path: "drivers/:driverId", element: <DriverDetailPage /> },
      { path: "drivers/trip-costs", element: <DriverTripCostEntryPage /> },
      { path: "drivers/statement", element: <DriverStatementPage /> },
      { path: "treasury", element: <CashboxesListPage /> },
      { path: "treasury/:cashboxId", element: <CashboxDetailPage /> },
      {
        path: "treasury/cash-movement-types",
        element: <CashMovementTypesListPage />,
      },
      { path: "stores", element: <StoresListPage /> },
      { path: "stores/:id", element: <StoreDetailPage /> },
      { path: "items/:id", element: <ItemDetailPage /> },
      {
        path: "inventory/opening-balances",
        element: <StockOpeningBalancesPage />,
      },

      { path: "inventory/adjustments", element: <StockAdjustmentsListPage /> },
      {
        path: "inventory/adjustments/new",
        element: <StockAdjustmentCreatePage />,
      },
      {
        path: "inventory/adjustments/:id",
        element: <StockAdjustmentDetailPage />,
      },
      {
        path: "inventory/adjustments/:id/edit",
        element: <StockAdjustmentEditPage />,
      },
      { path: "inventory/units", element: <UnitsPage /> },
      { path: "inventory/containers", element: <PackagingUnitsPage /> },
      { path: "expenses", element: <ComingSoon title="المصاريف" /> },
      { path: "payroll", element: <PayrollDashboardPage /> },
      { path: "payroll/employees", element: <EmployeesPage /> },
      {
        path: "payroll/employees/:employeeCode",
        element: <EmployeeDetailPage />,
      },
      { path: "payroll/salaries", element: <ComingSoon title="المرتبات" /> },
      {
        path: "payroll/salaries/:id",
        element: <ComingSoon title="تفاصيل المرتب" />,
      },
      {
        path: "payroll/attendance",
        element: <ComingSoon title="الحضور والانصراف" />,
      },
      {
        path: "payroll/overtime",
        element: <ComingSoon title="الإضافي والبدلات" />,
      },
      { path: "payroll/deductions", element: <ComingSoon title="الخصومات" /> },
      { path: "payroll/advances", element: <ComingSoon title="السلف" /> },
      {
        path: "payroll/reports",
        element: <ComingSoon title="تقارير الأجور" />,
      },

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
      { path: "permissions", element: <PermissionsPage /> },
    ],
  },
]);
