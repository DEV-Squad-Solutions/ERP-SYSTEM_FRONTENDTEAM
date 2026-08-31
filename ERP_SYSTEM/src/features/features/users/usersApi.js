import { baseApi } from "../../../lib/baseApi";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserById: builder.query({
      query: (id) => ({
        url: `Users/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `Users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }],
    }),
  }),
});

export const { useGetUserByIdQuery, useUpdateUserMutation } = usersApi;
