import { baseApi } from "../../lib/baseApi";

export const cashboxTransfersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCashboxTransfers: builder.query({
      query: ({
        PageNumber = 1,
        PageSize = 20,
        Search,
        SourceCashboxId,
        DestinationCashboxId,
        FromDate,
        ToDate,
      } = {}) => ({
        url: "/CashboxTransfers",
        method: "GET",
        params: {
          PageNumber,
          PageSize,

          ...(Search?.trim() ? { Search: Search.trim() } : {}),

          ...(SourceCashboxId ? { SourceCashboxId } : {}),

          ...(DestinationCashboxId ? { DestinationCashboxId } : {}),

          ...(FromDate ? { FromDate } : {}),

          ...(ToDate ? { ToDate } : {}),
        },
      }),

      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((transfer) => ({
                type: "CashboxTransfer",
                id: transfer.id,
              })),
              {
                type: "CashboxTransfer",
                id: "LIST",
              },
            ]
          : [
              {
                type: "CashboxTransfer",
                id: "LIST",
              },
            ],
    }),

    getCashboxTransferById: builder.query({
      query: (id) => ({
        url: `/CashboxTransfers/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "CashboxTransfer", id }],
    }),

    createCashboxTransfer: builder.mutation({
      query: ({ fromCashboxId, toCashboxId, date, amount, notes }) => ({
        url: "/CashboxTransfers",
        method: "POST",
        body: {
          transferDate: date,
          sourceCashboxId: fromCashboxId,
          destinationCashboxId: toCashboxId,
          amount,
          notes,
        },
      }),
      invalidatesTags: [{ type: "CashboxTransfer", id: "LIST" }],
    }),

    updateCashboxTransfer: builder.mutation({
      query: ({
        id,
        rowVersion,
        fromCashboxId,
        toCashboxId,
        date,
        amount,
        notes,
      }) => ({
        url: `/CashboxTransfers/${id}`,
        method: "PUT",
        body: {
          transferDate: date,
          sourceCashboxId: fromCashboxId,
          destinationCashboxId: toCashboxId,
          amount,
          notes,
          rowVersion,
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "CashboxTransfer", id },
        { type: "CashboxTransfer", id: "LIST" },
        "Cashbox",
      ],
    }),

    deleteCashboxTransfer: builder.mutation({
      query: (id) => ({
        url: `/CashboxTransfers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "CashboxTransfer", id: "LIST" }, "Cashbox"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCashboxTransfersQuery,
  useGetCashboxTransferByIdQuery,
  useCreateCashboxTransferMutation,
  useUpdateCashboxTransferMutation,
  useDeleteCashboxTransferMutation,
} = cashboxTransfersApi;
