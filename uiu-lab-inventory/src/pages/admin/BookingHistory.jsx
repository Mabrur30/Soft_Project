import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import Card from "../../components/common/Card.jsx";
import Badge from "../../components/common/Badge.jsx";
import { adminAPI } from "../../api/admin";

export default function BookingHistory() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "returned":
        return "info";
      case "rejected":
        return "danger";
      case "overdue":
        return "warning";
      case "requested":
        return "warning";
      default:
        return "default";
    }
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        // Get all bookings for history (not just returned)
        const res = await adminAPI.getAllBookings();
        const bookings = res.data || [];

        const mapped = bookings.map((b) => {
          const checkoutDate = new Date(b.requested_date);
          const returnDate = b.actual_return_date
            ? new Date(b.actual_return_date)
            : null;
          const duration = returnDate
            ? Math.ceil((returnDate - checkoutDate) / (1000 * 60 * 60 * 24))
            : "N/A";

          return {
            id: b.booking_id,
            student: b.full_name || "Unknown",
            studentId: b.student_id || b.user_id,
            component: b.component_name || "Unknown",
            checkoutDate: checkoutDate.toLocaleDateString(),
            returnDate: returnDate ? returnDate.toLocaleDateString() : "N/A",
            duration:
              typeof duration === "number" ? `${duration} days` : duration,
            status: b.status,
          };
        });

        setHistory(mapped);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load booking history:", err);
        setHistory([]);
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const filteredHistory = history.filter((h) => {
    const matchesSearch = search
      ? h.student?.toLowerCase().includes(search.toLowerCase()) ||
        h.studentId?.includes(search)
      : true;
    const matchesStatus =
      statusFilter === "all" ? true : h.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout title="Booking History">
      <Card>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Booking History
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Admin Portal · UIU Hardware Lab Inventory
          </p>
          <input
            type="text"
            placeholder="Search history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-full text-sm focus:outline-none focus:border-emerald-500"
          />
          <div className="mt-3 flex gap-2">
            {[
              "all",
              "requested",
              "approved",
              "rejected",
              "returned",
              "overdue",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  statusFilter === status
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-3 px-3 font-semibold">Booking ID</th>
                <th className="py-3 px-3 font-semibold">Student</th>
                <th className="py-3 px-3 font-semibold">Component</th>
                <th className="py-3 px-3 font-semibold">Checkout Date</th>
                <th className="py-3 px-3 font-semibold">Return Date</th>
                <th className="py-3 px-3 font-semibold">Duration</th>
                <th className="py-3 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    Loading booking history...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No bookings found
                    {statusFilter !== "all"
                      ? ` with status "${statusFilter}"`
                      : ""}
                    .
                  </td>
                </tr>
              ) : (
                filteredHistory.map((h) => (
                  <tr
                    key={h.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-3 px-3 font-semibold">{h.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">
                        {h.student}
                      </div>
                      <div className="text-xs text-slate-500">
                        {h.studentId}
                      </div>
                    </td>
                    <td className="py-3 px-3">{h.component}</td>
                    <td className="py-3 px-3 text-xs">{h.checkoutDate}</td>
                    <td className="py-3 px-3 text-xs">{h.returnDate}</td>
                    <td className="py-3 px-3">{h.duration}</td>
                    <td className="py-3 px-3">
                      <Badge variant={getStatusBadgeVariant(h.status)}>
                        {h.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}
