const express = require('express');
const Notification = require('../models/Notification');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All routes protected
router.use(verifyToken);

/**
 * @route   GET /api/notifications
 * @desc    Get current user's notifications
 * @access  Private
 */
router.get('/', async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .populate('lead', 'companyName stage')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

  res.json({ unreadCount, count: notifications.length, notifications });
});

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch('/:id/read', async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  notification.read = true;
  await notification.save();

  res.json({ message: 'Notification marked as read', notification });
});

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read for the current user
 * @access  Private
 */
router.patch('/read-all', async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { $set: { read: true } }
  );

  res.json({ message: 'All notifications marked as read' });
});

module.exports = router;
