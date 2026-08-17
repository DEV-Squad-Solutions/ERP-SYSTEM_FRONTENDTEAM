import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

import { useCreatePartyMutation } from "../../partners/partiesApi";
import { useCreateStoreMutation } from "../../stores/storesApi";

import {
  useGetContainersSelectQuery,
  useCreateContainerMutation,
} from "../../containers/containersApi";

import { useUpsertStoreContainersMutation } from "../../storeContainers/storeContainersApi";

const CURRENCIES = [
  { value: "EGP", label: "جنيه مصري" },
  { value: "USD", label: "دولار أمريكي" },
  { value: "EUR", label: "يورو" },
  { value: "GBP", label: "جنيه إسترليني" },
  { value: "SAR", label: "ريال سعودي" },
  { value: "AED", label: "درهم إماراتي" },
  { value: "KWD", label: "دينار كويتي" },
];

const partnerSchema = z.object({
  name: z.string().trim().min(2, "اسم الشريك مطلوب"),
  currency: z.enum(["EGP", "USD", "EUR", "GBP", "SAR", "AED", "KWD"]),
  address: z.string().optional(),
  usesReturnableContainers: z.boolean(),
});

const storeSchema = z.object({
  name: z.string().trim().min(2, "اسم المخزن مطلوب"),
  isContainerStore: z.boolean(),
  address: z.string().optional(),
});

const newContainerSchema = z.object({
  name: z.string().trim().min(1, "الاسم مطلوب"),
  description: z.string().optional(),
});

const STEP = {
  PARTNER: 1,
  STORE: 2,
  CONTAINERS: 3,
  COMPLETE: 4,
};

const PARTNER_DEFAULTS = {
  name: "",
  currency: "EGP",
  address: "",
  usesReturnableContainers: false,
};

const STORE_DEFAULTS = {
  name: "",
  isContainerStore: true,
  address: "",
};

const CONTAINER_DEFAULTS = {
  name: "",
  description: "",
};

export default function PartnerSetupWizard({
  isOpen,
  onClose,
  onCreated,
  partnerType = "customer",
}) {
  const roles = useSelector((state) => state.auth.roles || []);

  const isAdmin = roles.includes("Admin") || roles.includes("CompanyOwner");

  const isSupplier = partnerType === "supplier";

  const partnerLabel = isSupplier ? "المورد" : "العميل";
  const partnerLabelShort = isSupplier ? "مورد" : "عميل";

  const [step, setStep] = useState(STEP.PARTNER);
  const [partner, setPartner] = useState(null);
  const [store, setStore] = useState(null);

  const [selectedContainerIds, setSelectedContainerIds] = useState([]);
  const [showAddContainer, setShowAddContainer] = useState(false);

  // وضع التنفيذ التلقائي: بعد إنشاء العميل مباشرة بيتعمل مخزن العبوات وتحديد
  // كل الحاويات من غير ما المستخدم يتفاعل مع خطوة 2 و3 يدويًا. لو أي خطوة
  // فشلت، بنطفي autoMode ونسيب الفورم اليدوي المقابل ظاهر عشان يصلح ويكمل.
  const [autoMode, setAutoMode] = useState(false);
  const [autoStage, setAutoStage] = useState(null); // "store" | "containers" | null

  const [createParty, { isLoading: isSavingPartner }] =
    useCreatePartyMutation();

  const [createStore, { isLoading: isSavingStore }] = useCreateStoreMutation();

  const [upsertStoreContainers, { isLoading: isFinishing }] =
    useUpsertStoreContainersMutation();

  const [createContainer, { isLoading: isCreatingContainer }] =
    useCreateContainerMutation();

  const {
    data: containers = [],
    isFetching: isLoadingContainers,
    refetch: refetchContainers,
  } = useGetContainersSelectQuery(undefined, {
    skip: !isOpen,
  });

  const {
    register: registerPartner,
    handleSubmit: handleSubmitPartner,
    watch: watchPartner,
    reset: resetPartner,
    formState: { errors: partnerErrors },
  } = useForm({
    resolver: zodResolver(partnerSchema),
    defaultValues: PARTNER_DEFAULTS,
  });

  const {
    register: registerStore,
    handleSubmit: handleSubmitStore,
    reset: resetStore,
    formState: { errors: storeErrors },
  } = useForm({
    resolver: zodResolver(storeSchema),
    defaultValues: STORE_DEFAULTS,
  });

  const {
    register: registerNewContainer,
    handleSubmit: handleSubmitNewContainer,
    reset: resetNewContainer,
    formState: { errors: newContainerErrors },
  } = useForm({
    resolver: zodResolver(newContainerSchema),
    defaultValues: CONTAINER_DEFAULTS,
  });

  const usesReturnableContainers = watchPartner("usesReturnableContainers");

  const allContainersSelected = useMemo(
    () =>
      containers.length > 0 &&
      selectedContainerIds.length === containers.length,
    [containers.length, selectedContainerIds.length],
  );

  const resetAll = () => {
    setStep(STEP.PARTNER);
    setPartner(null);
    setStore(null);
    setSelectedContainerIds([]);
    setShowAddContainer(false);
    setAutoMode(false);
    setAutoStage(null);

    resetPartner(PARTNER_DEFAULTS);
    resetStore(STORE_DEFAULTS);
    resetNewContainer(CONTAINER_DEFAULTS);
  };

  const handleClose = () => {
    resetAll();
    onClose?.();
  };

  useEffect(() => {
    if (!isOpen) return;

    resetAll();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!partner) return;

    resetStore({
      name: `${partner.name} Container Store`,
      isContainerStore: true,
      address: partner.address ?? "",
    });
  }, [partner, resetStore]);

  const selectPartnerAndClose = (createdPartner) => {
    onCreated?.(createdPartner);
    handleClose();
  };

  /* =========================================================
     Step 1: Create Partner
     ========================================================= */

  const submitPartner = async (data) => {
    try {
      const created = await createParty({
        name: data.name,
        currency: data.currency,
        address: data.address || "",

        // customer | supplier
        partyType: partnerType,

        usesReturnableContainers: data.usesReturnableContainers,
      }).unwrap();

      const createdPartner = created?.data ?? created;

      const partnerData = {
        ...data,
        ...createdPartner,
        id: createdPartner.id,
      };

      setPartner(partnerData);

      toast.success(`تم إنشاء ${partnerLabel} بنجاح`);

      if (data.usesReturnableContainers) {
        // تشغيل السلسلة التلقائية: إنشاء مخزن العبوات ثم تحديد كل الحاويات،
        // من غير ما نستنى المستخدم يدوس على أي زرار وسط الطريق.
        runAutoSetup(partnerData);
      } else {
        selectPartnerAndClose(createdPartner);
      }
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.data?.title ||
          `تعذر إنشاء ${partnerLabel}`,
      );
    }
  };

  /* =========================================================
     التنفيذ التلقائي: مخزن العبوات + تحديد كل الحاويات
     ========================================================= */

  const runAutoSetup = async (partnerData) => {
    setAutoMode(true);
    setStep(STEP.STORE);
    setAutoStage("store");

    // 1) إنشاء مخزن العبوات بإسم افتراضي
    let createdStoreData;
    try {
      const storeName = `${partnerData.name} Container Store`;

      const createdStore = await createStore({
        name: storeName,
        isContainerStore: true,
        address: partnerData.address ?? "",
        businessPartnerId: partnerData.id,
      }).unwrap();

      createdStoreData = createdStore?.data ?? createdStore;

      setStore({
        name: storeName,
        isContainerStore: true,
        address: partnerData.address ?? "",
        ...createdStoreData,
        id: createdStoreData.id,
      });
    } catch (error) {
      // فشل إنشاء المخزن -> نرجع للخطوة اليدوية عشان يصلح ويكمل بنفسه
      setAutoMode(false);
      setAutoStage(null);
      toast.error(
        error?.data?.message ||
          error?.data?.title ||
          "تعذر إنشاء مخزن الحاويات تلقائيًا — كمّل الخطوة يدويًا",
      );
      return;
    }

    // 2) تحديد كل الحاويات المتاحة تلقائيًا
    setStep(STEP.CONTAINERS);
    setAutoStage("containers");

    let containerList = containers;
    if (containerList.length === 0) {
      try {
        const fresh = await refetchContainers().unwrap();
        containerList = fresh ?? [];
      } catch {
        // لو فشل الجلب، هنكمل بالقائمة الفاضية وخليه يحدد يدويًا تحت
      }
    }

    const allIds = containerList.map((c) => c.id);
    setSelectedContainerIds(allIds);

    if (allIds.length === 0) {
      // مفيش حاويات أصلًا للتحديد - نوقف الوضع التلقائي ونسيبه يضيف يدويًا
      setAutoMode(false);
      setAutoStage(null);
      toast.warning("لا توجد حاويات متاحة للتحديد التلقائي — أضف حاوية يدويًا");
      return;
    }

    try {
      await upsertStoreContainers({
        storeId: createdStoreData.id,
        containerIds: allIds,
      }).unwrap();

      toast.success(
        `تم إنشاء مخزن الحاويات وتحديد ${allIds.length} حاوية تلقائيًا`,
      );

      setAutoMode(false);
      setAutoStage(null);
      setStep(STEP.COMPLETE);
    } catch (error) {
      setAutoMode(false);
      setAutoStage(null);
      toast.error(
        error?.data?.message ||
          error?.data?.title ||
          "تعذر حفظ الحاويات تلقائيًا — راجع التحديد وكمّل يدويًا",
      );
    }
  };

  /* =========================================================
     Step 2: Create Container Store (يدوي - fallback لو التلقائي فشل)
     ========================================================= */

  const submitStore = async (data) => {
    if (!partner?.id) return;

    try {
      const createdStore = await createStore({
        ...data,

        businessPartnerId: partner.id,

        isContainerStore: true,
      }).unwrap();

      const storeData = createdStore?.data ?? createdStore;

      setStore({
        ...data,
        ...storeData,
        id: storeData.id,
      });

      toast.success("تم إنشاء مخزن الحاويات بنجاح");

      setStep(STEP.CONTAINERS);
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.data?.title ||
          "تعذر إنشاء مخزن الحاويات",
      );
    }
  };

  const skipStoreSetup = () => {
    selectPartnerAndClose(partner);
  };

  /* =========================================================
     Step 3: Containers (يدوي - fallback لو التلقائي فشل)
     ========================================================= */

  const toggleContainer = (containerId) => {
    setSelectedContainerIds((prev) =>
      prev.includes(containerId)
        ? prev.filter((id) => id !== containerId)
        : [...prev, containerId],
    );
  };

  const toggleAllContainers = () => {
    if (allContainersSelected) {
      setSelectedContainerIds([]);
      return;
    }

    setSelectedContainerIds(containers.map((container) => container.id));
  };

  const finishSetup = async () => {
    if (!store?.id) return;

    try {
      await upsertStoreContainers({
        storeId: store.id,
        containerIds: selectedContainerIds,
      }).unwrap();

      toast.success("تم حفظ الحاويات المسموحة");

      setStep(STEP.COMPLETE);
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.data?.title ||
          "تعذر حفظ الحاويات المسموحة",
      );
    }
  };

  /* =========================================================
     Create New Container
     ========================================================= */

  const submitNewContainer = async (data) => {
    try {
      const created = await createContainer(data).unwrap();

      const createdContainer = created?.data ?? created;

      await refetchContainers();

      if (createdContainer?.id) {
        setSelectedContainerIds((prev) =>
          prev.includes(createdContainer.id)
            ? prev
            : [...prev, createdContainer.id],
        );
      }

      toast.success("تمت إضافة الحاوية وتحديدها");

      resetNewContainer(CONTAINER_DEFAULTS);
      setShowAddContainer(false);
    } catch (error) {
      toast.error(
        error?.data?.message || error?.data?.title || "تعذر إضافة الحاوية",
      );
    }
  };

  const finishLabel = useMemo(
    () => (isFinishing ? "جاري الحفظ..." : "إنهاء الإعداد"),
    [isFinishing],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`إنشاء ${partnerLabel} وإعداد مخزن الحاويات`}
      size="lg"
    >
      {/* =====================================================
          Steps
      ====================================================== */}

      <div className="flex items-center gap-2 mb-6 text-xs font-medium text-ink-500">
        {[partnerLabel, "مخزن الحاويات", "الحاويات المسموح بها", "اكتمل"].map(
          (label, idx) => (
            <span
              key={label}
              className={`flex items-center gap-1 ${
                step === idx + 1 ? "text-primary-600 font-semibold" : ""
              }`}
            >
              {idx > 0 && <span className="mx-1">→</span>}

              {label}
            </span>
          ),
        )}
      </div>

      {/* =====================================================
          Step 1
      ====================================================== */}

      {step === STEP.PARTNER && (
        <form
          onSubmit={handleSubmitPartner(submitPartner)}
          className="space-y-4"
        >
          <Input
            label={`اسم ${partnerLabel}`}
            {...registerPartner("name")}
            error={partnerErrors.name?.message}
          />

          <div>
            <label className="block text-sm text-ink-700 mb-1.5">العملة</label>

            <select
              {...registerPartner("currency")}
              className="w-full rounded-xl border border-ink-400/15 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-500"
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>

            {partnerErrors.currency?.message && (
              <p className="text-xs text-red-500 mt-1">
                {partnerErrors.currency.message}
              </p>
            )}
          </div>

          <Input
            label="العنوان"
            {...registerPartner("address")}
            error={partnerErrors.address?.message}
          />

          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              {...registerPartner("usesReturnableContainers")}
            />
            يستخدم حاويات مرتجعة
          </label>

          <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-3 text-xs text-ink-600">
            {usesReturnableContainers
              ? `هيتم تلقائيًا إنشاء مخزن حاويات خاص بـ${partnerLabelShort} وتحديد كل الحاويات المتاحة له، من غير أي خطوات إضافية.`
              : `إذا تم تفعيل الخيار، هيتم تلقائيًا إنشاء مخزن حاويات وتحديد كل الحاويات لـ${partnerLabelShort}.`}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSavingPartner} className="flex-1">
              {isSavingPartner ? "جاري الحفظ..." : `إنشاء ${partnerLabelShort}`}
            </Button>

            {!usesReturnableContainers && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isSavingPartner}
                className="flex-1"
              >
                إلغاء
              </Button>
            )}
          </div>
        </form>
      )}

      {/* =====================================================
          Step 2 — بيظهر بس لو الوضع التلقائي فشل في إنشاء المخزن
          (autoMode بيبقى false في الحالة دي) أو وقت التنفيذ التلقائي
          بيبان progress indicator بدل الفورم
      ====================================================== */}

      {step === STEP.STORE && (
        <>
          {autoMode && autoStage === "store" ? (
            <AutoProgress
              label={`جاري إنشاء مخزن الحاويات لـ${partnerLabelShort} تلقائيًا...`}
            />
          ) : (
            <form
              onSubmit={handleSubmitStore(submitStore)}
              className="space-y-4"
            >
              <div className="rounded-xl border border-gold-200 bg-gold-50 p-3 text-xs text-gold-700">
                التنفيذ التلقائي محتاج مراجعة — كمّل إنشاء المخزن يدويًا.
              </div>

              <Input
                label="اسم مخزن الحاويات"
                {...registerStore("name")}
                error={storeErrors.name?.message}
              />

              <Input
                label="العنوان"
                {...registerStore("address")}
                error={storeErrors.address?.message}
              />

              <div className="text-xs text-ink-500 flex items-center gap-1.5">
                <InfoDot />
                يمكن تخطي إنشاء مخزن الحاويات واستكماله لاحقًا.
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={skipStoreSetup}
                  disabled={isSavingStore}
                  className="flex-1"
                >
                  تخطي الآن
                </Button>

                <Button
                  type="submit"
                  disabled={isSavingStore}
                  className="flex-1"
                >
                  {isSavingStore ? "جاري الحفظ..." : "إنشاء المخزن والمتابعة"}
                </Button>
              </div>
            </form>
          )}
        </>
      )}

      {/* =====================================================
          Step 3
      ====================================================== */}

      {step === STEP.CONTAINERS && (
        <div className="space-y-4">
          {autoMode && autoStage === "containers" ? (
            <AutoProgress label="جاري تحديد كل الحاويات المتاحة تلقائيًا..." />
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-ink-700">
                  اختر الحاويات المسموح بها لـ {partnerLabel}.
                </p>

                {isAdmin && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddContainer(true)}
                  >
                    + إضافة حاوية
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-ink-400/10 bg-ink-900/[0.02] px-3 py-2">
                <span className="text-xs text-ink-500">
                  محدد: {selectedContainerIds.length} من {containers.length}
                </span>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={toggleAllContainers}
                  disabled={isLoadingContainers || containers.length === 0}
                  className="h-8 px-3 text-xs"
                >
                  {allContainersSelected ? "إلغاء تحديد الكل" : "تحديد الكل"}
                </Button>
              </div>

              <div className="border rounded-xl divide-y max-h-72 overflow-y-auto">
                {isLoadingContainers ? (
                  <p className="p-4 text-sm text-ink-500">
                    جاري تحميل الحاويات...
                  </p>
                ) : containers.length === 0 ? (
                  <p className="p-4 text-sm text-ink-500 text-center">
                    لا توجد حاويات متاحة حاليًا.
                  </p>
                ) : (
                  containers.map((container) => (
                    <label
                      key={container.id}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-ink-900/[0.02]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContainerIds.includes(container.id)}
                        onChange={() => toggleContainer(container.id)}
                      />

                      {container.name}
                    </label>
                  ))
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(STEP.STORE)}
                  disabled={isFinishing}
                  className="flex-1"
                >
                  رجوع
                </Button>

                <Button
                  type="button"
                  onClick={finishSetup}
                  disabled={isFinishing}
                  className="flex-1"
                >
                  {finishLabel}
                </Button>
              </div>
            </>
          )}

          {/* Add Container Modal */}

          {showAddContainer && isAdmin && (
            <Modal
              isOpen={showAddContainer}
              onClose={() => setShowAddContainer(false)}
              title="إضافة حاوية جديدة"
            >
              <form
                onSubmit={handleSubmitNewContainer(submitNewContainer)}
                className="space-y-4"
              >
                <Input
                  label="الاسم"
                  {...registerNewContainer("name")}
                  error={newContainerErrors.name?.message}
                />

                <Input
                  label="الوصف (اختياري)"
                  {...registerNewContainer("description")}
                  error={newContainerErrors.description?.message}
                />

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAddContainer(false)}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>

                  <Button
                    type="submit"
                    disabled={isCreatingContainer}
                    className="flex-1"
                  >
                    {isCreatingContainer ? "جاري الإنشاء..." : "إنشاء وتحديد"}
                  </Button>
                </div>
              </form>
            </Modal>
          )}
        </div>
      )}

      {/* =====================================================
          Step 4
      ====================================================== */}

      {step === STEP.COMPLETE && (
        <div className="space-y-4">
          <CompleteRow label={`تم إنشاء ${partnerLabel}`} />

          <CompleteRow label="تم إنشاء مخزن الحاويات تلقائيًا" />

          <CompleteRow
            label={`تم تحديد ${selectedContainerIds.length} حاوية تلقائيًا`}
          />

          <Button
            type="button"
            className="w-full"
            onClick={() => selectPartnerAndClose(partner)}
          >
            تم — تحديد {partnerLabelShort} وإغلاق
          </Button>
        </div>
      )}
    </Modal>
  );
}

/* =========================================================
   Small Components
========================================================= */

function InfoDot() {
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary-100 text-primary-600 text-[10px]">
      i
    </span>
  );
}

function CompleteRow({ label }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-ink-800">
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs">
        ✓
      </span>

      {label}
    </div>
  );
}

function AutoProgress({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <Loader2 size={28} className="animate-spin text-primary-500" />
      <p className="text-sm text-ink-700">{label}</p>
      <p className="text-xs text-ink-400">من فضلك استنى لحظات...</p>
    </div>
  );
}
