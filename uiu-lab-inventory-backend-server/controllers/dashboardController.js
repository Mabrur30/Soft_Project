const db = require("../models/db");

// Get dashboard statistics (Admin)
exports.getAdminDashboardStats = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const stats = {};

  // Get counts in parallel using Promise.all
  const queries = [
    // Total users
    new Promise((resolve, reject) => {
      db.query("SELECT COUNT(*) as count FROM users", (err, results) => {
        if (err) reject(err);
        else resolve({ totalUsers: results[0].count });
      });
    }),
    // Total students
    new Promise((resolve, reject) => {
      db.query(
        "SELECT COUNT(*) as count FROM users WHERE role = 'student'",
        (err, results) => {
          if (err) reject(err);
          else resolve({ totalStudents: results[0].count });
        },
      );
    }),
    // Total components
    new Promise((resolve, reject) => {
      db.query("SELECT COUNT(*) as count FROM components", (err, results) => {
        if (err) reject(err);
        else resolve({ totalComponents: results[0].count });
      });
    }),
    // Active components
    new Promise((resolve, reject) => {
      db.query(
        "SELECT COUNT(*) as count FROM components WHERE status = 'active'",
        (err, results) => {
          if (err) reject(err);
          else resolve({ activeComponents: results[0].count });
        },
      );
    }),
    // Booking statistics
    new Promise((resolve, reject) => {
      db.query(
        `
        SELECT 
          COUNT(*) as totalBookings,
          SUM(CASE WHEN status = 'requested' THEN 1 ELSE 0 END) as pendingBookings,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedBookings,
          SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returnedBookings,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedBookings,
          SUM(CASE WHEN is_overdue = 1 THEN 1 ELSE 0 END) as overdueBookings
        FROM booking
      `,
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        },
      );
    }),
    // Penalty statistics
    new Promise((resolve, reject) => {
      db.query(
        `
        SELECT 
          COUNT(*) as totalPenalties,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingPenalties,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as totalPendingAmount
        FROM penalties
      `,
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        },
      );
    }),
    // Waitlist count
    new Promise((resolve, reject) => {
      db.query(
        "SELECT COUNT(*) as count FROM waitlist WHERE status = 'waiting'",
        (err, results) => {
          if (err) reject(err);
          else resolve({ waitlistCount: results[0].count });
        },
      );
    }),
    // Damage reports count
    new Promise((resolve, reject) => {
      db.query(
        "SELECT COUNT(*) as count FROM damage_reports WHERE is_verified = 0",
        (err, results) => {
          if (err) reject(err);
          else resolve({ unverifiedDamageReports: results[0].count });
        },
      );
    }),
    // Low stock components
    new Promise((resolve, reject) => {
      db.query(
        "SELECT COUNT(*) as count FROM components WHERE available_quantity <= 5 AND available_quantity > 0",
        (err, results) => {
          if (err) reject(err);
          else resolve({ lowStockComponents: results[0].count });
        },
      );
    }),
    // Out of stock components
    new Promise((resolve, reject) => {
      db.query(
        "SELECT COUNT(*) as count FROM components WHERE available_quantity = 0",
        (err, results) => {
          if (err) reject(err);
          else resolve({ outOfStockComponents: results[0].count });
        },
      );
    }),
  ];

  Promise.all(queries)
    .then((results) => {
      const combined = Object.assign({}, ...results);
      res.json(combined);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

// Get user dashboard statistics
exports.getUserDashboardStats = (req, res) => {
  const userId = req.user.userId;

  const queries = [
    // User's bookings stats
    new Promise((resolve, reject) => {
      db.query(
        `
        SELECT 
          COUNT(*) as totalBookings,
          SUM(CASE WHEN status = 'requested' THEN 1 ELSE 0 END) as pendingBookings,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as activeBookings,
          SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returnedBookings,
          SUM(CASE WHEN is_overdue = 1 THEN 1 ELSE 0 END) as overdueBookings
        FROM booking WHERE user_id = ?
      `,
        [userId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        },
      );
    }),
    // User's penalties
    new Promise((resolve, reject) => {
      db.query(
        `
        SELECT 
          COUNT(*) as totalPenalties,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingPenalties,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as totalPendingAmount
        FROM penalties WHERE user_id = ?
      `,
        [userId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        },
      );
    }),
    // User's waitlist count
    new Promise((resolve, reject) => {
      db.query(
        "SELECT COUNT(*) as waitlistCount FROM waitlist WHERE user_id = ? AND status = 'waiting'",
        [userId],
        (err, results) => {
          if (err) reject(err);
          else resolve({ waitlistCount: results[0].waitlistCount });
        },
      );
    }),
  ];

  Promise.all(queries)
    .then((results) => {
      const combined = Object.assign({}, ...results);
      res.json(combined);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
};

// Get recent bookings (Admin)
exports.getRecentBookings = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const limit = parseInt(req.query.limit) || 10;

  const query = `
    SELECT b.*, u.full_name, u.id as student_id, c.component_name
    FROM booking b
    JOIN users u ON b.user_id = u.user_id
    JOIN components c ON b.components_id = c.components_id
    ORDER BY b.requested_date DESC
    LIMIT ?
  `;

  db.query(query, [limit], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get booking trends (Admin)
exports.getBookingTrends = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const days = parseInt(req.query.days) || 30;

  const query = `
    SELECT DATE(requested_date) as date, COUNT(*) as count
    FROM booking
    WHERE requested_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    GROUP BY DATE(requested_date)
    ORDER BY date ASC
  `;

  db.query(query, [days], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get top borrowed components (Admin)
exports.getTopBorrowedComponents = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const limit = parseInt(req.query.limit) || 10;

  const query = `
    SELECT c.components_id, c.component_name, c.component_code, c.category,
           COUNT(b.booking_id) as booking_count,
           SUM(b.quantity) as total_quantity_borrowed
    FROM components c
    LEFT JOIN booking b ON c.components_id = b.components_id
    GROUP BY c.components_id, c.component_name, c.component_code, c.category
    ORDER BY booking_count DESC
    LIMIT ?
  `;

  db.query(query, [limit], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get component categories summary (Admin)
exports.getCategorySummary = (req, res) => {
  const query = `
    SELECT category, 
           COUNT(*) as component_count,
           SUM(total_quantity) as total_items,
           SUM(available_quantity) as available_items,
           SUM(damaged_quantity) as damaged_items
    FROM components
    GROUP BY category
    ORDER BY component_count DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get users with most penalties (Admin)
exports.getUsersWithMostPenalties = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const limit = parseInt(req.query.limit) || 10;

  const query = `
    SELECT u.user_id, u.full_name, u.id as student_id, u.email, u.department,
           COUNT(p.penalty_id) as penalty_count,
           SUM(p.amount) as total_penalty_amount
    FROM users u
    JOIN penalties p ON u.user_id = p.user_id
    GROUP BY u.user_id, u.full_name, u.id, u.email, u.department
    ORDER BY total_penalty_amount DESC
    LIMIT ?
  `;

  db.query(query, [limit], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get overdue bookings (Admin)
exports.getOverdueBookings = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const query = `
    SELECT b.*, u.full_name, u.id as student_id, u.email, c.component_name
    FROM booking b
    JOIN users u ON b.user_id = u.user_id
    JOIN components c ON b.components_id = c.components_id
    WHERE b.is_overdue = 1 OR (b.status = 'approved' AND b.expected_return_date < NOW())
    ORDER BY b.expected_return_date ASC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get low stock components
exports.getLowStockComponents = (req, res) => {
  const threshold = parseInt(req.query.threshold) || 5;

  const query = `
    SELECT * FROM components 
    WHERE available_quantity <= ? AND status = 'active'
    ORDER BY available_quantity ASC
  `;

  db.query(query, [threshold], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
