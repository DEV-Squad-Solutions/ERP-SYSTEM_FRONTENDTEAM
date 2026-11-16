// features/drivers/driverOpeningBalancesApi.js
import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

export const driverOpeningBalancesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDriverOpeningBalances: builder.query({
      query: ({
        pageNumber = 1,
        pageSize = 20,
        fiscalYearId,
        driverId,
      } = {}) => ({
        url: "/DriverOpeningBalances",
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          FiscalYearId: fiscalYearId || undefined,
          DriverId: driverId || undefined,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...(result.items || []).map((item) => ({
                type: "DriverOpeningBalance",
                id: item.id,
              })),
              { type: "DriverOpeningBalance", id: "LIST" },
            ]
          : [{ type: "DriverOpeningBalance", id: "LIST" }],
    }),

    getDriverOpeningBalanceById: builder.query({
      query: ({ id, fiscalYearId }) => ({
        url: `/DriverOpeningBalances/${id}`,
        params: { FiscalYearId: fiscalYearId || undefined },
      }),
      providesTags: (result, error, { id }) => [
        { type: "DriverOpeningBalance", id },
      ],
    }),

    createDriverOpeningBalance: builder.mutation({
      query: (body) => ({
        url: "/DriverOpeningBalances",
        method: "POST",
        body,
      }),
      invalidatesTags: tagsFor("DriverOpeningBalance"),
    }),

    updateDriverOpeningBalance: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/DriverOpeningBalances/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: tagsFor("DriverOpeningBalance"),
    }),

    deleteDriverOpeningBalance: builder.mutation({
      // rowVersion بييجي Base64 من السيرفر، فلازم يتشفّر قبل ما يتحط في
      // الـquery string (فيه + و / و =).
      query: ({ id, rowVersion }) => ({
        url: `/DriverOpeningBalances/${id}?rowVersion=${encodeURIComponent(
          rowVersion || "",
        )}`,
        method: "DELETE",
      }),
      invalidatesTags: tagsFor("DriverOpeningBalance"),
    }),
  }),
});

export const {
  useGetDriverOpeningBalancesQuery,
  useGetDriverOpeningBalanceByIdQuery,
  useCreateDriverOpeningBalanceMutation,
  useUpdateDriverOpeningBalanceMutation,
  useDeleteDriverOpeningBalanceMutation,
} = driverOpeningBalancesApi;
