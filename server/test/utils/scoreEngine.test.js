const { computeLeadScore } = require('../../utils/scoreEngine');

describe('computeLeadScore', () => {
  it('should compute the correct score for a brand new lead', () => {
    const lead = {
      createdAt: new Date(),
      stageChangedAt: new Date(),
      dealValue: 0,
      proposalSent: false
    };
    
    const { score, scoreBreakdown } = computeLeadScore(lead, 0, 1000);
    
    expect(scoreBreakdown.dealValueScore).toBe(0);
    expect(scoreBreakdown.interactionScore).toBe(0);
    expect(scoreBreakdown.stageVelocityScore).toBe(20); // 0 days in current stage = 20 - 0
    expect(scoreBreakdown.responseTimeScore).toBe(0); // No interactions yet
    expect(scoreBreakdown.bonusScore).toBe(0);
    expect(score).toBe(20);
  });

  it('should compute the maximum score correctly', () => {
    const now = new Date();
    const lead = {
      createdAt: now,
      stageChangedAt: now,
      dealValue: 1000,
      proposalSent: true,
      _firstInteractionDate: now
    };
    
    const { score, scoreBreakdown } = computeLeadScore(lead, 10, 1000); // 10 interactions => max 25
    
    expect(scoreBreakdown.dealValueScore).toBe(30); // 1000/1000 * 30
    expect(scoreBreakdown.interactionScore).toBe(25); // min(10 * 5, 25)
    expect(scoreBreakdown.stageVelocityScore).toBe(20); 
    expect(scoreBreakdown.responseTimeScore).toBe(15); // <= 1 day
    expect(scoreBreakdown.bonusScore).toBe(10);
    expect(score).toBe(100);
  });

  it('should degrade score for slow response times and stalled stages', () => {
    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    const lead = {
      createdAt: tenDaysAgo,
      stageChangedAt: tenDaysAgo, // stalled in stage for 10 days
      dealValue: 500,
      proposalSent: false,
      _firstInteractionDate: fiveDaysAgo // 5 days to respond
    };
    
    const { score, scoreBreakdown } = computeLeadScore(lead, 2, 1000); 
    
    expect(scoreBreakdown.dealValueScore).toBe(15); 
    expect(scoreBreakdown.interactionScore).toBe(10); 
    expect(scoreBreakdown.stageVelocityScore).toBe(0); // 20 - min(10*2, 20) = 0
    expect(scoreBreakdown.responseTimeScore).toBe(5); // <= 7 days
    expect(scoreBreakdown.bonusScore).toBe(0);
    expect(score).toBe(30);
  });
});
