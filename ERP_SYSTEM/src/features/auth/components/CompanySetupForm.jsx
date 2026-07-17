import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useRegisterCompanyMutation } from "../../auth/authApi";

const companySchema = z.object({
  name: z.string().min(2, "اسم الشركة مطلوب"),
  address: z.string().min(3, "عنوان الشركة مطلوب"),
  commercialRegister: z.string().min(2, "رقم السجل التجاري مطلوب"),
  taxNumber: z.string().min(2, "الرقم الضريبي مطلوب"),
  managerName: z.string().min(2, "اسم مدير الشركة مطلوب"),
});

export default function CompanySetupForm() {
  const navigate = useNavigate();
  const [registerCompany, { isLoading }] = useRegisterCompanyMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(companySchema) });

  const onSubmit = async (data) => {
    try {
      await registerCompany(data).unwrap();
      navigate("/login");
    } catch (err) {
      console.error("فشل تسجيل الشركة:", err);
    }
  };

  const fields = [
    { name: "name", label: "اسم الشركة" },
    { name: "address", label: "عنوان الشركة" },
    { name: "commercialRegister", label: "السجل التجاري" },
    { name: "taxNumber", label: "الرقم الضريبي" },
    { name: "managerName", label: "مدير الشركة" },
  ];

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm border p-8">
      <h1 className="text-xl font-bold mb-6">تسجيل شركة جديدة</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block mb-1 text-sm font-medium">
              {field.label}
            </label>
            <input
              {...register(field.name)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors[field.name] && (
              <p className="text-red-500 text-xs mt-1">
                {errors[field.name].message}
              </p>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "جاري التسجيل..." : "تسجيل الشركة"}
        </button>
      </form>
    </div>
  );
}
