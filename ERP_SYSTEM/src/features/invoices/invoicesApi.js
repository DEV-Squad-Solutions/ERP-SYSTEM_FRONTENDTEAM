import { baseApi } from "../../lib/baseApi";
import { mockInvoices } from "../../mocks/data/invoices";
import { mockParties } from "../../mocks/data/parties";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const invoicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query({
      ...(USE_MOCK
        ? {
            queryFn: async (type) => {
              const data = mockInvoices.filter((inv) => inv.type === type);
              return { data: await mockDelay(data) };
            },
          }
        : { query: (type) => ({ url: "/invoices", params: { type } }) }),
      providesTags: (result, error, type) => [
        type === "purchase" ? "Purchase" : "Sale",
      ],
    }),

    getParties: builder.query({
      ...(USE_MOCK
        ? {
            queryFn: async (partyType) => {
              const data = mockParties.filter((p) => p.type === partyType);
              return { data: await mockDelay(data) };
            },
          }
        : {
            query: (partyType) => ({
              url: "/parties",
              params: { type: partyType },
            }),
          }),
    }),

    createInvoice: builder.mutation({
      ...(USE_MOCK
        ? {
            queryFn: async (invoice) => {
              const data = {
                id: String(Date.now()),
                ...invoice,
              };
              await mockDelay(null, 500);
              mockInvoices.push(data);
              return { data };
            },
          }
        : {
            query: (data) => ({ url: "/invoices", method: "POST", body: data }),
          }),
      invalidatesTags: (result, error, arg) => [
        arg.type === "purchase" ? "Purchase" : "Sale",
        "Inventory",
      ],
    }),

    deleteInvoice: builder.mutation({
      ...(USE_MOCK
        ? {
            queryFn: async (id) => {
              const index = mockInvoices.findIndex((inv) => inv.id === id);
              if (index !== -1) mockInvoices.splice(index, 1);
              await mockDelay(null);
              return { data: { id } };
            },
          }
        : { query: (id) => ({ url: `/invoices/${id}`, method: "DELETE" }) }),
      invalidatesTags: ["Purchase", "Sale", "Inventory"],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetPartiesQuery,
  useCreateInvoiceMutation,
  useDeleteInvoiceMutation,
} = invoicesApi;
