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

/* =========================================================
   BREADCRUMB
========================================================= */

const findBreadcrumb = (items, pathname, parents = []) => {
  for (const item of items) {
    if (item.type === "section") continue;

    const currentParents = item.path ? [...parents, item] : parents;

    if (item.path === pathname) {
      return currentParents;
    }

    if (item.children?.length) {
      const result = findBreadcrumb(item.children, pathname, currentParents);

      if (result) return result;
    }
  }

  return null;
};

/* =========================================================
   USER INITIALS
========================================================= */

const getInitials = (name) => {
  if (!name) return "U";

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

/* =========================================================
   NAVBAR
========================================================= */

export default function Navbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const fullName = useSelector((state) => state.auth.fullName);

  const email = useSelector((state) => state.auth.email);

  const isAdmin = useSelector(selectIsAdmin);

  const [profileOpen, setProfileOpen] = useState(false);

  /* =====================================================
     BREADCRUMB
  ===================================================== */

  const breadcrumb = useMemo(
    () => findBreadcrumb(navigationItems, location.pathname) || [],
    [location.pathname],
  );

  /* =====================================================
     PAGE TITLE
  ===================================================== */

  const pageTitle = matchRouteTitle(location.pathname) || "نظام إدارة الحسابات";

  const initials = getInitials(fullName);

  const canGoBack = location.pathname !== "/dashboard";

  /* =====================================================
     HANDLERS
  ===================================================== */

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    setProfileOpen(false);

    dispatch(logout());

    navigate("/");
  };

  /* =====================================================
     DOCUMENT TITLE
  ===================================================== */

  useEffect(() => {
    document.title = `${pageTitle} | نظام إدارة الحسابات`;
  }, [pageTitle]);

  /* =====================================================
     CLOSE PROFILE ON ROUTE CHANGE
  ===================================================== */

  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* =================================================
          NAVBAR
      ================================================= */}

      <header
        className={[
          "sticky top-0 z-40",
          "h-[58px]",
          "border-b",
          "border-ink-200/80",
          "bg-white/95",
          "backdrop-blur-xl",
          "shadow-[0_1px_0_rgba(15,23,42,0.03)]",
          "dark:border-white/[0.08]",
          "dark:bg-ink-900/95",
          "dark:shadow-none",
        ].join(" ")}
      >
        {/* TOP ACCENT */}

        <div
          aria-hidden="true"
          className={[
            "pointer-events-none",
            "absolute inset-x-0 top-0",
            "h-px",
            "bg-gradient-to-l",
            "from-primary-500/30",
            "via-primary-500/10",
            "to-transparent",
            "dark:from-primary-400/30",
            "dark:via-primary-400/10",
          ].join(" ")}
        />

        <div
          className={[
            "flex h-full items-center justify-between",
            "gap-2",
            "px-3 sm:px-4 lg:px-5",
          ].join(" ")}
        >
          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="flex min-w-0 items-center gap-1">
            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={onMenuClick}
              aria-label="فتح القائمة"
              className={[
                "group flex h-8 w-8 shrink-0",
                "items-center justify-center",
                "rounded-lg",
                "text-ink-600",
                "transition-all duration-200",
                "hover:bg-primary-50",
                "hover:text-primary-600",
                "active:scale-90",
                "dark:text-ink-300",
                "dark:hover:bg-primary-500/10",
                "dark:hover:text-primary-400",
                "lg:hidden",
                "focus:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-primary-500/30",
              ].join(" ")}
            >
              <Menu
                size={19}
                strokeWidth={1.9}
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </button>

            {/* BACK */}

            {canGoBack && (
              <button
                type="button"
                onClick={handleBack}
                aria-label="رجوع"
                className={[
                  "group flex h-8 w-8 shrink-0",
                  "items-center justify-center",
                  "rounded-lg",
                  "text-ink-600",
                  "transition-all duration-200",
                  "animate-[fadeSlideIn_0.25s_ease-out]",
                  "hover:bg-primary-50",
                  "hover:text-primary-600",
                  "active:scale-90",
                  "dark:text-ink-300",
                  "dark:hover:bg-primary-500/10",
                  "dark:hover:text-primary-400",
                  "focus:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-primary-500/30",
                ].join(" ")}
              >
                <ChevronRight
                  size={18}
                  strokeWidth={1.9}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </button>
            )}

            {/* =================================================
                PAGE NAVIGATION
            ================================================= */}

            <div className="flex min-w-0 items-center gap-1">
              {/* BREADCRUMB */}

              {breadcrumb.length > 1 && (
                <div
                  className={[
                    "hidden min-w-0 items-center gap-0.5",
                    "text-[11px]",
                    "font-semibold",
                    "text-ink-500",
                    "animate-[fadeSlideIn_0.25s_ease-out]",
                    "dark:text-ink-300",
                    "sm:flex",
                  ].join(" ")}
                >
                  {breadcrumb.slice(0, -1).map((item, index) => (
                    <div
                      key={`${item.path}-${index}`}
                      className="flex min-w-0 items-center"
                    >
                      {index > 0 && (
                        <ChevronLeft
                          size={11}
                          strokeWidth={2}
                          className={[
                            "mx-0.5 shrink-0",
                            "text-ink-400",
                            "dark:text-ink-500",
                          ].join(" ")}
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => navigate(item.path)}
                        title={item.label}
                        className={[
                          "max-w-28 truncate",
                          "rounded-md",
                          "px-1.5 py-0.5",
                          "text-ink-500",
                          "transition-all duration-200",
                          "hover:bg-primary-50",
                          "hover:text-primary-600",
                          "dark:text-ink-300",
                          "dark:hover:bg-primary-500/10",
                          "dark:hover:text-primary-400",
                        ].join(" ")}
                      >
                        {item.label}
                      </button>
                    </div>
                  ))}

                  <ChevronLeft
                    size={11}
                    strokeWidth={2}
                    className={[
                      "mx-0.5 shrink-0",
                      "text-ink-400",
                      "dark:text-ink-500",
                    ].join(" ")}
                  />
                </div>
              )}

              {/* =================================================
                  CURRENT PAGE
              ================================================= */}

              <div
                className={[
                  "flex min-w-0 items-center gap-1.5",
                  "animate-[fadeSlideIn_0.3s_ease-out]",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "hidden h-1.5 w-1.5 shrink-0",
                    "rounded-full",
                    "bg-primary-500",
                    "shadow-[0_0_0_3px]",
                    "shadow-primary-500/10",
                    "sm:block",
                  ].join(" ")}
                />

                <h1
                  className={[
                    "truncate",
                    "font-display",
                    "text-[14px]",
                    "font-bold",
                    "tracking-tight",
                    "text-ink-900",
                    "dark:text-white",
                    "sm:text-[15px]",
                    "lg:text-base",
                  ].join(" ")}
                >
                  {pageTitle}
                </h1>
              </div>
            </div>
          </div>

          {/* =================================================
              USER AREA
          ================================================= */}

          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              aria-label="قائمة المستخدم"
              className={[
                "group flex items-center gap-2",
                "rounded-xl",
                "px-1.5 py-1",
                "transition-all duration-200",
                "hover:bg-ink-50",
                "active:scale-[0.98]",
                "dark:hover:bg-white/[0.05]",
                "focus:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-primary-500/30",
              ].join(" ")}
            >
              {/* AVATAR */}

              <div
                className={[
                  "relative flex h-8 w-8",
                  "items-center justify-center",
                  "rounded-full",
                  "border",
                  "border-primary-200/70",
                  "bg-primary-50",
                  "text-[10px]",
                  "font-bold",
                  "tracking-tight",
                  "text-primary-700",
                  "transition-all duration-300",
                  "group-hover:border-primary-300",
                  "group-hover:bg-primary-100",
                  "dark:border-primary-500/20",
                  "dark:bg-primary-500/10",
                  "dark:text-primary-300",
                  "dark:group-hover:bg-primary-500/15",
                  isAdmin ? "admin-ring" : "",
                ].join(" ")}
              >
                {initials}

                {isAdmin && (
                  <span
                    className={[
                      "absolute -bottom-0.5 -left-0.5",
                      "flex h-3.5 w-3.5",
                      "items-center justify-center",
                      "rounded-full",
                      "border-2",
                      "border-white",
                      "bg-primary-500",
                      "text-white",
                      "shadow-sm",
                      "dark:border-ink-900",
                    ].join(" ")}
                  >
                    <ShieldCheck size={8} strokeWidth={2.5} />
                  </span>
                )}
              </div>

              {/* USER INFO */}

              <div className="hidden min-w-0 flex-col items-start leading-none md:flex">
                <span
                  className={[
                    "max-w-28 truncate",
                    "text-[11px]",
                    "font-bold",
                    "text-ink-800",
                    "dark:text-white",
                    "lg:max-w-36",
                  ].join(" ")}
                >
                  {fullName || "المستخدم"}
                </span>

                <span
                  className={[
                    "mt-1",
                    "text-[9px]",
                    "font-medium",
                    isAdmin
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-ink-500 dark:text-ink-300",
                  ].join(" ")}
                >
                  {isAdmin ? "مدير النظام" : "مستخدم"}
                </span>
              </div>

              {/* CHEVRON */}

              <ChevronLeft
                size={13}
                strokeWidth={2}
                className={[
                  "hidden",
                  "-rotate-90",
                  "text-ink-400",
                  "transition-all duration-200",
                  "group-hover:-translate-y-0.5",
                  "group-hover:text-primary-500",
                  "dark:text-ink-400",
                  "md:block",
                ].join(" ")}
              />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          PROFILE MODAL
      ===================================================== */}

      <Modal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        title="حسابي"
      >
        <div className="space-y-3">
          {/* =================================================
              USER CARD
          ================================================= */}

          <div
            className={[
              "flex items-center gap-3",
              "rounded-xl",
              "border",
              "border-ink-100",
              "bg-ink-50/80",
              "p-3",
              "dark:border-white/[0.07]",
              "dark:bg-white/[0.035]",
            ].join(" ")}
          >
            {/* AVATAR */}

            <div
              className={[
                "relative flex h-11 w-11 shrink-0",
                "items-center justify-center",
                "rounded-full",
                "border",
                "border-primary-200",
                "bg-primary-50",
                "text-sm",
                "font-bold",
                "text-primary-700",
                "dark:border-primary-500/20",
                "dark:bg-primary-500/10",
                "dark:text-primary-300",
                isAdmin ? "admin-ring" : "",
              ].join(" ")}
            >
              {initials}

              {isAdmin && (
                <span
                  className={[
                    "absolute -bottom-0.5 -left-0.5",
                    "flex h-4 w-4",
                    "items-center justify-center",
                    "rounded-full",
                    "border-2",
                    "border-white",
                    "bg-primary-500",
                    "text-white",
                    "dark:border-ink-900",
                  ].join(" ")}
                >
                  <ShieldCheck size={9} strokeWidth={2.5} />
                </span>
              )}
            </div>

            {/* USER DATA */}

            <div className="min-w-0 flex-1">
              <p
                className={[
                  "truncate",
                  "text-sm",
                  "font-bold",
                  "text-ink-900",
                  "dark:text-white",
                ].join(" ")}
              >
                {fullName || "المستخدم"}
              </p>

              <p
                className={[
                  "mt-0.5",
                  "truncate",
                  "text-[10px]",
                  "font-medium",
                  "text-ink-500",
                  "dark:text-ink-300",
                ].join(" ")}
              >
                {email || "لا يوجد بريد إلكتروني"}
              </p>
            </div>
          </div>

          {/* =================================================
              PROFILE
          ================================================= */}

          <button
            type="button"
            onClick={() => {
              setProfileOpen(false);
              navigate("/dashboard/profile");
            }}
            className={[
              "group flex w-full items-center gap-3",
              "rounded-xl",
              "border border-ink-150",
              "bg-white",
              "p-3",
              "text-right",
              "transition-all duration-200",
              "hover:-translate-y-0.5",
              "hover:border-primary-200",
              "hover:bg-primary-50",
              "dark:border-white/[0.07]",
              "dark:bg-white/[0.015]",
              "dark:hover:border-primary-500/20",
              "dark:hover:bg-primary-500/10",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-9 w-9 shrink-0",
                "items-center justify-center",
                "rounded-lg",
                "bg-ink-100",
                "text-ink-600",
                "transition-all duration-200",
                "group-hover:bg-primary-100",
                "group-hover:text-primary-600",
                "dark:bg-white/[0.05]",
                "dark:text-ink-300",
                "dark:group-hover:bg-primary-500/15",
                "dark:group-hover:text-primary-400",
              ].join(" ")}
            >
              <UserRound size={17} strokeWidth={1.9} />
            </span>

            <div className="min-w-0 flex-1">
              <p
                className={[
                  "text-xs",
                  "font-bold",
                  "text-ink-800",
                  "dark:text-white",
                ].join(" ")}
              >
                عرض الملف الشخصي
              </p>

              <p
                className={[
                  "mt-0.5",
                  "text-[9px]",
                  "font-medium",
                  "text-ink-500",
                  "dark:text-ink-300",
                ].join(" ")}
              >
                عرض بيانات الحساب والشركات والصلاحيات
              </p>
            </div>

            <ChevronLeft
              size={15}
              strokeWidth={2}
              className={[
                "text-ink-400",
                "transition-all duration-200",
                "group-hover:-translate-x-1",
                "group-hover:text-primary-500",
                "dark:text-ink-400",
              ].join(" ")}
            />
          </button>

          {/* =================================================
              EDIT PROFILE
          ================================================= */}

          <button
            type="button"
            onClick={() => {
              setProfileOpen(false);
              navigate("/dashboard/profile/edit");
            }}
            className={[
              "group flex w-full items-center gap-3",
              "rounded-xl",
              "border border-ink-150",
              "bg-white",
              "p-3",
              "text-right",
              "transition-all duration-200",
              "hover:-translate-y-0.5",
              "hover:border-primary-200",
              "hover:bg-primary-50",
              "dark:border-white/[0.07]",
              "dark:bg-white/[0.015]",
              "dark:hover:border-primary-500/20",
              "dark:hover:bg-primary-500/10",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-9 w-9 shrink-0",
                "items-center justify-center",
                "rounded-lg",
                "bg-ink-100",
                "text-ink-600",
                "transition-all duration-200",
                "group-hover:bg-primary-100",
                "group-hover:text-primary-600",
                "dark:bg-white/[0.05]",
                "dark:text-ink-300",
                "dark:group-hover:bg-primary-500/15",
                "dark:group-hover:text-primary-400",
              ].join(" ")}
            >
              <Pencil size={16} strokeWidth={1.9} />
            </span>

            <div className="min-w-0 flex-1">
              <p
                className={[
                  "text-xs",
                  "font-bold",
                  "text-ink-800",
                  "dark:text-white",
                ].join(" ")}
              >
                تعديل الملف الشخصي
              </p>

              <p
                className={[
                  "mt-0.5",
                  "text-[9px]",
                  "font-medium",
                  "text-ink-500",
                  "dark:text-ink-300",
                ].join(" ")}
              >
                تعديل بيانات الحساب والصلاحيات
              </p>
            </div>

            <ChevronLeft
              size={15}
              strokeWidth={2}
              className={[
                "text-ink-400",
                "transition-all duration-200",
                "group-hover:-translate-x-1",
                "group-hover:text-primary-500",
                "dark:text-ink-400",
              ].join(" ")}
            />
          </button>

          {/* =================================================
              LOGOUT
          ================================================= */}

          <button
            type="button"
            onClick={handleLogout}
            className={[
              "group flex w-full items-center gap-3",
              "rounded-xl",
              "border border-red-200",
              "bg-red-50/60",
              "p-3",
              "text-right",
              "transition-all duration-200",
              "hover:-translate-y-0.5",
              "hover:border-red-300",
              "hover:bg-red-50",
              "dark:border-red-500/15",
              "dark:bg-red-500/[0.045]",
              "dark:hover:border-red-500/25",
              "dark:hover:bg-red-500/10",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-9 w-9 shrink-0",
                "items-center justify-center",
                "rounded-lg",
                "bg-red-100",
                "text-red-600",
                "dark:bg-red-500/10",
                "dark:text-red-400",
              ].join(" ")}
            >
              <LogOut size={16} strokeWidth={1.9} />
            </span>

            <div className="flex-1">
              <p
                className={[
                  "text-xs",
                  "font-bold",
                  "text-red-700",
                  "dark:text-red-400",
                ].join(" ")}
              >
                تسجيل الخروج
              </p>

              <p
                className={[
                  "mt-0.5",
                  "text-[9px]",
                  "font-medium",
                  "text-red-500",
                  "dark:text-red-400/80",
                ].join(" ")}
              >
                إنهاء جلسة الحساب
              </p>
            </div>
          </button>
        </div>
      </Modal>

      {/* =====================================================
          ANIMATIONS
      ===================================================== */}

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
