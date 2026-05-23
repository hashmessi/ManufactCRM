const express = require('express');
const { body, param, validationResult } = require('express-validator');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All user routes are protected
router.use(verifyToken);

/**
 * @route   GET /api/users
 * @desc    List all users (admin only)
 * @access  Private / Admin
 */
router.get('/', requireRole('admin'), async (req, res) => {
  const users = await User.find()
    .select('-password')
    .populate('manager', 'name email')
    .sort({ role: 1, name: 1 })
    .lean();

  res.json({ count: users.length, users });
});

/**
 * @route   POST /api/users
 * @desc    Create a new user (admin only)
 * @access  Private / Admin
 */
router.post(
  '/',
  requireRole('admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['admin', 'manager', 'associate'])
      .withMessage('Invalid role'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    // Check for duplicate email
    const existing = await User.findOne({ email: req.body.email });
    if (existing) {
      return res.status(409).json({ message: 'A user with that email already exists' });
    }

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || 'associate',
      target: req.body.target || 0,
      manager: req.body.manager || undefined,
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      target: user.target,
    });
  }
);

/**
 * @route   PATCH /api/users/:id/target
 * @desc    Set monthly revenue target for a user (admin or manager)
 * @access  Private / Admin, Manager
 */
router.patch(
  '/:id/target',
  requireRole('admin', 'manager'),
  [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('target').isNumeric().withMessage('Target must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.target = req.body.target;
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      target: user.target,
    });
  }
);

/**
 * @route   GET /api/users/team
 * @desc    Manager gets their direct reports
 * @access  Private / Manager, Admin
 */
router.get('/team', requireRole('manager', 'admin'), async (req, res) => {
  const filter =
    req.user.role === 'admin' ? {} : { manager: req.user._id };

  const team = await User.find(filter)
    .select('name email role target')
    .sort({ name: 1 })
    .lean();

  res.json({ count: team.length, team });
});

module.exports = router;
