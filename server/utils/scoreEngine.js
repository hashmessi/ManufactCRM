/**
 * @module scoreEngine
 * @description Lead scoring engine for ManufactCRM.
 *
 * Score = dealValueScore + interactionScore + stageVelocityScore + responseTimeScore + bonusScore
 *
 * | Component          | Max Points | Formula                                            |
 * |--------------------|------------|----------------------------------------------------|
 * | dealValueScore     | 30         | (dealValue / maxDealInSystem) × 30                 |
 * | interactionScore   | 25         | min(interactionCount × 5, 25)                      |
 * | stageVelocityScore | 20         | 20 - min(daysInCurrentStage × 2, 20)               |
 * | responseTimeScore  | 15         | <=1d → 15, <=3d → 10, <=7d → 5, else 0            |
 * | bonusScore         | 10         | hasProposal ? 10 : 0                               |
 * | **Total**          | **100**    | capped at 100                                      |
 */

/**
 * Compute the lead score and its breakdown.
 * @param {Object} lead - The lead document (must include dealValue, stageChangedAt, createdAt, proposalSent).
 * @param {number} interactionCount - Total number of interactions logged for this lead.
 * @param {number} maxDealValue - The highest dealValue across all leads in the system (>0).
 * @returns {{ score: number, scoreBreakdown: Object }}
 */
function computeLeadScore(lead, interactionCount, maxDealValue) {
  const now = new Date();

  // --- Deal Value Score (max 30) ---
  const safeDealMax = maxDealValue > 0 ? maxDealValue : 1;
  const dealValueScore = Math.round(((lead.dealValue || 0) / safeDealMax) * 30 * 100) / 100;

  // --- Interaction Score (max 25) ---
  const interactionScore = Math.min((interactionCount || 0) * 5, 25);

  // --- Stage Velocity Score (max 20) ---
  const stageChangedAt = lead.stageChangedAt ? new Date(lead.stageChangedAt) : new Date(lead.createdAt);
  const daysInCurrentStage = Math.max(0, (now - stageChangedAt) / (1000 * 60 * 60 * 24));
  const stageVelocityScore = Math.max(0, 20 - Math.min(Math.round(daysInCurrentStage) * 2, 20));

  // --- Response Time Score (max 15) ---
  let responseTimeScore = 0;
  const createdAt = new Date(lead.createdAt);
  // firstInteractionDate can be passed via lead._firstInteractionDate (set by caller)
  if (lead._firstInteractionDate) {
    const daysToFirstContact = (new Date(lead._firstInteractionDate) - createdAt) / (1000 * 60 * 60 * 24);
    if (daysToFirstContact <= 1) responseTimeScore = 15;
    else if (daysToFirstContact <= 3) responseTimeScore = 10;
    else if (daysToFirstContact <= 7) responseTimeScore = 5;
    else responseTimeScore = 0;
  }

  // --- Bonus Score (10 if proposal sent) ---
  const bonusScore = lead.proposalSent ? 10 : 0;

  // --- Total (capped at 100) ---
  const rawTotal = dealValueScore + interactionScore + stageVelocityScore + responseTimeScore + bonusScore;
  const score = Math.min(Math.round(rawTotal), 100);

  const scoreBreakdown = {
    dealValueScore: Math.round(dealValueScore * 100) / 100,
    interactionScore,
    stageVelocityScore,
    responseTimeScore,
    bonusScore,
    rawTotal: Math.round(rawTotal * 100) / 100,
  };

  return { score, scoreBreakdown };
}

module.exports = { computeLeadScore };
