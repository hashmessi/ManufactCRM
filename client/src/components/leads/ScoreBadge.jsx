import React, { useState } from 'react';

const SCORE_TIERS = {
  hot: { label: 'Hot', bgClass: 'badge-hot', minScore: 80 },
  warm: { label: 'Warm', bgClass: 'badge-warm', minScore: 50 },
  cold: { label: 'Cold', bgClass: 'badge-cold', minScore: 0 },
};

function getTier(score) {
  if (score >= 80) return SCORE_TIERS.hot;
  if (score >= 50) return SCORE_TIERS.warm;
  return SCORE_TIERS.cold;
}

export default function ScoreBadge({ score, breakdown }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tier = getTier(score ?? 0);
  const displayScore = score ?? 0;

  const breakdownItems = breakdown
    ? [
        { label: 'Deal Value', value: breakdown.dealValueScore },
        { label: 'Interactions', value: breakdown.interactionScore },
        { label: 'Stage Velocity', value: breakdown.stageVelocityScore },
        { label: 'Response Time', value: breakdown.responseTimeScore },
        { label: 'Bonus', value: breakdown.bonusScore },
      ]
    : [];

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className={`badge ${tier.bgClass} text-xs font-semibold tabular-nums`}
        id={`score-badge-${displayScore}`}
        role="status"
        aria-label={`Lead score: ${displayScore} (${tier.label})`}
      >
        {displayScore}
      </span>

      {showTooltip && breakdown && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 glass-card p-3 z-50 animate-fadeIn pointer-events-none">
          <p className="text-xs font-semibold text-text-primary mb-2 text-center">
            Score Breakdown
          </p>
          <div className="space-y-1.5">
            {breakdownItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <span className="text-text-muted">{item.label}</span>
                <span className="text-text-primary font-medium">{item.value ?? 0}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-border/50">
            <span className="text-text-muted font-medium">Total</span>
            <span className={`font-bold ${tier.bgClass.replace('badge-', 'text-')}`}>
              {displayScore}
            </span>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-bg-secondary rotate-45 border-r border-b border-border" />
        </div>
      )}
    </div>
  );
}
