const db = require("../models/db");

// Get current user profile
exports.getProfile = (req, res) => {
  const userId = req.user.userId;

  const query =
    "SELECT user_id, email, full_name, id, role, department, phone_number, total_penalties FROM users WHERE user_id = ?";

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "User not found" });

    res.json(results[0]);
  });
};

// Update current user profile
exports.updateProfile = (req, res) => {
  const userId = req.user.userId;
  const { full_name, phone_number, department } = req.body;

  const query =
    "UPDATE users SET full_name = ?, phone_number = ?, department = ? WHERE user_id = ?";

  db.query(
    query,
    [full_name, phone_number, department, userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.affectedRows === 0)
        return res.status(404).json({ message: "User not found" });

      res.json({ message: "Profile updated successfully" });
    },
  );
};

// Change password
exports.changePassword = (req, res) => {
  const userId = req.user.userId;
  const { currentPassword, newPassword } = req.body;

  const query = "SELECT password_hash FROM users WHERE user_id = ?";

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "User not found" });

    if (String(currentPassword) !== String(results[0].password_hash))
      return res.status(400).json({ message: "Current password is incorrect" });

    const newPasswordStr = String(newPassword);
    const updateQuery = "UPDATE users SET password_hash = ? WHERE user_id = ?";

    db.query(updateQuery, [newPasswordStr, userId], (err, updateResults) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Password changed successfully" });
    });
  });
};

// ==================== ADMIN ENDPOINTS ====================

// Get all users (Admin only)
exports.getAllUsers = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { role, search, department } = req.query;

  let query =
    "SELECT user_id, email, full_name, id, role, department, phone_number, total_penalties FROM users WHERE 1=1";
  const values = [];

  if (role) {
    query += " AND role = ?";
    values.push(role);
  }

  if (department) {
    query += " AND department = ?";
    values.push(department);
  }

  if (search) {
    query += " AND (full_name LIKE ? OR email LIKE ? OR id LIKE ?)";
    const searchTerm = `%${search}%`;
    values.push(searchTerm, searchTerm, searchTerm);
  }

  query += " ORDER BY full_name ASC";

  db.query(query, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get user by ID (Admin only)
exports.getUserById = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { userId } = req.params;
  const query =
    "SELECT user_id, email, full_name, id, role, department, phone_number, total_penalties FROM users WHERE user_id = ?";

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "User not found" });

    res.json(results[0]);
  });
};

// Create user (Admin only - for manual user creation)
exports.createUser = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { email, password, full_name, id, role, department, phone_number } =
    req.body;

  // Check if email or student ID already exists
  const checkQuery = "SELECT * FROM users WHERE email = ? OR id = ?";

  db.query(checkQuery, [email, id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      return res
        .status(400)
        .json({ message: "Email or Student ID already exists" });
    }

    const insertQuery =
      "INSERT INTO users (email, password_hash, full_name, id, role, department, phone_number, total_penalties) VALUES (?, ?, ?, ?, ?, ?, ?, 0)";

    db.query(
      insertQuery,
      [
        email,
        String(password),
        full_name,
        id,
        role || "student",
        department,
        phone_number,
      ],
      (err, insertResults) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({
          message: "User created successfully",
          userId: insertResults.insertId,
        });
      },
    );
  });
};

// Update user (Admin only)
exports.updateUser = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { userId } = req.params;
  const {
    email,
    full_name,
    id,
    role,
    department,
    phone_number,
    total_penalties,
  } = req.body;

  const query =
    "UPDATE users SET email = ?, full_name = ?, id = ?, role = ?, department = ?, phone_number = ?, total_penalties = ? WHERE user_id = ?";

  db.query(
    query,
    [
      email,
      full_name,
      id,
      role,
      department,
      phone_number,
      total_penalties,
      userId,
    ],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.affectedRows === 0)
        return res.status(404).json({ message: "User not found" });

      res.json({ message: "User updated successfully" });
    },
  );
};

// Partial update user (Admin only)
exports.updateUserPartial = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { userId } = req.params;
  const updates = req.body;

  const fields = [];
  const values = [];

  const allowedFields = [
    "email",
    "full_name",
    "id",
    "role",
    "department",
    "phone_number",
    "total_penalties",
  ];

  for (const key in updates) {
    if (allowedFields.includes(key) && updates[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  }

  if (fields.length === 0) {
    return res
      .status(400)
      .json({ message: "No valid fields provided to update" });
  }

  const query = `UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`;
  values.push(userId);

  db.query(query, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated successfully" });
  });
};

// Reset user password (Admin only)
exports.resetUserPassword = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { userId } = req.params;
  const { newPassword } = req.body;

  const hashedPassword = bcrypt.hashSync(String(newPassword), 10);
  const query = "UPDATE users SET password_hash = ? WHERE user_id = ?";

  db.query(query, [hashedPassword, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "Password reset successfully" });
  });
};

// Delete user (Admin only)
exports.deleteUser = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { userId } = req.params;
  const query = "DELETE FROM users WHERE user_id = ?";

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  });
};

// Search users (Admin only)
exports.searchUsers = (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }

  const { query: searchQuery, role, department } = req.query;

  let sql =
    "SELECT user_id, email, full_name, id, role, department, phone_number, total_penalties FROM users WHERE 1=1";
  const values = [];

  if (searchQuery) {
    sql += " AND (full_name LIKE ? OR email LIKE ? OR id LIKE ?)";
    const searchTerm = `%${searchQuery}%`;
    values.push(searchTerm, searchTerm, searchTerm);
  }

  if (role) {
    sql += " AND role = ?";
    values.push(role);
  }

  if (department) {
    sql += " AND department = ?";
    values.push(department);
  }

  db.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
