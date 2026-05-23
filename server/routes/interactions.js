const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Interaction = require('../models/Interaction');
const Lead = require('../models/Lead');
const { computeLeadScore } = require('../utils/scoreEngine');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All interaction routes are protected
router.use(verifyToken);

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/**
 * Recompute and persist the lead score (mirrors leads.js helper).
 * @param {string} leadId
 */
async function recomputeLeadScore(leadId) {
  const lead = await Lead.findById(leadId);
  if (!lead) return;

  const interactionCount = await Interaction.countDocuments({ lead: leadId });
  const firstInteraction = await Interaction.findOne({ lead: leadId }).sort({ date: 1 }).select('date');
  if (firstInteraction) {
    lead._firstInteractionDate = firstInteraction.date;
  }

  const maxDealResult = await Lead.findOne().sort({ dealValue: -1 }).select('dealValue');
  const maxDealValue = maxDealResult ? maxDealResult.dealValue : 1;

  const { score, scoreBreakdown } = computeLeadScore(lead, interactionCount, maxDealValue);
  lead.score = score;
  lead.scoreBreakdown = scoreBreakdown;
  await lead.save();
}

/* ------------------------------------------------------------------ */
/*  Routes                                                            */
/* ------------------------------------------------------------------ */

/**
 * @route   GET /api/interactions?leadId=xxx
 * @desc    Get interactions for a lead, sorted by date desc
 * @access  Private
 */
router.get(
  '/',
  [query('leadId').optional().isMongoId().withMessage('Invalid lead ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const filter = {};
    if (req.query.leadId) filter.lead = req.query.leadId;

    const interactions = await Interaction.find(filter)
      .populate('loggedBy', 'name')
      .populate('lead', 'companyName')
      .sort({ date: -1 })
      .lean();

    res.json({ count: interactions.length, interactions });
  }
);

/**
 * @route   POST /api/interactions
 * @desc    Log a new interaction and recompute lead score
 * @access  Private
 */
router.post(
  '/',
  [
    body('lead').isMongoId().withMessage('Valid lead ID is required'),
    body('type').notEmpty().withMessage('Interaction type is required'),
    body('outcome').notEmpty().withMessage('Outcome is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const lead = await Lead.findById(req.body.lead);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const interaction = await Interaction.create({
      lead: req.body.lead,
      type: req.body.type,
      date: req.body.date || new Date(),
      duration: req.body.duration,
      outcome: req.body.outcome,
      nextAction: req.body.nextAction,
      loggedBy: req.user._id,
    });

    // Update lead's nextFollowUp if provided
    if (req.body.nextFollowUp) {
      lead.nextFollowUp = new Date(req.body.nextFollowUp);
      await lead.save();
    }

    // Recompute lead score after new interaction
    await recomputeLeadScore(lead._id);

    const populated = await Interaction.findById(interaction._id)
      .populate('loggedBy', 'name')
      .populate('lead', 'companyName');

    res.status(201).json(populated);
  }
);

/**
 * @route   DELETE /api/interactions/:id
 * @desc    Delete an interaction entry
 * @access  Private
 */
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid interaction ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const interaction = await Interaction.findById(req.params.id);
    if (!interaction) {
      return res.status(404).json({ message: 'Interaction not found' });
    }

    const leadId = interaction.lead;
    await interaction.deleteOne();

    // Recompute lead score after removal
    await recomputeLeadScore(leadId);

    res.json({ message: 'Interaction deleted' });
  }
);

module.exports = router;
