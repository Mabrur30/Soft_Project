const db = require("../models/db");

// Get all waitlist entries (Admin only)
exports.getAllWaitlist = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const query = `
    SELECT w.*, 
           u.full_name, u.email, u.id as student_id,
           c.component_name, c.component_code, c.available_quantity
    FROM waitlist w
    JOIN users u ON w.user_id = u.user_id
    JOIN components c ON w.components_id = c.components_id
    ORDER BY w.requested_date ASC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get waitlist by component
exports.getWaitlistByComponent = (req, res) => {
  const { componentId } = req.params;

  const query = `
    SELECT w.*, 
           u.full_name, u.email, u.id as student_id
    FROM waitlist w
    JOIN users u ON w.user_id = u.user_id
    WHERE w.components_id = ? AND w.status = 'waiting'
    ORDER BY w.requested_date ASC
  `;

  db.query(query, [componentId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get current user's waitlist entries
exports.getMyWaitlist = (req, res) => {
  const userId = req.user.userId;

  const query = `
    SELECT w.*, 
           c.component_name, c.component_code, c.available_quantity
    FROM waitlist w
    JOIN components c ON w.components_id = c.components_id
    WHERE w.user_id = ?
    ORDER BY w.requested_date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get waitlist entry by ID
exports.getWaitlistById = (req, res) => {
  const { waitlistId } = req.params;

  const query = `
    SELECT w.*, 
           u.full_name, u.email, u.id as student_id,
           c.component_name, c.component_code, c.available_quantity
    FROM waitlist w
    JOIN users u ON w.user_id = u.user_id
    JOIN components c ON w.components_id = c.components_id
    WHERE w.waitlist_id = ?
  `;

  db.query(query, [waitlistId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Waitlist entry not found" });

    const entry = results[0];
    // Users can only view their own waitlist entries unless admin
    if (req.user.role !== "admin" && req.user.userId !== entry.user_id) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    res.json(entry);
  });
};

// Add to waitlist
exports.addToWaitlist = (req, res) => {
  const user_id = req.user.userId;
  const {
    components_id,
    requested_quantity,
    estimated_availability_date,
    notes,
  } = req.body;

  // Check if user is already on waitlist for this component
  const checkQuery =
    "SELECT * FROM waitlist WHERE user_id = ? AND components_id = ? AND status = ?";

  db.query(checkQuery, [user_id, components_id, "waiting"], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      return res
        .status(400)
        .json({
          message: "You are already on the waitlist for this component",
        });
    }

    const insertQuery = `
      INSERT INTO waitlist (user_id, components_id, requested_quantity, status, requested_date, estimated_availability_date, notes)
      VALUES (?, ?, ?, 'waiting', NOW(), ?, ?)
    `;

    db.query(
      insertQuery,
      [
        user_id,
        components_id,
        requested_quantity,
        estimated_availability_date,
        notes,
      ],
      (insertErr, insertResults) => {
        if (insertErr)
          return res.status(500).json({ error: insertErr.message });
        res
          .status(201)
          .json({
            message: "Added to waitlist successfully",
            waitlistId: insertResults.insertId,
          });
      },
    );
  });
};

// Update waitlist entry
exports.updateWaitlist = (req, res) => {
  const { waitlistId } = req.params;
  const { requested_quantity, estimated_availability_date, notes } = req.body;

  // First check if the user owns this entry or is admin
  const checkQuery = "SELECT * FROM waitlist WHERE waitlist_id = ?";

  db.query(checkQuery, [waitlistId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Waitlist entry not found" });

    const entry = results[0];
    if (req.user.role !== "admin" && req.user.userId !== entry.user_id) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    const updateQuery = `
      UPDATE waitlist 
      SET requested_quantity = ?, estimated_availability_date = ?, notes = ?
      WHERE waitlist_id = ?
    `;

    db.query(
      updateQuery,
      [requested_quantity, estimated_availability_date, notes, waitlistId],
      (updateErr, updateResults) => {
        if (updateErr)
          return res.status(500).json({ error: updateErr.message });
        res.json({ message: "Waitlist entry updated successfully" });
      },
    );
  });
};

// Update waitlist status (Admin only)
exports.updateWaitlistStatus = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { waitlistId } = req.params;
  const { status, notes } = req.body;

  const notification_sent_date = status === "notified" ? new Date() : null;

  const query = `
    UPDATE waitlist 
    SET status = ?, notification_sent_date = ?, notes = COALESCE(?, notes)
    WHERE waitlist_id = ?
  `;

  db.query(
    query,
    [status, notification_sent_date, notes, waitlistId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.affectedRows === 0)
        return res.status(404).json({ message: "Waitlist entry not found" });

      res.json({ message: "Waitlist status updated successfully" });
    },
  );
};

// Cancel waitlist entry (User can cancel their own)
exports.cancelWaitlist = (req, res) => {
  const { waitlistId } = req.params;

  // First check ownership
  const checkQuery = "SELECT * FROM waitlist WHERE waitlist_id = ?";

  db.query(checkQuery, [waitlistId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Waitlist entry not found" });

    const entry = results[0];
    if (req.user.role !== "admin" && req.user.userId !== entry.user_id) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    const updateQuery = "UPDATE waitlist SET status = ? WHERE waitlist_id = ?";

    db.query(
      updateQuery,
      ["cancelled", waitlistId],
      (updateErr, updateResults) => {
        if (updateErr)
          return res.status(500).json({ error: updateErr.message });
        res.json({ message: "Waitlist entry cancelled successfully" });
      },
    );
  });
};

// Delete waitlist entry (Admin only)
exports.deleteWaitlist = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { waitlistId } = req.params;
  const query = "DELETE FROM waitlist WHERE waitlist_id = ?";

  db.query(query, [waitlistId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0)
      return res.status(404).json({ message: "Waitlist entry not found" });

    res.json({ message: "Waitlist entry deleted successfully" });
  });
};

// Notify users when component becomes available (Admin only)
exports.notifyWaitlistUsers = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { componentId } = req.params;

  const query = `
    UPDATE waitlist 
    SET status = 'notified', notification_sent_date = NOW()
    WHERE components_id = ? AND status = 'waiting'
  `;

  db.query(query, [componentId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      message: `${results.affectedRows} users notified successfully`,
    });
  });
};
