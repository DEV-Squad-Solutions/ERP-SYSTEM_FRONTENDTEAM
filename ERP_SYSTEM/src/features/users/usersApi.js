// src/features/administration/usersApi.js
//
// ملحوظة مهمة: ده كان معرّف مرتين بنفس اسم الملف وبنفس الـ export
// (usersApi) في مكانين مختلفين - نسخة صغيرة فيها بس
// getUserById/updateUser، ونسخة تانية كاملة فيها getUsers/getRoles/
// createUser/deleteUser/assignCompaniesToUser. الاتنين بيعرّفوا
// getUserById/updateUser بنفس الاسم، فلو الاتنين اتحقنوا فعلاً في
// نفس baseApi، التعريف التاني كان بيتجاهل (overrideExisting افتراضيًا
// false) من غير أي warning واضح - باگ صامت.
//
// اتدمجوا هنا في ملف واحد. امسح أي ملف تاني اسمه usersApi.js عندك
// غير الملف ده.
import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params) => ({ url: "/Users", params }),
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
      query: (body) => ({ url: "/Users", method: "POST", body }),
      invalidatesTags: tagsFor("User"),
    }),

    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/Users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: tagsFor("User"),
    }),

    deleteUser: builder.mutation({
      query: (id) => ({ url: `/Users/${id}`, method: "DELETE" }),
      invalidatesTags: tagsFor("User"),
    }),

    assignCompaniesToUser: builder.mutation({
      // Body المتوقع: { companyIds: [1,2,3] } - عدّلها لو شكل الـ payload مختلف عندك
      query: ({ id, companyIds }) => ({
        url: `/Users/${id}/companies`,
        method: "PUT",
        body: { companyIds },
      }),
      invalidatesTags: tagsFor("User"),
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
