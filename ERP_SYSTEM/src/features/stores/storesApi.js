import { baseApi } from "../../lib/baseApi";

export const storesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStoresSelect: builder.query({
      query: () => "Stores/select",
      providesTags: ["Store"],
    }),
  }),
});

export const { useGetStoresSelectQuery } = storesApi;
