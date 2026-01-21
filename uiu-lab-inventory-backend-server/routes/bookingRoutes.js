const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware"); // User authentication middleware
const bookingController = require("../controllers/bookingController");

// GET - Get current user's bookings
router.get("/my", auth, bookingController.getMyBookings);

// GET - Get pending bookings (Admin only)
router.get("/pending", auth, bookingController.getPendingBookings);

// GET - Get all bookings (Admin only)
router.get("/", auth, bookingController.getAllBookings);

// POST - Create booking
router.post("/", auth, bookingController.createBooking);

// GET - Get all bookings for a user
router.get("/user/:userId", auth, bookingController.getUserBookings);

// GET - Get booking by ID
router.get("/:bookingId", auth, bookingController.getBookingById);

// PUT - Update booking (full update)
router.put("/:bookingId", auth, bookingController.updateBooking);

// PATCH - Update booking status (partial update)
router.patch("/:bookingId", auth, bookingController.updateBookingPartial);

// PATCH - Approve booking (Admin only)
router.patch("/:bookingId/approve", auth, bookingController.approveBooking);

// PATCH - Reject booking (Admin only)
router.patch("/:bookingId/reject", auth, bookingController.rejectBooking);

// PATCH - Return booking
router.patch("/:bookingId/return", auth, bookingController.returnBooking);

// PATCH - Approve return (Admin only)
router.patch(
  "/:bookingId/approve-return",
  auth,
  bookingController.approveReturn,
);

// PATCH - Mark booking as overdue (Admin only)
router.patch("/:bookingId/overdue", auth, bookingController.markOverdue);

// DELETE - Delete booking (Admin only)
router.delete("/:bookingId", auth, bookingController.deleteBooking);

module.exports = router;
