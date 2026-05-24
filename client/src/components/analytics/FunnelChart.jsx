import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const FunnelTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-bg-secondary border border-border/85 p-3 rounded-xl shadow-premium-soft select-none text-[11px] font-mono">
        <p className="font-semibold text-text-primary mb-2 border-b border-border/40 pb-1">{data.stage}</p>
        <p className="flex justify-between items-center gap-6 text-text-muted">
          <span>Active Leads:</span>
          <span className="font-bold text-text-primary">{data.count}</span>
        </p>
        {data.dropoff > 0 && (
          <p className="flex justify-between items-center gap-6 mt-1 text-danger">
            <span>Drop-off Rate:</span>
            <span className="font-bold">-{data.dropoff}%</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function FunnelChart({ data = [] }) {
  // Define highly refined monochrome-to-emerald colors for stages
  const colors = [
    '#94a3b8', // New - slate
    '#4f8cff', // Contacted - SaaS blue
    '#7c5cff', // Qualified - SaaS purple
    '#f59e0b', // Proposal - gold amber
    '#f97316', // Negotiation - orange
    '#10b981', // Won - emerald green
  ];

  // Process data to calculate drop-offs
  const processedData = data.map((item, index) => {
    let dropoff = 0;
    if (index > 0 && data[index - 1].count > 0) {
      dropoff = Math.round(((data[index - 1].count - item.count) / data[index - 1].count) * 100);
    }
    return {
      ...item,
      dropoff,
      fill: colors[index % colors.length]
    };
  });

  return (
    <div className="bg-bg-secondary/40 border border-border/80 rounded-xl p-5 shadow-premium-card h-full flex flex-col transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">Pipeline Conversion Funnel</h3>
        <span className="text-[10px] text-text-muted font-mono bg-bg-tertiary px-2 py-0.5 rounded border border-border/40">CONVERSION</span>
      </div>
      
      <div className="flex-1 min-h-[280px]">
        {processedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-muted text-xs font-mono">
            No pipeline data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="stage" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                width={90}
              />
              <Tooltip content={<FunnelTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }} />
              <Bar 
                dataKey="count" 
                radius={[3, 3, 3, 3]}
                barSize={16}
                label={{ position: 'right', fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace', offset: 10 }}
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
