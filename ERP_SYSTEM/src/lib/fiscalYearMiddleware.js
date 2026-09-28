import { baseApi } from "./baseApi";
import {
  setFiscalYears,
  setSelectedFiscalYearId,
  fiscalYearRefreshRequested,
} from "../features/fiscalYears/fiscalYearSlice";

/**
 * ليه محتاجين الميدل وير ده؟
 *
 * baseQueryWithReauth بيحقن fiscalYearId جوه الـ params وقت التنفيذ
 * الفعلي للطلب، مش قبل كده — يعني بالنسبة لـ RTK Query نفسه،
 * الـ query args اللي بيتعمل عليها cache (serializeQueryArgs) متغيرتش
 * لما المستخدم يغيّر السنة من الـ Navbar. النتيجة: أي بيانات كانت
 * محمّلة قبل كده هتفضل معروضة زي ما هي (Cache قديم) وميتعملهاش
 * refetch تلقائي.
 *
 * الحل: أي مرة الـ selectedFiscalYearId يتغيّر فعليًا، نعمل
 * invalidateTags لكل الـ tags اللي بتعتمد على السنة المالية، عشان
 * RTK Query يعمل refetch لأي query نشطة حاليًا على الشاشة — وده
 * بالظبط اللي الدليل بيطلبه: "مسح Cache بيانات الشاشات + إعادة
 * تحميل الشاشة الحالية".
 */
const FISCAL_YEAR_SENSITIVE_TAGS = [
  "CashVoucher",
  "CashboxTransfer",
  "DriverTripCost",
  "DriverStatement",
  "Attendance",
  "EmployeeMovement",
  "EmployeeOpeningBalance",
  "EmployeeStatement",
  "PayrollEntry",
  "ExchangeRate",
  "InventoryCount",
  "StockOpeningBalance",
  "StockAdjustment",
  "StockTransfer",
  "InventoryCostReport",
  "StoreStockReport",
  "Invoice",
  "Sale",
  "Purchase",
  "SaleReturn",
  "PurchaseReturn",
  "InvoicePackaging",
  "JournalEntry",
  "PartnerOpeningBalance",
  "PartyStatement",
  "Statement",
  "OperationalTrialBalance",
  "IncomeStatement",
  "FinancialPosition",
  "CashFlow",
  "FinancialStatementLine",
  "AccountMappings",
  "Account",
];

export const fiscalYearMiddleware = (store) => (next) => (action) => {
  if (fiscalYearRefreshRequested.match(action)) {
    const result = next(action);

    store.dispatch(
      baseApi.util.invalidateTags(["FiscalYear", ...FISCAL_YEAR_SENSITIVE_TAGS]),
    );

    return result;
  }

  const isRelevantAction =
    setFiscalYears.match(action) || setSelectedFiscalYearId.match(action);

  const previousId = isRelevantAction
    ? store.getState().fiscalYear.selectedFiscalYearId
    : undefined;

  const result = next(action);

  if (isRelevantAction) {
    const nextId = store.getState().fiscalYear.selectedFiscalYearId;

    if (nextId !== previousId) {
      store.dispatch(baseApi.util.invalidateTags(FISCAL_YEAR_SENSITIVE_TAGS));
    }
  }

  return result;
};
