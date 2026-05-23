/**
 * @module seedData
 * @description Seed script for ManufactCRM.
 *
 * Creates 4 users, 20+ real Indian manufacturing company leads,
 * 40+ interactions, 2 closed deals, computed scores, and notifications.
 *
 * Usage:  npm run seed
 *   or:   node seed/seedData.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Interaction = require('../models/Interaction');
const Deal = require('../models/Deal');
const Notification = require('../models/Notification');
const { computeLeadScore } = require('../utils/scoreEngine');

/* ------------------------------------------------------------------ */
/*  Date helpers                                                      */
/* ------------------------------------------------------------------ */

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function hoursAgo(n) {
  return new Date(Date.now() - n * 60 * 60 * 1000);
}

/* ------------------------------------------------------------------ */
/*  Main seed function                                                */
/* ------------------------------------------------------------------ */

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected');

    // ---- Clear all collections ----
    console.log('🗑  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Lead.deleteMany({}),
      Interaction.deleteMany({}),
      Deal.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    // ================================================================
    //  1. USERS
    // ================================================================
    console.log('👤 Creating users...');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@manufact.com',
      password: 'admin123',
      role: 'admin',
      target: 0,
    });

    const manager = await User.create({
      name: 'Deepak Sharma',
      email: 'manager@manufact.com',
      password: 'manager123',
      role: 'manager',
      target: 50000000, // ₹5 Cr
    });

    const ravi = await User.create({
      name: 'Ravi Kumar',
      email: 'ravi@manufact.com',
      password: 'assoc123',
      role: 'associate',
      target: 20000000, // ₹2 Cr
      manager: manager._id,
    });

    const priya = await User.create({
      name: 'Priya Nair',
      email: 'priya@manufact.com',
      password: 'assoc123',
      role: 'associate',
      target: 20000000, // ₹2 Cr
      manager: manager._id,
    });

    console.log(`   ✅ Created ${4} users`);

    // ================================================================
    //  2. LEADS — 20 real Indian manufacturing companies
    // ================================================================
    console.log('🏭 Creating leads...');

    const leadData = [
      // --- Ravi's leads (10) ---
      {
        companyName: 'Sundaram Clayton Ltd',
        industry: 'Auto Components',
        contactPerson: { name: 'Venkatesh Iyer', email: 'venkatesh@sundaramclayton.com', phone: '+91-44-2812-1234', designation: 'VP Procurement' },
        stage: 'Qualified',
        dealValue: 12000000,
        assignedTo: ravi._id,
        source: 'referral',
        nextFollowUp: daysFromNow(2),
        stageChangedAt: daysAgo(3),
      },
      {
        companyName: 'Rane Holdings',
        industry: 'Steering Systems',
        contactPerson: { name: 'Suresh Babu', email: 'suresh.b@rane.com', phone: '+91-44-2345-6789', designation: 'Head of Engineering' },
        stage: 'Proposal Sent',
        dealValue: 18500000,
        assignedTo: ravi._id,
        source: 'exhibition',
        nextFollowUp: daysAgo(1), // overdue!
        proposalSent: true,
        stageChangedAt: daysAgo(5),
      },
      {
        companyName: 'Carborundum Universal',
        industry: 'Abrasives',
        contactPerson: { name: 'Meena Krishnan', email: 'meena.k@cumi.com', phone: '+91-44-2856-7890', designation: 'Plant Manager' },
        stage: 'New',
        dealValue: 5000000,
        assignedTo: ravi._id,
        source: 'inbound',
        nextFollowUp: daysFromNow(1),
        stageChangedAt: daysAgo(1),
      },
      {
        companyName: 'Wendt India',
        industry: 'Precision Tools',
        contactPerson: { name: 'Raghav Menon', email: 'raghav.m@wendtindia.com', phone: '+91-80-2223-4567', designation: 'Director Operations' },
        stage: 'Contacted',
        dealValue: 7500000,
        assignedTo: ravi._id,
        source: 'cold_outreach',
        nextFollowUp: daysFromNow(3),
        stageChangedAt: daysAgo(4),
      },
      {
        companyName: 'Pricol Limited',
        industry: 'Automotive Instruments',
        contactPerson: { name: 'Arun Prakash', email: 'arun.p@pricol.com', phone: '+91-422-2567890', designation: 'GM Purchase' },
        stage: 'Negotiation',
        dealValue: 20000000,
        assignedTo: ravi._id,
        source: 'referral',
        nextFollowUp: daysFromNow(1),
        proposalSent: true,
        stageChangedAt: daysAgo(2),
      },
      {
        companyName: 'Lucas TVS',
        industry: 'Electrical Components',
        contactPerson: { name: 'Karthik Raman', email: 'karthik.r@lucastvs.com', phone: '+91-44-2812-5678', designation: 'CTO' },
        stage: 'Won',
        dealValue: 15000000,
        assignedTo: ravi._id,
        source: 'referral',
        proposalSent: true,
        stageChangedAt: daysAgo(10),
      },
      {
        companyName: 'Minda Industries',
        industry: 'Auto Parts',
        contactPerson: { name: 'Rahul Gupta', email: 'rahul.g@minda.com', phone: '+91-120-4567890', designation: 'VP Manufacturing' },
        stage: 'Contacted',
        dealValue: 9000000,
        assignedTo: ravi._id,
        source: 'exhibition',
        nextFollowUp: daysAgo(3), // overdue!
        stageChangedAt: daysAgo(8),
      },
      {
        companyName: 'Suprajit Engineering',
        industry: 'Cables & Control Systems',
        contactPerson: { name: 'Nandini Rao', email: 'nandini.r@suprajit.com', phone: '+91-80-2678-1234', designation: 'Chief Procurement Officer' },
        stage: 'Qualified',
        dealValue: 11000000,
        assignedTo: ravi._id,
        source: 'inbound',
        nextFollowUp: daysFromNow(5),
        stageChangedAt: daysAgo(6),
      },
      {
        companyName: 'Bharat Forge',
        industry: 'Forgings',
        contactPerson: { name: 'Amit Deshmukh', email: 'amit.d@bharatforge.com', phone: '+91-20-2567-8901', designation: 'Head Supply Chain' },
        stage: 'New',
        dealValue: 8000000,
        assignedTo: ravi._id,
        source: 'cold_outreach',
        nextFollowUp: daysFromNow(2),
        stageChangedAt: daysAgo(0),
      },
      {
        companyName: 'Elgi Equipments',
        industry: 'Compressors',
        contactPerson: { name: 'Lakshmi Narayanan', email: 'lakshmi.n@elgi.com', phone: '+91-422-2590-123', designation: 'Director Engineering' },
        stage: 'Lost',
        dealValue: 6000000,
        assignedTo: ravi._id,
        source: 'inbound',
        stageChangedAt: daysAgo(15),
      },
      // --- Priya's leads (10) ---
      {
        companyName: 'AIA Engineering',
        industry: 'Mill Internals',
        contactPerson: { name: 'Sanjay Patel', email: 'sanjay.p@aiaeng.com', phone: '+91-79-2589-1234', designation: 'CEO' },
        stage: 'Proposal Sent',
        dealValue: 15000000,
        assignedTo: priya._id,
        source: 'referral',
        nextFollowUp: daysFromNow(1),
        proposalSent: true,
        stageChangedAt: daysAgo(4),
      },
      {
        companyName: 'Graphite India',
        industry: 'Electrodes',
        contactPerson: { name: 'Ananya Joshi', email: 'ananya.j@graphiteindia.com', phone: '+91-33-2456-7890', designation: 'VP Sales' },
        stage: 'Qualified',
        dealValue: 10000000,
        assignedTo: priya._id,
        source: 'exhibition',
        nextFollowUp: daysFromNow(3),
        stageChangedAt: daysAgo(5),
      },
      {
        companyName: 'Kirloskar Oil Engines',
        industry: 'Diesel Engines',
        contactPerson: { name: 'Vivek Kulkarni', email: 'vivek.k@kirloskar.com', phone: '+91-20-2590-5678', designation: 'Plant Head' },
        stage: 'Negotiation',
        dealValue: 20000000,
        assignedTo: priya._id,
        source: 'referral',
        nextFollowUp: daysAgo(2), // overdue!
        proposalSent: true,
        stageChangedAt: daysAgo(3),
      },
      {
        companyName: 'Triveni Turbine',
        industry: 'Steam Turbines',
        contactPerson: { name: 'Pradeep Reddy', email: 'pradeep.r@triveniturbine.com', phone: '+91-80-2312-3456', designation: 'Head R&D' },
        stage: 'Contacted',
        dealValue: 8500000,
        assignedTo: priya._id,
        source: 'cold_outreach',
        nextFollowUp: daysFromNow(4),
        stageChangedAt: daysAgo(6),
      },
      {
        companyName: 'Kennametal India',
        industry: 'Hard Metal Tools',
        contactPerson: { name: 'Divya Sharma', email: 'divya.s@kennametal.com', phone: '+91-80-2345-6789', designation: 'Director Procurement' },
        stage: 'New',
        dealValue: 6500000,
        assignedTo: priya._id,
        source: 'inbound',
        nextFollowUp: daysFromNow(2),
        stageChangedAt: daysAgo(1),
      },
      {
        companyName: 'Timken India',
        industry: 'Bearings',
        contactPerson: { name: 'Ajay Naik', email: 'ajay.n@timken.com', phone: '+91-20-2678-9012', designation: 'GM Engineering' },
        stage: 'Won',
        dealValue: 12000000,
        assignedTo: priya._id,
        source: 'referral',
        proposalSent: true,
        stageChangedAt: daysAgo(8),
      },
      {
        companyName: 'SKF India',
        industry: 'Bearings',
        contactPerson: { name: 'Kavitha Sundaram', email: 'kavitha.s@skf.com', phone: '+91-20-2590-3456', designation: 'VP Supply Chain' },
        stage: 'Contacted',
        dealValue: 9500000,
        assignedTo: priya._id,
        source: 'exhibition',
        nextFollowUp: daysAgo(5), // overdue!
        stageChangedAt: daysAgo(10),
      },
      {
        companyName: 'Schaeffler India',
        industry: 'Bearings & Linear Motion',
        contactPerson: { name: 'Rohit Mehta', email: 'rohit.m@schaeffler.com', phone: '+91-20-2678-5678', designation: 'Head of Purchasing' },
        stage: 'Qualified',
        dealValue: 14000000,
        assignedTo: priya._id,
        source: 'inbound',
        nextFollowUp: daysFromNow(6),
        stageChangedAt: daysAgo(7),
      },
      {
        companyName: 'Grindwell Norton',
        industry: 'Abrasives & Ceramics',
        contactPerson: { name: 'Siddharth Tiwari', email: 'siddharth.t@grindwellnorton.com', phone: '+91-22-2345-7890', designation: 'COO' },
        stage: 'New',
        dealValue: 7000000,
        assignedTo: priya._id,
        source: 'other',
        nextFollowUp: daysFromNow(3),
        stageChangedAt: daysAgo(0),
      },
      {
        companyName: 'Cummins India',
        industry: 'Engines & Power Generation',
        contactPerson: { name: 'Neha Kapoor', email: 'neha.k@cummins.com', phone: '+91-20-2567-0123', designation: 'Director Manufacturing' },
        stage: 'Lost',
        dealValue: 18000000,
        assignedTo: priya._id,
        source: 'cold_outreach',
        stageChangedAt: daysAgo(20),
      },
    ];

    const leads = await Lead.insertMany(leadData);
    console.log(`   ✅ Created ${leads.length} leads`);

    // Build a quick lookup map by company name
    const leadMap = {};
    for (const l of leads) leadMap[l.companyName] = l;

    // ================================================================
    //  3. INTERACTIONS — 40+ across leads
    // ================================================================
    console.log('📞 Creating interactions...');

    const interactionData = [
      // Sundaram Clayton (Qualified)
      { lead: leadMap['Sundaram Clayton Ltd']._id, type: 'call', date: daysAgo(10), duration: 25, outcome: 'Initial discovery call — interested in BDA solutions', loggedBy: ravi._id },
      { lead: leadMap['Sundaram Clayton Ltd']._id, type: 'email', date: daysAgo(8), outcome: 'Sent product catalogue and case studies', loggedBy: ravi._id },
      { lead: leadMap['Sundaram Clayton Ltd']._id, type: 'meeting', date: daysAgo(3), duration: 60, outcome: 'Plant visit — demonstrated product on-site', nextAction: 'Prepare proposal', loggedBy: ravi._id },

      // Rane Holdings (Proposal Sent)
      { lead: leadMap['Rane Holdings']._id, type: 'call', date: daysAgo(15), duration: 20, outcome: 'Cold outreach — met at ACMA exhibition', loggedBy: ravi._id },
      { lead: leadMap['Rane Holdings']._id, type: 'meeting', date: daysAgo(12), duration: 90, outcome: 'Technical presentation to engineering team', loggedBy: ravi._id },
      { lead: leadMap['Rane Holdings']._id, type: 'email', date: daysAgo(7), outcome: 'Shared commercial proposal — ₹1.85 Cr', loggedBy: ravi._id },
      { lead: leadMap['Rane Holdings']._id, type: 'call', date: daysAgo(5), duration: 15, outcome: 'Follow-up — proposal under review by management', loggedBy: ravi._id },

      // Carborundum Universal (New)
      { lead: leadMap['Carborundum Universal']._id, type: 'email', date: daysAgo(1), outcome: 'Inbound enquiry received from website form', loggedBy: ravi._id },

      // Wendt India (Contacted)
      { lead: leadMap['Wendt India']._id, type: 'call', date: daysAgo(4), duration: 15, outcome: 'Initial cold call — spoke with PA, director unavailable', loggedBy: ravi._id },
      { lead: leadMap['Wendt India']._id, type: 'email', date: daysAgo(3), outcome: 'Follow-up email with company intro', loggedBy: ravi._id },

      // Pricol (Negotiation)
      { lead: leadMap['Pricol Limited']._id, type: 'call', date: daysAgo(20), duration: 30, outcome: 'Referral from Sundaram — warm lead', loggedBy: ravi._id },
      { lead: leadMap['Pricol Limited']._id, type: 'meeting', date: daysAgo(14), duration: 120, outcome: 'Full-day workshop with procurement and engineering teams', loggedBy: ravi._id },
      { lead: leadMap['Pricol Limited']._id, type: 'email', date: daysAgo(10), outcome: 'Submitted detailed RFQ response', loggedBy: ravi._id },
      { lead: leadMap['Pricol Limited']._id, type: 'call', date: daysAgo(5), duration: 45, outcome: 'Price negotiation — they want 8% discount', nextAction: 'Discuss with manager on pricing', loggedBy: ravi._id },
      { lead: leadMap['Pricol Limited']._id, type: 'whatsapp', date: daysAgo(2), outcome: 'Shared revised pricing — awaiting approval', loggedBy: ravi._id },

      // Lucas TVS (Won)
      { lead: leadMap['Lucas TVS']._id, type: 'call', date: daysAgo(30), duration: 20, outcome: 'Referral intro from existing customer', loggedBy: ravi._id },
      { lead: leadMap['Lucas TVS']._id, type: 'meeting', date: daysAgo(25), duration: 90, outcome: 'Product demo at CTO office', loggedBy: ravi._id },
      { lead: leadMap['Lucas TVS']._id, type: 'email', date: daysAgo(18), outcome: 'Proposal sent — ₹1.5 Cr', loggedBy: ravi._id },
      { lead: leadMap['Lucas TVS']._id, type: 'call', date: daysAgo(12), duration: 30, outcome: 'Final negotiation — deal closed!', loggedBy: ravi._id },

      // Minda Industries (Contacted — stale, last interaction 8 days ago)
      { lead: leadMap['Minda Industries']._id, type: 'call', date: daysAgo(8), duration: 10, outcome: 'Spoke at exhibition — exchanged cards', loggedBy: ravi._id },

      // Suprajit (Qualified)
      { lead: leadMap['Suprajit Engineering']._id, type: 'email', date: daysAgo(9), outcome: 'Inbound enquiry — wants cable testing solution', loggedBy: ravi._id },
      { lead: leadMap['Suprajit Engineering']._id, type: 'call', date: daysAgo(6), duration: 35, outcome: 'Discovery call — understood requirements', loggedBy: ravi._id },

      // AIA Engineering (Proposal Sent)
      { lead: leadMap['AIA Engineering']._id, type: 'call', date: daysAgo(12), duration: 30, outcome: 'Referral from industry contact — high-value prospect', loggedBy: priya._id },
      { lead: leadMap['AIA Engineering']._id, type: 'meeting', date: daysAgo(8), duration: 60, outcome: 'Met CEO — very interested in our mill internals solution', loggedBy: priya._id },
      { lead: leadMap['AIA Engineering']._id, type: 'email', date: daysAgo(4), outcome: 'Proposal submitted — ₹1.5 Cr', loggedBy: priya._id },

      // Graphite India (Qualified)
      { lead: leadMap['Graphite India']._id, type: 'call', date: daysAgo(10), duration: 20, outcome: 'Met at exhibition — interested in electrode solutions', loggedBy: priya._id },
      { lead: leadMap['Graphite India']._id, type: 'email', date: daysAgo(7), outcome: 'Sent technical specs and pricing sheet', loggedBy: priya._id },
      { lead: leadMap['Graphite India']._id, type: 'meeting', date: daysAgo(5), duration: 45, outcome: 'Technical review meeting — qualified', loggedBy: priya._id },

      // Kirloskar (Negotiation)
      { lead: leadMap['Kirloskar Oil Engines']._id, type: 'call', date: daysAgo(18), duration: 25, outcome: 'Referral — they need diesel engine components', loggedBy: priya._id },
      { lead: leadMap['Kirloskar Oil Engines']._id, type: 'meeting', date: daysAgo(12), duration: 90, outcome: 'Plant visit with technical team', loggedBy: priya._id },
      { lead: leadMap['Kirloskar Oil Engines']._id, type: 'email', date: daysAgo(8), outcome: 'Detailed proposal sent — ₹2 Cr', loggedBy: priya._id },
      { lead: leadMap['Kirloskar Oil Engines']._id, type: 'call', date: daysAgo(3), duration: 40, outcome: 'Negotiation — they want payment terms extended to 90 days', loggedBy: priya._id },

      // Triveni Turbine (Contacted)
      { lead: leadMap['Triveni Turbine']._id, type: 'call', date: daysAgo(6), duration: 15, outcome: 'Cold call — R&D head interested', loggedBy: priya._id },
      { lead: leadMap['Triveni Turbine']._id, type: 'email', date: daysAgo(4), outcome: 'Sent company profile and case studies', loggedBy: priya._id },

      // Kennametal (New)
      { lead: leadMap['Kennametal India']._id, type: 'email', date: daysAgo(1), outcome: 'Inbound lead from LinkedIn campaign', loggedBy: priya._id },

      // Timken (Won)
      { lead: leadMap['Timken India']._id, type: 'call', date: daysAgo(25), duration: 20, outcome: 'Warm referral from SKF contact', loggedBy: priya._id },
      { lead: leadMap['Timken India']._id, type: 'meeting', date: daysAgo(20), duration: 60, outcome: 'Product demo and facility tour', loggedBy: priya._id },
      { lead: leadMap['Timken India']._id, type: 'email', date: daysAgo(15), outcome: 'Proposal sent — ₹1.2 Cr', loggedBy: priya._id },
      { lead: leadMap['Timken India']._id, type: 'call', date: daysAgo(8), duration: 30, outcome: 'Deal closed — PO received!', loggedBy: priya._id },

      // SKF India (Contacted — stale)
      { lead: leadMap['SKF India']._id, type: 'call', date: daysAgo(10), duration: 20, outcome: 'Met at bearing expo — exchanged requirements', loggedBy: priya._id },

      // Schaeffler (Qualified)
      { lead: leadMap['Schaeffler India']._id, type: 'email', date: daysAgo(10), outcome: 'Inbound via website — wants linear motion solutions', loggedBy: priya._id },
      { lead: leadMap['Schaeffler India']._id, type: 'call', date: daysAgo(7), duration: 40, outcome: 'Detailed requirements discussion with purchasing head', loggedBy: priya._id },
      { lead: leadMap['Schaeffler India']._id, type: 'meeting', date: daysAgo(4), duration: 60, outcome: 'On-site assessment — qualified for proposal', nextAction: 'Draft proposal by next week', loggedBy: priya._id },

      // Grindwell Norton (New)
      { lead: leadMap['Grindwell Norton']._id, type: 'whatsapp', date: hoursAgo(6), outcome: 'COO pinged on WhatsApp — saw our ad', loggedBy: priya._id },
    ];

    const interactions = await Interaction.insertMany(interactionData);
    console.log(`   ✅ Created ${interactions.length} interactions`);

    // ================================================================
    //  4. DEALS — 2 closed deals (Lucas TVS & Timken India)
    // ================================================================
    console.log('💰 Creating deals...');

    const deal1 = await Deal.create({
      lead: leadMap['Lucas TVS']._id,
      closedBy: ravi._id,
      revenue: 15000000,
      expectedValue: 15000000,
      closedAt: daysAgo(10),
      notes: 'Full order for electrical component testing suite',
    });

    const deal2 = await Deal.create({
      lead: leadMap['Timken India']._id,
      closedBy: priya._id,
      revenue: 12000000,
      expectedValue: 13000000,
      closedAt: daysAgo(8),
      notes: 'Bearing inspection system — slightly below expected value due to volume discount',
    });

    console.log(`   ✅ Created 2 deals`);

    // ================================================================
    //  5. COMPUTE SCORES for all leads
    // ================================================================
    console.log('📊 Computing lead scores...');

    const allLeads = await Lead.find();
    const maxDealResult = await Lead.findOne().sort({ dealValue: -1 }).select('dealValue');
    const maxDealValue = maxDealResult ? maxDealResult.dealValue : 1;

    for (const lead of allLeads) {
      const interactionCount = await Interaction.countDocuments({ lead: lead._id });
      const firstInteraction = await Interaction.findOne({ lead: lead._id }).sort({ date: 1 }).select('date');
      if (firstInteraction) {
        lead._firstInteractionDate = firstInteraction.date;
      }

      const { score, scoreBreakdown } = computeLeadScore(lead, interactionCount, maxDealValue);
      lead.score = score;
      lead.scoreBreakdown = scoreBreakdown;
      await lead.save();
    }

    console.log(`   ✅ Scores computed for ${allLeads.length} leads`);

    // ================================================================
    //  6. NOTIFICATIONS
    // ================================================================
    console.log('🔔 Creating notifications...');

    const notificationData = [
      // Overdue follow-ups
      {
        user: ravi._id,
        type: 'follow_up_due',
        lead: leadMap['Rane Holdings']._id,
        message: 'Follow-up overdue for Rane Holdings — proposal sent 5 days ago',
        read: false,
      },
      {
        user: ravi._id,
        type: 'follow_up_due',
        lead: leadMap['Minda Industries']._id,
        message: 'Follow-up overdue for Minda Industries — no contact in 3 days',
        read: false,
      },
      {
        user: priya._id,
        type: 'follow_up_due',
        lead: leadMap['Kirloskar Oil Engines']._id,
        message: 'Follow-up overdue for Kirloskar Oil Engines — negotiation pending',
        read: false,
      },
      {
        user: priya._id,
        type: 'follow_up_due',
        lead: leadMap['SKF India']._id,
        message: 'Follow-up overdue for SKF India — no contact in 5 days',
        read: false,
      },
      // Stale leads
      {
        user: ravi._id,
        type: 'stale_lead',
        lead: leadMap['Minda Industries']._id,
        message: 'Minda Industries has had no interaction in 8 days — lead going stale',
        read: false,
      },
      {
        user: priya._id,
        type: 'stale_lead',
        lead: leadMap['SKF India']._id,
        message: 'SKF India has had no interaction in 10 days — lead going stale',
        read: false,
      },
      // Lead assignment
      {
        user: ravi._id,
        type: 'lead_assigned',
        lead: leadMap['Bharat Forge']._id,
        message: 'New lead assigned: Bharat Forge — Forgings, ₹80L deal value',
        read: true,
      },
      {
        user: priya._id,
        type: 'lead_assigned',
        lead: leadMap['Grindwell Norton']._id,
        message: 'New lead assigned: Grindwell Norton — Abrasives & Ceramics, ₹70L deal value',
        read: true,
      },
      // Target alerts (manager)
      {
        user: manager._id,
        type: 'target_alert',
        message: 'Monthly target tracking: Team has closed ₹2.7 Cr of ₹5 Cr target (54%)',
        read: false,
      },
      {
        user: ravi._id,
        type: 'target_alert',
        message: 'You have closed ₹1.5 Cr of your ₹2 Cr monthly target (75%) — keep going!',
        read: false,
      },
      {
        user: priya._id,
        type: 'target_alert',
        message: 'You have closed ₹1.2 Cr of your ₹2 Cr monthly target (60%) — 3 deals in pipeline',
        read: false,
      },
    ];

    const notifications = await Notification.insertMany(notificationData);
    console.log(`   ✅ Created ${notifications.length} notifications`);

    // ================================================================
    //  Done
    // ================================================================
    console.log('\n🎉 Seed completed successfully!');
    console.log('   📋 Summary:');
    console.log(`      Users:          4`);
    console.log(`      Leads:          ${leads.length}`);
    console.log(`      Interactions:   ${interactions.length}`);
    console.log(`      Deals:          2`);
    console.log(`      Notifications:  ${notifications.length}`);
    console.log('\n   🔑 Login credentials:');
    console.log('      admin@manufact.com    / admin123');
    console.log('      manager@manufact.com  / manager123');
    console.log('      ravi@manufact.com     / assoc123');
    console.log('      priya@manufact.com    / assoc123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
