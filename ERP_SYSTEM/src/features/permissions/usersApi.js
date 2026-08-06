import { baseApi } from "../../lib/baseApi";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params) => ({
        url: "/Users",
        params,
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map(({ id }) => ({ type: "User", id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    getUserById: builder.query({
      query: (id) => `/Users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),

    getRoles: builder.query({
      query: () => "/Users/roles",
    }),

    createUser: builder.mutation({
      query: (body) => ({
        url: "/Users",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/Users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/Users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    assignCompaniesToUser: builder.mutation({
      // Body المتوقع: { companyIds: [1,2,3] } - عدّلها لو شكل الـ payload مختلف عندك
      query: ({ id, companyIds }) => ({
        url: `/Users/${id}/companies`,
        method: "PUT",
        body: { companyIds },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetRolesQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useAssignCompaniesToUserMutation,
} = usersApi;
