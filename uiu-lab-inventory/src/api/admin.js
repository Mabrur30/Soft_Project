import api from "./axios";

export const adminAPI = {
  // ==================== Dashboard ====================
  getDashboardStats: () => api.get("/dashboard/admin/stats"),
  getRecentBookings: (limit = 10) =>
    api.get("/dashboard/recent-bookings", { params: { limit } }),
  getBookingTrends: (days = 30) =>
    api.get("/dashboard/booking-trends", { params: { days } }),
  getTopComponents: (limit = 10) =>
    api.get("/dashboard/top-components", { params: { limit } }),
  getCategorySummary: () => api.get("/dashboard/category-summary"),
  getUsersWithMostPenalties: (limit = 10) =>
    api.get("/dashboard/top-penalties", { params: { limit } }),
  getOverdueBookings: () => api.get("/dashboard/overdue-bookings"),
  getLowStockComponents: (threshold = 5) =>
    api.get("/dashboard/low-stock", { params: { threshold } }),

  // ==================== Bookings ====================
  getAllBookings: (params = {}) => api.get("/bookings", { params }),
  getPendingBookings: () => api.get("/bookings/pending"),
  getBookingById: (bookingId) => api.get(`/bookings/${bookingId}`),
  approveBooking: (bookingId) => api.patch(`/bookings/${bookingId}/approve`),
  rejectBooking: (bookingId, reason) =>
    api.patch(`/bookings/${bookingId}/reject`, { reason }),
  approveReturn: (bookingId) =>
    api.patch(`/bookings/${bookingId}/approve-return`),
  returnBooking: (bookingId) => api.patch(`/bookings/${bookingId}/return`),
  markOverdue: (bookingId) => api.patch(`/bookings/${bookingId}/overdue`),
  deleteBooking: (bookingId) => api.delete(`/bookings/${bookingId}`),

  // ==================== Components ====================
  getComponents: (params = {}) => api.get("/components", { params }),
  getComponentById: (id) => api.get(`/components/${id}`),
  getComponentByCode: (code) => api.get(`/components/code/${code}`),
  getCategories: () => api.get("/components/categories"),
  addComponent: (payload) =>
    api.post("/components", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateComponent: (componentId, payload) =>
    api.put(`/components/${componentId}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateComponentPartial: (componentId, payload) =>
    api.patch(`/components/${componentId}`, payload),
  deleteComponent: (componentId) => api.delete(`/components/${componentId}`),

  // ==================== Users / Students ====================
  getUsers: (params = {}) => api.get("/users", { params }),
  searchUsers: (query, role, department) =>
    api.get("/users/search", { params: { query, role, department } }),
  getUserById: (userId) => api.get(`/users/${userId}`),
  createUser: (payload) => api.post("/users", payload),
  updateUser: (userId, payload) => api.put(`/users/${userId}`, payload),
  updateUserPartial: (userId, payload) =>
    api.patch(`/users/${userId}`, payload),
  resetUserPassword: (userId, newPassword) =>
    api.put(`/users/${userId}/reset-password`, { newPassword }),
  deleteUser: (userId) => api.delete(`/users/${userId}`),

  // ==================== Penalties ====================
  getAllPenalties: () => api.get("/penalties"),
  getPenaltyStats: () => api.get("/penalties/stats"),
  getPenaltiesByUser: (userId) => api.get(`/penalties/user/${userId}`),
  getPenaltyById: (penaltyId) => api.get(`/penalties/${penaltyId}`),
  createPenalty: (payload) => api.post("/penalties", payload),
  updatePenalty: (penaltyId, payload) =>
    api.put(`/penalties/${penaltyId}`, payload),
  updatePenaltyStatus: (penaltyId, status, notes) =>
    api.patch(`/penalties/${penaltyId}/status`, { status, notes }),
  deletePenalty: (penaltyId) => api.delete(`/penalties/${penaltyId}`),

  // ==================== Damage Reports ====================
  getAllDamageReports: () => api.get("/damage-reports"),
  getUnverifiedDamageReports: () => api.get("/damage-reports/unverified"),
  getDamageReportById: (reportId) => api.get(`/damage-reports/${reportId}`),
  getDamageReportsByComponent: (componentId) =>
    api.get(`/damage-reports/component/${componentId}`),
  getDamageReportsByBooking: (bookingId) =>
    api.get(`/damage-reports/booking/${bookingId}`),
  createDamageReport: (payload) => api.post("/damage-reports", payload),
  updateDamageReport: (reportId, payload) =>
    api.put(`/damage-reports/${reportId}`, payload),
  verifyDamageReport: (reportId) =>
    api.patch(`/damage-reports/${reportId}/verify`),
  deleteDamageReport: (reportId) => api.delete(`/damage-reports/${reportId}`),

  // ==================== Waitlist ====================
  getAllWaitlist: () => api.get("/waitlist"),
  getWaitlistByComponent: (componentId) =>
    api.get(`/waitlist/component/${componentId}`),
  updateWaitlistStatus: (waitlistId, status, notes) =>
    api.patch(`/waitlist/${waitlistId}/status`, { status, notes }),
  notifyWaitlistUsers: (componentId) =>
    api.post(`/waitlist/notify/${componentId}`),
  deleteWaitlist: (waitlistId) => api.delete(`/waitlist/${waitlistId}`),
};
