import { baseApi } from "../../lib/baseApi";

export const driversApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDriversSelect: builder.query({
      query: () => "Drivers/select",
      providesTags: ["Driver"],
    }),
    getDriverById: builder.query({
      query: (id) => `Drivers/${id}`,
      providesTags: (result, error, id) => [{ type: "Driver", id }],
    }),
    createDriver: builder.mutation({
      query: (data) => ({ url: "Drivers", method: "POST", body: data }),
      invalidatesTags: ["Driver"],
    }),
  }),
});

export const {
  useGetDriversSelectQuery,
  useGetDriverByIdQuery,
  useCreateDriverMutation,
} = driversApi;
