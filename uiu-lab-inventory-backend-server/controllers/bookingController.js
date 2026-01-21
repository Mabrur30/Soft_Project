const db = require("../models/db");

// Create Booking - POST
exports.createBooking = (req, res) => {
  const user_id = req.user.userId; // Get user_id from authenticated user
  const { components_id, quantity, expected_return_date, reason } = req.body;

  // First check if component has enough available quantity
  const checkQuery =
    "SELECT available_quantity, component_name FROM components WHERE components_id = ?";

  db.query(checkQuery, [components_id], (checkErr, checkResults) => {
    if (checkErr) return res.status(500).json({ error: checkErr.message });
    if (checkResults.length === 0)
      return res.status(404).json({ message: "Component not found" });

    const component = checkResults[0];
    if (component.available_quantity < quantity) {
      return res.status(400).json({
        message: "Insufficient quantity available",
        available: component.available_quantity,
        requested: quantity,
      });
    }

    const query =
      "INSERT INTO booking (user_id, components_id, quantity, status, requested_date, expected_return_date, reason) VALUES (?, ?, ?, ?, NOW(), ?, ?)";

    db.query(
      query,
      [
        user_id,
        components_id,
        quantity,
        "requested",
        expected_return_date,
        reason,
      ],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({
          message: "Booking created successfully",
          bookingId: results.insertId,
        });
      },
    );
  });
};

// Get All Bookings (Admin only)
exports.getAllBookings = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { status, startDate, endDate } = req.query;

  let query = `
    SELECT b.*, u.full_name, u.id as student_id, u.email, 
           c.component_name, c.component_code, c.category
    FROM booking b
    JOIN users u ON b.user_id = u.user_id
    JOIN components c ON b.components_id = c.components_id
    WHERE 1=1
  `;
  const values = [];

  if (status) {
    query += " AND b.status = ?";
    values.push(status);
  }

  if (startDate) {
    query += " AND b.requested_date >= ?";
    values.push(startDate);
  }

  if (endDate) {
    query += " AND b.requested_date <= ?";
    values.push(endDate);
  }

  query += " ORDER BY b.requested_date DESC";

  db.query(query, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get All Bookings of a User - GET
exports.getUserBookings = (req, res) => {
  const { userId } = req.params;

  // Users can only view their own bookings unless admin
  if (req.user.role !== "admin" && req.user.userId !== parseInt(userId)) {
    return res.status(403).json({ message: "Forbidden: Access denied" });
  }

  const query = `
    SELECT b.*, c.component_name, c.component_code, c.category
    FROM booking b
    JOIN components c ON b.components_id = c.components_id
    WHERE b.user_id = ?
    ORDER BY b.requested_date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get current user's bookings
exports.getMyBookings = (req, res) => {
  const userId = req.user.userId;

  const query = `
    SELECT b.*, c.component_name, c.component_code, c.category
    FROM booking b
    JOIN components c ON b.components_id = c.components_id
    WHERE b.user_id = ?
    ORDER BY b.requested_date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get Booking by ID - GET
exports.getBookingById = (req, res) => {
  const { bookingId } = req.params;

  const query = `
    SELECT b.*, u.full_name, u.id as student_id, u.email,
           c.component_name, c.component_code, c.category
    FROM booking b
    JOIN users u ON b.user_id = u.user_id
    JOIN components c ON b.components_id = c.components_id
    WHERE b.booking_id = ?
  `;

  db.query(query, [bookingId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Booking not found" });

    const booking = results[0];
    // Users can only view their own bookings unless admin
    if (req.user.role !== "admin" && req.user.userId !== booking.user_id) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    res.json(booking);
  });
};

// Approve booking (Admin only)
exports.approveBooking = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { bookingId } = req.params;

  // First get the booking details
  const getQuery = "SELECT * FROM booking WHERE booking_id = ?";

  db.query(getQuery, [bookingId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Booking not found" });

    const booking = results[0];
    if (booking.status !== "requested") {
      return res
        .status(400)
        .json({ message: "Booking is not in requested status" });
    }

    // Check available quantity
    const checkQuery =
      "SELECT available_quantity FROM components WHERE components_id = ?";

    db.query(checkQuery, [booking.components_id], (checkErr, checkResults) => {
      if (checkErr) return res.status(500).json({ error: checkErr.message });

      if (checkResults[0].available_quantity < booking.quantity) {
        return res
          .status(400)
          .json({ message: "Insufficient quantity available" });
      }

      // Update booking status
      const updateBookingQuery =
        "UPDATE booking SET status = ? WHERE booking_id = ?";

      db.query(updateBookingQuery, ["approved", bookingId], (updateErr) => {
        if (updateErr)
          return res.status(500).json({ error: updateErr.message });

        // Reduce available quantity
        const updateComponentQuery =
          "UPDATE components SET available_quantity = available_quantity - ? WHERE components_id = ?";

        db.query(
          updateComponentQuery,
          [booking.quantity, booking.components_id],
          (compErr) => {
            if (compErr)
              console.error("Error updating component quantity:", compErr);
          },
        );

        res.json({ message: "Booking approved successfully" });
      });
    });
  });
};

// Reject booking (Admin only)
exports.rejectBooking = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { bookingId } = req.params;
  const { reason } = req.body;

  const query =
    'UPDATE booking SET status = ?, reason = CONCAT(COALESCE(reason, ""), " | Rejection: ", ?) WHERE booking_id = ? AND status = ?';

  db.query(
    query,
    ["rejected", reason || "No reason provided", bookingId, "requested"],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.affectedRows === 0)
        return res
          .status(404)
          .json({ message: "Booking not found or not in requested status" });

      res.json({ message: "Booking rejected successfully" });
    },
  );
};

// Return booking (Student requests return - sets to return_pending)
exports.returnBooking = (req, res) => {
  const { bookingId } = req.params;

  // First get the booking
  const getQuery = "SELECT * FROM booking WHERE booking_id = ?";

  db.query(getQuery, [bookingId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Booking not found" });

    const booking = results[0];

    // Only admin or the booking owner can request return
    if (req.user.role !== "admin" && req.user.userId !== booking.user_id) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    if (booking.status !== "approved") {
      return res
        .status(400)
        .json({ message: "Booking is not in approved status" });
    }

    // Update booking status to return_pending (awaiting admin approval)
    const updateQuery = "UPDATE booking SET status = ? WHERE booking_id = ?";

    db.query(updateQuery, ["return_pending", bookingId], (updateErr) => {
      if (updateErr) return res.status(500).json({ error: updateErr.message });

      // Do NOT restore quantity yet - wait for admin approval
      res.json({
        message: "Return request submitted. Awaiting admin approval.",
      });
    });
  });
};

// Approve return (Admin only - marks as returned and restores quantity)
exports.approveReturn = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { bookingId } = req.params;

  // First get the booking
  const getQuery = "SELECT * FROM booking WHERE booking_id = ?";

  db.query(getQuery, [bookingId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Booking not found" });

    const booking = results[0];

    if (booking.status !== "return_pending") {
      return res
        .status(400)
        .json({ message: "Booking is not in return pending status" });
    }

    // Update booking status to returned
    const updateQuery =
      "UPDATE booking SET status = ?, actual_return_date = NOW() WHERE booking_id = ?";

    db.query(updateQuery, ["returned", bookingId], (updateErr) => {
      if (updateErr) return res.status(500).json({ error: updateErr.message });

      // Restore available quantity
      const restoreQuery =
        "UPDATE components SET available_quantity = available_quantity + ? WHERE components_id = ?";

      db.query(
        restoreQuery,
        [booking.quantity, booking.components_id],
        (restoreErr) => {
          if (restoreErr)
            console.error("Error restoring component quantity:", restoreErr);
        },
      );

      res.json({ message: "Return approved. Component quantity restored." });
    });
  });
};

// Mark booking as overdue (Admin only) - Also creates an overdue penalty
exports.markOverdue = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { bookingId } = req.params;
  const { penaltyAmount } = req.body; // Optional: custom penalty amount

  // First get the booking details
  const getBookingQuery = `
    SELECT b.*, u.user_id, c.component_name 
    FROM booking b
    JOIN users u ON b.user_id = u.user_id
    JOIN components c ON b.components_id = c.components_id
    WHERE b.booking_id = ? AND b.status = 'approved'
  `;

  db.query(getBookingQuery, [bookingId], (err, bookingResults) => {
    if (err) return res.status(500).json({ error: err.message });
    if (bookingResults.length === 0) {
      return res
        .status(404)
        .json({ message: "Booking not found or not in approved status" });
    }

    const booking = bookingResults[0];

    // Check if already marked as overdue
    if (booking.is_overdue === 1) {
      return res
        .status(400)
        .json({ message: "Booking is already marked as overdue" });
    }

    // Calculate days overdue
    const expectedReturn = new Date(booking.expected_return_date);
    const today = new Date();
    const daysOverdue = Math.max(
      1,
      Math.ceil((today - expectedReturn) / (1000 * 60 * 60 * 24)),
    );

    // Calculate penalty: ৳50 per day per item (or use custom amount)
    const calculatedAmount =
      penaltyAmount || 50 * daysOverdue * booking.quantity;

    // Update booking to mark as overdue
    const updateQuery =
      "UPDATE booking SET is_overdue = 1 WHERE booking_id = ?";

    db.query(updateQuery, [bookingId], (updateErr) => {
      if (updateErr) return res.status(500).json({ error: updateErr.message });

      // Create penalty record
      const penaltyQuery = `
        INSERT INTO penalties (user_id, booking_id, penalty_type, amount, status, due_date, notes)
        VALUES (?, ?, 'overdue', ?, 'pending', DATE_ADD(NOW(), INTERVAL 7 DAY), ?)
      `;

      const penaltyNotes = `Late return penalty for ${booking.component_name}. ${daysOverdue} day(s) overdue.`;

      db.query(
        penaltyQuery,
        [booking.user_id, bookingId, calculatedAmount, penaltyNotes],
        (penaltyErr, penaltyResults) => {
          if (penaltyErr) {
            console.error("Error creating penalty:", penaltyErr);
            // Still return success for the overdue mark, but note penalty creation failed
            return res.json({
              message: "Booking marked as overdue, but penalty creation failed",
              penaltyError: penaltyErr.message,
            });
          }

          // Update user's total penalties
          const updateUserQuery =
            "UPDATE users SET total_penalties = COALESCE(total_penalties, 0) + ? WHERE user_id = ?";
          db.query(
            updateUserQuery,
            [calculatedAmount, booking.user_id],
            (userErr) => {
              if (userErr)
                console.error("Error updating user penalties:", userErr);
            },
          );

          res.json({
            message: "Booking marked as overdue and penalty created",
            penaltyId: penaltyResults.insertId,
            penaltyAmount: calculatedAmount,
            daysOverdue: daysOverdue,
          });
        },
      );
    });
  });
};

// Get pending booking requests (Admin only)
exports.getPendingBookings = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const query = `
    SELECT b.*, u.full_name, u.id as student_id, u.email, u.department,
           c.component_name, c.component_code, c.category, c.available_quantity
    FROM booking b
    JOIN users u ON b.user_id = u.user_id
    JOIN components c ON b.components_id = c.components_id
    WHERE b.status = 'requested'
    ORDER BY b.requested_date ASC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Update Booking Complete Update
exports.updateBooking = (req, res) => {
  const { bookingId } = req.params;
  const {
    user_id,
    components_id,
    quantity,
    status,
    expected_return_date,
    reason,
  } = req.body;

  const query =
    "UPDATE booking SET user_id = ?, components_id = ?, quantity = ?, status = ?, expected_return_date = ?, reason = ? WHERE booking_id = ?";

  db.query(
    query,
    [
      user_id,
      components_id,
      quantity,
      status,
      expected_return_date,
      reason,
      bookingId,
    ],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json({ message: "Booking updated successfully" });
    },
  );
};

// Update Booking Status PATCH
exports.updateBookingPartial = (req, res) => {
  const { bookingId } = req.params;
  const updates = req.body;

  const fields = [];
  const values = [];

  for (const key in updates) {
    if (updates.hasOwnProperty(key) && updates[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: "No fields provided to update" });
  }

  const query = `UPDATE booking SET ${fields.join(", ")} WHERE booking_id = ?`;
  values.push(bookingId);

  db.query(query, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0)
      return res.status(404).json({ message: "Booking not found" });

    res.json({
      message: "Booking updated successfully",
      updatedFields: Object.keys(updates),
    });
  });
};

// Delete Booking

exports.deleteBooking = (req, res) => {
  const { bookingId } = req.params;

  const query = "DELETE FROM booking WHERE booking_id = ?";

  db.query(query, [bookingId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking deleted successfully" });
  });
};
