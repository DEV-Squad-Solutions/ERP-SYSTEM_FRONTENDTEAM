// features/statements/pages/EmployeeAccountPage.jsx
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Wallet } from "lucide-react";
import { useGetEmployeeStatementQuery } from "../employeeStatementApi";
import EmployeeSelectHeader from "../components/EmployeeSelectHeader";
import EmployeeStatementFilters from "../components/EmployeeStatementFilters";
import EmployeeStatementTable from "../components/EmployeeStatementTable";

const EMPTY_FILTERS = {
  Search: "",
  FromDate: "",
  ToDate: "",
  SourceType: "",
  MovementType: "",
};

export default function EmployeeAccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId") || "";

  const [filters, setFilters] = useState({
    draft: { ...EMPTY_FILTERS },
    applied: { ...EMPTY_FILTERS },
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const statementParams = useMemo(
    () => ({
      EmployeeId: employeeId,
      PageNumber: page,
      PageSize: pageSize,
      ...filters.applied,
    }),
    [employeeId, page, pageSize, filters.applied],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetEmployeeStatementQuery(statementParams, {
      skip: !employeeId,
    });

  const handleEmployeeChange = useCallback(
    (id) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (id) next.set("employeeId", id);
        else next.delete("employeeId");
        return next;
      });
      setPage(1);
      setFilters({
        draft: { ...EMPTY_FILTERS },
        applied: { ...EMPTY_FILTERS },
      });
    },
    [setSearchParams],
  );

  const handleFilterChange = useCallback((value) => {
    setFilters((prev) => ({ ...prev, draft: value }));
  }, []);

  const handleSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, applied: prev.draft }));
    setPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setFilters({ draft: { ...EMPTY_FILTERS }, applied: { ...EMPTY_FILTERS } });
    setPage(1);
  }, []);

  const handlePageSizeChange = useCallback((size) => {
    setPageSize(size);
    setPage(1);
  }, []);

  return (
    <div className="min-w-0 animate-fadeUp">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold text-ink-900 sm:text-2xl">
            كشف حساب موظف
          </h2>
          <p className="mt-0.5 text-xs text-ink-400 sm:text-sm">
            كشف حساب متكامل بالسلف والخصومات والمكافآت وتحويلات الراتب
          </p>
        </div>
        <div className="flex-1">
          <EmployeeSelectHeader
            employeeId={employeeId}
            onChange={handleEmployeeChange}
          />
        </div>
      </div>

      {/* Empty state */}
      {!employeeId ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-ink-400/20 bg-white/40 px-6 text-center">
          <div>
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500/10">
              <Wallet size={20} className="text-primary-500" />
            </div>
            <p className="text-sm font-medium text-ink-700">اختر موظف</p>
            <p className="mt-1 text-xs text-ink-400">لعرض كشف حسابه المالي</p>
          </div>
        </div>
      ) : (
        <div className="min-w-0 space-y-3">
          <EmployeeStatementFilters
            draft={filters.draft}
            onChange={handleFilterChange}
            onSearch={handleSearch}
            onReset={handleReset}
          />
          <div className="min-w-0">
            <EmployeeStatementTable
              data={data}
              isLoading={isLoading}
              isFetching={isFetching}
              isError={isError}
              refetch={refetch}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
