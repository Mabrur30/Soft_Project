// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout.jsx";
import Card from "../components/common/Card.jsx";
import Badge from "../components/common/Badge.jsx";
import Button from "../components/common/Button.jsx";
import { dashboardAPI } from "../api/dashboard";
import { bookingsAPI } from "../api/bookings";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    Promise.all([dashboardAPI.getUserStats(), bookingsAPI.getMyBookings()])
      .then(([statsRes, bookingsRes]) => {
        // Transform stats data
        const statsData = statsRes.data || {};
        setStats([
          {
            label: "Active Bookings",
            value: statsData.activeBookings || 0,
            note: "Currently borrowed items",
          },
          {
            label: "Pending Requests",
            value: statsData.pendingBookings || 0,
            note: "Awaiting approval",
          },
          {
            label: "Pending Penalties",
            value: `৳${statsData.totalPendingAmount || 0}`,
            note: `${statsData.pendingPenalties || 0} unpaid penalties`,
          },
        ]);

        // Transform bookings to upcoming returns (approved bookings)
        const bookings = bookingsRes.data || [];
        const upcomingReturns = bookings
          .filter((b) => b.status === "approved")
          .map((b) => ({
            component: b.component_name,
            qty: b.quantity,
            dueDate: b.expected_return_date,
            status: b.is_overdue ? "Overdue" : "Approved",
          }));
        setUpcoming(upcomingReturns);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard API error:", err);
        setError("Could not load dashboard data.");
        setStats([]);
        setUpcoming([]);
        setLoading(false);
      });
  }, []);

  // 3.3 – loading state (goes BEFORE the normal return)
  if (loading) {
    return (
      <AuthenticatedLayout title="Dashboard">
        <p className="text-sm text-slate-600">Loading dashboard…</p>
      </AuthenticatedLayout>
    );
  }

  // 3.4 – main JSX (add error banner at the top)
  return (
    <AuthenticatedLayout title="Dashboard">
      {error && (
        <div className="mb-4 text-xs text-yellow-900 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
              {s.label}
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {s.value}
            </div>
            <div className="text-xs text-slate-500">{s.note}</div>
          </Card>
        ))}
      </div>

      {/* Quick action + upcoming returns */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Quick action
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Need a board or sensor for your lab or final project? Start a
            booking request.
          </p>
          <Button
            className="w-full"
            onClick={() => (window.location.href = "/bookings")}
          >
            + Make new booking
          </Button>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Upcoming returns
            </h2>
            <span className="text-xs text-slate-500">Next 7 days</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-2 pr-3">Component</th>
                  <th className="py-2 pr-3">Qty</th>
                  <th className="py-2 pr-3">Due date</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((u, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-2 pr-3">{u.component}</td>
                    <td className="py-2 pr-3">{u.qty}</td>
                    <td className="py-2 pr-3">
                      {new Date(u.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <Badge
                        variant={
                          u.status === "Approved" ? "success" : "warning"
                        }
                      >
                        {u.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            For any change in plan, contact the lab in advance.
          </p>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
