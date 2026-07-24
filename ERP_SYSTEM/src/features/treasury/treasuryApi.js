import { baseApi } from "../../lib/baseApi";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// بيانات وهمية حركية للخزنة
const mockTransactions = [
  {
    id: "1",
    date: "2026-07-24",
    type: "in", // إيداع / تحصيل
    amount: 15000,
    category: "تحصيل فاتورة مبيعات",
    partyName: "شركة الأمل",
    referenceNumber: "INV-1002",
    notes: "دفعة نقدية",
  },
  {
    id: "2",
    date: "2026-07-23",
    type: "out", // صرف / مصروفات
    amount: 3200,
    category: "مصروفات تشغيل",
    partyName: "مصاريف وقود ومستلزمات",
    referenceNumber: "EXP-501",
    notes: "سولار للسيارات",
  },
];

export const treasuryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTreasuryTransactions: builder.query({
      queryFn: async (filters = {}) => {
        if (!USE_MOCK) throw new Error("Real API not connected");

        let result = [...mockTransactions];
        if (filters.date) {
          result = result.filter((t) => t.date === filters.date);
        }
        if (filters.type && filters.type !== "all") {
          result = result.filter((t) => t.type === filters.type);
        }
        if (filters.search) {
          const q = filters.search.toLowerCase();
          result = result.filter(
            (t) =>
              t.partyName?.toLowerCase().includes(q) ||
              t.category?.toLowerCase().includes(q) ||
              t.referenceNumber?.toLowerCase().includes(q)
          );
        }

        return { data: await mockDelay(result) };
      },
      providesTags: ["Treasury"],
    }),

    getTreasurySummary: builder.query({
      queryFn: async () => {
        const totalIn = mockTransactions
          .filter((t) => t.type === "in")
          .reduce((acc, curr) => acc + curr.amount, 0);
        const totalOut = mockTransactions
          .filter((t) => t.type === "out")
          .reduce((acc, curr) => acc + curr.amount, 0);
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
      queryFn: async (newTx) => {
        const transaction = {
          id: String(Date.now()),
          date: new Date().toISOString().split("T")[0],
          ...newTx,
        };
        mockTransactions.unshift(transaction);
        await mockDelay(null, 400);
        return { data: transaction };
      },
      invalidatesTags: ["Treasury"],
    }),
  }),
});

export const {
  useGetTreasuryTransactionsQuery,
  useGetTreasurySummaryQuery,
  useAddTransactionMutation,
} = treasuryApi;