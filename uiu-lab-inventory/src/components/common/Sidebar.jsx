import { useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../../api/auth";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    authAPI.logout();
    navigate("/");
  };

  const sections = [
    {
      label: "MAIN",
      items: [
        { path: "/dashboard", label: "Dashboard" },
        { path: "/bookings", label: "New Booking" },
        { path: "/my-bookings", label: "My Bookings" },
      ],
    },
    {
      label: "ACCOUNT",
      items: [
        { path: "/penalties", label: "Penalties" },
        { path: "/profile", label: "Profile" },
      ],
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-slate-900 text-slate-100 flex flex-col">
      {/* Logo */}
      <div className="h-16 px-5 flex items-center border-b border-slate-800">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <div className="bg-primary-500 w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs">
            UL
          </div>
          <div>
            <div className="text-sm font-semibold">UIU LAB</div>
            <div className="text-[11px] text-slate-400">Hardware Inventory</div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6 text-sm">
        {sections.map((section) => (
          <div key={section.label}>
            <div className="text-[11px] font-semibold text-slate-500 px-2 mb-2">
              {section.label}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    isActive(item.path)
                      ? "bg-primary-500 text-white"
                      : "text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="text-[11px] text-slate-500 mb-2 px-2">SESSION</div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-md"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
