import React, { useMemo } from 'react';

export default function Sparkline({ data = [], color = '#6366f1' }) {
  const W = 80;
  const H = 24;

  const { linePath, areaPath, gradientId } = useMemo(() => {
    if (!data.length || data.length < 2) {
      return { linePath: '', areaPath: '', gradientId: '' };
    }

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((v, i) => ({
      x: (i / (data.length - 1)) * W,
      y: H - ((v - min) / range) * (H - 2) - 1, // 1px padding top/bottom
    }));

    const line = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');

    // Close the area path along the bottom
    const area = `${line} L ${W} ${H} L 0 ${H} Z`;

    // Unique ID using color hash to avoid SVG gradient collisions
    const id = `sg-${color.replace('#', '')}-${Math.random().toString(36).slice(2, 6)}`;

    return { linePath: line, areaPath: area, gradientId: id };
  }, [data, color]);

  if (!data.length || data.length < 2) return null;

  return (
    <svg width={W} height={H} className="sparkline" viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
