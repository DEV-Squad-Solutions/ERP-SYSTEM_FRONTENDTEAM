// features/payroll/pages/OvertimePage.jsx
import { Timer } from "lucide-react";
import EmployeeTransactionsListPage from "../components/EmployeeTransactionsListPage";
import {
  categoryOptionsFor,
  overtimeAllowanceCategories,
} from "../payroll.constants";

export default function OvertimePage() {
  return (
    <EmployeeTransactionsListPage
      title="الإضافي والبدلات"
      subtitle="ساعات إضافية، بدلات، مكافآت وحوافز الموظفين"
      categoryOptions={categoryOptionsFor(overtimeAllowanceCategories)}
      categoryKeys={overtimeAllowanceCategories}
      emptyIcon={Timer}
      emptyLabel="لا توجد حركات إضافي أو بدلات"
    />
  );
}
