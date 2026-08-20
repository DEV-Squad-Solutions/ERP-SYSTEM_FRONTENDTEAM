import { memo, useCallback, useMemo, useState } from "react";

import { Boxes, UserPlus } from "lucide-react";

import { Link } from "react-router-dom";

import { useGetPartiesSelectQuery } from "../../partners/partiesApi";

import CompactSelect from "../../../shared/components/ui/CompactSelect";

import PartnerSetupWizard from "../../partners/components/PartnerSetupWizard";

function PartnerSelectHeader({ partnerId, onChange }) {
  const [showAdd, setShowAdd] = useState(false);

  const {
    data: parties = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetPartiesSelectQuery();

  const normalizedId = useMemo(
    () => (partnerId ? String(partnerId) : ""),
    [partnerId],
  );

  const options = useMemo(
    () =>
      parties
        .filter(
          (party) =>
            party?.id !== undefined && party?.id !== null && party?.name,
        )
        .map((party) => ({
          value: String(party.id),
          label: party.name,
        })),
    [parties],
  );

  const handleChange = useCallback(
    (value) => {
      const nextId = value === undefined || value === null ? "" : String(value);

      onChange(nextId);
    },
    [onChange],
  );

  const handleCreated = useCallback(
    (newParty) => {
      if (!newParty?.id) {
        return;
      }

      onChange(String(newParty.id));

      setShowAdd(false);
    },
    [onChange],
  );

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-ink-400/10 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-ink-400/[0.07] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/5">
              <UserPlus size={16} className="text-primary-500" />
            </div>

            <div>
              <p className="text-sm font-semibold text-ink-900">
                العميل / المورد
              </p>

              <p className="text-[11px] text-ink-400">اختر الطرف لعرض حسابه</p>
            </div>
          </div>

          {isError && (
            <button
              type="button"
              onClick={refetch}
              className="text-xs font-medium text-red-500 hover:text-red-600"
            >
              إعادة المحاولة
            </button>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <CompactSelect
                options={options}
                value={normalizedId}
                onChange={handleChange}
                isLoading={isLoading || isFetching}
                placeholder="اختر عميل أو مورد لعرض كشف حسابه"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="flex h-[38px] w-[40px] shrink-0 items-center justify-center rounded-lg border border-ink-400/15 text-primary-500 transition-all duration-200 hover:border-primary-500/30 hover:bg-primary-500/5 active:scale-95"
              title="إضافة عميل أو مورد"
              aria-label="إضافة عميل أو مورد"
            >
              <UserPlus size={18} strokeWidth={1.8} />
            </button>

            <Link
              to={
                normalizedId
                  ? `/dashboard/stores/containers/${normalizedId}`
                  : "#"
              }
              onClick={(event) => {
                if (!normalizedId) {
                  event.preventDefault();
                }
              }}
              className={[
                "flex h-[38px] w-[40px] shrink-0",
                "items-center justify-center",
                "rounded-lg border",
                "transition-all duration-200",
                normalizedId
                  ? "border-gold-500/20 text-gold-600 hover:bg-gold-500/5"
                  : "pointer-events-none border-ink-400/10 text-ink-300 opacity-50",
              ].join(" ")}
              title="مخزن العبوات"
            >
              <Boxes size={18} strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </div>

      <PartnerSetupWizard
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={handleCreated}
      />
    </>
  );
}

export default memo(PartnerSelectHeader);
