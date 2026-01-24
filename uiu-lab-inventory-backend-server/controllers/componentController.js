const db = require("../models/db"); // Your DB connection
const path = require("path");
const fs = require("fs");

exports.createComponent = (req, res) => {
  console.log("=== createComponent called ===");
  console.log("req.body:", req.body);
  console.log("req.file:", req.file ? req.file.filename : "No file");
  console.log("req.user:", req.user);

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const {
    component_name,
    component_code,
    category,
    description,
    status,
    total_quantity,
    available_quantity,
    damaged_quantity,
    under_maintenance_quantity,
  } = req.body;

  // Get image path if uploaded (store as file path string)
  const imagePath = req.file ? req.file.filename : "";

  console.log("Inserting component:", {
    component_name,
    component_code,
    category,
    description,
    imagePath,
    total_quantity,
    available_quantity,
  });

  const query =
    "INSERT INTO components (component_name, component_code, category, description, images, status, total_quantity, available_quantity, damaged_quantity, under_maintenance_quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  db.query(
    query,
    [
      component_name,
      component_code,
      category,
      description || null,
      imagePath,
      status || "active",
      total_quantity || 0,
      available_quantity || 0,
      damaged_quantity || 0,
      under_maintenance_quantity || 0,
    ],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        if (err.code === "ER_DUP_ENTRY") {
          return res
            .status(400)
            .json({ message: "Component code already exists" });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: "Component created successfully",
        componentId: results.insertId,
      });
    },
  );
};

// Get component image by ID
exports.getComponentImage = (req, res) => {
  const { id } = req.params;
  const query = "SELECT images FROM components WHERE components_id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0 || !results[0].images) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Serve the image file from uploads/components folder
    const imagePath = path.join(
      __dirname,
      "../uploads/components",
      results[0].images,
    );

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: "Image file not found" });
    }

    res.sendFile(imagePath);
  });
};

exports.getComponents = (req, res) => {
  const { category, status, search, available } = req.query;

  let query = "SELECT * FROM components WHERE 1=1";
  const values = [];

  if (category) {
    query += " AND category = ?";
    values.push(category);
  }

  if (status) {
    query += " AND status = ?";
    values.push(status);
  }

  if (search) {
    query +=
      " AND (component_name LIKE ? OR component_code LIKE ? OR description LIKE ?)";
    const searchTerm = `%${search}%`;
    values.push(searchTerm, searchTerm, searchTerm);
  }

  if (available === "true") {
    query += " AND available_quantity > 0";
  }

  query += " ORDER BY component_name ASC";

  db.query(query, values, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

exports.getComponentById = (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM components WHERE components_id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Component not found" });
    }
    res.json(results[0]);
  });
};

// Get component by code
exports.getComponentByCode = (req, res) => {
  const { code } = req.params;
  const query = "SELECT * FROM components WHERE component_code = ?";

  db.query(query, [code], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Component not found" });
    }
    res.json(results[0]);
  });
};

// Get all categories
exports.getCategories = (req, res) => {
  const query =
    "SELECT DISTINCT category FROM components ORDER BY category ASC";

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results.map((r) => r.category));
  });
};

exports.updateComponent = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { id } = req.params;
  const {
    component_name,
    component_code,
    category,
    description,
    status,
    total_quantity,
    available_quantity,
    damaged_quantity,
    under_maintenance_quantity,
  } = req.body;

  // Get image path if uploaded
  const imagePath = req.file ? req.file.filename : null;

  // Build query dynamically based on whether image is uploaded
  let query;
  let params;

  if (imagePath) {
    query =
      "UPDATE components SET component_name = ?, component_code = ?, category = ?, description = ?, status = ?, total_quantity = ?, available_quantity = ?, damaged_quantity = ?, under_maintenance_quantity = ?, images = ? WHERE components_id = ?";
    params = [
      component_name,
      component_code,
      category,
      description,
      status,
      total_quantity,
      available_quantity,
      damaged_quantity,
      under_maintenance_quantity,
      imagePath,
      id,
    ];
  } else {
    query =
      "UPDATE components SET component_name = ?, component_code = ?, category = ?, description = ?, status = ?, total_quantity = ?, available_quantity = ?, damaged_quantity = ?, under_maintenance_quantity = ? WHERE components_id = ?";
    params = [
      component_name,
      component_code,
      category,
      description,
      status,
      total_quantity,
      available_quantity,
      damaged_quantity,
      under_maintenance_quantity,
      id,
    ];
  }

  db.query(query, params, (err, results) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ message: "Component code already exists" });
      }
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Component not found" });
    }
    res.json({ message: "Component updated successfully" });
  });
};

exports.updateComponentPartial = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { id } = req.params;

  const {
    status,
    available_quantity,
    total_quantity,
    component_name,
    component_code,
    category,
    description,
    damaged_quantity,
    under_maintenance_quantity,
  } = req.body;

  const fields = [];
  const values = [];

  if (status !== undefined) {
    fields.push("status = ?");
    values.push(status);
  }

  if (available_quantity !== undefined) {
    fields.push("available_quantity = ?");
    values.push(available_quantity);
  }

  if (total_quantity !== undefined) {
    fields.push("total_quantity = ?");
    values.push(total_quantity);
  }

  if (component_name !== undefined) {
    fields.push("component_name = ?");
    values.push(component_name);
  }

  if (component_code !== undefined) {
    fields.push("component_code = ?");
    values.push(component_code);
  }

  if (category !== undefined) {
    fields.push("category = ?");
    values.push(category);
  }

  if (description !== undefined) {
    fields.push("description = ?");
    values.push(description);
  }

  if (damaged_quantity !== undefined) {
    fields.push("damaged_quantity = ?");
    values.push(damaged_quantity);
  }

  if (under_maintenance_quantity !== undefined) {
    fields.push("under_maintenance_quantity = ?");
    values.push(under_maintenance_quantity);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: "No fields provided to update" });
  }

  const query = `UPDATE components SET ${fields.join(", ")} WHERE components_id = ?`;
  values.push(id);

  db.query(query, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0)
      return res.status(404).json({ message: "Component not found" });

    res.json({ message: "Component updated successfully (PATCH)" });
  });
};

exports.deleteComponent = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { id } = req.params;

  // Check if component has any active bookings
  const checkBookingsQuery =
    "SELECT COUNT(*) as count FROM booking WHERE components_id = ? AND status IN ('requested', 'approved')";

  db.query(checkBookingsQuery, [id], (checkErr, checkResults) => {
    if (checkErr) return res.status(500).json({ error: checkErr.message });

    if (checkResults[0].count > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete component with active bookings" });
    }

    // Check for waitlist entries
    const checkWaitlistQuery =
      "SELECT COUNT(*) as count FROM waitlist WHERE components_id = ? AND status = 'waiting'";

    db.query(checkWaitlistQuery, [id], (waitlistErr, waitlistResults) => {
      if (waitlistErr) {
        // If waitlist table doesn't exist, continue with delete
        if (waitlistErr.code !== "ER_NO_SUCH_TABLE") {
          return res.status(500).json({ error: waitlistErr.message });
        }
      }

      if (waitlistResults && waitlistResults[0]?.count > 0) {
        return res.status(400).json({
          message: "Cannot delete component with active waitlist entries",
        });
      }

      const query = "DELETE FROM components WHERE components_id = ?";

      db.query(query, [id], (err, results) => {
        if (err) {
          // Handle foreign key constraint errors
          if (
            err.code === "ER_ROW_IS_REFERENCED_2" ||
            err.code === "ER_ROW_IS_REFERENCED"
          ) {
            return res.status(400).json({
              message:
                "Cannot delete component. It is referenced by other records (bookings, waitlist, etc.)",
            });
          }
          return res.status(500).json({ error: err.message });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "Component not found" });
        }
        res.json({ message: "Component deleted successfully" });
      });
    });
  });
};
