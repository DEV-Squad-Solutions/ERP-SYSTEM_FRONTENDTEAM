import { baseApi } from "../../lib/baseApi";
import { mockPartyStatementEntries } from "../../mocks/data/Partystatement";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const partyStatementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // كشف حساب عميل/مورد: تاريخ - بيان - كمية - سعر - مدين - دائن - رصيد - ملاحظات
    getPartyStatement: builder.query({
      ...(USE_MOCK
        ? {
            queryFn: async ({ partyId, from, to, direction, search } = {}) => {
              let data = mockPartyStatementEntries.filter(
                (e) => e.partyId === partyId,
              );
              if (from) data = data.filter((e) => e.date >= from);
              if (to) data = data.filter((e) => e.date <= to);
              if (direction && direction !== "all") {
                data = data.filter((e) => e.direction === direction);
              }
              if (search) {
                const q = search.toLowerCase();
                data = data.filter((e) =>
                  e.description.toLowerCase().includes(q),
                );
              }
              return { data: await mockDelay(data) };
            },
          }
        : {
            query: ({ partyId, ...params }) => ({
              url: `PartyStatements/${partyId}`,
              method: "GET",
              params,
            }),
          }),
      providesTags: (result, error, { partyId }) => [
        { type: "PartyStatement", id: partyId },
      ],
    }),

    // تعديل بند (البيان / الكمية / السعر / الملاحظات ...)
    updateStatementEntry: builder.mutation({
      ...(USE_MOCK
        ? {
            queryFn: async ({ id, partyId, ...data }) => {
              const index = mockPartyStatementEntries.findIndex(
                (e) => e.id === id,
              );
              if (index !== -1) {
                mockPartyStatementEntries[index] = {
                  ...mockPartyStatementEntries[index],
                  ...data,
                };
              }
              return {
                data: await mockDelay(mockPartyStatementEntries[index]),
              };
            },
          }
        : {
            query: ({ id, partyId, ...data }) => ({
              url: `PartyStatements/${id}`,
              method: "PUT",
              body: data,
            }),
          }),
      invalidatesTags: (result, error, { partyId }) => [
        { type: "PartyStatement", id: partyId },
      ],
    }),

    deleteStatementEntry: builder.mutation({
      ...(USE_MOCK
        ? {
            queryFn: async ({ id }) => {
              const index = mockPartyStatementEntries.findIndex(
                (e) => e.id === id,
              );
              if (index !== -1) mockPartyStatementEntries.splice(index, 1);
              return { data: await mockDelay({ id }) };
            },
          }
        : {
            query: ({ id }) => ({
              url: `PartyStatements/${id}`,
              method: "DELETE",
            }),
          }),
      invalidatesTags: (result, error, { partyId }) => [
        { type: "PartyStatement", id: partyId },
      ],
    }),
  }),
});

export const {
  useGetPartyStatementQuery,
  useUpdateStatementEntryMutation,
  useDeleteStatementEntryMutation,
} = partyStatementApi;
