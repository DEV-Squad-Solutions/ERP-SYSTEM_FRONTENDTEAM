# ERP System — Frontend (نسخة تفصيلية)

نظام ERP متكامل بواجهة عربية RTL يغطي: المبيعات والمشتريات، المخازن والمخزون، الخزائن والبنوك، الشركاء والسائقين، المصروفات، الرواتب، والصلاحيات.

- **المستودع:** `DEV-Squad-Solutions/ERP-SYSTEM_FRONTENDTEAM`
- **مسار المشروع داخله:** `ERP_SYSTEM/`
- **نوع التطبيق:** SPA (React 19 + Vite) يتصل بـ REST API خارجي + بث لحظي عبر SignalR

---

## 1) جدول المحتويات

1. [نظرة عامة](#2-نظرة-عامة-على-المعمارية)
2. [التقنيات](#3-التقنيات-ولماذا-استخدمت)
3. [التشغيل محليًا](#4-التشغيل-محليًا)
4. [متغيرات البيئة](#5-متغيرات-البيئة)
5. [هيكل المشروع](#6-هيكل-المشروع-بالتفصيل)
6. [طبقة البيانات RTK Query](#7-طبقة-البيانات--rtk-query)
7. [المصادقة والحماية](#8-المصادقة-والصلاحيات)
8. [التحديث اللحظي SignalR](#9-التحديث-اللحظي-signalr)
9. [خريطة المسارات](#10-خريطة-المسارات-routes)
10. [الوحدات الوظيفية](#11-الوحدات-الوظيفية-features)
11. [المكونات المشتركة](#12-المكونات-المشتركة-shared)
12. [الطباعة والتصدير](#13-الطباعة-والتصدير)
13. [إضافة وحدة جديدة](#14-كيف-تضيف-وحدة-feature-جديدة)
14. [معايير الكود والمساهمة](#15-معايير-الكود-والمساهمة)
15. [البناء والنشر](#16-البناء-والنشر)
16. [مشاكل شائعة](#17-مشاكل-شائعة-وحلولها)

---

## 2) نظرة عامة على المعمارية

```text
        ┌──────────────────────────────────────────────┐
        │                 main.jsx                     │
        │  Redux Provider → RealtimeProvider → Router  │
        └───────────────────────┬──────────────────────┘
                                │
              ┌─────────────────▼─────────────────┐
              │  createBrowserRouter (router.jsx) │
              │  "/"  → LoginPage                 │
              │  "/dashboard/*" → ProtectedRoute  │
              │                   └ DashboardLayout│
              └─────────────────┬─────────────────┘
                                │  (Outlet)
                    ┌───────────▼───────────┐
                    │  features/<module>    │
                    │  pages + components   │
                    └───────────┬───────────┘
                                │ hooks من RTK Query
                    ┌───────────▼───────────┐
                    │  lib/baseApi.js       │  ← tagTypes + cache
                    │  baseQueryWithReauth  │  ← JWT + refresh + toasts
                    └───────────┬───────────┘
                                │ HTTP
                          Backend REST API
                                ▲
                                │ events
                    lib/realtime/RealtimeProvider (SignalR)
```

**المبدأ الأساسي:** المشروع منظّم **Feature-Based** لا Type-Based؛ كل وحدة عمل مستقلة بملف API خاص بها وصفحاتها ومكوناتها، والمشترك فقط يوضع في `shared/`.

---

## 3) التقنيات ولماذا استُخدمت

| التقنية | الإصدار | الدور في المشروع |
| --- | --- | --- |
| React | ^19 | مكتبة الواجهة الأساسية |
| Vite | ^8 | خادم تطوير سريع + أداة بناء |
| React Router DOM | ^7 | التوجيه عبر `createBrowserRouter` مع مسارات متداخلة |
| Redux Toolkit + RTK Query | ^2.12 | حالة المصادقة + كل نداءات الـ API والتخزين المؤقت |
| React Redux | ^9 | ربط المتجر بالمكونات |
| TanStack React Query | ^5 | جلب بيانات في أجزاء محددة خارج RTK Query |
| TanStack React Table | ^8 | جداول البيانات (فرز/ترتيب/أعمدة) |
| Axios | ^1.18 | نداءات مباشرة (رفع ملفات / حالات خاصة) |
| React Hook Form + Zod | — | إدارة النماذج والتحقق من المدخلات |
| Microsoft SignalR | ^10 | تحديث البيانات لحظيًا بين المستخدمين |
| Tailwind CSS + tailwindcss-rtl | ^3.4 | التنسيق ودعم الاتجاه من اليمين لليسار |
| Framer Motion | ^12 | الحركات والانتقالات |
| Lucide React | — | الأيقونات |
| Sonner | ^2 | إشعارات Toast (تُستخدم أيضًا لعرض أخطاء الـ API) |
| React To Print | ^3 | طباعة الفواتير والكشوف |
| XLSX | ^0.18 | تصدير البيانات إلى Excel |
| Oxlint + Prettier | — | فحص الكود وتنسيقه |

---

## 4) التشغيل محليًا

**المتطلبات:** Node.js 20+، npm.

```bash
git clone https://github.com/DEV-Squad-Solutions/ERP-SYSTEM_FRONTENDTEAM.git
cd ERP-SYSTEM_FRONTENDTEAM/ERP_SYSTEM
npm install
cp .env.example .env      # أو أنشئ .env يدويًا (انظر القسم التالي)
npm run dev               # http://localhost:5173
```

### أوامر npm

| الأمر | الوصف |
| --- | --- |
| `npm run dev` | خادم التطوير مع HMR |
| `npm run build` | بناء الإنتاج إلى `dist/` |
| `npm run preview` | معاينة ناتج البناء محليًا |
| `npm run lint` | فحص الكود بـ Oxlint |

---

## 5) متغيرات البيئة

ملف `.env` داخل `ERP_SYSTEM/`:

```env
# عنوان الـ API الأساسي (يستخدمه baseQueryWithReauth)
VITE_API_URL=http://localhost:5000/api

# عنوان hub الخاص بالتحديث اللحظي
VITE_SIGNALR_URL=http://localhost:5000/hubs/notifications
```

ملاحظات:
- إن لم يُضبط `VITE_API_URL` يستخدم المشروع `http://localhost:5000/api` كقيمة افتراضية.
- كل متغير يجب أن يبدأ بـ `VITE_` ليصل إلى كود المتصفح عبر `import.meta.env`.
- لا تضع أسرارًا حقيقية في `.env` لأنها تُحزم داخل ملفات الواجهة.

---

## 6) هيكل المشروع بالتفصيل

```text
ERP_SYSTEM/
├── index.html
├── vite.config.js
├── tailwind.config.js / postcss.config.js
├── .oxlintrc.json
└── src/
    ├── main.jsx                     # نقطة الدخول: Provider + Router
    ├── index.css                    # Tailwind + الأنماط العامة
    ├── app/
    │   ├── App.jsx                  # الغلاف العام للتطبيق
    │   ├── router.jsx               # تعريف كل المسارات
    │   └── store.js                 # متجر Redux (auth + baseApi)
    ├── lib/
    │   ├── baseApi.js               # createApi + قائمة tagTypes
    │   ├── baseQueryWithReauth.js   # JWT + refresh تلقائي + عرض الأخطاء
    │   └── realtime/
    │       ├── RealtimeProvider.jsx     # الاتصال بـ SignalR
    │       ├── realtimeConnection.js    # بناء وإدارة الاتصال
    │       └── resourceTagMap.js        # ربط أحداث الخادم بوسوم الكاش
    ├── shared/
    │   ├── components/
    │   │   ├── ProtectedRoute.jsx   # حارس المسارات
    │   │   ├── Error404.jsx
    │   │   ├── layout/              # DashboardLayout, Navbar, Sidebar, MobileSidebarToggle
    │   │   ├── ui/                  # Button, Card, Input, Modal, Pagination, Selects…
    │   │   └── print/               # قوالب الطباعة
    │   ├── hooks/                   # useDebouncedValue, usePersistentTab, hooks الطباعة والتصدير
    │   └── constants/navigation.js  # عناصر القائمة الجانبية
    ├── features/                    # الوحدات (انظر القسم 11)
    ├── mocks/                       # بيانات تجريبية + mockDelay
    ├── utils/getApiErrors.js        # توحيد رسائل أخطاء الـ API
    └── assets/logos/                # شعارات فاتحة/داكنة
```

---

## 7) طبقة البيانات — RTK Query

كل الاتصال بالخادم يمر عبر `src/lib/baseApi.js`:

```js
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Company", "User", "Party", "Driver", "Item", "Store",
             "Invoice", "Cashbox", "Bank", "Expense", /* ...وغيرها */],
  endpoints: () => ({}),
});
```

ثم كل وحدة تحقن نقاطها الطرفية:

```js
// features/stores/storesApi.js
import { baseApi } from "../../lib/baseApi";

export const storesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStores: builder.query({
      query: (params) => ({ url: "/Stores", params }),
      providesTags: ["Store"],
    }),
    createStore: builder.mutation({
      query: (body) => ({ url: "/Stores", method: "POST", body }),
      invalidatesTags: ["Store"],
    }),
  }),
});

export const { useGetStoresQuery, useCreateStoreMutation } = storesApi;
```

**فوائد هذا النمط:** كاش تلقائي، إعادة جلب بعد التعديل عبر `invalidatesTags`، ولا حاجة لكتابة حالات `loading/error` يدويًا.

---

## 8) المصادقة والصلاحيات

- تسجيل الدخول في `features/auth` (`LoginForm` + `CompanySelect`): المستخدم يختار الشركة ثم يسجل الدخول.
- `authSlice` يخزّن `accessToken` و`refreshToken` وبيانات المستخدم.
- `baseQueryWithReauth`:
  1. يضيف `Authorization: Bearer <token>` لكل طلب.
  2. عند رد `401` يحاول التجديد عبر `POST /Auth/refresh`.
  3. عند النجاح يعيد الطلب الأصلي تلقائيًا، وعند الفشل ينفّذ `logout()`.
  4. يعرض أخطاء الخادم كإشعارات Sonner عبر `getApiErrors`.
- `ProtectedRoute` يمنع الوصول إلى `/dashboard/*` بدون جلسة صالحة.
- `features/permissions` لإدارة أدوار المستخدمين وصلاحياتهم.

---

## 9) التحديث اللحظي (SignalR)

`RealtimeProvider` يفتح اتصالًا واحدًا مع الـ hub، وعند وصول حدث من الخادم يترجم اسم المورد إلى وسم كاش عبر `resourceTagMap.js` ثم يُبطل ذلك الوسم في RTK Query — فتتحدّث الشاشات المفتوحة تلقائيًا دون تحديث الصفحة (مثال: إنشاء سند صرف من مستخدم آخر يحدّث رصيد الخزينة عندك).

---

## 10) خريطة المسارات (Routes)

| المسار | الصفحة |
| --- | --- |
| `/` | تسجيل الدخول |
| `/dashboard` | لوحة التحكم الرئيسية |
| `/dashboard/sales` · `sales/new` · `sales/:id` · `sales/:id/edit` | المبيعات والفواتير |
| `/dashboard/purchases/new` · `purchases/:id` · `purchases/:id/edit` | المشتريات |
| `/dashboard/partners` · `:partnerId` · `statement` · `opening-balances` · `countries` | الشركاء |
| `/dashboard/drivers` · `:driverId` · `trip-costs` · `statement` | السائقون |
| `/dashboard/treasury` · `:cashboxId` · `transfers` · `transfers/:id` · `cash-movement-types` | الخزائن |
| `/dashboard/stores` · `stores/:id` · `stores/containers/:partnerId` | المخازن |
| `/dashboard/items/:id` | تفاصيل الصنف |
| `/dashboard/inventory/opening-balances` · `adjustments` (+ `new`/`:id`/`:id/edit`) · `units` · `containers` | المخزون |
| `/dashboard/expenses` | المصروفات |
| `/dashboard/payroll` · `employees` · `salaries` · `attendance` · `overtime` · `deductions` · `advances` · `reports` | الرواتب |
| `/dashboard/permissions` | الصلاحيات |
| `adjusted-trial-balance` · `income` · `financial-position` · `reports` | قيد التطوير (ComingSoon) |
| `*` | صفحة 404 |

> صفحة البنك متاحة عبر `BankPage` ضمن وحدة `bank`.

---

## 11) الوحدات الوظيفية (features)

| الوحدة | المحتوى |
| --- | --- |
| `auth` | تسجيل الدخول، اختيار الشركة، `authSlice` |
| `dashboard` | الصفحة الرئيسية والمؤشرات |
| `sales` / `invoices` | إنشاء وتعديل وعرض الفواتير (بيع/شراء) |
| `partners` | العملاء والموردون، الأرصدة الافتتاحية، كشوف الحساب |
| `drivers` | السائقون، تكاليف الرحلات، كشوف حسابهم |
| `cashboxes` | الخزائن، السندات، التحويلات، دفتر الأستاذ |
| `cashMovementTypes` | أنواع الحركات النقدية |
| `bank` | الحركات البنكية، الفلاتر والإجماليات |
| `expenses` | تسجيل ومتابعة المصروفات |
| `stores` / `storeContainers` | المخازن وكشوف العبوات لدى الشركاء |
| `inventory` / `stock-adjustments` | الأصناف، الجرد، تسويات المخزون |
| `itemsCategories` / `units` / `containers` | التصنيفات، وحدات القياس، العبوات |
| `payroll` | الموظفون، الرواتب، الحضور، الإضافي، الخصومات، السلف، التقارير |
| `statements` | كشوف حسابات الشركاء |
| `countries` / `company` | الدول وبيانات الشركة |
| `permissions` | الأدوار والصلاحيات |

بنية كل وحدة:

```text
features/<module>/
├── <module>Api.js      # injectEndpoints
├── <module>Slice.js    # اختياري
├── components/         # مكونات ونوافذ خاصة بالوحدة
└── pages/              # الصفحات المرتبطة بالمسارات
```

---

## 12) المكونات المشتركة (shared)

- **Layout:** `DashboardLayout` (Sidebar + Navbar + Outlet)، `MobileSidebarToggle` للجوال، والقائمة تُبنى من `constants/navigation.js`.
- **UI:** `Button`, `Card`, `Input`, `NumericInput`, `Modal`, `Pagination`, `SearchableSelect`, `CompactSelect`, `LedgerPanel/LedgerField/LedgerSelect` (لشاشات القيود بأسلوب إدخال سريع بلوحة المفاتيح).
- **Hooks:** `useDebouncedValue` (البحث)، `usePersistentTab` (حفظ التبويب المفتوح)، hooks الطباعة والتصدير.

---

## 13) الطباعة والتصدير

قوالب جاهزة في `shared/components/print/`: الفاتورة، قائمة الفواتير، دفتر الخزينة، قائمة السائقين، قائمة الشركاء، المخزن — تُستدعى عبر hooks مثل `useInvoicePrint` و`useCashboxLedgerPrint` المبنية على `react-to-print`. أما `exportInvoicesToExcel` فيصدّر الجداول إلى ملف Excel باستخدام `xlsx`.

---

## 14) كيف تضيف وحدة (Feature) جديدة

1. أنشئ `src/features/<module>/` بالبنية القياسية.
2. أضف وسمًا جديدًا في `tagTypes` داخل `lib/baseApi.js`.
3. أنشئ `<module>Api.js` عبر `baseApi.injectEndpoints` مع `providesTags` / `invalidatesTags`.
4. أنشئ الصفحات في `pages/` وسجّلها في `app/router.jsx` تحت `/dashboard`.
5. أضف رابط القائمة في `shared/constants/navigation.js`.
6. أعد استخدام مكونات `shared/ui` بدل إنشاء بدائل جديدة.
7. شغّل `npm run lint` ثم اختبر الشاشة يدويًا.

---

## 15) معايير الكود والمساهمة

- **الفروع:** `feature/...`، `fix/...`، `refactor/...` من `main`.
- **الرسائل:** نمط Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`).
- **قبل الدفع:** `npm run lint` + `npm run build` بلا أخطاء.
- **التنسيق:** Prettier (لا تخلط تغييرات التنسيق مع تغييرات المنطق).
- **التسمية:** المكونات `PascalCase`، الملفات المساعدة `camelCase`، ملفات الـ API `<module>Api.js`.
- **الأنماط:** Tailwind فقط، مع مراعاة RTL (استخدم `ms-`/`me-` بدل `ml-`/`mr-`).
- **Pull Request:** وصف واضح + لقطات شاشة لأي تغيير في الواجهة + ذكر المسارات المتأثرة.

---

## 16) البناء والنشر

```bash
npm run build      # الناتج في dist/
npm run preview    # تحقق قبل النشر
```

- استضافة ثابتة: Netlify / Vercel / Nginx / IIS.
- **مهم:** أعد توجيه كل المسارات إلى `index.html` (SPA fallback) وإلا ستظهر 404 عند تحديث صفحة داخلية.
- اضبط متغيرات `VITE_*` في بيئة النشر قبل تنفيذ البناء (تُحقن وقت البناء لا وقت التشغيل).

مثال Nginx:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## 17) مشاكل شائعة وحلولها

| المشكلة | السبب المرجّح | الحل |
| --- | --- | --- |
| كل الطلبات ترجع 401 | `VITE_API_URL` خاطئ أو الجلسة منتهية | راجع `.env` وسجّل الدخول مجددًا |
| CORS error | الخادم لا يسمح بأصل الواجهة | فعّل CORS للـ origin في الـ Backend |
| صفحة بيضاء بعد النشر | غياب SPA fallback | أضف إعادة التوجيه إلى `index.html` |
| البيانات لا تتحدث بعد الحفظ | نسيان `invalidatesTags` | أضف الوسم الصحيح في الـ mutation |
| لا يوجد تحديث لحظي | `VITE_SIGNALR_URL` غير مضبوط | اضبط عنوان الـ hub وتحقق من الاتصال |
| تغييرات `.env` لا تظهر | Vite يقرأها عند الإقلاع | أعد تشغيل `npm run dev` |

---

## الفريق

**DEV Squad Solutions — Frontend Team**
