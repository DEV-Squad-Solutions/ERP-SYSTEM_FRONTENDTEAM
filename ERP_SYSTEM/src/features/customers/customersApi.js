import { baseApi } from "../../lib/baseApi";
import { mockCustomers } from "../../mocks/data/customers";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query({
      ...(USE_MOCK
        ? { queryFn: async () => ({ data: await mockDelay(mockCustomers) }) }
        : { query: (params) => ({ url: "/customers", params }) }),
      providesTags: ["Customer"],
    }),
    createCustomer: builder.mutation({
      ...(USE_MOCK
        ? {
            queryFn: async (newCustomer) => {
              const data = {
                id: String(Date.now()),
                balance: 0,
                createdAt: new Date().toISOString(),
                ...newCustomer,
              };
              await mockDelay(null, 400);
              mockCustomers.push(data);
              return { data };
            },
          }
        : {
            query: (data) => ({
              url: "/customers",
              method: "POST",
              body: data,
            }),
          }),
      invalidatesTags: ["Customer"],
    }),
    deleteCustomer: builder.mutation({
      ...(USE_MOCK
        ? {
            queryFn: async (id) => {
              const index = mockCustomers.findIndex((c) => c.id === id);
              if (index !== -1) mockCustomers.splice(index, 1);
              await mockDelay(null);
              return { data: { id } };
            },
          }
        : { query: (id) => ({ url: `/customers/${id}`, method: "DELETE" }) }),
      invalidatesTags: ["Customer"],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;
