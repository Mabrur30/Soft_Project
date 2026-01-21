const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const damageReportController = require("../controllers/damageReportController");

// Get unverified damage reports (Admin only)
router.get("/unverified", auth, damageReportController.getUnverifiedReports);

// Get all damage reports (Admin only)
router.get("/", auth, damageReportController.getAllDamageReports);

// Get damage reports by component
router.get(
  "/component/:componentId",
  auth,
  damageReportController.getDamageReportsByComponent,
);

// Get damage reports by booking
router.get(
  "/booking/:bookingId",
  auth,
  damageReportController.getDamageReportsByBooking,
);

// Get damage report by ID
router.get("/:reportId", auth, damageReportController.getDamageReportById);

// Create damage report
router.post("/", auth, damageReportController.createDamageReport);

// Update damage report (Admin only)
router.put("/:reportId", auth, damageReportController.updateDamageReport);

// Verify damage report (Admin only)
router.patch(
  "/:reportId/verify",
  auth,
  damageReportController.verifyDamageReport,
);

// Delete damage report (Admin only)
router.delete("/:reportId", auth, damageReportController.deleteDamageReport);

module.exports = router;
