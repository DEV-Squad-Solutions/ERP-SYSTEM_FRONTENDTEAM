// features/statements/components/EmployeeSelectHeader.jsx
import { useMemo, useCallback } from "react";
import { useGetEmployeesSelectQuery } from "../../payroll/payrollApi";
import CompactSelect from "../../../shared/components/ui/CompactSelect";

export default function EmployeeSelectHeader({ employeeId, onChange }) {
  const { data, isLoading, isFetching } = useGetEmployeesSelectQuery();

  const normalizedId = employeeId || null;

  const options = useMemo(() => {
    const items = data || [];
    return items.map((emp) => ({
      value: String(emp.id),
      label: emp.code ? `${emp.name} (${emp.code})` : emp.name,
    }));
  }, [data]);

  const handleChange = useCallback(
    (val) => {
      onChange(val || "");
    },
    [onChange],
  );

  return (
    <CompactSelect
      options={options}
      value={normalizedId}
      onChange={handleChange}
      isLoading={isLoading || isFetching}
      placeholder="اختر موظف لعرض كشف حسابه"
    />
  );
}
