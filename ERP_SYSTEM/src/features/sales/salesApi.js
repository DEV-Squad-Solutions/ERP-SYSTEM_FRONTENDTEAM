import { baseApi } from "../../lib/baseApi";
import { mockSalesInvoices } from "../../mocks/data/sales";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

function applyFilters(invoices, f) {
  let result = [...invoices];
  if (f.invoiceNumber) {
    result = result.filter((r) =>
      r.invoiceNumber.toLowerCase().includes(f.invoiceNumber.toLowerCase()),
    );
  }
  if (f.movementType)
    result = result.filter((r) => r.movementType === f.movementType);
  if (f.partyId) result = result.filter((r) => r.partyName === f.partyId); // في الـ mock بنستخدم الاسم كـ id مؤقتًا
  if (f.storeId) result = result.filter((r) => r.storeName === f.storeId);
  if (f.driverId) result = result.filter((r) => r.driverName === f.driverId);
  if (f.paymentMethod)
    result = result.filter((r) => r.paymentMethod === f.paymentMethod);
  if (f.status) result = result.filter((r) => r.status === f.status);
  if (f.fromDate) result = result.filter((r) => r.date >= f.fromDate);
  if (f.toDate) result = result.filter((r) => r.date <= f.toDate);
  return result;
}
function applySort(invoices, sortBy, sortDir) {
  if (!sortBy) return invoices;
  const sorted = [...invoices].sort((a, b) => {
    const valA = a[sortBy] ?? "";
    const valB = b[sortBy] ?? "";
    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });
  return sorted;
}

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query({
      queryFn: USE_MOCK
        ? async (params) => {
            const {
              page = 1,
              pageSize = 25,
              sortBy,
              sortDir,
              ...filters
            } = params || {};
            let result = applyFilters(mockSalesInvoices, filters);
            result = applySort(result, sortBy, sortDir);
            const totalCount = result.length;
            const start = (page - 1) * pageSize;
            const items = result.slice(start, start + pageSize);
            return {
              data: await mockDelay({
                items,
                totalCount,
                pageNumber: page,
                pageSize,
              }),
            };
          }
        : undefined,
      query: USE_MOCK ? undefined : (params) => ({ url: "Sales", params }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map(({ id }) => ({ type: "Sale", id })),
              { type: "Sale", id: "LIST" },
            ]
          : [{ type: "Sale", id: "LIST" }],
    }),

    getSalesSummary: builder.query({
      queryFn: USE_MOCK
        ? async (params) => {
            const { page, pageSize, sortBy, sortDir, ...filters } =
              params || {};
            const result = applyFilters(mockSalesInvoices, filters);
            const summary = {
              invoicesCount: result.length,
              totalAmount: result.reduce((s, r) => s + r.total, 0),
              totalPaid: result.reduce((s, r) => s + r.paid, 0),
              totalRemaining: result.reduce((s, r) => s + r.remaining, 0),
            };
            return { data: await mockDelay(summary) };
          }
        : undefined,
      query: USE_MOCK
        ? undefined
        : (params) => ({ url: "Sales/summary", params }),
      providesTags: ["SaleSummary"],
    }),

    getInvoiceById: builder.query({
      queryFn: USE_MOCK
        ? async (id) => {
            const invoice = mockSalesInvoices.find((inv) => inv.id === id);
            if (!invoice)
              return { error: { status: 404, data: "الفاتورة غير موجودة" } };
            return { data: await mockDelay(invoice) };
          }
        : undefined,
      query: USE_MOCK ? undefined : (id) => `Sales/${id}`,
      providesTags: (result, error, id) => [{ type: "Sale", id }],
    }),

    createInvoice: builder.mutation({
      queryFn: USE_MOCK
        ? async (invoiceData) => {
            const items = invoiceData.items.map((item) => ({
              ...item,
              value: Number(item.quantity) * Number(item.price),
            }));
            const total = items.reduce((s, it) => s + it.value, 0);
            const newInvoice = {
              id: String(Date.now()),
              ...invoiceData,
              items,
              total,
              remaining:
                total -
                (invoiceData.discount || 0) +
                (invoiceData.tax || 0) -
                (invoiceData.paid || 0),
            };
            await mockDelay(null, 500);
            mockSalesInvoices.unshift(newInvoice);
            return { data: newInvoice };
          }
        : undefined,
      query: USE_MOCK
        ? undefined
        : (data) => ({ url: "Sales", method: "POST", body: data }),
      invalidatesTags: [{ type: "Sale", id: "LIST" }, "SaleSummary"],
    }),

    updateSaleLine: builder.mutation({
      queryFn: USE_MOCK
        ? async ({ id, ...changes }) => {
            const index = mockSalesInvoices.findIndex((inv) => inv.id === id);
            if (index === -1)
              return { error: { status: 404, data: "الفاتورة غير موجودة" } };
            const items = (changes.items || []).map((item) => ({
              ...item,
              value: Number(item.quantity) * Number(item.price),
            }));
            const total = items.reduce((s, it) => s + it.value, 0);
            mockSalesInvoices[index] = {
              ...mockSalesInvoices[index],
              ...changes,
              items,
              total,
              remaining:
                total -
                (changes.discount || 0) +
                (changes.tax || 0) -
                (changes.paid || 0),
            };
            await mockDelay(null, 400);
            return { data: mockSalesInvoices[index] };
          }
        : undefined,
      query: USE_MOCK
        ? undefined
        : ({ id, ...data }) => ({
            url: `Sales/${id}`,
            method: "PUT",
            body: data,
          }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Sale", id },
        { type: "Sale", id: "LIST" },
        "SaleSummary",
      ],
    }),

    deleteSaleLine: builder.mutation({
      queryFn: USE_MOCK
        ? async (id) => {
            const index = mockSalesInvoices.findIndex((inv) => inv.id === id);
            if (index !== -1) mockSalesInvoices.splice(index, 1);
            await mockDelay(null, 300);
            return { data: { id } };
          }
        : undefined,
      query: USE_MOCK
        ? undefined
        : (id) => ({ url: `Sales/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Sale", id: "LIST" }, "SaleSummary"],
    }),

    duplicateInvoice: builder.mutation({
      queryFn: USE_MOCK
        ? async (id) => {
            const original = mockSalesInvoices.find((inv) => inv.id === id);
            if (!original)
              return { error: { status: 404, data: "الفاتورة غير موجودة" } };
            const copy = {
              ...original,
              id: String(Date.now()),
              invoiceNumber: generateInvoiceNumberFromMock(
                original.movementType,
              ),
            };
            await mockDelay(null, 400);
            mockSalesInvoices.unshift(copy);
            return { data: copy };
          }
        : undefined,
      query: USE_MOCK
        ? undefined
        : (id) => ({ url: `Sales/${id}/duplicate`, method: "POST" }),
      invalidatesTags: [{ type: "Sale", id: "LIST" }, "SaleSummary"],
    }),
    getInvoiceAuditLog: builder.query({
      query: (id) => `/sales-invoices/${id}/audit-log`,
      providesTags: (result, error, id) => [{ type: "InvoiceAuditLog", id }],
    }),
  }),
});

function generateInvoiceNumberFromMock(movementType) {
  const prefix = movementType === "purchase" ? "PUR" : "SAL";
  return `${prefix}-${Math.floor(Math.random() * 9000) + 1000}`;
}

export const {
  useGetInvoicesQuery,
  useGetSalesSummaryQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useUpdateSaleLineMutation,
  useDeleteSaleLineMutation,
  useDuplicateInvoiceMutation,
  useGetInvoiceAuditLogQuery,
} = salesApi;
