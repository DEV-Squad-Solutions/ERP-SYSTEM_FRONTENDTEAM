import { resourceTagsMap } from "./realtime/resourceTagsMap";

/**
 * tagsFor("CashVoucher")
 *   => [{type:"CashVoucher"}, {type:"Cashbox"}, {type:"Party"}, ...]
 *
 * بيرجع bare tags (من غير id) لكل موديول مرتبط، وده مقصود:
 * invalidate بتاع {type:"X"} من غير id بيمسح كل الكاش بتاع X
 * (الـ LIST وكل الـ ids الفردية) — يعني تغطية أشمل من إنك تحدد
 * LIST بس زي ما كان بيحصل قبل كده.
 *
 * لو محتاج تستهدف سجل بعينه كمان (نادرًا ما يفرق لأن bare tag
 * أصلاً بيغطيه)، ابعت extra:
 *   tagsFor("Cashbox", [{ type: "Cashbox", id }])
 *
 * لو الـ resource مش مسجل في resourceTagsMap، بترجع الـ extra بس
 * وبتطبع warning في dev عشان تلاحظ إنك نسيت تسجله هناك.
 */
export function tagsFor(resource, extra = []) {
  const base = resourceTagsMap[resource];

  if (!base && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(
      `[tagsFor] "${resource}" مش مسجل في resourceTagsMap.js — invalidation هيبقى ناقص لحد ما تضيفه.`,
    );
  }

  return [...(base || []).map((type) => ({ type })), ...extra];
}
