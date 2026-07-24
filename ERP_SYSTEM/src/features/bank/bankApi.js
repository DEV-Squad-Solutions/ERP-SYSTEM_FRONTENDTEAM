import { baseApi } from "../../lib/baseApi";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const mockBankTransactions = [
  {
    id: "b1",
    date: "2026-07-24",
    type: "in", // إيداع / تحويل وارد
    amount: 50000,
    bankName: "البنك الأهلي المصري",
    accountNumber: "EG12345678901234567890",
    category: "تحويل بنكي من عميل",
    partyName: "شركة العالمية للتجارة",
    referenceNumber: "TRX-98213",
    notes: "تحويل على الحساب الجاري",
  },
  {
    id: "b2",
    date: "2026-07-22",
    type: "out", // تحويل صادر / سداد
    amount: 12500,
    bankName: "بنك مصر",
    accountNumber: "EG09876543210987654321",
    category: "سداد مستحقات مورّد",
    partyName: "مؤسسة النور للمهمات",
    referenceNumber: "CHK-4412",
    notes: "شيك مقبول الدفع",
  },
];

export const bankApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBankTransactions: builder.query({
      queryFn: async (filters = {}) => {
        if (!USE_MOCK) throw new Error("Real API not connected");

        let result = [...mockBankTransactions];
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
              t.bankName?.toLowerCase().includes(q) ||
              t.referenceNumber?.toLowerCase().includes(q)
          );
        }

        return { data: await mockDelay(result) };
      },
      providesTags: ["Bank"],
    }),

    getBankSummary: builder.query({
      queryFn: async () => {
        const totalIn = mockBankTransactions
          .filter((t) => t.type === "in")
          .reduce((acc, curr) => acc + curr.amount, 0);
        const totalOut = mockBankTransactions
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
      providesTags: ["Bank"],
    }),

    addBankTransaction: builder.mutation({
      queryFn: async (newTx) => {
        const transaction = {
          id: String(Date.now()),
          date: new Date().toISOString().split("T")[0],
          ...newTx,
        };
        mockBankTransactions.unshift(transaction);
        await mockDelay(null, 400);
        return { data: transaction };
      },
      invalidatesTags: ["Bank"],
    }),
  }),
});

export const {
  useGetBankTransactionsQuery,
  useGetBankSummaryQuery,
  useAddBankTransactionMutation,
} = bankApi;