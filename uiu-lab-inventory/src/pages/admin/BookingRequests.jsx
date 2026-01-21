import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import Card from "../../components/common/Card.jsx";
import Badge from "../../components/common/Badge.jsx";
import { useToast } from "../../hooks/useToast";
import { adminAPI } from "../../api/admin";

export default function BookingRequests() {
  const toast = useToast();
  const [filter, setFilter] = useState("requested");
  const [counts, setCounts] = useState({
    requested: 0,
    approved: 0,
    rejected: 0,
  });
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal state
  const [rejectModal, setRejectModal] = useState({
    open: false,
    bookingId: null,
  });
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllBookings({
        status: filter === "all" ? undefined : filter,
      });
      const bookings = res.data || [];

      // Transform bookings
      const formattedRequests = bookings.map((b) => ({
        id: b.booking_id,
        student: b.full_name || "Unknown",
        studentId: b.student_id || b.user_id,
        component: b.component_name || "Unknown",
        qty: b.quantity,
        purpose: b.reason || "N/A",
        requested: new Date(b.requested_date).toLocaleDateString(),
        expectedReturn: b.expected_return_date
          ? new Date(b.expected_return_date).toLocaleDateString()
          : "N/A",
        status: b.status,
      }));

      setRequests(formattedRequests);

      // Get counts for each status
      const [requestedRes, approvedRes, rejectedRes] = await Promise.all([
        adminAPI.getAllBookings({ status: "requested" }),
        adminAPI.getAllBookings({ status: "approved" }),
        adminAPI.getAllBookings({ status: "rejected" }),
      ]);

      setCounts({
        requested: (requestedRes.data || []).length,
        approved: (approvedRes.data || []).length,
        rejected: (rejectedRes.data || []).length,
      });

      setLoading(false);
    } catch (err) {
      console.error("Failed to load booking requests:", err);
      setRequests([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const filteredRequests = requests.filter((req) => {
    if (search) {
      return (
        req.student?.toLowerCase().includes(search.toLowerCase()) ||
        req.studentId?.includes(search)
      );
    }
    return true;
  });

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await adminAPI.approveBooking(id);
      toast.success("Booking approved!");
      loadBookings();
    } catch (err) {
      console.error("Failed to approve booking:", err);
      toast.error("Failed to approve booking");
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (id) => {
    setRejectModal({ open: true, bookingId: id });
    setRejectReason("");
  };

  const closeRejectModal = () => {
    setRejectModal({ open: false, bookingId: null });
    setRejectReason("");
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      setActionLoading(true);
      await adminAPI.rejectBooking(rejectModal.bookingId, rejectReason);
      toast.success("Booking rejected!");
      closeRejectModal();
      loadBookings();
    } catch (err) {
      console.error("Failed to reject booking:", err);
      toast.error("Failed to reject booking");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout title="Booking Requests">
      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Booking Requests
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Review and approve student booking requests
          </p>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-4 border-b border-slate-200">
            {[
              { key: "requested", label: `Pending (${counts.requested})` },
              { key: "approved", label: `Approved (${counts.approved})` },
              { key: "rejected", label: `Rejected (${counts.rejected})` },
              { key: "all", label: "All" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 font-semibold text-sm transition-colors ${
                  filter === tab.key
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-full text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-3 px-3 font-semibold">Request ID</th>
                <th className="py-3 px-3 font-semibold">Student</th>
                <th className="py-3 px-3 font-semibold">Component</th>
                <th className="py-3 px-3 font-semibold">Qty</th>
                <th className="py-3 px-3 font-semibold">Purpose</th>
                <th className="py-3 px-3 font-semibold">Requested</th>
                <th className="py-3 px-3 font-semibold">Expected Return</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-3 px-3 font-semibold">{req.id}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">
                      {req.student}
                    </div>
                    <div className="text-xs text-slate-500">
                      {req.studentId}
                    </div>
                  </td>
                  <td className="py-3 px-3">{req.component}</td>
                  <td className="py-3 px-3">{req.qty}</td>
                  <td className="py-3 px-3 text-xs">{req.purpose}</td>
                  <td className="py-3 px-3 text-xs">{req.requested}</td>
                  <td className="py-3 px-3 text-xs">{req.expectedReturn}</td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        req.status === "requested"
                          ? "warning"
                          : req.status === "approved"
                            ? "success"
                            : "error"
                      }
                    >
                      {req.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 space-x-1 flex">
                    {req.status === "requested" && (
                      <>
                        <button
                          onClick={() => handleApprove(req.id)}
                          disabled={actionLoading}
                          className="px-3 py-1 bg-emerald-500 text-white text-xs rounded font-semibold hover:bg-emerald-600 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(req.id)}
                          disabled={actionLoading}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded font-semibold hover:bg-red-600 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button className="px-3 py-1 border border-slate-300 text-slate-700 text-xs rounded font-semibold hover:bg-slate-50">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Rejection Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Reject Booking Request
              </h3>
              <button
                onClick={closeRejectModal}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
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
            </div>

            <div className="flex justify-end gap-3 px-5 py-4 bg-slate-50 border-t border-slate-200">
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
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
