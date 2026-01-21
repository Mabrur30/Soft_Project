// src/pages/MyBookings.jsx
import { useState, useEffect } from "react";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout.jsx";
import Card from "../components/common/Card.jsx";
import Badge from "../components/common/Badge.jsx";
import Button from "../components/common/Button.jsx";
import { useToast } from "../hooks/useToast";
import { bookingsAPI } from "../api/bookings";

const STATUS_FILTERS = ["All", "Requested", "Approved", "Returned", "Rejected"];

function badgeVariant(status) {
  const s = status?.toLowerCase();
  if (s === "approved") return "success";
  if (s === "requested") return "warning";
  if (s === "returned") return "default";
  if (s === "rejected") return "error";
  return "default";
}

export default function MyBookings() {
  const toast = useToast();
  const [filter, setFilter] = useState("All");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load bookings via API
  useEffect(() => {
    bookingsAPI
      .getMyBookings()
      .then((res) => {
        // Map backend response to frontend format
        const mapped = (res.data || []).map((b) => ({
          id: b.booking_id,
          displayId: `BOOK-${String(b.booking_id).padStart(3, "0")}`,
          component: b.component_name || `Component #${b.components_id}`,
          qty: b.quantity,
          requested: b.requested_date?.split("T")[0],
          expected: b.expected_return_date?.split("T")[0],
          status: b.status?.charAt(0).toUpperCase() + b.status?.slice(1),
          isOverdue: b.is_overdue,
        }));
        setBookings(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load bookings:", err);
        setBookings([]);
        setLoading(false);
      });
  }, []);

  // Filter bookings based on selected filter
  const filteredBookings = bookings.filter((b) => {
    if (filter === "All") return true;
    return b.status?.toLowerCase() === filter.toLowerCase();
  });

  const handleReturn = (bookingId) => {
    bookingsAPI
      .returnBooking(bookingId)
      .then(() => {
        // Update local state
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: "Returned" } : b,
          ),
        );
        toast.success("Booking marked as returned!");
      })
      .catch((err) => {
        console.error("Failed to return booking:", err);
        toast.error(
          "Failed to return booking. " + (err.response?.data?.message || ""),
        );
      });
  };

  if (loading) {
    return (
      <AuthenticatedLayout title="My bookings">
        <p className="text-sm text-slate-600">Loading bookings…</p>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout title="My bookings">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              My bookings
            </h2>
            <p className="text-xs text-slate-600">
              Track the status of all your booking requests and returns.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => (window.location.href = "/bookings")}
          >
            + New booking
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full border ${
                filter === f
                  ? "bg-primary-500 text-white border-primary-500"
                  : "bg-white text-slate-700 border-slate-200 hover:border-primary-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-3">Booking ID</th>
                <th className="py-2 pr-3">Component</th>
                <th className="py-2 pr-3">Qty</th>
                <th className="py-2 pr-3">Requested</th>
                <th className="py-2 pr-3">Expected return</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-2 pr-3">{b.displayId}</td>
                  <td className="py-2 pr-3">{b.component}</td>
                  <td className="py-2 pr-3">{b.qty}</td>
                  <td className="py-2 pr-3">
                    {new Date(b.requested).toLocaleDateString()}
                  </td>
                  <td className="py-2 pr-3">
                    {new Date(b.expected).toLocaleDateString()}
                  </td>
                  <td className="py-2 pr-3">
                    <Badge
                      variant={b.isOverdue ? "error" : badgeVariant(b.status)}
                    >
                      {b.isOverdue ? "Overdue" : b.status}
                    </Badge>
                  </td>
                  <td className="py-2">
                    {b.status === "Approved" && (
                      <button
                        onClick={() => handleReturn(b.id)}
                        className="px-2 py-1 bg-emerald-500 text-white text-xs rounded font-semibold hover:bg-emerald-600"
                      >
                        Return
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td className="py-4 text-center text-slate-500" colSpan={7}>
                    No bookings in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AuthenticatedLayout>
  );
}
