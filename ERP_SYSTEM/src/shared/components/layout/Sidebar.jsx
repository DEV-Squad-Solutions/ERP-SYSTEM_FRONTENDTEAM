import { memo, useCallback, useEffect, useId, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { X, Info, ChevronDown } from "lucide-react";
import { useSelector } from "react-redux";
import { navigationItems } from "../../constants/navigation";
import CompanyDetailsModal from "../../../features/company/components/CompanyDetailsModal";

function canAccessItem(item, roles) {
  if (!item.roles?.length) {
    return true;
  }

  if (roles?.includes("Admin")) {
    return true;
  }

  return item.roles.some((role) => roles?.includes(role));
}

function filterNavigationItems(items, roles) {
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

      if (filteredChildren.length > 0) {
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

const SidebarSection = memo(function SidebarSection({ label }) {
  return (
    <li className="px-3 pt-6 pb-2 select-none">
      <div className="flex items-center gap-2.5">
        <span className="whitespace-nowrap text-[10px] font-semibold tracking-[0.1em] text-white/25 uppercase">
          {label}
        </span>

        <span className="h-px flex-1 bg-white/[0.06]" />
      </div>
    </li>
  );
});

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
          "min-h-10 rounded-xl px-3 py-2.5",
          "text-sm",
          "transition-all duration-200 ease-out",
          "outline-none",
          "focus-visible:ring-2 focus-visible:ring-gold-500/30",
          isActive
            ? [
                "bg-white/[0.075]",
                "font-medium text-white",
                "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]",
              ].join(" ")
            : [
                "text-white/55",
                "hover:bg-white/[0.04]",
                "hover:text-white",
                "hover:translate-x-[-1px]",
              ].join(" "),
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <span
            aria-hidden="true"
            className={[
              "absolute right-0 top-1/2",
              "-translate-y-1/2",
              "w-[3px] rounded-full",
              "transition-all duration-300 ease-out",
              isActive
                ? "h-[62%] bg-gold-500 opacity-100 shadow-[0_0_10px_rgba(234,179,8,0.25)]"
                : "h-0 opacity-0",
            ].join(" ")}
          />

          <span
            aria-hidden="true"
            className={[
              "pointer-events-none absolute inset-0 rounded-xl",
              "transition-opacity duration-200",
              isActive ? "opacity-100" : "opacity-0",
            ].join(" ")}
          />

          {Icon && (
            <Icon
              size={18}
              strokeWidth={1.8}
              className={[
                "relative shrink-0",
                "transition-all duration-200 ease-out",
                "group-hover:scale-[1.05]",
                isActive
                  ? "text-gold-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.2)]"
                  : "",
              ].join(" ")}
            />
          )}

          <span className="relative truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
});

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
          "min-h-9 rounded-lg py-2 pr-3 pl-2",
          "text-[13px]",
          "transition-all duration-200 ease-out",
          "outline-none",
          "focus-visible:ring-2 focus-visible:ring-gold-500/30",
          isActive
            ? "bg-white/[0.06] font-medium text-white translate-x-[-1px]"
            : [
                "text-white/40",
                "hover:bg-white/[0.035]",
                "hover:text-white/85",
                "hover:translate-x-[-1px]",
              ].join(" "),
        ].join(" ")
      }
    >
      {({ isActive }) => {
        const lineColor = isActive
          ? "bg-gold-500/70"
          : "bg-white/10 group-hover:bg-white/20";

        return (
          <>
            <span
              aria-hidden="true"
              className={[
                "absolute right-0 top-0 bottom-0",
                "w-px",
                "transition-all duration-300",
                lineColor,
              ].join(" ")}
            />

            <span
              aria-hidden="true"
              className={[
                "absolute right-0 top-1/2",
                "h-px w-2",
                "-translate-y-1/2",
                "transition-all duration-300",
                lineColor,
              ].join(" ")}
            />

            <span
              aria-hidden="true"
              className={[
                "absolute right-[-2px] top-1/2",
                "h-[5px] w-[5px]",
                "-translate-y-1/2",
                "rounded-full",
                "transition-all duration-300 ease-out",
                isActive
                  ? "scale-100 bg-gold-500 shadow-[0_0_6px_rgba(234,179,8,0.4)]"
                  : "scale-0 bg-transparent",
              ].join(" ")}
            />

            {Icon && (
              <Icon
                size={15}
                strokeWidth={1.8}
                className={[
                  "relative shrink-0",
                  "transition-all duration-200 ease-out",
                  "group-hover:scale-[1.05]",
                  isActive ? "text-gold-400" : "",
                ].join(" ")}
              />
            )}

            <span className="relative truncate">{label}</span>
          </>
        );
      }}
    </NavLink>
  );
});

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
          "group flex w-full items-center gap-2.5",
          "min-h-9 rounded-lg py-2 pr-3 pl-2",
          "text-[13px]",
          "transition-all duration-200 ease-out",
          "outline-none",
          "focus-visible:ring-2 focus-visible:ring-gold-500/30",
          hasActiveChild
            ? "bg-white/[0.045] font-medium text-white"
            : [
                "text-white/40",
                "hover:bg-white/[0.03]",
                "hover:text-white/80",
              ].join(" "),
        ].join(" ")}
      >
        {Icon && (
          <Icon
            size={15}
            strokeWidth={1.8}
            className={[
              "shrink-0",
              "transition-all duration-200",
              "group-hover:scale-[1.05]",
              hasActiveChild ? "text-gold-400" : "",
            ].join(" ")}
          />
        )}

        <span className="flex-1 truncate text-right">{label}</span>

        <ChevronDown
          size={13}
          strokeWidth={1.8}
          className={[
            "shrink-0",
            "transition-transform duration-300 ease-out",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      <div
        id={groupId}
        className={[
          "grid",
          "transition-[grid-template-rows,opacity]",
          "duration-300 ease-out",
          "will-change-[grid-template-rows,opacity]",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <ul className="mr-3 mt-1 space-y-0.5 border-r border-white/[0.05] pr-2">
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
          "group flex w-full items-center gap-3",
          "min-h-10 rounded-xl px-3 py-2.5",
          "text-sm",
          "transition-all duration-200 ease-out",
          "outline-none",
          "focus-visible:ring-2 focus-visible:ring-gold-500/30",
          hasActiveChild
            ? [
                "bg-white/[0.065]",
                "font-medium text-white",
                "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.035)]",
              ].join(" ")
            : [
                "text-white/55",
                "hover:bg-white/[0.04]",
                "hover:text-white",
              ].join(" "),
        ].join(" ")}
      >
        {Icon && (
          <Icon
            size={18}
            strokeWidth={1.8}
            className={[
              "shrink-0",
              "transition-all duration-200 ease-out",
              "group-hover:scale-[1.05]",
              hasActiveChild ? "text-gold-400" : "",
            ].join(" ")}
          />
        )}

        <span className="flex-1 truncate text-right">{label}</span>

        <ChevronDown
          size={15}
          strokeWidth={1.8}
          className={[
            "shrink-0",
            "transition-transform duration-300 ease-out",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      <div
        id={groupId}
        className={[
          "grid",
          "transition-[grid-template-rows,opacity]",
          "duration-300 ease-out",
          "will-change-[grid-template-rows,opacity]",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <ul className="mt-1 mr-[7px] space-y-0.5 border-r border-white/[0.06] pr-3">
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

function Sidebar({ isOpen, onClose }) {
  const company = useSelector((state) => state.auth.selectedCompany);
  const roles = useSelector((state) => state.auth.roles);

  const [showDetails, setShowDetails] = useState(false);

  const canViewCompany =
    roles?.includes("Admin") || roles?.includes("CompanyOwner");

  const filteredNavigationItems = useMemo(() => {
    const filtered = filterNavigationItems(navigationItems, roles);
    return removeEmptySections(filtered);
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    if (window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <div
        aria-hidden={!isOpen}
        onClick={handleClose}
        className={[
          "fixed inset-0 z-30",
          "bg-ink-900/55",
          "backdrop-blur-[3px]",
          "lg:hidden",
          "transition-all duration-300 ease-out",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        aria-label="القائمة الرئيسية"
        className={[
          "fixed top-0 right-0",
          "z-40 h-screen w-64",
          "flex flex-col",
          "border-l border-white/[0.06]",
          "bg-ink-900",
          "shadow-2xl shadow-black/25",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "will-change-transform",
          isOpen ? "translate-x-0" : "translate-x-full",
          "lg:translate-x-0",
        ].join(" ")}
      >
        <div className="relative flex shrink-0 items-center justify-between border-b border-white/[0.08] p-5">
          <div
            aria-hidden="true"
            className="absolute bottom-0 right-0 left-0 h-px bg-gradient-to-l from-gold-500/20 via-white/[0.04] to-transparent"
          />

          <button
            type="button"
            onClick={handleCompanyDetails}
            disabled={!company || !canViewCompany}
            className={[
              "group min-w-0 flex-1",
              "rounded-lg p-1 -m-1",
              "text-right",
              "outline-none",
              "transition-colors duration-200",
              "disabled:cursor-default",
              "focus-visible:ring-2 focus-visible:ring-gold-500/30",
            ].join(" ")}
          >
            <p className="mb-1 flex items-center gap-1 text-[11px] text-white/40">
              <span>الشركة الحالية</span>

              {company && canViewCompany && (
                <Info
                  size={11}
                  className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                />
              )}
            </p>

            <p
              className={[
                "font-display",
                "font-semibold text-white",
                "truncate",
                "transition-all duration-200",
                company && canViewCompany
                  ? "group-hover:text-gold-400 group-hover:translate-x-[-1px]"
                  : "",
              ].join(" ")}
            >
              {company?.name || "غير محدد"}
            </p>
          </button>

          <button
            type="button"
            onClick={handleClose}
            className={[
              "mr-3 shrink-0",
              "rounded-lg p-1.5",
              "text-white/50",
              "transition-all duration-200",
              "hover:bg-white/[0.05] hover:text-white",
              "outline-none",
              "focus-visible:ring-2 focus-visible:ring-gold-500/30",
              "lg:hidden",
            ].join(" ")}
            aria-label="إغلاق القائمة"
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        <nav
          aria-label="التنقل الرئيسي"
          className={[
            "custom-scroll",
            "flex-1",
            "overflow-y-auto",
            "overscroll-contain",
            "scroll-smooth",
            "py-3",
          ].join(" ")}
        >
          <ul className="space-y-0.5 px-3 pb-5">
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
      </aside>

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
