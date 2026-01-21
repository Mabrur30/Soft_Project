const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

// User profile routes
router.get("/profile", auth, userController.getProfile);
router.put("/profile", auth, userController.updateProfile);
router.put("/change-password", auth, userController.changePassword);

// Admin routes for user management
router.get("/", auth, userController.getAllUsers);
router.get("/search", auth, userController.searchUsers);
router.get("/:userId", auth, userController.getUserById);
router.post("/", auth, userController.createUser);
router.put("/:userId", auth, userController.updateUser);
router.patch("/:userId", auth, userController.updateUserPartial);
router.put("/:userId/reset-password", auth, userController.resetUserPassword);
router.delete("/:userId", auth, userController.deleteUser);

module.exports = router;
