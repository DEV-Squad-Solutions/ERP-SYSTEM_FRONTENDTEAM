import { useState } from "react";
import { toast } from "sonner";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import { useCreateDriverMutation } from "../../drivers/driversApi";

/**
 * @param {{ isOpen: boolean, onClose: () => void, onCreated: (driver: Object) => void }} props
 */
export default function QuickAddDriverModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [code, setCode] = useState("");
  const [createDriver] = useCreateDriverMutation();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newDriver = await createDriver({
        name,
        licenseNumber,
        code,
      }).unwrap();
      toast.success("تم إضافة السائق بنجاح");
      onCreated(newDriver);
      onClose();
    } catch {
      toast.error("فشل إضافة السائق");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة سائق جديد">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="الكود"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
          }}
        />
        <Input
          label="اسم السائق"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label=" رقم الرخصة "
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
        />
        <Button type="submit" className="w-full">
          إضافة
        </Button>
      </form>
    </Modal>
  );
}
