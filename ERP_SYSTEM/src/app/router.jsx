import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import RoleRoute from "../shared/components/RoleRoute";
import DashboardLayout from "../shared/components/layout/DashboardLayout";
import Error404 from "../shared/components/Error404";

// Route pages are lazy-loaded so each feature module ships as its own
// chunk instead of bloating the single main bundle (was ~2.7MB / 690KB gzip).
const DashboardHome = lazy(
  () => import("../features/dashboard/pages/DashboardHome"),
);
const SalesPage = lazy(() => import("../features/sales/pages/SalesPage"));
const InvoiceCreatePage = lazy(
  () => import("../features/sales/pages/InvoiceCreatePage"),
);
const InvoiceDetailsPage = lazy(
  () => import("../features/sales/pages/InvoiceDetailsPage"),
);
const InvoiceEditPage = lazy(
  () => import("../features/sales/pages/InvoiceEditPage"),
);
const PartnerAccountPage = lazy(
  () => import("../features/statements/pages/PartnerAccountPage"),
);
const CashboxesListPage = lazy(
  () => import("../features/cashboxes/pages/CashboxesListPage"),
);
const CashboxDetailPage = lazy(
  () => import("../features/cashboxes/pages/CashboxDetailPage"),
);
const CashboxTransferDetailsPage = lazy(
  () => import("../features/cashboxes/pages/CashboxTransferDetailsPage"),
);
const CashboxTransfersPage = lazy(
  () => import("../features/cashboxes/pages/CashboxTransfersPage"),
);
const DriverTripCostEntryPage = lazy(
  () => import("../features/drivers/pages/DriverTripCostEntryPage"),
);
const DriverStatementPage = lazy(
  () => import("../features/drivers/pages/DriverStatementPage"),
);
const DriverDetailPage = lazy(
  () => import("../features/drivers/pages/DriverDetailPage"),
);
const DriversListPage = lazy(
  () => import("../features/drivers/pages/DriversListPage"),
);
const PartnerOpeningBalancesPage = lazy(
  () => import("../features/partners/pages/PartnerOpeningBalancesPage"),
);
const PartnersListPage = lazy(
  () => import("../features/partners/pages/PartnersListPage"),
);
const PartnerDetailPage = lazy(
  () => import("../features/partners/pages/PartnerDetailPage"),
);
const StoreDetailPage = lazy(
  () => import("../features/stores/pages/StoreDetailPage"),
);
const StoresListPage = lazy(
  () => import("../features/stores/pages/StoresListPage"),
);
const StockOpeningBalancesPage = lazy(
  () => import("../features/stores/pages/StockOpeningBalancesPage"),
);
const ItemDetailPage = lazy(
  () => import("../features/inventory/pages/ItemDetailPage"),
);
const StockAdjustmentsListPage = lazy(
  () => import("../features/stock-adjustments/pages/StockAdjustmentsListPage"),
);
const StockAdjustmentCreatePage = lazy(
  () => import("../features/stock-adjustments/pages/StockAdjustmentCreatePage"),
);
const StockAdjustmentEditPage = lazy(
  () => import("../features/stock-adjustments/pages/StockAdjustmentEditPage"),
);
const StockAdjustmentDetailPage = lazy(
  () => import("../features/stock-adjustments/pages/StockAdjustmentDetailPage"),
);
const PermissionsPage = lazy(
  () => import("../features/permissions/pages/PermissionsPage"),
);
const CashMovementTypesListPage = lazy(
  () => import("../features/cashMovementTypes/pages/CashMovementTypesListPage"),
);
const UnitsPage = lazy(() => import("../features/units/pages/UnitsPage"));
const PackagingUnitsPage = lazy(
  () => import("../features/containers/pages/PackagingUnitsPage"),
);
const CountriesPage = lazy(
  () => import("../features/countries/pages/CountriesPage"),
);
const EmployeesPage = lazy(
  () => import("../features/payroll/pages/EmployeesPage"),
);
const EmployeeDetailPage = lazy(
  () => import("../features/payroll/pages/EmployeeDetailPage"),
);
const SalariesPage = lazy(
  () => import("../features/payroll/pages/SalariesPage"),
);
const SalaryDetailPage = lazy(
  () => import("../features/payroll/pages/SalaryDetailPage"),
);
const AttendancePage = lazy(
  () => import("../features/payroll/pages/AttendancePage"),
);
const EmployeeMovementsPage = lazy(
  () => import("../features/payroll/pages/EmployeeMovementsPage"),
);
const ContainerStoreStatement = lazy(
  () => import("../features/storeContainers/pages/ContainerStoreStatement"),
);
const ExpensesPage = lazy(
  () => import("../features/expenses/pages/ExpensesPage"),
);
const ItemProfitabilityPage = lazy(
  () => import("../features/reports/pages/ItemProfitabilityPage"),
);
const InvoiceProfitabilityDetailsPage = lazy(
  () => import("../features/reports/pages/InvoiceProfitabilityDetailsPage"),
);
const InvoiceProfitabilityPage = lazy(
  () => import("../features/reports/pages/InvoiceProfitabilityPage"),
);
const StockTransfersPage = lazy(
  () => import("../features/inventory/pages/StockTransfersPage"),
);
const AttendanceTakingPage = lazy(
  () => import("../features/payroll/pages/AttendanceTakingPage"),
);
const EmployeeAccountPage = lazy(
  () => import("../features/statements/pages/EmployeeAccountPage"),
);
const BulkCreatePayrollEntriesPage = lazy(
  () => import("../features/payroll/pages/BulkCreatePayrollEntriesPage"),
);
const EmployeeOpeningBalancesPage = lazy(
  () => import("../features/payroll/pages/EmployeeOpeningBalancesPage"),
);
const InvoiceItemPricingPage = lazy(
  () => import("../features/invoiceItemPricing/pages/InvoiceItemPricingPage"),
);
const CurrenciesPage = lazy(
  () => import("../features/exchange-rates/pages/CurrenciesPage"),
);
const FiscalYearsListPage = lazy(
  () => import("../features/fiscalYears/pages/FiscalYearsListPage"),
);
const ProfilePage = lazy(() => import("../features/users/pages/ProfilePage"));
const EditProfilePage = lazy(
  () => import("../features/users/pages/EditProfilePage"),
);
const PayrollReportsPage = lazy(
  () => import("../features/payroll/pages/PayrollReportsPage"),
);
const PayrollDashboardPage = lazy(
  () => import("../features/payroll/pages/PayrollDashboardPage"),
);
const AccountsPage = lazy(
  () => import("../features/accounts/pages/AccountsPage"),
);
const AccountMappingsPage = lazy(
  () => import("../features/accounting/pages/AccountMappingsPage"),
);
const JournalEntriesListPage = lazy(
  () => import("../features/journalEntries/pages/JournalEntriesListPage"),
);
const JournalEntryFormPage = lazy(
  () => import("../features/journalEntries/pages/JournalEntryFormPage"),
);
const AfterAdjustmentTrialBalancePage = lazy(
  () =>
    import("../features/TrialBalance/pages/AfterAdjustmentTrialBalancePage.jsx"),
);
const BeforeAdjustmentTrialBalancePage = lazy(
  () =>
    import("../features/TrialBalance/pages/BeforeAdjustmentTrialBalancePage.jsx"),
);
const IncomeStatementPage = lazy(
  () => import("../features/statements/pages/IncomeStatementPage.jsx"),
);
const FinancialPositionPage = lazy(
  () => import("../features/statements/pages/FinancialPositionPage.jsx"),
);
const CashFlowPage = lazy(
  () => import("../features/statements/pages/CashFlowPage.jsx"),
);
const FinancialStatementsPage = lazy(
  () =>
    import("../features/financialStatements/pages/FinancialStatementsPage.jsx"),
);

const ROLES = {
  ADMIN: "Admin",
  ACCOUNTANT: "Accountant",
  SALES: "Sales",
  INVENTORY: "Inventory",
  HR: "HR",
};

function Role({ roles, children }) {
  return <RoleRoute roles={roles}>{children}</RoleRoute>;
}

function ComingSoon({ title }) {
  return (
    <div className="py-20 text-center text-gray-400">
      <p className="text-lg">{title}</p>
      <p className="mt-1 text-sm">هذه الصفحة قيد التطوير</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "*",
    element: <Error404 />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },

      {
        path: "sales",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.SALES, ROLES.ACCOUNTANT]}>
            <SalesPage />
          </Role>
        ),
      },
      {
        path: "sales/new",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.SALES, ROLES.ACCOUNTANT]}>
            <InvoiceCreatePage />
          </Role>
        ),
      },
      {
        path: "sales/:id",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.SALES, ROLES.ACCOUNTANT]}>
            <InvoiceDetailsPage />
          </Role>
        ),
      },
      {
        path: "sales/:id/edit",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.SALES, ROLES.ACCOUNTANT]}>
            <InvoiceEditPage />
          </Role>
        ),
      },
      {
        path: "purchases/new",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.INVENTORY, ROLES.ACCOUNTANT]}>
            <InvoiceCreatePage />
          </Role>
        ),
      },
      {
        path: "purchases/:id",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.INVENTORY, ROLES.ACCOUNTANT]}>
            <InvoiceDetailsPage />
          </Role>
        ),
      },
      {
        path: "purchases/:id/edit",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.INVENTORY, ROLES.ACCOUNTANT]}>
            <InvoiceEditPage />
          </Role>
        ),
      },

      {
        path: "partners",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.SALES, ROLES.ACCOUNTANT]}>
            <PartnersListPage />
          </Role>
        ),
      },
      {
        path: "partners/opening-balances",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <PartnerOpeningBalancesPage />
          </Role>
        ),
      },
      {
        path: "partners/statement",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.SALES]}>
            <PartnerAccountPage />
          </Role>
        ),
      },
      {
        path: "partners/countries",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.SALES, ROLES.ACCOUNTANT]}>
            <CountriesPage />
          </Role>
        ),
      },
      {
        path: "partners/:partnerId",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.SALES, ROLES.ACCOUNTANT]}>
            <PartnerDetailPage />
          </Role>
        ),
      },
      {
        path: "stores/containers/:partnerId",
        element: (
          <Role
            roles={[
              ROLES.ADMIN,
              ROLES.SALES,
              ROLES.INVENTORY,
              ROLES.ACCOUNTANT,
            ]}
          >
            <ContainerStoreStatement />
          </Role>
        ),
      },

      {
        path: "drivers",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.SALES, ROLES.ACCOUNTANT]}>
            <DriversListPage />
          </Role>
        ),
      },
      {
        path: "drivers/trip-costs",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.SALES, ROLES.ACCOUNTANT]}>
            <DriverTripCostEntryPage />
          </Role>
        ),
      },
      {
        path: "drivers/statement",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.SALES]}>
            <DriverStatementPage />
          </Role>
        ),
      },
      {
        path: "drivers/:driverId",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.SALES, ROLES.ACCOUNTANT]}>
            <DriverDetailPage />
          </Role>
        ),
      },

      {
        path: "treasury",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <CashboxesListPage />
          </Role>
        ),
      },
      {
        path: "treasury/cash-movement-types",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <CashMovementTypesListPage />
          </Role>
        ),
      },
      {
        path: "treasury/currencies",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <CurrenciesPage />
          </Role>
        ),
      },
      {
        path: "treasury/transfers",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <CashboxTransfersPage />
          </Role>
        ),
      },
      {
        path: "treasury/transfers/:id",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <CashboxTransferDetailsPage />
          </Role>
        ),
      },
      {
        path: "treasury/:cashboxId",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <CashboxDetailPage />
          </Role>
        ),
      },
      {
        path: "expenses",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <ExpensesPage />
          </Role>
        ),
      },

      {
        path: "stores",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.INVENTORY, ROLES.ACCOUNTANT]}>
            <StoresListPage />
          </Role>
        ),
      },
      {
        path: "inventory/containers",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.INVENTORY]}>
            <PackagingUnitsPage />
          </Role>
        ),
      },
      {
        path: "inventory/units",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.INVENTORY]}>
            <UnitsPage />
          </Role>
        ),
      },
      {
        path: "inventory/opening-balances",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.INVENTORY, ROLES.ACCOUNTANT]}>
            <StockOpeningBalancesPage />
          </Role>
        ),
      },
      {
        path: "inventory/stock-transfers",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.INVENTORY, ROLES.ACCOUNTANT]}>
            <StockTransfersPage />
          </Role>
        ),
      },
      {
        path: "inventory/adjustments",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.INVENTORY, ROLES.ACCOUNTANT]}>
            <StockAdjustmentsListPage />
          </Role>
        ),
      },
      {
        path: "inventory/adjustments/new",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.INVENTORY, ROLES.ACCOUNTANT]}>
            <StockAdjustmentCreatePage />
          </Role>
        ),
      },
      {
        path: "inventory/adjustments/:id",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.INVENTORY, ROLES.ACCOUNTANT]}>
            <StockAdjustmentDetailPage />
          </Role>
        ),
      },
      {
        path: "inventory/adjustments/:id/edit",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.INVENTORY, ROLES.ACCOUNTANT]}>
            <StockAdjustmentEditPage />
          </Role>
        ),
      },
      {
        path: "stores/:id",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.INVENTORY, ROLES.ACCOUNTANT]}>
            <StoreDetailPage />
          </Role>
        ),
      },
      {
        path: "items/:id",
        element: (
          <Role
            roles={[
              ROLES.ADMIN,
              ROLES.INVENTORY,
              ROLES.SALES,
              ROLES.ACCOUNTANT,
            ]}
          >
            <ItemDetailPage />
          </Role>
        ),
      },
      {
        path: "invoice-item-pricing",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.SALES, ROLES.INVENTORY]}>
            <InvoiceItemPricingPage />
          </Role>
        ),
      },

      {
        path: "payroll",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.HR, ROLES.ACCOUNTANT]}>
            <PayrollDashboardPage />
          </Role>
        ),
      },
      {
        path: "payroll/employees",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.HR, ROLES.ACCOUNTANT]}>
            <EmployeesPage />
          </Role>
        ),
      },
      {
        path: "payroll/opening-balances",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.HR, ROLES.ACCOUNTANT]}>
            <EmployeeOpeningBalancesPage />
          </Role>
        ),
      },
      {
        path: "payroll/attendance",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.HR]}>
            <AttendanceTakingPage />
          </Role>
        ),
      },
      {
        path: "payroll/attendance/records",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.HR, ROLES.ACCOUNTANT]}>
            <AttendancePage />
          </Role>
        ),
      },
      {
        path: "payroll/movements",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.HR, ROLES.ACCOUNTANT]}>
            <EmployeeMovementsPage />
          </Role>
        ),
      },
      {
        path: "payroll/salaries",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.HR, ROLES.ACCOUNTANT]}>
            <SalariesPage />
          </Role>
        ),
      },
      {
        path: "payroll/salaries/create",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.HR, ROLES.ACCOUNTANT]}>
            <BulkCreatePayrollEntriesPage />
          </Role>
        ),
      },
      {
        path: "payroll/salaries/:salaryId",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.HR, ROLES.ACCOUNTANT]}>
            <SalaryDetailPage />
          </Role>
        ),
      },
      {
        path: "payroll/employees/statement",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.HR, ROLES.ACCOUNTANT]}>
            <EmployeeAccountPage />
          </Role>
        ),
      },
      {
        path: "payroll/reports",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.HR, ROLES.ACCOUNTANT]}>
            <PayrollReportsPage />
          </Role>
        ),
      },
      {
        path: "payroll/employees/:employeeId",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.HR, ROLES.ACCOUNTANT]}>
            <EmployeeDetailPage />
          </Role>
        ),
      },

      {
        path: "fiscal-years",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <FiscalYearsListPage />
          </Role>
        ),
      },
      {
        path: "accounts",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <AccountsPage />
          </Role>
        ),
      },
      {
        path: "account-mappings",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <AccountMappingsPage />
          </Role>
        ),
      },
      {
        path: "financial-statements",
        element: <FinancialStatementsPage />,
      },

      {
        path: "journal-entries",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <JournalEntriesListPage />
          </Role>
        ),
      },
      {
        path: "journal-entries/new",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <JournalEntryFormPage />
          </Role>
        ),
      },
      {
        path: "journal-entries/:id",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <JournalEntryFormPage />
          </Role>
        ),
      },
      {
        path: "journal-entries/:id/edit",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <JournalEntryFormPage />
          </Role>
        ),
      },
      {
        path: "trial-balance/before-adjustments",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <BeforeAdjustmentTrialBalancePage />
          </Role>
        ),
      },
      {
        path: "trial-balance/after-adjustments",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <AfterAdjustmentTrialBalancePage />
          </Role>
        ),
      },
      {
        path: "income",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <IncomeStatementPage />
          </Role>
        ),
      },
      {
        path: "financial-position",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <FinancialPositionPage />
          </Role>
        ),
      },
      {
        path: "cash-flow",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <CashFlowPage />
          </Role>
        ),
      },

      {
        path: "reports",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <ComingSoon title="التقارير" />
          </Role>
        ),
      },
      {
        path: "reports/profitability/invoices",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.SALES]}>
            <InvoiceProfitabilityPage />
          </Role>
        ),
      },
      {
        path: "reports/profitability/invoices/:invoiceId",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.SALES]}>
            <InvoiceProfitabilityDetailsPage />
          </Role>
        ),
      },
      {
        path: "reports/profitability/items",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.SALES]}>
            <ItemProfitabilityPage />
          </Role>
        ),
      },

      {
        path: "permissions",
        element: (
          <Role roles={ROLES.ADMIN}>
            <PermissionsPage />
          </Role>
        ),
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "profile/edit",
        element: (
          <Role roles={[ROLES.ADMIN]}>
            <EditProfilePage />
          </Role>
        ),
      },
    ],
  },
]);
