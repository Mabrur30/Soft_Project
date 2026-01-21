import { useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../../api/auth";

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    authAPI.logout();
    navigate("/");
  };

  const sections = [
    {
      label: "DASHBOARD",
      items: [{ path: "/admin/dashboard", label: "Overview" }],
    },
    {
      label: "INVENTORY",
      items: [
        { path: "/admin/components", label: "Components" },
        { path: "/admin/add-component", label: "Add Component" },
        { path: "/admin/stock", label: "Stock Management" },
      ],
    },
    {
      label: "BOOKINGS",
      items: [{ path: "/admin/bookings", label: "Booking Requests" }],
    },
    {
      label: "USERS",
      items: [
        { path: "/admin/students", label: "Students" },
        { path: "/admin/penalties", label: "Penalties" },
      ],
    },
    {
      label: "REPORTS",
      items: [
        { path: "/admin/analytics", label: "Analytics" },
        { path: "/admin/history", label: "History" },
      ],
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-slate-900 text-slate-100 flex flex-col">
      {/* Logo */}
      <div className="h-16 px-4 flex items-center border-b border-emerald-800">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/admin/dashboard")}
        >
          <div className="bg-emerald-400 w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-emerald-900">
            UL
          </div>
          <div>
            <div className="text-sm font-semibold">UIU LAB</div>
            <div className="text-[11px] text-slate-400">
              Admin Control Panel
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6 text-sm">
        {sections.map((section) => (
          <div key={section.label}>
            <div className="text-[11px] font-semibold text-slate-400 px-2 mb-2 uppercase">
              {section.label}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    isActive(item.path)
                      ? "bg-emerald-500 text-white"
                      : "text-slate-200 hover:bg-emerald-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin session */}
      <div className="px-3 py-4 border-t border-emerald-800">
        <div className="text-[11px] text-slate-400 uppercase mb-3">
          Admin Session
        </div>
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
