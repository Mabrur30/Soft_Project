const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const componentController = require("../controllers/componentController");

// Get all categories
router.get("/categories", componentController.getCategories);

// Get all components (with optional filters)
router.get("/", componentController.getComponents);

// Get component image by ID (public - no auth needed)
router.get("/:id/image", componentController.getComponentImage);

// Get component by code
router.get("/code/:code", componentController.getComponentByCode);

// Get component by ID
router.get("/:id", componentController.getComponentById);

// Create component (Admin only) - with image upload
router.post(
  "/",
  auth,
  upload.single("image"),
  componentController.createComponent,
);

// Update component (Admin only) - with image upload
router.put(
  "/:id",
  auth,
  upload.single("image"),
  componentController.updateComponent,
);

// Update component (Only admin can update specific fields like status, available_quantity)
router.patch("/:id", auth, componentController.updateComponentPartial); // Partial update (PATCH)

// Delete component (Admin only)
router.delete("/:id", auth, componentController.deleteComponent);

module.exports = router;
