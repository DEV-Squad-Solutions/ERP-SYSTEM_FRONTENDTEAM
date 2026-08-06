// src/features/permissions/components/UsersTab.jsx
import { useState } from "react";
import { toast } from "sonner";
import {
  FileSearch,
  AlertCircle,
  RefreshCw,
  Pencil,
  Trash2,
} from "lucide-react";
import Pagination from "../../../shared/components/ui/Pagination";
import Button from "../../../shared/components/ui/Button";
import { useGetUsersQuery, useDeleteUserMutation } from "../usersApi";
import QuickAddUserModal from "../components/QuickAddUserModal";

export default function UsersTab() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const { data, isLoading, isFetching, isError, refetch } = useGetUsersQuery({
    pageNumber: page,
    pageSize,
  });

  const [deleteUser] = useDeleteUserMutation();

  const items = data?.items || [];

  const openCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    if (!confirm(`متأكد من حذف المستخدم "${user.userName}"؟`)) return;
    setDeletingId(user.id);
    try {
      await deleteUser(user.id).unwrap();
      toast.success("تم حذف المستخدم");
    } catch (err) {
      toast.error(err?.data?.detail || "تعذر حذف المستخدم");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-ink-500">
          المستخدمون المسجلون وأدوارهم والشركات المتاحة لكل واحد
        </p>
        <Button onClick={openCreate}>+ مستخدم جديد</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-xl bg-ink-400/5"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-negative/25 bg-negative/[0.02] py-14 text-center">
          <AlertCircle
            size={34}
            className="mx-auto mb-3 text-negative/70"
            strokeWidth={1.6}
          />
          <p className="mb-1 font-medium text-ink-900">
            حدث خطأ في تحميل المستخدمين
          </p>
          <button
            onClick={refetch}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-500 transition-colors hover:bg-primary-100 hover:text-primary-600"
          >
            <RefreshCw size={15} />
            إعادة المحاولة
          </button>
        </div>
      ) : !isFetching && items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-400/20 py-16 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-ink-400/5">
            <FileSearch
              size={26}
              className="text-ink-400/50"
              strokeWidth={1.6}
            />
          </div>
          <p className="font-medium text-ink-900">لا يوجد مستخدمون مطابقون</p>
        </div>
      ) : (
        <div
          className={`overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card transition-opacity ${
            isFetching ? "opacity-60" : ""
          }`}
        >
          <div className="overflow-x-auto custom-scroll">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-ink-900/[0.03]">
                <tr className="border-b border-ink-400/10 text-xs font-semibold text-ink-400">
                  <th className="min-w-[160px] px-4 py-3 text-right">الاسم</th>
                  <th className="min-w-[140px] px-4 py-3 text-right">
                    اسم المستخدم
                  </th>
                  <th className="min-w-[180px] px-4 py-3 text-right">
                    الإيميل
                  </th>
                  <th className="min-w-[160px] px-4 py-3 text-right">
                    الأدوار
                  </th>
                  <th className="min-w-[180px] px-4 py-3 text-right">
                    الشركات
                  </th>
                  <th className="w-20 px-4 py-3"></th>
                </tr>
              </thead>

              <tbody>
                {items.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-ink-400/5 transition-colors last:border-0 hover:bg-ink-900/[0.012]"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-ink-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-600">
                      {u.userName}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-600">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.map((r) => (
                          <span
                            key={r}
                            className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-600"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-500">
                      {u.companies?.map((c) => c.name).join("، ") || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                          title="تعديل"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          disabled={deletingId === u.id}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-negative/10 hover:text-negative disabled:opacity-50"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data?.totalPages > 0 && (
            <div className="border-t border-ink-400/10 bg-white px-5 py-4">
              <Pagination
                page={page}
                pageSize={pageSize}
                totalCount={data?.totalCount || 0}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
                label="مستخدم"
              />
            </div>
          )}
        </div>
      )}

      <QuickAddUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={editingUser}
      />
    </div>
  );
}
