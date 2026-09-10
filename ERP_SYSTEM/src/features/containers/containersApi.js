import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

export const containersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContainers: builder.query({
      query: (params) => ({ url: "/Containers", method: "GET", params }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((c) => ({ type: "Container", id: c.id })),
              { type: "Container", id: "LIST" },
            ]
          : [{ type: "Container", id: "LIST" }],
    }),

    // Company-isolated select list used by the Allowed Containers step.
    // Always refetch on wizard open / company switch (no caching assumptions).
    getContainersSelect: builder.query({
      query: (params) => ({ url: "Containers/select", method: "GET", params }),
      providesTags: ["Container"],
    }),

    // Admin only. Inline creation from the Allowed Containers step.
    createContainer: builder.mutation({
      query: (data) => ({ url: "Containers", method: "POST", body: data }),
      invalidatesTags: tagsFor("Container"),
    }),

    updateContainer: builder.mutation({
      query: ({ id, ...changes }) => ({
        url: `Containers/${id}`,
        method: "PUT",
        body: changes,
      }),
      invalidatesTags: tagsFor("Container"),
    }),

    deleteContainer: builder.mutation({
      query: (id) => ({ url: `Containers/${id}`, method: "DELETE" }),
      invalidatesTags: tagsFor("Container"),
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
