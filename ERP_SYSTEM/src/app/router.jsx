import { createBrowserRouter } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import DashboardLayout from "../shared/components/layout/DashboardLayout";
import DashboardHome from "../features/dashboard/pages/DashboardHome";

import SalesPage from "../features/sales/pages/SalesPage";
import InvoiceCreatePage from "../features/sales/pages/InvoiceCreatePage";
import InvoiceDetailsPage from "../features/sales/pages/InvoiceDetailsPage";
import InvoiceEditPage from "../features/sales/pages/InvoiceEditPage";

import Error404 from "../shared/components/Error404";

import BankPage from "../features/bank/Pages/BankPage";

import PartnerAccountPage from "../features/statements/pages/PartnerAccountPage";

import CashboxesListPage from "../features/cashboxes/pages/CashboxesListPage";
import CashboxDetailPage from "../features/cashboxes/pages/CashboxDetailPage";
import CashboxTransferDetailsPage from "../features/cashboxes/pages/CashboxTransferDetailsPage";
import CashboxTransfersPage from "../features/cashboxes/pages/CashboxTransfersPage";

import DriverTripCostEntryPage from "../features/drivers/pages/DriverTripCostEntryPage";
import DriverStatementPage from "../features/drivers/pages/DriverStatementPage";
import DriverDetailPage from "../features/drivers/pages/DriverDetailPage";
import DriversListPage from "../features/drivers/pages/DriversListPage";

import PartnerOpeningBalancesPage from "../features/partners/pages/PartnerOpeningBalancesPage";
import PartnersListPage from "../features/partners/pages/PartnersListPage";
import PartnerDetailPage from "../features/partners/pages/PartnerDetailPage";

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

import PayrollDashboardPage from "../features/payroll/pages/PayrollDashboardPage";
import EmployeesPage from "../features/payroll/pages/EmployeesPage";
import EmployeeDetailPage from "../features/payroll/pages/EmployeeDetailPage";
import SalariesPage from "../features/payroll/pages/SalariesPage";
import SalaryDetailPage from "../features/payroll/pages/SalaryDetailPage";
import AttendancePage from "../features/payroll/pages/AttendancePage";
import OvertimePage from "../features/payroll/pages/OvertimePage";
import DeductionsPage from "../features/payroll/pages/DeductionsPage";
import AdvancesPage from "../features/payroll/pages/AdvancesPage";
import AdvanceDetailPage from "../features/payroll/pages/AdvanceDetailPage";
import ReportsPage from "../features/payroll/pages/ReportsPage";

import ContainerStoreStatement from "../features/storeContainers/pages/ContainerStoreStatement";

import ExpensesPage from "../features/expenses/pages/ExpensesPage";
import ItemProfitabilityPage from "../features/reports/pages/ItemProfitabilityPage";
import InvoiceProfitabilityDetailsPage from "../features/reports/pages/InvoiceProfitabilityDetailsPage";
import InvoiceProfitabilityPage from "../features/reports/pages/InvoiceProfitabilityPage";

// ============================================================
// Coming Soon
// ============================================================
function ComingSoon({ title }) {
  return (
    <div className="text-center py-20 text-gray-400">
      <p className="text-lg">{title}</p>

      <p className="text-sm mt-1">هذه الصفحة قيد التطوير</p>
    </div>
  );
}

// ============================================================
// Router
// ============================================================
export const router = createBrowserRouter([
  // ==========================================================
  // Authentication
  // ==========================================================
  {
    path: "/",
    element: <LoginPage />,
  },

  // ==========================================================
  // 404
  // ==========================================================
  {
    path: "*",
    element: <Error404 />,
  },

  // ==========================================================
  // Dashboard
  // ==========================================================
  {
    path: "/dashboard",

    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),

    children: [
      // ========================================================
      // Dashboard
      // ========================================================
      {
        index: true,
        element: <DashboardHome />,
      },

      // ========================================================
      // Sales
      // ========================================================
      {
        path: "sales",
        element: <SalesPage />,
      },
      {
        path: "sales/new",
        element: <InvoiceCreatePage />,
      },
      {
        path: "sales/:id",
        element: <InvoiceDetailsPage />,
      },
      {
        path: "sales/:id/edit",
        element: <InvoiceEditPage />,
      },

      // ========================================================
      // Purchases
      // ========================================================
      {
        path: "purchases/new",
        element: <InvoiceCreatePage />,
      },
      {
        path: "purchases/:id",
        element: <InvoiceDetailsPage />,
      },
      {
        path: "purchases/:id/edit",
        element: <InvoiceEditPage />,
      },

      // ========================================================
      // Container Store
      // ========================================================
      {
        path: "stores/containers/:partnerId",
        element: <ContainerStoreStatement />,
      },

      // ========================================================
      // Partners
      // ========================================================
      {
        path: "partners",
        element: <PartnersListPage />,
      },
      {
        path: "partners/:partnerId",
        element: <PartnerDetailPage />,
      },
      {
        path: "partners/statement",
        element: <PartnerAccountPage />,
      },
      {
        path: "partners/opening-balances",
        element: <PartnerOpeningBalancesPage />,
      },
      {
        path: "partners/countries",
        element: <CountriesPage />,
      },

      // ========================================================
      // Drivers
      // ========================================================
      {
        path: "drivers",
        element: <DriversListPage />,
      },
      {
        path: "drivers/:driverId",
        element: <DriverDetailPage />,
      },
      {
        path: "drivers/trip-costs",
        element: <DriverTripCostEntryPage />,
      },
      {
        path: "drivers/statement",
        element: <DriverStatementPage />,
      },

      // ========================================================
      // Treasury
      // ========================================================
      {
        path: "treasury",
        element: <CashboxesListPage />,
      },
      {
        path: "treasury/:cashboxId",
        element: <CashboxDetailPage />,
      },
      {
        path: "treasury/transfers",
        element: <CashboxTransfersPage />,
      },
      {
        path: "treasury/transfers/:id",
        element: <CashboxTransferDetailsPage />,
      },
      {
        path: "treasury/cash-movement-types",
        element: <CashMovementTypesListPage />,
      },

      // ========================================================
      // Stores
      // ========================================================
      {
        path: "stores",
        element: <StoresListPage />,
      },
      {
        path: "stores/:id",
        element: <StoreDetailPage />,
      },

      // ========================================================
      // Items
      // ========================================================
      {
        path: "items/:id",
        element: <ItemDetailPage />,
      },

      // ========================================================
      // Inventory
      // ========================================================
      {
        path: "inventory/opening-balances",
        element: <StockOpeningBalancesPage />,
      },
      {
        path: "inventory/adjustments",
        element: <StockAdjustmentsListPage />,
      },
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
      {
        path: "inventory/units",
        element: <UnitsPage />,
      },
      {
        path: "inventory/containers",
        element: <PackagingUnitsPage />,
      },

      // ========================================================
      // Expenses
      // ========================================================
      {
        path: "expenses",
        element: <ExpensesPage />,
      },

      // ========================================================
      // Payroll
      // ========================================================

      { path: "payroll", element: <PayrollDashboardPage /> },
      { path: "payroll/employees", element: <EmployeesPage /> },
      {
        path: "payroll/employees/:employeeId",
        element: <EmployeeDetailPage />,
      },
      { path: "payroll/salaries", element: <SalariesPage /> },
      { path: "payroll/salaries/:salaryId", element: <SalaryDetailPage /> },
      { path: "payroll/attendance", element: <AttendancePage /> },
      { path: "payroll/overtime", element: <OvertimePage /> },
      { path: "payroll/deductions", element: <DeductionsPage /> },
      { path: "payroll/advances", element: <AdvancesPage /> },
      { path: "payroll/advances/:advanceId", element: <AdvanceDetailPage /> },
      { path: "payroll/reports", element: <ReportsPage /> },

      // ========================================================
      // Profitability Reports
      // ========================================================
      {
        path: "reports/profitability/invoices",
        element: <InvoiceProfitabilityPage />,
      },
      {
        path: "reports/profitability/invoices/:invoiceId",
        element: <InvoiceProfitabilityDetailsPage />,
      },
      {
        path: "reports/profitability/items",
        element: <ItemProfitabilityPage />,
      },

      // ========================================================
      // Accounting
      // ========================================================
      {
        path: "adjusted-trial-balance",
        element: <ComingSoon title="ميزان بعد التسوية" />,
      },
      {
        path: "income",
        element: <ComingSoon title="تقارير الدخل" />,
      },
      {
        path: "financial-position",
        element: <ComingSoon title="تقارير المركز المالي" />,
      },

      // ========================================================
      // Reports
      // ========================================================
      {
        path: "reports",
        element: <ComingSoon title="التقارير" />,
      },

      // ========================================================
      // Permissions
      // ========================================================
      {
        path: "permissions",
        element: <PermissionsPage />,
      },
    ],
  },
]);
