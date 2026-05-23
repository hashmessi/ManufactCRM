const express = require('express');
const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Interaction = require('../models/Interaction');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All analytics routes are protected and require manager or admin
router.use(verifyToken);
router.use(requireRole('admin', 'manager'));

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/**
 * Get team member IDs that the requesting user can see.
 * Admins see all associates/managers, managers see their direct reports.
 * @param {Object} user - req.user
 * @returns {Promise<mongoose.Types.ObjectId[]>}
 */
async function getVisibleUserIds(user) {
  if (user.role === 'admin') {
    const all = await User.find().select('_id');
    return all.map((u) => u._id);
  }
  // manager — self + direct reports
  const team = await User.find({ manager: user._id }).select('_id');
  const ids = team.map((u) => u._id);
  ids.push(user._id);
  return ids;
}

/**
 * Current month in YYYY-MM format.
 */
function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ */
/*  Routes                                                            */
/* ------------------------------------------------------------------ */

/**
 * @route   GET /api/analytics/team
 * @desc    Per-rep KPIs: total leads, leads by stage, deals closed, revenue vs target, conversion rate, activity this month
 * @access  Private / Manager, Admin
 */
router.get('/team', async (req, res) => {
  const userIds = await getVisibleUserIds(req.user);
  const month = currentMonth();

  // Start of current month
  const monthStart = new Date(`${month}-01T00:00:00.000Z`);
  const nextMonth = new Date(monthStart);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  // Per-rep lead stats
  const leadsByRep = await Lead.aggregate([
    { $match: { assignedTo: { $in: userIds } } },
    {
      $group: {
        _id: '$assignedTo',
        totalLeads: { $sum: 1 },
        wonLeads: { $sum: { $cond: [{ $eq: ['$stage', 'Won'] }, 1, 0] } },
        lostLeads: { $sum: { $cond: [{ $eq: ['$stage', 'Lost'] }, 1, 0] } },
        avgScore: { $avg: '$score' },
        totalDealValue: { $sum: '$dealValue' },
      },
    },
  ]);

  // Per-rep stage distribution
  const stagesByRep = await Lead.aggregate([
    { $match: { assignedTo: { $in: userIds } } },
    {
      $group: {
        _id: { rep: '$assignedTo', stage: '$stage' },
        count: { $sum: 1 },
      },
    },
  ]);

  // Per-rep revenue from deals this month
  const revenueByRep = await Deal.aggregate([
    { $match: { closedBy: { $in: userIds }, month } },
    {
      $group: {
        _id: '$closedBy',
        revenue: { $sum: '$revenue' },
        dealsCount: { $sum: 1 },
      },
    },
  ]);

  // Per-rep interactions this month
  const activityByRep = await Interaction.aggregate([
    {
      $match: {
        loggedBy: { $in: userIds },
        date: { $gte: monthStart, $lt: nextMonth },
      },
    },
    {
      $group: {
        _id: '$loggedBy',
        totalInteractions: { $sum: 1 },
        calls: { $sum: { $cond: [{ $eq: ['$type', 'call'] }, 1, 0] } },
        emails: { $sum: { $cond: [{ $eq: ['$type', 'email'] }, 1, 0] } },
        meetings: { $sum: { $cond: [{ $eq: ['$type', 'meeting'] }, 1, 0] } },
      },
    },
  ]);

  // Enrich with user names and targets
  const users = await User.find({ _id: { $in: userIds } }).select('name email role target').lean();
  const userMap = {};
  for (const u of users) userMap[u._id.toString()] = u;

  const kpis = userIds.map((uid) => {
    const id = uid.toString();
    const user = userMap[id] || {};
    const leadStats = leadsByRep.find((r) => r._id.toString() === id) || {};
    const revStats = revenueByRep.find((r) => r._id.toString() === id) || {};
    const actStats = activityByRep.find((r) => r._id.toString() === id) || {};

    const stages = {};
    stagesByRep
      .filter((s) => s._id.rep.toString() === id)
      .forEach((s) => { stages[s._id.stage] = s.count; });

    const totalLeads = leadStats.totalLeads || 0;
    const wonLeads = leadStats.wonLeads || 0;
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    return {
      userId: uid,
      name: user.name,
      email: user.email,
      role: user.role,
      target: user.target || 0,
      totalLeads,
      wonLeads,
      lostLeads: leadStats.lostLeads || 0,
      avgScore: Math.round(leadStats.avgScore || 0),
      totalDealValue: leadStats.totalDealValue || 0,
      conversionRate,
      leadsByStage: stages,
      monthlyRevenue: revStats.revenue || 0,
      dealsClosedThisMonth: revStats.dealsCount || 0,
      revenueVsTarget: user.target ? Math.round(((revStats.revenue || 0) / user.target) * 100) : null,
      activity: {
        total: actStats.totalInteractions || 0,
        calls: actStats.calls || 0,
        emails: actStats.emails || 0,
        meetings: actStats.meetings || 0,
      },
    };
  });

  res.json({ month, kpis });
});

/**
 * @route   GET /api/analytics/pipeline
 * @desc    Pipeline funnel: count of leads per stage with % drop-off
 * @access  Private / Manager, Admin
 */
router.get('/pipeline', async (req, res) => {
  const userIds = await getVisibleUserIds(req.user);

  const stageOrder = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

  const stageCounts = await Lead.aggregate([
    { $match: { assignedTo: { $in: userIds } } },
    { $group: { _id: '$stage', count: { $sum: 1 }, totalValue: { $sum: '$dealValue' } } },
  ]);

  const stageMap = {};
  for (const s of stageCounts) stageMap[s._id] = s;

  // Build funnel with drop-off percentages (Lost is excluded from the funnel flow)
  const funnelStages = stageOrder.filter((s) => s !== 'Lost');
  let previousCount = null;

  const funnel = funnelStages.map((stage) => {
    const data = stageMap[stage] || { count: 0, totalValue: 0 };
    const dropOff =
      previousCount !== null && previousCount > 0
        ? Math.round(((previousCount - data.count) / previousCount) * 100)
        : 0;
    previousCount = data.count;

    return {
      stage,
      count: data.count,
      totalValue: data.totalValue,
      dropOffPercent: dropOff,
    };
  });

  const lostData = stageMap['Lost'] || { count: 0, totalValue: 0 };

  res.json({ funnel, lost: { count: lostData.count, totalValue: lostData.totalValue } });
});

/**
 * @route   GET /api/analytics/revenue
 * @desc    Revenue closed vs target per rep this month
 * @access  Private / Manager, Admin
 */
router.get('/revenue', async (req, res) => {
  const userIds = await getVisibleUserIds(req.user);
  const month = req.query.month || currentMonth();

  const revenue = await Deal.aggregate([
    { $match: { closedBy: { $in: userIds }, month } },
    {
      $group: {
        _id: '$closedBy',
        totalRevenue: { $sum: '$revenue' },
        dealsCount: { $sum: 1 },
        avgDealSize: { $avg: '$revenue' },
      },
    },
  ]);

  const users = await User.find({ _id: { $in: userIds } }).select('name email target').lean();
  const userMap = {};
  for (const u of users) userMap[u._id.toString()] = u;

  const report = revenue.map((r) => {
    const user = userMap[r._id.toString()] || {};
    return {
      userId: r._id,
      name: user.name,
      email: user.email,
      target: user.target || 0,
      totalRevenue: r.totalRevenue,
      dealsCount: r.dealsCount,
      avgDealSize: Math.round(r.avgDealSize),
      attainment: user.target ? Math.round((r.totalRevenue / user.target) * 100) : null,
    };
  });

  // Include reps with zero revenue
  for (const uid of userIds) {
    const id = uid.toString();
    if (!revenue.find((r) => r._id.toString() === id)) {
      const user = userMap[id] || {};
      report.push({
        userId: uid,
        name: user.name,
        email: user.email,
        target: user.target || 0,
        totalRevenue: 0,
        dealsCount: 0,
        avgDealSize: 0,
        attainment: user.target ? 0 : null,
      });
    }
  }

  res.json({ month, report });
});

/**
 * @route   GET /api/analytics/trends
 * @desc    Monthly deals count and revenue for the last 6 months
 * @access  Private / Manager, Admin
 */
router.get('/trends', async (req, res) => {
  const userIds = await getVisibleUserIds(req.user);

  // Build last 6 months array
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const trends = await Deal.aggregate([
    { $match: { closedBy: { $in: userIds }, month: { $in: months } } },
    {
      $group: {
        _id: '$month',
        totalRevenue: { $sum: '$revenue' },
        dealsCount: { $sum: 1 },
        avgDealSize: { $avg: '$revenue' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Ensure all months are represented (even if zero)
  const trendMap = {};
  for (const t of trends) trendMap[t._id] = t;

  const result = months.map((m) => ({
    month: m,
    totalRevenue: trendMap[m] ? trendMap[m].totalRevenue : 0,
    dealsCount: trendMap[m] ? trendMap[m].dealsCount : 0,
    avgDealSize: trendMap[m] ? Math.round(trendMap[m].avgDealSize) : 0,
  }));

  res.json({ trends: result });
});

module.exports = router;
