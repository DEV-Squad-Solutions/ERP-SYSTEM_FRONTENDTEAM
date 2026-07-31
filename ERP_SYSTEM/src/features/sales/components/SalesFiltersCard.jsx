import { useMemo, useState } from "react";
import { Search, RotateCcw, Filter, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useGetItemsCategoriesSelectQuery } from "../../itemsCategories/itemsCategoriesApi";
import { useGetPartiesSelectQuery } from "../../partners/partiesApi";
import { useGetStoresSelectQuery } from "../../stores/storesApi";
import { useGetDriversSelectQuery } from "../../drivers/driversApi";
import { useGetCountriesSelectQuery } from "../../countries/countriesApi";
import CompactSelect from "../../../shared/components/ui/CompactSelect";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

const typeOptions = [
  { value: "sale", label: "بيع" },
  { value: "purchase", label: "شراء" },
  { value: "sale_return", label: "مرتجع بيع" },
  { value: "purchase_return", label: "مرتجع شراء" },
];

const paymentOptions = [
  { value: "1", label: "نقدي" },
  { value: "2", label: "آجل" },
];

const statusOptions = [
  { value: "1", label: "غير مسعرة" },
  { value: "2", label: "متسعرة" },
];
const currencyOptions = [
  { value: "EGP", label: "جنيه مصري" },
  { value: "USD", label: "دولار أمريكي" },
  { value: "EUR", label: "يورو" },
  { value: "SAR", label: "ريال سعودي" },
];
export default function SalesFiltersCard({
  draft,
  onChange,
  onSearch,
  onReset,
}) {
  const [open, setOpen] = useState(true);

  const { data: parties, isLoading: isLoadingParties } =
    useGetPartiesSelectQuery();

  const { data: stores, isLoading: isLoadingStores } =
    useGetStoresSelectQuery();

  const { data: drivers, isLoading: isLoadingDrivers } =
    useGetDriversSelectQuery();

  const { data: countries, isLoading: isLoadingCountries } =
    useGetCountriesSelectQuery();
  const { data: itemCategories, isLoading: isLoadingCategories } =
    useGetItemsCategoriesSelectQuery();
  const set = (key, value) =>
    onChange({
      ...draft,
      [key]: value,
    });

  const activeFilters = useMemo(() => {
    return Object.values(draft).filter(
      (v) => v !== "" && v !== null && v !== undefined,
    ).length;
  }, [draft]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
            <Filter size={18} className="text-primary-600" />
          </div>

          <div className="text-right">
            <h3 className="font-semibold">فلاتر البحث</h3>

            <span className="text-xs text-gray-500">
              {activeFilters} فلتر مفعل
            </span>
          </div>
        </div>

        <motion.div
          animate={{
            rotate: open ? 180 : 0,
          }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.form
            onSubmit={(e) => {
              e.preventDefault();
              onSearch();
            }}
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.25,
            }}
          >
            <div className="border-t p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                <Input
                  label="رقم الفاتورة"
                  value={draft.invoiceNumber}
                  onChange={(e) => set("invoiceNumber", e.target.value)}
                />

                <div>
                  <label className="block mb-1.5 text-sm font-medium">
                    نوع الفاتورة
                  </label>

                  <CompactSelect
                    options={typeOptions}
                    value={draft.movementType}
                    onChange={(v) => set("movementType", v)}
                    placeholder="الكل"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium">
                    العميل / المورد
                  </label>

                  <CompactSelect
                    options={
                      parties?.map((p) => ({
                        value: p.id,
                        label: p.name,
                      })) || []
                    }
                    value={draft.partyId}
                    onChange={(v) => set("partyId", v)}
                    isLoading={isLoadingParties}
                    placeholder="الكل"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium">
                    البلد
                  </label>

                  <CompactSelect
                    options={
                      countries?.map((c) => ({
                        value: c.id,
                        label: c.name,
                      })) || []
                    }
                    value={draft.country}
                    onChange={(v) => set("country", v)}
                    isLoading={isLoadingCountries}
                    placeholder="الكل"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium">
                    المخزن
                  </label>

                  <CompactSelect
                    options={
                      stores?.map((s) => ({
                        value: s.id,
                        label: s.name,
                      })) || []
                    }
                    value={draft.storeId}
                    onChange={(v) => set("storeId", v)}
                    isLoading={isLoadingStores}
                    placeholder="الكل"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium">
                    السائق
                  </label>

                  <CompactSelect
                    options={
                      drivers?.map((d) => ({
                        value: d.id,
                        label: d.name,
                      })) || []
                    }
                    value={draft.driverId}
                    onChange={(v) => set("driverId", v)}
                    isLoading={isLoadingDrivers}
                    placeholder="الكل"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium">
                    طريقة الدفع
                  </label>

                  <CompactSelect
                    options={paymentOptions}
                    value={draft.paymentMethod}
                    onChange={(v) => set("paymentMethod", v)}
                    placeholder="الكل"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">
                    تصنيف الأصناف
                  </label>

                  <CompactSelect
                    options={
                      itemCategories?.map((c) => ({
                        value: c.id,
                        label: c.name,
                      })) || []
                    }
                    value={draft.itemsCategoryId}
                    onChange={(v) => set("itemsCategoryId", v)}
                    isLoading={isLoadingCategories}
                    placeholder="الكل"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium">
                    العملة
                  </label>

                  <CompactSelect
                    options={currencyOptions}
                    value={draft.currency}
                    onChange={(v) => set("currency", v)}
                    placeholder="الكل"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium">
                    الحالة
                  </label>

                  <CompactSelect
                    options={statusOptions}
                    value={draft.status}
                    onChange={(v) => set("status", v)}
                    placeholder="الكل"
                  />
                </div>

                <Input
                  type="date"
                  label="من تاريخ"
                  value={draft.fromDate}
                  onChange={(e) => set("fromDate", e.target.value)}
                />

                <Input
                  type="date"
                  label="إلى تاريخ"
                  value={draft.toDate}
                  onChange={(e) => set("toDate", e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={onReset}>
                  <RotateCcw size={16} />
                  إعادة تعيين
                </Button>

                <Button type="submit">
                  <Search size={16} />
                  بحث
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
