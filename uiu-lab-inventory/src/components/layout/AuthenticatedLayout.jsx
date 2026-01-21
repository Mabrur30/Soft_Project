import Sidebar from "../common/Sidebar.jsx";
import AuthNavbar from "../common/AuthNavbar.jsx";

export default function AuthenticatedLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        <AuthNavbar title={title} />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
