import { lazy } from "react";

import { createBrowserRouter } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";

import ProtectedRoute from "../shared/components/ProtectedRoute";

import RoleRoute from "../shared/components/RoleRoute";

import DashboardLayout from "../shared/components/layout/DashboardLayout";

import Error404 from "../shared/components/Error404";

// Route pages are lazy-loaded so each feature module ships as its own
// chunk instead of bloating the single main bundle.

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
  CASHIER: "Cashier",
  USER: "User",
};

const FULL_ACCESS_ROLES = [ROLES.ADMIN, ROLES.ACCOUNTANT];

const LIMITED_ACCESS_ROLES = [ROLES.USER, ROLES.CASHIER];

const INVOICE_ROLES = [
  ROLES.ADMIN,
  ROLES.ACCOUNTANT,
  ROLES.USER,
  ROLES.CASHIER,
];

const TREASURY_ROLES = [
  ROLES.ADMIN,
  ROLES.ACCOUNTANT,
  ROLES.USER,
  ROLES.CASHIER,
];

const PAYROLL_ROLES = [
  ROLES.ADMIN,
  ROLES.ACCOUNTANT,
  ROLES.USER,
  ROLES.CASHIER,
];

const EXPENSE_ROLES = [
  ROLES.ADMIN,
  ROLES.ACCOUNTANT,
  ROLES.USER,
  ROLES.CASHIER,
];

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
        element: (
          <Role
            roles={[ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.USER, ROLES.CASHIER]}
          >
            <DashboardHome />
          </Role>
        ),
      },

      /*
       * =========================
       * SALES / INVOICES
       * =========================
       */

      {
        path: "sales",
        element: (
          <Role roles={INVOICE_ROLES}>
            <SalesPage />
          </Role>
        ),
      },

      {
        path: "sales/new",
        element: (
          <Role roles={INVOICE_ROLES}>
            <InvoiceCreatePage />
          </Role>
        ),
      },

      {
        path: "sales/:id",
        element: (
          <Role roles={INVOICE_ROLES}>
            <InvoiceDetailsPage />
          </Role>
        ),
      },

      {
        path: "sales/:id/edit",
        element: (
          <Role roles={INVOICE_ROLES}>
            <InvoiceEditPage />
          </Role>
        ),
      },

      {
        path: "purchases/new",
        element: (
          <Role roles={INVOICE_ROLES}>
            <InvoiceCreatePage />
          </Role>
        ),
      },

      {
        path: "purchases/:id",
        element: (
          <Role roles={INVOICE_ROLES}>
            <InvoiceDetailsPage />
          </Role>
        ),
      },

      {
        path: "purchases/:id/edit",
        element: (
          <Role roles={INVOICE_ROLES}>
            <InvoiceEditPage />
          </Role>
        ),
      },

      /*
       * =========================
       * PARTNERS
       * =========================
       */

      {
        path: "partners",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <PartnersListPage />
          </Role>
        ),
      },

      {
        path: "partners/opening-balances",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <PartnerOpeningBalancesPage />
          </Role>
        ),
      },

      {
        path: "partners/statement",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <PartnerAccountPage />
          </Role>
        ),
      },

      {
        path: "partners/countries",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <CountriesPage />
          </Role>
        ),
      },

      {
        path: "partners/:partnerId",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <PartnerDetailPage />
          </Role>
        ),
      },

      {
        path: "stores/containers/:partnerId",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <ContainerStoreStatement />
          </Role>
        ),
      },

      /*
       * =========================
       * DRIVERS
       * =========================
       */

      {
        path: "drivers",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <DriversListPage />
          </Role>
        ),
      },

      {
        path: "drivers/trip-costs",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <DriverTripCostEntryPage />
          </Role>
        ),
      },

      {
        path: "drivers/statement",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <DriverStatementPage />
          </Role>
        ),
      },

      {
        path: "drivers/:driverId",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <DriverDetailPage />
          </Role>
        ),
      },

      /*
       * =========================
       * TREASURY
       * =========================
       */

      {
        path: "treasury",
        element: (
          <Role roles={TREASURY_ROLES}>
            <CashboxesListPage />
          </Role>
        ),
      },

      {
        path: "treasury/:cashboxId",
        element: (
          <Role roles={TREASURY_ROLES}>
            <CashboxDetailPage />
          </Role>
        ),
      },

      {
        path: "treasury/cash-movement-types",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <CashMovementTypesListPage />
          </Role>
        ),
      },

      {
        path: "treasury/currencies",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <CurrenciesPage />
          </Role>
        ),
      },

      {
        path: "treasury/transfers",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <CashboxTransfersPage />
          </Role>
        ),
      },

      {
        path: "treasury/transfers/:id",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <CashboxTransferDetailsPage />
          </Role>
        ),
      },

      /*
       * =========================
       * EXPENSES
       * =========================
       */

      {
        path: "expenses",
        element: (
          <Role roles={EXPENSE_ROLES}>
            <ExpensesPage />
          </Role>
        ),
      },

      /*
       * =========================
       * INVENTORY
       * =========================
       */

      {
        path: "stores",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <StoresListPage />
          </Role>
        ),
      },

      {
        path: "stores/:id",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <StoreDetailPage />
          </Role>
        ),
      },

      {
        path: "inventory/containers",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <PackagingUnitsPage />
          </Role>
        ),
      },

      {
        path: "inventory/units",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <UnitsPage />
          </Role>
        ),
      },

      {
        path: "inventory/opening-balances",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <StockOpeningBalancesPage />
          </Role>
        ),
      },

      {
        path: "inventory/stock-transfers",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <StockTransfersPage />
          </Role>
        ),
      },

      {
        path: "inventory/adjustments",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <StockAdjustmentsListPage />
          </Role>
        ),
      },

      {
        path: "inventory/adjustments/new",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <StockAdjustmentCreatePage />
          </Role>
        ),
      },

      {
        path: "inventory/adjustments/:id",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <StockAdjustmentDetailPage />
          </Role>
        ),
      },

      {
        path: "inventory/adjustments/:id/edit",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <StockAdjustmentEditPage />
          </Role>
        ),
      },

      {
        path: "items/:id",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <ItemDetailPage />
          </Role>
        ),
      },

      {
        path: "invoice-item-pricing",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <InvoiceItemPricingPage />
          </Role>
        ),
      },

      /*
       * =========================
       * PAYROLL
       * =========================
       */

      {
        path: "payroll",
        element: (
          <Role roles={PAYROLL_ROLES}>
            <PayrollDashboardPage />
          </Role>
        ),
      },

      {
        path: "payroll/employees",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <EmployeesPage />
          </Role>
        ),
      },

      {
        path: "payroll/employees/:employeeId",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <EmployeeDetailPage />
          </Role>
        ),
      },

      {
        path: "payroll/employees/statement",
        element: (
          <Role roles={PAYROLL_ROLES}>
            <EmployeeAccountPage />
          </Role>
        ),
      },

      {
        path: "payroll/opening-balances",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <EmployeeOpeningBalancesPage />
          </Role>
        ),
      },

      {
        path: "payroll/attendance",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <AttendanceTakingPage />
          </Role>
        ),
      },

      {
        path: "payroll/attendance/records",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <AttendancePage />
          </Role>
        ),
      },

      {
        path: "payroll/movements",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <EmployeeMovementsPage />
          </Role>
        ),
      },

      {
        path: "payroll/salaries",
        element: (
          <Role roles={PAYROLL_ROLES}>
            <SalariesPage />
          </Role>
        ),
      },

      {
        path: "payroll/salaries/create",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <BulkCreatePayrollEntriesPage />
          </Role>
        ),
      },

      {
        path: "payroll/salaries/:salaryId",
        element: (
          <Role roles={PAYROLL_ROLES}>
            <SalaryDetailPage />
          </Role>
        ),
      },

      {
        path: "payroll/reports",
        element: (
          <Role roles={PAYROLL_ROLES}>
            <PayrollReportsPage />
          </Role>
        ),
      },

      /*
       * =========================
       * ACCOUNTING
       * =========================
       */

      {
        path: "fiscal-years",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <FiscalYearsListPage />
          </Role>
        ),
      },

      {
        path: "accounts",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <AccountsPage />
          </Role>
        ),
      },

      {
        path: "account-mappings",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <AccountMappingsPage />
          </Role>
        ),
      },

      {
        path: "financial-statements",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <FinancialStatementsPage />
          </Role>
        ),
      },

      {
        path: "journal-entries",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <JournalEntriesListPage />
          </Role>
        ),
      },

      {
        path: "journal-entries/new",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <JournalEntryFormPage />
          </Role>
        ),
      },

      {
        path: "journal-entries/:id",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <JournalEntryFormPage />
          </Role>
        ),
      },

      {
        path: "journal-entries/:id/edit",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <JournalEntryFormPage />
          </Role>
        ),
      },

      {
        path: "trial-balance/before-adjustments",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <BeforeAdjustmentTrialBalancePage />
          </Role>
        ),
      },

      {
        path: "trial-balance/after-adjustments",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <AfterAdjustmentTrialBalancePage />
          </Role>
        ),
      },

      {
        path: "income",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <IncomeStatementPage />
          </Role>
        ),
      },

      {
        path: "financial-position",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <FinancialPositionPage />
          </Role>
        ),
      },

      {
        path: "cash-flow",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <CashFlowPage />
          </Role>
        ),
      },

      /*
       * =========================
       * REPORTS
       * =========================
       */

      {
        path: "reports",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <ComingSoon title="التقارير" />
          </Role>
        ),
      },

      {
        path: "reports/profitability/invoices",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <InvoiceProfitabilityPage />
          </Role>
        ),
      },

      {
        path: "reports/profitability/invoices/:invoiceId",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <InvoiceProfitabilityDetailsPage />
          </Role>
        ),
      },

      {
        path: "reports/profitability/items",
        element: (
          <Role roles={FULL_ACCESS_ROLES}>
            <ItemProfitabilityPage />
          </Role>
        ),
      },

      /*
       * =========================
       * ADMINISTRATION
       * =========================
       */

      {
        path: "permissions",
        element: (
          <Role roles={[ROLES.ADMIN]}>
            <PermissionsPage />
          </Role>
        ),
      },

      /*
       * =========================
       * PROFILE
       * =========================
       */

      {
        path: "profile",
        element: (
          <Role
            roles={[ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.USER, ROLES.CASHIER]}
          >
            <ProfilePage />
          </Role>
        ),
      },

      {
        path: "profile/edit",
        element: (
          <Role
            roles={[ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.USER, ROLES.CASHIER]}
          >
            <EditProfilePage />
          </Role>
        ),
      },
    ],
  },
]);
