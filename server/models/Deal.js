const mongoose = require('mongoose');

/**
 * @typedef {Object} DealDocument
 * @property {mongoose.Types.ObjectId} lead
 * @property {mongoose.Types.ObjectId} closedBy
 * @property {number} revenue - Actual closed revenue in INR
 * @property {number} expectedValue - Originally expected value
 * @property {Date} closedAt
 * @property {string} month - YYYY-MM format for aggregation
 * @property {string} notes
 */

const dealSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead reference is required'],
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Closed-by user is required'],
    },
    revenue: {
      type: Number,
      required: [true, 'Revenue amount is required'],
      min: [0, 'Revenue cannot be negative'],
    },
    expectedValue: {
      type: Number,
      min: [0, 'Expected value cannot be negative'],
    },
    closedAt: {
      type: Date,
      default: Date.now,
    },
    month: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

/**
 * Pre-save hook — auto-compute month from closedAt as YYYY-MM.
 * Mongoose 9: async function, NO next() parameter.
 */
dealSchema.pre('save', async function () {
  if (this.closedAt) {
    const d = new Date(this.closedAt);
    const year = d.getFullYear();
    const mon = String(d.getMonth() + 1).padStart(2, '0');
    this.month = `${year}-${mon}`;
  }
});

// Index for monthly aggregation queries
dealSchema.index({ month: 1 });
dealSchema.index({ closedBy: 1 });
dealSchema.index({ closedBy: 1, month: 1 });

module.exports = mongoose.model('Deal', dealSchema);
