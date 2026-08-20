import { baseApi } from "../../lib/baseApi";

export const driversApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDrivers: builder.query({
      query: (params) => ({
        url: "Drivers",
        params,
      }),

      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((d) => ({
                type: "Driver",
                id: d.id,
              })),
              { type: "Driver", id: "LIST" },
            ]
          : [{ type: "Driver", id: "LIST" }],
    }),

    getDriversSelect: builder.query({
      query: () => "Drivers/select",

      providesTags: [
        {
          type: "Driver",
          id: "LIST",
        },
      ],
    }),

    getDriverById: builder.query({
      query: (id) => `Drivers/${id}`,

      providesTags: (result, error, id) => [
        {
          type: "Driver",
          id,
        },
      ],
    }),

    createDriver: builder.mutation({
      query: (data) => ({
        url: "Drivers",
        method: "POST",
        body: data,
      }),

      invalidatesTags: [
        {
          type: "Driver",
          id: "LIST",
        },
      ],
    }),

    updateDriver: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `Drivers/${id}`,
        method: "PUT",
        body: data,
      }),

      invalidatesTags: (result, error, { id }) => [
        {
          type: "Driver",
          id,
        },
        {
          type: "Driver",
          id: "LIST",
        },
      ],
    }),

    deleteDriver: builder.mutation({
      query: (id) => ({
        url: `Drivers/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: (result, error, id) => [
        {
          type: "Driver",
          id,
        },
        {
          type: "Driver",
          id: "LIST",
        },
      ],
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
  useGetDriversQuery,
  useGetDriversSelectQuery,
  useGetDriverByIdQuery,
  useCreateDriverMutation,
  useUpdateDriverMutation,
  useDeleteDriverMutation,
  useGetDriverStatementQuery,
  useGetDriverTripsCostEntryQuery,
  useBulkUpdateDriverTripCostsMutation,
} = driversApi;
