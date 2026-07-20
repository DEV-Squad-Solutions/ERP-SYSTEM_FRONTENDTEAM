import { baseApi } from "../../lib/baseApi";
import { mockPurchasesLines } from "../../mocks/data/purchases";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

function applyFilters(lines, filters) {
  let result = [...lines];
  const f = filters || {};

  if (f.date) {
    result = result.filter((r) => r.date === f.date);
  }
  if (f.invoiceNumber) {
    result = result.filter((r) =>
      r.invoiceNumber.toLowerCase().includes(f.invoiceNumber.toLowerCase()),
    );
  }
  if (f.partyName) {
    result = result.filter((r) =>
      r.partyName.toLowerCase().includes(f.partyName.toLowerCase()),
    );
  }
  if (f.country) {
    result = result.filter((r) => r.country === f.country);
  }
  if (f.driverName) {
    result = result.filter((r) =>
      r.driverName.toLowerCase().includes(f.driverName.toLowerCase()),
    );
  }
  if (f.carNumber) {
    result = result.filter((r) => r.carNumber.includes(f.carNumber));
  }
  return result;
}

export const purchasesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchasesLines: builder.query({
      queryFn: async (filters) => {
        if (!USE_MOCK) {
          throw new Error("Real API not connected yet");
        }
        const result = applyFilters(mockPurchasesLines, filters);
        return { data: await mockDelay(result) };
      },
      providesTags: ["Purchase"],
    }),

    updatePurchaseLine: builder.mutation({
      queryFn: async ({ id, changes }) => {
        const index = mockPurchasesLines.findIndex((r) => r.id === id);
        if (index !== -1) {
          mockPurchasesLines[index] = {
            ...mockPurchasesLines[index],
            ...changes,
          };
        }
        await mockDelay(null, 300);
        return { data: mockPurchasesLines[index] };
      },
      invalidatesTags: ["Purchase"],
    }),

    deletePurchasesLine: builder.mutation({
      queryFn: async (id) => {
        const index = mockPurchasesLines.findIndex((r) => r.id === id);
        if (index !== -1) mockPurchasesLines.splice(index, 1);
        await mockDelay(null, 300);
        return { data: { id } };
      },
      invalidatesTags: ["Sale"],
    }),
    getInvoiceDetails: builder.query({
      queryFn: async (invoiceNumber) => {
        const lines = mockPurchasesLines.filter(
          (r) => r.invoiceNumber === invoiceNumber,
        );
        if (lines.length === 0) {
          return { error: { status: 404, data: "الفاتورة غير موجودة" } };
        }

        const first = lines[0];
        const total = lines.reduce((sum, l) => sum + l.value, 0);
        const discount = first.invoiceDiscount || 0;
        const tax = first.invoiceTax || 0;
        const paid = first.invoicePaid || 0;
        const remaining = total - discount + tax - paid;

        const data = {
          invoiceNumber,
          date: first.date,
          movementType: first.movementType,
          partyName: first.partyName,
          country: first.country,
          driverName: first.driverName,
          carNumber: first.carNumber,
          lines,
          total,
          discount,
          tax,
          paid,
          remaining,
        };

        return { data: await mockDelay(data) };
      },
      providesTags: ["Purchase"],
    }),
    createPurchasesInvoice: builder.mutation({
      queryFn: async (invoiceData) => {
        const { lines, ...header } = invoiceData;

        const newLines = lines.map((line, index) => ({
          id: `${Date.now()}-${index}`,
          ...header,
          ...line,
          value: Number(line.quantity) * Number(line.price),
        }));

        await mockDelay(null, 500);
        mockPurchasesLines.push(...newLines);

        return { data: newLines };
      },
      invalidatesTags: ["Purchase"],
    }),
    getPurchasesSummary: builder.query({
      query: (id) => `Purchase/${id}/summary`,
      providesTags: (result, error, id) => [{ type: "PurchaseSummary", id }],
    }),
  }),
});

export const {
  useGetPurchasesLinesQuery,
  useUpdatePurchaseLineMutation,
  useDeletePurchasesLineMutation,
  useGetInvoiceDetailsQuery,
  useCreatePurchasesInvoiceMutation,
  useGetPurchasesSummaryQuery,
} = purchasesApi;
