// features/payroll/pages/DeductionsPage.jsx
import { MinusCircle } from "lucide-react";
import EmployeeTransactionsListPage from "../components/EmployeeTransactionsListPage";
import { categoryOptionsFor, deductionCategories } from "../payroll.constants";

export default function DeductionsPage() {
  return (
    <EmployeeTransactionsListPage
      title="الخصومات"
      subtitle="خصومات الغياب والتأخير والجزاءات"
      categoryOptions={categoryOptionsFor(deductionCategories)}
      categoryKeys={deductionCategories}
      emptyIcon={MinusCircle}
      emptyLabel="لا توجد خصومات"
    />
  );
}
