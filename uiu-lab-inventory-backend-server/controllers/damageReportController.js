const db = require("../models/db");

// Get all damage reports (Admin only)
exports.getAllDamageReports = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const query = `
    SELECT dr.*, 
           c.component_name, c.component_code,
           u.full_name as reported_by_name, u.id as reported_by_student_id,
           v.full_name as verified_by_name
    FROM damage_reports dr
    JOIN components c ON dr.components_id = c.components_id
    JOIN users u ON dr.reported_by_user_id = u.user_id
    LEFT JOIN users v ON dr.verified_by_user_id = v.user_id
    ORDER BY dr.reported_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get damage report by ID
exports.getDamageReportById = (req, res) => {
  const { reportId } = req.params;

  const query = `
    SELECT dr.*, 
           c.component_name, c.component_code,
           u.full_name as reported_by_name, u.id as reported_by_student_id,
           v.full_name as verified_by_name
    FROM damage_reports dr
    JOIN components c ON dr.components_id = c.components_id
    JOIN users u ON dr.reported_by_user_id = u.user_id
    LEFT JOIN users v ON dr.verified_by_user_id = v.user_id
    WHERE dr.damage_report_id = ?
  `;

  db.query(query, [reportId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Damage report not found" });

    res.json(results[0]);
  });
};

// Get damage reports by component
exports.getDamageReportsByComponent = (req, res) => {
  const { componentId } = req.params;

  const query = `
    SELECT dr.*, 
           u.full_name as reported_by_name,
           v.full_name as verified_by_name
    FROM damage_reports dr
    JOIN users u ON dr.reported_by_user_id = u.user_id
    LEFT JOIN users v ON dr.verified_by_user_id = v.user_id
    WHERE dr.components_id = ?
    ORDER BY dr.reported_date DESC
  `;

  db.query(query, [componentId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get damage reports by booking
exports.getDamageReportsByBooking = (req, res) => {
  const { bookingId } = req.params;

  const query = `
    SELECT dr.*, 
           c.component_name,
           u.full_name as reported_by_name,
           v.full_name as verified_by_name
    FROM damage_reports dr
    JOIN components c ON dr.components_id = c.components_id
    JOIN users u ON dr.reported_by_user_id = u.user_id
    LEFT JOIN users v ON dr.verified_by_user_id = v.user_id
    WHERE dr.booking_id = ?
  `;

  db.query(query, [bookingId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Create damage report
exports.createDamageReport = (req, res) => {
  const {
    components_id,
    booking_id,
    damage_type,
    severity,
    description,
    damage_date,
    replacement_required,
  } = req.body;
  const reported_by_user_id = req.user.userId;

  const query = `
    INSERT INTO damage_reports 
    (components_id, booking_id, reported_by_user_id, damage_type, severity, description, damage_date, reported_date, is_verified, replacement_required)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 0, ?)
  `;

  db.query(
    query,
    [
      components_id,
      booking_id,
      reported_by_user_id,
      damage_type,
      severity,
      description,
      damage_date,
      replacement_required || 0,
    ],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      // Update component's damaged quantity
      const updateComponentQuery =
        "UPDATE components SET damaged_quantity = COALESCE(damaged_quantity, 0) + 1 WHERE components_id = ?";
      db.query(updateComponentQuery, [components_id], (updateErr) => {
        if (updateErr)
          console.error(
            "Error updating component damaged quantity:",
            updateErr,
          );
      });

      res
        .status(201)
        .json({
          message: "Damage report created successfully",
          damageReportId: results.insertId,
        });
    },
  );
};

// Update damage report (Admin only)
exports.updateDamageReport = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { reportId } = req.params;
  const {
    damage_type,
    severity,
    description,
    damage_date,
    replacement_required,
  } = req.body;

  const query = `
    UPDATE damage_reports 
    SET damage_type = ?, severity = ?, description = ?, damage_date = ?, replacement_required = ?
    WHERE damage_report_id = ?
  `;

  db.query(
    query,
    [
      damage_type,
      severity,
      description,
      damage_date,
      replacement_required,
      reportId,
    ],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.affectedRows === 0)
        return res.status(404).json({ message: "Damage report not found" });

      res.json({ message: "Damage report updated successfully" });
    },
  );
};

// Verify damage report (Admin only)
exports.verifyDamageReport = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { reportId } = req.params;
  const verified_by_user_id = req.user.userId;

  const query = `
    UPDATE damage_reports 
    SET is_verified = 1, verified_by_user_id = ?, verification_date = NOW()
    WHERE damage_report_id = ?
  `;

  db.query(query, [verified_by_user_id, reportId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0)
      return res.status(404).json({ message: "Damage report not found" });

    res.json({ message: "Damage report verified successfully" });
  });
};

// Delete damage report (Admin only)
exports.deleteDamageReport = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { reportId } = req.params;

  // First get the report to update component
  const getQuery = "SELECT * FROM damage_reports WHERE damage_report_id = ?";

  db.query(getQuery, [reportId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Damage report not found" });

    const report = results[0];

    const deleteQuery = "DELETE FROM damage_reports WHERE damage_report_id = ?";

    db.query(deleteQuery, [reportId], (deleteErr, deleteResults) => {
      if (deleteErr) return res.status(500).json({ error: deleteErr.message });

      // Reduce component's damaged quantity
      const updateComponentQuery =
        "UPDATE components SET damaged_quantity = GREATEST(0, COALESCE(damaged_quantity, 0) - 1) WHERE components_id = ?";
      db.query(updateComponentQuery, [report.components_id], (updateErr) => {
        if (updateErr)
          console.error(
            "Error updating component damaged quantity:",
            updateErr,
          );
      });

      res.json({ message: "Damage report deleted successfully" });
    });
  });
};

// Get unverified damage reports (Admin only)
exports.getUnverifiedReports = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const query = `
    SELECT dr.*, 
           c.component_name, c.component_code,
           u.full_name as reported_by_name, u.id as reported_by_student_id
    FROM damage_reports dr
    JOIN components c ON dr.components_id = c.components_id
    JOIN users u ON dr.reported_by_user_id = u.user_id
    WHERE dr.is_verified = 0
    ORDER BY dr.reported_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
