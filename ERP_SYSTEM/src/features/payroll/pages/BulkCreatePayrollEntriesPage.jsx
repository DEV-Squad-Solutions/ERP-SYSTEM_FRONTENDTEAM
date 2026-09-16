import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import { toast } from "sonner";
import {
  Search,
  RotateCcw,
  Check,
  Users,
  UserCheck,
  Plus,
  Minus,
  Save,
  CalendarDays,
  ArrowDownUp,
  Loader2,
  CheckCircle2,
  X,
  ArrowRight,
  Clock3,
  Timer,
  Ban,
  Building2,
  Building,
} from "lucide-react";

import {
  useBulkCreatePayrollEntriesMutation,
  useGetEmployeesSelectQuery,
} from "../payrollApi";

import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? number : 0;
}

export default function BulkCreatePayrollEntriesPage() {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(getToday()); // بيتستخدم لخارج الشركة بس
  const [endDate, setEndDate] = useState(getToday());
  const [workPlaceStatus, setWorkPlaceStatus] = useState("InCompany");

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const [amounts, setAmounts] = useState({});

  const [bulkPresentDays, setBulkPresentDays] = useState("");
  const [bulkWorkedDaysByDayUnit, setBulkWorkedDaysByDayUnit] = useState("");
  const [bulkOvertimeByDayUnit, setBulkOvertimeByDayUnit] = useState("");
  const [bulkDeductionByDayUnit, setBulkDeductionByDayUnit] = useState("");
  const [bulkBonus, setBulkBonus] = useState("");
  const [bulkDeduction, setBulkDeduction] = useState("");

  const isOutCompany = workPlaceStatus === "OutCompany";

  const handleWorkPlaceStatusChange = (status) => {
    if (status === workPlaceStatus) return;

    setWorkPlaceStatus(status);
    setSelectedIds([]);
    setAmounts({});
  };

  // الموظفين بيظهروا فورًا حسب التاب المختار، من غير أي شرط على الفترة
  const { data: employees, isLoading: employeesLoading } =
    useGetEmployeesSelectQuery({ WorkPlaceStatus: workPlaceStatus });

  const [bulkCreate, { isLoading: isSaving }] =
    useBulkCreatePayrollEntriesMutation();

  const employeeRows = useMemo(() => {
    return (employees || []).map((employee) => {
      const id = String(employee.id);

      return {
        ...employee,
        id,
        presentDays: normalizeNumber(amounts[id]?.presentDays),
        workedDaysByDayUnit: normalizeNumber(amounts[id]?.workedDaysByDayUnit),
        overtimeByDayUnit: normalizeNumber(amounts[id]?.overtimeByDayUnit),
        deductionByDayUnit: normalizeNumber(amounts[id]?.deductionByDayUnit),
        bonus: normalizeNumber(amounts[id]?.bonus),
        deduction: normalizeNumber(amounts[id]?.deduction),
      };
    });
  }, [employees, amounts]);

  const filteredRows = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return employeeRows;
    }

    return employeeRows.filter((employee) => {
      const name = String(employee.name || "").toLowerCase();
      const id = String(employee.id || "").toLowerCase();

      return name.includes(value) || id.includes(value);
    });
  }, [employeeRows, search]);

  const scrollContainerRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 64,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;

  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0;

  const selectedRows = useMemo(() => {
    const selectedSet = new Set(selectedIds);

    return employeeRows.filter((employee) =>
      selectedSet.has(String(employee.id)),
    );
  }, [employeeRows, selectedIds]);

  const summary = useMemo(() => {
    const totalPresentDays = selectedRows.reduce(
      (sum, employee) => sum + normalizeNumber(employee.presentDays),
      0,
    );

    const totalWorkedDaysByDayUnit = selectedRows.reduce(
      (sum, employee) => sum + normalizeNumber(employee.workedDaysByDayUnit),
      0,
    );

    const totalOvertimeByDayUnit = selectedRows.reduce(
      (sum, employee) => sum + normalizeNumber(employee.overtimeByDayUnit),
      0,
    );

    const totalDeductionByDayUnit = selectedRows.reduce(
      (sum, employee) => sum + normalizeNumber(employee.deductionByDayUnit),
      0,
    );

    const totalBonus = selectedRows.reduce(
      (sum, employee) => sum + normalizeNumber(employee.bonus),
      0,
    );

    const totalDeduction = selectedRows.reduce(
      (sum, employee) => sum + normalizeNumber(employee.deduction),
      0,
    );

    return {
      total: employeeRows.length,
      selected: selectedRows.length,
      totalPresentDays,
      totalWorkedDaysByDayUnit,
      totalOvertimeByDayUnit,
      totalDeductionByDayUnit,
      totalBonus,
      totalDeduction,
      netAdjustments: totalBonus - totalDeduction,
    };
  }, [employeeRows, selectedRows]);

  const allFilteredSelected = useMemo(() => {
    if (!filteredRows.length) {
      return false;
    }

    const selectedSet = new Set(selectedIds);

    return filteredRows.every((employee) =>
      selectedSet.has(String(employee.id)),
    );
  }, [filteredRows, selectedIds]);

  useEffect(() => {
    const validIds = new Set(
      employeeRows.map((employee) => String(employee.id)),
    );

    setSelectedIds((current) =>
      current.filter((id) => validIds.has(String(id))),
    );
  }, [employeeRows]);

  const toggleEmployee = (id) => {
    const normalizedId = String(id);

    setSelectedIds((current) =>
      current.includes(normalizedId)
        ? current.filter((item) => item !== normalizedId)
        : [...current, normalizedId],
    );
  };

  const selectAllFiltered = () => {
    const ids = filteredRows.map((employee) => String(employee.id));

    setSelectedIds((current) => Array.from(new Set([...current, ...ids])));
  };

  const removeFilteredSelection = () => {
    const ids = new Set(filteredRows.map((employee) => String(employee.id)));

    setSelectedIds((current) => current.filter((id) => !ids.has(id)));
  };

  const selectAllEmployees = () => {
    setSelectedIds(employeeRows.map((employee) => String(employee.id)));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const updateAmount = (employeeId, field, value) => {
    const id = String(employeeId);

    setAmounts((current) => ({
      ...current,
      [id]: {
        ...(current[id] || {}),
        [field]: value,
      },
    }));
  };

  const applyBulkAmount = (field, value, label) => {
    if (!selectedIds.length) {
      toast.error("اختر الموظفين أولاً");
      return;
    }

    const normalizedValue = normalizeNumber(value);

    setAmounts((current) => {
      const next = { ...current };

      selectedIds.forEach((id) => {
        next[id] = {
          ...(next[id] || {}),
          [field]: normalizedValue,
        };
      });

      return next;
    });

    toast.success(`تم تطبيق ${label} على ${selectedIds.length} موظف`);
  };

  const resetPage = () => {
    setStartDate(getToday());
    setEndDate(getToday());
    setWorkPlaceStatus("InCompany");
    setSearch("");
    setSelectedIds([]);
    setAmounts({});

    setBulkPresentDays("");
    setBulkWorkedDaysByDayUnit("");
    setBulkOvertimeByDayUnit("");
    setBulkDeductionByDayUnit("");
    setBulkBonus("");
    setBulkDeduction("");
  };

  const handleSubmit = async () => {
    if (!endDate) {
      toast.error("حدد تاريخ المرتب أولاً");
      return;
    }

    if (isOutCompany) {
      if (!startDate) {
        toast.error("حدد فترة المرتب (من) للموظفين خارج الشركة");
        return;
      }

      if (new Date(startDate) > new Date(endDate)) {
        toast.error("تاريخ البداية لا يمكن أن يكون بعد تاريخ النهاية");
        return;
      }
    }

    if (!selectedIds.length) {
      toast.error("حدد موظفًا واحدًا على الأقل لإنشاء المرتب");
      return;
    }

    const entries = selectedRows.map((employee) => {
      const entry = {
        employeeId: Number(employee.id),
        presentDays: normalizeNumber(employee.presentDays),
        workedDaysByDayUnit: normalizeNumber(employee.workedDaysByDayUnit),
        endDate,
        overtimeByDayUnit: normalizeNumber(employee.overtimeByDayUnit),
        deductionByDayUnit: normalizeNumber(employee.deductionByDayUnit),
        bonus: normalizeNumber(employee.bonus),
        deduction: normalizeNumber(employee.deduction),
      };

      // "من" بتتبعت لخارج الشركة بس - داخل الشركة مالهاش لازمة
      if (isOutCompany) {
        entry.startDate = startDate;
      }

      return entry;
    });

    const payload = {
      entries,
      defaultEndDate: endDate,
      ...(isOutCompany ? { defaultStartDate: startDate } : {}),
    };

    try {
      await bulkCreate(payload).unwrap();

      toast.success(`تم إنشاء قيود مرتبات ${selectedIds.length} موظف بنجاح`);

      navigate("/dashboard/payroll/salaries");
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.data?.title ||
          error?.data?.detail ||
          "حدث خطأ أثناء إنشاء قيود المرتبات",
      );
    }
  };

  return (
    <div className="animate-fadeUp space-y-4" dir="rtl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard/payroll/salaries")}
              className="w-8 h-8 rounded-lg border border-ink-400/10 flex items-center justify-center text-ink-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <ArrowRight size={15} />
            </button>

            <div>
              <h2 className="font-display text-2xl font-bold text-ink-900">
                إنشاء قيود المرتبات
              </h2>

              <p className="text-sm text-ink-400 mt-1">
                اختر الموظفين وحدد بيانات الحضور والعمل والتعديلات
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetPage} disabled={isSaving}>
            <RotateCcw size={15} />
            إعادة ضبط
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSaving || employeesLoading || !selectedIds.length}
          >
            {isSaving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}

            {isSaving
              ? "جارِ الإنشاء..."
              : `إنشاء المرتبات${
                  selectedIds.length ? ` (${selectedIds.length})` : ""
                }`}
          </Button>
        </div>
      </div>

      {/* تبويب داخل الشركة / خارج الشركة */}
      <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card p-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-xs font-semibold text-ink-900 shrink-0">
            مكان العمل
          </p>

          <div className="inline-flex rounded-lg border border-ink-400/15 p-0.5 bg-ink-900/[0.02] w-fit">
            <button
              type="button"
              onClick={() => handleWorkPlaceStatusChange("InCompany")}
              className={`flex items-center gap-1.5 px-4 h-8 rounded-md text-xs font-medium transition-colors ${
                workPlaceStatus === "InCompany"
                  ? "bg-primary-500 text-white"
                  : "text-ink-400 hover:text-ink-700"
              }`}
            >
              <Building size={13} />
              داخل الشركة
            </button>

            <button
              type="button"
              onClick={() => handleWorkPlaceStatusChange("OutCompany")}
              className={`flex items-center gap-1.5 px-4 h-8 rounded-md text-xs font-medium transition-colors ${
                workPlaceStatus === "OutCompany"
                  ? "bg-primary-500 text-white"
                  : "text-ink-400 hover:text-ink-700"
              }`}
            >
              <Building2 size={13} />
              خارج الشركة
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        <div className="col-span-2 md:col-span-2 xl:col-span-2 rounded-2xl border border-ink-400/10 bg-white shadow-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays size={15} className="text-primary-500" />

            <p className="text-xs font-semibold text-ink-900">
              {isOutCompany ? "فترة المرتب" : "تاريخ المرتب"}
            </p>
          </div>

          <div
            className={`grid gap-2 ${isOutCompany ? "grid-cols-2" : "grid-cols-1"}`}
          >
            {isOutCompany && (
              <div>
                <label className="block text-[11px] font-medium text-ink-400 mb-1">
                  من
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full h-9 rounded-lg border border-ink-400/15 bg-white px-2 text-sm num outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-ink-400 mb-1">
                {isOutCompany ? "إلى" : "التاريخ"}
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full h-9 rounded-lg border border-ink-400/15 bg-white px-2 text-sm num outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <SummaryCard
          icon={Users}
          label="إجمالي الموظفين"
          value={summary.total}
        />

        <SummaryCard
          icon={UserCheck}
          label="المحدد"
          value={summary.selected}
          tone="positive"
        />

        <SummaryCard
          icon={Clock3}
          label="أيام الحضور"
          value={summary.totalPresentDays.toFixed(2)}
        />

        <SummaryCard
          icon={Timer}
          label="أيام العمل"
          value={summary.totalWorkedDaysByDayUnit.toFixed(2)}
        />

        <SummaryCard
          icon={ArrowDownUp}
          label="الإضافات"
          value={summary.totalBonus.toFixed(2)}
          tone="positive"
        />

        <SummaryCard
          icon={Minus}
          label="الخصومات"
          value={summary.totalDeduction.toFixed(2)}
          tone="negative"
        />
      </div>

      <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-ink-400 mb-1">
              البحث عن موظف
            </label>

            <div className="relative">
              <Search
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث باسم الموظف أو الرقم..."
                className="w-full h-9 rounded-lg border border-ink-400/15 bg-white pr-9 pl-3 text-sm outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full h-9"
              onClick={() => setSearch("")}
              disabled={!search}
            >
              <RotateCcw size={14} />
              تصفير البحث
            </Button>
          </div>

          <div className="flex items-end">
            <div className="text-xs text-ink-400 w-full h-9 flex items-center justify-end">
              <span>
                عرض{" "}
                <strong className="text-ink-900">{filteredRows.length}</strong>{" "}
                من{" "}
                <strong className="text-ink-900">{employeeRows.length}</strong>{" "}
                موظف
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-primary-500/15 bg-primary-50/40 p-3">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-600 flex items-center justify-center">
              <Users size={17} />
            </div>

            <div>
              <p className="text-sm font-semibold text-ink-900">
                اختيار الموظفين
              </p>

              <p className="text-[11px] text-ink-400">
                المحدد حاليًا:{" "}
                <span className="font-semibold text-primary-600">
                  {selectedIds.length}
                </span>{" "}
                موظف
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="h-9"
              onClick={selectAllEmployees}
              disabled={!employeeRows.length}
            >
              <CheckCircle2 size={14} />
              تحديد الكل
            </Button>

            <Button
              variant="outline"
              className="h-9"
              onClick={selectAllFiltered}
              disabled={!filteredRows.length}
            >
              <Check size={14} />
              تحديد الظاهر
            </Button>

            <Button
              variant="outline"
              className="h-9"
              onClick={removeFilteredSelection}
              disabled={!filteredRows.length}
            >
              <X size={14} />
              إلغاء الظاهر
            </Button>

            <Button
              variant="outline"
              className="h-9"
              onClick={clearSelection}
              disabled={!selectedIds.length}
            >
              <RotateCcw size={14} />
              إلغاء الكل
            </Button>
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card p-3">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold text-ink-900">
                إجراءات جماعية
              </p>

              <p className="text-[11px] text-ink-400 mt-1">
                تطبيق قيم موحدة على الموظفين المحددين
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
              <Input
                label="أيام الحضور"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={bulkPresentDays}
                onChange={(event) => setBulkPresentDays(event.target.value)}
              />

              <Input
                label="أيام العمل"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={bulkWorkedDaysByDayUnit}
                onChange={(event) =>
                  setBulkWorkedDaysByDayUnit(event.target.value)
                }
              />

              <Input
                label="الإضافي باليوم"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={bulkOvertimeByDayUnit}
                onChange={(event) =>
                  setBulkOvertimeByDayUnit(event.target.value)
                }
              />

              <Input
                label="خصم باليوم"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={bulkDeductionByDayUnit}
                onChange={(event) =>
                  setBulkDeductionByDayUnit(event.target.value)
                }
              />

              <Input
                label="إضافة مالية"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={bulkBonus}
                onChange={(event) => setBulkBonus(event.target.value)}
              />

              <Input
                label="خصم مالي"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={bulkDeduction}
                onChange={(event) => setBulkDeduction(event.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="h-9"
                onClick={() =>
                  applyBulkAmount("presentDays", bulkPresentDays, "أيام الحضور")
                }
              >
                <Check size={14} />
                تطبيق الحضور
              </Button>

              <Button
                variant="outline"
                className="h-9"
                onClick={() =>
                  applyBulkAmount(
                    "workedDaysByDayUnit",
                    bulkWorkedDaysByDayUnit,
                    "أيام العمل",
                  )
                }
              >
                <Clock3 size={14} />
                تطبيق العمل
              </Button>

              <Button
                variant="outline"
                className="h-9"
                onClick={() =>
                  applyBulkAmount(
                    "overtimeByDayUnit",
                    bulkOvertimeByDayUnit,
                    "الإضافي",
                  )
                }
              >
                <Timer size={14} />
                تطبيق الإضافي
              </Button>

              <Button
                variant="outline"
                className="h-9"
                onClick={() =>
                  applyBulkAmount(
                    "deductionByDayUnit",
                    bulkDeductionByDayUnit,
                    "خصم الأيام",
                  )
                }
              >
                <Ban size={14} />
                تطبيق خصم الأيام
              </Button>

              <Button
                variant="outline"
                className="h-9"
                onClick={() =>
                  applyBulkAmount("bonus", bulkBonus, "الإضافة المالية")
                }
              >
                <Plus size={14} />
                تطبيق الإضافة
              </Button>

              <Button
                variant="outline"
                className="h-9"
                onClick={() =>
                  applyBulkAmount("deduction", bulkDeduction, "الخصم المالي")
                }
              >
                <Minus size={14} />
                تطبيق الخصم
              </Button>
            </div>
          </div>
        </div>
      )}

      {employeesLoading ? (
        <PayrollTableSkeleton />
      ) : !filteredRows.length ? (
        <div className="text-center py-16 border border-dashed border-ink-400/20 rounded-2xl">
          <Users size={30} className="mx-auto text-ink-400/50 mb-3" />

          <p className="text-ink-900 font-medium text-sm">لا توجد نتائج</p>

          <p className="text-xs text-ink-400 mt-1">جرّب تغيير كلمة البحث</p>
        </div>
      ) : (
        <>
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto overflow-y-auto max-h-[65vh] custom-scroll rounded-2xl border border-ink-400/10 bg-white shadow-card"
          >
            <table className="w-full text-right border-collapse min-w-[1450px]">
              <thead className="sticky top-0 z-[1] bg-white">
                <tr className="bg-ink-900/[0.03] text-ink-400 text-[11px]">
                  <th className="p-2.5 w-10">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectAllFiltered();
                        } else {
                          removeFilteredSelection();
                        }
                      }}
                      className="accent-primary-500"
                    />
                  </th>

                  <th className="p-2.5 font-medium">الموظف</th>

                  <th className="p-2.5 font-medium">أيام الحضور</th>

                  <th className="p-2.5 font-medium">أيام العمل</th>

                  <th className="p-2.5 font-medium">الإضافي باليوم</th>

                  <th className="p-2.5 font-medium">خصم باليوم</th>

                  <th className="p-2.5 font-medium">الإضافات</th>

                  <th className="p-2.5 font-medium">الخصومات</th>

                  <th className="p-2.5 font-medium">صافي التعديلات</th>

                  <th className="p-2.5 font-medium text-center">الحالة</th>
                </tr>
              </thead>

              <tbody>
                {paddingTop > 0 && (
                  <tr aria-hidden="true">
                    <td colSpan={10} style={{ height: paddingTop }} />
                  </tr>
                )}

                {virtualRows.map((virtualRow) => {
                  const employee = filteredRows[virtualRow.index];

                  const selected = selectedIds.includes(employee.id);

                  const net =
                    normalizeNumber(employee.bonus) -
                    normalizeNumber(employee.deduction);

                  return (
                    <tr
                      key={employee.id}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className={`border-b border-ink-400/5 last:border-0 transition-colors ${
                        selected ? "bg-primary-50/50" : "hover:bg-primary-50/20"
                      }`}
                    >
                      <td className="p-2.5">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleEmployee(employee.id)}
                          className="accent-primary-500"
                        />
                      </td>

                      <td className="p-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                            <Users size={15} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-medium text-ink-900 truncate max-w-[220px]">
                              {employee.name}
                            </p>

                            <p className="text-[10px] text-ink-400 num">
                              #{employee.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={amounts[employee.id]?.presentDays ?? ""}
                          onChange={(event) =>
                            updateAmount(
                              employee.id,
                              "presentDays",
                              event.target.value,
                            )
                          }
                          placeholder="0"
                          className="h-9 w-28 rounded-lg border border-ink-400/15 px-2.5 text-sm num outline-none focus:border-primary-500 transition-colors"
                        />
                      </td>

                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            amounts[employee.id]?.workedDaysByDayUnit ?? ""
                          }
                          onChange={(event) =>
                            updateAmount(
                              employee.id,
                              "workedDaysByDayUnit",
                              event.target.value,
                            )
                          }
                          placeholder="0"
                          className="h-9 w-28 rounded-lg border border-ink-400/15 px-2.5 text-sm num outline-none focus:border-primary-500 transition-colors"
                        />
                      </td>

                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={amounts[employee.id]?.overtimeByDayUnit ?? ""}
                          onChange={(event) =>
                            updateAmount(
                              employee.id,
                              "overtimeByDayUnit",
                              event.target.value,
                            )
                          }
                          placeholder="0"
                          className="h-9 w-28 rounded-lg border border-ink-400/15 px-2.5 text-sm num outline-none focus:border-primary-500 transition-colors"
                        />
                      </td>

                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={amounts[employee.id]?.deductionByDayUnit ?? ""}
                          onChange={(event) =>
                            updateAmount(
                              employee.id,
                              "deductionByDayUnit",
                              event.target.value,
                            )
                          }
                          placeholder="0"
                          className="h-9 w-28 rounded-lg border border-ink-400/15 px-2.5 text-sm num outline-none focus:border-primary-500 transition-colors"
                        />
                      </td>

                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={amounts[employee.id]?.bonus ?? ""}
                          onChange={(event) =>
                            updateAmount(
                              employee.id,
                              "bonus",
                              event.target.value,
                            )
                          }
                          placeholder="0.00"
                          className="h-9 w-32 rounded-lg border border-ink-400/15 px-2.5 text-sm num outline-none focus:border-primary-500 transition-colors"
                        />
                      </td>

                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={amounts[employee.id]?.deduction ?? ""}
                          onChange={(event) =>
                            updateAmount(
                              employee.id,
                              "deduction",
                              event.target.value,
                            )
                          }
                          placeholder="0.00"
                          className="h-9 w-32 rounded-lg border border-ink-400/15 px-2.5 text-sm num outline-none focus:border-primary-500 transition-colors"
                        />
                      </td>

                      <td className="p-2.5">
                        <span
                          className={`text-sm font-semibold num ${
                            net > 0
                              ? "text-positive"
                              : net < 0
                                ? "text-negative"
                                : "text-ink-400"
                          }`}
                        >
                          {net.toFixed(2)}
                        </span>
                      </td>

                      <td className="p-2.5 text-center">
                        {selected ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-positive/10 text-positive px-2.5 py-1 text-[10px] font-semibold">
                            <Check size={11} />
                            سيتم الإنشاء
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-ink-400/10 text-ink-400 px-2.5 py-1 text-[10px] font-medium">
                            <X size={11} />
                            غير محدد
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {paddingBottom > 0 && (
                  <tr aria-hidden="true">
                    <td colSpan={10} style={{ height: paddingBottom }} />
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="sticky bottom-3 z-10">
            <div className="rounded-2xl border border-ink-400/10 bg-white/95 backdrop-blur shadow-lg p-3">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-400">
                  <span>
                    {isOutCompany ? (
                      <>
                        الفترة:
                        <strong className="text-ink-900 mx-1">
                          {startDate}
                        </strong>
                        إلى
                        <strong className="text-ink-900 mx-1">{endDate}</strong>
                      </>
                    ) : (
                      <>
                        التاريخ:
                        <strong className="text-ink-900 mx-1">{endDate}</strong>
                      </>
                    )}
                  </span>

                  <span>
                    المحدد:
                    <strong className="text-primary-600 mx-1">
                      {summary.selected}
                    </strong>
                    موظف
                  </span>

                  <span>
                    الحضور:
                    <strong className="text-ink-900 mx-1 num">
                      {summary.totalPresentDays.toFixed(2)}
                    </strong>
                  </span>

                  <span>
                    العمل:
                    <strong className="text-ink-900 mx-1 num">
                      {summary.totalWorkedDaysByDayUnit.toFixed(2)}
                    </strong>
                  </span>

                  <span>
                    الإضافي:
                    <strong className="text-primary-600 mx-1 num">
                      {summary.totalOvertimeByDayUnit.toFixed(2)}
                    </strong>
                  </span>

                  <span>
                    خصم الأيام:
                    <strong className="text-negative mx-1 num">
                      {summary.totalDeductionByDayUnit.toFixed(2)}
                    </strong>
                  </span>

                  <span>
                    الإضافات:
                    <strong className="text-positive mx-1 num">
                      {summary.totalBonus.toFixed(2)}
                    </strong>
                  </span>

                  <span>
                    الخصومات:
                    <strong className="text-negative mx-1 num">
                      {summary.totalDeduction.toFixed(2)}
                    </strong>
                  </span>

                  <span>
                    صافي التعديلات:
                    <strong
                      className={`mx-1 num ${
                        summary.netAdjustments >= 0
                          ? "text-positive"
                          : "text-negative"
                      }`}
                    >
                      {summary.netAdjustments.toFixed(2)}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={clearSelection}
                    disabled={isSaving || !selectedIds.length}
                  >
                    <X size={14} />
                    إلغاء التحديد
                  </Button>

                  <Button
                    onClick={handleSubmit}
                    disabled={
                      isSaving || employeesLoading || !selectedIds.length
                    }
                  >
                    {isSaving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}

                    {isSaving
                      ? "جارِ الإنشاء..."
                      : `إنشاء ${selectedIds.length || ""} مرتب`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl border border-ink-400/10 bg-white p-3 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-400 mb-1">{label}</p>

          <p
            className={`text-lg font-bold num ${
              tone === "positive"
                ? "text-positive"
                : tone === "negative"
                  ? "text-negative"
                  : "text-ink-900"
            }`}
          >
            {value}
          </p>
        </div>

        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            tone === "positive"
              ? "bg-positive/10 text-positive"
              : tone === "negative"
                ? "bg-negative/10 text-negative"
                : "bg-ink-400/10 text-ink-400"
          }`}
        >
          <Icon size={16} />
        </div>
      </div>
    </div>
  );
}

function PayrollTableSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-400/10 bg-white shadow-card overflow-hidden">
      <div className="h-11 bg-ink-900/[0.03] border-b border-ink-400/10" />

      <div className="divide-y divide-ink-400/5">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-3 py-3">
            <div className="h-4 w-4 rounded bg-ink-400/10 animate-pulse" />

            <div className="h-9 w-9 rounded-xl bg-ink-400/10 animate-pulse" />

            <div className="h-3.5 w-40 rounded bg-ink-400/10 animate-pulse" />

            <div className="h-9 w-28 rounded-lg bg-ink-400/10 animate-pulse" />

            <div className="h-9 w-28 rounded-lg bg-ink-400/10 animate-pulse" />

            <div className="h-9 w-28 rounded-lg bg-ink-400/10 animate-pulse" />

            <div className="h-9 w-28 rounded-lg bg-ink-400/10 animate-pulse" />

            <div className="h-9 w-32 rounded-lg bg-ink-400/10 animate-pulse" />

            <div className="h-9 w-32 rounded-lg bg-ink-400/10 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
