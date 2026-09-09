import { memo, useCallback, useEffect, useId, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { X, Info, ChevronDown } from "lucide-react";
import { useSelector } from "react-redux";

import { navigationItems } from "../../constants/navigation";
import CompanyDetailsModal from "../../../features/company/components/CompanyDetailsModal";

/* =========================================================
   ACCESS CONTROL
========================================================= */

function canAccessItem(item, roles) {
  if (!item.roles?.length) return true;

  if (roles?.includes("Admin")) return true;

  return item.roles.some((role) => roles?.includes(role));
}

/* =========================================================
   NAVIGATION FILTER
========================================================= */

function filterNavigationItems(items, roles) {
  if (!items?.length) return [];

  return items.reduce((result, item) => {
    if (item.type === "section") {
      result.push(item);
      return result;
    }

    if (!canAccessItem(item, roles)) {
      return result;
    }

    if (item.children?.length) {
      const filteredChildren = filterNavigationItems(item.children, roles);

      if (filteredChildren.length) {
        result.push({
          ...item,
          children: filteredChildren,
        });
      }

      return result;
    }

    result.push(item);

    return result;
  }, []);
}

/* =========================================================
   REMOVE EMPTY SECTIONS
========================================================= */

function removeEmptySections(items) {
  const result = [];

  items.forEach((item, index) => {
    if (item.type !== "section") {
      result.push(item);
      return;
    }

    const nextItem = items[index + 1];

    if (nextItem && nextItem.type !== "section") {
      result.push(item);
    }
  });

  return result;
}

/* =========================================================
   ACTIVE ROUTE
========================================================= */

function hasActiveItem(items, pathname) {
  if (!items?.length) return false;

  return items.some((item) => {
    if (item.type === "section") {
      return false;
    }

    if (item.children?.length) {
      return hasActiveItem(item.children, pathname);
    }

    if (!item.path) {
      return false;
    }

    return item.end ? pathname === item.path : pathname.startsWith(item.path);
  });
}

/* =========================================================
   SECTION
========================================================= */

const SidebarSection = memo(function SidebarSection({ label }) {
  return (
    <li className="select-none px-2 pt-5 pb-2">
      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap text-[10px] font-bold tracking-[0.14em] text-white/40 uppercase">
          {label}
        </span>

        <span aria-hidden="true" className="h-px flex-1 bg-white/[0.10]" />
      </div>
    </li>
  );
});

/* =========================================================
   MAIN LINK
========================================================= */

const SidebarLink = memo(function SidebarLink({
  label,
  path,
  icon: Icon,
  end,
  onClick,
}) {
  return (
    <NavLink
      to={path}
      end={end}
      onClick={onClick}
      aria-label={label}
      className={({ isActive }) =>
        [
          "group relative flex min-h-10 items-center gap-3",
          "rounded-xl px-3 py-2",
          "text-[13px]",
          "outline-none",
          "transition-[background-color,color,transform]",
          "duration-200 ease-out",
          "focus-visible:ring-2 focus-visible:ring-gold-500/40",

          isActive
            ? [
                "bg-white/[0.085]",
                "font-semibold text-white",
                "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]",
              ].join(" ")
            : [
                "text-white/70",
                "hover:bg-white/[0.045]",
                "hover:text-white",
              ].join(" "),
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {/* Active bar */}
          <span
            aria-hidden="true"
            className={[
              "absolute right-0 top-1/2",
              "-translate-y-1/2",
              "w-[3px] rounded-l-full",
              "transition-[height,opacity,box-shadow]",
              "duration-300",
              isActive
                ? [
                    "h-[60%]",
                    "bg-gold-500",
                    "opacity-100",
                    "shadow-[0_0_12px_rgba(234,179,8,0.35)]",
                  ].join(" ")
                : "h-0 opacity-0",
            ].join(" ")}
          />

          {/* Active background */}
          <span
            aria-hidden="true"
            className={[
              "pointer-events-none absolute inset-0 rounded-xl",
              "bg-gradient-to-l from-gold-500/[0.045] to-transparent",
              "transition-opacity duration-200",
              isActive ? "opacity-100" : "opacity-0",
            ].join(" ")}
          />

          {Icon && (
            <span
              className={[
                "relative flex h-7 w-7 shrink-0 items-center justify-center",
                "rounded-lg",
                "transition-[background-color,color,transform]",
                "duration-200",

                isActive
                  ? "bg-gold-500/[0.12] text-gold-400"
                  : [
                      "text-white/55",
                      "group-hover:bg-white/[0.05]",
                      "group-hover:text-white",
                    ].join(" "),
              ].join(" ")}
            >
              <Icon size={16} strokeWidth={1.8} />
            </span>
          )}

          <span className="relative min-w-0 flex-1 truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
});

/* =========================================================
   SUB LINK
========================================================= */

const SidebarSubLink = memo(function SidebarSubLink({
  label,
  path,
  icon: Icon,
  end,
  onClick,
}) {
  return (
    <NavLink
      to={path}
      end={end}
      onClick={onClick}
      aria-label={label}
      className={({ isActive }) =>
        [
          "group relative flex min-h-8.5 items-center gap-2.5",
          "rounded-lg py-1.5 pr-3 pl-2",
          "text-[12px]",
          "outline-none",
          "transition-[background-color,color,transform]",
          "duration-200",
          "focus-visible:ring-2 focus-visible:ring-gold-500/40",

          isActive
            ? [
                "translate-x-[-1px]",
                "bg-white/[0.065]",
                "font-semibold",
                "text-white",
              ].join(" ")
            : [
                "text-white/60",
                "hover:bg-white/[0.035]",
                "hover:text-white",
                "hover:translate-x-[-1px]",
              ].join(" "),
        ].join(" ")
      }
    >
      {({ isActive }) => {
        const lineColor = isActive
          ? "bg-gold-500/80"
          : "bg-white/[0.12] group-hover:bg-white/[0.22]";

        return (
          <>
            {/* Vertical line */}
            <span
              aria-hidden="true"
              className={[
                "absolute right-0 top-0 bottom-0",
                "w-px",
                "transition-colors duration-200",
                lineColor,
              ].join(" ")}
            />

            {/* Connector */}
            <span
              aria-hidden="true"
              className={[
                "absolute right-0 top-1/2",
                "h-px w-2",
                "-translate-y-1/2",
                "transition-colors duration-200",
                lineColor,
              ].join(" ")}
            />

            {/* Active dot */}
            <span
              aria-hidden="true"
              className={[
                "absolute right-[-2px] top-1/2",
                "h-[5px] w-[5px]",
                "-translate-y-1/2",
                "rounded-full",
                "transition-all duration-200",
                isActive
                  ? "scale-100 bg-gold-500 shadow-[0_0_7px_rgba(234,179,8,0.5)]"
                  : "scale-0 bg-transparent",
              ].join(" ")}
            />

            {Icon && (
              <Icon
                size={14}
                strokeWidth={1.8}
                className={[
                  "relative shrink-0",
                  "transition-[color,transform]",
                  "duration-200",
                  "group-hover:scale-[1.04]",
                  isActive
                    ? "text-gold-400"
                    : "text-white/50 group-hover:text-white/80",
                ].join(" ")}
              />
            )}

            <span className="relative min-w-0 flex-1 truncate">{label}</span>
          </>
        );
      }}
    </NavLink>
  );
});

/* =========================================================
   NESTED GROUP
========================================================= */

const SidebarNestedGroup = memo(function SidebarNestedGroup({
  label,
  icon: Icon,
  children,
  onLinkClick,
}) {
  const location = useLocation();
  const groupId = useId();

  const hasActiveChild = useMemo(
    () => hasActiveItem(children, location.pathname),
    [children, location.pathname],
  );

  const [isOpen, setIsOpen] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <li>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={groupId}
        className={[
          "group flex w-full min-h-8.5 items-center gap-2.5",
          "rounded-lg py-1.5 pr-3 pl-2",
          "text-[12px]",
          "outline-none",
          "transition-[background-color,color]",
          "duration-200",
          "focus-visible:ring-2 focus-visible:ring-gold-500/40",

          hasActiveChild
            ? "bg-white/[0.045] font-semibold text-white/95"
            : [
                "text-white/60",
                "hover:bg-white/[0.03]",
                "hover:text-white",
              ].join(" "),
        ].join(" ")}
      >
        {Icon && (
          <Icon
            size={14}
            strokeWidth={1.8}
            className={[
              "shrink-0",
              "transition-colors duration-200",
              hasActiveChild
                ? "text-gold-400"
                : "text-white/50 group-hover:text-white/80",
            ].join(" ")}
          />
        )}

        <span className="min-w-0 flex-1 truncate text-right">{label}</span>

        <ChevronDown
          size={13}
          strokeWidth={1.8}
          className={[
            "shrink-0",
            "text-white/45",
            "transition-[transform,color]",
            "duration-250",
            isOpen ? "rotate-180 text-white/70" : "",
          ].join(" ")}
        />
      </button>

      <div
        id={groupId}
        className={[
          "grid",
          "transition-[grid-template-rows,opacity]",
          "duration-250 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <ul className="mr-3 mt-1 space-y-0.5 border-r border-white/[0.08] pr-2">
            {children.map((child) =>
              child.children?.length ? (
                <SidebarNestedGroup
                  key={child.label}
                  label={child.label}
                  icon={child.icon}
                  children={child.children}
                  onLinkClick={onLinkClick}
                />
              ) : (
                <li key={child.path}>
                  <SidebarSubLink
                    label={child.label}
                    path={child.path}
                    icon={child.icon}
                    end={child.end}
                    onClick={onLinkClick}
                  />
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </li>
  );
});

/* =========================================================
   MAIN GROUP
========================================================= */

const SidebarGroup = memo(function SidebarGroup({
  label,
  icon: Icon,
  children,
  onLinkClick,
}) {
  const location = useLocation();
  const groupId = useId();

  const hasActiveChild = useMemo(
    () => hasActiveItem(children, location.pathname),
    [children, location.pathname],
  );

  const [isOpen, setIsOpen] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <li>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={groupId}
        className={[
          "group flex w-full min-h-10 items-center gap-3",
          "rounded-xl px-3 py-2",
          "text-[13px]",
          "outline-none",
          "transition-[background-color,color]",
          "duration-200",
          "focus-visible:ring-2 focus-visible:ring-gold-500/40",

          hasActiveChild
            ? [
                "bg-white/[0.065]",
                "font-semibold text-white",
                "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]",
              ].join(" ")
            : [
                "text-white/70",
                "hover:bg-white/[0.045]",
                "hover:text-white",
              ].join(" "),
        ].join(" ")}
      >
        {Icon && (
          <span
            className={[
              "flex h-7 w-7 shrink-0 items-center justify-center",
              "rounded-lg",
              "transition-[background-color,color]",
              "duration-200",

              hasActiveChild
                ? "bg-gold-500/[0.11] text-gold-400"
                : [
                    "text-white/55",
                    "group-hover:bg-white/[0.045]",
                    "group-hover:text-white",
                  ].join(" "),
            ].join(" ")}
          >
            <Icon size={16} strokeWidth={1.8} />
          </span>
        )}

        <span className="min-w-0 flex-1 truncate text-right">{label}</span>

        <ChevronDown
          size={14}
          strokeWidth={1.8}
          className={[
            "shrink-0",
            "text-white/45",
            "transition-[transform,color]",
            "duration-250",
            isOpen ? "rotate-180 text-white/70" : "group-hover:text-white/65",
          ].join(" ")}
        />
      </button>

      <div
        id={groupId}
        className={[
          "grid",
          "transition-[grid-template-rows,opacity]",
          "duration-250 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <ul className="mt-1 mr-3 space-y-0.5 border-r border-white/[0.08] pr-3">
            {children.map((child) =>
              child.children?.length ? (
                <SidebarNestedGroup
                  key={child.label}
                  label={child.label}
                  icon={child.icon}
                  children={child.children}
                  onLinkClick={onLinkClick}
                />
              ) : (
                <li key={child.path}>
                  <SidebarSubLink
                    label={child.label}
                    path={child.path}
                    icon={child.icon}
                    end={child.end}
                    onClick={onLinkClick}
                  />
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </li>
  );
});

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({ isOpen, onClose }) {
  const company = useSelector((state) => state.auth.selectedCompany);

  const roles = useSelector((state) => state.auth.roles);

  const [showDetails, setShowDetails] = useState(false);

  const canViewCompany = useMemo(
    () => roles?.includes("Admin") || roles?.includes("CompanyOwner"),
    [roles],
  );

  const filteredNavigationItems = useMemo(() => {
    return removeEmptySections(filterNavigationItems(navigationItems, roles));
  }, [roles]);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleCompanyDetails = useCallback(() => {
    if (!company || !canViewCompany) {
      return;
    }

    setShowDetails(true);
  }, [company, canViewCompany]);

  const handleCloseCompanyDetails = useCallback(() => {
    setShowDetails(false);
  }, []);

  /* Escape */
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleClose]);

  /* Mobile scroll lock */
  useEffect(() => {
    if (!isOpen || window.innerWidth >= 1024) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      {/* ===================================================
          BACKDROP
      =================================================== */}

      <div
        aria-hidden={!isOpen}
        onClick={handleClose}
        className={[
          "fixed inset-0 z-40 lg:hidden",
          "bg-ink-950/70",
          "backdrop-blur-[2px]",
          "transition-[opacity,visibility]",
          "duration-300",
          isOpen
            ? "visible pointer-events-auto opacity-100"
            : "invisible pointer-events-none opacity-0",
        ].join(" ")}
      />

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        aria-label="القائمة الرئيسية"
        className={[
          "fixed top-0 right-0 z-50",
          "h-screen w-[260px]",
          "flex flex-col",
          "border-l border-white/[0.07]",
          "bg-ink-900",
          "shadow-2xl shadow-black/30",
          "transition-transform duration-300",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",
          isOpen ? "translate-x-0" : "translate-x-full",
          "lg:translate-x-0",
        ].join(" ")}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="relative shrink-0 border-b border-white/[0.08] px-4 py-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-gold-500/[0.04] to-transparent"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 bottom-0 left-0 h-px bg-gradient-to-l from-gold-500/25 via-white/[0.05] to-transparent"
          />

          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={handleCompanyDetails}
              disabled={!company || !canViewCompany}
              className={[
                "group min-w-0 flex-1",
                "rounded-lg p-1",
                "text-right",
                "outline-none",
                "transition-colors duration-200",
                "disabled:cursor-default",
                "focus-visible:ring-2",
                "focus-visible:ring-gold-500/40",
              ].join(" ")}
            >
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.09] bg-white/[0.045]">
                  {company?.logo ? (
                    <img
                      src={company.logo}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-gold-400">
                      {company?.name?.charAt(0) || "C"}
                    </span>
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="mb-0.5 flex items-center gap-1 text-[9px] font-medium text-white/40">
                    الشركة الحالية
                    {company && canViewCompany && (
                      <Info
                        size={10}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    )}
                  </span>

                  <span
                    className={[
                      "block truncate",
                      "font-display text-[13px]",
                      "font-semibold text-white",
                      company && canViewCompany
                        ? "group-hover:text-gold-400"
                        : "",
                    ].join(" ")}
                  >
                    {company?.name || "غير محدد"}
                  </span>
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={handleClose}
              aria-label="إغلاق القائمة"
              className={[
                "flex shrink-0 items-center justify-center",
                "rounded-lg p-1.5",
                "text-white/50",
                "transition-colors duration-200",
                "hover:bg-white/[0.06]",
                "hover:text-white",
                "outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-gold-500/40",
                "lg:hidden",
              ].join(" ")}
            >
              <X size={18} strokeWidth={1.8} />
            </button>
          </div>
        </header>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav
          aria-label="التنقل الرئيسي"
          className={[
            "custom-scroll",
            "flex-1 overflow-y-auto",
            "overscroll-contain",
            "scroll-smooth",
            "py-2.5",
          ].join(" ")}
        >
          <ul className="space-y-0.5 px-2.5 pb-4">
            {filteredNavigationItems.map((item, index) => {
              if (item.type === "section") {
                return (
                  <SidebarSection
                    key={`section-${item.label}-${index}`}
                    label={item.label}
                  />
                );
              }

              if (item.children?.length) {
                return (
                  <SidebarGroup
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    children={item.children}
                    onLinkClick={handleClose}
                  />
                );
              }

              return (
                <li key={item.path}>
                  <SidebarLink
                    label={item.label}
                    path={item.path}
                    icon={item.icon}
                    end={item.end ?? item.path === "/dashboard"}
                    onClick={handleClose}
                  />
                </li>
              );
            })}
          </ul>
        </nav>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="shrink-0 border-t border-white/[0.08] bg-ink-900 px-3 py-2.5">
          <a
            href="https://dev-squad-orpin.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className={[
              "group flex items-center gap-2.5",
              "rounded-lg px-2 py-2",
              "transition-colors duration-200",
              "hover:bg-white/[0.04]",
              "outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-gold-500/40",
            ].join(" ")}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/[0.08] bg-white/[0.035]">
              <img
                src="/logo.jpg"
                alt="Dev Squad Solutions"
                className="h-full w-full object-contain opacity-80 transition-opacity group-hover:opacity-100"
              />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-[10px] font-semibold text-white/55 transition-colors group-hover:text-white/75">
                Dev Squad Solutions
              </span>

              <span className="mt-0.5 block text-[8px] text-white/35">
                © {new Date().getFullYear()} جميع الحقوق محفوظة
              </span>
            </span>

            <span className="text-[11px] text-white/30 transition-colors group-hover:text-gold-400">
              ↗
            </span>
          </a>
        </footer>
      </aside>

      {/* =================================================
          COMPANY MODAL
      ================================================= */}

      {company && canViewCompany && (
        <CompanyDetailsModal
          companyId={company.id}
          isOpen={showDetails}
          onClose={handleCloseCompanyDetails}
        />
      )}
    </>
  );
}

export default memo(Sidebar);
