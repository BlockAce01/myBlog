const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Authentication middleware for JWT validation
 * Extracts user information from JWT and attaches to request object
 */
const authenticateToken = (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    // Verify the token using the same secret as the auth service
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user information to request object
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {
  authenticateToken
};
