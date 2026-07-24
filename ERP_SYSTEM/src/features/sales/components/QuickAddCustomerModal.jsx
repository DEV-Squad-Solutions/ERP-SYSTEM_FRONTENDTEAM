import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector } from "react-redux";
import { toast } from "sonner";
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

const customerSchema = z.object({
  code: z.string().min(1, "كود العميل مطلوب"),
  name: z.string().min(2, "اسم العميل مطلوب"),
  currency: z.enum(["EGP", "USD"]),
  address: z.string().optional(),
  usesReturnableContainers: z.boolean(),
});

const storeSchema = z.object({
  code: z.string().min(1, "كود المخزن مطلوب"),
  name: z.string().min(2, "اسم المخزن مطلوب"),
  isContainerStore: z.boolean(),
  address: z.string().optional(),
});

const newContainerSchema = z.object({
  code: z.string().min(1, "الكود مطلوب"),
  name: z.string().min(1, "الاسم مطلوب"),
  description: z.string().optional(),
});

const STEP = {
  CUSTOMER: 1,
  STORE: 2,
  CONTAINERS: 3,
  COMPLETE: 4,
};

export default function CustomerContainerSetupWizard({
  isOpen,
  onClose,
  onCreated,
}) {
  const roles = useSelector((state) => state.auth.roles);
  const isAdmin = roles.includes("Admin") || roles.includes("CompanyOwner");

  const [step, setStep] = useState(STEP.CUSTOMER);
  const [customer, setCustomer] = useState(null); // { id, code, name, address }
  const [store, setStore] = useState(null); // { id, code, name }
  const [selectedContainerIds, setSelectedContainerIds] = useState([]);
  const [showAddContainer, setShowAddContainer] = useState(false);

  const [createParty, { isLoading: isSavingCustomer }] =
    useCreatePartyMutation();
  const [createStore, { isLoading: isSavingStore }] = useCreateStoreMutation();
  const [upsertStoreContainers, { isLoading: isFinishing }] =
    useUpsertStoreContainersMutation();

  // Company isolation: refetch containers whenever the wizard (re)opens
  const {
    data: containers = [],
    isFetching: isLoadingContainers,
    refetch: refetchContainers,
  } = useGetContainersSelectQuery(undefined, { skip: !isOpen });

  const resetAll = () => {
    setStep(STEP.CUSTOMER);
    setCustomer(null);
    setStore(null);
    setSelectedContainerIds([]);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  /* ---------------- Step 1: Create Customer ---------------- */
  const {
    register: registerCustomer,
    handleSubmit: handleSubmitCustomer,
    watch: watchCustomer,
    formState: { errors: customerErrors },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      code: "",
      name: "",
      currency: "EGP",
      address: "",
      usesReturnableContainers: false,
    },
  });

  const usesReturnableContainers = watchCustomer("usesReturnableContainers");

  const submitCustomer = async (data) => {
    try {
      const created = await createParty({
        code: data.code,
        name: data.name,
        currency: data.currency,
        address: data.address,
        partyType: "customer",
        usesReturnableContainers: data.usesReturnableContainers,
      }).unwrap();
      setCustomer({ ...data, id: created.id });
      toast.success("تم إنشاء العميل بنجاح");

      if (data.usesReturnableContainers) {
        setStep(STEP.STORE);
      } else {
        onCreated?.(created);
        handleClose();
      }
    } catch {}
  };

  const {
    register: registerStore,
    handleSubmit: handleSubmitStore,
    formState: { errors: storeErrors },
  } = useForm({
    resolver: zodResolver(storeSchema),
    values: customer
      ? {
          code: `CONT-${customer.code}`,
          name: `${customer.name} Container Store`,
          isContainerStore: true,
          address: customer.address ?? "",
        }
      : undefined,
  });

  const submitStore = async (data) => {
    try {
      // 2. POST /api/v1/Stores - send businessPartnerId
      const createdStore = await createStore({
        ...data,
        businessPartnerId: customer.id,
      }).unwrap();

      setStore({ ...data, id: createdStore.id });
      toast.success("تم إنشاء مخزن الحاويات بنجاح");
      setStep(STEP.CONTAINERS);
    } catch {}
  };

  const skipStoreSetup = () => {
    onCreated?.(customer);
    handleClose();
  };

  const toggleContainer = (containerId) => {
    setSelectedContainerIds((prev) =>
      prev.includes(containerId)
        ? prev.filter((id) => id !== containerId)
        : [...prev, containerId],
    );
  };

  const finishSetup = async () => {
    try {
      await upsertStoreContainers({
        storeId: store.id,
        containerIds: selectedContainerIds,
      }).unwrap();
      toast.success("تم حفظ الحاويات المسموحة");
      setStep(STEP.COMPLETE);
    } catch (err) {}
  };

  const [createContainer, { isLoading: isCreatingContainer }] =
    useCreateContainerMutation();
  const {
    register: registerNewContainer,
    handleSubmit: handleSubmitNewContainer,
    reset: resetNewContainer,
    formState: { errors: newContainerErrors },
  } = useForm({ resolver: zodResolver(newContainerSchema) });

  const submitNewContainer = async (data) => {
    try {
      const created = await createContainer(data).unwrap();
      await refetchContainers();
      setSelectedContainerIds((prev) => [...prev, created.id]);
      toast.success("تمت إضافة الحاوية وتحديدها");
      resetNewContainer();
      setShowAddContainer(false);
    } catch {
      toast.error("تعذر إضافة الحاوية");
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
      title="إعداد العميل ومخزن الحاويات"
      size="lg"
    >
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6 text-xs font-medium text-ink-500">
        {["العميل", "مخزن الحاويات", "الحاويات المسموح بها", "اكتمل"].map(
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

      {step === STEP.CUSTOMER && (
        <form
          onSubmit={handleSubmitCustomer(submitCustomer)}
          className="space-y-4"
        >
          <Input
            label="كود العميل"
            {...registerCustomer("code")}
            error={customerErrors.code?.message}
          />
          <Input
            label="اسم العميل"
            {...registerCustomer("name")}
            error={customerErrors.name?.message}
          />
          <select
            {...registerCustomer("currency")}
            className="w-full rounded-xl border border-ink-400/15 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-500"
            error={customerErrors.currency?.message}
          >
            <option value="EGP">جنيه مصري</option>
            <option value="USD">دولار أمريكي</option>
          </select>
          <Input
            label="العنوان"
            {...registerCustomer("address")}
            error={customerErrors.address?.message}
          />
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              {...registerCustomer("usesReturnableContainers")}
            />
            يستخدم حاويات مرتجعة
          </label>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="secondary"
              disabled={isSavingCustomer || usesReturnableContainers}
              className="flex-1"
              onClick={handleSubmitCustomer((data) =>
                submitCustomer({ ...data, usesReturnableContainers: false }),
              )}
            >
              حفظ فقط
            </Button>
            <Button
              type="submit"
              disabled={isSavingCustomer}
              className="flex-1"
            >
              {isSavingCustomer ? "جاري الحفظ..." : "حفظ ومتابعة الإعداد"}
            </Button>
          </div>
        </form>
      )}

      {step === STEP.STORE && (
        <form onSubmit={handleSubmitStore(submitStore)} className="space-y-4">
          <Input
            label="الكود"
            {...registerStore("code")}
            error={storeErrors.code?.message}
          />
          <Input
            label="الاسم"
            {...registerStore("name")}
            error={storeErrors.name?.message}
          />
          <Input
            label="العنوان"
            {...registerStore("address")}
            error={storeErrors.address?.message}
          />
          <div className="text-xs text-ink-500 flex items-center gap-1.5">
            <InfoDot /> يمكن استكمال الإعداد لاحقًا
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={skipStoreSetup}
              className="flex-1"
            >
              تخطي الآن{" "}
            </Button>
            <Button type="submit" disabled={isSavingStore} className="flex-1">
              {isSavingStore ? "جاري الحفظ..." : "متابعة"}
            </Button>
          </div>
        </form>
      )}

      {step === STEP.CONTAINERS && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-700">
              اختر الحاويات المسموح بها لهذا العميل.{" "}
            </p>
            {isAdmin && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAddContainer(true)}
              >
                + إضافة حاوية{" "}
              </Button>
            )}
          </div>

          <div className="border rounded-xl divide-y">
            {isLoadingContainers ? (
              <p className="p-4 text-sm text-ink-500">جاري تحميل الحاويات...</p>
            ) : (
              containers.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedContainerIds.includes(c.id)}
                    onChange={() => toggleContainer(c.id)}
                  />
                  {c.name}
                </label>
              ))
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(STEP.STORE)}
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
                  label="الكود"
                  {...registerNewContainer("code")}
                  error={newContainerErrors.code?.message}
                />
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
                    إنشاء وتحديد{" "}
                  </Button>
                </div>
              </form>
            </Modal>
          )}
        </div>
      )}

      {step === STEP.COMPLETE && (
        <div className="space-y-4">
          <CompleteRow label="تم إنشاء العميل" />{" "}
          <CompleteRow label="تم إنشاء مخزن الحاويات" />{" "}
          <CompleteRow label={`تم ربط ${selectedContainerIds.length} حاوية`} />
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              onCreated?.({
                customer,
                store,
                containerIds: selectedContainerIds,
              });
              handleClose();
            }}
          >
            تم
          </Button>
        </div>
      )}
    </Modal>
  );
}

/* -------------------------------------------------------------------------
 * Small presentational helpers
 * ---------------------------------------------------------------------- */
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
