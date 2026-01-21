import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import Card from "../../components/common/Card.jsx";
import Badge from "../../components/common/Badge.jsx";
import Button from "../../components/common/Button.jsx";
import { useToast } from "../../hooks/useToast";
import { adminAPI } from "../../api/admin";

export default function PenaltyManagement() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [newPenalty, setNewPenalty] = useState({
    user_id: "",
    booking_id: "",
    penalty_type: "damage",
    amount: "",
    due_date: "",
    notes: "",
  });

  const [stats, setStats] = useState({
    total: 0,
    collected: 0,
    pending: 0,
    students: 0,
  });

  const [viewModal, setViewModal] = useState({ open: false, penalty: null });

  const loadPenalties = async () => {
    try {
      setLoading(true);
      const [penaltiesRes, statsRes] = await Promise.all([
        adminAPI.getAllPenalties(),
        adminAPI.getPenaltyStats(),
      ]);

      const penaltiesData = penaltiesRes.data || [];
      const statsData = statsRes.data || {};

      // Transform penalties
      const mapped = penaltiesData.map((p) => ({
        id: p.penalty_id,
        student: p.full_name || "Unknown",
        studentId: p.student_id || p.user_id,
        userId: p.user_id,
        email: p.email || "N/A",
        component: p.component_name || "N/A",
        bookingId: p.booking_id,
        type: p.penalty_type,
        amount: p.amount,
        date: p.penalty_date
          ? new Date(p.penalty_date).toLocaleDateString()
          : "N/A",
        dueDate: p.due_date ? new Date(p.due_date).toLocaleDateString() : "N/A",
        paidDate: p.paid_date
          ? new Date(p.paid_date).toLocaleDateString()
          : null,
        status: p.status,
        notes: p.notes || "",
      }));

      setPenalties(mapped);
      setStats({
        total: statsData.totalAmount || 0,
        collected: statsData.paidAmount || 0,
        pending: statsData.pendingAmount || 0,
        students: statsData.studentsWithPenalties || 0,
      });
      setLoading(false);
    } catch (err) {
      console.error("Failed to load penalties:", err);
      setPenalties([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPenalties();
  }, []);

  // Load students for the create penalty modal
  const loadStudents = async () => {
    try {
      const res = await adminAPI.getUsers({ role: "student" });
      setStudents(res.data || []);
    } catch (err) {
      console.error("Failed to load students:", err);
    }
  };

  // Load bookings for a selected student
  const loadStudentBookings = async (userId) => {
    try {
      const res = await adminAPI.getAllBookings({ userId });
      // Filter to only show approved/returned bookings that can have penalties
      const filtered = (res.data || []).filter(
        (b) => b.status === "approved" || b.status === "returned",
      );
      setBookings(filtered);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      setBookings([]);
    }
  };

  const handleOpenCreateModal = () => {
    loadStudents();
    setNewPenalty({
      user_id: "",
      booking_id: "",
      penalty_type: "damage",
      amount: "",
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // Default: 7 days from now
      notes: "",
    });
    setBookings([]);
    setShowCreateModal(true);
  };

  const handleStudentChange = (userId) => {
    setNewPenalty({ ...newPenalty, user_id: userId, booking_id: "" });
    if (userId) {
      loadStudentBookings(userId);
    } else {
      setBookings([]);
    }
  };

  const handleCreatePenalty = async (e) => {
    e.preventDefault();
    if (!newPenalty.user_id || !newPenalty.booking_id || !newPenalty.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setActionLoading(true);
      await adminAPI.createPenalty({
        user_id: parseInt(newPenalty.user_id),
        booking_id: parseInt(newPenalty.booking_id),
        penalty_type: newPenalty.penalty_type,
        amount: parseFloat(newPenalty.amount),
        due_date: newPenalty.due_date,
        notes: newPenalty.notes,
      });
      toast.success("Penalty created successfully!");
      setShowCreateModal(false);
      loadPenalties();
    } catch (err) {
      console.error("Failed to create penalty:", err);
      toast.error(err.response?.data?.message || "Failed to create penalty");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async (penaltyId) => {
    try {
      await adminAPI.updatePenaltyStatus(penaltyId, "paid");
      toast.success("Penalty marked as paid!");
      loadPenalties();
    } catch (err) {
      console.error("Failed to update penalty:", err);
      toast.error("Failed to update penalty status");
    }
  };

  const filteredPenalties = penalties.filter((p) =>
    search
      ? p.student.toLowerCase().includes(search.toLowerCase()) ||
        p.studentId.includes(search)
      : true,
  );

  return (
    <AdminLayout title="Penalty Management">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          {
            label: "TOTAL PENALTIES",
            value: `৳ ${stats.total}`,
            color: "bg-emerald-50",
          },
          {
            label: "COLLECTED",
            value: `৳ ${stats.collected}`,
            color: "bg-emerald-50",
          },
          {
            label: "PENDING",
            value: `৳ ${stats.pending}`,
            color: "bg-red-50",
          },
          {
            label: "STUDENTS WITH PENALTIES",
            value: stats.students,
            color: "bg-yellow-50",
          },
        ].map((stat, idx) => (
          <div key={idx} className={`${stat.color} p-4 rounded-lg`}>
            <div className="text-xs font-semibold text-slate-600 uppercase">
              {stat.label}
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <Card>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                Penalty Management
              </h2>
              <p className="text-sm text-slate-600">
                Track and manage student penalties
              </p>
            </div>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={handleOpenCreateModal}
            >
              + Create Penalty
            </Button>
          </div>
          <input
            type="text"
            placeholder="Search penalties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-full text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-3 px-3 font-semibold">Penalty ID</th>
                <th className="py-3 px-3 font-semibold">Student</th>
                <th className="py-3 px-3 font-semibold">Component</th>
                <th className="py-3 px-3 font-semibold">Type</th>
                <th className="py-3 px-3 font-semibold">Amount</th>
                <th className="py-3 px-3 font-semibold">Date</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPenalties.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-3 px-3 font-semibold">{p.id}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">
                      {p.student}
                    </div>
                    <div className="text-xs text-slate-500">{p.studentId}</div>
                  </td>
                  <td className="py-3 px-3">{p.component}</td>
                  <td className="py-3 px-3 text-xs">{p.type}</td>
                  <td className="py-3 px-3 font-semibold text-red-600">
                    ৳ {p.amount}
                  </td>
                  <td className="py-3 px-3 text-xs">{p.date}</td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={p.status === "pending" ? "warning" : "success"}
                    >
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 space-x-1 flex">
                    {p.status === "pending" && (
                      <button
                        onClick={() => handleMarkPaid(p.id)}
                        className="px-3 py-1 bg-emerald-500 text-white text-xs rounded font-semibold hover:bg-emerald-600"
                      >
                        Mark Paid
                      </button>
                    )}
                    <button
                      onClick={() => setViewModal({ open: true, penalty: p })}
                      className="px-3 py-1 border border-slate-300 text-slate-700 text-xs rounded font-semibold hover:bg-slate-50"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Penalty Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Penalty</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreatePenalty} className="space-y-4">
              {/* Student Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Student <span className="text-red-500">*</span>
                </label>
                <select
                  value={newPenalty.user_id}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select a student</option>
                  {students.map((s) => (
                    <option key={s.user_id} value={s.user_id}>
                      {s.full_name} ({s.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Booking Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Related Booking <span className="text-red-500">*</span>
                </label>
                <select
                  value={newPenalty.booking_id}
                  onChange={(e) =>
                    setNewPenalty({ ...newPenalty, booking_id: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                  required
                  disabled={!newPenalty.user_id}
                >
                  <option value="">Select a booking</option>
                  {bookings.map((b) => (
                    <option key={b.booking_id} value={b.booking_id}>
                      #{b.booking_id} - {b.component_name} ({b.status})
                    </option>
                  ))}
                </select>
                {newPenalty.user_id && bookings.length === 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    No eligible bookings found for this student
                  </p>
                )}
              </div>

              {/* Penalty Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Penalty Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={newPenalty.penalty_type}
                  onChange={(e) =>
                    setNewPenalty({
                      ...newPenalty,
                      penalty_type: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                  required
                >
                  <option value="damage">Damage</option>
                  <option value="overdue">Late Return (Overdue)</option>
                  <option value="lost">Lost Item</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Amount (৳) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={newPenalty.amount}
                  onChange={(e) =>
                    setNewPenalty({ ...newPenalty, amount: e.target.value })
                  }
                  placeholder="Enter penalty amount"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Guidelines: Late return ৳50/day, Minor damage ৳200-500, Major
                  damage ৳500-2000
                </p>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newPenalty.due_date}
                  onChange={(e) =>
                    setNewPenalty({ ...newPenalty, due_date: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newPenalty.notes}
                  onChange={(e) =>
                    setNewPenalty({ ...newPenalty, notes: e.target.value })
                  }
                  placeholder="Describe the reason for this penalty..."
                  rows="3"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Creating..." : "Create Penalty"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Penalty Details Modal */}
      {viewModal.open && viewModal.penalty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Penalty Details</h3>
              <button
                onClick={() => setViewModal({ open: false, penalty: null })}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Penalty ID</span>
                <span className="text-sm font-semibold">
                  #{viewModal.penalty.id}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Student</span>
                <span className="text-sm font-semibold">
                  {viewModal.penalty.student}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Student ID</span>
                <span className="text-sm font-semibold">
                  {viewModal.penalty.studentId}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Component</span>
                <span className="text-sm font-semibold">
                  {viewModal.penalty.component}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Penalty Type</span>
                <span className="text-sm font-semibold capitalize">
                  {viewModal.penalty.type}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Amount</span>
                <span className="text-sm font-semibold text-red-600">
                  ৳{viewModal.penalty.amount}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Created Date</span>
                <span className="text-sm font-semibold">
                  {viewModal.penalty.date}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Due Date</span>
                <span className="text-sm font-semibold">
                  {viewModal.penalty.dueDate}
                </span>
              </div>
              {viewModal.penalty.paidDate && (
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Paid Date</span>
                  <span className="text-sm font-semibold text-emerald-600">
                    {viewModal.penalty.paidDate}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Status</span>
                <Badge
                  variant={
                    viewModal.penalty.status === "pending"
                      ? "warning"
                      : "success"
                  }
                >
                  {viewModal.penalty.status}
                </Badge>
              </div>
              {viewModal.penalty.notes && (
                <div className="py-2">
                  <span className="text-sm text-slate-500 block mb-1">
                    Notes
                  </span>
                  <p className="text-sm bg-slate-50 p-2 rounded">
                    {viewModal.penalty.notes}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-2">
              {viewModal.penalty.status === "pending" && (
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={() => {
                    handleMarkPaid(viewModal.penalty.id);
                    setViewModal({ open: false, penalty: null });
                  }}
                >
                  Mark as Paid
                </Button>
              )}
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => setViewModal({ open: false, penalty: null })}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
