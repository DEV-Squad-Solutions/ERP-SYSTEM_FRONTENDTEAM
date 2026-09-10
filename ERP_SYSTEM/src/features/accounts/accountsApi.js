import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

export const accountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccountsTree: builder.query({
      query: () => ({ url: "/Accounts/tree", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...flattenTreeIds(result).map((id) => ({ type: "Account", id })),
              { type: "Account", id: "TREE" },
            ]
          : [{ type: "Account", id: "TREE" }],
    }),

    getAccounts: builder.query({
      query: (params) => ({ url: "/Accounts", method: "GET", params }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((a) => ({ type: "Account", id: a.id })),
              { type: "Account", id: "LIST" },
            ]
          : [{ type: "Account", id: "LIST" }],
    }),

    getAccountsSelect: builder.query({
      query: () => ({ url: "/Accounts/select", method: "GET" }),
      providesTags: [{ type: "Account", id: "SELECT" }],
    }),

    getAccountJournalSelect: builder.query({
      query: (params) => ({
        url: "/Accounts/journal-select",
        method: "GET",
        params,
      }),
      providesTags: [{ type: "Account", id: "JOURNAL_SELECT" }],
    }),

    getAccountById: builder.query({
      query: (id) => ({ url: `/Accounts/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Account", id }],
    }),

    createAccount: builder.mutation({
      query: (body) => ({ url: "/Accounts", method: "POST", body }),
      // tagsFor("Account") بيغطي TREE/LIST/SELECT/JOURNAL_SELECT وأي id
      // فردي مرة واحدة - مش محتاج تسردهم يدوي زي الأول.
      invalidatesTags: tagsFor("Account"),
    }),

    updateAccount: builder.mutation({
      // متوقع body يحتوي على rowVersion للـ optimistic concurrency زي باقي الموديولات
      query: ({ id, ...body }) => ({
        url: `/Accounts/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: tagsFor("Account"),
    }),

    deleteAccount: builder.mutation({
      query: (id) => ({ url: `/Accounts/${id}`, method: "DELETE" }),
      invalidatesTags: tagsFor("Account"),
    }),
  }),
  overrideExisting: false,
});

function flattenTreeIds(nodes) {
  const ids = [];
  const walk = (list) => {
    list.forEach((n) => {
      ids.push(n.id);
      if (n.children?.length) walk(n.children);
    });
  };
  walk(nodes);
  return ids;
}

/** يرجّع Set بكل الـ ids بتاعة حساب معين + كل أحفاده - يستخدم لمنع اختيار الحساب نفسه أو فرع منه كأب له */
export function getDescendantIds(node) {
  const ids = new Set([node.id]);
  const walk = (n) => {
    n.children?.forEach((child) => {
      ids.add(child.id);
      walk(child);
    });
  };
  walk(node);
  return ids;
}

/** بيدور على node معينة جوه الشجرة بالـ id */
export function findAccountNode(tree, id) {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findAccountNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export const {
  useGetAccountsTreeQuery,
  useGetAccountsQuery,
  useGetAccountsSelectQuery,
  useGetAccountJournalSelectQuery,
  useGetAccountByIdQuery,
  useLazyGetAccountByIdQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} = accountsApi;
