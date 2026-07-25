import { baseApi } from "../../lib/baseApi";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

let mockBankTransactions = [
  {
    id: "1",
    date: "2026-07-24",
    partyId: "1",
    partyName: "شركة الأمل",
    type: "in",
    debit: 50000,
    credit: 0,
    amountIn: 50000,
    amountOut: 0,
    notes: "تحويل بنكي - سداد دفعة",
  },
  {
    id: "2",
    date: "2026-07-23",
    partyId: "2",
    partyName: "شركة العالمية للمقاولات",
    type: "out",
    debit: 0,
    credit: 12500,
    amountIn: 0,
    amountOut: 12500,
    notes: "تحويل تحصيل خامات",
  },
];

export const bankApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBankTransactions: builder.query({
      queryFn: async (filters = {}, _queryApi, _extraOptions, fetchWithBaseQuery) => {
        if (!USE_MOCK) {
          return fetchWithBaseQuery({ url: "Bank", params: filters });
        }

        let result = [...mockBankTransactions];

        // فلترة بالنوع
        if (filters.type && filters.type !== "all") {
          result = result.filter((t) => t.type === filters.type);
        }

        // فلترة باسم الحساب
        if (filters.partnerId || filters.partyId) {
          const selectedId = String(filters.partnerId || filters.partyId);
          result = result.filter(
            (t) => String(t.partyId || t.partnerId) === selectedId
          );
        }

        // فلترة بالتاريخ (من)
        if (filters.fromDate) {
          result = result.filter((t) => new Date(t.date) >= new Date(filters.fromDate));
        }

        // فلترة بالتاريخ (إلى)
        if (filters.toDate) {
          result = result.filter((t) => new Date(t.date) <= new Date(filters.toDate));
        }

        return { data: await mockDelay(result) };
      },
      providesTags: ["Bank"],
    }),

    getBankSummary: builder.query({
      queryFn: async (_arg, _queryApi, _extraOptions, fetchWithBaseQuery) => {
        if (!USE_MOCK) {
          return fetchWithBaseQuery("Bank/summary");
        }

        const totalIn = mockBankTransactions.reduce((acc, curr) => acc + (Number(curr.debit || curr.amountIn) || 0), 0);
        const totalOut = mockBankTransactions.reduce((acc, curr) => acc + (Number(curr.credit || curr.amountOut) || 0), 0);
        const currentBalance = totalIn - totalOut;

        return {
          data: await mockDelay({
            currentBalance,
            totalIn,
            totalOut,
          }),
        };
      },
      providesTags: ["Bank"],
    }),

    addBankTransaction: builder.mutation({
      queryFn: async (newTx, _queryApi, _extraOptions, fetchWithBaseQuery) => {
        if (!USE_MOCK) {
          return fetchWithBaseQuery({
            url: "Bank",
            method: "POST",
            body: newTx,
          });
        }

        const transaction = {
          id: String(Date.now()),
          date: newTx.date || new Date().toISOString().split("T")[0],
          ...newTx,
        };

        mockBankTransactions.unshift(transaction);
        await mockDelay(null, 300);
        return { data: transaction };
      },
      invalidatesTags: ["Bank"],
    }),

    updateBankTransaction: builder.mutation({
      queryFn: async ({ id, ...updatedData }, _queryApi, _extraOptions, fetchWithBaseQuery) => {
        if (!USE_MOCK) {
          return fetchWithBaseQuery({
            url: `Bank/${id}`,
            method: "PUT",
            body: updatedData,
          });
        }

        mockBankTransactions = mockBankTransactions.map((item) =>
          String(item.id) === String(id) ? { ...item, ...updatedData } : item
        );

        await mockDelay(null, 300);
        return { data: { id, ...updatedData } };
      },
      invalidatesTags: ["Bank"],
    }),

    deleteBankTransaction: builder.mutation({
      queryFn: async (id, _queryApi, _extraOptions, fetchWithBaseQuery) => {
        if (!USE_MOCK) {
          return fetchWithBaseQuery({
            url: `Bank/${id}`,
            method: "DELETE",
          });
        }

        mockBankTransactions = mockBankTransactions.filter((item) => String(item.id) !== String(id));
        await mockDelay(null, 300);
        return { data: { id } };
      },
      invalidatesTags: ["Bank"],
    }),
  }),
});

export const {
  useGetBankTransactionsQuery,
  useGetBankSummaryQuery,
  useAddBankTransactionMutation,
  useUpdateBankTransactionMutation,
  useDeleteBankTransactionMutation,
} = bankApi;