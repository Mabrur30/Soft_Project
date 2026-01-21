// src/pages/PenaltiesPage.jsx
import { useState, useEffect } from "react";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout.jsx";
import Card from "../components/common/Card.jsx";
import Badge from "../components/common/Badge.jsx";
import Button from "../components/common/Button.jsx";
import { penaltiesAPI } from "../api/penalties";

const PENALTY_RULES = [
  { label: "Late return", value: "৳50 per day per item" },
  { label: "Minor damage", value: "৳200 – ৳500" },
  { label: "Major damage", value: "৳500 – ৳2000" },
  { label: "Lost item", value: "Full replacement cost" },
];

export default function PenaltiesPage() {
  const [overview, setOverview] = useState({
    total: "৳0",
    paid: "৳0",
    pending: "৳0",
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load penalties via API
  useEffect(() => {
    penaltiesAPI
      .getMyPenalties()
      .then((res) => {
        const penalties = res.data || [];

        // Calculate overview from penalties
        let totalAmount = 0;
        let paidAmount = 0;
        let pendingAmount = 0;

        penalties.forEach((p) => {
          const amount = parseFloat(p.amount) || 0;
          totalAmount += amount;
          if (p.status === "paid") {
            paidAmount += amount;
          } else if (p.status === "pending") {
            pendingAmount += amount;
          }
        });

        setOverview({
          total: `৳${totalAmount.toFixed(0)}`,
          paid: `৳${paidAmount.toFixed(0)}`,
          pending: `৳${pendingAmount.toFixed(0)}`,
        });

        // Map penalties to history format
        const historyData = penalties.map((p) => ({
          id: p.penalty_id,
          type: p.penalty_type === "overdue" ? "Late Return" : "Damage",
          component: p.component_name || "Unknown Component",
          info: p.notes || `Due: ${new Date(p.due_date).toLocaleDateString()}`,
          amount: `৳${parseFloat(p.amount).toFixed(0)}`,
          status: p.status?.charAt(0).toUpperCase() + p.status?.slice(1),
        }));

        setHistory(historyData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load penalties:", err);
        setOverview({ total: "৳0", paid: "৳0", pending: "৳0" });
        setHistory([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <AuthenticatedLayout title="Penalties">
        <p className="text-sm text-slate-600">Loading penalties…</p>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout title="Penalties">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: overview + history */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Penalty overview
            </h2>
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Total penalties
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {overview.total}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Paid
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {overview.paid}
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Pending
                </div>
                <div className="text-2xl font-bold text-yellow-700">
                  {overview.pending}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Penalty history
            </h2>
            <div className="space-y-3 text-sm">
              {history.map((p) => (
                <div
                  key={p.id}
                  className="border border-slate-200 rounded-lg p-3 bg-slate-50"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-900">
                      {p.type}
                    </span>
                    <Badge
                      variant={p.status === "Paid" ? "success" : "warning"}
                    >
                      {p.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-600 mb-1">
                    {p.component}
                  </div>
                  <div className="text-[11px] text-slate-500 mb-2">
                    {p.info}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {p.amount}
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No penalties recorded.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Right: payment + rules */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Payment information
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2 mb-3 text-xs text-yellow-900">
              You have <span className="font-semibold">{overview.pending}</span>{" "}
              in pending penalties.
            </div>
            <div className="text-xs text-slate-700 mb-3">
              Payment methods:
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li>Cash at lab office</li>
                <li>bKash: 01XXXXXXXXXX</li>
                <li>Nagad: 01XXXXXXXXXX</li>
              </ul>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 text-center">
              Contact lab admin after payment for verification.
            </p>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Penalty rules
            </h3>
            <div className="space-y-2 text-xs">
              {PENALTY_RULES.map((r) => (
                <div key={r.label}>
                  <div className="font-semibold text-slate-800">{r.label}</div>
                  <div className="text-slate-600">{r.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
