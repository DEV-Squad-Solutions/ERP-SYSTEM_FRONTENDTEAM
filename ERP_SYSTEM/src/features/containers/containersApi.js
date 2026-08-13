import { baseApi } from "../../lib/baseApi";

export const containersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /Containers يرجع شكل paginated: { items, pageNumber, pageSize, totalCount, totalPages }
    getContainers: builder.query({
      query: (params) => ({ url: "/Containers", method: "GET", params }),
      transformResponse: (response) => response.items,
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: "Container", id: c.id })),
              { type: "Container", id: "LIST" },
            ]
          : [{ type: "Container", id: "LIST" }],
    }),

    // Company-isolated select list used by the Allowed Containers step.
    // Always refetch on wizard open / company switch (no caching assumptions).
    getContainersSelect: builder.query({
      query: (params) => ({
        url: "Containers/select",
        method: "GET",
        params,
      }),
      providesTags: ["Container"],
    }),

    // Admin only. Inline creation from the Allowed Containers step.
    createContainer: builder.mutation({
      query: (data) => ({
        url: "Containers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Container", id: "LIST" }, "Container"],
    }),

    updateContainer: builder.mutation({
      query: ({ id, ...changes }) => ({
        url: `Containers/${id}`,
        method: "PUT",
        body: changes,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Container", id },
        { type: "Container", id: "LIST" },
        "Container",
      ],
    }),

    deleteContainer: builder.mutation({
      query: (id) => ({
        url: `Containers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Container", id: "LIST" }, "Container"],
    }),
  }),
});

export const {
  useGetContainersQuery,
  useGetContainersSelectQuery,
  useCreateContainerMutation,
  useUpdateContainerMutation,
  useDeleteContainerMutation,
} = containersApi;
