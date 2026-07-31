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
    getDriverStatement: builder.query({
      query: (params) => ({
        url: "/Statements/driver",
        params,
      }),
      providesTags: ["DriverStatement"],
    }),
    getDriverTripsCostEntry: builder.query({
      query: (params) => ({
        url: "/DriverTrips/cost-entry",
        params,
      }),
      providesTags: ["DriverTripCost"],
    }),
    bulkUpdateDriverTripCosts: builder.mutation({
      query: (body) => ({
        url: "/DriverTrips/bulk-costs",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["DriverTripCost", "DriverStatement"],
    }),
  }),
});

export const {
  useGetDriversSelectQuery,
  useGetDriverByIdQuery,
  useCreateDriverMutation,
  useGetDriverStatementQuery,
  useGetDriverTripsCostEntryQuery,
  useBulkUpdateDriverTripCostsMutation,
} = driversApi;
