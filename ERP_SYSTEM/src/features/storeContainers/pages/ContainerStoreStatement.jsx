import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Boxes,
  Check,
  CheckSquare,
  Pencil,
  Plus,
  Settings2,
  Square,
  Trash2,
  RefreshCw,
  Warehouse,
  FileText,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { useGetContainerStoreStatementQuery } from "../containerStoreStatementApi";
import { useGetPartyByIdQuery } from "../../partners/partiesApi";

import {
  useCreateStoreMutation,
  useUpdateStoreMutation,
} from "../../stores/storesApi";

import {
  useGetContainersSelectQuery,
  useCreateContainerMutation,
} from "../../containers/containersApi";

import {
  useGetStoreContainersQuery,
  useUpsertStoreContainersMutation,
} from "../../storeContainers/storeContainersApi";

import ContainerStoreFilters from "../components/ContainerStoreFilters";

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import Pagination from "../../../shared/components/ui/Pagination";

/* =========================================================
   Constants
========================================================= */

const emptyFilters = {
  Search: "",
  FromDate: "",
  ToDate: "",
  ContainerId: "",
  InvoiceType: "",
  InvoiceNumber: "",
  Direction: "",
};

const labels = {
  Sales: "بيع",
  Purchase: "شراء",
  SalesReturn: "مرتجع بيع",
  PurchaseReturn: "مرتجع شراء",
};

const badges = {
  Sales: "bg-primary-500/10 text-primary-500",
  Purchase: "bg-amber-500/10 text-amber-600",
  SalesReturn: "bg-rose-500/10 text-rose-600",
  PurchaseReturn: "bg-sky-500/10 text-sky-600",
};

const directionLabels = {
  Outgoing: "خروج",
  Incoming: "دخول",
};

const directionBadges = {
  Outgoing: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  Incoming: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

/* =========================================================
   Helpers
========================================================= */

const fmt = (value) =>
  new Intl.NumberFormat("ar-EG", {
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const fmtDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "—";

/*
 * حساب حالة الحاوية:
 *
 * الوارد أكبر من الصادر = له
 * الصادر أكبر من الوارد = عليه
 * متساوي = متساوي
 *
 * ملاحظة:
 * هذا خاص بعرض حالة الفترة الحالية،
 * بينما الرصيد الحقيقي يتم أخذه من closingUnits.
 */
const getContainerBalanceStatus = (container) => {
  const incoming = Number(container?.periodIncomingUnits) || 0;
  const outgoing = Number(container?.periodOutgoingUnits) || 0;

  const difference = incoming - outgoing;

  if (difference > 0) {
    return {
      type: "credit",
      label: "له",
      amount: difference,
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      dotClassName: "bg-emerald-500",
    };
  }

  if (difference < 0) {
    return {
      type: "debit",
      label: "عليه",
      amount: Math.abs(difference),
      className: "bg-rose-500/10 text-rose-600 border-rose-500/20",
      dotClassName: "bg-rose-500",
    };
  }

  return {
    type: "equal",
    label: "متساوي",
    amount: 0,
    className: "bg-ink-400/10 text-ink-500 border-ink-400/20",
    dotClassName: "bg-ink-400",
  };
};

/* =========================================================
   Store Modal
========================================================= */

function StoreModal({ open, onClose, party, store, onSaved }) {
  const edit = !!store;

  const [name, setName] = useState(store?.name ?? "");
  const [address, setAddress] = useState(
    store?.address ?? party?.address ?? "",
  );
  const [description, setDescription] = useState(store?.description ?? "");

  const [create, { isLoading: creating }] = useCreateStoreMutation();

  const [update, { isLoading: updating }] = useUpdateStoreMutation();

  useEffect(() => {
    if (!open) return;

    setName(store?.name ?? "");
    setAddress(store?.address ?? party?.address ?? "");
    setDescription(store?.description ?? "");
  }, [open, store, party]);

  const save = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("اسم المخزن مطلوب");
      return;
    }

    if (!party?.id && !store?.businessPartnerId) {
      toast.error("تعذر تحديد العميل أو المورد المرتبط بالمخزن");
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        address: address.trim(),
        description: description.trim(),
        isContainerStore: true,

        businessPartnerId: store?.businessPartnerId ?? party.id,
      };

      const response = edit
        ? await update({
            id: store.id,
            ...payload,
          }).unwrap()
        : await create(payload).unwrap();

      const savedStore = response?.data ?? response;

      onSaved?.(savedStore);

      toast.success(
        edit ? "تم تعديل بيانات المخزن بنجاح" : "تم إنشاء مخزن العبوات بنجاح",
      );

      onClose();
    } catch (error) {
      toast.error(
        error?.data?.message || error?.data?.title || "تعذر حفظ بيانات المخزن",
      );
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={edit ? "تعديل مخزن العبوات" : "إنشاء مخزن عبوات"}
    >
      <form onSubmit={save} className="space-y-4">
        <Input
          label="اسم المخزن"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="العنوان"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <Input
          label="الوصف"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            إلغاء
          </Button>

          <Button
            type="submit"
            disabled={creating || updating}
            className="flex-1"
          >
            {creating || updating
              ? "جاري الحفظ..."
              : edit
                ? "حفظ التعديلات"
                : "إنشاء المخزن"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* =========================================================
   Containers Modal
========================================================= */

function ContainersModal({ open, onClose, storeId }) {
  const {
    data: all = [],
    isFetching: loadingAll,
    refetch: refetchAll,
  } = useGetContainersSelectQuery(undefined, {
    skip: !open,
  });

  const {
    data: assigned,
    isFetching: loadingAssigned,
    refetch: refetchAssigned,
  } = useGetStoreContainersQuery(storeId, {
    skip: !open || !storeId,
  });

  const [upsert, { isLoading: saving }] = useUpsertStoreContainersMutation();

  const [create, { isLoading: creating }] = useCreateContainerMutation();

  const assignedIds = useMemo(() => {
    return (
      assigned?.containerIds ??
      assigned?.containers?.map((x) => x.id) ??
      assigned?.data?.containerIds ??
      []
    );
  }, [assigned]);

  const [selected, setSelected] = useState([]);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    if (!open) return;

    setSelected(assignedIds);
  }, [open, assignedIds]);

  const allSelected =
    all.length > 0 &&
    selected.length === all.length &&
    all.every((container) => selected.includes(container.id));

  const someSelected = selected.length > 0 && selected.length < all.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelected([]);
      return;
    }

    setSelected(all.map((container) => container.id));
  };

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  };

  const save = async () => {
    if (!storeId) return;

    try {
      await upsert({
        storeId,
        containerIds: selected,
      }).unwrap();

      await refetchAssigned();

      toast.success(
        selected.length === 0
          ? "تم إلغاء تعيين جميع العبوات"
          : `تم تعيين ${selected.length} عبوة للمخزن`,
      );
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.data?.title ||
          "تعذر تحديث حاويات المخزن",
      );
    }
  };

  const add = async (e) => {
    e.preventDefault();

    if (!newName.trim()) {
      toast.error("اسم الحاوية مطلوب");
      return;
    }

    try {
      const response = await create({
        name: newName.trim(),
        description: newDescription.trim(),
      }).unwrap();

      const createdContainer = response?.data ?? response;

      const createdId = createdContainer?.id;

      if (createdId) {
        setSelected((current) =>
          current.includes(createdId) ? current : [...current, createdId],
        );
      }

      await refetchAll();

      setNewName("");
      setNewDescription("");

      toast.success("تمت إضافة الحاوية وتحديدها للمخزن");
    } catch (error) {
      toast.error(
        error?.data?.message || error?.data?.title || "تعذر إضافة الحاوية",
      );
    }
  };

  const isLoading = loadingAll || loadingAssigned;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="إدارة حاويات المخزن"
      size="lg"
    >
      <div className="space-y-4">
        <form
          onSubmit={add}
          className="space-y-3 rounded-xl border border-ink-400/10 p-4"
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            <Plus size={16} />
            إضافة حاوية جديدة
          </div>

          <Input
            label="اسم الحاوية"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <Input
            label="الوصف"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />

          <Button type="submit" disabled={creating}>
            {creating ? "جاري الإضافة..." : "إضافة حاوية"}
          </Button>
        </form>

        <div className="rounded-xl border border-ink-400/10 bg-ink-400/[0.03] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink-900">
                تعيين العبوات
              </p>

              <p className="mt-1 text-xs text-ink-400">
                محدد {selected.length} من {all.length}
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={toggleAll}
              disabled={isLoading || all.length === 0}
              className="text-xs"
            >
              {allSelected ? "إلغاء تحديد الكل" : "تحديد كل العبوات"}
            </Button>
          </div>

          {someSelected && (
            <p className="mt-2 text-xs text-primary-600">
              تم تحديد بعض العبوات
            </p>
          )}
        </div>

        <div className="max-h-80 overflow-auto rounded-xl border">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-ink-400">
              جاري تحميل العبوات...
            </div>
          ) : all.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-400">
              لا توجد عبوات متاحة حاليًا.
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleAll}
                className="flex w-full items-center gap-3 border-b bg-primary-50/40 p-3 text-right hover:bg-primary-50"
              >
                {allSelected ? (
                  <CheckSquare size={18} className="text-primary-600" />
                ) : (
                  <Square size={18} className="text-ink-400" />
                )}

                <div className="flex-1">
                  <div className="text-sm font-semibold">
                    {allSelected
                      ? "إلغاء تحديد كل العبوات"
                      : "تحديد كل العبوات"}
                  </div>

                  <div className="mt-0.5 text-xs text-ink-400">
                    سيتم تعيين جميع العبوات لهذا المخزن
                  </div>
                </div>

                <span className="text-xs text-ink-400">{all.length}</span>
              </button>

              {all.map((container) => {
                const isSelected = selected.includes(container.id);

                return (
                  <div
                    key={container.id}
                    className={`flex items-center gap-3 border-b p-3 last:border-0 transition ${
                      isSelected
                        ? "bg-primary-50/30"
                        : "hover:bg-ink-400/[0.02]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(container.id)}
                      className="shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare size={18} className="text-primary-600" />
                      ) : (
                        <Square size={18} className="text-ink-400" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggle(container.id)}
                      className="flex-1 text-right"
                    >
                      <div className="text-sm font-medium">
                        {container.name}
                      </div>

                      {container.code && (
                        <div className="mt-0.5 text-xs text-ink-400">
                          {container.code}
                        </div>
                      )}
                    </button>

                    {isSelected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/10 px-2 py-1 text-xs text-primary-600">
                        <Check size={12} />
                        معينة
                      </span>
                    )}

                    {isSelected && (
                      <button
                        type="button"
                        title="إزالة من المخزن"
                        onClick={() => toggle(container.id)}
                        className="rounded-lg p-2 text-rose-500 hover:bg-rose-500/10"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="flex justify-between gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            إغلاق
          </Button>

          <Button onClick={save} disabled={saving || isLoading}>
            {saving ? "جاري الحفظ..." : `حفظ التعيينات (${selected.length})`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* =========================================================
   Page
========================================================= */

export default function ContainerStoreStatementPage() {
  const { partnerId } = useParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    draft: { ...emptyFilters },
    applied: { ...emptyFilters },
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [store, setStore] = useState(null);
  const [storeModal, setStoreModal] = useState(false);
  const [containersModal, setContainersModal] = useState(false);

  /* =========================================================
     Partner
  ========================================================= */

  const { data: partner, isLoading: partnerLoading } = useGetPartyByIdQuery(
    partnerId,
    {
      skip: !partnerId,
    },
  );

  /* =========================================================
     Store Statement
  ========================================================= */

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetContainerStoreStatementQuery(
      {
        BusinessPartnerId: partnerId,
        PageNumber: page,
        PageSize: pageSize,
        ...filters.applied,
      },
      {
        skip: !partnerId,
      },
    );

  const currentStore = store ?? data?.containerStore ?? null;

  const isStoreNotFound =
    isError &&
    (error?.status === 404 ||
      error?.data?.statusCode === 404 ||
      error?.data?.status === 404);

  const shouldShowCreateStore =
    partner && !currentStore && !isLoading && (!isError || isStoreNotFound);

  /* =========================================================
     Filter Helpers
  ========================================================= */

  const search = () => {
    setFilters((current) => ({
      ...current,
      applied: {
        ...current.draft,
      },
    }));

    setPage(1);
  };

  const reset = () => {
    setFilters({
      draft: { ...emptyFilters },
      applied: { ...emptyFilters },
    });

    setPage(1);
  };

  /*
   * اختيار عبوة مباشرة من جدول الملخص.
   *
   * يتم تعديل draft + applied معًا لأن المستخدم
   * ضغط مباشرة على العبوة ويريد مشاهدة حركاتها.
   */
  const filterByContainer = (containerId) => {
    if (!containerId) return;

    const value = String(containerId);

    setFilters((current) => ({
      draft: {
        ...current.draft,
        ContainerId: value,
      },
      applied: {
        ...current.applied,
        ContainerId: value,
      },
    }));

    setPage(1);
  };

  /*
   * إلغاء فلتر العبوة فقط مع الاحتفاظ بباقي الفلاتر.
   */
  const clearContainerFilter = () => {
    setFilters((current) => ({
      draft: {
        ...current.draft,
        ContainerId: "",
      },
      applied: {
        ...current.applied,
        ContainerId: "",
      },
    }));

    setPage(1);
  };

  /*
   * معرفة العبوة المختارة حاليًا.
   */
  const selectedContainerId =
    filters.applied.ContainerId || filters.draft.ContainerId || "";

  const selectedContainer = useMemo(() => {
    if (!selectedContainerId) return null;

    return (
      data?.containers?.find(
        (container) =>
          String(container.containerId) === String(selectedContainerId),
      ) ?? null
    );
  }, [data?.containers, selectedContainerId]);

  /* =========================================================
     Invoice Navigation
  ========================================================= */

  const openInvoice = (invoiceId) => {
    if (!invoiceId) {
      toast.error(
        "لا يمكن فتح تفاصيل الفاتورة لأن رقم تعريف الفاتورة غير موجود",
      );
      return;
    }

    navigate(`/dashboard/sales/${invoiceId}`);
  };

  /* =========================================================
     Pagination
  ========================================================= */

  const onPageChange = (newPage) => {
    setPage(newPage);
  };

  const onPageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  /* =========================================================
     Store Saved
  ========================================================= */

  const handleStoreSaved = async (savedStore) => {
    if (savedStore) {
      setStore(savedStore);
    }

    setStoreModal(false);

    try {
      await refetch();
    } catch {
      // المخزن تم إنشاؤه بالفعل
    }
  };

  /* =========================================================
     Render
  ========================================================= */

  return (
    <div className="animate-fadeUp">
      {/* =====================================================
          Header
      ===================================================== */}

      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-ink-400/10 bg-white hover:bg-ink-400/5"
          title="رجوع"
        >
          <ArrowRight size={16} />
        </button>

        <div className="flex-1">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Boxes size={20} />
            مخزن عبوات {partner?.name ?? ""}
          </h2>

          <p className="mt-1 text-sm text-ink-400">
            إدارة مخزن العبوات والحاويات والحركات.
          </p>
        </div>

        {currentStore && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setStoreModal(true)}>
              <Pencil size={15} />
              تعديل المخزن
            </Button>

            <Button
              variant="secondary"
              onClick={() => setContainersModal(true)}
            >
              <Settings2 size={15} />
              إدارة الحاويات
            </Button>
          </div>
        )}
      </div>

      {/* =====================================================
          No Store
      ===================================================== */}

      {shouldShowCreateStore && (
        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-primary-200 bg-primary-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600">
              <Warehouse size={20} />
            </div>

            <div>
              <b className="text-sm">لا يوجد مخزن عبوات لهذا الشريك</b>

              <p className="mt-1 text-sm text-ink-500">
                لم يتم العثور على مخزن عبوات مرتبط بهذا العميل أو المورد.
              </p>
            </div>
          </div>

          <Button onClick={() => setStoreModal(true)}>
            <Plus size={15} />
            إنشاء مخزن عبوات
          </Button>
        </div>
      )}

      {/* =====================================================
          Filters
      ===================================================== */}

      <ContainerStoreFilters
        draft={filters.draft}
        containers={data?.containers ?? []}
        onChange={(value) =>
          setFilters((current) => ({
            ...current,
            draft: value,
          }))
        }
        onSearch={search}
        onReset={reset}
      />

      {/* =====================================================
          Active Container Filter
      ===================================================== */}

      {selectedContainerId && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-primary-200 bg-primary-50/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <Boxes size={16} className="text-primary-600" />

            <div>
              <span className="text-xs text-ink-400">
                يتم عرض حركات العبوة:
              </span>

              <span className="mr-2 text-sm font-bold text-primary-700">
                {selectedContainer?.containerName ||
                  `عبوة رقم ${selectedContainerId}`}
              </span>

              {selectedContainer?.containerCode && (
                <span className="mr-2 text-xs text-ink-400">
                  ({selectedContainer.containerCode})
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={clearContainerFilter}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-500/10"
          >
            <X size={14} />
            إلغاء فلتر العبوة
          </button>
        </div>
      )}

      {/* =====================================================
          Loading
      ===================================================== */}

      {isLoading && (
        <div className="py-16 text-center text-ink-400">
          جاري تحميل كشف مخزن العبوات...
        </div>
      )}

      {/* =====================================================
          Error
      ===================================================== */}

      {isError && !isStoreNotFound && (
        <div className="mb-5 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-600">
          <div>
            <div className="font-semibold">
              حدث خطأ أثناء تحميل تفاصيل مخزن العبوات.
            </div>

            <div className="mt-1 text-sm">حاول تحديث البيانات مرة أخرى.</div>
          </div>

          <Button
            variant="secondary"
            onClick={refetch}
            className="text-rose-600"
          >
            <RefreshCw size={15} />
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* =====================================================
          Store
      ===================================================== */}

      {currentStore && data && (
        <>
          {/* =================================================
              Store Summary
          ================================================= */}

          <div className="mb-4 rounded-2xl border bg-white p-4 shadow-card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-bold">
                <Boxes size={16} />

                <span>{currentStore.name}</span>

                {currentStore.code && (
                  <span className="text-xs font-normal text-ink-400">
                    ({currentStore.code})
                  </span>
                )}
              </div>

              <span className="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-600">
                مخزن عبوات
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {[
                ["رصيد افتتاحي", data.summary?.openingUnits, "text-ink-900"],
                [
                  "إجمالي الصادر",
                  data.summary?.totalOutgoingUnits,
                  "text-rose-600",
                ],
                [
                  "إجمالي الوارد",
                  data.summary?.totalIncomingUnits,
                  "text-emerald-600",
                ],
                [
                  "صافي الحركة",
                  data.summary?.netUnits,
                  Number(data.summary?.netUnits) > 0
                    ? "text-emerald-600"
                    : Number(data.summary?.netUnits) < 0
                      ? "text-rose-600"
                      : "text-ink-500",
                ],
                [
                  "الرصيد الختامي",
                  data.summary?.closingUnits,
                  "text-primary-600",
                ],
                ["عدد الحركات", data.summary?.movementCount, "text-ink-900"],
              ].map(([label, value, valueClass]) => (
                <div key={label} className="rounded-xl bg-ink-400/5 px-4 py-3">
                  <div className="text-xs text-ink-400">{label}</div>

                  <div className={`mt-1 text-lg font-bold ${valueClass}`}>
                    {fmt(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* =================================================
              Containers Summary
          ================================================= */}

          <div className="mb-4 overflow-hidden rounded-2xl border bg-white shadow-card">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
              <div>
                <b className="text-sm">ملخص العبوات</b>

                <p className="mt-0.5 text-xs text-ink-400">
                  اضغط على أي عبوة لعرض جميع حركاتها وفواتيرها
                </p>
              </div>

              <button
                onClick={() => setContainersModal(true)}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-primary-600 hover:bg-primary-500/10"
              >
                إدارة الحاويات
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="bg-ink-400/5 text-ink-400">
                    {[
                      "العبوة",
                      "افتتاحي",
                      "صادر",
                      "وارد",
                      "صافي",
                      "ختامي",
                      "له / عليه",
                      "الإجراء",
                    ].map((label) => (
                      <th
                        key={label}
                        className="px-3 py-3 text-right font-semibold"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {data.containers?.length > 0 ? (
                    data.containers.map((container) => {
                      const status = getContainerBalanceStatus(container);

                      const isSelected =
                        String(selectedContainerId) ===
                        String(container.containerId);

                      return (
                        <tr
                          key={container.containerId}
                          className={`border-t transition ${
                            isSelected
                              ? "bg-primary-50/50"
                              : "hover:bg-ink-400/[0.02]"
                          }`}
                        >
                          {/* Container */}

                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                filterByContainer(container.containerId)
                              }
                              className="group text-right"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`font-semibold transition group-hover:text-primary-600 ${
                                    isSelected
                                      ? "text-primary-700"
                                      : "text-ink-900"
                                  }`}
                                >
                                  {container.containerName}
                                </div>

                                <Boxes
                                  size={14}
                                  className="text-ink-300 transition group-hover:text-primary-500"
                                />
                              </div>

                              {container.containerCode && (
                                <div className="mt-0.5 text-xs text-ink-400">
                                  {container.containerCode}
                                </div>
                              )}
                            </button>
                          </td>

                          {/* Opening */}

                          <td className="px-3 py-3 text-ink-600">
                            {fmt(container.openingUnits)}
                          </td>

                          {/* Outgoing */}

                          <td className="px-3 py-3">
                            <span className="font-semibold text-rose-600">
                              {fmt(container.periodOutgoingUnits)}
                            </span>
                          </td>

                          {/* Incoming */}

                          <td className="px-3 py-3">
                            <span className="font-semibold text-emerald-600">
                              {fmt(container.periodIncomingUnits)}
                            </span>
                          </td>

                          {/* Net */}

                          <td className="px-3 py-3">
                            <span
                              className={`font-bold ${
                                Number(container.periodNetUnits) > 0
                                  ? "text-emerald-600"
                                  : Number(container.periodNetUnits) < 0
                                    ? "text-rose-600"
                                    : "text-ink-400"
                              }`}
                            >
                              {fmt(container.periodNetUnits)}
                            </span>
                          </td>

                          {/* Closing */}

                          <td className="px-3 py-3">
                            <span className="font-bold text-primary-600">
                              {fmt(container.closingUnits)}
                            </span>
                          </td>

                          {/* Balance */}

                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${status.dotClassName}`}
                              />

                              {status.label}

                              {status.amount > 0 && (
                                <span>{fmt(status.amount)}</span>
                              )}
                            </span>
                          </td>

                          {/* Action */}

                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                filterByContainer(container.containerId)
                              }
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                isSelected
                                  ? "bg-primary-500 text-white"
                                  : "bg-primary-500/10 text-primary-600 hover:bg-primary-500/20"
                              }`}
                            >
                              <FileText size={14} />

                              {isSelected ? "الحركات المعروضة" : "عرض الحركات"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-ink-400">
                        لا توجد بيانات حاويات متاحة.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* =================================================
              Movements
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border bg-white shadow-card">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h3 className="font-bold">
                  {selectedContainerId
                    ? `حركات العبوة ${selectedContainer?.containerName ?? ""}`
                    : "حركات العبوات"}
                </h3>

                <p className="mt-0.5 text-xs text-ink-400">
                  إجمالي الحركات: {fmt(data.totalCount)}
                </p>
              </div>

              {selectedContainerId && (
                <button
                  type="button"
                  onClick={clearContainerFilter}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-500/10"
                >
                  <X size={14} />
                  إلغاء فلتر العبوة
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-sm">
                <thead>
                  <tr className="bg-ink-400/5 text-ink-400">
                    {[
                      "التاريخ",
                      "الفاتورة",
                      "نوع الفاتورة",
                      "الحركة",
                      "العبوة",
                      "صادر",
                      "وارد",
                      "صافي الحركة",
                      "الرصيد الجاري",
                      "الوصف",
                    ].map((label) => (
                      <th
                        key={label}
                        className="px-3 py-3 text-right font-semibold"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {data.items?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="p-10 text-center text-ink-400"
                      >
                        لا توجد حركات مطابقة للفلاتر
                      </td>
                    </tr>
                  ) : (
                    data.items?.map((item) => {
                      const direction =
                        item.outgoingUnits > 0
                          ? "Outgoing"
                          : item.incomingUnits > 0
                            ? "Incoming"
                            : "";

                      return (
                        <tr
                          key={item.movementId}
                          className="border-t transition hover:bg-ink-400/[0.02]"
                        >
                          {/* Date */}

                          <td className="whitespace-nowrap px-3 py-3">
                            {fmtDate(item.movementDate)}
                          </td>

                          {/* Invoice */}

                          <td className="px-3 py-3">
                            {item.invoiceId ? (
                              <button
                                type="button"
                                onClick={() => openInvoice(item.invoiceId)}
                                className="group inline-flex items-center gap-1.5 text-right"
                                title="فتح تفاصيل الفاتورة"
                              >
                                <span className="font-bold text-primary-600 underline-offset-2 group-hover:underline">
                                  {item.invoiceNumber || "بدون رقم"}
                                </span>

                                <ExternalLink
                                  size={13}
                                  className="text-primary-400 transition group-hover:text-primary-600"
                                />
                              </button>
                            ) : (
                              <span className="font-bold text-ink-500">
                                {item.invoiceNumber || "بدون رقم"}
                              </span>
                            )}

                            {item.partnerInvoiceNumber && (
                              <div className="mt-1 text-xs text-ink-400">
                                فاتورة العميل: {item.partnerInvoiceNumber}
                              </div>
                            )}
                          </td>

                          {/* Invoice Type */}

                          <td className="px-3 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                badges[item.invoiceType] ??
                                "bg-ink-400/10 text-ink-500"
                              }`}
                            >
                              {labels[item.invoiceType] ??
                                item.invoiceType ??
                                "—"}
                            </span>
                          </td>

                          {/* Direction */}

                          <td className="px-3 py-3">
                            {direction ? (
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                  directionBadges[direction]
                                }`}
                              >
                                {directionLabels[direction]}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          {/* Container */}

                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                filterByContainer(item.containerId)
                              }
                              className="text-right"
                            >
                              <div className="font-medium hover:text-primary-600">
                                {item.containerName}
                              </div>

                              {item.containerCode && (
                                <div className="mt-0.5 text-xs text-ink-400">
                                  {item.containerCode}
                                </div>
                              )}
                            </button>
                          </td>

                          {/* Outgoing */}

                          <td className="px-3 py-3 font-semibold text-rose-600">
                            {item.outgoingUnits ? fmt(item.outgoingUnits) : "—"}
                          </td>

                          {/* Incoming */}

                          <td className="px-3 py-3 font-semibold text-emerald-600">
                            {item.incomingUnits ? fmt(item.incomingUnits) : "—"}
                          </td>

                          {/* Net */}

                          <td className="px-3 py-3">
                            <span
                              className={`font-bold ${
                                Number(item.netUnits) > 0
                                  ? "text-emerald-600"
                                  : Number(item.netUnits) < 0
                                    ? "text-rose-600"
                                    : "text-ink-400"
                              }`}
                            >
                              {fmt(item.netUnits)}
                            </span>
                          </td>

                          {/* Running Balance */}

                          <td className="px-3 py-3">
                            <span className="font-bold text-primary-600">
                              {fmt(item.runningBalanceUnits)}
                            </span>
                          </td>

                          {/* Description */}

                          <td className="px-3 py-3 text-ink-400">
                            {item.movementDescription || "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* =================================================
                Pagination
            ================================================= */}

            {data?.totalCount > 0 && (
              <Pagination
                page={page}
                pageSize={pageSize}
                totalCount={data.totalCount}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                label="حركة"
              />
            )}

            {isFetching && (
              <div className="flex items-center justify-center gap-2 border-t px-4 py-3 text-xs text-ink-400">
                <RefreshCw size={13} className="animate-spin" />
                جاري تحديث البيانات...
              </div>
            )}
          </div>
        </>
      )}

      {/* =====================================================
          Store Modal
      ===================================================== */}

      {partner && (
        <StoreModal
          open={storeModal}
          onClose={() => setStoreModal(false)}
          party={partner}
          store={currentStore}
          onSaved={handleStoreSaved}
        />
      )}

      {/* =====================================================
          Containers Modal
      ===================================================== */}

      {currentStore && (
        <ContainersModal
          open={containersModal}
          onClose={() => setContainersModal(false)}
          storeId={currentStore.id}
        />
      )}
    </div>
  );
}
