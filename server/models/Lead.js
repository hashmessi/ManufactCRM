const mongoose = require('mongoose');

/**
 * @typedef {Object} LeadDocument
 * @property {string} companyName
 * @property {string} industry
 * @property {Object} contactPerson
 * @property {string} stage - Pipeline stage
 * @property {number} dealValue - Estimated deal value in INR
 * @property {number} score - Computed lead score (0–100)
 * @property {Object} scoreBreakdown - Per-factor breakdown
 * @property {mongoose.Types.ObjectId} assignedTo
 * @property {string} source
 * @property {Date} nextFollowUp
 * @property {boolean} proposalSent
 * @property {string} notes
 * @property {Date} stageChangedAt
 */

const PIPELINE_STAGES = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
];

const LEAD_SOURCES = [
  'referral',
  'cold_outreach',
  'inbound',
  'exhibition',
  'other',
  'Website',
  'Referral',
  'Cold Call',
  'Exhibition',
  'LinkedIn',
  'IndiaMart',
  'TradeIndia',
  'Other'
];

const leadSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    contactPerson: {
      name: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
      designation: { type: String, trim: true },
    },
    stage: {
      type: String,
      enum: { values: PIPELINE_STAGES, message: '{VALUE} is not a valid stage' },
      default: 'New',
    },
    dealValue: {
      type: Number,
      default: 0,
      min: [0, 'Deal value cannot be negative'],
    },
    score: {
      type: Number,
      default: 0,
    },
    scoreBreakdown: {
      type: Object,
      default: {},
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lead must be assigned to a user'],
    },
    source: {
      type: String,
      enum: { values: LEAD_SOURCES, message: '{VALUE} is not a valid source' },
    },
    nextFollowUp: {
      type: Date,
    },
    proposalSent: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
    stageChangedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for common query patterns
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ stage: 1 });
leadSchema.index({ score: -1 });
leadSchema.index({ assignedTo: 1, stage: 1 });

module.exports = mongoose.model('Lead', leadSchema);
module.exports.PIPELINE_STAGES = PIPELINE_STAGES;
module.exports.LEAD_SOURCES = LEAD_SOURCES;
