// src/features/accounting/pages/AccountMappingsPage.jsx
//
// عدّل الـ import ده لمكان CompactSelect الحقيقي عندك لو مختلف:
import CompactSelect from "../../../shared/components/ui/CompactSelect";

import { useMemo, useState, useEffect } from "react";
import {
  useGetAccountMappingsQuery,
  useSaveAccountMappingsMutation,
  AccountingMappingType,
  SOURCED_MAPPING_TYPES,
} from "../accountMappingsApi";
import { useGetCashboxOptionsQuery } from "../../cashboxes/cashboxesApi";
import { useGetCashMovementTypeOptionsQuery } from "../../cashboxes/cashMovementTypesApi";
import { useGetAccountsSelectQuery } from "../../accounts/accountsApi";
import { useGetFiscalYearsSelectQuery } from "../../fiscalYears/fiscalYearsApi";

// تسميات الأنواع اللي مفردة (بدون مصدر)
const SINGLE_TYPE_LABELS = {
  [AccountingMappingType.Sales]: "المبيعات",
  [AccountingMappingType.Purchase]: "المشتريات",
  [AccountingMappingType.SalesReturn]: "مرتجع المبيعات",
  [AccountingMappingType.PurchaseReturn]: "مرتجع المشتريات",
  [AccountingMappingType.Inventory]: "المخزون",
  [AccountingMappingType.CostOfGoodsSold]: "تكلفة البضاعة المباعة",
  [AccountingMappingType.CustomerControl]: "حساب العملاء الإجمالي",
  [AccountingMappingType.SupplierControl]: "حساب الموردين الإجمالي",
  [AccountingMappingType.EmployeeControl]: "حساب الموظفين الإجمالي",
  [AccountingMappingType.DriverControl]: "حساب السائقين الإجمالي",
  [AccountingMappingType.ExchangeGain]: "أرباح فروق العملة",
  [AccountingMappingType.ExchangeLoss]: "خسائر فروق العملة",
  [AccountingMappingType.InventoryAdjustmentGain]: "أرباح تسوية المخزون",
  [AccountingMappingType.InventoryAdjustmentLoss]: "خسائر تسوية المخزون",
  [AccountingMappingType.OpeningBalanceEquity]: "حقوق ملكية الرصيد الافتتاحي",
  [AccountingMappingType.EmployeeReceivable]: "مديونية الموظفين",
  [AccountingMappingType.DriverTripExpense]: "مصروفات رحلات السائقين",
};

const BADGE_LABELS = {
  [AccountingMappingType.Cashbox]: "الخزائن",
  [AccountingMappingType.CashMovementType]: "أنواع الحركات",
  DEFAULT: "ربط عام",
};

const CASHBOX_ICON_LABEL = "خزينة";
const MOVEMENT_TYPE_CLASSIFICATION_LABEL = {
  Revenue: "قبض",
  Expense: "صرف",
  Partner: "قبض",
  Driver: "قبض",
  Employee: "قبض",
  Personal: "صرف",
};

function buildSourceRows({ cashboxes, cashMovementTypes }) {
  const cashboxRows = (cashboxes ?? []).map((cb) => ({
    key: `${AccountingMappingType.Cashbox}:${cb.id}`,
    mappingType: AccountingMappingType.Cashbox,
    sourceId: cb.id,
    sourceName: cb.name,
    sourceSubLabel: CASHBOX_ICON_LABEL,
  }));

  const movementRows = (cashMovementTypes ?? []).map((mt) => ({
    key: `${AccountingMappingType.CashMovementType}:${mt.id}`,
    mappingType: AccountingMappingType.CashMovementType,
    sourceId: mt.id,
    sourceName: mt.name,
    sourceSubLabel: MOVEMENT_TYPE_CLASSIFICATION_LABEL[mt.classification] ?? "",
  }));

  const singleRows = Object.entries(SINGLE_TYPE_LABELS).map(
    ([mappingType, label]) => ({
      key: mappingType,
      mappingType,
      sourceId: null,
      sourceName: label,
      sourceSubLabel: "",
    }),
  );

  return [...cashboxRows, ...movementRows, ...singleRows];
}

export default function AccountMappingsPage() {
  const { data: fiscalYears } = useGetFiscalYearsSelectQuery();
  const [fiscalYearId, setFiscalYearId] = useState(null);

  useEffect(() => {
    if (!fiscalYearId && fiscalYears?.length) {
      setFiscalYearId(fiscalYears[0].id);
    }
  }, [fiscalYears, fiscalYearId]);

  const selectedFiscalYear = fiscalYears?.find((fy) => fy.id === fiscalYearId);
  const canEdit = selectedFiscalYear?.status === "Open";
  const { data: cashboxes } = useGetCashboxOptionsQuery();
  const { data: cashMovementTypes } = useGetCashMovementTypeOptionsQuery();
  const { data: accountOptionsRaw } = useGetAccountsSelectQuery();

  const {
    data: mappings,
    isLoading,
    isFetching,
  } = useGetAccountMappingsQuery(fiscalYearId, { skip: !fiscalYearId });

  const [saveMappings, { isLoading: isSaving }] =
    useSaveAccountMappingsMutation();

  // { "MappingType:sourceId" -> accountId }
  const [edits, setEdits] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    setEdits({});
  }, [fiscalYearId, mappings]);

  const sourceRows = useMemo(
    () => buildSourceRows({ cashboxes, cashMovementTypes }),
    [cashboxes, cashMovementTypes],
  );

  const savedAccountByKey = useMemo(() => {
    const map = {};
    (mappings ?? []).forEach((m) => {
      const key = SOURCED_MAPPING_TYPES.has(m.mappingType)
        ? `${m.mappingType}:${m.sourceId}`
        : m.mappingType;
      map[key] = m.accountId;
    });
    return map;
  }, [mappings]);

  // /Accounts/select المفروض بيرجّع الحسابات القابلة للترحيل بس (postable+active).
  // لو لأ ضيف .filter((a) => a.isPostable && a.isActive) هنا.
  const accountOptions = useMemo(
    () =>
      (accountOptionsRaw ?? []).map((a) => ({
        value: a.id,
        label: a.code ? `${a.code} · ${a.name}` : a.name,
      })),
    [accountOptionsRaw],
  );

  const fiscalYearOptions = useMemo(
    () =>
      (fiscalYears ?? []).map((fy) => ({
        value: fy.id,
        label: `${fy.name} · ${fy.status === "Open" ? "مفتوحة" : "مغلقة"}`,
      })),
    [fiscalYears],
  );

  const rows = useMemo(() => {
    const q = search.trim();
    return sourceRows
      .map((row) => ({
        ...row,
        accountId: edits[row.key] ?? savedAccountByKey[row.key] ?? null,
        badge: BADGE_LABELS[row.mappingType] ?? BADGE_LABELS.DEFAULT,
      }))
      .filter((row) => {
        if (!q) return true;
        return (
          row.sourceName.includes(q) ||
          row.badge.includes(q) ||
          (row.sourceSubLabel ?? "").includes(q)
        );
      });
  }, [sourceRows, edits, savedAccountByKey, search]);

  const isDirty = Object.keys(edits).length > 0;

  const handleAccountChange = (row, accountId) => {
    setEdits((prev) => ({ ...prev, [row.key]: accountId }));
  };

  const handleSave = async () => {
    // لازم نبعت كل الروابط مع بعض لأن الـ PUT بيستبدلهم دفعة واحدة
    const payload = sourceRows
      .map((row) => ({
        mappingType: row.mappingType,
        sourceId: row.sourceId,
        accountId: edits[row.key] ?? savedAccountByKey[row.key],
      }))
      .filter((m) => !!m.accountId);

    try {
      await saveMappings({ fiscalYearId, mappings: payload }).unwrap();
      setEdits({});
    } catch (err) {
      // اعرض رسالة الخطأ من err.data.errors هنا حسب الـ toast/notification system بتاعك
      console.error("فشل حفظ الربط المحاسبي", err);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 px-8 py-6">
      {/* breadcrumb */}
      <div className="text-xs text-gray-400 mb-2">المحاسبة {">"} إعدادات</div>

      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-900">
          إعدادات الربط المحاسبي
        </h1>
        <button
          type="button"
          disabled={!isDirty || !canEdit || isSaving}
          onClick={handleSave}
          className="bg-emerald-800 disabled:bg-emerald-800/40 disabled:cursor-not-allowed
                     text-white text-sm font-medium px-5 py-2.5 rounded-lg
                     hover:bg-emerald-900 transition-colors"
        >
          {isSaving ? "جارِ الحفظ..." : "حفظ الربط"}
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        اربط الخزائن وأنواع الحركات والفواتير بالحسابات الافتراضية لكل سنة
        مالية.
      </p>

      <div className="bg-white border border-gray-200 rounded-xl mb-4">
        <div className="flex items-center gap-4 p-4">
          <div className="flex items-center gap-3 border border-emerald-100 bg-emerald-50/40 rounded-lg px-4 py-2.5">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                canEdit ? "bg-emerald-600" : "bg-gray-300"
              }`}
            />
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {canEdit ? "السنة مفتوحة" : "السنة مغلقة"}
              </div>
              <div className="text-xs text-gray-400">
                {canEdit ? "يمكن تعديل الربط" : "لا يمكن تعديل الربط"}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">
              بحث في عناصر الربط
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="خزينة، نوع حركة، فاتورة..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                         outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="w-56">
            <label className="block text-xs text-gray-500 mb-1">
              السنة المالية
            </label>
            <CompactSelect
              value={fiscalYearId}
              onChange={setFiscalYearId}
              options={fiscalYearOptions}
              placeholder="اختر السنة المالية..."
            />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 mb-4 text-xs text-gray-500">
        <span className="mt-0.5">ⓘ</span>
        <p>
          الربط الافتراضي يحدد الحساب الذي تستخدمه التقارير لاحقًا. لا يغيّر
          قيمة الفاتورة أو السند. ويمكن حذف أي ربط بتركه بدون حساب ثم الحفظ.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-visible">
        <div className="grid grid-cols-[1fr_140px_1fr] gap-4 px-6 py-3 text-xs text-gray-400 border-b border-gray-100">
          <span>المصدر</span>
          <span className="text-center">نوع الربط</span>
          <span>الحساب الافتراضي</span>
        </div>

        {(isLoading || isFetching) && (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            جارِ التحميل...
          </div>
        )}

        {!isLoading &&
          rows.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-[1fr_140px_1fr] gap-4 items-center px-6 py-3
                         border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60"
            >
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {row.sourceName}
                </div>
                {row.sourceSubLabel && (
                  <div className="text-xs text-gray-400">
                    {row.sourceSubLabel}
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <span className="bg-emerald-50 text-emerald-800 text-xs font-medium px-3 py-1 rounded-full">
                  {row.badge}
                </span>
              </div>

              <CompactSelect
                value={row.accountId}
                onChange={(accountId) => handleAccountChange(row, accountId)}
                options={accountOptions}
                placeholder="اختر الحساب..."
                isDisabled={!canEdit}
              />
            </div>
          ))}

        {!isLoading && rows.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            لا توجد نتائج مطابقة
          </div>
        )}
      </div>
    </div>
  );
}
