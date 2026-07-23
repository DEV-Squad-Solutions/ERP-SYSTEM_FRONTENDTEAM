import { baseApi } from "../../lib/baseApi";
import { mockContainers } from "../../mocks/data/Containers";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "false";

export const containersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContainers: builder.query({
      ...(USE_MOCK
        ? {
            queryFn: async () => ({
              data: await mockDelay([...mockContainers]),
            }),
          }
        : {
            query: () => ({ url: "/Containers", method: "GET" }),
          }),
      providesTags: ["Container"],
    }),

    // Company-isolated select list used by the Allowed Containers step.
    // Always refetch on wizard open / company switch (no caching assumptions).
    getContainersSelect: builder.query({
      ...(USE_MOCK
        ? {
            queryFn: async (params) => {
              let data = [...mockContainers];
              if (params?.search) {
                const q = params.search.toLowerCase();
                data = data.filter(
                  (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.code.toLowerCase().includes(q),
                );
              }
              return { data: await mockDelay(data) };
            },
          }
        : {
            query: (params) => ({
              url: "Containers/select",
              method: "GET",
              params,
            }),
          }),
      providesTags: ["Container"],
    }),

    // Admin only. Inline creation from the Allowed Containers step.
    createContainer: builder.mutation({
      ...(USE_MOCK
        ? {
            queryFn: async (data) => {
              const created = {
                id: `cnt-${mockContainers.length + 1}`,
                isActive: true,
                ...data,
              };
              mockContainers.push(created);
              return { data: await mockDelay(created) };
            },
          }
        : {
            query: (data) => ({
              url: "Containers",
              method: "POST",
              body: data,
            }),
          }),
      invalidatesTags: ["Container"],
    }),
  }),
});

export const {
  useGetContainersQuery,
  useGetContainersSelectQuery,
  useCreateContainerMutation,
} = containersApi;
