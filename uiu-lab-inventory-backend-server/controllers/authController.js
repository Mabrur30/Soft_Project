const db = require("../models/db");
const jwt = require("jsonwebtoken");

exports.login = (req, res) => {
  const { email, password } = req.body;

  const passwordStr = String(password || "");

  const query = "SELECT * FROM users WHERE email = ? LIMIT 1";

  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(400).json({ message: "Invalid credentials" });

    const user = results[0];

    // Compare plain text password
    const storedPassword = String(user.password_hash || "");
    if (passwordStr !== storedPassword)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        userId: user.user_id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" },
    );

    // Return token and user info (excluding password)
    res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        department: user.department,
        phone_number: user.phone_number,
      },
    });
  });
};

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret",
    );
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
