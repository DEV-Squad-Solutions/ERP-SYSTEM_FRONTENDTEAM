import { baseApi } from "../../lib/baseApi";

export const cashboxTransfersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =========================================================
    // Get Transfers
    // =========================================================
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
          ...(SourceCashboxId
            ? { SourceCashboxId: Number(SourceCashboxId) }
            : {}),
          ...(DestinationCashboxId
            ? { DestinationCashboxId: Number(DestinationCashboxId) }
            : {}),
          ...(FromDate ? { FromDate } : {}),
          ...(ToDate ? { ToDate } : {}),
        },
      }),

      providesTags: (result) => [
        ...(result?.items?.map((transfer) => ({
          type: "CashboxTransfer",
          id: transfer.id,
        })) ?? []),
        {
          type: "CashboxTransfer",
          id: "LIST",
        },
      ],
    }),

    // =========================================================
    // Get Transfer By Id
    // =========================================================
    getCashboxTransferById: builder.query({
      query: (id) => ({
        url: `/CashboxTransfers/${id}`,
        method: "GET",
      }),

      providesTags: (result, error, id) => [
        {
          type: "CashboxTransfer",
          id,
        },
      ],
    }),

    // =========================================================
    // Create Transfer
    // =========================================================
    createCashboxTransfer: builder.mutation({
      query: ({
        transferDate,
        sourceCashboxId,
        destinationCashboxId,
        amount,
        description,
        notes,
        conversionRate,
        destinationAmount,
        exchangeRate,
      }) => ({
        url: "/CashboxTransfers",
        method: "POST",
        body: {
          transferDate,
          sourceCashboxId: Number(sourceCashboxId),
          destinationCashboxId: Number(destinationCashboxId),
          amount: Number(amount),
          description: description?.trim() || "",
          notes: notes?.trim() || "",

          // سعر التحويل بين عملة المصدر والوجهة
          ...(conversionRate !== undefined &&
          conversionRate !== null &&
          conversionRate !== ""
            ? {
                conversionRate: Number(conversionRate),
              }
            : {}),

          // اختياري - نرسله فقط إذا تم تحديده
          ...(destinationAmount !== undefined &&
          destinationAmount !== null &&
          destinationAmount !== ""
            ? {
                destinationAmount: Number(destinationAmount),
              }
            : {}),

          // لا نرسله عادة من الواجهة لأن الـ API يحله
          // حسب تاريخ التحويل، لكن نتركه مدعومًا إذا احتجناه.
          ...(exchangeRate !== undefined &&
          exchangeRate !== null &&
          exchangeRate !== ""
            ? {
                exchangeRate: Number(exchangeRate),
              }
            : {}),
        },
      }),

      invalidatesTags: [
        {
          type: "CashboxTransfer",
          id: "LIST",
        },
        "Cashbox",
      ],
    }),

    // =========================================================
    // Update Transfer
    // =========================================================
    updateCashboxTransfer: builder.mutation({
      query: ({
        id,
        rowVersion,
        transferDate,
        sourceCashboxId,
        destinationCashboxId,
        amount,
        description,
        notes,
        conversionRate,
        destinationAmount,
        exchangeRate,
      }) => ({
        url: `/CashboxTransfers/${id}`,
        method: "PUT",
        body: {
          transferDate,
          sourceCashboxId: Number(sourceCashboxId),
          destinationCashboxId: Number(destinationCashboxId),
          amount: Number(amount),
          description: description?.trim() || "",
          notes: notes?.trim() || "",

          ...(conversionRate !== undefined &&
          conversionRate !== null &&
          conversionRate !== ""
            ? {
                conversionRate: Number(conversionRate),
              }
            : {}),

          ...(destinationAmount !== undefined &&
          destinationAmount !== null &&
          destinationAmount !== ""
            ? {
                destinationAmount: Number(destinationAmount),
              }
            : {}),

          ...(exchangeRate !== undefined &&
          exchangeRate !== null &&
          exchangeRate !== ""
            ? {
                exchangeRate: Number(exchangeRate),
              }
            : {}),

          ...(rowVersion !== undefined &&
          rowVersion !== null &&
          rowVersion !== ""
            ? {
                rowVersion,
              }
            : {}),
        },
      }),

      invalidatesTags: (result, error, { id }) => [
        {
          type: "CashboxTransfer",
          id,
        },
        {
          type: "CashboxTransfer",
          id: "LIST",
        },
        "Cashbox",
      ],
    }),

    // =========================================================
    // Delete Transfer
    // =========================================================
    deleteCashboxTransfer: builder.mutation({
      query: (id) => ({
        url: `/CashboxTransfers/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        {
          type: "CashboxTransfer",
          id: "LIST",
        },
        "Cashbox",
      ],
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
