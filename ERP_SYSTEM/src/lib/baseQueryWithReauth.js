import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";

import { updateTokens, logout } from "../features/auth/authSlice";
import {
  selectSelectedFiscalYearId,
  fiscalYearRefreshRequested,
} from "../features/fiscalYears/fiscalYearSlice";

import { getApiErrors } from "../utils/getApiErrors";
import { shouldAttachFiscalYearId } from "./fiscalYearEndpoints";
import {
  findFiscalYearMismatch,
  getSentFiscalYearId,
} from "./fiscalYearResponseGuard";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,

  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.accessToken;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

// أكواد أخطاء الباك إند اللي معناها إن حالة السنة/السجل اتغيّرت
// والواجهة لازم تعيد تحميل بياناتها (مذكورة في الأدلة).
const REFRESH_ERROR_CODES = new Set([
  "FiscalYears.InvalidId",
  "FiscalYears.Closed",
  "EmployeeOpeningBalances.CarriedForwardReadOnly",
  "PayrollEntry.AlreadyPaid",
  "PayrollEntry.NotFound",
]);

const syncFromErrorCode = (error, api) => {
  const code = error?.data?.errorCode;

  if (code && REFRESH_ERROR_CODES.has(code)) {
    api.dispatch(fiscalYearRefreshRequested());
  }
};

const showErrors = (error) => {
  const messages = [...new Set(getApiErrors(error))];

  messages.forEach((message) => {
    toast.error(message);
  });
};

/**
 * لو الطلب GET، وعنوانه ضمن endpoints اللي بتقبل fiscalYearId (حسب
 * fiscalYearEndpoints.js)، ومحصلش تحديد صريح للسنة في الـ params —
 * يضيف السنة المختارة حاليًا (من الـ Navbar) تلقائيًا.
 *
 * لو الـ caller حدد fiscalYearId (أو FiscalYearId) بنفسه بقيمة حقيقية،
 * احترامًا لاختياره، لا يتم استبدالها.
 */
// مفاتيح تواريخ الفلترة/الفترة اللي لازم تكون جوه حدود السنة. (مقصود
// إننا مانلمسش تواريخ الحركات نفسها زي date/postingDate/asOfDate.)
const RANGE_DATE_PARAM_KEYS = new Set([
  "fromdate",
  "todate",
  "startdate",
  "enddate",
  "workdatefrom",
  "workdateto",
]);

/**
 * شبكة أمان على مستوى الطلب: لو فلتر تاريخ لسه قديم (برّه حدود السنة
 * اللي الطلب رايحلها) يتقصّ لحدود السنة بدل ما الباك إند يرجّع 400
 * FiscalYears.QueryDateOutsideRange. الواجهة بتصلّح الفلاتر نفسها
 * عن طريق useOnFiscalYearChange.
 */
const clampRangeParams = (params, fiscalYear) => {
  if (!params || !fiscalYear?.startDate || !fiscalYear?.endDate) return params;

  const start = String(fiscalYear.startDate).slice(0, 10);
  const end = String(fiscalYear.endDate).slice(0, 10);

  let changed = false;
  const next = { ...params };

  Object.keys(next).forEach((key) => {
    const value = next[key];

    if (!RANGE_DATE_PARAM_KEYS.has(key.toLowerCase())) return;
    if (typeof value !== "string" || !value) return;

    const day = value.slice(0, 10);
    const clamped = day < start ? start : day > end ? end : null;

    if (clamped) {
      next[key] = clamped;
      changed = true;
    }
  });

  return changed ? next : params;
};

/**
 * لو الطلب GET، وعنوانه ضمن endpoints اللي بتقبل fiscalYearId (حسب
 * fiscalYearEndpoints.js) — يضيف السنة المختارة (من الـ Navbar) لو
 * الـ caller ما حددش سنة بقيمة حقيقية، وبيقصّ فلاتر التاريخ لحدود
 * السنة الفعلية للطلب (المختارة أو اللي الـ caller حددها).
 */
const withFiscalYearId = (args, getState) => {
  const isObjectArgs = typeof args === "object" && args !== null;
  const url = isObjectArgs ? args.url : args;
  const method = ((isObjectArgs ? args.method : "GET") || "GET").toUpperCase();

  if (method !== "GET") return args;
  if (!shouldAttachFiscalYearId(url)) return args;

  const state = getState();
  const existingParams = isObjectArgs ? args.params : undefined;

  const explicitKey =
    existingParams &&
    Object.keys(existingParams).find(
      (key) =>
        key.toLowerCase() === "fiscalyearid" &&
        existingParams[key] !== undefined &&
        existingParams[key] !== null,
    );

  const effectiveId = explicitKey
    ? Number(existingParams[explicitKey])
    : selectSelectedFiscalYearId(state);

  if (!effectiveId || effectiveId <= 0) return args;

  const fiscalYear = state.fiscalYear?.fiscalYears?.find(
    (year) => year.id === effectiveId,
  );

  const params = clampRangeParams(existingParams, fiscalYear);

  if (explicitKey) {
    return params === existingParams ? args : { ...args, params };
  }

  return {
    ...(isObjectArgs ? args : { url }),
    params: { ...params, fiscalYearId: effectiveId },
  };
};

const requestWithReauth = async (argsWithFiscalYear, api, extraOptions) => {
  let result = await baseQuery(argsWithFiscalYear, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshToken = api.getState().auth?.refreshToken;

    if (!refreshToken) {
      showErrors(result.error);

      api.dispatch(logout());

      return result;
    }

    const refreshResult = await baseQuery(
      {
        url: "/Auth/refresh",
        method: "POST",
        body: {
          refreshToken,
        },
      },
      api,
      extraOptions,
    );

    if (refreshResult.data?.accessToken) {
      api.dispatch(
        updateTokens({
          accessToken: refreshResult.data.accessToken,

          refreshToken: refreshResult.data.refreshToken ?? refreshToken,
        }),
      );

      result = await baseQuery(argsWithFiscalYear, api, extraOptions);

      if (result.error) {
        showErrors(result.error);
      }
    } else {
      showErrors(refreshResult.error);

      api.dispatch(logout());
    }

    return result;
  }

  if (result.error) {
    showErrors(result.error);
    syncFromErrorCode(result.error, api);
  }

  return result;
};

const FISCAL_YEAR_MISMATCH_MESSAGE =
  "تم تجاهل بيانات تخص سنة مالية مختلفة عن السنة المختارة.";

const baseQueryWithReauth = async (args, api, extraOptions) => {
  const sentArgs = withFiscalYearId(args, api.getState);

  const result = await requestWithReauth(sentArgs, api, extraOptions);

  if (result.error) return result;

  // فحص احترازي: fiscalYearId الراجع لازم يطابق السنة المرسلة.
  // (من غير refetch تلقائي هنا عشان مانعملش loop لو الباك إند
  // فعلًا بيرجّع سنة مختلفة باستمرار.)
  const expectedId = getSentFiscalYearId(sentArgs);

  if (expectedId) {
    const mismatch = findFiscalYearMismatch(result.data, expectedId);

    if (mismatch !== null) {
      toast.error(FISCAL_YEAR_MISMATCH_MESSAGE, {
        id: "fiscal-year-mismatch",
      });

      return {
        error: {
          status: "FISCAL_YEAR_MISMATCH",
          data: {
            title: "سنة مالية غير متطابقة",
            detail: FISCAL_YEAR_MISMATCH_MESSAGE,
            errorCode: "Client.FiscalYearMismatch",
            expectedFiscalYearId: expectedId,
            receivedFiscalYearId: mismatch,
          },
        },
      };
    }
  }

  return result;
};

export default baseQueryWithReauth;
