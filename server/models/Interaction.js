const mongoose = require('mongoose');

/**
 * @typedef {Object} InteractionDocument
 * @property {mongoose.Types.ObjectId} lead
 * @property {string} type - call, email, meeting, whatsapp, other
 * @property {Date} date
 * @property {number} duration - Duration in minutes (for calls)
 * @property {string} outcome
 * @property {string} nextAction
 * @property {mongoose.Types.ObjectId} loggedBy
 */

const INTERACTION_TYPES = ['call', 'email', 'meeting', 'whatsapp', 'other'];

const interactionSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead reference is required'],
    },
    type: {
      type: String,
      enum: { values: INTERACTION_TYPES, message: '{VALUE} is not a valid interaction type' },
      required: [true, 'Interaction type is required'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: Number,
      min: [0, 'Duration cannot be negative'],
    },
    outcome: {
      type: String,
      trim: true,
    },
    nextAction: {
      type: String,
      trim: true,
    },
    loggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Logged-by user is required'],
    },
  },
  { timestamps: true }
);

// Indexes for common query patterns
interactionSchema.index({ lead: 1 });
interactionSchema.index({ loggedBy: 1 });
interactionSchema.index({ lead: 1, date: -1 });

module.exports = mongoose.model('Interaction', interactionSchema);
module.exports.INTERACTION_TYPES = INTERACTION_TYPES;
