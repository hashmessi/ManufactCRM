const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT from Authorization header and attach user to req.
 * Expects header: Authorization: Bearer <token>
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorised — no token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user without password — we only need id, name, email, role, target
    const user = await User.findById(decoded.id).select('name email role target manager');
    if (!user) {
      return res.status(401).json({ message: 'Not authorised — user no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired — please log in again' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    next(err);
  }
};

/**
 * Higher-order middleware that restricts access to the given roles.
 * Must be used AFTER verifyToken.
 * @param {...string} roles - Allowed roles, e.g. 'admin', 'manager'
 * @returns {import('express').RequestHandler}
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorised' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied — requires one of: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
