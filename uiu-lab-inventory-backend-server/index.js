const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Vite dev server
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// DB connection
require("./models/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const componentRoutes = require("./routes/componentRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");
const penaltyRoutes = require("./routes/penaltyRoutes");
const damageReportRoutes = require("./routes/damageReportRoutes");
const waitlistRoutes = require("./routes/waitlistRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Use routes
app.use("/", authRoutes);
app.use("/api/components", componentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/penalties", penaltyRoutes);
app.use("/api/damage-reports", damageReportRoutes);
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("UIU Lab Inventory API is running");
});

// Handle 404 errors for non-existing routes
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
