import { useState, useEffect } from "react";
import AdminSidebar from "../common/AdminSidebar.jsx";
import { authAPI } from "../../api/auth";

export default function AdminLayout({ title, children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authAPI.getCurrentUser();
    setUser(currentUser);
  }, []);

  return (
    <div className="min-h-screen bg-emerald-50">
      <AdminSidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        {/* Top navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              {title}
            </h1>
            <p className="text-xs text-slate-500">
              Admin Portal · UIU Hardware Lab Inventory
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              ADMIN
            </div>
            <div className="text-right text-xs md:text-sm">
              <div className="font-semibold text-slate-900">
                {user?.full_name || "Admin"}
              </div>
              <div className="text-slate-500">
                {user?.department || "Administrator"}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
