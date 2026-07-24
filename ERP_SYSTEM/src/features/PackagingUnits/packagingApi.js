import { baseApi } from "../../lib/baseApi";

export const packagingUnitsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPackagingUnits: builder.query({
      query: () => ({
        url: "/ItemUnits/select",
        method: "GET",
      }),
      providesTags: ["PackagingUnit"],
    }),
  }),
});

export const { useGetPackagingUnitsQuery } = packagingUnitsApi;
