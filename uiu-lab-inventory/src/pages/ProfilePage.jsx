// src/pages/ProfilePage.jsx
import { useState, useEffect } from "react";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout.jsx";
import Card from "../components/common/Card.jsx";
import Button from "../components/common/Button.jsx";
import { useToast } from "../hooks/useToast";
import { profileAPI } from "../api/profile";
import { dashboardAPI } from "../api/dashboard";

const DEFAULT_PROFILE = {
  full_name: "",
  id: "",
  department: "",
  email: "",
  phone_number: "",
  role: "student",
};

export default function ProfilePage() {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [accountStats, setAccountStats] = useState([]);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");

  // Load profile via API
  useEffect(() => {
    Promise.all([profileAPI.getProfile(), dashboardAPI.getUserStats()])
      .then(([profileRes, statsRes]) => {
        const profile = profileRes.data || DEFAULT_PROFILE;
        setForm({
          full_name: profile.full_name || "",
          id: profile.id || "",
          department: profile.department || "",
          email: profile.email || "",
          phone_number: profile.phone_number || "",
          role: profile.role || "student",
        });

        const stats = statsRes.data || {};
        setAccountStats([
          { label: "Total bookings", value: stats.totalBookings || 0 },
          { label: "Active bookings", value: stats.activeBookings || 0 },
          { label: "Returned", value: stats.returnedBookings || 0 },
          { label: "Overdue instances", value: stats.overdueBookings || 0 },
        ]);

        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load profile:", err);
        setForm(DEFAULT_PROFILE);
        setAccountStats([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <AuthenticatedLayout title="Profile">
        <p className="text-sm text-slate-600">Loading profile…</p>
      </AuthenticatedLayout>
    );
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSave = (e) => {
    e.preventDefault();
    profileAPI
      .updateProfile({
        full_name: form.full_name,
        phone_number: form.phone_number,
        department: form.department,
      })
      .then(() => {
        setEditing(false);
        toast.success("Profile updated successfully!");
      })
      .catch((err) => {
        console.error("Failed to update profile:", err);
        toast.error("Failed to update profile.");
      });
  };

  const onPasswordChange = (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New passwords do not match!");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage("Password must be at least 6 characters!");
      return;
    }

    profileAPI
      .changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      .then(() => {
        setPasswordMessage("Password changed successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      })
      .catch((err) => {
        console.error("Failed to change password:", err);
        setPasswordMessage(
          err.response?.data?.message || "Failed to change password.",
        );
      });
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AuthenticatedLayout title="Profile">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: avatar + stats */}
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col items-center py-4">
              <div className="w-24 h-24 rounded-full bg-primary-500 text-white flex items-center justify-center text-3xl font-bold mb-3">
                {getInitials(form.full_name)}
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                {form.full_name || "User"}
              </h2>
              <p className="text-xs text-slate-500">
                {form.role === "admin" ? "Admin" : "Student"} ·{" "}
                {form.department || "N/A"}
              </p>
              <div className="mt-3 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-[11px] font-semibold">
                ID: {form.id}
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Account statistics
            </h3>
            <div className="space-y-2 text-xs">
              {accountStats.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-slate-600">{s.label}</span>
                  <span className="font-semibold text-slate-900">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column: personal info + security */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Personal information
              </h2>
              <Button
                size="sm"
                variant={editing ? "outline" : "secondary"}
                onClick={() => setEditing((v) => !v)}
              >
                {editing ? "Cancel" : "Edit"}
              </Button>
            </div>

            {editing ? (
              <form onSubmit={onSave} className="space-y-4 text-sm">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      Full name
                    </label>
                    <input
                      name="full_name"
                      value={form.full_name}
                      onChange={onChange}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      Student ID
                    </label>
                    <input
                      value={form.id}
                      disabled
                      className="w-full border border-slate-200 bg-slate-50 rounded-md px-3 py-2 text-sm text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 mb-1">
                    Department
                  </label>
                  <input
                    name="department"
                    value={form.department}
                    onChange={onChange}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      Email
                    </label>
                    <input
                      name="email"
                      value={form.email}
                      disabled
                      className="w-full border border-slate-200 bg-slate-50 rounded-md px-3 py-2 text-sm text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      Phone
                    </label>
                    <input
                      name="phone_number"
                      value={form.phone_number}
                      onChange={onChange}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Save changes
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="grid md:grid-cols-2 gap-4">
                  <InfoRow label="Full name" value={form.full_name} />
                  <InfoRow label="Student ID" value={form.id} />
                </div>
                <InfoRow label="Department" value={form.department} />
                <div className="grid md:grid-cols-2 gap-4">
                  <InfoRow label="Email" value={form.email} />
                  <InfoRow label="Phone" value={form.phone_number} />
                </div>
                <InfoRow
                  label="Role"
                  value={form.role === "admin" ? "Administrator" : "Student"}
                />
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Change Password
            </h2>

            <form onSubmit={onPasswordChange} className="space-y-4 text-sm">
              {passwordMessage && (
                <div
                  className={`p-3 rounded-md text-xs ${
                    passwordMessage.includes("success")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {passwordMessage}
                </div>
              )}
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <Button type="submit" className="w-full">
                Update Password
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="font-medium text-slate-900">{value || "N/A"}</div>
    </div>
  );
}
