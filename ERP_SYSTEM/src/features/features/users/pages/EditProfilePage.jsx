import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Save, UserCog } from "lucide-react";
import { toast } from "sonner";

import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from "../../../features/users/usersApi";
import { selectIsAdmin, selectUserId } from "../../../auth/authSlice";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userId = useSelector(selectUserId);
  const isAdmin = useSelector(selectIsAdmin);

  const {
    data: user,
    isLoading,
    isError,
  } = useGetUserByIdQuery(userId, {
    skip: !userId || !isAdmin,
  });

  const [updateUser, { isLoading: isSaving }] = useUpdateUserMutation();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      userName: "",
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    if (!user) return;

    reset({
      userName: user.userName || "",
      email: user.email || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
    });
  }, [user, reset]);

  const companyIds = useMemo(
    () => user?.companies?.map((company) => company.id) || [],
    [user],
  );

  const roles = useMemo(() => user?.roles || [], [user]);

  const onSubmit = async (values) => {
    if (!userId) return;

    if (!roles.length) {
      toast.error("يجب أن يمتلك المستخدم دورًا واحدًا على الأقل");
      return;
    }

    if (!companyIds.length) {
      toast.error("يجب ربط المستخدم بشركة واحدة على الأقل");
      return;
    }

    try {
      await updateUser({
        id: userId,
        userName: values.userName.trim(),
        email: values.email.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phoneNumber: values.phoneNumber.trim() || null,
        roles,
        companyIds,
      }).unwrap();

      dispatch(
        updateProfile({
          id: userId,
          fullName: `${values.firstName} ${values.lastName}`.trim(),
          email: values.email.trim(),
          roles,
        }),
      );

      toast.success("تم تحديث الملف الشخصي بنجاح");

      navigate("/dashboard/profile");
    } catch (error) {
      const message =
        error?.data?.detail || error?.data?.title || "تعذر تحديث الملف الشخصي";

      toast.error(message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-4 lg:p-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center dark:border-red-500/10 dark:bg-red-500/5">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            لا تملك صلاحية تعديل المستخدم
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-20 rounded-2xl bg-ink-100 dark:bg-white/5" />
          <div className="h-72 rounded-2xl bg-ink-100 dark:bg-white/5" />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="p-4 lg:p-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center dark:border-red-500/10 dark:bg-red-500/5">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            تعذر تحميل بيانات المستخدم
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 lg:p-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-500 transition-all hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600 active:scale-95 dark:border-white/[0.07] dark:bg-ink-900 dark:text-ink-400"
        >
          <ArrowRight size={17} />
        </button>

        <div>
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">
            تعديل الملف الشخصي
          </h2>

          <p className="mt-0.5 text-xs text-ink-400 dark:text-ink-500">
            تعديل بيانات الحساب
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-ink-200/70 bg-white p-4 shadow-sm dark:border-white/[0.07] dark:bg-ink-900"
      >
        <div className="mb-5 flex items-center gap-3 border-b border-ink-100 pb-4 dark:border-white/[0.06]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-500/10 dark:text-primary-400">
            <UserCog size={18} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-ink-800 dark:text-white">
              بيانات الحساب
            </h3>

            <p className="text-[10px] text-ink-400 dark:text-ink-500">
              تحديث المعلومات الأساسية للمستخدم
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="اسم المستخدم"
            {...register("userName", {
              required: true,
            })}
          />

          <Field
            label="البريد الإلكتروني"
            type="email"
            {...register("email", {
              required: true,
            })}
          />

          <Field
            label="الاسم الأول"
            {...register("firstName", {
              required: true,
            })}
          />

          <Field
            label="اسم العائلة"
            {...register("lastName", {
              required: true,
            })}
          />

          <Field label="رقم الهاتف" {...register("phoneNumber")} />
        </div>

        <div className="mt-4 rounded-xl bg-ink-50 p-3 dark:bg-white/[0.03]">
          <p className="text-[10px] font-semibold text-ink-500 dark:text-ink-400">
            الأدوار
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {roles.map((role) => (
              <span
                key={role}
                className="rounded-lg bg-primary-50 px-2 py-1 text-[10px] font-semibold text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-ink-50 p-3 dark:bg-white/[0.03]">
          <p className="text-[10px] font-semibold text-ink-500 dark:text-ink-400">
            الشركات
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {user.companies?.map((company) => (
              <span
                key={company.id}
                className="rounded-lg bg-white px-2 py-1 text-[10px] font-medium text-ink-600 shadow-sm dark:bg-white/[0.05] dark:text-ink-300"
              >
                {company.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border border-ink-200 px-4 py-2 text-xs font-semibold text-ink-600 transition-all hover:bg-ink-50 dark:border-white/[0.08] dark:text-ink-300 dark:hover:bg-white/[0.04]"
          >
            إلغاء
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={15} />

            {isSaving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      </form>
    </div>
  );
}

const Field = ({ label, type = "text", ...props }) => {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold text-ink-500 dark:text-ink-400">
        {label}
      </span>

      <input
        type={type}
        {...props}
        className="h-10 w-full rounded-xl border border-ink-200 bg-white px-3 text-xs text-ink-800 outline-none transition-all placeholder:text-ink-300 focus:border-primary-400 focus:ring-3 focus:ring-primary-500/10 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white dark:placeholder:text-ink-600"
      />
    </label>
  );
};
