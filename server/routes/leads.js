const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const Interaction = require('../models/Interaction');
const User = require('../models/User');
const { computeLeadScore } = require('../utils/scoreEngine');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All lead routes are protected
router.use(verifyToken);

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/**
 * Build a role-scoped filter object so associates see only their leads,
 * managers see their team's leads, and admins see everything.
 * @param {Object} user - req.user
 * @returns {Promise<Object>} Mongoose filter
 */
async function buildRoleScopeFilter(user) {
  if (user.role === 'admin') return {};
  if (user.role === 'manager') {
    const teamMembers = await User.find({ manager: user._id }).select('_id');
    const teamIds = teamMembers.map((m) => m._id);
    teamIds.push(user._id); // include manager themselves
    return { assignedTo: { $in: teamIds } };
  }
  // associate
  return { assignedTo: user._id };
}

/**
 * Recompute and persist the lead score.
 * @param {string} leadId
 * @returns {Promise<Object>} Updated lead document
 */
async function recomputeAndSaveScore(leadId) {
  const lead = await Lead.findById(leadId);
  if (!lead) return null;

  const interactionCount = await Interaction.countDocuments({ lead: leadId });

  // Find the first interaction date for response time scoring
  const firstInteraction = await Interaction.findOne({ lead: leadId }).sort({ date: 1 }).select('date');
  if (firstInteraction) {
    lead._firstInteractionDate = firstInteraction.date;
  }

  // Get max deal value in the entire system
  const maxDealResult = await Lead.findOne().sort({ dealValue: -1 }).select('dealValue');
  const maxDealValue = maxDealResult ? maxDealResult.dealValue : 1;

  const { score, scoreBreakdown } = computeLeadScore(lead, interactionCount, maxDealValue);

  lead.score = score;
  lead.scoreBreakdown = scoreBreakdown;
  await lead.save();

  return lead;
}

/* ------------------------------------------------------------------ */
/*  Routes                                                            */
/* ------------------------------------------------------------------ */

/**
 * @route   GET /api/leads
 * @desc    List leads with role-scoping and filters
 * @access  Private
 *
 * Query params: stage, assignedTo, scoreTier (hot|warm|cold), source, sort
 */
router.get('/', async (req, res) => {
  const scopeFilter = await buildRoleScopeFilter(req.user);
  const filter = { ...scopeFilter };

  // Optional filters
  if (req.query.stage) filter.stage = req.query.stage;
  if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
  if (req.query.source) filter.source = req.query.source;

  // Score tier: hot >= 70, warm 40-69, cold < 40
  if (req.query.scoreTier) {
    switch (req.query.scoreTier) {
      case 'hot':
        filter.score = { $gte: 70 };
        break;
      case 'warm':
        filter.score = { $gte: 40, $lt: 70 };
        break;
      case 'cold':
        filter.score = { $lt: 40 };
        break;
    }
  }

  // Sorting: default by score desc
  let sortObj = { score: -1 };
  if (req.query.sort) {
    const sortField = req.query.sort.startsWith('-') ? req.query.sort.slice(1) : req.query.sort;
    const sortDir = req.query.sort.startsWith('-') ? -1 : 1;
    sortObj = { [sortField]: sortDir };
  }

  const leads = await Lead.find(filter)
    .populate('assignedTo', 'name email')
    .sort(sortObj)
    .lean();

  res.json({ count: leads.length, leads });
});

/**
 * @route   POST /api/leads
 * @desc    Create a new lead and compute initial score
 * @access  Private
 */
router.post(
  '/',
  [
    body('companyName').notEmpty().withMessage('Company name is required'),
    body('assignedTo').notEmpty().withMessage('assignedTo is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const lead = await Lead.create(req.body);

    // Compute initial score
    const updated = await recomputeAndSaveScore(lead._id);
    const populated = await Lead.findById(updated._id).populate('assignedTo', 'name email');

    res.status(201).json(populated);
  }
);

/**
 * @route   GET /api/leads/:id
 * @desc    Get a single lead with interactions
 * @access  Private
 */
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid lead ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email').lean();
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const interactions = await Interaction.find({ lead: req.params.id })
      .populate('loggedBy', 'name')
      .sort({ date: -1 })
      .lean();

    res.json({ lead, interactions });
  }
);

/**
 * @route   PATCH /api/leads/:id
 * @desc    Update lead fields and recompute score
 * @access  Private
 */
router.patch(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid lead ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Apply updates (except stage — use /:id/stage for stage transitions)
    const allowedFields = [
      'companyName', 'industry', 'contactPerson', 'dealValue',
      'assignedTo', 'source', 'nextFollowUp', 'proposalSent', 'notes',
    ];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        lead[field] = req.body[field];
      }
    }
    await lead.save();

    // Recompute score after mutation
    const updated = await recomputeAndSaveScore(lead._id);
    const populated = await Lead.findById(updated._id).populate('assignedTo', 'name email');

    res.json(populated);
  }
);

/**
 * @route   PATCH /api/leads/:id/stage
 * @desc    Transition lead stage, auto-log interaction, recompute score
 * @access  Private
 */
router.patch(
  '/:id/stage',
  [
    param('id').isMongoId().withMessage('Invalid lead ID'),
    body('stage').notEmpty().withMessage('New stage is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const previousStage = lead.stage;
    const newStage = req.body.stage;

    if (previousStage === newStage) {
      return res.status(400).json({ message: `Lead is already in "${newStage}" stage` });
    }

    lead.stage = newStage;
    lead.stageChangedAt = new Date();

    // If stage = 'Proposal Sent', set proposalSent flag
    if (newStage === 'Proposal Sent') {
      lead.proposalSent = true;
    }

    await lead.save();

    // Auto-log a stage-change interaction
    await Interaction.create({
      lead: lead._id,
      type: 'other',
      outcome: `Stage changed from "${previousStage}" to "${newStage}"`,
      loggedBy: req.user._id,
      date: new Date(),
    });

    // Recompute score
    const updated = await recomputeAndSaveScore(lead._id);
    const populated = await Lead.findById(updated._id).populate('assignedTo', 'name email');

    res.json({ message: 'Stage updated', lead: populated });
  }
);

/**
 * @route   DELETE /api/leads/:id
 * @desc    Delete a lead (admin only)
 * @access  Private / Admin
 */
router.delete(
  '/:id',
  requireRole('admin'),
  [param('id').isMongoId().withMessage('Invalid lead ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Also remove related interactions
    await Interaction.deleteMany({ lead: lead._id });
    await lead.deleteOne();

    res.json({ message: 'Lead and related interactions deleted' });
  }
);

/**
 * @route   POST /api/leads/:id/score
 * @desc    Force-recompute lead score
 * @access  Private
 */
router.post(
  '/:id/score',
  [param('id').isMongoId().withMessage('Invalid lead ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const updated = await recomputeAndSaveScore(req.params.id);
    if (!updated) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json({ score: updated.score, scoreBreakdown: updated.scoreBreakdown });
  }
);

module.exports = router;
