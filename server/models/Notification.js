const mongoose = require('mongoose');

/**
 * @typedef {Object} NotificationDocument
 * @property {mongoose.Types.ObjectId} user - Recipient user
 * @property {string} type - Notification category
 * @property {mongoose.Types.ObjectId} lead - Related lead (optional)
 * @property {string} message
 * @property {boolean} read
 */

const NOTIFICATION_TYPES = ['follow_up_due', 'stale_lead', 'target_alert', 'lead_assigned'];

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    type: {
      type: String,
      enum: { values: NOTIFICATION_TYPES, message: '{VALUE} is not a valid notification type' },
      required: [true, 'Notification type is required'],
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for fetching unread notifications per user
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
