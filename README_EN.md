# ERP System — Frontend (Detailed Guide)

A full ERP system with an Arabic RTL interface covering: sales & purchases, stores & inventory, cashboxes & banks, partners & drivers, expenses, payroll, and permissions.

- **Repository:** `DEV-Squad-Solutions/ERP-SYSTEM_FRONTENDTEAM`
- **Project path inside it:** `ERP_SYSTEM/`
- **App type:** SPA (React 19 + Vite) talking to an external REST API + real-time updates over SignalR

---

## 1) Table of Contents

1. [Architecture Overview](#2-architecture-overview)
2. [Tech Stack](#3-tech-stack-and-why)
3. [Running Locally](#4-running-locally)
4. [Environment Variables](#5-environment-variables)
5. [Project Structure](#6-project-structure)
6. [Data Layer — RTK Query](#7-data-layer--rtk-query)
7. [Auth & Permissions](#8-authentication--permissions)
8. [Real-time Updates (SignalR)](#9-real-time-updates-signalr)
9. [Routes Map](#10-routes-map)
10. [Feature Modules](#11-feature-modules)
11. [Shared Components](#12-shared-components)
12. [Printing & Exporting](#13-printing--exporting)
13. [Adding a New Feature](#14-how-to-add-a-new-feature)
14. [Code Standards & Contributing](#15-code-standards--contributing)
15. [Build & Deploy](#16-build--deploy)
16. [Troubleshooting](#17-troubleshooting)

---

## 2) Architecture Overview

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
                                │ RTK Query hooks
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

**Core principle:** the codebase is organized **feature-based**, not type-based. Every business module is self-contained with its own API file, pages, and components; only truly shared code lives in `shared/`.

---

## 3) Tech Stack and Why

| Technology | Version | Role in the project |
| --- | --- | --- |
| React | ^19 | Core UI library |
| Vite | ^8 | Fast dev server + build tool |
| React Router DOM | ^7 | Routing via `createBrowserRouter` with nested routes |
| Redux Toolkit + RTK Query | ^2.12 | Auth state + all API calls and caching |
| React Redux | ^9 | Binds the store to components |
| TanStack React Query | ^5 | Data fetching in specific areas outside RTK Query |
| TanStack React Table | ^8 | Data tables (sorting, ordering, columns) |
| Axios | ^1.18 | Direct calls (file uploads / special cases) |
| React Hook Form + Zod | — | Form handling and input validation |
| Microsoft SignalR | ^10 | Real-time data updates across users |
| Tailwind CSS + tailwindcss-rtl | ^3.4 | Styling with right-to-left support |
| Framer Motion | ^12 | Animations and transitions |
| Lucide React | — | Icons |
| Sonner | ^2 | Toast notifications (also used for API errors) |
| React To Print | ^3 | Printing invoices and statements |
| XLSX | ^0.18 | Exporting data to Excel |
| Oxlint + Prettier | — | Linting and formatting |

---

## 4) Running Locally

**Requirements:** Node.js 20+, npm.

```bash
git clone https://github.com/DEV-Squad-Solutions/ERP-SYSTEM_FRONTENDTEAM.git
cd ERP-SYSTEM_FRONTENDTEAM/ERP_SYSTEM
npm install
cp .env.example .env      # or create .env manually (see next section)
npm run dev               # http://localhost:5173
```

### npm scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the build output locally |
| `npm run lint` | Lint the code with Oxlint |

---

## 5) Environment Variables

Create `.env` inside `ERP_SYSTEM/`:

```env
# Base API URL (used by baseQueryWithReauth)
VITE_API_URL=http://localhost:5000/api

# Real-time hub URL
VITE_SIGNALR_URL=http://localhost:5000/hubs/notifications
```

Notes:
- If `VITE_API_URL` is not set, the project falls back to `http://localhost:5000/api`.
- Every variable must be prefixed with `VITE_` to be exposed to browser code via `import.meta.env`.
- Never put real secrets in `.env` — they are bundled into the frontend files.

---

## 6) Project Structure

```text
ERP_SYSTEM/
├── index.html
├── vite.config.js
├── tailwind.config.js / postcss.config.js
├── .oxlintrc.json
└── src/
    ├── main.jsx                     # Entry point: Provider + Router
    ├── index.css                    # Tailwind + global styles
    ├── app/
    │   ├── App.jsx                  # App shell
    │   ├── router.jsx               # All route definitions
    │   └── store.js                 # Redux store (auth + baseApi)
    ├── lib/
    │   ├── baseApi.js               # createApi + tagTypes list
    │   ├── baseQueryWithReauth.js   # JWT + auto refresh + error display
    │   └── realtime/
    │       ├── RealtimeProvider.jsx     # SignalR connection
    │       ├── realtimeConnection.js    # Connection build & management
    │       └── resourceTagMap.js        # Maps server events to cache tags
    ├── shared/
    │   ├── components/
    │   │   ├── ProtectedRoute.jsx   # Route guard
    │   │   ├── Error404.jsx
    │   │   ├── layout/              # DashboardLayout, Navbar, Sidebar, MobileSidebarToggle
    │   │   ├── ui/                  # Button, Card, Input, Modal, Pagination, Selects…
    │   │   └── print/               # Print templates
    │   ├── hooks/                   # useDebouncedValue, usePersistentTab, print/export hooks
    │   └── constants/navigation.js  # Sidebar menu items
    ├── features/                    # Modules (see section 11)
    ├── mocks/                       # Mock data + mockDelay
    ├── utils/getApiErrors.js        # Normalizes API error messages
    └── assets/logos/                # Light/dark logos
```

---

## 7) Data Layer — RTK Query

All server communication goes through `src/lib/baseApi.js`:

```js
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Company", "User", "Party", "Driver", "Item", "Store",
             "Invoice", "Cashbox", "Bank", "Expense", /* ...and more */],
  endpoints: () => ({}),
});
```

Each module then injects its own endpoints:

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

**Why this pattern:** automatic caching, refetch after mutations via `invalidatesTags`, and no need to hand-write `loading/error` states.

---

## 8) Authentication & Permissions

- Login lives in `features/auth` (`LoginForm` + `CompanySelect`): the user picks a company, then signs in.
- `authSlice` stores `accessToken`, `refreshToken`, and user data.
- `baseQueryWithReauth`:
  1. Adds `Authorization: Bearer <token>` to every request.
  2. On a `401` response it attempts a refresh via `POST /Auth/refresh`.
  3. On success it automatically retries the original request; on failure it calls `logout()`.
  4. Surfaces server errors as Sonner toasts through `getApiErrors`.
- `ProtectedRoute` blocks access to `/dashboard/*` without a valid session.
- `features/permissions` manages user roles and permissions.

---

## 9) Real-time Updates (SignalR)

`RealtimeProvider` opens a single connection to the hub. When a server event arrives, it maps the resource name to a cache tag using `resourceTagMap.js` and invalidates that tag in RTK Query — so open screens refresh automatically without a page reload (e.g. another user creating a payment voucher updates your cashbox balance instantly).

---

## 10) Routes Map

| Route | Page |
| --- | --- |
| `/` | Login |
| `/dashboard` | Main dashboard |
| `/dashboard/sales` · `sales/new` · `sales/:id` · `sales/:id/edit` | Sales & invoices |
| `/dashboard/purchases/new` · `purchases/:id` · `purchases/:id/edit` | Purchases |
| `/dashboard/partners` · `:partnerId` · `statement` · `opening-balances` · `countries` | Partners |
| `/dashboard/drivers` · `:driverId` · `trip-costs` · `statement` | Drivers |
| `/dashboard/treasury` · `:cashboxId` · `transfers` · `transfers/:id` · `cash-movement-types` | Cashboxes |
| `/dashboard/stores` · `stores/:id` · `stores/containers/:partnerId` | Stores |
| `/dashboard/items/:id` | Item details |
| `/dashboard/inventory/opening-balances` · `adjustments` (+ `new`/`:id`/`:id/edit`) · `units` · `containers` | Inventory |
| `/dashboard/expenses` | Expenses |
| `/dashboard/payroll` · `employees` · `salaries` · `attendance` · `overtime` · `deductions` · `advances` · `reports` | Payroll |
| `/dashboard/permissions` | Permissions |
| `adjusted-trial-balance` · `income` · `financial-position` · `reports` | Under development (ComingSoon) |
| `*` | 404 page |

> The bank screen is available through `BankPage` inside the `bank` module.

---

## 11) Feature Modules

| Module | Contents |
| --- | --- |
| `auth` | Login, company selection, `authSlice` |
| `dashboard` | Home page and KPIs |
| `sales` / `invoices` | Create, edit, and view invoices (sales/purchase) |
| `partners` | Customers and suppliers, opening balances, account statements |
| `drivers` | Drivers, trip costs, their statements |
| `cashboxes` | Cashboxes, vouchers, transfers, ledger |
| `cashMovementTypes` | Cash movement types |
| `bank` | Bank movements, filters and totals |
| `expenses` | Recording and tracking expenses |
| `stores` / `storeContainers` | Stores and partner container statements |
| `inventory` / `stock-adjustments` | Items, stock counts, inventory adjustments |
| `itemsCategories` / `units` / `containers` | Categories, units of measure, containers |
| `payroll` | Employees, salaries, attendance, overtime, deductions, advances, reports |
| `statements` | Partner account statements |
| `countries` / `company` | Countries and company data |
| `permissions` | Roles and permissions |

Structure of each module:

```text
features/<module>/
├── <module>Api.js      # injectEndpoints
├── <module>Slice.js    # optional
├── components/         # module-specific components and modals
└── pages/              # pages wired to routes
```

---

## 12) Shared Components

- **Layout:** `DashboardLayout` (Sidebar + Navbar + Outlet), `MobileSidebarToggle` for mobile; the menu is built from `constants/navigation.js`.
- **UI:** `Button`, `Card`, `Input`, `NumericInput`, `Modal`, `Pagination`, `SearchableSelect`, `CompactSelect`, `LedgerPanel/LedgerField/LedgerSelect` (for entry screens with fast keyboard input).
- **Hooks:** `useDebouncedValue` (search), `usePersistentTab` (remember the active tab), plus print/export hooks.

---

## 13) Printing & Exporting

Ready-made templates live in `shared/components/print/`: invoice, invoice list, cashbox ledger, drivers list, partners list, and store — invoked through hooks such as `useInvoicePrint` and `useCashboxLedgerPrint`, built on `react-to-print`. `exportInvoicesToExcel` exports tables to an Excel file using `xlsx`.

---

## 14) How to Add a New Feature

1. Create `src/features/<module>/` with the standard structure.
2. Add a new tag to `tagTypes` in `lib/baseApi.js`.
3. Create `<module>Api.js` via `baseApi.injectEndpoints` with `providesTags` / `invalidatesTags`.
4. Create the pages in `pages/` and register them in `app/router.jsx` under `/dashboard`.
5. Add the menu link in `shared/constants/navigation.js`.
6. Reuse `shared/ui` components instead of building new alternatives.
7. Run `npm run lint`, then test the screen manually.

---

## 15) Code Standards & Contributing

- **Branches:** `feature/...`, `fix/...`, `refactor/...` off `main`.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`).
- **Before pushing:** `npm run lint` + `npm run build` with no errors.
- **Formatting:** Prettier (don't mix formatting changes with logic changes).
- **Naming:** components `PascalCase`, helpers `camelCase`, API files `<module>Api.js`.
- **Styling:** Tailwind only, RTL-aware (use `ms-`/`me-` instead of `ml-`/`mr-`).
- **Pull Requests:** clear description + screenshots for any UI change + list of affected routes.

---

## 16) Build & Deploy

```bash
npm run build      # output in dist/
npm run preview    # verify before deploying
```

- Static hosting: Netlify / Vercel / Nginx / IIS.
- **Important:** rewrite all routes to `index.html` (SPA fallback), otherwise refreshing an inner page returns 404.
- Set the `VITE_*` variables in the deployment environment before building (they are injected at build time, not runtime).

Nginx example:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## 17) Troubleshooting

| Problem | Likely cause | Fix |
| --- | --- | --- |
| All requests return 401 | Wrong `VITE_API_URL` or expired session | Check `.env` and sign in again |
| CORS error | Server doesn't allow the frontend origin | Enable CORS for the origin in the backend |
| Blank page after deploy | Missing SPA fallback | Add the rewrite to `index.html` |
| Data doesn't refresh after saving | Missing `invalidatesTags` | Add the correct tag to the mutation |
| No real-time updates | `VITE_SIGNALR_URL` not configured | Set the hub URL and verify the connection |
| `.env` changes not applied | Vite reads them at startup | Restart `npm run dev` |

---

## Team

**DEV Squad Solutions — Frontend Team**
