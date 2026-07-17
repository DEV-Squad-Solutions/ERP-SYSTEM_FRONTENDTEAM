import { baseApi } from "../../lib/baseApi";
import { mockCompanies } from "../../mocks/data/companies";
import { mockDelay } from "../../mocks/mockDelay";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompanyById: builder.query({
      ...(USE_MOCK
        ? {
            queryFn: async (id) => {
              const company = mockCompanies.find((c) => c.id === id);
              if (!company) {
                return { error: { status: 404, data: "الشركة غير موجودة" } };
              }
              return { data: await mockDelay(company) };
            },
          }
        : { query: (id) => `/companies/${id}` }),
      providesTags: ["Company"],
    }),
  }),
});

export const { useGetCompanyByIdQuery } = companyApi;
