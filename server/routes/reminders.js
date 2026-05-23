const express = require('express');
const { param, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const Interaction = require('../models/Interaction');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All reminder routes are protected
router.use(verifyToken);

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/**
 * Build a role-scoped filter for leads.
 */
async function buildLeadScopeFilter(user) {
  if (user.role === 'admin') return {};
  if (user.role === 'manager') {
    const teamMembers = await User.find({ manager: user._id }).select('_id');
    const teamIds = teamMembers.map((m) => m._id);
    teamIds.push(user._id);
    return { assignedTo: { $in: teamIds } };
  }
  return { assignedTo: user._id };
}

/* ------------------------------------------------------------------ */
/*  Routes                                                            */
/* ------------------------------------------------------------------ */

/**
 * @route   GET /api/reminders/overdue
 * @desc    Leads with nextFollowUp in the past (overdue), role-scoped
 * @access  Private
 */
router.get('/overdue', async (req, res) => {
  const scopeFilter = await buildLeadScopeFilter(req.user);

  const leads = await Lead.find({
    ...scopeFilter,
    nextFollowUp: { $lt: new Date() },
    stage: { $nin: ['Won', 'Lost'] }, // exclude closed leads
  })
    .populate('assignedTo', 'name email')
    .sort({ nextFollowUp: 1 })
    .lean();

  res.json({ count: leads.length, leads });
});

/**
 * @route   GET /api/reminders/stale
 * @desc    Leads with no interaction in the last 7 days, role-scoped
 * @access  Private
 */
router.get('/stale', async (req, res) => {
  const scopeFilter = await buildLeadScopeFilter(req.user);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Find leads that have had zero interactions since 7 days ago
  // Step 1: Get leads with recent interactions
  const activeLeadIds = await Interaction.distinct('lead', {
    date: { $gte: sevenDaysAgo },
  });

  // Step 2: Find leads NOT in that set, excluding Won/Lost
  const staleLeads = await Lead.find({
    ...scopeFilter,
    _id: { $nin: activeLeadIds },
    stage: { $nin: ['Won', 'Lost'] },
  })
    .populate('assignedTo', 'name email')
    .sort({ updatedAt: 1 })
    .lean();

  res.json({ count: staleLeads.length, leads: staleLeads });
});

/**
 * @route   GET /api/reminders/notifications
 * @desc    Current user's notifications, sorted by date desc
 * @access  Private
 */
router.get('/notifications', async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .populate('lead', 'companyName stage')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

  res.json({ unreadCount, count: notifications.length, notifications });
});

/**
 * @route   PATCH /api/reminders/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.patch(
  '/notifications/:id/read',
  [param('id').isMongoId().withMessage('Invalid notification ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id, // ensure ownership
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  }
);

module.exports = router;
