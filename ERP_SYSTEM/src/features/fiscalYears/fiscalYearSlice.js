import { createSlice } from "@reduxjs/toolkit";

import { logout } from "../auth/authSlice";

/* =========================================================
   PERSISTENCE

   السنة المالية المختارة تُخزَّن في State/localStorage الخاص
   بالفرونت إند فقط، وليست جزءًا من الـ Access Token — تمامًا
   كما هو موضّح في دليل تكامل الشركات والسنوات المالية.
========================================================= */

const STORAGE_KEY = "fiscalYear";

const loadPersisted = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persisted = loadPersisted();

const persistState = (state) => {
  try {
    // snapshot للسنة المختارة (حدودها وحالتها) عشان تكون معروفة من أول
    // render بعد Refresh، قبل ما قائمة السنوات ترجع من الـ API.
    const snapshot =
      state.fiscalYears.find(
        (year) => year.id === state.selectedFiscalYearId,
      ) || null;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedFiscalYearId: state.selectedFiscalYearId,
        selectedFiscalYear: snapshot,
      }),
    );
  } catch {
    // localStorage غير متاح (خاص/محظور) — تجاهل بأمان
  }
};

const initialState = {
  fiscalYears: persisted?.selectedFiscalYear
    ? [persisted.selectedFiscalYear]
    : [],
  selectedFiscalYearId: persisted?.selectedFiscalYearId ?? null,
};

const fiscalYearSlice = createSlice({
  name: "fiscalYear",
  initialState,
  reducers: {
    /**
     * يُستدعى بعد تحميل GET /FiscalYears/select.
     * لو السنة المحفوظة سابقًا لم تعد موجودة ضمن سنوات الشركة الحالية
     * (مثلاً بعد تغيير الشركة)، يتم الرجوع تلقائيًا للسنة الحالية
     * (isCurrent = true) للشركة.
     */
    setFiscalYears: (state, action) => {
      const years = action.payload || [];
      const previousSelectedId = state.selectedFiscalYearId;
      const previousRecord = state.fiscalYears.find(
        (year) => year.id === previousSelectedId,
      );

      state.fiscalYears = years;

      const currentRecord = years.find(
        (year) => year.id === previousSelectedId,
      );
      const stillValid = Boolean(currentRecord);

      // لو السنة اللي كانت مختارة كانت هي "الحالية" وبقت مش كذلك
      // (زي ما بيحصل تلقائيًا عند إقفالها وإنشاء السنة التالية)،
      // اتبع السنة الحالية الجديدة بدل ما تفضل واقف على سنة اتقفلت.
      // أما لو المستخدم بيستعرض سنة قديمة مقفولة أصلًا من زمان،
      // سيبها كما هي واحترم اختياره.
      const currentYearJustRotatedAway =
        previousRecord?.isCurrent && currentRecord && !currentRecord.isCurrent;

      if (!previousSelectedId || !stillValid || currentYearJustRotatedAway) {
        const current = years.find((year) => year.isCurrent);
        state.selectedFiscalYearId = current?.id ?? years[0]?.id ?? null;
      }

      persistState(state);
    },

    /** تغيير السنة من الـ Dropdown في الـ Navbar (لأغراض العرض فقط). */
    setSelectedFiscalYearId: (state, action) => {
      const id = action.payload;

      // ممنوع إرسال 0 أو قيمة سالبة كـ fiscalYearId
      if (!id || id <= 0) return;

      state.selectedFiscalYearId = id;
      persistState(state);
    },

    /**
     * إشارة (بدون تغيير state) بتتبعت من baseQuery لما الباك إند يرجّع
     * errorCode بيدل إن بيانات السنة/السجل اتغيّرت (سنة اتقفلت، رصيد
     * مرحّل، مسير اتحوّل...). الميدل وير بيعمل refetch للـ tags المتأثرة.
     */
    fiscalYearRefreshRequested: () => {},

    resetFiscalYear: (state) => {
      state.fiscalYears = [];
      state.selectedFiscalYearId = null;

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // تجاهل
      }
    },
  },

  extraReducers: (builder) => {
    // تسجيل الخروج، أو تغيير الشركة (login بيرجع state جديد) لازم يمسح
    // اختيار السنة المالية القديم عشان ميفضلش fiscalYearId من شركة تانية.
    builder.addCase(logout, (state) => {
      state.fiscalYears = [];
      state.selectedFiscalYearId = null;

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // تجاهل
      }
    });
  },
});

export const {
  setFiscalYears,
  setSelectedFiscalYearId,
  fiscalYearRefreshRequested,
  resetFiscalYear,
} = fiscalYearSlice.actions;

export const selectFiscalYears = (state) => state.fiscalYear.fiscalYears;

export const selectSelectedFiscalYearId = (state) =>
  state.fiscalYear.selectedFiscalYearId;

export const selectSelectedFiscalYear = (state) =>
  state.fiscalYear.fiscalYears.find(
    (year) => year.id === state.fiscalYear.selectedFiscalYearId,
  ) || null;

export default fiscalYearSlice.reducer;
