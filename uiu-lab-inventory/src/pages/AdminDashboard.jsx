import { useState, useEffect } from "react";
import AdminLayout from "../components/layout/AdminLayout.jsx";
import Card from "../components/common/Card.jsx";
import Badge from "../components/common/Badge.jsx";
import Button from "../components/common/Button.jsx";
import Modal from "../components/common/Modal.jsx";
import { useToast } from "../hooks/useToast";
import { adminAPI } from "../api/admin";

const EMPTY_DASHBOARD = {
  stats: [],
  recentBookings: [],
  inventory: [],
};

export default function AdminDashboard() {
  const toast = useToast();
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({
    open: false,
    bookingId: null,
  });
  const [viewModal, setViewModal] = useState({
    open: false,
    booking: null,
  });
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      adminAPI.getDashboardStats(),
      adminAPI.getRecentBookings(5),
      adminAPI.getComponents(),
    ])
      .then(([statsRes, bookingsRes, componentsRes]) => {
        const stats = statsRes.data || {};
        const bookings = bookingsRes.data || [];
        const components = componentsRes.data || [];

        // Transform stats to display format
        const formattedStats = [
          {
            label: "Pending Requests",
            value: stats.pendingBookings || 0,
            icon: "📋",
            color: "amber",
            description: "Bookings awaiting approval",
          },
          {
            label: "Active Bookings",
            value: stats.activeBookings || 0,
            icon: "📦",
            color: "emerald",
            description: "Currently borrowed items",
          },
          {
            label: "Overdue Items",
            value: stats.overdueBookings || 0,
            icon: "⚠️",
            color: "red",
            description: "Items past return date",
          },
          {
            label: "Total Components",
            value: stats.totalComponents || 0,
            icon: "🔧",
            color: "cyan",
            description: "Items in inventory",
          },
        ];

        // Transform bookings
        const formattedBookings = bookings.map((b) => ({
          id: b.booking_id,
          student: b.full_name || "Unknown",
          studentId: b.student_id || b.user_id,
          component: b.component_name || "Unknown",
          qty: b.quantity,
          purpose: b.reason || "N/A",
          status: b.status,
        }));

        // Transform inventory
        const formattedInventory = components.slice(0, 5).map((c) => ({
          component: c.name,
          total: c.total_quantity,
          available: c.available_quantity,
          inUse: c.total_quantity - c.available_quantity,
          statusColor: c.available_quantity < 5 ? "red" : "emerald",
        }));

        setDashboard({
          stats: formattedStats,
          recentBookings: formattedBookings,
          inventory: formattedInventory,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dashboard:", err);
        setDashboard(EMPTY_DASHBOARD);
        setLoading(false);
      });
  }, []);

  const handleApprove = async (bookingId) => {
    try {
      setActionLoading(true);
      await adminAPI.approveBooking(bookingId);
      toast.success("Booking approved!");
      // Refresh bookings
      const bookingsRes = await adminAPI.getRecentBookings(5);
      const bookings = bookingsRes.data || [];
      setDashboard((prev) => ({
        ...prev,
        recentBookings: bookings.map((b) => ({
          id: b.booking_id,
          student: b.full_name || "Unknown",
          studentId: b.student_id || b.user_id,
          component: b.component_name || "Unknown",
          qty: b.quantity,
          purpose: b.reason || "N/A",
          status: b.status,
        })),
      }));
    } catch (err) {
      console.error("Failed to approve booking:", err);
      toast.error("Failed to approve booking");
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (bookingId) => {
    setRejectModal({ open: true, bookingId });
    setRejectReason("");
  };

  const closeRejectModal = () => {
    setRejectModal({ open: false, bookingId: null });
    setRejectReason("");
  };

  const openViewModal = (booking) => {
    setViewModal({ open: true, booking });
  };

  const closeViewModal = () => {
    setViewModal({ open: false, booking: null });
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      setActionLoading(true);
      await adminAPI.rejectBooking(rejectModal.bookingId, rejectReason);
      toast.success("Booking rejected!");
      closeRejectModal();
      // Refresh bookings
      const bookingsRes = await adminAPI.getRecentBookings(5);
      const bookings = bookingsRes.data || [];
      setDashboard((prev) => ({
        ...prev,
        recentBookings: bookings.map((b) => ({
          id: b.booking_id,
          student: b.full_name || "Unknown",
          studentId: b.student_id || b.user_id,
          component: b.component_name || "Unknown",
          qty: b.quantity,
          purpose: b.reason || "N/A",
          status: b.status,
        })),
      }));
    } catch (err) {
      console.error("Failed to reject booking:", err);
      toast.error("Failed to reject booking");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Overview Dashboard">
        <p className="text-sm text-slate-600">Loading dashboard...</p>
      </AdminLayout>
    );
  }

  const getStatColor = (color) => {
    const colors = {
      amber: "border-l-4 border-amber-500 bg-amber-50",
      emerald: "border-l-4 border-emerald-500 bg-emerald-50",
      red: "border-l-4 border-red-500 bg-red-50",
      cyan: "border-l-4 border-cyan-500 bg-cyan-50",
    };
    return colors[color] || colors.emerald;
  };

  return (
    <AdminLayout title="Overview Dashboard">
      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {dashboard.stats.map((stat, idx) => (
          <div
            key={idx}
            className={`${getStatColor(stat.color)} p-4 rounded-lg`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-xs font-semibold text-slate-600 uppercase">
                  {stat.label}
                </div>
                <div className="text-3xl font-bold text-slate-900 mt-1">
                  {stat.value}
                </div>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-xs text-slate-600">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Recent bookings */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Booking Requests
              </h2>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => (window.location.href = "/admin/bookings")}
            >
              View All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-3 pr-3 font-semibold">Student</th>
                  <th className="py-3 pr-3 font-semibold">Component</th>
                  <th className="py-3 pr-3 font-semibold">Qty</th>
                  <th className="py-3 pr-3 font-semibold">Purpose</th>
                  <th className="py-3 pr-3 font-semibold">Status</th>
                  <th className="py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-3 pr-3">
                      <div className="font-semibold text-slate-900">
                        {b.student}
                      </div>
                      <div className="text-xs text-slate-500">
                        {b.studentId}
                      </div>
                    </td>
                    <td className="py-3 pr-3">{b.component}</td>
                    <td className="py-3 pr-3">{b.qty}</td>
                    <td className="py-3 pr-3 text-xs">{b.purpose}</td>
                    <td className="py-3 pr-3">
                      <Badge
                        variant={
                          b.status === "pending"
                            ? "warning"
                            : b.status === "approved"
                              ? "success"
                              : b.status === "rejected"
                                ? "error"
                                : "default"
                        }
                      >
                        {b.status}
                      </Badge>
                    </td>
                    <td className="py-3 space-x-1 flex">
                      {b.status === "requested" ? (
                        <>
                          <button
                            onClick={() => handleApprove(b.id)}
                            disabled={actionLoading}
                            className="px-2 py-1 bg-emerald-500 text-white text-xs rounded font-semibold hover:bg-emerald-600 disabled:opacity-50"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(b.id)}
                            disabled={actionLoading}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded font-semibold hover:bg-red-600 disabled:opacity-50"
                          >
                            ✕ Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => openViewModal(b)}
                          className="px-2 py-1 border border-slate-300 text-slate-700 text-xs rounded font-semibold hover:bg-slate-50"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right: Inventory Status */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Inventory Status
          </h2>
          <div className="space-y-4">
            {dashboard.inventory.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-semibold text-slate-900">
                    {item.component}
                  </span>
                  <span className="text-xs text-slate-600">
                    {item.available} / {item.total}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      item.statusColor === "red"
                        ? "bg-red-500"
                        : "bg-emerald-500"
                    }`}
                    style={{
                      width: `${(item.available / item.total) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Available: {item.available} · In use: {item.inUse}
                </p>
              </div>
            ))}
          </div>

          <Button
            className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600"
            onClick={() => (window.location.href = "/admin/stock")}
          >
            Manage Inventory
          </Button>
        </Card>
      </div>

      {/* Rejection Modal */}
      <Modal
        open={rejectModal.open}
        onClose={closeRejectModal}
        title="Reject Booking Request"
        footer={
          <>
            <button
              onClick={closeRejectModal}
              disabled={actionLoading}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading || !rejectReason.trim()}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? "Rejecting..." : "Reject Booking"}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 mb-4">
          Please provide a reason for rejecting this booking request. The
          student will be notified.
        </p>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Rejection Reason
        </label>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          placeholder="Enter the reason for rejection..."
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          autoFocus
        />
      </Modal>

      {/* View Details Modal */}
      <Modal
        open={viewModal.open}
        onClose={closeViewModal}
        title="Booking Details"
        footer={
          <button
            onClick={closeViewModal}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
        }
      >
        {viewModal.booking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  Booking ID
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  #{viewModal.booking.id}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  Status
                </p>
                <Badge
                  variant={
                    viewModal.booking.status === "approved"
                      ? "success"
                      : viewModal.booking.status === "rejected"
                        ? "error"
                        : viewModal.booking.status === "return_pending"
                          ? "warning"
                          : "default"
                  }
                >
                  {viewModal.booking.status === "return_pending"
                    ? "Return Pending"
                    : viewModal.booking.status}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  Student
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {viewModal.booking.student}
                </p>
                <p className="text-xs text-slate-500">
                  {viewModal.booking.studentId}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  Component
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {viewModal.booking.component}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  Quantity
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {viewModal.booking.qty}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  Purpose
                </p>
                <p className="text-sm text-slate-700">
                  {viewModal.booking.purpose}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
