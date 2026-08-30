// features/exchange-rates/hooks/useAutoResolveExchangeRate.js

import { useEffect, useRef } from "react";
import { useLazyResolveExchangeRateQuery } from "../exchangeRatesApi";

/**
 * بيجيب سعر الصرف تلقائيًا كل ما العملة أو التاريخ يتغيروا،
 * ويحط القيمة في حقل exchangeRate بالفورم — من غير ما يكتب فوق
 * قيمة عدّلها المستخدم يدويًا بنفسه لنفس (currency, date).
 *
 * setValue / getValues جايين من useForm بتاع react-hook-form.
 */
export function useAutoResolveExchangeRate({
  currency,
  date,
  setValue,
  getValues,
}) {
  const [resolveExchangeRate] = useLazyResolveExchangeRateQuery();
  const lastAutoKey = useRef(null);

  useEffect(() => {
    if (!currency || !date) return;

    const key = `${currency}|${date}`;

    // لو المستخدم عدّل السعر يدويًا لنفس المفتاح ده قبل كده، متلمسوش
    const currentValue = getValues("exchangeRate");
    const userEditedManually =
      lastAutoKey.current && lastAutoKey.current !== key && currentValue;

    resolveExchangeRate({ currency, date })
      .unwrap()
      .then((res) => {
        lastAutoKey.current = key;
        setValue("exchangeRate", res?.rate ?? "");
      })
      .catch(() => {
        // مفيش سعر متاح لنفس العملة/التاريخ — سيب الخانة فاضية
        // عشان المستخدم يدخلها يدويًا
      });
  }, [currency, date]); // eslint-disable-line react-hooks/exhaustive-deps
}
