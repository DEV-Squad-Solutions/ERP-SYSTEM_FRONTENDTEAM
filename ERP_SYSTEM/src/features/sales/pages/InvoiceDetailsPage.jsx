import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import InvoiceHeader from "../components/Detailscomponents/InvoiceHeader";
import InvoiceInfoCard from "../components/Detailscomponents/InvoiceInfoCard";
import InvoiceItemsTable from "../components/Detailscomponents/InvoiceItemsTable";
import InvoiceSummaryCard from "../components/Detailscomponents/InvoiceSummaryCard";
import PackagingDrawer from "../components/Detailscomponents/PackagingDrawer";
import AuditLogDrawer from "../components/Detailscomponents/AuditLogDrawer";
import PrintPreviewModal from "../components/Detailscomponents/PrintPreviewModal";
import ConfirmDeleteModal from "../components/Detailscomponents/ConfirmDeleteModal";
import {
  InvoiceDetailsSkeleton,
  InvoiceDetailsError,
} from "../components/Detailscomponents/InvoiceDetailsStates";

import {
  useGetInvoiceDetailQuery,
  useDuplicateInvoiceMutation,
  useDeleteInvoiceMutation,
} from "../invoicesApi";

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: invoice,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetInvoiceDetailQuery(id);

  const [duplicateInvoice] = useDuplicateInvoiceMutation();
  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();

  const [packagingOpen, setPackagingOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleAction = useCallback(
    async (action) => {
      switch (action) {
        case "edit":
          navigate(`/dashboard/sales/${id}/edit`);
          break;
        case "print":
          setPrintOpen(true);
          break;
        case "copy":
          try {
            const created = await duplicateInvoice(id).unwrap();
            toast.success(`تم إنشاء نسخة جديدة برقم #${created.id}`);
            navigate(`/dashboard/sales/${created.id}`);
          } catch {
            toast.error("تعذر نسخ الفاتورة، حاول مرة أخرى");
          }
          break;
        case "pdf":
          toast("جارٍ تجهيز ملف PDF...");
          break;
        case "packaging":
          setPackagingOpen(true);
          break;
        case "audit":
          setAuditOpen(true);
          break;
        case "delete":
          setDeleteOpen(true);
          break;
        case "back":
          navigate("/dashboard/sales");
          break;
        default:
          break;
      }
    },
    [id, navigate, duplicateInvoice],
  );

  const handleConfirmDelete = async () => {
    try {
      await deleteInvoice(id).unwrap();
      toast.success("تم حذف الفاتورة");
      navigate("/dashboard/sales");
    } catch {
      toast.error("تعذر حذف الفاتورة");
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8">
      {isLoading && <InvoiceDetailsSkeleton />}

      {!isLoading && isError && (
        <InvoiceDetailsError
          onRetry={refetch}
          onBack={() => navigate("/dashboard/sales")}
        />
      )}

      {!isLoading && !isError && invoice && (
        <>
          <div className="mx-auto max-w-6xl space-y-5">
            <InvoiceHeader invoice={invoice} onAction={handleAction} />
            <InvoiceInfoCard invoice={invoice} />
            <InvoiceItemsTable items={invoice.items} />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2" />
              <InvoiceSummaryCard items={invoice.items} />
            </div>
          </div>

          <PackagingDrawer
            open={packagingOpen}
            onClose={() => setPackagingOpen(false)}
            invoiceId={id}
            client={invoice.client}
          />
          <AuditLogDrawer
            open={auditOpen}
            onClose={() => setAuditOpen(false)}
            invoiceId={id}
          />
          <PrintPreviewModal
            open={printOpen}
            onClose={() => setPrintOpen(false)}
            invoiceId={id}
            onConfirm={(mode) =>
              toast(
                `جارٍ التنفيذ: ${mode === "original" ? "طباعة أصل" : mode === "copy" ? "نسخة" : "PDF"}`,
              )
            }
          />
          <ConfirmDeleteModal
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            invoiceId={id}
            isDeleting={isDeleting}
            onConfirm={handleConfirmDelete}
          />
        </>
      )}
    </div>
  );
}
