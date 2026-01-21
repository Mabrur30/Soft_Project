import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import Card from "../../components/common/Card.jsx";
import Badge from "../../components/common/Badge.jsx";
import Button from "../../components/common/Button.jsx";
import { ConfirmModal } from "../../components/common/Modal.jsx";
import { useToast } from "../../hooks/useToast";
import { adminAPI } from "../../api/admin";

export default function StudentManagement() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    studentId: null,
    studentName: "",
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, student: null });
  const [newStudent, setNewStudent] = useState({
    id: "",
    full_name: "",
    email: "",
    department: "",
    phone_number: "",
    password: "",
  });

  const loadStudents = async (searchTerm = "") => {
    try {
      setLoading(true);
      const params = { role: "student" };
      if (searchTerm) {
        params.search = searchTerm;
      }
      const res = await adminAPI.getUsers(params);
      const users = res.data || [];
      const mapped = users.map((u) => ({
        id: u.id,
        userId: u.user_id,
        name: u.full_name,
        email: u.email,
        phone: u.phone_number || "N/A",
        department: u.department || "N/A",
        activeBookings: u.active_bookings || 0,
        totalBookings: u.total_bookings || 0,
        penalties: u.total_penalties || 0,
        status: "Active",
      }));
      setStudents(mapped);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load students:", err);
      setStudents([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadStudents(search);
    }, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await adminAPI.createUser(newStudent);
      toast.success("Student added successfully!");
      setShowAddModal(false);
      setNewStudent({
        id: "",
        full_name: "",
        email: "",
        department: "",
        phone_number: "",
        password: "",
      });
      loadStudents();
    } catch (err) {
      console.error("Failed to add student:", err);
      toast.error(err.response?.data?.message || "Failed to add student");
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (studentId, studentName) => {
    setDeleteModal({ open: true, studentId, studentName });
  };

  const handleDeleteStudent = async () => {
    try {
      setActionLoading(true);
      await adminAPI.deleteUser(deleteModal.studentId);
      toast.success("Student deleted successfully!");
      setDeleteModal({ open: false, studentId: null, studentName: "" });
      loadStudents();
    } catch (err) {
      console.error("Failed to delete student:", err);
      toast.error("Failed to delete student");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout title="Student Management">
      <Card>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Student Management
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                View and manage student accounts
              </p>
            </div>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => setShowAddModal(true)}
            >
              + Add Student
            </Button>
          </div>
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-full text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-3 px-3 font-semibold">Student ID</th>
                <th className="py-3 px-3 font-semibold">Name</th>
                <th className="py-3 px-3 font-semibold">Email</th>
                <th className="py-3 px-3 font-semibold">Department</th>
                <th className="py-3 px-3 font-semibold">Penalties</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-3 px-3 font-semibold">{s.id}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {s.name}
                  </td>
                  <td className="py-3 px-3 text-xs">{s.email}</td>
                  <td className="py-3 px-3">{s.department}</td>
                  <td className="py-3 px-3 font-semibold text-red-600">
                    ৳{s.penalties}
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="success">{s.status}</Badge>
                  </td>
                  <td className="py-3 px-3 space-x-1 flex">
                    <button
                      onClick={() => setViewModal({ open: true, student: s })}
                      className="px-3 py-1 border border-slate-300 text-slate-700 text-xs rounded font-semibold hover:bg-slate-50"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openDeleteModal(s.userId, s.name)}
                      className="px-3 py-1 border border-red-300 text-red-600 text-xs rounded font-semibold hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Student</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Student ID *
                </label>
                <input
                  type="text"
                  value={newStudent.id}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, id: e.target.value })
                  }
                  required
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newStudent.full_name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, full_name: e.target.value })
                  }
                  required
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, email: e.target.value })
                  }
                  required
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={newStudent.department}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, department: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={newStudent.phone_number}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      phone_number: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={newStudent.password}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, password: e.target.value })
                  }
                  required
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Add Student
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {viewModal.open && viewModal.student && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Student Details</h3>
              <button
                onClick={() => setViewModal({ open: false, student: null })}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Student ID</span>
                <span className="text-sm font-semibold">
                  {viewModal.student.id}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Full Name</span>
                <span className="text-sm font-semibold">
                  {viewModal.student.name}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Email</span>
                <span className="text-sm font-semibold">
                  {viewModal.student.email}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Phone</span>
                <span className="text-sm font-semibold">
                  {viewModal.student.phone}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Department</span>
                <span className="text-sm font-semibold">
                  {viewModal.student.department}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Total Penalties</span>
                <span className="text-sm font-semibold text-red-600">
                  ৳{viewModal.student.penalties}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-slate-500">Status</span>
                <Badge variant="success">{viewModal.student.status}</Badge>
              </div>
            </div>
            <div className="mt-6">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setViewModal({ open: false, student: null })}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() =>
          setDeleteModal({ open: false, studentId: null, studentName: "" })
        }
        onConfirm={handleDeleteStudent}
        title="Delete Student"
        message={`Are you sure you want to delete "${deleteModal.studentName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={actionLoading}
      />
    </AdminLayout>
  );
}
