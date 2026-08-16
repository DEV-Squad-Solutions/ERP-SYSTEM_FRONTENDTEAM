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
    <div dir="rtl" className="min-h-screen   px-4 py-6 sm:px-8">
      {isLoading && <InvoiceDetailsSkeleton />}

      {!isLoading && isError && (
        <InvoiceDetailsError
          onRetry={refetch}
          onBack={() => navigate("/dashboard/sales")}
        />
      )}

      {!isLoading && !isError && invoice && (
        <>
          <div className="mx-auto max-w-7xl space-y-5 animate-fadeUp">
            <InvoiceHeader
              invoice={invoice}
              onAction={handleAction}
              isFetching={isFetching}
            />

            {/* معلومات الفاتورة + الدفع */}
            <div className="grid gap-5  ">
              <InvoiceInfoCard invoice={invoice} />
              <InvoicePaymentCard invoice={invoice} />
            </div>

            {/* بيانات الميزان تعرض عند الحاجة فقط */}
            {(invoice.wbWeight > 0 ||
              invoice.wbScaleDifference > 0 ||
              invoice.contentType === "Weight") && (
              <InvoiceWeighbridgeCard invoice={invoice} />
            )}

            {/* الأصناف */}
            {invoice.lines?.length > 0 && (
              <InvoiceItemsTable
                items={invoice.lines}
                currency={invoice.currency}
              />
            )}

            {/* الحاويات */}
            {invoice.containerLines?.length > 0 && (
              <InvoiceContainerLinesTable
                containerLines={invoice.containerLines}
              />
            )}

            {/* الملخص */}
            <div className="flex justify-end">
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
