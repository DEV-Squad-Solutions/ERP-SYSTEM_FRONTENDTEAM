import { baseApi } from "../../lib/baseApi";
import { tagsFor } from "../../lib/invalidation";

export const storesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStores: builder.query({
      query: ({
        pageNumber = 1,
        pageSize = 20,
        search,
        code,
        name,
        businessPartnerId,
        isContainerStore,
        isActive,
      } = {}) => ({
        url: "/Stores",
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(search && { Search: search }),
          ...(code && { Code: code }),
          ...(name && { Name: name }),
          ...(businessPartnerId && { BusinessPartnerId: businessPartnerId }),
          ...(isContainerStore !== undefined && {
            IsContainerStore: isContainerStore,
          }),
          ...(isActive !== undefined && { IsActive: isActive }),
        },
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((s) => ({ type: "Store", id: s.id })),
              { type: "Store", id: "LIST" },
            ]
          : [{ type: "Store", id: "LIST" }],
    }),

    getStoreById: builder.query({
      query: (id) => ({ url: `Stores/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Store", id }],
    }),

    // Company-isolated select list, used if a store needs to be picked
    // rather than created (e.g. resuming a skipped setup).
    getStoresSelect: builder.query({
      query: (params) => ({ url: "Stores/select", method: "GET", params }),
      providesTags: ["Store"],
    }),

    // Container stores only — used wherever the UI needs to pick a
    // "مخزن حاويات" specifically (Sales container lines, container wizard, etc).
    getContainerStoresSelect: builder.query({
      query: () => ({ url: "Stores/container-select", method: "GET" }),
      providesTags: ["Store"],
    }),

    createStore: builder.mutation({
      query: (body) => ({ url: "/Stores", method: "POST", body }),
      invalidatesTags: tagsFor("Store"),
    }),

    updateStore: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/Stores/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: tagsFor("Store"),
    }),

    deleteStore: builder.mutation({
      query: (id) => ({ url: `/Stores/${id}`, method: "DELETE" }),
      invalidatesTags: tagsFor("Store"),
    }),

    // ---------- Store Detail Page: Inventory tab ----------
    getStoreStockReport: builder.query({
      query: ({
        storeId,
        pageNumber = 1,
        pageSize = 20,
        asOfDate,
        search,
        itemId,
        itemUnitId,
        hasStock,
      } = {}) => ({
        url: "/InventoryReports/stock",
        method: "GET",
        params: {
          StoreId: storeId,
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(asOfDate && { AsOfDate: asOfDate }),
          ...(search && { Search: search }),
          ...(itemId && { ItemId: itemId }),
          ...(itemUnitId && { ItemUnitId: itemUnitId }),
          ...(hasStock !== undefined && { HasStock: hasStock }),
        },
      }),
      providesTags: (result, error, { storeId } = {}) => [
        { type: "StoreStockReport", id: storeId },
      ],
    }),

    // ---------- Store Detail Page: Movements tab ----------
    getInventoryCostReport: builder.query({
      query: ({
        storeId,
        itemId,
        pageNumber = 1,
        pageSize = 20,
        fromDate,
        toDate,
        movementType,
        costStatus,
        search,
      } = {}) => ({
        url: "/InventoryReports/cost",
        method: "GET",
        params: {
          StoreId: storeId,
          ItemId: itemId,
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(fromDate && { FromDate: fromDate }),
          ...(toDate && { ToDate: toDate }),
          ...(movementType && { MovementType: movementType }),
          ...(costStatus && { CostStatus: costStatus }),
          ...(search && { Search: search }),
        },
      }),
      providesTags: (result, error, { storeId, itemId } = {}) => [
        { type: "InventoryCostReport", id: `${storeId}-${itemId}` },
      ],
    }),

    // ملحوظة: getItemBalance اتنقلت لـ invoicesApi.js — كانت متكررة
    // بالظبط هنا وهناك على نفس الـ URL. لو محتاجها هنا استوردها من
    // invoicesApi (useLazyGetItemBalanceQuery / useGetItemBalanceQuery).

    putItemPricingExpenses: builder.mutation({
      query: ({ itemId, expenses }) => ({
        url: `/InvoiceItemPricing/${itemId}/expenses`,
        method: "PUT",
        body: { expenses },
      }),
      // بيغيّر تسعير الصنف، فبيأثر على ItemBalance بتاعه وعلى تقارير
      // المخزون العامة (كانت قبل كده بتعمل invalidate لتاج
      // {type:"ItemBalance", id:itemId} من غير ما حد يوفره أصلاً).
      invalidatesTags: (result, error, { itemId }) =>
        tagsFor("Item", [{ type: "ItemBalance", id: itemId }]),
    }),
  }),
});

export const {
  useGetStoresQuery,
  useGetStoreByIdQuery,
  useGetStoresSelectQuery,
  useGetContainerStoresSelectQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
  useGetStoreStockReportQuery,
  useGetInventoryCostReportQuery,
  usePutItemPricingExpensesMutation,
} = storesApi;
