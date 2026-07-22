import { baseApi } from "../../lib/baseApi";
import { mockSalesLines } from "../../mocks/data/sales";
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

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSaleLines: builder.query({
      queryFn: async (filters) => {
        if (!USE_MOCK) {
          throw new Error("Real API not connected yet");
        }
        const result = applyFilters(mockSalesLines, filters);
        return { data: await mockDelay(result) };
      },
      providesTags: ["Sale"],
    }),

    updateSaleLine: builder.mutation({
      queryFn: async ({ id, changes }) => {
        const index = mockSalesLines.findIndex((r) => r.id === id);
        if (index !== -1) {
          mockSalesLines[index] = { ...mockSalesLines[index], ...changes };
        }
        await mockDelay(null, 300);
        return { data: mockSalesLines[index] };
      },
      invalidatesTags: ["Sale"],
    }),

    deleteSaleLine: builder.mutation({
      queryFn: async (id) => {
        const index = mockSalesLines.findIndex((r) => r.id === id);
        if (index !== -1) mockSalesLines.splice(index, 1);
        await mockDelay(null, 300);
        return { data: { id } };
      },
      invalidatesTags: ["Sale"],
    }),
    getInvoiceById: builder.query({
      queryFn: async (id) => {
        if (!USE_MOCK) throw new Error("Real API not connected yet");
        const invoice = mockSalesLines.find((inv) => inv.id === id);
        if (!invoice) {
          return { error: { status: 404, data: "الفاتورة غير موجودة" } };
        }
        return { data: await mockDelay(invoice) };
      },
      providesTags: ["Sale"],
    }),
    createSaleInvoice: builder.mutation({
      queryFn: async (invoiceData) => {
        const { lines, ...header } = invoiceData;

        const newLines = lines.map((line, index) => ({
          id: `${Date.now()}-${index}`,
          ...header,
          ...line,
          value: Number(line.quantity) * Number(line.price),
        }));

        await mockDelay(null, 500);
        mockSalesLines.push(...newLines);

        return { data: newLines };
      },
      invalidatesTags: ["Sale"],
    }),
    getSaleSummary: builder.query({
      query: (id) => `Sales/${id}/summary`,
      providesTags: (result, error, id) => [{ type: "SaleSummary", id }],
    }),
  }),
});

export const {
  useGetSaleLinesQuery,
  useUpdateSaleLineMutation,
  useDeleteSaleLineMutation,
  useGetInvoiceByIdQuery,
  useCreateSaleInvoiceMutation,
  useGetSaleSummaryQuery,
} = salesApi;
