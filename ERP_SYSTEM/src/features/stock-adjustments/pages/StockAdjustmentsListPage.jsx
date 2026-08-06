import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Lock,
  AlertCircle,
  RefreshCw,
  FileSearch,
} from "lucide-react";

import {
  useGetStockAdjustmentsQuery,
  useDeleteStockAdjustmentMutation,
} from "../stockAdjustmentsApi";
import { useGetStoresSelectQuery } from "../../stores/storesApi";
import Pagination from "../../../shared/components/ui/Pagination";

export default function StockAdjustmentsListPage() {
  const navigate = useNavigate();
  const isAdmin = useSelector((state) => state.auth.roles?.includes("Admin"));

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [storeId, setStoreId] = useState("");
  const [direction, setDirection] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");

  const { data: stores } = useGetStoresSelectQuery();

  const { data, isLoading, isFetching, isError, refetch } =
    useGetStockAdjustmentsQuery({
      pageNumber,
      pageSize,
      storeId: storeId || undefined,
      direction: direction || undefined,
      documentNumber: documentNumber || undefined,
    });

  const [deleteStockAdjustment] = useDeleteStockAdjustmentMutation();

  const adjustments = data?.items ?? [];

  const handleDelete = async (adj) => {
    if (adj.sourceInventoryCountId) {
      toast.error("التسوية دي ناتجة عن جرد ومش قابلة للحذف يدويًا");
      return;
    }
    if (
      !window.confirm(
        `هل أنت متأكد من حذف التسوية "${adj.documentNumber}"؟ هيتم عكس تأثيرها على رصيد المخزن.`,
      )
    )
      return;

    try {
      await deleteStockAdjustment(adj.id).unwrap();
      toast.success("تم حذف التسوية بنجاح");
    } catch (err) {
      toast.error(err?.data?.title || "فشل حذف التسوية");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="font-display text-xl font-bold text-ink-900">
          تسويات المخزون
        </h1>
        {isAdmin && (
          <button
            onClick={() => navigate("/dashboard/inventory/adjustments/new")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-ink-900 hover:bg-ink-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            تسوية جديدة
          </button>
        )}
      </div>

      {/* فلاتر */}
      <div className="bg-white rounded-2xl shadow-card p-4 mb-5 flex items-center gap-3 flex-wrap">
        <input
          value={documentNumber}
          onChange={(e) => {
            setDocumentNumber(e.target.value);
            setPageNumber(1);
          }}
          placeholder="بحث برقم المستند..."
          className="flex-1 min-w-[200px] px-3.5 py-2 text-sm rounded-xl border border-ink-100 focus:outline-none focus:ring-2 focus:ring-ink-200"
        />

        <select
          value={storeId}
          onChange={(e) => {
            setStoreId(e.target.value);
            setPageNumber(1);
          }}
          className="px-3.5 py-2 text-sm rounded-xl border border-ink-100 bg-white"
        >
          <option value="">كل المخازن</option>
          {stores?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 bg-ink-50 rounded-xl p-1">
          {[
            { label: "الكل", value: "" },
            { label: "زيادة", value: "Increase" },
            { label: "نقص", value: "Decrease" },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                setDirection(opt.value);
                setPageNumber(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                direction === opt.value
                  ? "bg-white shadow-sm text-ink-900"
                  : "text-ink-500 hover:text-ink-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="py-20 text-center text-sm text-ink-400">
          جاري تحميل التسويات...
        </div>
      )}

      {isError && (
        <div className="text-center py-14 border border-dashed border-rose-200 bg-rose-50/40 rounded-2xl">
          <AlertCircle size={28} className="mx-auto text-rose-400 mb-3" />
          <p className="text-ink-900 font-medium text-sm mb-3">
            حدث خطأ في تحميل التسويات
          </p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 text-xs font-medium text-ink-600 hover:text-ink-900 bg-ink-50 hover:bg-ink-100 px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw size={13} />
            إعادة المحاولة
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div
            className={`bg-white rounded-2xl shadow-card overflow-hidden transition-opacity ${
              isFetching ? "opacity-60" : ""
            }`}
          >
            {adjustments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-full bg-ink-50 flex items-center justify-center mx-auto mb-3">
                  <FileSearch size={22} className="text-ink-300" />
                </div>
                <p className="text-ink-900 font-medium text-sm mb-1">
                  لا توجد تسويات مطابقة
                </p>
                <p className="text-xs text-ink-400">جرّب تعديل الفلاتر</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-ink-500 text-xs bg-ink-50/60">
                    <th className="py-2.5 px-3 text-right font-medium">
                      رقم المستند
                    </th>
                    <th className="py-2.5 px-3 text-right font-medium">
                      التاريخ
                    </th>
                    <th className="py-2.5 px-3 text-right font-medium">
                      المخزن
                    </th>
                    <th className="py-2.5 px-3 text-right font-medium">
                      الاتجاه
                    </th>
                    <th className="py-2.5 px-3 text-right font-medium">
                      السبب
                    </th>
                    <th className="py-2.5 px-3 text-right font-medium">
                      عدد السطور
                    </th>
                    <th className="py-2.5 px-3 text-right font-medium">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {adjustments.map((adj) => {
                    const isLocked = Boolean(adj.sourceInventoryCountId);
                    const isIncrease = adj.direction === "Increase";
                    return (
                      <tr
                        key={adj.id}
                        className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40 transition-colors"
                      >
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/inventory/adjustments/${adj.id}`,
                              )
                            }
                            className="text-ink-900 font-medium hover:underline"
                          >
                            {adj.documentNumber}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-ink-600">
                          {new Date(adj.documentDate).toLocaleDateString(
                            "ar-EG",
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-ink-600">
                          {adj.storeName}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                              isIncrease
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {isIncrease ? (
                              <ArrowUpCircle size={12} />
                            ) : (
                              <ArrowDownCircle size={12} />
                            )}
                            {isIncrease ? "زيادة" : "نقص"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-ink-600 max-w-[180px] truncate">
                          {adj.reason || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-ink-700">
                          {adj.lineCount}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() =>
                                navigate(
                                  `/dashboard/inventory/adjustments/${adj.id}`,
                                )
                              }
                              className="p-1.5 rounded-lg text-ink-500 hover:bg-ink-100"
                              title="عرض"
                            >
                              <Eye size={14} />
                            </button>

                            {isAdmin && !isLocked && (
                              <>
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/dashboard/inventory/adjustments/${adj.id}/edit`,
                                    )
                                  }
                                  className="p-1.5 rounded-lg text-ink-500 hover:bg-ink-100"
                                  title="تعديل"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(adj)}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                                  title="حذف"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}

                            {isLocked && (
                              <span
                                className="p-1.5 text-ink-300"
                                title="ناتجة عن جرد - غير قابلة للتعديل"
                              >
                                <Lock size={14} />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {data?.totalCount > 0 && (
            <Pagination
              page={pageNumber}
              pageSize={pageSize}
              totalCount={data.totalCount}
              onPageChange={setPageNumber}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPageNumber(1);
              }}
              label="تسوية"
            />
          )}
        </>
      )}
    </div>
  );
}
