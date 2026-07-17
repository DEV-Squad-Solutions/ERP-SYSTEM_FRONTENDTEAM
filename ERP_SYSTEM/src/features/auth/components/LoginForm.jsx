import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2 } from "lucide-react";
import { useLoginMutation } from "../authApi";
import { setCredentials } from "../authSlice";
import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";

const loginSchema = z.object({
  username: z.string().min(3, "اسم المستخدم قصير جداً"),
  password: z.string().min(6, "كلمة المرور لازم تكون 6 حروف على الأقل"),
});

/**
 * @param {{ onBack: () => void }} props
 */
export default function LoginForm({ onBack }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedCompany = useSelector((state) => state.auth.selectedCompany);
  const [login, { isLoading, error }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    try {
      const result = await login({
        companyId: selectedCompany.id,
        ...data,
      }).unwrap();
      dispatch(setCredentials(result));
      navigate("/dashboard");
    } catch (err) {
      console.error("فشل تسجيل الدخول:", err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fadeUp">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-ink-400 mb-5 hover:text-ink-900 transition-colors"
      >
        <ArrowRight size={16} />
        رجوع لاختيار الشركة
      </button>

      <div className="flex items-center gap-3 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 mb-5">
        <span className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center shrink-0">
          <Building2 size={16} />
        </span>
        <p className="text-sm text-primary-500">
          جاري تسجيل الدخول إلى{" "}
          <span className="font-semibold">{selectedCompany?.name}</span>
        </p>
      </div>

      <h2 className="font-display text-xl font-bold text-ink-900 mb-5">
        تسجيل الدخول
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="اسم المستخدم"
          {...register("username")}
          error={errors.username?.message}
        />

        <Input
          label="كلمة المرور"
          type="password"
          {...register("password")}
          error={errors.password?.message}
        />

        {error && (
          <div className="bg-negative/5 border border-negative/20 rounded-xl px-4 py-2.5 animate-fadeUp">
            <p className="text-negative text-sm text-center">
              بيانات الدخول غير صحيحة، حاول مرة أخرى
            </p>
          </div>
        )}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "جاري الدخول..." : "دخول"}
        </Button>
      </form>
    </div>
  );
}
