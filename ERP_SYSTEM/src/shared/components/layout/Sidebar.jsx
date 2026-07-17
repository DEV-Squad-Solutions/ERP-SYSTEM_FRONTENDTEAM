import { useState } from "react";
import { NavLink } from "react-router-dom";
import { X, Info } from "lucide-react";
import { useSelector } from "react-redux";
import { navigationItems } from "../../constants/navigation";
import CompanyDetailsModal from "../../../features/company/components/CompanyDetailsModal";

export default function Sidebar({ isOpen, onClose }) {
  const company = useSelector((state) => state.auth.selectedCompany);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-ink-900/50 z-30 lg:hidden animate-fadeUp"
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-screen w-64 bg-ink-900 z-40 flex flex-col transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"} lg:translate-x-0`}
      >
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

          <button
            onClick={onClose}
            className="lg:hidden text-white/50 hover:text-white shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scroll py-4">
          <ul className="space-y-0.5 px-3">
            {navigationItems.map(({ label, path, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={path === "/dashboard"}
                  onClick={onClose}
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
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {company && (
        <CompanyDetailsModal
          companyId={company.id}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}
