import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";

import { useGetCashboxOptionsQuery } from "../../cashboxes/cashboxesApi";
import {
  useGetUserCashboxPermissionsQuery,
  useReplaceUserCashboxPermissionsMutation,
} from "../../cashboxes/cashboxPermissionsApi";

const emptyGrant = { canView: false, canExecute: false };

/**
 * إدارة صلاحيات خزائن مستخدم للشركة المختارة (Admin فقط).
 *
 * GET  /Users/{userId}/cashbox-permissions
 * PUT  /Users/{userId}/cashbox-permissions
 *
 * - allCashboxes=true يمنح كل الخزائن الحالية والمستقبلية.
 * - canExecute يستلزم canView (بيتم ضبطه تلقائيًا في الواجهة).
 * - بنرسل آخر revision راجع من GET؛ لو السيرفر رد 409 (حد غيّر
 *   الصلاحيات) بنعيد التحميل ونبلّغ المستخدم.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   user: Object | null,
 * }} props
 */
export default function UserCashboxPermissionsModal({ isOpen, onClose, user }) {
  const userId = user?.id;

  const {
    data: permissionData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetUserCashboxPermissionsQuery(userId, {
    skip: !isOpen || !userId,
  });

  // /Cashboxes/select بيرجّع كل الخزائن المتاحة للمستخدم بدون ترقيم
  // (المستخدم Admin هنا فبيرجّع كل خزائن الشركة). تجنّبًا لحد pageSize
  // الأقصى (100) في GET /Cashboxes.
  const { data: cashboxesData, isLoading: isLoadingCashboxes } =
    useGetCashboxOptionsQuery(undefined, { skip: !isOpen });

  const [replacePermissions, { isLoading: isSaving }] =
    useReplaceUserCashboxPermissionsMutation();

  const [allCashboxes, setAllCashboxes] = useState(false);
  const [grants, setGrants] = useState({});

  // تعبئة الحالة من الاستجابة كل ما المودال يفتح أو البيانات تتحدث
  useEffect(() => {
    if (!isOpen || !permissionData) return;

    setAllCashboxes(Boolean(permissionData.allCashboxes));

    const map = {};
    (permissionData.permissions || []).forEach((grant) => {
      map[grant.cashboxId] = {
        canView: Boolean(grant.canView),
        canExecute: Boolean(grant.canExecute),
      };
    });
    setGrants(map);
  }, [isOpen, permissionData]);

  const cashboxes = cashboxesData || [];

  const grantedCount = useMemo(
    () => Object.values(grants).filter((g) => g.canView).length,
    [grants],
  );

  const setGrant = (cashboxId, patch) => {
    setGrants((prev) => {
      const current = prev[cashboxId] || emptyGrant;
      const next = { ...current, ...patch };

      // canExecute يستلزم canView
      if (next.canExecute) next.canView = true;
      // لو العرض اتقفل، التنفيذ لازم يتقفل
      if (!next.canView) next.canExecute = false;

      return { ...prev, [cashboxId]: next };
    });
  };

  const handleSave = async () => {
    if (!userId) return;

    const permissions = allCashboxes
      ? []
      : Object.entries(grants)
          .filter(([, g]) => g.canView || g.canExecute)
          .map(([cashboxId, g]) => ({
            cashboxId: Number(cashboxId),
            canView: Boolean(g.canView),
            canExecute: Boolean(g.canExecute),
          }));

    try {
      await replacePermissions({
        userId,
        allCashboxes,
        revision: permissionData?.revision,
        permissions,
      }).unwrap();

      toast.success("تم حفظ صلاحيات الخزائن");
      onClose();
    } catch (err) {
      if (err?.status === 409) {
        toast.error("حدّثت الصلاحيات من مكان تاني — أعدنا التحميل");
        refetch();
      } else if (err?.status === 403) {
        toast.error("مش مسموح لك بتعديل صلاحيات الخزائن");
      } else {
        toast.error(err?.data?.detail || "تعذر حفظ الصلاحيات");
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`صلاحيات خزائن ${user?.userName || ""}`}
    >
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-xl bg-ink-400/5"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-negative/25 bg-negative/[0.02] px-4 py-6 text-center text-sm text-negative">
          تعذر تحميل صلاحيات الخزائن.
          <button
            type="button"
            onClick={refetch}
            className="mr-2 font-medium underline"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs leading-5 text-ink-400">
            الصلاحيات على الشركة المختارة حاليًا، ومرتبطة بالمستخدم نفسه (مش
            بالسنة المالية). «تنفيذ» بيشمل «عرض» تلقائيًا. من غير أي منح،
            المستخدم مش هيشوف أي خزنة.
          </p>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-primary-400/20 bg-primary-400/5 p-3">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={allCashboxes}
              onChange={(e) => setAllCashboxes(e.target.checked)}
            />

            <span className="flex-1">
              <span className="flex items-center gap-1.5 text-sm font-medium text-ink-900">
                <ShieldCheck size={15} className="text-primary-500" />
                كل الخزائن
              </span>
              <span className="mt-0.5 block text-[11px] text-ink-400">
                يمنح كل خزائن الشركة الحالية والمستقبلية (صلاحية عرض وتنفيذ).
              </span>
            </span>
          </label>

          {!allCashboxes && (
            <div className="overflow-hidden rounded-xl border border-ink-400/10">
              <div className="flex items-center justify-between border-b border-ink-400/10 bg-slate-50 px-3 py-2 text-xs font-semibold text-ink-500">
                <span>الخزنة</span>
                <span className="flex gap-6">
                  <span className="w-12 text-center">عرض</span>
                  <span className="w-12 text-center">تنفيذ</span>
                </span>
              </div>

              {isLoadingCashboxes ? (
                <div className="px-3 py-6 text-center text-sm text-ink-400">
                  جاري تحميل الخزائن...
                </div>
              ) : cashboxes.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-ink-400">
                  لا توجد خزائن في هذه الشركة.
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto custom-scroll">
                  {cashboxes.map((cashbox) => {
                    const grant = grants[cashbox.id] || emptyGrant;
                    return (
                      <div
                        key={cashbox.id}
                        className="flex items-center justify-between border-b border-ink-400/5 px-3 py-2 last:border-0"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-ink-900">
                            {cashbox.name}
                          </div>
                          <div className="text-[11px] text-ink-400">
                            {cashbox.currency}
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-6">
                          <div className="flex w-12 justify-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={grant.canView}
                              onChange={(e) =>
                                setGrant(cashbox.id, {
                                  canView: e.target.checked,
                                })
                              }
                            />
                          </div>

                          <div className="flex w-12 justify-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={grant.canExecute}
                              onChange={(e) =>
                                setGrant(cashbox.id, {
                                  canExecute: e.target.checked,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 border-t border-ink-400/10 pt-4">
            <span className="text-xs text-ink-400">
              {allCashboxes
                ? "كل الخزائن ممنوحة"
                : `${grantedCount} خزنة ممنوحة عرض`}
            </span>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
              >
                إلغاء
              </Button>

              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving || isFetching}
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                حفظ
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
