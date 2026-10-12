import { useCallback, useMemo } from "react";

import { useGetCurrentCashboxPermissionsQuery } from "../cashboxPermissionsApi";

/**
 * نطاق خزائن المستخدم الحالي في الشركة المختارة.
 *
 * GET /CashboxPermissions/current →
 *   { hasAllCashboxes, viewCashboxIds, executeCashboxIds }
 *
 * القواعد:
 * - hasAllCashboxes=true يمنح كل خزائن الشركة حتى لو المصفوفات فاضية.
 * - من غير أي grants → مفيش خزائن مرئية خالص (مش وصول كامل).
 * - canExecute يستلزم canView.
 *
 * ملحوظة: while loading بترجّع canView/canExecute = false للعنصر، لكن
 * السيرفر برضه بيتحقق من الصلاحية وقت التنفيذ. لو عايز تسمح بالعرض
 * قبل ما يحمّل النطاق، استخدم isReady.
 *
 * @returns {{
 *   hasAllCashboxes: boolean,
 *   viewCashboxIds: number[],
 *   executeCashboxIds: number[],
 *   canView: (id: number|string) => boolean,
 *   canExecute: (id: number|string) => boolean,
 *   isLoading: boolean,
 *   isError: boolean,
 *   isReady: boolean,
 * }}
 */
export function useCashboxScope() {
  const { data, isLoading, isFetching, isError } =
    useGetCurrentCashboxPermissionsQuery();

  const hasAllCashboxes = Boolean(data?.hasAllCashboxes);

  const viewCashboxIds = useMemo(
    () => (data?.viewCashboxIds || []).map(Number),
    [data?.viewCashboxIds],
  );

  const executeCashboxIds = useMemo(
    () => (data?.executeCashboxIds || []).map(Number),
    [data?.executeCashboxIds],
  );

  const canView = useCallback(
    (id) => {
      if (id === null || id === undefined || id === "") return false;
      return hasAllCashboxes || viewCashboxIds.includes(Number(id));
    },
    [hasAllCashboxes, viewCashboxIds],
  );

  const canExecute = useCallback(
    (id) => {
      if (id === null || id === undefined || id === "") return false;
      return hasAllCashboxes || executeCashboxIds.includes(Number(id));
    },
    [hasAllCashboxes, executeCashboxIds],
  );

  return {
    hasAllCashboxes,
    viewCashboxIds,
    executeCashboxIds,
    canView,
    canExecute,
    isLoading: isLoading || isFetching,
    isError,
    isReady: Boolean(data),
  };
}

export default useCashboxScope;
