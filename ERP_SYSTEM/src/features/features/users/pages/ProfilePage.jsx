import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserCog,
} from "lucide-react";

import { useGetUserByIdQuery } from "../../../features/users/usersApi";
import { selectIsAdmin, selectUserId } from "../../../auth/authSlice";

export default function ProfilePage() {
  const navigate = useNavigate();

  const userId = useSelector(selectUserId);
  const isAdmin = useSelector(selectIsAdmin);

  const {
    data: user,
    isLoading,
    isError,
  } = useGetUserByIdQuery(userId, {
    skip: !userId || !isAdmin,
  });

  if (!isAdmin) {
    return (
      <div className="p-4 lg:p-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center dark:border-red-500/10 dark:bg-red-500/5">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            لا تملك صلاحية عرض تفاصيل المستخدم
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 rounded-2xl bg-ink-100 dark:bg-white/5" />
          <div className="h-40 rounded-2xl bg-ink-100 dark:bg-white/5" />
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

  const initials =
    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}` || "U";

  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.userName ||
    "المستخدم";

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">
            الملف الشخصي
          </h2>

          <p className="mt-0.5 text-xs text-ink-400 dark:text-ink-500">
            تفاصيل حساب المستخدم
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/profile/edit")}
          className="flex items-center gap-2 rounded-xl bg-primary-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-600 hover:shadow-md active:scale-95"
        >
          <UserCog size={15} />
          تعديل
        </button>
      </div>

      <div className="rounded-2xl border border-ink-200/70 bg-white p-4 shadow-sm dark:border-white/[0.07] dark:bg-ink-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-50 text-lg font-bold text-primary-600 ring-4 ring-primary-500/5 dark:bg-primary-500/10 dark:text-primary-400">
            {initials}

            <span className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-primary-500 text-white dark:border-ink-900">
              <ShieldCheck size={10} />
            </span>
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-bold text-ink-900 dark:text-white">
              {fullName}
            </h3>

            <p className="mt-1 text-xs text-ink-400 dark:text-ink-500">
              @{user.userName}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {user.roles?.map((role) => (
                <span
                  key={role}
                  className="rounded-lg bg-primary-50 px-2 py-1 text-[10px] font-semibold text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <InfoCard icon={User} label="اسم المستخدم" value={user.userName} />

        <InfoCard icon={Mail} label="البريد الإلكتروني" value={user.email} />

        <InfoCard
          icon={Phone}
          label="رقم الهاتف"
          value={user.phoneNumber || "غير مسجل"}
        />

        <InfoCard
          icon={Building2}
          label="عدد الشركات"
          value={`${user.companies?.length || 0} شركة`}
        />
      </div>

      <div className="rounded-2xl border border-ink-200/70 bg-white p-4 shadow-sm dark:border-white/[0.07] dark:bg-ink-900">
        <div className="mb-3 flex items-center gap-2">
          <Building2 size={17} className="text-primary-500" />

          <h3 className="text-sm font-bold text-ink-800 dark:text-white">
            الشركات المرتبطة
          </h3>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {user.companies?.map((company) => (
            <div
              key={company.id}
              className="flex items-center gap-2 rounded-xl bg-ink-50 p-3 dark:bg-white/[0.03]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-500/10 dark:text-primary-400">
                <Building2 size={15} />
              </div>

              <span className="truncate text-xs font-medium text-ink-700 dark:text-ink-200">
                {company.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-ink-200/70 bg-white p-4 dark:border-white/[0.07] dark:bg-ink-900">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-500/10 dark:text-primary-400">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] text-ink-400 dark:text-ink-500">{label}</p>

        <p className="mt-0.5 truncate text-xs font-semibold text-ink-700 dark:text-ink-200">
          {value || "غير متوفر"}
        </p>
      </div>
    </div>
  );
}
