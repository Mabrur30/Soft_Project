import { useState, useEffect } from "react";
import { authAPI } from "../../api/auth";

export default function AuthNavbar({ title = "Dashboard" }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authAPI.getCurrentUser();
    setUser(currentUser);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <h1 className="text-xl md:text-2xl font-bold text-slate-900">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="text-right text-xs md:text-sm">
          <div className="font-semibold text-slate-900">
            {user?.full_name || "Student"}
          </div>
          <div className="text-slate-500">
            ID: {user?.id || "N/A"} · {user?.department || "N/A"}
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-[11px] font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
          STUDENT
        </div>
      </div>
    </header>
  );
}
