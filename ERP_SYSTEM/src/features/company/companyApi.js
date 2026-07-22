// src/features/company/companyApi.js
import { baseApi } from "../../lib/baseApi";

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompanyById: builder.query({
      query: (id) => `/companies/${id}`,
      providesTags: ["Company"],
    }),
  }),
});

export const { useGetCompanyByIdQuery } = companyApi;
