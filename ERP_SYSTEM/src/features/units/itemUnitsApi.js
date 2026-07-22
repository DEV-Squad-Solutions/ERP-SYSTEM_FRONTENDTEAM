import { baseApi } from "../../lib/baseApi";

export const itemUnitsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getItemUnitsSelect: builder.query({
      query: () => "ItemUnits/select",
      providesTags: ["ItemUnit"],
    }),
  }),
});

export const { useGetItemUnitsSelectQuery } = itemUnitsApi;
