const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

// Admin dashboard stats
router.get("/admin/stats", auth, dashboardController.getAdminDashboardStats);

// User dashboard stats
router.get("/user/stats", auth, dashboardController.getUserDashboardStats);

// Recent bookings (Admin only)
router.get("/recent-bookings", auth, dashboardController.getRecentBookings);

// Booking trends (Admin only)
router.get("/booking-trends", auth, dashboardController.getBookingTrends);

// Top borrowed components (Admin only)
router.get(
  "/top-components",
  auth,
  dashboardController.getTopBorrowedComponents,
);

// Category summary
router.get("/category-summary", auth, dashboardController.getCategorySummary);

// Users with most penalties (Admin only)
router.get(
  "/top-penalties",
  auth,
  dashboardController.getUsersWithMostPenalties,
);

// Overdue bookings (Admin only)
router.get("/overdue-bookings", auth, dashboardController.getOverdueBookings);

// Low stock components
router.get("/low-stock", auth, dashboardController.getLowStockComponents);

module.exports = router;
