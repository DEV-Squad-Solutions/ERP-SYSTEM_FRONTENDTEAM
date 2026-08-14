// features/payroll/pages/AdvancesPage.jsx
//
// TODO INTEGRATION: الجدول ده بيعرض السلف كحركات عادية (نفس نمط الخصومات
// والإضافي). تفاصيل الأقساط الفعلية (مدفوع/متبقي/قسط شهري) مش موجودة في
// EmployeeTransactions schema المبعوت، فبتتعرض في AdvanceDetailPage كـ mock
// لحد ما يتوفر endpoint مخصص للسلف بالأقساط.

import { CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmployeeTransactionsListPage from "../components/EmployeeTransactionsListPage";
import { categoryOptionsFor, advanceCategories } from "../payroll.constants";

export default function AdvancesPage() {
  const navigate = useNavigate();
  return (
    <EmployeeTransactionsListPage
      title="السلف"
      subtitle="سلف الموظفين وأقساطها"
      categoryOptions={categoryOptionsFor(advanceCategories)}
      categoryKeys={advanceCategories}
      emptyIcon={CreditCard}
      emptyLabel="لا توجد سلف"
      onView={(row) => navigate(`/dashboard/payroll/advances/${row.id}`)}
    />
  );
}
