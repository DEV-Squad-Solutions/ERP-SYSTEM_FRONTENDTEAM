import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Modal from "../../../shared/components/ui/Modal";
import {
  useGetAccountsTreeQuery,
  useDeleteAccountMutation,
  getDescendantIds,
} from "../accountsApi";
import { getAccountErrorMessage } from "../utils/getAccountErrorMessage";
import AccountTreeNode from "../components/AccountTreeNode";
import AccountFormModal from "../components/AccountFormModal";

export default function AccountsPage() {
  const { data: tree, isLoading, isFetching } = useGetAccountsTreeQuery();
  const [deleteAccount] = useDeleteAccountMutation();

  const [modalState, setModalState] = useState(null); // { account, defaultParentId } | null
  const [pendingDelete, setPendingDelete] = useState(null); // node | null
  const [deleteError, setDeleteError] = useState(null);

  const excludedIds = useMemo(() => {
    if (!modalState?.account) return new Set();
    return getDescendantIds(modalState.account);
  }, [modalState]);

  const openCreateRoot = () =>
    setModalState({ account: null, defaultParentId: null });
  const openAddChild = (node) =>
    setModalState({ account: null, defaultParentId: node.id });
  const openEdit = (node) =>
    setModalState({ account: node, defaultParentId: null });
  const closeModal = () => setModalState(null);

  const closeDeleteModal = () => {
    setPendingDelete(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteAccount(pendingDelete.id).unwrap();
      closeDeleteModal();
    } catch (err) {
      setDeleteError(getAccountErrorMessage(err));
    }
  };

  return (
    <div dir="rtl" className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">دليل الحسابات</h1>
          <p className="text-sm text-gray-500">
            إدارة الشجرة المحاسبية للشركة الحالية
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateRoot}
          className="flex items-center gap-1.5 rounded-lg bg-green-900 px-3.5 py-2 text-sm text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          حساب رئيسي جديد
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-2">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : tree?.length ? (
          <div className={isFetching ? "opacity-60 transition-opacity" : ""}>
            {tree.map((node, index) => (
              <AccountTreeNode
                key={node.id}
                node={node}
                isLast={index === tree.length - 1}
                onAddChild={openAddChild}
                onEdit={openEdit}
                onDelete={setPendingDelete}
              />
            ))}
          </div>
        ) : (
          <p className="p-6 text-center text-sm text-gray-400">
            لا توجد حسابات بعد. ابدأ بإضافة حساب رئيسي.
          </p>
        )}
      </div>

      {modalState && (
        <AccountFormModal
          open
          onClose={closeModal}
          account={modalState.account}
          defaultParentId={modalState.defaultParentId}
          excludedIds={excludedIds}
        />
      )}

      {pendingDelete && (
        <Modal
          isOpen
          onClose={closeDeleteModal}
          title={`حذف الحساب "${pendingDelete.name}"؟`}
        >
          <p className="mb-4 text-sm text-gray-500">
            الإجراء ده نهائي ولا يمكن التراجع عنه.
          </p>
          {deleteError && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {deleteError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeDeleteModal}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              تأكيد الحذف
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
