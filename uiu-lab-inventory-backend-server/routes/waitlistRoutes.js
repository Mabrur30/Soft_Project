const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const waitlistController = require("../controllers/waitlistController");

// Get current user's waitlist entries
router.get("/my", auth, waitlistController.getMyWaitlist);

// Get all waitlist entries (Admin only)
router.get("/", auth, waitlistController.getAllWaitlist);

// Get waitlist by component
router.get(
  "/component/:componentId",
  auth,
  waitlistController.getWaitlistByComponent,
);

// Get waitlist entry by ID
router.get("/:waitlistId", auth, waitlistController.getWaitlistById);

// Add to waitlist
router.post("/", auth, waitlistController.addToWaitlist);

// Update waitlist entry
router.put("/:waitlistId", auth, waitlistController.updateWaitlist);

// Update waitlist status (Admin only)
router.patch(
  "/:waitlistId/status",
  auth,
  waitlistController.updateWaitlistStatus,
);

// Cancel waitlist entry
router.patch("/:waitlistId/cancel", auth, waitlistController.cancelWaitlist);

// Notify waitlist users for a component (Admin only)
router.post(
  "/notify/:componentId",
  auth,
  waitlistController.notifyWaitlistUsers,
);

// Delete waitlist entry (Admin only)
router.delete("/:waitlistId", auth, waitlistController.deleteWaitlist);

module.exports = router;
