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

const fmt = (v) =>
  new Intl.NumberFormat("ar-EG", {
    maximumFractionDigits: 2,
  }).format(Number(v) || 0);

const fmtDate = (v) =>
  v
    ? new Date(v).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "—";

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

        // الـ API يتطلب BusinessPartnerId في الإنشاء والتعديل
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

  /*
   * مزامنة العبوات المعينة من الـ API
   */
  useEffect(() => {
    if (!open) return;

    setSelected(assignedIds);
  }, [open, assignedIds]);

  /*
   * هل كل العبوات الحالية محددة؟
   */
  const allSelected =
    all.length > 0 &&
    selected.length === all.length &&
    all.every((container) => selected.includes(container.id));

  /*
   * هل هناك بعض العبوات محددة؟
   */
  const someSelected = selected.length > 0 && selected.length < all.length;

  /*
   * تحديد / إلغاء تحديد كل العبوات
   */
  const toggleAll = () => {
    if (allSelected) {
      setSelected([]);
      return;
    }

    setSelected(all.map((container) => container.id));
  };

  /*
   * تحديد عبوة واحدة
   */
  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  };

  /*
   * حفظ التعيينات
   */
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

  /*
   * إضافة حاوية جديدة
   */
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
        {/* ================= Add Container ================= */}

        <form
          onSubmit={add}
          className="rounded-xl border border-ink-400/10 p-4 space-y-3"
        >
          <div className="flex items-center gap-2 font-bold text-sm">
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

        {/* ================= Selection Header ================= */}

        <div className="rounded-xl border border-ink-400/10 bg-ink-400/[0.03] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink-900">
                تعيين العبوات
              </p>

              <p className="text-xs text-ink-400 mt-1">
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

        {/* ================= Containers ================= */}

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
              {/* Select All Row */}

              <button
                type="button"
                onClick={toggleAll}
                className="w-full flex items-center gap-3 border-b bg-primary-50/40 p-3 text-right hover:bg-primary-50"
              >
                {allSelected ? (
                  <CheckSquare size={18} className="text-primary-600" />
                ) : (
                  <Square size={18} className="text-ink-400" />
                )}

                <div className="flex-1">
                  <div className="font-semibold text-sm">
                    {allSelected
                      ? "إلغاء تحديد كل العبوات"
                      : "تحديد كل العبوات"}
                  </div>

                  <div className="text-xs text-ink-400 mt-0.5">
                    سيتم تعيين جميع العبوات لهذا المخزن
                  </div>
                </div>

                <span className="text-xs text-ink-400">{all.length}</span>
              </button>

              {/* Containers */}

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
                      <div className="font-medium text-sm">
                        {container.name}
                      </div>

                      {container.code && (
                        <div className="text-xs text-ink-400 mt-0.5">
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
                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"
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

        {/* ================= Actions ================= */}

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

  const { data: partner } = useGetPartyByIdQuery(partnerId, {
    skip: !partnerId,
  });

  const { data, isLoading, isFetching, isError, refetch } =
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

  const onPageChange = (newPage) => {
    setPage(newPage);
  };

  const onPageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  return (
    <div className="animate-fadeUp">
      {/* ================= Header ================= */}

      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border"
        >
          <ArrowRight size={16} />
        </button>

        <div className="flex-1">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Boxes size={20} />
            مخزن عبوات {partner?.name ?? ""}
          </h2>

          <p className="mt-1 text-sm text-ink-400">
            إدارة المخزن والحاويات والحركات.
          </p>
        </div>

        {currentStore && (
          <div className="flex gap-2">
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

      {/* ================= No Store ================= */}

      {partner && !currentStore && !isLoading && !isError && (
        <div className="mb-5 flex items-center justify-between rounded-2xl border border-primary-200 bg-primary-50/60 p-5">
          <div>
            <b>لا يوجد مخزن عبوات لهذا الشريك</b>

            <p className="mt-1 text-sm text-ink-500">
              أنشئ مخزنًا ثم اربط به الحاويات.
            </p>
          </div>

          <Button onClick={() => setStoreModal(true)}>
            <Plus size={15} />
            إنشاء مخزن عبوات
          </Button>
        </div>
      )}

      {/* ================= Filters ================= */}

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

      {/* ================= Loading ================= */}

      {isLoading && (
        <div className="py-16 text-center text-ink-400">
          جاري تحميل كشف مخزن العبوات...
        </div>
      )}

      {/* ================= Error ================= */}

      {isError && (
        <div className="p-4 text-rose-600">
          حدث خطأ أثناء تحميل التفاصيل.
          <button onClick={refetch} className="mr-2 underline">
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* ================= Store ================= */}

      {currentStore && data && (
        <>
          {/* Store Summary */}

          <div className="mb-4 rounded-2xl border bg-white p-4 shadow-card">
            <div className="mb-3 flex items-center gap-2 font-bold">
              <Boxes size={16} />

              {currentStore.name}

              {currentStore.code && (
                <span className="text-xs text-ink-400">
                  ({currentStore.code})
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {[
                ["رصيد افتتاحي", data.summary.openingUnits],
                ["إجمالي الصادر", data.summary.totalOutgoingUnits],
                ["إجمالي الوارد", data.summary.totalIncomingUnits],
                ["صافي الحركة", data.summary.netUnits],
                ["الرصيد الختامي", data.summary.closingUnits],
                ["عدد الحركات", data.summary.movementCount],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-ink-400/5 px-4 py-3">
                  <div className="text-xs text-ink-400">{label}</div>

                  <div className="mt-1 text-lg font-bold">{fmt(value)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= Containers Summary ================= */}

          <div className="mb-4 overflow-x-auto rounded-2xl border bg-white shadow-card">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <b>ملخص العبوات</b>

              <button
                onClick={() => setContainersModal(true)}
                className="text-xs text-primary-600"
              >
                إدارة الحاويات
              </button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-400/5 text-ink-400">
                  {[
                    "العبوة",
                    "افتتاحي",
                    "صادر",
                    "وارد",
                    "صافي",
                    "ختامي",
                    "الحالة",
                  ].map((label) => (
                    <th key={label} className="px-3 py-2 text-right">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.containers.map((container) => (
                  <tr key={container.containerId} className="border-t">
                    <td className="px-3 py-2">
                      <b>{container.containerName}</b>

                      <div className="text-xs text-ink-400">
                        {container.containerCode}
                      </div>
                    </td>

                    <td>{fmt(container.openingUnits)}</td>

                    <td className="text-rose-600">
                      {fmt(container.periodOutgoingUnits)}
                    </td>

                    <td className="text-primary-500">
                      {fmt(container.periodIncomingUnits)}
                    </td>

                    <td>{fmt(container.periodNetUnits)}</td>

                    <td className="font-bold">{fmt(container.closingUnits)}</td>

                    <td>
                      {container.isCurrentlyAssignedToStore
                        ? "معينة بالمخزن"
                        : "غير معينة"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= Movements ================= */}

          <div className="overflow-x-auto rounded-2xl border bg-white shadow-card">
            <h3 className="border-b px-4 py-2 font-bold">
              حركات العبوات ({fmt(data.totalCount)})
            </h3>

            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-400/5 text-ink-400">
                  {[
                    "التاريخ",
                    "الفاتورة",
                    "النوع",
                    "العبوة",
                    "صادر",
                    "وارد",
                    "الرصيد الجاري",
                    "الوصف",
                  ].map((label) => (
                    <th key={label} className="px-3 py-2 text-right">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-ink-400">
                      لا توجد حركات مطابقة للفلاتر
                    </td>
                  </tr>
                ) : (
                  data.items.map((item) => (
                    <tr key={item.movementId} className="border-t">
                      <td className="px-3 py-2">
                        {fmtDate(item.movementDate)}
                      </td>

                      <td className="px-3 py-2">
                        <b>{item.invoiceNumber}</b>

                        {item.partnerInvoiceNumber && (
                          <div className="text-xs text-ink-400">
                            فاتورة العميل: {item.partnerInvoiceNumber}
                          </div>
                        )}
                      </td>

                      <td>
                        <span
                          className={`rounded px-2 py-0.5 text-xs ${
                            badges[item.invoiceType] ?? "bg-ink-400/10"
                          }`}
                        >
                          {labels[item.invoiceType] ?? item.invoiceType}
                        </span>
                      </td>

                      <td>
                        {item.containerName}

                        <div className="text-xs text-ink-400">
                          {item.containerCode}
                        </div>
                      </td>

                      <td className="text-rose-600">
                        {item.outgoingUnits ? fmt(item.outgoingUnits) : "—"}
                      </td>

                      <td className="text-primary-500">
                        {item.incomingUnits ? fmt(item.incomingUnits) : "—"}
                      </td>

                      <td className="font-bold">
                        {fmt(item.runningBalanceUnits)}
                      </td>

                      <td className="text-ink-400">
                        {item.movementDescription}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* ================= Pagination ================= */}

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
              <div className="border-t px-4 py-2 text-center text-xs text-ink-400">
                جاري تحديث البيانات...
              </div>
            )}
          </div>
        </>
      )}

      {/* ================= Store Modal ================= */}

      {partner && (
        <StoreModal
          open={storeModal}
          onClose={() => setStoreModal(false)}
          party={partner}
          store={currentStore}
          onSaved={async (savedStore) => {
            setStore(savedStore);
            setStoreModal(false);
            await refetch();
          }}
        />
      )}

      {/* ================= Containers Modal ================= */}

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
