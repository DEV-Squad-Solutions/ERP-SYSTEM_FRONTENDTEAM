import { baseApi } from "../../lib/baseApi";
import { mockSalesLines } from "../../mocks/data/sales";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

function applyFilters(lines, filters) {
  let result = [...lines];
  const f = filters || {};

  if (f.movementType && f.movementType !== "all") {
    result = result.filter((r) => r.movementType === f.movementType);
  }

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
  console.log("applyFilters after movementType:", result);
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
    getInvoiceDetails: builder.query({
      queryFn: async (invoiceNumber) => {
        const lines = mockSalesLines.filter(
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
  }),
});

export const {
  useGetSaleLinesQuery,
  useUpdateSaleLineMutation,
  useDeleteSaleLineMutation,
  useGetInvoiceDetailsQuery,
  useCreateSaleInvoiceMutation,
} = salesApi;
