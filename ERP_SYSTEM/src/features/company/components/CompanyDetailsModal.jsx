import { useGetCompanyByIdQuery } from "../companyApi";
import Modal from "../../../shared/components/ui/Modal";
import LedgerPanel from "../../../shared/components/ui/LedgerPanel";
import { useSelector } from "react-redux";
const detailRows = [
  { key: "address", label: "العنوان" },
  { key: "commercialRegister", label: "السجل التجاري" },
  { key: "taxNumber", label: "الرقم الضريبي" },
  { key: "managerName", label: "مدير الشركة" },
];

/**
 * @param {{ companyId: string, isOpen: boolean, onClose: () => void }} props
 */
export default function CompanyDetailsModal({ companyId, isOpen, onClose }) {
  const {
    data: company,
    isLoading,
    isError,
  } = useGetCompanyByIdQuery(companyId, {
    skip: !isOpen || !companyId,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="بيانات الشركة الحالية">
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-11 rounded-lg bg-ink-400/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-center text-negative text-sm py-4">
          تعذر تحميل بيانات الشركة
        </p>
      )}

      {company && (
        <LedgerPanel title={company.name}>
          {detailRows.map((row) => (
            <div key={row.key} className="flex items-stretch">
              <div className="w-32 shrink-0 bg-ink-900/[0.03] px-3 py-2.5 text-sm font-medium text-ink-900 flex items-center border-l border-ink-400/10">
                {row.label}
              </div>
              <div className="flex-1 px-3 py-2.5 text-sm text-ink-600 flex items-center">
                {company[row.key] || "—"}
              </div>
            </div>
          ))}
        </LedgerPanel>
      )}
    </Modal>
  );
}
