import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserRound,
  Pencil,
} from "lucide-react";

import { logout, selectIsAdmin } from "../../../features/auth/authSlice";

import { navigationItems } from "../../constants/navigation";
import { matchRouteTitle } from "../../constants/routeTitles";
import Modal from "../../components/ui/Modal";

const findBreadcrumb = (items, pathname, parents = []) => {
  for (const item of items) {
    if (item.type === "section") continue;

    const currentParents = item.path ? [...parents, item] : parents;

    if (item.path === pathname) {
      return currentParents;
    }

    if (item.children) {
      const result = findBreadcrumb(item.children, pathname, currentParents);

      if (result) return result;
    }
  }

  return null;
};

const getInitials = (name) => {
  if (!name) return "U";

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export default function Navbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const fullName = useSelector((state) => state.auth.fullName);
  const email = useSelector((state) => state.auth.email);
  const isAdmin = useSelector(selectIsAdmin);

  const [profileOpen, setProfileOpen] = useState(false);

  const breadcrumb = useMemo(
    () => findBreadcrumb(navigationItems, location.pathname) || [],
    [location.pathname],
  );

  const pageTitle = matchRouteTitle(location.pathname) || "نظام إدارة الحسابات";

  const initials = getInitials(fullName);

  const canGoBack = location.pathname !== "/dashboard";

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    dispatch(logout());
    navigate("/");
  };

  useEffect(() => {
    document.title = `${pageTitle} | نظام إدارة الحسابات`;
  }, [pageTitle]);

  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 h-[58px] border-b border-ink-200/70 bg-white/90 backdrop-blur-xl dark:border-white/[0.07] dark:bg-ink-900/90">
        <div className="flex h-full items-center justify-between gap-2 px-3 sm:px-4 lg:px-5">
          <div className="flex min-w-0 items-center gap-1">
            <button
              onClick={onMenuClick}
              className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-all duration-200 hover:bg-primary-50 hover:text-primary-600 active:scale-90 dark:text-ink-400 dark:hover:bg-primary-500/10 dark:hover:text-primary-400 lg:hidden"
              aria-label="فتح القائمة"
            >
              <Menu
                size={19}
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </button>

            {canGoBack && (
              <button
                onClick={handleBack}
                className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-all duration-200 animate-[fadeSlideIn_0.25s_ease-out] hover:bg-primary-50 hover:text-primary-600 active:scale-90 dark:text-ink-400 dark:hover:bg-primary-500/10 dark:hover:text-primary-400"
                aria-label="رجوع"
              >
                <ChevronRight
                  size={18}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </button>
            )}

            <div className="flex min-w-0 items-center gap-1">
              {breadcrumb.length > 1 && (
                <div className="hidden min-w-0 items-center gap-0.5 text-[11px] font-medium text-ink-400 animate-[fadeSlideIn_0.25s_ease-out] dark:text-ink-500 sm:flex">
                  {breadcrumb.slice(0, -1).map((item, index) => (
                    <div
                      key={`${item.path}-${index}`}
                      className="flex min-w-0 items-center"
                    >
                      {index > 0 && (
                        <ChevronLeft
                          size={11}
                          className="mx-0.5 shrink-0 text-ink-300 dark:text-ink-600"
                        />
                      )}

                      <button
                        onClick={() => navigate(item.path)}
                        className="max-w-24 truncate rounded-md px-1 py-0.5 transition-all duration-200 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10 dark:hover:text-primary-400"
                      >
                        {item.label}
                      </button>
                    </div>
                  ))}

                  <ChevronLeft
                    size={11}
                    className="mx-0.5 shrink-0 text-ink-300 dark:text-ink-600"
                  />
                </div>
              )}

              <div className="flex min-w-0 items-center gap-1.5 animate-[fadeSlideIn_0.3s_ease-out]">
                <span className="hidden h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500 shadow-[0_0_0_3px] shadow-primary-500/10 sm:block" />

                <h1 className="truncate font-display text-[14px] font-semibold tracking-tight text-ink-800 dark:text-white sm:text-[15px] lg:text-base">
                  {pageTitle}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center">
            <button
              onClick={() => setProfileOpen(true)}
              className="group flex items-center gap-2 rounded-xl px-1.5 py-1 transition-all duration-200 hover:bg-ink-50 active:scale-[0.98] dark:hover:bg-white/[0.04]"
              aria-label="قائمة المستخدم"
            >
              <div
                className={`relative flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-[10px] font-bold tracking-tight text-primary-600 transition-all duration-300 dark:bg-primary-500/10 dark:text-primary-400 ${
                  isAdmin ? "admin-ring" : ""
                }`}
              >
                {initials}

                {isAdmin && (
                  <span className="absolute -bottom-0.5 -left-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-primary-500 text-white dark:border-ink-900">
                    <ShieldCheck size={8} />
                  </span>
                )}
              </div>

              <div className="hidden min-w-0 flex-col items-start leading-none md:flex">
                <span className="max-w-28 truncate text-[11px] font-semibold text-ink-700 dark:text-ink-200 lg:max-w-36">
                  {fullName || "المستخدم"}
                </span>

                <span className="mt-1 text-[9px] text-ink-400 dark:text-ink-500">
                  {isAdmin ? "مدير النظام" : "مستخدم"}
                </span>
              </div>

              <ChevronLeft
                size={13}
                className="hidden -rotate-90 text-ink-300 transition-transform duration-200 group-hover:text-primary-500 dark:text-ink-600 md:block"
              />
            </button>
          </div>
        </div>
      </header>

      <Modal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        title="حسابي"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-ink-50/70 p-3 dark:bg-white/[0.03]">
            <div
              className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 ${
                isAdmin ? "admin-ring" : ""
              }`}
            >
              {initials}

              {isAdmin && (
                <span className="absolute -bottom-0.5 -left-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-primary-500 text-white dark:border-ink-900">
                  <ShieldCheck size={9} />
                </span>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-800 dark:text-white">
                {fullName || "المستخدم"}
              </p>

              <p className="mt-0.5 truncate text-[10px] text-ink-400 dark:text-ink-500">
                {email || "لا يوجد بريد إلكتروني"}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setProfileOpen(false);
              navigate("/dashboard/profile");
            }}
            className="group flex w-full items-center gap-3 rounded-xl border border-ink-100 p-3 text-right transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50 dark:border-white/[0.06] dark:hover:border-primary-500/20 dark:hover:bg-primary-500/10"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500 transition-all group-hover:bg-primary-100 group-hover:text-primary-600 dark:bg-white/[0.04] dark:text-ink-400 dark:group-hover:bg-primary-500/15 dark:group-hover:text-primary-400">
              <UserRound size={17} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-ink-700 dark:text-ink-200">
                عرض الملف الشخصي
              </p>

              <p className="mt-0.5 text-[9px] text-ink-400 dark:text-ink-500">
                عرض بيانات الحساب والشركات والصلاحيات
              </p>
            </div>

            <ChevronLeft
              size={15}
              className="text-ink-300 transition-transform group-hover:-translate-x-1 dark:text-ink-600"
            />
          </button>

          <button
            onClick={() => {
              setProfileOpen(false);
              navigate("/dashboard/profile/edit");
            }}
            className="group flex w-full items-center gap-3 rounded-xl border border-ink-100 p-3 text-right transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50 dark:border-white/[0.06] dark:hover:border-primary-500/20 dark:hover:bg-primary-500/10"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500 transition-all group-hover:bg-primary-100 group-hover:text-primary-600 dark:bg-white/[0.04] dark:text-ink-400 dark:group-hover:bg-primary-500/15 dark:group-hover:text-primary-400">
              <Pencil size={16} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-ink-700 dark:text-ink-200">
                تعديل الملف الشخصي
              </p>

              <p className="mt-0.5 text-[9px] text-ink-400 dark:text-ink-500">
                تعديل بيانات الحساب والصلاحيات
              </p>
            </div>

            <ChevronLeft
              size={15}
              className="text-ink-300 transition-transform group-hover:-translate-x-1 dark:text-ink-600"
            />
          </button>

          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl border border-red-100 p-3 text-right transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 dark:border-red-500/10 dark:hover:bg-red-500/10"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
              <LogOut size={16} />
            </span>

            <div className="flex-1">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                تسجيل الخروج
              </p>

              <p className="mt-0.5 text-[9px] text-red-400/70">
                إنهاء جلسة الحساب
              </p>
            </div>
          </button>
        </div>
      </Modal>

      <style>
        {`
          @keyframes fadeSlideIn {
            0% {
              opacity: 0;
              transform: translateY(-4px);
            }

            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes adminPulse {
            0%,
            100% {
              box-shadow:
                0 0 0 2px rgba(59, 130, 246, 0.15),
                0 0 0 4px rgba(59, 130, 246, 0.03);
            }

            50% {
              box-shadow:
                0 0 0 2px rgba(59, 130, 246, 0.28),
                0 0 0 5px rgba(59, 130, 246, 0.07);
            }
          }

          .admin-ring {
            animation: adminPulse 2.8s ease-in-out infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .admin-ring,
            [class*="animate-"] {
              animation: none !important;
            }

            * {
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>
    </>
  );
}
