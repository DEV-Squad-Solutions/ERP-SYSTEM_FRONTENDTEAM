// lib/randomId.js
//
// مولّد معرّف فريد (UUID v4) يشتغل في كل بيئات التشغيل.
//
// ليه اتنشأ: crypto.randomUUID() متاح بس في «السياقات الآمنة»
// (Secure Context) = HTTPS أو localhost. العميل بينفّذ النظام على
// http://<ip-السيرفر>:8080 في الشبكة المحلية (LAN) — وده سياق غير
// آمن، فـ crypto.randomUUID بيكون undefined ويرمي
// "TypeError: crypto.randomUUID is not a function" أول ما الشاشة تفتح.
// فبنرجّع UUID v4 بالمواصفة عبر Math.random كبديل.
//
// الاستخدام: معرّفات صفوف الواجهة المحلية بس (React keys / _key) —
// مش أغراض كريبتوغرافية، فالبديل آمن تمامًا.

// مواضع الشرطات في صيغة 8-4-4-4-12:
// 8 و 13 و 18 و 23. فالإصدار (4) مكانه 14، والـ variant مكانه 19.
const DASH_POSITIONS = new Set([8, 13, 18, 23]);

const HEX = "0123456789abcdef";

function fallbackUuid() {
  let uuid = "";

  for (let i = 0; i < 36; i += 1) {
    if (DASH_POSITIONS.has(i)) {
      uuid += "-";
    } else if (i === 14) {
      // الإصدار 4
      uuid += "4";
    } else if (i === 19) {
      // بتات الـ variant في UUID v4 بتاخد 8 أو 9 أو a أو b بس —
      // يعني 8 + رقم من 0 لـ 3 (مش 0..3 نفسها).
      uuid += HEX[8 + ((Math.random() * 4) | 0)];
    } else {
      uuid += HEX[(Math.random() * 16) | 0];
    }
  }

  return uuid;
}

export function randomId() {
  const api = typeof crypto === "undefined" ? undefined : crypto;

  return typeof api?.randomUUID === "function"
    ? api.randomUUID()
    : fallbackUuid();
}

export default randomId;
