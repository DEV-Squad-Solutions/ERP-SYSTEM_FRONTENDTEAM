import { baseApi } from "../../lib/baseApi";
import { mockCompanies } from "../../mocks/data/companies";
import { mockUsers } from "../../mocks/data/users";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompanies: builder.query({
      ...(USE_MOCK
        ? { queryFn: async () => ({ data: await mockDelay(mockCompanies) }) }
        : { query: () => "/companies/list" }),
    }),

    login: builder.mutation({
      ...(USE_MOCK
        ? {
            queryFn: async ({ companyId, username, password }) => {
              await mockDelay(null, 600);
              const user = mockUsers.find(
                (u) =>
                  u.username === username &&
                  u.password === password &&
                  u.companyId === companyId,
              );
              if (!user) {
                return {
                  error: { status: 401, data: "بيانات الدخول غير صحيحة" },
                };
              }
              return {
                data: {
                  user: {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                  },
                  token: "mock-token-" + user.id,
                },
              };
            },
          }
        : {
            query: (body) => ({ url: "/auth/login", method: "POST", body }),
          }),
    }),

    // ⬇️ ده اللي كان ناقص
    registerCompany: builder.mutation({
      ...(USE_MOCK
        ? {
            queryFn: async (newCompany) => {
              const data = {
                id: String(Date.now()),
                ...newCompany,
              };
              await mockDelay(null, 600);
              mockCompanies.push({ id: data.id, name: data.name });
              return { data };
            },
          }
        : {
            query: (data) => ({
              url: "/companies/register",
              method: "POST",
              body: data,
            }),
          }),
    }),
  }),
});

export const {
  useGetCompaniesQuery,
  useLoginMutation,
  useRegisterCompanyMutation, // ⬅️ لازم يتصدّر برضه
} = authApi;
