import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { X, Info, ChevronDown } from "lucide-react";
import { useSelector } from "react-redux";

import { navigationItems } from "../../constants/navigation";
import CompanyDetailsModal from "../../../features/company/components/CompanyDetailsModal";

// ============================================================
// رابط بسيط - مستوى أول
// ============================================================
function SidebarLink({ label, path, icon: Icon, end, onClick }) {
  return (
    <NavLink
      to={path}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
          isActive
            ? "text-white bg-white/[0.06] font-medium"
            : "text-white/55 hover:text-white hover:bg-white/[0.04]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute right-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-gold-500" />
          )}

          <Icon size={18} strokeWidth={1.8} />

          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}

// ============================================================
// رابط فرعي
// ============================================================
function SidebarSubLink({ label, path, icon: Icon, end, onClick }) {
  return (
    <NavLink
      to={path}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `relative flex items-center gap-2.5 py-2 pr-3 pl-2 rounded-lg text-[13px] transition-colors ${
          isActive
            ? "text-white bg-white/[0.05] font-medium"
            : "text-white/40 hover:text-white/80 hover:bg-white/[0.03]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* الخط الرأسي */}
          <span
            className={`absolute right-0 top-0 bottom-0 w-px transition-colors ${
              isActive ? "bg-gold-500/50" : "bg-white/10"
            }`}
          />

          {/* الخط الأفقي */}
          <span
            className={`absolute right-0 top-1/2 h-px w-2 -translate-y-1/2 transition-colors ${
              isActive ? "bg-gold-500/50" : "bg-white/10"
            }`}
          />

          <Icon size={15} strokeWidth={1.8} className="shrink-0" />

          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}

// ============================================================
// التحقق هل يوجد عنصر Active داخل children بشكل recursive
// ============================================================
function hasActiveItem(items, pathname) {
  return items.some((item) => {
    // لو العنصر Group داخله children
    if (item.children) {
      return hasActiveItem(item.children, pathname);
    }

    // لو Route عادي
    return item.end ? pathname === item.path : pathname.startsWith(item.path);
  });
}

// ============================================================
// Group متداخلة
// مثال:
// التقارير
//   └── تقارير الربحية
//       ├── ربحية الفواتير
//       └── ربحية الأصناف
// ============================================================
function SidebarNestedGroup({ label, icon: Icon, children, onLinkClick }) {
  const location = useLocation();

  const hasActiveChild = hasActiveItem(children, location.pathname);

  const [isOpen, setIsOpen] = useState(hasActiveChild);

  // لو المستخدم دخل على Route داخل المجموعة
  // يتم فتح المجموعة تلقائيًا
  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  return (
    <li>
      {/* عنوان المجموعة */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center gap-2.5 py-2 pr-3 pl-2 rounded-lg text-[13px] transition-colors ${
          hasActiveChild
            ? "text-white bg-white/[0.04] font-medium"
            : "text-white/40 hover:text-white/80 hover:bg-white/[0.03]"
        }`}
      >
        <Icon size={15} strokeWidth={1.8} className="shrink-0" />

        <span className="flex-1 text-right truncate">{label}</span>

        <ChevronDown
          size={13}
          className={`shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* محتوى المجموعة */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="mr-3 mt-0.5 space-y-0.5 border-r border-white/[0.05] pr-2">
            {children.map((child) =>
              child.children ? (
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
}

// ============================================================
// Group رئيسية
// ============================================================
function SidebarGroup({ label, icon: Icon, children, onLinkClick }) {
  const location = useLocation();

  const hasActiveChild = hasActiveItem(children, location.pathname);

  const [isOpen, setIsOpen] = useState(hasActiveChild);

  // فتح المجموعة تلقائيًا إذا كان بداخلها Route Active
  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  return (
    <li>
      {/* عنوان المجموعة */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
          hasActiveChild
            ? "text-white bg-white/[0.06] font-medium"
            : "text-white/55 hover:text-white hover:bg-white/[0.04]"
        }`}
      >
        <Icon size={18} strokeWidth={1.8} />

        <span className="flex-1 text-right truncate">{label}</span>

        <ChevronDown
          size={15}
          className={`shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* محتوى المجموعة */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="mt-0.5 mr-[7px] space-y-0.5 border-r border-white/[0.06] pr-3">
            {children.map((child) =>
              child.children ? (
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
}

// ============================================================
// Sidebar
// ============================================================
export default function Sidebar({ isOpen, onClose }) {
  const company = useSelector((state) => state.auth.selectedCompany);

  const roles = useSelector((state) => state.auth.roles);

  const canViewCompany =
    roles?.includes("Admin") || roles?.includes("CompanyOwner");

  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      {/* Overlay للموبايل */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-ink-900/50 z-30 lg:hidden animate-fadeUp"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-screen w-64 bg-ink-900 z-40 flex flex-col transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          lg:translate-x-0`}
      >
        {/* ================================================== */}
        {/* Company Header */}
        {/* ================================================== */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <button
            onClick={() => setShowDetails(true)}
            disabled={!company}
            className="min-w-0 text-right flex-1 group disabled:cursor-default"
          >
            <p className="text-[11px] text-white/40 mb-0.5 flex items-center gap-1">
              الشركة الحالية
              {company && (
                <Info
                  size={11}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              )}
            </p>

            <p className="font-display font-semibold text-white truncate group-hover:text-gold-400 transition-colors">
              {company?.name || "غير محدد"}
            </p>
          </button>

          {/* Close mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-white/50 hover:text-white shrink-0"
            aria-label="إغلاق القائمة"
          >
            <X size={20} />
          </button>
        </div>

        {/* ================================================== */}
        {/* Navigation */}
        {/* ================================================== */}
        <nav className="flex-1 overflow-y-auto custom-scroll py-4">
          <ul className="space-y-0.5 px-3">
            {navigationItems.map((item) =>
              item.children ? (
                <SidebarGroup
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                  children={item.children}
                  onLinkClick={onClose}
                />
              ) : (
                <li key={item.path}>
                  <SidebarLink
                    label={item.label}
                    path={item.path}
                    icon={item.icon}
                    end={item.path === "/dashboard"}
                    onClick={onClose}
                  />
                </li>
              ),
            )}
          </ul>
        </nav>
      </aside>

      {/* ================================================== */}
      {/* Company Details */}
      {/* ================================================== */}
      {company && canViewCompany && (
        <CompanyDetailsModal
          companyId={company.id}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}
