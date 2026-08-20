import { memo, useCallback, useEffect, useId, useMemo, useState } from "react";

import { NavLink, useLocation } from "react-router-dom";

import { X, Info, ChevronDown } from "lucide-react";

import { useSelector } from "react-redux";

import { navigationItems } from "../../constants/navigation";

import CompanyDetailsModal from "../../../features/company/components/CompanyDetailsModal";

// ============================================================
// Helpers
// ============================================================

function hasActiveItem(items, pathname) {
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

// ============================================================
// Section Header
// ============================================================

const SidebarSection = memo(function SidebarSection({ label }) {
  return (
    <li className="pt-5 pb-2 px-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold tracking-[0.08em] text-white/25 uppercase whitespace-nowrap">
          {label}
        </span>

        <span className="h-px flex-1 bg-white/[0.05]" />
      </div>
    </li>
  );
});

// ============================================================
// Main Link
// ============================================================

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
          "group relative flex items-center gap-3",
          "px-3 py-2.5 rounded-lg",
          "text-sm",
          "transition-all duration-200 ease-out",
          "outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-gold-500/30",
          isActive
            ? [
                "text-white",
                "bg-white/[0.07]",
                "font-medium",
                "shadow-sm",
              ].join(" ")
            : [
                "text-white/55",
                "hover:text-white",
                "hover:bg-white/[0.04]",
              ].join(" "),
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator */}
          <span
            aria-hidden="true"
            className={[
              "absolute right-0 top-1/2",
              "-translate-y-1/2",
              "w-[3px]",
              "rounded-full",
              "transition-all duration-200",
              isActive ? "h-[60%] bg-gold-500 opacity-100" : "h-0 opacity-0",
            ].join(" ")}
          />

          {/* Icon */}
          {Icon && (
            <Icon
              size={18}
              strokeWidth={1.8}
              className={[
                "shrink-0",
                "transition-all duration-200",
                "group-hover:scale-[1.04]",
                isActive ? "text-gold-400" : "",
              ].join(" ")}
            />
          )}

          {/* Label */}
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
});

// ============================================================
// Sub Link
// ============================================================

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
          "group relative flex items-center gap-2.5",
          "py-2 pr-3 pl-2",
          "rounded-lg",
          "text-[13px]",
          "transition-all duration-200 ease-out",
          "outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-gold-500/30",
          isActive
            ? "text-white bg-white/[0.055] font-medium"
            : [
                "text-white/40",
                "hover:text-white/85",
                "hover:bg-white/[0.035]",
              ].join(" "),
        ].join(" ")
      }
    >
      {({ isActive }) => {
        const lineColor = isActive
          ? "bg-gold-500/60"
          : "bg-white/10 group-hover:bg-white/20";

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

            {/* Horizontal connector */}
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
                "w-[5px] h-[5px]",
                "-translate-y-1/2",
                "rounded-full",
                "transition-all duration-200",
                isActive ? "bg-gold-500 scale-100" : "bg-transparent scale-0",
              ].join(" ")}
            />

            {/* Icon */}
            {Icon && (
              <Icon
                size={15}
                strokeWidth={1.8}
                className={[
                  "shrink-0",
                  "transition-transform duration-200",
                  "group-hover:scale-[1.04]",
                  isActive ? "text-gold-400" : "",
                ].join(" ")}
              />
            )}

            {/* Label */}
            <span className="truncate">{label}</span>
          </>
        );
      }}
    </NavLink>
  );
});

// ============================================================
// Nested Group
// ============================================================

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
      {/* Nested Group Header */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={groupId}
        className={[
          "group w-full flex items-center gap-2.5",
          "py-2 pr-3 pl-2",
          "rounded-lg",
          "text-[13px]",
          "transition-all duration-200",
          "outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-gold-500/30",
          hasActiveChild
            ? "text-white bg-white/[0.04] font-medium"
            : [
                "text-white/40",
                "hover:text-white/80",
                "hover:bg-white/[0.03]",
              ].join(" "),
        ].join(" ")}
      >
        {Icon && (
          <Icon
            size={15}
            strokeWidth={1.8}
            className={[
              "shrink-0",
              "transition-transform duration-200",
              "group-hover:scale-[1.04]",
              hasActiveChild ? "text-gold-400" : "",
            ].join(" ")}
          />
        )}

        <span className="flex-1 text-right truncate">{label}</span>

        <ChevronDown
          size={13}
          strokeWidth={1.8}
          className={[
            "shrink-0",
            "transition-transform duration-300",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {/* Nested Content */}
      <div
        id={groupId}
        className={[
          "grid",
          "transition-[grid-template-rows,opacity]",
          "duration-250 ease-out",
          "will-change-[grid-template-rows,opacity]",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <ul className="mr-3 mt-0.5 space-y-0.5 border-r border-white/[0.05] pr-2">
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

// ============================================================
// Main Group
// ============================================================

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
      {/* Main Group Header */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={groupId}
        className={[
          "group w-full flex items-center gap-3",
          "px-3 py-2.5",
          "rounded-lg",
          "text-sm",
          "transition-all duration-200 ease-out",
          "outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-gold-500/30",
          hasActiveChild
            ? ["text-white", "bg-white/[0.065]", "font-medium"].join(" ")
            : [
                "text-white/55",
                "hover:text-white",
                "hover:bg-white/[0.04]",
              ].join(" "),
        ].join(" ")}
      >
        {/* Icon */}
        {Icon && (
          <Icon
            size={18}
            strokeWidth={1.8}
            className={[
              "shrink-0",
              "transition-all duration-200",
              "group-hover:scale-[1.04]",
              hasActiveChild ? "text-gold-400" : "",
            ].join(" ")}
          />
        )}

        {/* Label */}
        <span className="flex-1 text-right truncate">{label}</span>

        {/* Chevron */}
        <ChevronDown
          size={15}
          strokeWidth={1.8}
          className={[
            "shrink-0",
            "transition-transform duration-300",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {/* Group Content */}
      <div
        id={groupId}
        className={[
          "grid",
          "transition-[grid-template-rows,opacity]",
          "duration-250 ease-out",
          "will-change-[grid-template-rows,opacity]",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <ul className="mt-0.5 mr-[7px] space-y-0.5 border-r border-white/[0.06] pr-3">
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

// ============================================================
// Sidebar
// ============================================================

function Sidebar({ isOpen, onClose }) {
  const company = useSelector((state) => state.auth.selectedCompany);

  const roles = useSelector((state) => state.auth.roles);

  const canViewCompany =
    roles?.includes("Admin") || roles?.includes("CompanyOwner");

  const [showDetails, setShowDetails] = useState(false);

  // ==========================================================
  // Callbacks
  // ==========================================================

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

  // ==========================================================
  // Escape Key
  // ==========================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

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

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <>
      {/* ======================================================
          Mobile Overlay
      ====================================================== */}

      <div
        aria-hidden={!isOpen}
        onClick={handleClose}
        className={[
          "fixed inset-0 z-30",
          "bg-ink-900/50",
          "backdrop-blur-[2px]",
          "lg:hidden",
          "transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* ======================================================
          Sidebar
      ====================================================== */}

      <aside
        aria-label="القائمة الرئيسية"
        className={[
          "fixed top-0 right-0",
          "h-screen w-64",
          "bg-ink-900",
          "z-40",
          "flex flex-col",
          "border-l border-white/[0.06]",
          "shadow-2xl shadow-black/20",
          "transition-transform duration-300 ease-out",
          "will-change-transform",
          isOpen ? "translate-x-0" : "translate-x-full",
          "lg:translate-x-0",
        ].join(" ")}
      >
        {/* ====================================================
            Company Header
        ==================================================== */}

        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleCompanyDetails}
            disabled={!company || !canViewCompany}
            className={[
              "min-w-0",
              "flex-1",
              "text-right",
              "group",
              "rounded-md",
              "outline-none",
              "disabled:cursor-default",
              "focus-visible:ring-2",
              "focus-visible:ring-gold-500/30",
            ].join(" ")}
          >
            <p className="text-[11px] text-white/40 mb-0.5 flex items-center gap-1">
              الشركة الحالية
              {company && canViewCompany && (
                <Info
                  size={11}
                  className={[
                    "opacity-0",
                    "group-hover:opacity-100",
                    "transition-opacity duration-200",
                  ].join(" ")}
                />
              )}
            </p>

            <p
              className={[
                "font-display",
                "font-semibold",
                "text-white",
                "truncate",
                "transition-colors duration-200",
                company && canViewCompany ? "group-hover:text-gold-400" : "",
              ].join(" ")}
            >
              {company?.name || "غير محدد"}
            </p>
          </button>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={handleClose}
            className={[
              "lg:hidden",
              "shrink-0",
              "mr-3",
              "p-1.5",
              "rounded-md",
              "text-white/50",
              "hover:text-white",
              "hover:bg-white/[0.05]",
              "transition-all duration-200",
              "outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-gold-500/30",
            ].join(" ")}
            aria-label="إغلاق القائمة"
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        {/* ====================================================
            Navigation
        ==================================================== */}

        <nav
          aria-label="التنقل الرئيسي"
          className={[
            "flex-1",
            "overflow-y-auto",
            "custom-scroll",
            "py-3",
            "overscroll-contain",
          ].join(" ")}
        >
          <ul className="space-y-0.5 px-3">
            {navigationItems.map((item, index) => {
              // ------------------------------------------------
              // Section
              // ------------------------------------------------
              if (item.type === "section") {
                return (
                  <SidebarSection
                    key={`section-${item.label}-${index}`}
                    label={item.label}
                  />
                );
              }

              // ------------------------------------------------
              // Group
              // ------------------------------------------------
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

              // ------------------------------------------------
              // Normal Link
              // ------------------------------------------------
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
      </aside>

      {/* ======================================================
          Company Details
      ====================================================== */}

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
