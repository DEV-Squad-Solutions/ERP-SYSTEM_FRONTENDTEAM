import { useState } from "react";
import { FileText, Receipt } from "lucide-react";
import { useGetPartnerStatementQuery } from "../statementsApi";
import PartnerSelectHeader from "../components/PartnerSelectHeader";
import StatementFilters from "../components/StatementFilters";
import StatementTable from "../components/StatementTable";
import PartnerInvoicesTab from "../components/PartnerInvoicesTab";
import PackagingDrawer from "../../sales/components/PackagingDrawer";
import { useGetInvoicesQuery } from "../../invoices/invoicesApi";

const emptyFilters = {
  Search: "",
  FromDate: "",
  ToDate: "",
  SourceType: "",
  MovementType: "",
};

export default function PartnerAccountPage() {
  const [partnerId, setPartnerId] = useState("");
  const [activeTab, setActiveTab] = useState("statement");
  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showPackaging, setShowPackaging] = useState(false);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetPartnerStatementQuery(
      {
        BusinessPartnerId: partnerId,
        PageNumber: page,
        PageSize: pageSize,
        ...applied,
      },
      { skip: !partnerId },
    );

  const { data: invoicesForPackaging } = useGetInvoicesQuery(
    { businessPartnerId: partnerId, pageSize: 100 },
    { skip: !partnerId || !showPackaging },
  );
  const aggregatedContainerLines = (() => {
    const map = {};
    (invoicesForPackaging?.items || []).forEach((inv) => {
      (inv.containerLines || []).forEach((c) => {
        if (!map[c.containerId]) {
          map[c.containerId] = {
            id: c.containerId,
            containerName: c.containerName,
            containerCode: c.containerCode,
            outgoingUnits: 0,
            incomingUnits: 0,
          };
        }
        map[c.containerId].outgoingUnits += c.outgoingUnits || 0;
        map[c.containerId].incomingUnits += c.incomingUnits || 0;
      });
    });
    return Object.values(map);
  })();

  const handlePartnerChange = (id) => {
    setPartnerId(id);
    setPage(1);
    setDraft(emptyFilters);
    setApplied(emptyFilters);
  };

  const handleSearch = () => {
    setApplied(draft);
    setPage(1);
  };

  const handleReset = () => {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setPage(1);
  };

  return (
    <div className="animate-fadeUp">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-900">
          العملاء والموردين
        </h2>
        <p className="text-sm text-ink-400 mt-1">
          كشف حساب متكامل مع سجل الفواتير الخاصة بكل عميل أو مورد
        </p>
      </div>

      <PartnerSelectHeader
        partnerId={partnerId}
        onChange={handlePartnerChange}
        onOpenPackaging={() => setShowPackaging(true)}
      />

      {!partnerId ? (
        <div className="text-center py-20 border border-dashed border-ink-400/20 rounded-2xl">
          <p className="text-ink-400">
            اختر عميل أو مورد من الأعلى لعرض بياناته
          </p>
        </div>
      ) : (
        <>
          {/* التابات */}
          <div className="inline-flex bg-ink-400/5 rounded-xl p-1 mb-4">
            <button
              onClick={() => setActiveTab("statement")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg transition-colors ${
                activeTab === "statement"
                  ? "bg-white text-primary-500 font-medium shadow-sm"
                  : "text-ink-400 hover:text-ink-900"
              }`}
            >
              <Receipt size={14} />
              كشف الحساب
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg transition-colors ${
                activeTab === "invoices"
                  ? "bg-white text-primary-500 font-medium shadow-sm"
                  : "text-ink-400 hover:text-ink-900"
              }`}
            >
              <FileText size={14} />
              الفواتير
            </button>
          </div>

          {activeTab === "statement" ? (
            <>
              <StatementFilters
                draft={draft}
                onChange={setDraft}
                onSearch={handleSearch}
                onReset={handleReset}
              />
              <StatementTable
                data={data}
                isLoading={isLoading}
                isFetching={isFetching}
                isError={isError}
                refetch={refetch}
              />
            </>
          ) : (
            <PartnerInvoicesTab partnerId={partnerId} />
          )}
        </>
      )}

      <PackagingDrawer
        partyId={partnerId}
        isOpen={showPackaging}
        onClose={() => setShowPackaging(false)}
        onSave={(data) => setContainersMovement(data)}
      />
    </div>
  );
}
