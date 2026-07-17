import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Menu } from "lucide-react";
import { logout } from "../../../features/auth/authSlice";

export default function Navbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur border-b border-ink-400/10 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-ink-600">
          <Menu size={22} />
        </button>
        <h1 className="font-display font-semibold text-base lg:text-lg text-ink-900">
          نظام إدارة الحسابات
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-sm text-ink-400">
          <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center">
            <User size={16} />
          </span>
          {user?.name || "مستخدم"}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-negative hover:bg-negative/5 px-3 py-2 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">خروج</span>
        </button>
      </div>
    </header>
  );
}
