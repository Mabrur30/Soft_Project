const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Bearer TOKEN

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_jwt_secret'  
    );

    req.user = decoded;  

    // Allow both admin and student (if needed)
    if (req.user.role !== 'admin' && req.user.role !== 'student') {
      return res.status(403).json({ message: 'Forbidden: Admins and students only' });
    }

    next();  
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
