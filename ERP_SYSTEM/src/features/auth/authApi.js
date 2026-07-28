// src/features/auth/authApi.js
import { baseApi } from "../../lib/baseApi";
import { setCredentials, setCompanySelection } from "./authSlice";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {}
      },
    }),

    selectCompany: builder.mutation({
      query: (body) => ({
        url: "/auth/select-company",
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCompanySelection({ ...data, selectedCompanyId: arg.companyId }),
          );
        } catch {}
      },
    }),
  }),
});

export const { useLoginMutation, useSelectCompanyMutation } = authApi;
