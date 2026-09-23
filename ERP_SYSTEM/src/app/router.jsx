import { lazy, Suspense } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import RoleRoute from "../shared/components/RoleRoute";
import DashboardLayout from "../shared/components/layout/DashboardLayout";
import Error404 from "../shared/components/Error404";

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

function DashboardEntry() {
  return (
    <RoleRoute roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
      <DashboardHome />
    </RoleRoute>
  );
}

function DashboardRedirect() {
  return <Navigate to="sales" replace />;
}

function LazyPage({ children }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-ink-400">
          جاري تحميل الصفحة...
        </div>
      }
    >
      {children}
    </Suspense>
  );
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
          <LazyPage>
            <DashboardEntry />
          </LazyPage>
        ),
      },
      {
        path: "home",
        element: (
          <LazyPage>
            <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
              <DashboardHome />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "sales",
        element: (
          <LazyPage>
            <Role roles={INVOICE_ROLES}>
              <SalesPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "sales/new",
        element: (
          <LazyPage>
            <Role roles={INVOICE_ROLES}>
              <InvoiceCreatePage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "sales/:id",
        element: (
          <LazyPage>
            <Role roles={INVOICE_ROLES}>
              <InvoiceDetailsPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "sales/:id/edit",
        element: (
          <LazyPage>
            <Role roles={INVOICE_ROLES}>
              <InvoiceEditPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "purchases/new",
        element: (
          <LazyPage>
            <Role roles={INVOICE_ROLES}>
              <InvoiceCreatePage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "purchases/:id",
        element: (
          <LazyPage>
            <Role roles={INVOICE_ROLES}>
              <InvoiceDetailsPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "purchases/:id/edit",
        element: (
          <LazyPage>
            <Role roles={INVOICE_ROLES}>
              <InvoiceEditPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "partners",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <PartnersListPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "partners/opening-balances",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <PartnerOpeningBalancesPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "partners/statement",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <PartnerAccountPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "partners/countries",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <CountriesPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "partners/:partnerId",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <PartnerDetailPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "stores/containers/:partnerId",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <ContainerStoreStatement />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "drivers",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <DriversListPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "drivers/trip-costs",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <DriverTripCostEntryPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "drivers/statement",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <DriverStatementPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "drivers/:driverId",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <DriverDetailPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "treasury",
        element: (
          <LazyPage>
            <Role roles={TREASURY_ROLES}>
              <CashboxesListPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "treasury/:cashboxId",
        element: (
          <LazyPage>
            <Role roles={TREASURY_ROLES}>
              <CashboxDetailPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "treasury/cash-movement-types",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <CashMovementTypesListPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "treasury/currencies",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <CurrenciesPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "treasury/transfers",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <CashboxTransfersPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "treasury/transfers/:id",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <CashboxTransferDetailsPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "expenses",
        element: (
          <LazyPage>
            <Role roles={EXPENSE_ROLES}>
              <ExpensesPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "stores",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <StoresListPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "stores/:id",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <StoreDetailPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "inventory/containers",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <PackagingUnitsPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "inventory/units",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <UnitsPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "inventory/opening-balances",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <StockOpeningBalancesPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "inventory/stock-transfers",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <StockTransfersPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "inventory/adjustments",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <StockAdjustmentsListPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "inventory/adjustments/new",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <StockAdjustmentCreatePage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "inventory/adjustments/:id",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <StockAdjustmentDetailPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "inventory/adjustments/:id/edit",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <StockAdjustmentEditPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "items/:id",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <ItemDetailPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "invoice-item-pricing",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <InvoiceItemPricingPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "payroll",
        element: (
          <LazyPage>
            <Role roles={PAYROLL_ROLES}>
              <PayrollDashboardPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "payroll/employees",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <EmployeesPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "payroll/employees/:employeeId",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <EmployeeDetailPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "payroll/employees/statement",
        element: (
          <LazyPage>
            <Role roles={PAYROLL_ROLES}>
              <EmployeeAccountPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "payroll/opening-balances",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <EmployeeOpeningBalancesPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "payroll/attendance",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <AttendanceTakingPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "payroll/attendance/records",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <AttendancePage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "payroll/movements",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <EmployeeMovementsPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "payroll/salaries",
        element: (
          <LazyPage>
            <Role roles={PAYROLL_ROLES}>
              <SalariesPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "payroll/salaries/create",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <BulkCreatePayrollEntriesPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "payroll/salaries/:salaryId",
        element: (
          <LazyPage>
            <Role roles={PAYROLL_ROLES}>
              <SalaryDetailPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "payroll/reports",
        element: (
          <LazyPage>
            <Role roles={PAYROLL_ROLES}>
              <PayrollReportsPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "fiscal-years",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <FiscalYearsListPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "accounts",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <AccountsPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "account-mappings",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <AccountMappingsPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "financial-statements",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <FinancialStatementsPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "journal-entries",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <JournalEntriesListPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "journal-entries/new",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <JournalEntryFormPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "journal-entries/:id",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <JournalEntryFormPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "journal-entries/:id/edit",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <JournalEntryFormPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "trial-balance/before-adjustments",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <BeforeAdjustmentTrialBalancePage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "trial-balance/after-adjustments",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <AfterAdjustmentTrialBalancePage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "income",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <IncomeStatementPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "financial-position",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <FinancialPositionPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "cash-flow",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <CashFlowPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "reports",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <ComingSoon title="التقارير" />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "reports/profitability/invoices",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <InvoiceProfitabilityPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "reports/profitability/invoices/:invoiceId",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <InvoiceProfitabilityDetailsPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "reports/profitability/items",
        element: (
          <LazyPage>
            <Role roles={FULL_ACCESS_ROLES}>
              <ItemProfitabilityPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "permissions",
        element: (
          <LazyPage>
            <Role roles={[ROLES.ADMIN]}>
              <PermissionsPage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "profile",
        element: (
          <LazyPage>
            <Role
              roles={[ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.USER, ROLES.CASHIER]}
            >
              <ProfilePage />
            </Role>
          </LazyPage>
        ),
      },
      {
        path: "profile/edit",
        element: (
          <LazyPage>
            <Role
              roles={[ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.USER, ROLES.CASHIER]}
            >
              <EditProfilePage />
            </Role>
          </LazyPage>
        ),
      },
    ],
  },
]);
