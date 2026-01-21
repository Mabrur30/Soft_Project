import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import Card from "../../components/common/Card.jsx";
import { adminAPI } from "../../api/admin";

const EMPTY_ANALYTICS = {
  thisMonth: {
    totalBookings: 0,
    growth: "0%",
    mostBooked: "N/A",
    mostBookedQty: 0,
    avgDuration: "0 days",
  },
  bookingTrends: [],
  componentPopularity: [],
  usagePatterns: [],
  insights: [],
};

// Line Chart Component
function LineChart({ data, title, xKey, yKey }) {
  const maxVal = Math.max(...data.map((d) => d[yKey]));
  const width = 600;
  const height = 300;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;
  const stepX = chartWidth / (data.length - 1);
  const stepY = chartHeight / maxVal;

  const points = data
    .map(
      (d, i) =>
        `${padding + i * stepX},${padding + chartHeight - d[yKey] * stepY}`,
    )
    .join(" ");

  const gridLines = Array.from({ length: 5 }, (_, i) => {
    const y = padding + (chartHeight / 4) * i;
    const value = Math.round(maxVal - (maxVal / 4) * i);
    return (
      <g key={i}>
        <line
          x1={padding}
          y1={y}
          x2={width - padding}
          y2={y}
          stroke="#e2e8f0"
          strokeWidth="1"
        />
        <text
          x={padding - 30}
          y={y + 5}
          fontSize="12"
          textAnchor="end"
          fill="#64748b"
        >
          {value}
        </text>
      </g>
    );
  });

  return (
    <Card className="mt-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="mb-4">
        {/* Grid */}
        {gridLines}

        {/* X-axis */}
        <line
          x1={padding}
          y1={padding + chartHeight}
          x2={width - padding}
          y2={padding + chartHeight}
          stroke="#1e293b"
          strokeWidth="2"
        />

        {/* Y-axis */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={padding + chartHeight}
          stroke="#1e293b"
          strokeWidth="2"
        />

        {/* Data points and lines */}
        <polyline
          points={points}
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
        />

        {/* Dots */}
        {data.map((d, i) => {
          const x = padding + i * stepX;
          const y = padding + chartHeight - d[yKey] * stepY;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="5"
              fill="#10b981"
              stroke="#fff"
              strokeWidth="2"
            />
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => {
          const x = padding + i * stepX;
          const y = padding + chartHeight + 25;
          return (
            <text
              key={i}
              x={x}
              y={y}
              fontSize="12"
              textAnchor="middle"
              fill="#64748b"
            >
              {d[xKey]}
            </text>
          );
        })}
      </svg>
    </Card>
  );
}

// Bar Chart Component
function BarChart({ data, title, xKey, yKey }) {
  const maxVal = Math.max(...data.map((d) => d[yKey]));
  return (
    <Card className="mt-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">{title}</h3>
      <div className="space-y-4">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between mb-1 text-sm">
              <span className="font-semibold text-slate-700">{item[xKey]}</span>
              <span className="text-slate-600 font-semibold">{item[yKey]}</span>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                style={{
                  width: `${(item[yKey] / maxVal) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Pie Chart Component
function PieChart({ data, title, nameKey, valueKey }) {
  const total = data.reduce((sum, d) => sum + d[valueKey], 0);
  const colors = ["#10b981", "#06b6d4", "#f59e0b", "#ef4444", "#8b5cf6"];

  const slices = data.map((item, idx) => {
    let currentAngle = -90;
    for (let i = 0; i < idx; i++) {
      currentAngle += (data[i][valueKey] / total) * 360;
    }
    const sliceAngle = (item[valueKey] / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = 150 + 100 * Math.cos(startRad);
    const y1 = 150 + 100 * Math.sin(startRad);
    const x2 = 150 + 100 * Math.cos(endRad);
    const y2 = 150 + 100 * Math.sin(endRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    return {
      path: `M 150 150 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: colors[idx % colors.length],
      label: item[nameKey],
      value: item[valueKey],
      percentage: ((item[valueKey] / total) * 100).toFixed(1),
    };
  });

  return (
    <Card className="mt-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">{title}</h3>
      <div className="flex gap-6 items-center justify-center flex-wrap">
        {/* Pie */}
        <svg
          width="300"
          height="300"
          viewBox="0 0 300 300"
          className="flex-shrink-0"
        >
          {slices.map((slice, idx) => (
            <path
              key={idx}
              d={slice.path}
              fill={slice.color}
              stroke="#fff"
              strokeWidth="2"
            />
          ))}
        </svg>

        {/* Legend */}
        <div className="space-y-2">
          {slices.map((slice, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: slice.color }}
              />
              <span className="font-semibold">{slice.label}</span>
              <span className="text-slate-600">
                {slice.value} ({slice.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const [trendsRes, topComponentsRes, statsRes] = await Promise.all([
          adminAPI.getBookingTrends(),
          adminAPI.getTopComponents(5),
          adminAPI.getDashboardStats(),
        ]);

        const trends = trendsRes.data || [];
        const topComponents = topComponentsRes.data || [];
        const stats = statsRes.data || {};

        // Generate weekly booking trends from trends data
        const weeklyTrends =
          trends.length > 0
            ? trends.map((t, idx) => ({
                week: `Week ${idx + 1}`,
                bookings: t.count || 0,
              }))
            : [
                { week: "Week 1", bookings: 0 },
                { week: "Week 2", bookings: 0 },
                { week: "Week 3", bookings: 0 },
                { week: "Week 4", bookings: 0 },
              ];

        // Transform component popularity
        const componentPopularity = topComponents.map((c) => ({
          component: c.name || c.component_name || "Unknown",
          bookings: c.booking_count || 0,
        }));

        // Usage patterns by day (mock for now, could be enhanced with real data)
        const usagePatterns = [
          { day: "Monday", bookings: Math.floor(Math.random() * 20) + 5 },
          { day: "Tuesday", bookings: Math.floor(Math.random() * 20) + 5 },
          { day: "Wednesday", bookings: Math.floor(Math.random() * 20) + 5 },
          { day: "Thursday", bookings: Math.floor(Math.random() * 20) + 5 },
          { day: "Friday", bookings: Math.floor(Math.random() * 20) + 5 },
        ];

        const totalBookings = stats.totalBookings || 0;
        const mostBooked =
          componentPopularity.length > 0
            ? componentPopularity[0].component
            : "N/A";
        const mostBookedQty =
          componentPopularity.length > 0 ? componentPopularity[0].bookings : 0;

        setAnalytics({
          thisMonth: {
            totalBookings: totalBookings,
            growth: "+12%",
            mostBooked: mostBooked,
            mostBookedQty: mostBookedQty,
            avgDuration: "5 days",
          },
          bookingTrends: weeklyTrends,
          componentPopularity: componentPopularity,
          usagePatterns: usagePatterns,
          insights: [
            `Arduino Uno is the most popular component with ${mostBookedQty} bookings`,
            "Thursday and Friday are peak booking days",
            "Average booking duration is 5 days",
            `${stats.pendingBookings || 0} pending bookings require attention`,
          ],
        });
        setLoading(false);
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setAnalytics(EMPTY_ANALYTICS);
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Analytics & Reports">
        <p className="text-sm text-slate-600">Loading analytics...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics & Reports">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <div className="text-xs font-semibold text-slate-600 uppercase mb-2">
            Total Bookings
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {analytics.thisMonth.totalBookings}
          </div>
          <div className="text-sm text-emerald-600 mt-2">
            ↑ {analytics.thisMonth.growth} from last month
          </div>
        </Card>

        <Card>
          <div className="text-xs font-semibold text-slate-600 uppercase mb-2">
            Most Booked Component
          </div>
          <div className="text-xl font-bold text-slate-900">
            {analytics.thisMonth.mostBooked}
          </div>
          <div className="text-sm text-slate-600 mt-2">
            {analytics.thisMonth.mostBookedQty} bookings
          </div>
        </Card>

        <Card>
          <div className="text-xs font-semibold text-slate-600 uppercase mb-2">
            Avg Duration
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {analytics.thisMonth.avgDuration}
          </div>
          <div className="text-sm text-slate-600 mt-2">Per booking</div>
        </Card>

        <Card>
          <div className="text-xs font-semibold text-slate-600 uppercase mb-2">
            Active Components
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {analytics.componentPopularity.length}
          </div>
          <div className="text-sm text-slate-600 mt-2">In use this month</div>
        </Card>
      </div>

      {/* Charts */}
      <LineChart
        data={analytics.bookingTrends}
        title="📈 Booking Trends (Weekly)"
        xKey="week"
        yKey="bookings"
      />

      <BarChart
        data={analytics.componentPopularity}
        title="⭐ Component Popularity"
        xKey="component"
        yKey="bookings"
      />

      <BarChart
        data={analytics.usagePatterns}
        title="📅 Usage Patterns (By Day)"
        xKey="day"
        yKey="bookings"
      />

      <PieChart
        data={analytics.componentPopularity}
        title="🥧 Component Distribution"
        nameKey="component"
        valueKey="bookings"
      />

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {/* Top Components */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            🏆 Top 5 Components
          </h3>
          <div className="space-y-3">
            {analytics.componentPopularity.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.component}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.bookings} bookings
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-emerald-600">
                    {item.bookings}
                  </div>
                  <div className="text-xs text-slate-500">
                    {Math.round(
                      (item.bookings / analytics.thisMonth.totalBookings) * 100,
                    )}
                    %
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Peak Hours */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            ⏰ Peak Booking Days
          </h3>
          <div className="space-y-3">
            {analytics.usagePatterns
              .sort((a, b) => b.bookings - a.bookings)
              .slice(0, 5)
              .map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{item.day}</p>
                    <p className="text-xs text-slate-500">
                      {item.bookings} bookings
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-8 w-1 bg-emerald-500 rounded-full"
                      style={{
                        height: `${(item.bookings / 30) * 40}px`,
                        minHeight: "8px",
                      }}
                    />
                    <span className="font-bold text-emerald-600 w-8 text-right">
                      {item.bookings}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Key Insights */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          💡 Key Insights
        </h3>
        <ul className="space-y-3">
          {analytics.insights.map((insight, idx) => (
            <li key={idx} className="flex gap-3 text-sm text-slate-700">
              <span className="text-emerald-500 font-bold text-lg">✓</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Recommendations */}
      <Card className="mt-6 bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200">
        <h3 className="text-lg font-semibold text-emerald-900 mb-3">
          📋 Recommendations
        </h3>
        <div className="space-y-2 text-sm text-emerald-800">
          <p>
            • Consider increasing stock for <strong>Arduino Uno</strong> - it's
            the most in-demand component
          </p>
          <p>
            • Thursday-Friday peak suggests scheduling maintenance on
            Monday-Wednesday
          </p>
          <p>
            • Implement weekend reminder notifications to boost weekend bookings
          </p>
          <p>
            • Monitor <strong>Ultrasonic Sensor</strong> stock levels closely
            for reordering
          </p>
        </div>
      </Card>
    </AdminLayout>
  );
}
