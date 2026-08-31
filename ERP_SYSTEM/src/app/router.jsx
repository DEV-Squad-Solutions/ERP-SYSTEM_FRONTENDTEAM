import { createBrowserRouter } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";

import ProtectedRoute from "../shared/components/ProtectedRoute";
import RoleRoute from "../shared/components/RoleRoute";
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
import EmployeeMovementsPage from "../features/payroll/pages/EmployeeMovementsPage";

import TrialBalancePage from "../features/TrialBalance/pages/TrialBalancePage";

import ContainerStoreStatement from "../features/storeContainers/pages/ContainerStoreStatement";

import ExpensesPage from "../features/expenses/pages/ExpensesPage";

import ItemProfitabilityPage from "../features/reports/pages/ItemProfitabilityPage";
import InvoiceProfitabilityDetailsPage from "../features/reports/pages/InvoiceProfitabilityDetailsPage";
import InvoiceProfitabilityPage from "../features/reports/pages/InvoiceProfitabilityPage";

import StockTransfersPage from "../features/inventory/pages/StockTransfersPage";

import AttendanceTakingPage from "../features/payroll/pages/AttendanceTakingPage";

import EmployeeAccountPage from "../features/statements/pages/EmployeeAccountPage";

import BulkCreatePayrollEntriesPage from "../features/payroll/pages/BulkCreatePayrollEntriesPage";

import EmployeeOpeningBalancesPage from "../features/payroll/pages/EmployeeOpeningBalancesPage";

import InvoiceItemPricingPage from "../features/invoiceItemPricing/pages/InvoiceItemPricingPage";

import CurrenciesPage from "../features/exchange-rates/pages/CurrenciesPage";
import FiscalYearsListPage from "../features/fiscalYears/pages/FiscalYearsListPage";
import ProfilePage from "../features/features/users/pages/ProfilePage";
import EditProfilePage from "../features/features/users/pages/EditProfilePage";

import AccountsPage from "../features/accounts/pages/AccountsPage";

const ROLES = {
  ADMIN: "Admin",
  ACCOUNTANT: "Accountant",
  SALES: "Sales",
  INVENTORY: "Inventory",
  HR: "HR",
};

function Role({ roles, children }) {
  return <RoleRoute roles={roles}>{children} </RoleRoute>;
}

function ComingSoon({ title }) {
  return (
    <div className="py-20 text-center text-gray-400">
      {" "}
      <p className="text-lg">{title}</p>{" "}
      <p className="mt-1 text-sm">هذه الصفحة قيد التطوير</p>{" "}
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

      // ============================================================
      // المبيعات والمشتريات
      // ============================================================

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

      // ============================================================
      // العملاء والموردين
      // (قائمة -> أرصدة افتتاحية -> كشف حساب -> الدول)
      // ============================================================

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

      // ============================================================
      // السائقين
      // (قائمة -> مصاريف الرحلات -> كشف حساب)
      // ============================================================

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

      // ============================================================
      // الخزائن والبنوك
      // (خزائن -> أنواع حركات -> عملات -> تحويلات)
      // ============================================================

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
        path: "bank",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <BankPage />
          </Role>
        ),
      },

      // ============================================================
      // المخازن
      // (قائمة -> عبوات -> وحدات -> أرصدة -> تحويلات -> تسويات)
      // ============================================================

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

      // ============================================================
      // الأجور والمرتبات
      // (لوحة تحكم -> موظفين -> أرصدة -> حضور -> حركات -> مرتبات -> كشف حساب)
      // ============================================================

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
        path: "payroll/employees/:employeeId",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.HR, ROLES.ACCOUNTANT]}>
            <EmployeeDetailPage />
          </Role>
        ),
      },

      // ============================================================
      // المحاسبة
      // ============================================================

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
        path: "statements/operational-trial-balance",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <ComingSoon title="ميزان المراجعة قبل التسوية" />
          </Role>
        ),
      },

      {
        path: "adjusted-trial-balance",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <TrialBalancePage />
          </Role>
        ),
      },

      {
        path: "income",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <ComingSoon title="تقارير الدخل" />
          </Role>
        ),
      },

      {
        path: "financial-position",
        element: (
          <Role roles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
            <ComingSoon title="تقارير المركز المالي" />
          </Role>
        ),
      },

      // ============================================================
      // التقارير
      // ============================================================

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

      // ============================================================
      // الإدارة
      // ============================================================

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
