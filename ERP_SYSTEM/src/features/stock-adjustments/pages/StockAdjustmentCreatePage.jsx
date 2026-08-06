import StockAdjustmentForm from "../components/StockAdjustmentForm";

export default function StockAdjustmentCreatePage() {
  return (
    <div className="p-6 max-w-5xl mx-auto" dir="rtl">
      <h1 className="font-display text-xl font-bold text-ink-900 mb-6">
        تسوية مخزون جديدة
      </h1>
      <StockAdjustmentForm isEditMode={false} />
    </div>
  );
}
