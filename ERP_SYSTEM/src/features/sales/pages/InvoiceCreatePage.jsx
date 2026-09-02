import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CreateInvoiceForm from "../components/createComponents/CreateInvoiceForm";

export default function InvoiceCreatePage() {
  const navigate = useNavigate();

  return (
    <div className=" animate-fadeUp ">
      <CreateInvoiceForm onSuccess={() => navigate("/dashboard/sales")} />
    </div>
  );
}
