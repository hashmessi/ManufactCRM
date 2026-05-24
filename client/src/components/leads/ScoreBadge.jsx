import React, { useState } from 'react';

const SCORE_TIERS = {
  hot:  { color: '#ef4444', label: 'Hot',  bg: 'rgba(239,68,68,0.1)'   },
  warm: { color: '#f59e0b', label: 'Warm', bg: 'rgba(245,158,11,0.1)'  },
  cold: { color: '#3b82f6', label: 'Cold', bg: 'rgba(59,130,246,0.1)'  },
};

function getTier(score) {
  if (score >= 80) return SCORE_TIERS.hot;
  if (score >= 50) return SCORE_TIERS.warm;
  return SCORE_TIERS.cold;
}

export default function ScoreBadge({ score, breakdown }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const displayScore = score ?? 0;
  const config = getTier(displayScore);

  const circumference = 2 * Math.PI * 10; // r=10
  const dashOffset = circumference * (1 - displayScore / 100);

  const breakdownItems = breakdown && typeof breakdown === 'object' && !Array.isArray(breakdown)
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
      <div
        className="score-badge-ring"
        title={`Score: ${displayScore}/100`}
        style={{
          background: config.bg,
          border: `1px solid ${config.color}30`,
        }}
        id={`score-badge-${displayScore}`}
        role="status"
        aria-label={`Lead score: ${displayScore} (${config.label})`}
      >
        <svg width="28" height="28" viewBox="0 0 28 28">
          {/* Track */}
          <circle
            cx="14" cy="14" r="10"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="2.5"
          />
          {/* Fill */}
          <circle
            cx="14" cy="14" r="10"
            fill="none"
            stroke={config.color}
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 14 14)"
            style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
          />
          {/* Score number */}
          <text
            x="14" y="18"
            textAnchor="middle"
            fontSize="8"
            fontWeight="700"
            fill={config.color}
          >
            {displayScore}
          </text>
        </svg>
        <span style={{ color: config.color, fontSize: '11px', fontWeight: 600 }}>
          {config.label}
        </span>
      </div>

      {/* Tooltip — score breakdown on hover */}
      {showTooltip && breakdownItems.length > 0 && (
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
            <span style={{ color: config.color, fontWeight: 700 }}>
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
