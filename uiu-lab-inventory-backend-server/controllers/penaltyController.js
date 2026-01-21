const db = require("../models/db");

// Get all penalties (Admin only)
exports.getAllPenalties = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const query = `
    SELECT p.*, u.full_name, u.email, u.id as student_id, 
           b.components_id, c.component_name
    FROM penalties p
    JOIN users u ON p.user_id = u.user_id
    JOIN booking b ON p.booking_id = b.booking_id
    LEFT JOIN components c ON b.components_id = c.components_id
    ORDER BY p.due_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get penalties by user ID
exports.getPenaltiesByUser = (req, res) => {
  const { userId } = req.params;

  // Users can only view their own penalties unless admin
  if (req.user.role !== "admin" && req.user.userId !== parseInt(userId)) {
    return res.status(403).json({ message: "Forbidden: Access denied" });
  }

  const query = `
    SELECT p.*, b.components_id, c.component_name
    FROM penalties p
    JOIN booking b ON p.booking_id = b.booking_id
    LEFT JOIN components c ON b.components_id = c.components_id
    WHERE p.user_id = ?
    ORDER BY p.due_date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get current user's penalties
exports.getMyPenalties = (req, res) => {
  const userId = req.user.userId;

  const query = `
    SELECT p.*, b.components_id, c.component_name
    FROM penalties p
    JOIN booking b ON p.booking_id = b.booking_id
    LEFT JOIN components c ON b.components_id = c.components_id
    WHERE p.user_id = ?
    ORDER BY p.due_date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get penalty by ID
exports.getPenaltyById = (req, res) => {
  const { penaltyId } = req.params;

  const query = `
    SELECT p.*, u.full_name, u.email, u.id as student_id,
           b.components_id, c.component_name
    FROM penalties p
    JOIN users u ON p.user_id = u.user_id
    JOIN booking b ON p.booking_id = b.booking_id
    LEFT JOIN components c ON b.components_id = c.components_id
    WHERE p.penalty_id = ?
  `;

  db.query(query, [penaltyId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Penalty not found" });

    const penalty = results[0];
    // Users can only view their own penalties unless admin
    if (req.user.role !== "admin" && req.user.userId !== penalty.user_id) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    res.json(penalty);
  });
};

// Create penalty (Admin only)
exports.createPenalty = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const {
    user_id,
    booking_id,
    damage_report_id,
    penalty_type,
    amount,
    due_date,
    notes,
  } = req.body;

  // Validate required fields
  if (!user_id || !booking_id || !penalty_type || !amount) {
    return res.status(400).json({
      message:
        "Missing required fields: user_id, booking_id, penalty_type, and amount are required",
    });
  }

  // Build query dynamically based on whether damage_report_id is provided
  let query;
  let params;

  if (damage_report_id) {
    query = `
      INSERT INTO penalties (user_id, booking_id, damage_report_id, penalty_type, amount, status, due_date, notes, penalty_date)
      VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, NOW())
    `;
    params = [
      user_id,
      booking_id,
      damage_report_id,
      penalty_type,
      amount,
      due_date || null,
      notes || null,
    ];
  } else {
    query = `
      INSERT INTO penalties (user_id, booking_id, penalty_type, amount, status, due_date, notes, penalty_date)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, NOW())
    `;
    params = [
      user_id,
      booking_id,
      penalty_type,
      amount,
      due_date || null,
      notes || null,
    ];
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error creating penalty:", err);
      return res.status(500).json({ error: err.message });
    }

    // Update user's total penalties
    const updateUserQuery =
      "UPDATE users SET total_penalties = COALESCE(total_penalties, 0) + ? WHERE user_id = ?";
    db.query(updateUserQuery, [amount, user_id], (updateErr) => {
      if (updateErr) console.error("Error updating user penalties:", updateErr);
    });

    res.status(201).json({
      message: "Penalty created successfully",
      penaltyId: results.insertId,
    });
  });
};

// Update penalty (Admin only)
exports.updatePenalty = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { penaltyId } = req.params;
  const { penalty_type, amount, status, due_date, paid_date, notes } = req.body;

  const query = `
    UPDATE penalties 
    SET penalty_type = ?, amount = ?, status = ?, due_date = ?, paid_date = ?, notes = ?
    WHERE penalty_id = ?
  `;

  db.query(
    query,
    [penalty_type, amount, status, due_date, paid_date, notes, penaltyId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.affectedRows === 0)
        return res.status(404).json({ message: "Penalty not found" });

      res.json({ message: "Penalty updated successfully" });
    },
  );
};

// Update penalty status (Admin only) - for marking as paid/waived
exports.updatePenaltyStatus = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { penaltyId } = req.params;
  const { status, notes } = req.body;

  // First get the penalty details
  const getQuery = "SELECT * FROM penalties WHERE penalty_id = ?";

  db.query(getQuery, [penaltyId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Penalty not found" });

    const penalty = results[0];
    const paid_date = status === "paid" ? new Date() : null;

    const updateQuery =
      "UPDATE penalties SET status = ?, paid_date = ?, notes = ? WHERE penalty_id = ?";

    db.query(
      updateQuery,
      [status, paid_date, notes || penalty.notes, penaltyId],
      (updateErr, updateResults) => {
        if (updateErr)
          return res.status(500).json({ error: updateErr.message });

        // If paid or waived, reduce user's total penalties
        if (
          (status === "paid" || status === "waived") &&
          penalty.status === "pending"
        ) {
          const reduceQuery =
            "UPDATE users SET total_penalties = GREATEST(0, COALESCE(total_penalties, 0) - ?) WHERE user_id = ?";
          db.query(
            reduceQuery,
            [penalty.amount, penalty.user_id],
            (reduceErr) => {
              if (reduceErr)
                console.error("Error updating user penalties:", reduceErr);
            },
          );
        }

        res.json({ message: "Penalty status updated successfully" });
      },
    );
  });
};

// Delete penalty (Admin only)
exports.deletePenalty = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { penaltyId } = req.params;

  // First get the penalty to update user's total
  const getQuery = "SELECT * FROM penalties WHERE penalty_id = ?";

  db.query(getQuery, [penaltyId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Penalty not found" });

    const penalty = results[0];

    const deleteQuery = "DELETE FROM penalties WHERE penalty_id = ?";

    db.query(deleteQuery, [penaltyId], (deleteErr, deleteResults) => {
      if (deleteErr) return res.status(500).json({ error: deleteErr.message });

      // Reduce user's total penalties if it was pending
      if (penalty.status === "pending") {
        const reduceQuery =
          "UPDATE users SET total_penalties = GREATEST(0, COALESCE(total_penalties, 0) - ?) WHERE user_id = ?";
        db.query(
          reduceQuery,
          [penalty.amount, penalty.user_id],
          (reduceErr) => {
            if (reduceErr)
              console.error("Error updating user penalties:", reduceErr);
          },
        );
      }

      res.json({ message: "Penalty deleted successfully" });
    });
  });
};

// Get penalty statistics (Admin only)
exports.getPenaltyStats = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const query = `
    SELECT 
      COUNT(*) as total_penalties,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
      SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
      SUM(CASE WHEN status = 'waived' THEN 1 ELSE 0 END) as waived_count,
      SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending_amount,
      SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid_amount,
      SUM(CASE WHEN penalty_type = 'overdue' THEN 1 ELSE 0 END) as overdue_count,
      SUM(CASE WHEN penalty_type = 'damage' THEN 1 ELSE 0 END) as damage_count
    FROM penalties
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
};
