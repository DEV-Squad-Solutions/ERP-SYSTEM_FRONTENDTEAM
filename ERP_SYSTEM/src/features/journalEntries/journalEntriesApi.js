// src/features/journalEntries/journalEntriesApi.js
import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

export const JournalEntryType = {
  Manual: "Manual",
  Adjustment: "Adjustment",
  Opening: "Opening",
  Automatic: "Automatic",
};

// الأنواع اللي المستخدم يقدر يختارها يدويًا وقت الإنشاء/التعديل.
// Automatic بتتولد من المستند الأصلي بس، مش قابلة للإنشاء اليدوي.
export const MANUAL_ENTRY_TYPES = [
  JournalEntryType.Manual,
  JournalEntryType.Adjustment,
  JournalEntryType.Opening,
];

export const journalEntriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJournalEntries: builder.query({
      query: (params) => ({ url: "/JournalEntries", method: "GET", params }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((e) => ({ type: "JournalEntry", id: e.id })),
              { type: "JournalEntry", id: "LIST" },
            ]
          : [{ type: "JournalEntry", id: "LIST" }],
    }),

    getJournalEntryById: builder.query({
      query: (id) => ({ url: `/JournalEntries/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "JournalEntry", id }],
    }),

    createJournalEntry: builder.mutation({
      // body: { fiscalYearId, entryDate, description, entryType, lines: [{accountId, description, debit, credit}] }
      query: (body) => ({ url: "/JournalEntries", method: "POST", body }),
      invalidatesTags: tagsFor("JournalEntry"),
    }),

    updateJournalEntry: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/JournalEntries/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: tagsFor("JournalEntry"),
    }),

    deleteJournalEntry: builder.mutation({
      // rowVersion لازم يترسل زي ما هو راجع من الـ GET عشان الـ optimistic concurrency
      query: ({ id, rowVersion }) => ({
        url: `/JournalEntries/${id}`,
        method: "DELETE",
        params: { rowVersion },
      }),
      invalidatesTags: tagsFor("JournalEntry"),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetJournalEntriesQuery,
  useGetJournalEntryByIdQuery,
  useCreateJournalEntryMutation,
  useUpdateJournalEntryMutation,
  useDeleteJournalEntryMutation,
} = journalEntriesApi;
