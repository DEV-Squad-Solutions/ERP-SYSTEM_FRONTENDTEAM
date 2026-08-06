import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useGetStoreByIdQuery,
  useDeleteStoreMutation,
  useGetStoreStockReportQuery,
} from "../storesApi";

import StoreHeader from "../components/StoreHeader";
import StoreStatsCards from "../components/StoreStatsCards";
import StoreOverviewTab from "../components/StoreOverviewTab";
import StoreInventoryTab from "../components/StoreInventoryTab";
import StoreMovementsTab from "../components/StoreMovementsTab";
import StoreTransfersTab from "../components/StoreTransfersTab";
import { useStorePrint } from "../../../shared/hooks/useStorePrint";
import StorePrintTemplate from "../../../shared/components/print/StorePrintTemplate";

const TABS = [
  { key: "overview", label: "نظرة عامة" },
  { key: "inventory", label: "الأصناف" },
  { key: "movements", label: "الحركات" },
  { key: "transfers", label: "التحويلات" },
];

export default function StoreDetailPage() {
  const { id } = useParams();
  const storeId = Number(id);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const {
    data: store,
    isLoading,
    isError,
  } = useGetStoreByIdQuery(storeId, { skip: !storeId });

  const [deleteStore, { isLoading: isDeleting }] = useDeleteStoreMutation();
  const { printStore, printRef, storeToPrint } = useStorePrint();

  // نستخدم صفحة واحدة صغيرة بس عشان نجيب الـ summary (عدد الأصناف / قيمة
  // المخزون الإجمالية) لبطاقات الإحصائيات في الهيدر، من غير ما نجيب كل الأصناف.
  const { data: stockReport } = useGetStoreStockReportQuery(
    { storeId, pageNumber: 1, pageSize: 1 },
    { skip: !storeId },
  );

  const stats = {
    itemsCount: stockReport?.summary?.totalItemCount,
    totalQuantity: undefined, // مفيش مصدر بيانات ليها حاليًا
    totalValue: stockReport?.summary?.totalInventoryValue,
    lastMovementDate: undefined, // مفيش مصدر بيانات ليها حاليًا
  };

  const handleEdit = () => {
    navigate(`/stores/${storeId}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المخزن؟")) return;
    try {
      await deleteStore(storeId).unwrap();
      toast.success("تم حذف المخزن بنجاح");
      navigate("/stores");
    } catch (err) {
      toast.error(err?.data?.title || "حدث خطأ أثناء حذف المخزن");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6" dir="rtl">
        <StoreDetailSkeleton />
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div className="p-6 text-center" dir="rtl">
        <p className="text-ink-500">تعذر تحميل بيانات المخزن.</p>
        <button
          onClick={() => navigate("/stores")}
          className="mt-3 text-sm text-ink-600 underline"
        >
          الرجوع لقائمة المخازن
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <StoreHeader
        store={store}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPrint={() => printStore({ ...store, ...stats })}
      />

      <StoreStatsCards stats={stats} />

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-card p-1.5 flex items-center gap-1 mb-5 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-ink-900 text-white"
                : "text-ink-600 hover:bg-ink-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <StoreOverviewTab store={store} />}
      {activeTab === "inventory" && <StoreInventoryTab storeId={storeId} />}
      {activeTab === "movements" && <StoreMovementsTab storeId={storeId} />}
      {activeTab === "transfers" && <StoreTransfersTab storeId={storeId} />}

      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <StorePrintTemplate store={storeToPrint} stats={stats} />
        </div>
      </div>
    </div>
  );
}

function StoreDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="bg-ink-100 rounded-2xl h-24 mb-6" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-ink-100 rounded-2xl h-20" />
        ))}
      </div>
      <div className="bg-ink-100 rounded-2xl h-10 w-64 mb-5" />
      <div className="bg-ink-100 rounded-2xl h-64" />
    </div>
  );
}
