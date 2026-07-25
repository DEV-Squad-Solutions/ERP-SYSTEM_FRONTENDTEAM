import { baseApi } from "../../lib/baseApi";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

let mockTransactions = [
  {
    id: "1",
    date: "2026-07-24",
    partyId: "1",
    partyName: "شركة الأمل",
    type: "in",
    debit: 15000,
    credit: 0,
    amountIn: 15000,
    amountOut: 0,
    notes: "دفعة نقدية تحصيل فاتورة",
  },
  {
    id: "2",
    date: "2026-07-23",
    partyId: "2",
    partyName: "شركة العالمية للمقاولات",
    type: "out",
    debit: 0,
    credit: 3200,
    amountIn: 0,
    amountOut: 3200,
    notes: "سولار ومستلزمات",
  },
];

export const treasuryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTreasuryTransactions: builder.query({
      queryFn: async (filters = {}, _queryApi, _extraOptions, fetchWithBaseQuery) => {
        if (!USE_MOCK) {
          return fetchWithBaseQuery({ url: "Treasury", params: filters });
        }

        let result = [...mockTransactions];

        // الفلترة بنوع الحركة
        if (filters.type && filters.type !== "all") {
          result = result.filter((t) => t.type === filters.type);
        }

        // الفلترة باسم الحساب (العميل / المورد)
        if (filters.partnerId || filters.partyId) {
          const selectedId = String(filters.partnerId || filters.partyId);
          result = result.filter(
            (t) => String(t.partyId || t.partnerId) === selectedId
          );
        }

        return { data: await mockDelay(result) };
      },
      providesTags: ["Treasury"],
    }),

    getTreasurySummary: builder.query({
      queryFn: async (_arg, _queryApi, _extraOptions, fetchWithBaseQuery) => {
        if (!USE_MOCK) {
          return fetchWithBaseQuery("Treasury/summary");
        }

        const totalIn = mockTransactions.reduce((acc, curr) => acc + (Number(curr.debit || curr.amountIn) || 0), 0);
        const totalOut = mockTransactions.reduce((acc, curr) => acc + (Number(curr.credit || curr.amountOut) || 0), 0);
        const currentBalance = totalIn - totalOut;

        return {
          data: await mockDelay({
            currentBalance,
            totalIn,
            totalOut,
          }),
        };
      },
      providesTags: ["Treasury"],
    }),

    addTransaction: builder.mutation({
      queryFn: async (newTx, _queryApi, _extraOptions, fetchWithBaseQuery) => {
        if (!USE_MOCK) {
          return fetchWithBaseQuery({
            url: "Treasury",
            method: "POST",
            body: newTx,
          });
        }

        const transaction = {
          id: String(Date.now()),
          date: newTx.date || new Date().toISOString().split("T")[0],
          ...newTx,
        };

        mockTransactions.unshift(transaction);
        await mockDelay(null, 300);
        return { data: transaction };
      },
      invalidatesTags: ["Treasury"],
    }),

    updateTransaction: builder.mutation({
      queryFn: async ({ id, ...updatedData }, _queryApi, _extraOptions, fetchWithBaseQuery) => {
        if (!USE_MOCK) {
          return fetchWithBaseQuery({
            url: `Treasury/${id}`,
            method: "PUT",
            body: updatedData,
          });
        }

        mockTransactions = mockTransactions.map((item) =>
          String(item.id) === String(id) ? { ...item, ...updatedData } : item
        );

        await mockDelay(null, 300);
        return { data: { id, ...updatedData } };
      },
      invalidatesTags: ["Treasury"],
    }),

    deleteTransaction: builder.mutation({
      queryFn: async (id, _queryApi, _extraOptions, fetchWithBaseQuery) => {
        if (!USE_MOCK) {
          return fetchWithBaseQuery({
            url: `Treasury/${id}`,
            method: "DELETE",
          });
        }

        mockTransactions = mockTransactions.filter((item) => String(item.id) !== String(id));
        await mockDelay(null, 300);
        return { data: { id } };
      },
      invalidatesTags: ["Treasury"],
    }),
  }),
});

export const {
  useGetTreasuryTransactionsQuery,
  useGetTreasurySummaryQuery,
  useAddTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} = treasuryApi;