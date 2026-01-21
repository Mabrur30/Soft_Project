const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const penaltyController = require("../controllers/penaltyController");

// Get current user's penalties
router.get("/my", auth, penaltyController.getMyPenalties);

// Get penalty statistics (Admin only)
router.get("/stats", auth, penaltyController.getPenaltyStats);

// Get all penalties (Admin only)
router.get("/", auth, penaltyController.getAllPenalties);

// Get penalties by user ID
router.get("/user/:userId", auth, penaltyController.getPenaltiesByUser);

// Get penalty by ID
router.get("/:penaltyId", auth, penaltyController.getPenaltyById);

// Create penalty (Admin only)
router.post("/", auth, penaltyController.createPenalty);

// Update penalty (Admin only)
router.put("/:penaltyId", auth, penaltyController.updatePenalty);

// Update penalty status (Admin only)
router.patch("/:penaltyId/status", auth, penaltyController.updatePenaltyStatus);

// Delete penalty (Admin only)
router.delete("/:penaltyId", auth, penaltyController.deletePenalty);

module.exports = router;
