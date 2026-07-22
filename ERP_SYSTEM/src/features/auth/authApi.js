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
        } catch {
          // الخطأ بيتلقط من useLoginMutation في الـ component
        }
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
          // arg.companyId هو الـ id اللي بعتناه وقت الاستدعاء
          dispatch(
            setCompanySelection({ ...data, selectedCompanyId: arg.companyId }),
          );
        } catch {
          // الخطأ بيتلقط من useSelectCompanyMutation في الـ component
        }
      },
    }),
  }),
});

export const { useLoginMutation, useSelectCompanyMutation } = authApi;
