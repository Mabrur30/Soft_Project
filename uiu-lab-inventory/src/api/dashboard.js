// src/api/dashboard.js
import api from "./axios";

export const dashboardAPI = {
  // User dashboard stats
  getUserStats: () => api.get("/dashboard/user/stats"),

  // Admin dashboard stats
  getAdminStats: () => api.get("/dashboard/admin/stats"),

  // Recent bookings (admin)
  getRecentBookings: (limit = 10) =>
    api.get("/dashboard/recent-bookings", { params: { limit } }),

  // Booking trends (admin)
  getBookingTrends: (days = 30) =>
    api.get("/dashboard/booking-trends", { params: { days } }),

  // Top borrowed components (admin)
  getTopComponents: (limit = 10) =>
    api.get("/dashboard/top-components", { params: { limit } }),

  // Category summary
  getCategorySummary: () => api.get("/dashboard/category-summary"),

  // Users with most penalties (admin)
  getTopPenalties: (limit = 10) =>
    api.get("/dashboard/top-penalties", { params: { limit } }),

  // Overdue bookings (admin)
  getOverdueBookings: () => api.get("/dashboard/overdue-bookings"),

  // Low stock components
  getLowStock: (threshold = 5) =>
    api.get("/dashboard/low-stock", { params: { threshold } }),
};
