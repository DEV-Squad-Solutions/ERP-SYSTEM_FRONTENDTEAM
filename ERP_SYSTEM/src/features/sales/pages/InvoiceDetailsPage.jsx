import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import InvoiceHeader from "../components/Detailscomponents/InvoiceHeader";
import InvoiceInfoCard from "../components/Detailscomponents/InvoiceInfoCard";
import InvoiceWeighbridgeCard from "../components/Detailscomponents/InvoiceWeighbridgeCard";
import InvoicePaymentCard from "../components/Detailscomponents/InvoicePaymentCard";
import InvoiceItemsTable from "../components/Detailscomponents/InvoiceItemsTable";
import InvoiceContainerLinesTable from "../components/Detailscomponents/InvoiceContainerLinesTable";
import InvoiceSummaryCard from "../components/Detailscomponents/InvoiceSummaryCard";
import ConfirmDeleteModal from "../components/Detailscomponents/ConfirmDeleteModal";
import {
  InvoiceDetailsSkeleton,
  InvoiceDetailsError,
} from "../components/Detailscomponents/InvoiceDetailsStates";

import {
  useGetInvoiceByIdQuery,
  useDeleteInvoiceMutation,
} from "../../invoices/invoicesApi";

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: invoice,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetInvoiceByIdQuery(id);

  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleAction = useCallback(
    async (action) => {
      switch (action) {
        case "edit":
          navigate(`/dashboard/sales/${id}/edit`);
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
    [id, navigate],
  );

  const handleConfirmDelete = async () => {
    try {
      await deleteInvoice(id).unwrap();
      toast.success("تم حذف الفاتورة");
      navigate("/dashboard/sales");
    } catch {
      toast.error("حدث خطأ أثناء حذف الفاتورة");
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-paper px-4 py-6 sm:px-8">
      {isLoading && <InvoiceDetailsSkeleton />}

      {!isLoading && isError && (
        <InvoiceDetailsError
          onRetry={refetch}
          onBack={() => navigate("/dashboard/sales")}
        />
      )}

      {!isLoading && !isError && invoice && (
        <>
          <div className="mx-auto max-w-6xl space-y-5 animate-fadeUp">
            <InvoiceHeader
              invoice={invoice}
              onAction={handleAction}
              isFetching={isFetching}
            />

            <InvoiceInfoCard invoice={invoice} />

            <InvoiceWeighbridgeCard invoice={invoice} />

            <InvoicePaymentCard invoice={invoice} />

            <InvoiceItemsTable
              items={invoice.lines}
              currency={invoice.currency}
            />
            <InvoiceContainerLinesTable
              containerLines={invoice.containerLines}
            />
            <div className="flex ">
              <InvoiceSummaryCard invoice={invoice} />
            </div>
          </div>

          <ConfirmDeleteModal
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            invoiceNumber={invoice.invoiceNumber}
            isDeleting={isDeleting}
            onConfirm={handleConfirmDelete}
          />
        </>
      )}
    </div>
  );
}
